
package com.lastmile.backend.delivery;

import org.springframework.stereotype.Service;

@Service
public class DeliveryRouteService {

    private final DeliveryRouteRepository repository;

    public DeliveryRouteService(
            DeliveryRouteRepository repository) {

        this.repository = repository;
    }

    public DeliveryRoute saveRoute(
            SaveDeliveryRouteRequest request) {

        DeliveryRoute route =
                new DeliveryRoute();

        route.setWarehouseAddress(
                request.getWarehouseAddress()
        );

        route.setWarehouseLatitude(
                request.getWarehouseLatitude()
        );

        route.setWarehouseLongitude(
                request.getWarehouseLongitude()
        );

        route.setTotalDistanceKm(
                request.getTotalDistanceKm()
        );

        route.setTotalTimeMinutes(
                request.getTotalTimeMinutes()
        );

        route.setStatus("READY");

        if (request.getStops() != null) {

            for (
                SaveDeliveryStopRequest stopRequest
                    : request.getStops()
            ) {

                DeliveryStop stop =
                        new DeliveryStop();

                stop.setStopOrder(
                        stopRequest.getStopOrder()
                );

                stop.setCustomerName(
                        stopRequest.getCustomerName()
                );

                stop.setAddress(
                        stopRequest.getAddress()
                );

                stop.setLatitude(
                        stopRequest.getLatitude()
                );

                stop.setLongitude(
                        stopRequest.getLongitude()
                );

                stop.setStatus("PENDING");

                route.addStop(stop);
            }
        }

        return repository.save(route);
    }

    // Fetch delivery route by ID
    public DeliveryRoute getRouteById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Route not found with ID: " + id
                    )
                );
    }
}
