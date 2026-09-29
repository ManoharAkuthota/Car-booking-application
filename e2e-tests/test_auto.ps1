$baseUrl = "http://localhost:8080/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TESTING AUTO RICKSHAW 3-SEATER BOOKING FLOW            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Customer Login
$custAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email="customer@drivepulse.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$custHeaders = @{ Authorization = "Bearer $($custAuth.token)" }

# 2. Get Auto Rickshaw
$autos = Invoke-RestMethod -Uri "$baseUrl/cars?category=AUTO" -Method Get
$auto = $autos[0]
Write-Host "Selected Vehicle: $($auto.make) $($auto.model) (3-seater Rickshaw)" -ForegroundColor Green

# 3. Estimate Fare for Auto
$estPayload = @{
    carId = $auto.id
    pickupLat = 12.9756
    pickupLng = 77.6066
    dropoffLat = 12.9866
    dropoffLng = 77.7382
} | ConvertTo-Json
$autoEstimate = Invoke-RestMethod -Uri "$baseUrl/bookings/estimate-fare" -Method Post -Headers $custHeaders -Body $estPayload -ContentType "application/json"
Write-Host "Auto Meter Fare: Base ₹$($autoEstimate.baseFare), Distance $($autoEstimate.distanceKm) km (₹$($autoEstimate.distanceFare)), Total ₹$($autoEstimate.totalFare)" -ForegroundColor Green

# 4. Book Auto
$bookPayload = @{
    carId = $auto.id
    pickupAddress = "MG Road Metro"
    dropoffAddress = "Whitefield IT Park"
    pickupLat = 12.9756
    pickupLng = 77.6066
    dropoffLat = 12.9866
    dropoffLng = 77.7382
    distanceKm = $autoEstimate.distanceKm
    estimatedDurationMins = $autoEstimate.estimatedDurationMins
    paymentMethod = "CASH"
    specialInstructions = "3 passengers, door-to-door auto commute"
} | ConvertTo-Json
$autoBooking = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Headers $custHeaders -Body $bookPayload -ContentType "application/json"
Write-Host "Auto Booking Created! Code: $($autoBooking.bookingCode), OTP: $($autoBooking.otp), Pilot: $($autoBooking.driver.fullName)" -ForegroundColor Green

# 5. Driver verifies OTP and completes ride
$driverAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email="driver@drivepulse.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$driverHeaders = @{ Authorization = "Bearer $($driverAuth.token)" }

$startPayload = @{ status = "IN_PROGRESS"; otp = $autoBooking.otp } | ConvertTo-Json
$inProgress = Invoke-RestMethod -Uri "$baseUrl/bookings/$($autoBooking.id)/status" -Method Patch -Headers $driverHeaders -Body $startPayload -ContentType "application/json"
Write-Host "Auto ride in progress! Status: $($inProgress.status)" -ForegroundColor Green

$completePayload = @{ status = "COMPLETED" } | ConvertTo-Json
$completed = Invoke-RestMethod -Uri "$baseUrl/bookings/$($autoBooking.id)/status" -Method Patch -Headers $driverHeaders -Body $completePayload -ContentType "application/json"
Write-Host "Auto Trip Completed! Final Status: $($completed.status), Fare: ₹$($completed.totalFare)" -ForegroundColor Green

Write-Host "`n>>> AUTO RICKSHAW TEST SUCCESSFUL! <<<" -ForegroundColor Cyan
