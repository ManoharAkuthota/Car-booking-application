package com.carbooking.dto;

import lombok.Data;

@Data
public class DriverLocationUpdateRequest {
    private Double lat;
    private Double lng;
    private Boolean isOnline;
}
