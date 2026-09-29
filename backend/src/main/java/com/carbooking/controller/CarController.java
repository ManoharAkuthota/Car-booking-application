package com.carbooking.controller;

import com.carbooking.dto.CarDto;
import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import com.carbooking.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @GetMapping
    public ResponseEntity<List<CarDto>> getAllCars(
            @RequestParam(required = false) CarCategory category,
            @RequestParam(required = false) CarStatus status,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(carService.getAllCars(category, status, seats, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarDto> getCarById(@PathVariable Long id) {
        return ResponseEntity.ok(carService.getCarById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CarDto> createCar(@Valid @RequestBody CarDto dto) {
        return ResponseEntity.ok(carService.createCar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CarDto> updateCar(@PathVariable Long id, @Valid @RequestBody CarDto dto) {
        return ResponseEntity.ok(carService.updateCar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }
}
