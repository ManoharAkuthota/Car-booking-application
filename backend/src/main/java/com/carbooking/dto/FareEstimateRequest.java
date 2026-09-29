package com.carbooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FareEstimateRequest {
    @NotNull
    private Long carId;

    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;

    private Double distanceKm; // Optional: calculated by frontend or backend
}
