package com.carbooking.entity;

import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String make;

    @NotBlank
    @Column(nullable = false)
    private String model;

    @Column(name = "model_year")
    private Integer year;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarCategory category;

    @Column(nullable = false)
    private Integer seats;

    private String fuelType;      // Petrol, Diesel, Electric, Hybrid
    private String transmission;  // Automatic, Manual

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKm;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseFare;

    @Column(precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(length = 1024)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarStatus status;

    @Column(length = 2000)
    private String features; // JSON string or comma-delimited: "Sunroof,GPS,Autopilot,AC"

    private Integer maxWeightKg; // For Trolley / Porter cargo capacity (e.g. 500kg, 750kg)

    @Builder.Default
    private Double rating = 4.8;

    @Builder.Default
    private Integer totalTrips = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = CarStatus.AVAILABLE;
        }
    }
}
