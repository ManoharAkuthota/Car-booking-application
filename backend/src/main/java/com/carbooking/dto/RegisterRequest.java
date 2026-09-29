package com.carbooking.dto;

import com.carbooking.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String phone;
    private Role role; // Defaults to ROLE_CUSTOMER if null

    // Optional driver registration details
    private String licenseNumber;
    private Integer experienceYears;
    private String vehicleDetails;
}
