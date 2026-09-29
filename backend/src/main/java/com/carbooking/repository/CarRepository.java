package com.carbooking.repository;

import com.carbooking.entity.Car;
import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByStatus(CarStatus status);
    List<Car> findByCategoryAndStatus(CarCategory category, CarStatus status);
    List<Car> findByCategory(CarCategory category);

    @Query("SELECT c FROM Car c WHERE " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:seats IS NULL OR c.seats >= :seats) AND " +
           "(:search IS NULL OR LOWER(c.make) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.model) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Car> filterCars(@Param("category") CarCategory category,
                         @Param("status") CarStatus status,
                         @Param("seats") Integer seats,
                         @Param("search") String search);

    long countByStatus(CarStatus status);
}
