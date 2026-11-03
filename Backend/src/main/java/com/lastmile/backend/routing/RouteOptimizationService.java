package com.lastmile.backend.routing;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class RouteOptimizationService {

    private final RouteMatrixService routeMatrixService;

    public RouteOptimizationService(
            RouteMatrixService routeMatrixService) {

        this.routeMatrixService = routeMatrixService;
    }

    public Map<String, Object> optimize(
            List<LocationPoint> locations) {

        Map<String, Object> raw =
                routeMatrixService.getRoadMatrix(locations);

        List<?> rows =
                (List<?>) raw.get("sources_to_targets");

        int n = locations.size();

        double[][] time = new double[n][n];
        double[][] distance = new double[n][n];


        // Convert Geoapify response into Java matrices
        for (int i = 0; i < n; i++) {

            List<?> row =
                    (List<?>) rows.get(i);

            for (int j = 0; j < n; j++) {

                Map<?, ?> cell =
                        (Map<?, ?>) row.get(j);

                Number t =
                        (Number) cell.get("time");

                Number d =
                        (Number) cell.get("distance");

                time[i][j] =
                        t == null
                                ? Double.MAX_VALUE
                                : t.doubleValue();

                distance[i][j] =
                        d == null
                                ? Double.MAX_VALUE
                                : d.doubleValue();
            }
        }


        /*
         * STEP 1:
         * Nearest Neighbor using ROAD TRAVEL TIME
         */

        List<Integer> route =
                new ArrayList<>();

        boolean[] visited =
                new boolean[n];

        int current = 0;

        route.add(0);
        visited[0] = true;


        while (route.size() < n) {

            int nearest = -1;

            double bestTime =
                    Double.MAX_VALUE;


            for (int i = 1; i < n; i++) {

                if (!visited[i]
                        && time[current][i] < bestTime) {

                    bestTime =
                            time[current][i];

                    nearest = i;
                }
            }


            if (nearest == -1) {
                break;
            }


            visited[nearest] = true;

            route.add(nearest);

            current = nearest;
        }


        /*
         * STEP 2:
         * Improve route using 2-Opt
         */

        route = improveWithTwoOpt(
                route,
                time
        );


        /*
         * Calculate final road distance + time
         */

        double totalTime = 0;

        double totalDistance = 0;


        for (int i = 0;
             i < route.size() - 1;
             i++) {

            int from =
                    route.get(i);

            int to =
                    route.get(i + 1);

            totalTime +=
                    time[from][to];

            totalDistance +=
                    distance[from][to];
        }


        Map<String, Object> result =
                new HashMap<>();

        result.put(
                "order",
                route
        );

        result.put(
                "totalDistanceMeters",
                Math.round(totalDistance)
        );

        result.put(
                "totalDistanceKm",
                Math.round(
                        totalDistance / 10.0
                ) / 100.0
        );

        result.put(
                "totalTimeSeconds",
                Math.round(totalTime)
        );

        result.put(
                "totalTimeMinutes",
                Math.round(totalTime / 60.0)
        );


        return result;
    }



    private List<Integer> improveWithTwoOpt(
            List<Integer> originalRoute,
            double[][] time) {

        List<Integer> best =
                new ArrayList<>(
                        originalRoute
                );

        double bestCost =
                calculateCost(
                        best,
                        time
                );

        boolean improved = true;


        while (improved) {

            improved = false;


            /*
             * i starts at 1 because index 0
             * is always our warehouse.
             */

            for (int i = 1;
                 i < best.size() - 1;
                 i++) {

                for (int j = i + 1;
                     j < best.size();
                     j++) {

                    List<Integer> candidate =
                            new ArrayList<>(best);

                    Collections.reverse(
                            candidate.subList(
                                    i,
                                    j + 1
                            )
                    );


                    double candidateCost =
                            calculateCost(
                                    candidate,
                                    time
                            );


                    if (candidateCost < bestCost) {

                        best =
                                candidate;

                        bestCost =
                                candidateCost;

                        improved = true;
                    }
                }
            }
        }


        return best;
    }



    private double calculateCost(
            List<Integer> route,
            double[][] time) {

        double total = 0;


        for (int i = 0;
             i < route.size() - 1;
             i++) {

            total +=
                    time[
                            route.get(i)
                    ][
                            route.get(i + 1)
                    ];
        }


        return total;
    }
}