package com.carbooking.controller;

import com.carbooking.dto.BookingRequest;
import com.carbooking.dto.BookingResponse;
import com.carbooking.dto.FareEstimateRequest;
import com.carbooking.dto.FareEstimateResponse;
import com.carbooking.dto.TripStatusUpdateRequest;
import com.carbooking.entity.User;
import com.carbooking.service.AuthService;
import com.carbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    @PostMapping("/estimate-fare")
    public ResponseEntity<FareEstimateResponse> estimateFare(@Valid @RequestBody FareEstimateRequest request) {
        return ResponseEntity.ok(bookingService.estimateFare(request));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(bookingService.createBooking(request, currentUser));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(bookingService.getUserBookings(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<BookingResponse> getBookingByCode(@PathVariable String code) {
        return ResponseEntity.ok(bookingService.getBookingByCode(code));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TripStatusUpdateRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request, currentUser));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUser));
    }
}
