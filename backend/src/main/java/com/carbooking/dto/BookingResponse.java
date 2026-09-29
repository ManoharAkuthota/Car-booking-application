package com.carbooking.dto;

import com.carbooking.entity.enums.BookingStatus;
import com.carbooking.entity.enums.PaymentMethod;
import com.carbooking.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private UserDto customer;
    private UserDto driver;
    private CarDto car;
    private String pickupAddress;
    private String dropoffAddress;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private Double distanceKm;
    private Integer estimatedDurationMins;
    private BigDecimal baseFare;
    private BigDecimal distanceFare;
    private BigDecimal taxFare;
    private BigDecimal totalFare;
    private BookingStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String otp;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
