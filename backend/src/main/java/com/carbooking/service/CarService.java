package com.carbooking.service;

import com.carbooking.dto.CarDto;
import com.carbooking.entity.Car;
import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import com.carbooking.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;

    public List<CarDto> getAllCars(CarCategory category, CarStatus status, Integer seats, String search) {
        return carRepository.filterCars(category, status, seats, search)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CarDto getCarById(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car not found with id: " + id));
        return mapToDto(car);
    }

    @Transactional
    public CarDto createCar(CarDto dto) {
        Car car = Car.builder()
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .licensePlate(dto.getLicensePlate())
                .category(dto.getCategory())
                .seats(dto.getSeats())
                .fuelType(dto.getFuelType())
                .transmission(dto.getTransmission())
                .pricePerKm(dto.getPricePerKm())
                .baseFare(dto.getBaseFare())
                .hourlyRate(dto.getHourlyRate())
                .imageUrl(dto.getImageUrl())
                .status(dto.getStatus() != null ? dto.getStatus() : CarStatus.AVAILABLE)
                .features(dto.getFeatures())
                .maxWeightKg(dto.getMaxWeightKg())
                .rating(dto.getRating() != null ? dto.getRating() : 4.8)
                .totalTrips(0)
                .build();

        return mapToDto(carRepository.save(car));
    }

    @Transactional
    public CarDto updateCar(Long id, CarDto dto) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car not found with id: " + id));

        car.setMake(dto.getMake());
        car.setModel(dto.getModel());
        car.setYear(dto.getYear());
        car.setLicensePlate(dto.getLicensePlate());
        car.setCategory(dto.getCategory());
        car.setSeats(dto.getSeats());
        car.setFuelType(dto.getFuelType());
        car.setTransmission(dto.getTransmission());
        car.setPricePerKm(dto.getPricePerKm());
        car.setBaseFare(dto.getBaseFare());
        car.setHourlyRate(dto.getHourlyRate());
        car.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) {
            car.setStatus(dto.getStatus());
        }
        car.setFeatures(dto.getFeatures());
        car.setMaxWeightKg(dto.getMaxWeightKg());

        return mapToDto(carRepository.save(car));
    }

    @Transactional
    public void deleteCar(Long id) {
        if (!carRepository.existsById(id)) {
            throw new IllegalArgumentException("Car not found with id: " + id);
        }
        carRepository.deleteById(id);
    }

    public CarDto mapToDto(Car car) {
        if (car == null) return null;
        return CarDto.builder()
                .id(car.getId())
                .make(car.getMake())
                .model(car.getModel())
                .year(car.getYear())
                .licensePlate(car.getLicensePlate())
                .category(car.getCategory())
                .seats(car.getSeats())
                .fuelType(car.getFuelType())
                .transmission(car.getTransmission())
                .pricePerKm(car.getPricePerKm())
                .baseFare(car.getBaseFare())
                .hourlyRate(car.getHourlyRate())
                .imageUrl(car.getImageUrl())
                .status(car.getStatus())
                .features(car.getFeatures())
                .maxWeightKg(car.getMaxWeightKg())
                .rating(car.getRating())
                .totalTrips(car.getTotalTrips())
                .build();
    }
}
