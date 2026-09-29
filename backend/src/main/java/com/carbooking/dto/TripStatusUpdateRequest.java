package com.carbooking.dto;

import com.carbooking.entity.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TripStatusUpdateRequest {
    @NotNull
    private BookingStatus status;
    private String otp; // Required when transitioning to IN_PROGRESS
}
