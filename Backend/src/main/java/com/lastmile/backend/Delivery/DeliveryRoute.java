package com.lastmile.backend.delivery;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "delivery_routes")
public class DeliveryRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt =
            LocalDateTime.now();

    private double totalDistanceKm;

    private long totalTimeMinutes;

    private String status = "READY";

    private String warehouseAddress;

    private double warehouseLatitude;

    private double warehouseLongitude;


    @OneToMany(
        mappedBy = "route",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @OrderBy("stopOrder ASC")
    private List<DeliveryStop> stops =
            new ArrayList<>();


    public DeliveryRoute() {
    }


    public void addStop(DeliveryStop stop) {

        stops.add(stop);

        stop.setRoute(this);
    }


    public Long getId() {
        return id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(
            double totalDistanceKm) {

        this.totalDistanceKm =
                totalDistanceKm;
    }

    public long getTotalTimeMinutes() {
        return totalTimeMinutes;
    }

    public void setTotalTimeMinutes(
            long totalTimeMinutes) {

        this.totalTimeMinutes =
                totalTimeMinutes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWarehouseAddress() {
        return warehouseAddress;
    }

    public void setWarehouseAddress(
            String warehouseAddress) {

        this.warehouseAddress =
                warehouseAddress;
    }

    public double getWarehouseLatitude() {
        return warehouseLatitude;
    }

    public void setWarehouseLatitude(
            double warehouseLatitude) {

        this.warehouseLatitude =
                warehouseLatitude;
    }

    public double getWarehouseLongitude() {
        return warehouseLongitude;
    }

    public void setWarehouseLongitude(
            double warehouseLongitude) {

        this.warehouseLongitude =
                warehouseLongitude;
    }

    public List<DeliveryStop> getStops() {
        return stops;
    }
}