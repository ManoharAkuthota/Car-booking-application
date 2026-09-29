package com.carbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalBookings;
    private long activeTrips;
    private long completedTrips;
    private long cancelledTrips;
    private BigDecimal totalRevenue;
    private long totalCars;
    private long availableCars;
    private long bookedCars;
    private long onlineDrivers;
    private long totalDrivers;
    private long totalCustomers;
    private Map<String, Long> categoryDistribution;
}
