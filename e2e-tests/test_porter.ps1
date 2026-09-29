$baseUrl = "http://localhost:8080/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TESTING TROLLEY / PORTER LOGISTICS BOOKING FLOW        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Customer Login
$custAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email="customer@drivepulse.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$custHeaders = @{ Authorization = "Bearer $($custAuth.token)" }

# 2. Get Trolley Car
$trolleys = Invoke-RestMethod -Uri "$baseUrl/cars?category=TROLLEY_PORTER" -Method Get
$tataAce = $trolleys[0]
Write-Host "Selected Cargo Vehicle: $($tataAce.make) $($tataAce.model) (Payload: $($tataAce.maxWeightKg) kg)" -ForegroundColor Green

# 3. Estimate Fare for Porter
$estPayload = @{
    carId = $tataAce.id
    pickupLat = 12.9352
    pickupLng = 77.6245
    dropoffLat = 12.8452
    dropoffLng = 77.6602
} | ConvertTo-Json
$porterEstimate = Invoke-RestMethod -Uri "$baseUrl/bookings/estimate-fare" -Method Post -Headers $custHeaders -Body $estPayload -ContentType "application/json"
Write-Host "Porter Fare: Base ₹$($porterEstimate.baseFare), Distance $($porterEstimate.distanceKm) km (₹$($porterEstimate.distanceFare)), Total ₹$($porterEstimate.totalFare)" -ForegroundColor Green

# 4. Book Porter
$bookPayload = @{
    carId = $tataAce.id
    pickupAddress = "Koramangala 5th Block"
    dropoffAddress = "Electronic City Phase 1"
    pickupLat = 12.9352
    pickupLng = 77.6245
    dropoffLat = 12.8452
    dropoffLng = 77.6602
    distanceKm = $porterEstimate.distanceKm
    estimatedDurationMins = $porterEstimate.estimatedDurationMins
    paymentMethod = "WALLET"
    specialInstructions = "[Cargo: Furniture & Shifting + Helper] Heavy sofa and 4 cartons, ground floor pickup"
} | ConvertTo-Json
$porterBooking = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Headers $custHeaders -Body $bookPayload -ContentType "application/json"
Write-Host "Porter Booking Created! Code: $($porterBooking.bookingCode), OTP: $($porterBooking.otp), Assigned Pilot: $($porterBooking.driver.fullName)" -ForegroundColor Green

# 5. Driver verifies OTP and completes ride
$driverAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email="driver@drivepulse.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$driverHeaders = @{ Authorization = "Bearer $($driverAuth.token)" }

$startPayload = @{ status = "IN_PROGRESS"; otp = $porterBooking.otp } | ConvertTo-Json
$inProgress = Invoke-RestMethod -Uri "$baseUrl/bookings/$($porterBooking.id)/status" -Method Patch -Headers $driverHeaders -Body $startPayload -ContentType "application/json"
Write-Host "Porter en route! Status: $($inProgress.status)" -ForegroundColor Green

$completePayload = @{ status = "COMPLETED" } | ConvertTo-Json
$completed = Invoke-RestMethod -Uri "$baseUrl/bookings/$($porterBooking.id)/status" -Method Patch -Headers $driverHeaders -Body $completePayload -ContentType "application/json"
Write-Host "Cargo Delivered! Final Status: $($completed.status), Fare: ₹$($completed.totalFare)" -ForegroundColor Green

Write-Host "`n>>> TROLLEY / PORTER TEST SUCCESSFUL! <<<" -ForegroundColor Cyan
