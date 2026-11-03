package com.lastmile.backend.delivery;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "delivery_stops")
public class DeliveryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "route_id",
        nullable = false
    )
    private DeliveryRoute route;


    private int stopOrder;

    private String customerName;

    private String address;

    private double latitude;

    private double longitude;

    private String status = "PENDING";


    public DeliveryStop() {
    }


    public Long getId() {
        return id;
    }

    public DeliveryRoute getRoute() {
        return route;
    }

    public void setRoute(
            DeliveryRoute route) {

        this.route = route;
    }

    public int getStopOrder() {
        return stopOrder;
    }

    public void setStopOrder(
            int stopOrder) {

        this.stopOrder = stopOrder;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(
            String customerName) {

        this.customerName =
                customerName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(
            String address) {

        this.address = address;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(
            double latitude) {

        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(
            double longitude) {

        this.longitude = longitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }
}