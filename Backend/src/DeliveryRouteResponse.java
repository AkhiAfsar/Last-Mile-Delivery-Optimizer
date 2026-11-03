
package com.lastmile.backend.delivery;

import java.time.LocalDateTime;
import java.util.List;

public record DeliveryRouteResponse(
        Long id,
        LocalDateTime createdAt,
        double totalDistanceKm,
        long totalTimeMinutes,
        String status,
        String warehouseAddress,
        double warehouseLatitude,
        double warehouseLongitude,
        List<DeliveryStopResponse> stops
) {
    public record DeliveryStopResponse(
            Long id,
            int stopOrder,
            String customerName,
            String address,
            double latitude,
            double longitude,
            String status
    ) {}
}
