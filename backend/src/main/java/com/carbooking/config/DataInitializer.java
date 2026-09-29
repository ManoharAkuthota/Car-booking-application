package com.carbooking.config;

import com.carbooking.entity.Booking;
import com.carbooking.entity.Car;
import com.carbooking.entity.DriverProfile;
import com.carbooking.entity.User;
import com.carbooking.entity.enums.*;
import com.carbooking.repository.BookingRepository;
import com.carbooking.repository.CarRepository;
import com.carbooking.repository.DriverProfileRepository;
import com.carbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with initial data.");
            return;
        }

        log.info("Seeding initial data into MySQL database...");

        // 1. Seed Users
        User admin = User.builder()
                .fullName("Alex Rivera (Platform Admin)")
                .email("admin@drivepulse.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 99000 11223")
                .role(Role.ROLE_ADMIN)
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .build();
        userRepository.save(admin);

        User driverUser1 = User.builder()
                .fullName("Rajesh Kumar")
                .email("driver@drivepulse.com")
                .password(passwordEncoder.encode("password123"))
                .phone("+91 98888 22334")
                .role(Role.ROLE_DRIVER)
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .build();
        userRepository.save(driverUser1);

        User driverUser2 = User.builder()
                .fullName("Marcus Sterling")
                .email("driver2@drivepulse.com")
                .password(passwordEncoder.encode("password123"))
                .phone("+91 97777 33445")
                .role(Role.ROLE_DRIVER)
                .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                .build();
        userRepository.save(driverUser2);

        User customer = User.builder()
                .fullName("Priya Sharma")
                .email("customer@drivepulse.com")
                .password(passwordEncoder.encode("password123"))
                .phone("+91 98765 43210")
                .role(Role.ROLE_CUSTOMER)
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .build();
        userRepository.save(customer);

        // 2. Seed Driver Profiles
        DriverProfile profile1 = DriverProfile.builder()
                .user(driverUser1)
                .licenseNumber("DL-04201800921")
                .experienceYears(5)
                .vehicleAssigned("Tesla Model 3 Performance")
                .verificationStatus(VerificationStatus.APPROVED)
                .isOnline(true)
                .currentLat(12.9716)
                .currentLng(77.5946)
                .rating(4.92)
                .totalTrips(142)
                .totalEarnings(new BigDecimal("18450.00"))
                .build();
        driverProfileRepository.save(profile1);

        DriverProfile profile2 = DriverProfile.builder()
                .user(driverUser2)
                .licenseNumber("DL-09201500318")
                .experienceYears(8)
                .vehicleAssigned("BMW 530i M-Sport")
                .verificationStatus(VerificationStatus.APPROVED)
                .isOnline(true)
                .currentLat(12.9352)
                .currentLng(77.6245)
                .rating(4.97)
                .totalTrips(310)
                .totalEarnings(new BigDecimal("42600.00"))
                .build();
        driverProfileRepository.save(profile2);

        // 3. Seed Cars
        Car car1 = Car.builder()
                .make("Tesla")
                .model("Model 3 Performance")
                .year(2024)
                .licensePlate("KA-01-EV-4090")
                .category(CarCategory.ELECTRIC)
                .seats(5)
                .fuelType("Electric (540km Range)")
                .transmission("Automatic Dual Motor")
                .pricePerKm(new BigDecimal("35.00"))
                .baseFare(new BigDecimal("120.00"))
                .hourlyRate(new BigDecimal("450.00"))
                .imageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Autopilot, Glass Panoramic Roof, 15-inch Touchscreen, Premium Audio, Zero Emissions")
                .rating(4.95)
                .totalTrips(48)
                .build();

        Car car2 = Car.builder()
                .make("BMW")
                .model("530i M Sport")
                .year(2023)
                .licensePlate("KA-05-MM-7788")
                .category(CarCategory.LUXURY)
                .seats(5)
                .fuelType("Petrol TwinTurbo")
                .transmission("8-Speed Steptronic")
                .pricePerKm(new BigDecimal("48.00"))
                .baseFare(new BigDecimal("220.00"))
                .hourlyRate(new BigDecimal("600.00"))
                .imageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Dakota Leather, Harman Kardon Sound, Ambient Lighting, Gesture Control")
                .rating(4.9)
                .totalTrips(62)
                .build();

        Car car3 = Car.builder()
                .make("Mercedes-Benz")
                .model("E-Class Exclusive")
                .year(2024)
                .licensePlate("KA-03-MB-0011")
                .category(CarCategory.LUXURY)
                .seats(5)
                .fuelType("Diesel Mild-Hybrid")
                .transmission("9G-Tronic Automatic")
                .pricePerKm(new BigDecimal("55.00"))
                .baseFare(new BigDecimal("250.00"))
                .hourlyRate(new BigDecimal("750.00"))
                .imageUrl("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Chauffeur Package, Burmester 3D Surround, Reclining Rear Seats, Air Suspension")
                .rating(4.98)
                .totalTrips(35)
                .build();

        Car car4 = Car.builder()
                .make("Toyota")
                .model("Camry Hybrid")
                .year(2024)
                .licensePlate("KA-04-TC-5522")
                .category(CarCategory.SEDAN)
                .seats(5)
                .fuelType("Strong Hybrid Electric")
                .transmission("e-CVT")
                .pricePerKm(new BigDecimal("24.00"))
                .baseFare(new BigDecimal("90.00"))
                .hourlyRate(new BigDecimal("320.00"))
                .imageUrl("https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Ultra Quiet Cabin, Rear Armrest Controls, 9 Airbags, Ventilated Seats")
                .rating(4.88)
                .totalTrips(88)
                .build();

        Car car5 = Car.builder()
                .make("Hyundai")
                .model("Creta SX (O)")
                .year(2024)
                .licensePlate("KA-51-CR-8921")
                .category(CarCategory.SUV)
                .seats(5)
                .fuelType("Turbo Petrol")
                .transmission("7-Speed DCT")
                .pricePerKm(new BigDecimal("22.00"))
                .baseFare(new BigDecimal("80.00"))
                .hourlyRate(new BigDecimal("280.00"))
                .imageUrl("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Panoramic Sunroof, Bose 8-Speaker Audio, Level 2 ADAS, Ventilated Seats")
                .rating(4.82)
                .totalTrips(114)
                .build();

        Car car6 = Car.builder()
                .make("Tata")
                .model("Harrier Fearless+")
                .year(2024)
                .licensePlate("KA-02-TH-9944")
                .category(CarCategory.SUV)
                .seats(5)
                .fuelType("Kryotec 2.0L Diesel")
                .transmission("6-Speed Automatic")
                .pricePerKm(new BigDecimal("26.00"))
                .baseFare(new BigDecimal("100.00"))
                .hourlyRate(new BigDecimal("340.00"))
                .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("JBL Audio, 5-Star Bharat NCAP Safety, Terrain Response Modes, 360 Camera")
                .rating(4.86)
                .totalTrips(76)
                .build();

        Car car7 = Car.builder()
                .make("Porsche")
                .model("Macan GTS")
                .year(2023)
                .licensePlate("KA-01-PC-0007")
                .category(CarCategory.LUXURY)
                .seats(5)
                .fuelType("Twin-Turbo V6")
                .transmission("7-Speed PDK")
                .pricePerKm(new BigDecimal("75.00"))
                .baseFare(new BigDecimal("400.00"))
                .hourlyRate(new BigDecimal("950.00"))
                .imageUrl("https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Sport Chrono Package, Air Suspension, Sport Exhaust, Alcantara Interior")
                .rating(4.99)
                .totalTrips(22)
                .build();

        Car car8 = Car.builder()
                .make("Volkswagen")
                .model("Polo GT TSI")
                .year(2023)
                .licensePlate("KA-04-GT-1144")
                .category(CarCategory.HATCHBACK)
                .seats(4)
                .fuelType("1.0L Turbo Petrol")
                .transmission("6-Speed Torque Converter")
                .pricePerKm(new BigDecimal("16.00"))
                .baseFare(new BigDecimal("60.00"))
                .hourlyRate(new BigDecimal("200.00"))
                .imageUrl("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80")
                .status(CarStatus.AVAILABLE)
                .features("Agile City Ride, Cruise Control, Touchscreen Infotainment, ESP")
                .rating(4.78)
                .totalTrips(160)
                .build();

        List<Car> savedCars = carRepository.saveAll(Arrays.asList(car1, car2, car3, car4, car5, car6, car7, car8));

        // 4. Seed Sample Bookings
        Booking pastTrip1 = Booking.builder()
                .bookingCode("DP-782194")
                .customer(customer)
                .driver(driverUser1)
                .car(savedCars.get(0))
                .pickupAddress("Indiranagar 100ft Road, Bengaluru")
                .dropoffAddress("Kempegowda International Airport (BLR), Terminal 2")
                .pickupLat(12.9784)
                .pickupLng(77.6408)
                .dropoffLat(13.1986)
                .dropoffLng(77.7066)
                .distanceKm(38.2)
                .estimatedDurationMins(52)
                .baseFare(new BigDecimal("120.00"))
                .distanceFare(new BigDecimal("1337.00"))
                .taxFare(new BigDecimal("72.85"))
                .totalFare(new BigDecimal("1529.85"))
                .status(BookingStatus.COMPLETED)
                .paymentMethod(PaymentMethod.UPI)
                .paymentStatus(PaymentStatus.COMPLETED)
                .otp("5812")
                .createdAt(LocalDateTime.now().minusDays(2))
                .startedAt(LocalDateTime.now().minusDays(2).plusMinutes(10))
                .completedAt(LocalDateTime.now().minusDays(2).plusMinutes(62))
                .build();

        Booking pastTrip2 = Booking.builder()
                .bookingCode("DP-993201")
                .customer(customer)
                .driver(driverUser2)
                .car(savedCars.get(1))
                .pickupAddress("MG Road Metro Station, Bengaluru")
                .dropoffAddress("Electronic City Phase 1, Toll Gate")
                .pickupLat(12.9756)
                .pickupLng(77.6066)
                .dropoffLat(12.8452)
                .dropoffLng(77.6602)
                .distanceKm(21.5)
                .estimatedDurationMins(38)
                .baseFare(new BigDecimal("220.00"))
                .distanceFare(new BigDecimal("1032.00"))
                .taxFare(new BigDecimal("62.60"))
                .totalFare(new BigDecimal("1314.60"))
                .status(BookingStatus.COMPLETED)
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .paymentStatus(PaymentStatus.COMPLETED)
                .otp("2931")
                .createdAt(LocalDateTime.now().minusDays(1))
                .startedAt(LocalDateTime.now().minusDays(1).plusMinutes(8))
                .completedAt(LocalDateTime.now().minusDays(1).plusMinutes(46))
                .build();

        bookingRepository.saveAll(Arrays.asList(pastTrip1, pastTrip2));

        log.info("Initialization complete! Seeded 4 users, 8 cars, and initial trips.");
    }
}
