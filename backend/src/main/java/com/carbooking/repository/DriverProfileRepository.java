package com.carbooking.repository;

import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.User;
import com.carbooking.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {
    Optional<DriverProfile> findByUser(User user);
    Optional<DriverProfile> findByUserId(Long userId);
    List<DriverProfile> findByVerificationStatus(VerificationStatus status);
    List<DriverProfile> findByIsOnlineTrue();
    long countByIsOnlineTrue();
}
