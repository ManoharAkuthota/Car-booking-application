package com.carbooking.dto;

import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarDto {
    private Long id;

    @NotBlank
    private String make;

    @NotBlank
    private String model;

    private Integer year;

    @NotBlank
    private String licensePlate;

    @NotNull
    private CarCategory category;

    @NotNull
    private Integer seats;

    private String fuelType;
    private String transmission;

    @NotNull
    private BigDecimal pricePerKm;

    @NotNull
    private BigDecimal baseFare;

    private BigDecimal hourlyRate;
    private String imageUrl;
    private CarStatus status;
    private String features;
    private Double rating;
    private Integer totalTrips;
}
