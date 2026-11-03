package com.lastmile.backend.routing;

import java.util.List;

public record RouteMatrixRequest(
        List<LocationPoint> locations
) {
}