package com.carbooking.service;

import com.carbooking.dto.BookingResponse;
import com.carbooking.dto.DriverLocationUpdateRequest;
import com.carbooking.entity.Booking;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.User;
import com.carbooking.entity.enums.BookingStatus;
import com.carbooking.entity.enums.Role;
import com.carbooking.repository.BookingRepository;
import com.carbooking.repository.DriverProfileRepository;
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
public class DriverService {

    private final DriverProfileRepository driverProfileRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public DriverProfile getProfile(User user) {
        return driverProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    DriverProfile newProfile = DriverProfile.builder()
                            .user(user)
                            .licenseNumber("DL-" + System.currentTimeMillis() % 100000)
                            .experienceYears(4)
                            .vehicleAssigned("Electric SUV / Sedan")
                            .isOnline(true)
                            .currentLat(12.9716)
                            .currentLng(77.5946)
                            .rating(4.9)
                            .totalTrips(0)
                            .totalEarnings(BigDecimal.ZERO)
                            .build();
                    return driverProfileRepository.save(newProfile);
                });
    }

    @Transactional
    public DriverProfile updateStatus(User user, DriverLocationUpdateRequest request) {
        DriverProfile profile = getProfile(user);
        if (request.getIsOnline() != null) {
            profile.setIsOnline(request.getIsOnline());
        }
        if (request.getLat() != null) {
            profile.setCurrentLat(request.getLat());
        }
        if (request.getLng() != null) {
            profile.setCurrentLng(request.getLng());
        }
        return driverProfileRepository.save(profile);
    }

    public List<BookingResponse> getPendingRequests() {
        return bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.REQUESTED)
                .stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getDriverTrips(User user) {
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse acceptTrip(Long bookingId, User driver) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (booking.getStatus() != BookingStatus.REQUESTED) {
            throw new IllegalStateException("Booking is already accepted or no longer available.");
        }

        booking.setDriver(driver);
        booking.setStatus(BookingStatus.ACCEPTED);
        booking = bookingRepository.save(booking);

        return bookingService.mapToDto(booking);
    }

    public Map<String, Object> getDriverStats(User user) {
        DriverProfile profile = getProfile(user);
        BigDecimal earnings = bookingRepository.sumDriverEarnings(user.getId());
        if (earnings == null) earnings = BigDecimal.ZERO;

        Map<String, Object> stats = new HashMap<>();
        stats.put("isOnline", profile.getIsOnline());
        stats.put("licenseNumber", profile.getLicenseNumber());
        stats.put("rating", profile.getRating());
        stats.put("totalTrips", profile.getTotalTrips());
        stats.put("totalEarnings", earnings);
        stats.put("vehicleAssigned", profile.getVehicleAssigned());
        stats.put("verificationStatus", profile.getVerificationStatus());
        return stats;
    }
}
