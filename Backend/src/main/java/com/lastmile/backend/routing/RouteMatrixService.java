package com.lastmile.backend.routing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class RouteMatrixService {

    private final RestClient restClient;
    private final String apiKey;

    public RouteMatrixService(
            @Value("${geoapify.api.key}") String apiKey) {

        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.geoapify.com/v1")
                .build();
    }

    public Map<String, Object> getRoadMatrix(
            List<LocationPoint> locations) {

        if (locations == null || locations.size() < 2) {
            throw new IllegalArgumentException(
                    "At least two locations are required.");
        }

        List<Map<String, Object>> points =
                locations.stream()
                        .map(location ->
                                Map.<String, Object>of(
                                        "location",
                                        List.of(
                                                location.longitude(),
                                                location.latitude()
                                        )
                                )
                        )
                        .toList();

        Map<String, Object> body = new HashMap<>();

        body.put("mode", "drive");
        body.put("sources", points);
        body.put("targets", points);

        return restClient
                .post()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/routematrix")
                                .queryParam("apiKey", apiKey)
                                .build()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(
                        new ParameterizedTypeReference<
                                Map<String, Object>>() {
                        }
                );
    }
    public Map<String, Object> getRoadRoute(
        List<LocationPoint> locations) {

    String waypoints =
            locations.stream()
                    .map(location ->
                            location.latitude()
                            + ","
                            + location.longitude()
                    )
                    .collect(
                            java.util.stream.Collectors.joining("|")
                    );


    return restClient
            .get()
            .uri(uriBuilder ->
                    uriBuilder
                            .path("/routing")
                            .queryParam("waypoints", waypoints)
                            .queryParam("mode", "drive")
                            .queryParam("format", "geojson")
                            .queryParam("apiKey", apiKey)
                            .build()
            )
            .retrieve()
            .body(
                    new ParameterizedTypeReference<
                            Map<String, Object>>() {
                    }
            );
}
}