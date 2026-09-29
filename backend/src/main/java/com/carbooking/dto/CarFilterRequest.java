package com.carbooking.dto;

import com.carbooking.entity.enums.CarCategory;
import com.carbooking.entity.enums.CarStatus;
import lombok.Data;

@Data
public class CarFilterRequest {
    private CarCategory category;
    private CarStatus status;
    private Integer seats;
    private String search;
}
