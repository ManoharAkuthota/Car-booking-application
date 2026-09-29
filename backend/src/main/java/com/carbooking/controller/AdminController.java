package com.carbooking.controller;

import com.carbooking.dto.AdminStatsResponse;
import com.carbooking.dto.BookingResponse;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.enums.VerificationStatus;
import com.carbooking.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverProfile>> getAllDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @PatchMapping("/drivers/{id}/verify")
    public ResponseEntity<DriverProfile> verifyDriver(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        VerificationStatus status = VerificationStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(adminService.verifyDriver(id, status));
    }

    @GetMapping("/trips")
    public ResponseEntity<List<BookingResponse>> getAllTrips() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }
}
