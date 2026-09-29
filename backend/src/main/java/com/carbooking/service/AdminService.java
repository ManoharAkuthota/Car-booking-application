package com.carbooking.service;

import com.carbooking.dto.AdminStatsResponse;
import com.carbooking.dto.BookingResponse;
import com.carbooking.entity.Car;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.enums.BookingStatus;
import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import com.carbooking.entity.enums.Role;
import com.carbooking.entity.enums.VerificationStatus;
import com.carbooking.repository.BookingRepository;
import com.carbooking.repository.CarRepository;
import com.carbooking.repository.DriverProfileRepository;
import com.carbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final BookingService bookingService;

    public AdminStatsResponse getStats() {
        long totalBookings = bookingRepository.count();
        long activeTrips = bookingRepository.countByStatus(BookingStatus.IN_PROGRESS)
                + bookingRepository.countByStatus(BookingStatus.ACCEPTED)
                + bookingRepository.countByStatus(BookingStatus.DRIVER_ARRIVING);
        long completedTrips = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long cancelledTrips = bookingRepository.countByStatus(BookingStatus.CANCELLED);

        BigDecimal revenue = bookingRepository.sumTotalEarnings();
        if (revenue == null) revenue = BigDecimal.ZERO;

        long totalCars = carRepository.count();
        long availableCars = carRepository.countByStatus(CarStatus.AVAILABLE);
        long bookedCars = carRepository.countByStatus(CarStatus.BOOKED);

        long onlineDrivers = driverProfileRepository.countByIsOnlineTrue();
        long totalDrivers = userRepository.countByRole(Role.ROLE_DRIVER);
        long totalCustomers = userRepository.countByRole(Role.ROLE_CUSTOMER);

        Map<String, Long> categoryDistribution = new HashMap<>();
        for (CarCategory cat : CarCategory.values()) {
            categoryDistribution.put(cat.name(), (long) carRepository.findByCategory(cat).size());
        }

        return AdminStatsResponse.builder()
                .totalBookings(totalBookings)
                .activeTrips(activeTrips)
                .completedTrips(completedTrips)
                .cancelledTrips(cancelledTrips)
                .totalRevenue(revenue)
                .totalCars(totalCars)
                .availableCars(availableCars)
                .bookedCars(bookedCars)
                .onlineDrivers(onlineDrivers)
                .totalDrivers(totalDrivers)
                .totalCustomers(totalCustomers)
                .categoryDistribution(categoryDistribution)
                .build();
    }

    public List<DriverProfile> getAllDrivers() {
        return driverProfileRepository.findAll();
    }

    @Transactional
    public DriverProfile verifyDriver(Long driverId, VerificationStatus status) {
        DriverProfile profile = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not found: " + driverId));
        profile.setVerificationStatus(status);
        return driverProfileRepository.save(profile);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());
    }
}
