package com.lastmile.backend.delivery;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRouteRepository
        extends JpaRepository<
            DeliveryRoute,
            Long
        > {
}