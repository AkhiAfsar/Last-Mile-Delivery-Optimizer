package com.lastmile.backend.delivery;

import java.util.List;

public class SaveDeliveryRouteRequest {

    private String warehouseAddress;
    private double warehouseLatitude;
    private double warehouseLongitude;

    private double totalDistanceKm;
    private long totalTimeMinutes;

    private List<SaveDeliveryStopRequest> stops;

    public SaveDeliveryRouteRequest() {
    }

    public String getWarehouseAddress() {
        return warehouseAddress;
    }

    public void setWarehouseAddress(String warehouseAddress) {
        this.warehouseAddress = warehouseAddress;
    }

    public double getWarehouseLatitude() {
        return warehouseLatitude;
    }

    public void setWarehouseLatitude(double warehouseLatitude) {
        this.warehouseLatitude = warehouseLatitude;
    }

    public double getWarehouseLongitude() {
        return warehouseLongitude;
    }

    public void setWarehouseLongitude(double warehouseLongitude) {
        this.warehouseLongitude = warehouseLongitude;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public long getTotalTimeMinutes() {
        return totalTimeMinutes;
    }

    public void setTotalTimeMinutes(long totalTimeMinutes) {
        this.totalTimeMinutes = totalTimeMinutes;
    }

    public List<SaveDeliveryStopRequest> getStops() {
        return stops;
    }

    public void setStops(List<SaveDeliveryStopRequest> stops) {
        this.stops = stops;
    }
}