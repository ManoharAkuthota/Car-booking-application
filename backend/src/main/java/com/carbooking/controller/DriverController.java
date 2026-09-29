package com.carbooking.controller;

import com.carbooking.dto.BookingResponse;
import com.carbooking.dto.DriverLocationUpdateRequest;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.User;
import com.carbooking.service.AuthService;
import com.carbooking.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_DRIVER', 'ROLE_ADMIN')")
public class DriverController {

    private final DriverService driverService;
    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<DriverProfile> getProfile() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(driverService.getProfile(currentUser));
    }

    @PostMapping("/location")
    public ResponseEntity<DriverProfile> updateStatus(@RequestBody DriverLocationUpdateRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(driverService.updateStatus(currentUser, request));
    }

    @GetMapping("/pending-requests")
    public ResponseEntity<List<BookingResponse>> getPendingRequests() {
        return ResponseEntity.ok(driverService.getPendingRequests());
    }

    @GetMapping("/my-trips")
    public ResponseEntity<List<BookingResponse>> getMyTrips() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(driverService.getDriverTrips(currentUser));
    }

    @PostMapping("/accept/{bookingId}")
    public ResponseEntity<BookingResponse> acceptTrip(@PathVariable Long bookingId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(driverService.acceptTrip(bookingId, currentUser));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(driverService.getDriverStats(currentUser));
    }
}
