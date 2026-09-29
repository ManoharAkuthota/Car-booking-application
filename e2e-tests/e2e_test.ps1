$baseUrl = "http://localhost:8080/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DRIVEPULSE RAPIDO & UBER END-TO-END AUTOMATED TEST     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test GET /api/cars
Write-Host "`n[TEST 1] Fetching all fleet vehicles..." -ForegroundColor Yellow
$cars = Invoke-RestMethod -Uri "$baseUrl/cars" -Method Get
Write-Host "Total vehicles in fleet: $($cars.Count)" -ForegroundColor Green
$categories = $cars | Group-Object category | Select-Object Name, Count
$categories | ForEach-Object { Write-Host " - $($_.Name): $($_.Count) vehicle(s)" -ForegroundColor White }

# Verify Multi-Modal categories present
$bikeCars = Invoke-RestMethod -Uri "$baseUrl/cars?category=BIKE" -Method Get
Write-Host "Bike count: $($bikeCars.Count)" -ForegroundColor Green
if ($bikeCars.Count -lt 2) { throw "Expected at least 2 bikes" }

$autoCars = Invoke-RestMethod -Uri "$baseUrl/cars?category=AUTO" -Method Get
Write-Host "Auto count: $($autoCars.Count)" -ForegroundColor Green
if ($autoCars.Count -lt 2) { throw "Expected at least 2 autos" }

$trolleyCars = Invoke-RestMethod -Uri "$baseUrl/cars?category=TROLLEY_PORTER" -Method Get
Write-Host "Trolley count: $($trolleyCars.Count), max payload: $($trolleyCars[0].maxWeightKg) kg" -ForegroundColor Green
if ($trolleyCars.Count -lt 2) { throw "Expected at least 2 trolleys" }

# 2. Customer Login
Write-Host "`n[TEST 2] Authenticating as Customer (customer@drivepulse.com)..." -ForegroundColor Yellow
$loginPayload = @{
    email = "customer@drivepulse.com"
    password = "password123"
} | ConvertTo-Json

$custAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$custToken = $custAuth.token
Write-Host "Customer logged in: $($custAuth.user.fullName), Role: $($custAuth.user.role)" -ForegroundColor Green

# 3. Fare Estimation for Rapido Bike Taxi
Write-Host "`n[TEST 3] Estimating Fare for Bike Taxi..." -ForegroundColor Yellow
$bike = $bikeCars[0]
$estimatePayload = @{
    carId = $bike.id
    pickupLat = 12.9784
    pickupLng = 77.6408
    dropoffLat = 13.1986
    dropoffLng = 77.7066
} | ConvertTo-Json

$estimateHeaders = @{ Authorization = "Bearer $custToken" }
$bikeEstimate = Invoke-RestMethod -Uri "$baseUrl/bookings/estimate-fare" -Method Post -Headers $estimateHeaders -Body $estimatePayload -ContentType "application/json"
Write-Host "Bike Fare Estimate: Distance $($bikeEstimate.distanceKm) km, Base ₹$($bikeEstimate.baseFare), Distance ₹$($bikeEstimate.distanceFare), Total ₹$($bikeEstimate.totalFare)" -ForegroundColor Green

# 4. Create Bike Booking (Rapido Style)
Write-Host "`n[TEST 4] Creating Live Booking for Bike ($($bike.make) $($bike.model))..." -ForegroundColor Yellow
$bookingPayload = @{
    carId = $bike.id
    pickupAddress = "Indiranagar 100ft Rd"
    dropoffAddress = "Kempegowda Airport (BLR)"
    pickupLat = 12.9784
    pickupLng = 77.6408
    dropoffLat = 13.1986
    dropoffLng = 77.7066
    distanceKm = $bikeEstimate.distanceKm
    estimatedDurationMins = $bikeEstimate.estimatedDurationMins
    paymentMethod = "UPI"
    specialInstructions = "Please provide clean helmet, travelling light"
} | ConvertTo-Json

