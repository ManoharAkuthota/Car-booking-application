package com.carbooking.entity;

import com.carbooking.entity.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    private Integer experienceYears;

    private String vehicleAssigned; // e.g. "Toyota Camry (KA-01-EQ-9988)"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.APPROVED;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isOnline = false;

    private Double currentLat;
    private Double currentLng;

    @Builder.Default
    private Double rating = 4.9;

    @Builder.Default
    private Integer totalTrips = 0;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
