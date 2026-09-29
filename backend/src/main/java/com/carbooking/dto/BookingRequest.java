package com.carbooking.dto;

import com.carbooking.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull
    private Long carId;

    @NotBlank
    private String pickupAddress;

    @NotBlank
    private String dropoffAddress;

    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;

    private Double distanceKm;
    private Integer estimatedDurationMins;

    @NotNull
    private PaymentMethod paymentMethod;

    private String specialInstructions;
}