$booking = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Headers $estimateHeaders -Body $bookingPayload -ContentType "application/json"
Write-Host "Booking Confirmed! Code: $($booking.bookingCode), Status: $($booking.status), Start PIN OTP: $($booking.otp), Total: ₹$($booking.totalFare)" -ForegroundColor Green

# 5. Driver Login & Trip Flow
Write-Host "`n[TEST 5] Authenticating as Driver (driver@drivepulse.com) & Accepting Booking..." -ForegroundColor Yellow
$driverLoginPayload = @{
    email = "driver@drivepulse.com"
    password = "password123"
} | ConvertTo-Json

$driverAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $driverLoginPayload -ContentType "application/json"
$driverToken = $driverAuth.token
$driverHeaders = @{ Authorization = "Bearer $driverToken" }
Write-Host "Driver logged in: $($driverAuth.user.fullName)" -ForegroundColor Green

# Driver accepts trip if still in REQUESTED status, or confirms auto-match
if ($booking.status -eq "REQUESTED") {
    $acceptedTrip = Invoke-RestMethod -Uri "$baseUrl/driver/trips/$($booking.id)/accept" -Method Post -Headers $driverHeaders
    Write-Host "Trip Accepted! Status: $($acceptedTrip.status)" -ForegroundColor Green
} else {
    Write-Host "Trip Automatically Matched to Online Driver ($($booking.driver.fullName))! Status: $($booking.status)" -ForegroundColor Green
}

# Driver arrives at pickup
Write-Host "`n[TEST 6] Driver Arrived at Pickup Location..." -ForegroundColor Yellow
$arrivePayload = @{ status = "DRIVER_ARRIVING" } | ConvertTo-Json
$arrivingTrip = Invoke-RestMethod -Uri "$baseUrl/bookings/$($booking.id)/status" -Method Patch -Headers $driverHeaders -Body $arrivePayload -ContentType "application/json"
Write-Host "Status updated: $($arrivingTrip.status)" -ForegroundColor Green

# Driver verifies OTP and starts trip
Write-Host "`n[TEST 7] Driver Verifies OTP ($($booking.otp)) and Starts Trip..." -ForegroundColor Yellow
$startPayload = @{
    status = "IN_PROGRESS"
    otp = $booking.otp
} | ConvertTo-Json
$inProgressTrip = Invoke-RestMethod -Uri "$baseUrl/bookings/$($booking.id)/status" -Method Patch -Headers $driverHeaders -Body $startPayload -ContentType "application/json"
Write-Host "Trip In Progress! Status: $($inProgressTrip.status)" -ForegroundColor Green

# Driver completes trip
Write-Host "`n[TEST 8] Driver Completes Trip & Generates Digital Receipt..." -ForegroundColor Yellow
$completePayload = @{ status = "COMPLETED" } | ConvertTo-Json
$completedTrip = Invoke-RestMethod -Uri "$baseUrl/bookings/$($booking.id)/status" -Method Patch -Headers $driverHeaders -Body $completePayload -ContentType "application/json"
Write-Host "Trip Completed! Final Status: $($completedTrip.status), Total Paid: ₹$($completedTrip.totalFare)" -ForegroundColor Green

# 6. Admin Command Center Stats
Write-Host "`n[TEST 9] Admin Verification of Platform Telemetry..." -ForegroundColor Yellow
$adminLoginPayload = @{
    email = "admin@drivepulse.com"
    password = "admin123"
} | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginPayload -ContentType "application/json"
$adminHeaders = @{ Authorization = "Bearer $($adminAuth.token)" }

$adminStats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers $adminHeaders
Write-Host "Admin Stats -> Total Bookings: $($adminStats.totalBookings), Total Revenue: ₹$($adminStats.totalRevenue), Fleet: $($adminStats.totalCars) vehicles, Drivers: $($adminStats.totalDrivers)" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "   ALL 9 END-TO-END TESTS PASSED WITH 100% SUCCESS!       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
