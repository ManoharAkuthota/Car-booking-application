package com.carbooking.service;

import com.carbooking.dto.AuthRequest;
import com.carbooking.dto.AuthResponse;
import com.carbooking.dto.RegisterRequest;
import com.carbooking.dto.UserDto;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.User;
import com.carbooking.entity.enums.Role;
import com.carbooking.entity.enums.VerificationStatus;
import com.carbooking.repository.DriverProfileRepository;
import com.carbooking.repository.UserRepository;
import com.carbooking.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getFullName().replace(" ", ""))
                .build();

        user = userRepository.save(user);

        if (role == Role.ROLE_DRIVER) {
            String license = request.getLicenseNumber() != null ? request.getLicenseNumber() : "DL-" + System.currentTimeMillis() % 1000000;
            DriverProfile driverProfile = DriverProfile.builder()
                    .user(user)
                    .licenseNumber(license)
                    .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 3)
                    .vehicleAssigned(request.getVehicleDetails() != null ? request.getVehicleDetails() : "Sedan / Hatchback")
                    .verificationStatus(VerificationStatus.APPROVED)
                    .isOnline(true)
                    .currentLat(12.9716)
                    .currentLng(77.5946)
                    .build();
            driverProfileRepository.save(driverProfile);
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToDto(user))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToDto(user))
                .build();
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalStateException("No authenticated user found in security context");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    public UserDto mapToDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
