package com.carbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareEstimateResponse {
    private Long carId;
    private String carName;
    private Double distanceKm;
    private Integer estimatedDurationMins;
    private BigDecimal baseFare;
    private BigDecimal distanceFare;
    private BigDecimal taxFare;
    private BigDecimal totalFare;
}
