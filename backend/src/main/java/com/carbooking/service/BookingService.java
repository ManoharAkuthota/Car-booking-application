package com.carbooking.service;

import com.carbooking.dto.*;
import com.carbooking.entity.Booking;
import com.carbooking.entity.Car;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.User;
import com.carbooking.entity.enums.BookingStatus;
import com.carbooking.entity.enums.CarStatus;
import com.carbooking.entity.enums.PaymentStatus;
import com.carbooking.entity.enums.Role;
import com.carbooking.repository.BookingRepository;
import com.carbooking.repository.CarRepository;
import com.carbooking.repository.DriverProfileRepository;
import com.carbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final CarService carService;
    private final AuthService authService;

    public FareEstimateResponse estimateFare(FareEstimateRequest request) {
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new IllegalArgumentException("Car not found with id: " + request.getCarId()));

        double distanceKm = request.getDistanceKm() != null && request.getDistanceKm() > 0
                ? request.getDistanceKm()
                : calculateHaversineDistance(request.getPickupLat(), request.getPickupLng(),
                request.getDropoffLat(), request.getDropoffLng());

        if (distanceKm <= 0) {
            distanceKm = 10.0; // Default fallback to 10 km
        }

        BigDecimal baseFare = car.getBaseFare();
        BigDecimal distanceFare = car.getPricePerKm().multiply(BigDecimal.valueOf(distanceKm))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = baseFare.add(distanceFare);
        BigDecimal taxFare = subtotal.multiply(BigDecimal.valueOf(0.05))
                .setScale(2, RoundingMode.HALF_UP); // 5% GST
        BigDecimal totalFare = subtotal.add(taxFare).setScale(2, RoundingMode.HALF_UP);

        int durationMins = Math.max(5, (int) Math.round(distanceKm * 2.4));

        return FareEstimateResponse.builder()
                .carId(car.getId())
                .carName(car.getMake() + " " + car.getModel())
                .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                .estimatedDurationMins(durationMins)
                .baseFare(baseFare)
                .distanceFare(distanceFare)
                .taxFare(taxFare)
                .totalFare(totalFare)
                .build();
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, User customer) {
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new IllegalArgumentException("Car not found with id: " + request.getCarId()));

        FareEstimateResponse estimate = estimateFare(new FareEstimateRequest() {{
            setCarId(request.getCarId());
            setPickupLat(request.getPickupLat());
            setPickupLng(request.getPickupLng());
            setDropoffLat(request.getDropoffLat());
            setDropoffLng(request.getDropoffLng());
            setDistanceKm(request.getDistanceKm());
        }});

        String bookingCode = "DP-" + (100000 + new Random().nextInt(900000));
        String otp = String.format("%04d", new Random().nextInt(10000));

        // Find available online driver or default driver
        List<DriverProfile> onlineDrivers = driverProfileRepository.findByIsOnlineTrue();
        User assignedDriver = null;
        BookingStatus initialStatus = BookingStatus.REQUESTED;

        if (!onlineDrivers.isEmpty()) {
            assignedDriver = onlineDrivers.get(0).getUser();
            initialStatus = BookingStatus.ACCEPTED;
        } else {
            List<User> drivers = userRepository.findByRole(Role.ROLE_DRIVER);
            if (!drivers.isEmpty()) {
                assignedDriver = drivers.get(0);
                initialStatus = BookingStatus.ACCEPTED;
            }
        }

        car.setStatus(CarStatus.BOOKED);
        carRepository.save(car);

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .customer(customer)
                .driver(assignedDriver)
                .car(car)
                .pickupAddress(request.getPickupAddress())
                .dropoffAddress(request.getDropoffAddress())
                .pickupLat(request.getPickupLat() != null ? request.getPickupLat() : 12.9716)
                .pickupLng(request.getPickupLng() != null ? request.getPickupLng() : 77.5946)
                .dropoffLat(request.getDropoffLat() != null ? request.getDropoffLat() : 13.0358)
                .dropoffLng(request.getDropoffLng() != null ? request.getDropoffLng() : 77.5970)
                .distanceKm(estimate.getDistanceKm())
                .estimatedDurationMins(estimate.getEstimatedDurationMins())
                .baseFare(estimate.getBaseFare())
                .distanceFare(estimate.getDistanceFare())
                .taxFare(estimate.getTaxFare())
                .totalFare(estimate.getTotalFare())
                .status(initialStatus)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .otp(otp)
                .specialInstructions(request.getSpecialInstructions())
                .createdAt(LocalDateTime.now())
                .build();

        booking = bookingRepository.save(booking);

        return mapToDto(booking);
    }

    public List<BookingResponse> getUserBookings(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getDriverBookings(Long driverId) {
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(driverId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
        return mapToDto(booking);
    }

    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with code: " + bookingCode));
        return mapToDto(booking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, TripStatusUpdateRequest request, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));

        BookingStatus newStatus = request.getStatus();

        if (newStatus == BookingStatus.IN_PROGRESS) {
            if (request.getOtp() == null || !request.getOtp().trim().equals(booking.getOtp())) {
                throw new IllegalArgumentException("Invalid ride verification OTP. Please provide the correct 4-digit OTP from customer.");
            }
            booking.setStartedAt(LocalDateTime.now());
        }

        if (newStatus == BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
            booking.setPaymentStatus(PaymentStatus.COMPLETED);

            // Release car
            Car car = booking.getCar();
            car.setStatus(CarStatus.AVAILABLE);
            car.setTotalTrips(car.getTotalTrips() + 1);
            carRepository.save(car);

            // Update driver stats
            if (booking.getDriver() != null) {
                driverProfileRepository.findByUser(booking.getDriver()).ifPresent(dp -> {
                    dp.setTotalTrips(dp.getTotalTrips() + 1);
                    dp.setTotalEarnings(dp.getTotalEarnings().add(booking.getTotalFare()));
                    driverProfileRepository.save(dp);
                });
            }
        }

        if (newStatus == BookingStatus.CANCELLED) {
            Car car = booking.getCar();
            car.setStatus(CarStatus.AVAILABLE);
            carRepository.save(car);
        }

        booking.setStatus(newStatus);
        return mapToDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, User currentUser) {
        TripStatusUpdateRequest req = new TripStatusUpdateRequest();
        req.setStatus(BookingStatus.CANCELLED);
        return updateBookingStatus(id, req, currentUser);
    }

    private double calculateHaversineDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 12.5; // fallback average city trip
        }
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;
        return Math.max(1.0, distance);
    }

    public BookingResponse mapToDto(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .customer(authService.mapToDto(booking.getCustomer()))
                .driver(authService.mapToDto(booking.getDriver()))
                .car(carService.mapToDto(booking.getCar()))
                .pickupAddress(booking.getPickupAddress())
                .dropoffAddress(booking.getDropoffAddress())
                .pickupLat(booking.getPickupLat())
                .pickupLng(booking.getPickupLng())
                .dropoffLat(booking.getDropoffLat())
                .dropoffLng(booking.getDropoffLng())
                .distanceKm(booking.getDistanceKm())
                .estimatedDurationMins(booking.getEstimatedDurationMins())
                .baseFare(booking.getBaseFare())
                .distanceFare(booking.getDistanceFare())
                .taxFare(booking.getTaxFare())
                .totalFare(booking.getTotalFare())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .otp(booking.getOtp())
                .specialInstructions(booking.getSpecialInstructions())
                .createdAt(booking.getCreatedAt())
                .startedAt(booking.getStartedAt())
                .completedAt(booking.getCompletedAt())
                .build();
    }
}
