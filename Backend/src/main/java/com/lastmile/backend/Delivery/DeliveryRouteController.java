
 
package com.lastmile.backend.delivery;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/delivery-routes")
public class DeliveryRouteController {

    private final DeliveryRouteService service;

    public DeliveryRouteController(
            DeliveryRouteService service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> saveRoute(
            @RequestBody SaveDeliveryRouteRequest request) {

        DeliveryRoute savedRoute =
                service.saveRoute(request);

        return Map.of(
                "routeId", savedRoute.getId(),
                "status", savedRoute.getStatus()
        );
    }

    @GetMapping("/{id}")
    public DeliveryRouteResponse getRoute(
            @PathVariable Long id) {

        DeliveryRoute route = service.getRouteById(id);

        var stops = route.getStops().stream()
                .map(stop ->
                        new DeliveryRouteResponse.DeliveryStopResponse(
                                stop.getId(),
                                stop.getStopOrder(),
                                stop.getCustomerName(),
                                stop.getAddress(),
                                stop.getLatitude(),
                                stop.getLongitude(),
                                stop.getStatus()
                        )
                ).toList();

        return new DeliveryRouteResponse(
                route.getId(),
                route.getCreatedAt(),
                route.getTotalDistanceKm(),
                route.getTotalTimeMinutes(),
                route.getStatus(),
                route.getWarehouseAddress(),
                route.getWarehouseLatitude(),
                route.getWarehouseLongitude(),
                stops
        );
    }
}
