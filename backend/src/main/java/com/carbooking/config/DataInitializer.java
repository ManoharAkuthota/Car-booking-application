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
        // If vehicles exist, check if multi-modal fleet is seeded
        if (carRepository.count() > 0 && carRepository.findByCategory(CarCategory.BIKE).size() > 0) {
            log.info("Database already seeded with multi-modal fleet (Bikes, Autos, Cabs, Trolleys).");
            return;
        }

        // Clean & reseed if only partial cars existed
        if (carRepository.count() > 0 && carRepository.findByCategory(CarCategory.BIKE).isEmpty()) {
            log.info("Upgrading fleet to Rapido & Uber multi-modal categories (Bike, Auto, Cab, Trolley)...");
            bookingRepository.deleteAll();
            carRepository.deleteAll();
        }

        log.info("Seeding comprehensive Rapido & Uber Multi-Modal Fleet into database...");

        // 1. Seed Users (if not present)
        User admin = userRepository.findByEmail("admin@drivepulse.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Alex Rivera (Platform Admin)")
                        .email("admin@drivepulse.com")
                        .password(passwordEncoder.encode("admin123"))
                        .phone("+91 99000 11223")
                        .role(Role.ROLE_ADMIN)
                        .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                        .build())
        );

        User driverUser1 = userRepository.findByEmail("driver@drivepulse.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Rajesh Kumar (Pilot)")
                        .email("driver@drivepulse.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+91 98888 22334")
                        .role(Role.ROLE_DRIVER)
                        .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                        .build())
        );

        User driverUser2 = userRepository.findByEmail("driver2@drivepulse.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Marcus Sterling (Captain)")
                        .email("driver2@drivepulse.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+91 97777 33445")
                        .role(Role.ROLE_DRIVER)
                        .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                        .build())
        );

        User customer = userRepository.findByEmail("customer@drivepulse.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Priya Sharma")
                        .email("customer@drivepulse.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+91 98765 43210")
                        .role(Role.ROLE_CUSTOMER)
                        .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                        .build())
        );

        // 2. Seed Driver Profiles
        if (driverProfileRepository.findByUser(driverUser1).isEmpty()) {
            driverProfileRepository.save(DriverProfile.builder()
                    .user(driverUser1)
                    .licenseNumber("DL-04201800921")
                    .experienceYears(5)
                    .vehicleAssigned("Royal Enfield Hunter 350 / Bike Taxi")
                    .verificationStatus(VerificationStatus.APPROVED)
                    .isOnline(true)
                    .currentLat(12.9716)
                    .currentLng(77.5946)
                    .rating(4.94)
                    .totalTrips(184)
                    .totalEarnings(new BigDecimal("21450.00"))
                    .build());
        }

        if (driverProfileRepository.findByUser(driverUser2).isEmpty()) {
            driverProfileRepository.save(DriverProfile.builder()
                    .user(driverUser2)
                    .licenseNumber("DL-09201500318")
                    .experienceYears(8)
                    .vehicleAssigned("Tata Ace Gold Porter / Trolley")
                    .verificationStatus(VerificationStatus.APPROVED)
                    .isOnline(true)
                    .currentLat(12.9352)
                    .currentLng(77.6245)
                    .rating(4.96)
                    .totalTrips(320)
                    .totalEarnings(new BigDecimal("48900.00"))
                    .build());
        }

        // 3. Seed Comprehensive Multi-Modal Fleet: BIKES, AUTOS, CABS, TROLLEY/PORTER
        List<Car> fleet = Arrays.asList(
                // ---- BIKES (Rapido Style) ----
                Car.builder()
                        .make("Royal Enfield")
                        .model("Hunter 350 (Rapido Bike)")
                        .year(2024)
                        .licensePlate("KA-01-BK-3501")
                        .category(CarCategory.BIKE)
                        .seats(1)
                        .fuelType("Petrol (40 km/l)")
                        .transmission("5-Speed Manual")
                        .pricePerKm(new BigDecimal("7.00"))
                        .baseFare(new BigDecimal("25.00"))
                        .hourlyRate(new BigDecimal("100.00"))
                        .imageUrl("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Helmet Provided, Fastest in Traffic, Solo Rider, Experienced Pilot")
                        .rating(4.96)
                        .totalTrips(210)
                        .build(),

                Car.builder()
                        .make("Honda")
                        .model("Activa 6G (Bike Lite)")
                        .year(2023)
                        .licensePlate("KA-04-AC-7890")
                        .category(CarCategory.BIKE)
                        .seats(1)
                        .fuelType("Petrol (50 km/l)")
                        .transmission("Automatic CVT")
                        .pricePerKm(new BigDecimal("6.00"))
                        .baseFare(new BigDecimal("20.00"))
                        .hourlyRate(new BigDecimal("80.00"))
                        .imageUrl("https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Comfortable Commute, Sanitized Helmet, Budget Transit")
                        .rating(4.88)
                        .totalTrips(340)
                        .build(),

                // ---- AUTOS (Auto Rickshaws) ----
                Car.builder()
                        .make("Bajaj")
                        .model("RE Compact (CNG Auto)")
                        .year(2024)
                        .licensePlate("KA-05-AT-4411")
                        .category(CarCategory.AUTO)
                        .seats(3)
                        .fuelType("Green CNG")
                        .transmission("4-Speed Manual")
                        .pricePerKm(new BigDecimal("12.00"))
                        .baseFare(new BigDecimal("45.00"))
                        .hourlyRate(new BigDecimal("150.00"))
                        .imageUrl("https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Doorstep Pickup, Guaranteed Fixed Fare, 3 Passengers, Zero Meter Haggling")
                        .rating(4.84)
                        .totalTrips(415)
                        .build(),

                Car.builder()
                        .make("Mahindra")
                        .model("Treo (Electric e-Auto)")
                        .year(2024)
                        .licensePlate("KA-03-EV-9922")
                        .category(CarCategory.AUTO)
                        .seats(3)
                        .fuelType("Electric (130 km range)")
                        .transmission("Direct Drive Automatic")
                        .pricePerKm(new BigDecimal("11.00"))
                        .baseFare(new BigDecimal("40.00"))
                        .hourlyRate(new BigDecimal("140.00"))
                        .imageUrl("https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Silent EV Commute, Zero Emissions, Spacious 3-Seater Cabin")
                        .rating(4.91)
                        .totalTrips(180)
                        .build(),

                // ---- CABS (Uber Style) ----
                Car.builder()
                        .make("Maruti Suzuki")
                        .model("Dzire Prime (Uber Go)")
                        .year(2024)
                        .licensePlate("KA-02-MD-5566")
                        .category(CarCategory.SEDAN)
                        .seats(4)
                        .fuelType("Petrol + CNG")
                        .transmission("Automatic AMT")
                        .pricePerKm(new BigDecimal("18.00"))
                        .baseFare(new BigDecimal("90.00"))
                        .hourlyRate(new BigDecimal("260.00"))
                        .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Air Conditioned, Top Rated Driver, Boot Space, Clean Sedans")
                        .rating(4.86)
                        .totalTrips(290)
                        .build(),

                Car.builder()
                        .make("Tesla")
                        .model("Model 3 (Uber Green EV)")
                        .year(2024)
                        .licensePlate("KA-01-EV-4090")
                        .category(CarCategory.ELECTRIC)
                        .seats(5)
                        .fuelType("Electric (540km Range)")
                        .transmission("Dual Motor AWD")
                        .pricePerKm(new BigDecimal("35.00"))
                        .baseFare(new BigDecimal("150.00"))
                        .hourlyRate(new BigDecimal("500.00"))
                        .imageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Autopilot, Panoramic Glass Roof, 15-inch Touchscreen, Zero Carbon")
                        .rating(4.97)
                        .totalTrips(95)
                        .build(),

                Car.builder()
                        .make("Hyundai")
                        .model("Creta SX (Uber XL SUV)")
                        .year(2024)
                        .licensePlate("KA-51-CR-8921")
                        .category(CarCategory.SUV)
                        .seats(5)
                        .fuelType("Turbo Petrol")
                        .transmission("7-Speed DCT")
                        .pricePerKm(new BigDecimal("24.00"))
                        .baseFare(new BigDecimal("120.00"))
                        .hourlyRate(new BigDecimal("350.00"))
                        .imageUrl("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Panoramic Sunroof, Bose Sound, Extra Luggage Capacity, 5 Adults")
                        .rating(4.88)
                        .totalTrips(160)
                        .build(),

                Car.builder()
                        .make("BMW")
                        .model("530i M Sport (Uber Premier)")
                        .year(2023)
                        .licensePlate("KA-05-MM-7788")
                        .category(CarCategory.LUXURY)
                        .seats(5)
                        .fuelType("TwinTurbo Petrol")
                        .transmission("8-Speed Steptronic")
                        .pricePerKm(new BigDecimal("48.00"))
                        .baseFare(new BigDecimal("250.00"))
                        .hourlyRate(new BigDecimal("700.00"))
                        .imageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("Executive Chauffeur, Leather Seats, Ambient Lighting, VIP Travel")
                        .rating(4.95)
                        .totalTrips(78)
                        .build(),

                // ---- TROLLEY & GOODS PORTER ----
                Car.builder()
                        .make("Tata")
                        .model("Ace Gold (Trolley / Porter)")
                        .year(2024)
                        .licensePlate("KA-04-TR-7501")
                        .category(CarCategory.TROLLEY_PORTER)
                        .seats(2)
                        .fuelType("Diesel High Torque")
                        .transmission("5-Speed Manual")
                        .pricePerKm(new BigDecimal("25.00"))
                        .baseFare(new BigDecimal("180.00"))
                        .hourlyRate(new BigDecimal("400.00"))
                        .maxWeightKg(750)
                        .imageUrl("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("750 kg Cargo Capacity, House Shifting, Furniture & Appliance Moving, Loading Assistance")
                        .rating(4.92)
                        .totalTrips(145)
                        .build(),

                Car.builder()
                        .make("Piaggio")
                        .model("Ape Xtra (3W Trolley Loader)")
                        .year(2023)
                        .licensePlate("KA-02-TR-4002")
                        .category(CarCategory.TROLLEY_PORTER)
                        .seats(1)
                        .fuelType("Diesel Economy")
                        .transmission("4-Speed Manual")
                        .pricePerKm(new BigDecimal("20.00"))
                        .baseFare(new BigDecimal("140.00"))
                        .hourlyRate(new BigDecimal("300.00"))
                        .maxWeightKg(400)
                        .imageUrl("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80")
                        .status(CarStatus.AVAILABLE)
                        .features("400 kg Capacity, Small Cargo & Parcel Transport, Tight Street Delivery")
                        .rating(4.85)
                        .totalTrips(220)
                        .build()
        );

        List<Car> savedFleet = carRepository.saveAll(fleet);

        // 4. Seed Initial Completed Trips (Bike & Cab)
        Booking pastTrip1 = Booking.builder()
                .bookingCode("DP-882140")
                .customer(customer)
                .driver(driverUser1)
                .car(savedFleet.get(0)) // Bike
                .pickupAddress("Indiranagar 100ft Rd, Bengaluru")
                .dropoffAddress("MG Road Metro Station, Bengaluru")
                .pickupLat(12.9784)
                .pickupLng(77.6408)
                .dropoffLat(12.9756)
                .dropoffLng(77.6066)
                .distanceKm(4.2)
                .estimatedDurationMins(12)
                .baseFare(new BigDecimal("25.00"))
                .distanceFare(new BigDecimal("29.40"))
                .taxFare(new BigDecimal("2.72"))
                .totalFare(new BigDecimal("57.12"))
                .status(BookingStatus.COMPLETED)
                .paymentMethod(PaymentMethod.UPI)
                .paymentStatus(PaymentStatus.COMPLETED)
                .otp("4912")
                .createdAt(LocalDateTime.now().minusHours(4))
                .startedAt(LocalDateTime.now().minusHours(4).plusMinutes(2))
                .completedAt(LocalDateTime.now().minusHours(4).plusMinutes(14))
                .build();

        bookingRepository.save(pastTrip1);

        log.info("Successfully initialized Rapido & Uber Multi-Modal platform: 2 Bikes, 2 Autos, 4 Cabs, 2 Trolley/Porters!");
    }
}
