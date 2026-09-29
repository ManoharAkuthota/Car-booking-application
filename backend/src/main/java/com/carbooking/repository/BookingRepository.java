package com.carbooking.repository;

import com.carbooking.entity.Booking;
import com.carbooking.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();

    long countByStatus(BookingStatus status);

    @Query("SELECT SUM(b.totalFare) FROM Booking b WHERE b.status = com.carbooking.entity.enums.BookingStatus.COMPLETED")
    BigDecimal sumTotalEarnings();

    @Query("SELECT SUM(b.totalFare) FROM Booking b WHERE b.driver.id = :driverId AND b.status = com.carbooking.entity.enums.BookingStatus.COMPLETED")
    BigDecimal sumDriverEarnings(Long driverId);
}
