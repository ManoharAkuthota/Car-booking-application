# DrivePulse — Enterprise Car Booking & Rental Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Java](https://img.shields.io/badge/Java-21%2F23-red.svg)](https://www.oracle.com/java/)

**DrivePulse** is a full-stack, enterprise-grade Car Booking and Rental Management platform built with **Spring Boot 3 (Java 21/23)**, **React 18 + Vite**, and **MySQL 8.0**. It incorporates real-time trip simulation, OpenStreetMap route navigation, role-based workflows for **Customers**, **Driver Partners**, and **Platform Administrators**, cryptographic 4-digit ride verification PINs, and electronic digital receipts.

---

## 🏗 Architecture & System Design

```
Car booking application/
├── run-backend.bat                  # 1-Click launcher for Spring Boot backend
├── run-frontend.bat                 # 1-Click launcher for React Vite frontend
├── README.md                        # Documentation & setup guide
├── backend/                         # Spring Boot 3 REST API
│   ├── pom.xml                      # Maven dependencies
│   ├── src/main/java/com/carbooking/
│   │   ├── config/                  # SecurityConfig, CorsConfig, DataInitializer
│   │   ├── controller/              # Auth, Car, Booking, Driver, Admin controllers
│   │   ├── dto/                     # Request and Response transfer objects
│   │   ├── entity/                  # JPA entities (User, Car, DriverProfile, Booking, Review)
│   │   ├── repository/              # Spring Data JPA repositories
│   │   ├── security/                # JWT Token Provider, UserDetailsService, AuthFilter
│   │   ├── service/                 # AuthService, CarService, BookingService, DriverService, AdminService
│   │   └── CarBookingApplication.java
│   └── src/main/resources/
│       └── application.yml          # MySQL connection and JWT parameters
└── frontend/                        # React 18 + Vite + Tailwind CSS
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/client.js            # Axios client with JWT interceptor
        ├── components/              # Navbar, MapView (Leaflet), CarCard, BookingModal, ActiveTripCard, DigitalReceipt
        ├── context/AuthContext.jsx  # Multi-role authentication & 1-click demo switcher
        └── pages/                   # CustomerExplore, CustomerRides, DriverDashboard, AdminDashboard
```

---

## 🌟 Key Features

### 1. Customer / Rider Portal
* **Dynamic Fleet Catalog**: Explore electric vehicles (EV), executive luxury sedans, family SUVs, and compact hatchbacks with high-resolution imagery and live availability status.
* **Instant Fare Breakdown**: Real-time fare calculation using Haversine route distance with transparent base rate, distance rate, and 5% GST tax breakdown.
* **Interactive OpenStreetMap Route Navigation**: Leaflet.js map with pickup/dropoff markers, route polyline, and animated moving car telemetry.
* **4-Digit Ride PIN (OTP)**: Cryptographic trip start OTP generated per ride to ensure passenger safety.
* **Live Trip Status Lifecycle**: Track `REQUESTED` → `ACCEPTED` → `DRIVER_ARRIVING` → `IN_PROGRESS` → `COMPLETED`.
* **Official Digital Invoice Receipt**: Downloadable/printable invoice with booking reference, driver details, fare itemization, and star rating submission.

### 2. Driver Partner Cockpit
* **Online / Offline Toggle**: Instant GPS telemetry and online status synchronization with backend.
* **Incoming Ride Radar**: Real-time broadcast of new rider requests with passenger name, pickup/dropoff points, distance, and payout quote.
* **Turn-by-Turn Trip Execution**:
  * "I Have Arrived" status trigger
  * Passenger PIN verification to start ride
  * "Complete Trip & Collect Fare" settlement
* **Earnings & Performance Ledger**: Live metrics tracking total trips, cumulative earnings (₹), driver rating, and assigned vehicle.

### 3. Admin Command Center
* **Executive Telemetry & KPIs**: Real-time gross revenue, total completed/active trips, fleet utilization rate, and active driver count.
* **Fleet Management**: Add new vehicles, toggle maintenance status, modify price per km, and remove decommissioned vehicles.
* **Driver Partner Verification**: Review driver licenses, driving experience, and approve/reject partner applications.
* **Live Trips Monitor**: Omniscient view of all platform rides with status filtering.

### 4. 1-Click Demo Switcher
* The top navigation bar includes an instant demo role switcher (`[ Customer ]`, `[ Driver ]`, `[ Admin ]`), allowing developers and evaluators to seamlessly test all three personas without repetitive logins.

---

## 🔑 Default Seed Credentials

The database is pre-seeded with test accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@drivepulse.com` | `admin123` | Full platform control & fleet governance |
| **Driver** | `driver@drivepulse.com` | `password123` | Rajesh Kumar (Tesla Model 3, 5 yrs exp, 4.9★) |
| **Driver 2**| `driver2@drivepulse.com`| `password123` | Marcus Sterling (BMW 530i, 8 yrs exp, 4.95★) |
| **Customer**| `customer@drivepulse.com`| `password123` | Priya Sharma (Verified Rider) |

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launchers (Windows)
1. Double-click `run-backend.bat` to launch the Spring Boot backend on **port 8080**.
2. Double-click `run-frontend.bat` to launch the React frontend on **port 5173**.
3. Open your browser at: **`http://localhost:5173`**

### Option 2: Manual Terminal Commands

#### 1. Backend (Spring Boot 3 + MySQL)
```powershell
cd "A:\Car booking application\backend"
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`.

#### 2. Frontend (React + Vite)
```powershell
cd "A:\Car booking application\frontend"
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 📡 REST API Reference Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate and issue JWT token | Public |
| `POST` | `/api/auth/register` | Register new customer or driver | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/cars` | Get fleet list with filters (category, seats, search) | Public |
| `POST` | `/api/cars` | Add a new vehicle to fleet | Admin |
| `PUT` | `/api/cars/{id}` | Update vehicle specs or status | Admin |
| `DELETE` | `/api/cars/{id}` | Remove vehicle from fleet | Admin |
| `POST` | `/api/bookings/estimate-fare` | Calculate distance and fare breakdown | Public |
| `POST` | `/api/bookings` | Book a vehicle | Customer |
| `GET` | `/api/bookings/my-bookings` | Get rider booking history | Customer |
| `PATCH`| `/api/bookings/{id}/status` | Advance trip status with OTP verification | Driver / Admin |
| `POST` | `/api/bookings/{id}/cancel` | Cancel an unstarted ride | Customer |
| `GET` | `/api/driver/stats` | Get driver earnings and metrics | Driver |
| `GET` | `/api/driver/pending-requests` | Get unaccepted ride requests | Driver |
| `POST` | `/api/driver/accept/{id}` | Accept a ride request | Driver |
| `GET` | `/api/admin/stats` | Platform KPIs and revenue summary | Admin |
| `GET` | `/api/admin/drivers` | Get driver verification roster | Admin |
| `PATCH`| `/api/admin/drivers/{id}/verify`| Approve or reject driver partner | Admin |
| `GET` | `/api/admin/trips` | Real-time platform trips log | Admin |
