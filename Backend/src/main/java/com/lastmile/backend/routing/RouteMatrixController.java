package com.lastmile.backend.routing;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routing")
public class RouteMatrixController {

    private final RouteMatrixService routeMatrixService;

    private final RouteOptimizationService
            routeOptimizationService;


    public RouteMatrixController(
            RouteMatrixService routeMatrixService,
            RouteOptimizationService routeOptimizationService) {

        this.routeMatrixService =
                routeMatrixService;

        this.routeOptimizationService =
                routeOptimizationService;
    }


    @PostMapping("/matrix")
    public Map<String, Object> getMatrix(
            @RequestBody RouteMatrixRequest request) {

        return routeMatrixService
                .getRoadMatrix(
                        request.locations()
                );
    }


    @PostMapping("/optimize")
    public Map<String, Object> optimize(
            @RequestBody RouteMatrixRequest request) {

        return routeOptimizationService
                .optimize(
                        request.locations()
                );
    }
    @PostMapping("/route")
public Map<String, Object> getRoute(
        @RequestBody RouteMatrixRequest request) {

    return routeMatrixService
            .getRoadRoute(
                    request.locations()
            );
}
}