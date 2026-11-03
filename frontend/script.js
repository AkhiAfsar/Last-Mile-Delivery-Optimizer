// ==========================================================
// LAST-MILE DELIVERY OPTIMIZER - FRONTEND CONTROLLER
// ==========================================================
// Teacher guide:
// 01. Geoapify key + Leaflet map
// 02. Warehouse/customer state
// 03. Address autocomplete
// 04. Customer management
// 05. CSV import
// 06. Actual road route + numbered stops + arrows
// 07. Spring Boot optimization API
// 08. Send route to driver + MySQL save API
// ==========================================================


// ==========================================
// 1. GEOAPIFY API KEY
// Keep your existing key here.
// ==========================================

const GEOAPIFY_API_KEY =
    window.APP_CONFIG?.GEOAPIFY_API_KEY || "";


// ==========================================
// 2. LEAFLET MAP
// ==========================================

const map =
    L.map("map").setView(
        [23.3441, 85.3096],
        13
    );

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            "© OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// 3. APPLICATION STATE
// ==========================================

let selectionMode = null;


// Warehouse

let warehouse = null;

let warehouseMarker = null;


// Temporary customer selection

let selectedCustomerLocation = null;

let temporaryCustomerMarker = null;


// Customer list

let customers = [];

let customerId = 1;


// Actual road route

let routeLine = null;


// Contains route stop numbers and arrows

const routeDecorationLayer =
    L.layerGroup().addTo(map);


// Latest optimized result

let lastOptimizedLocations = [];

let lastOptimizationResult = null;


// Prevent duplicate route saving

let savedRouteIdForCurrentOptimization =
    null;


// ==========================================
// 4. HTML ELEMENTS
// ==========================================

const warehouseBtn =
    document.getElementById(
        "warehouseBtn"
    );

const warehouseInfo =
    document.getElementById(
        "warehouseInfo"
    );

const warehouseSearch =
    document.getElementById(
        "warehouseSearch"
    );

const warehouseSuggestions =
    document.getElementById(
        "warehouseSuggestions"
    );


const customerNameInput =
    document.getElementById(
        "customerName"
    );

const customerSearch =
    document.getElementById(
        "customerSearch"
    );

const customerSuggestions =
    document.getElementById(
        "customerSuggestions"
    );

const customerLocationBtn =
    document.getElementById(
        "customerLocationBtn"
    );

const customerLocationInfo =
    document.getElementById(
        "customerLocationInfo"
    );

const addCustomerBtn =
    document.getElementById(
        "addCustomerBtn"
    );

const customerList =
    document.getElementById(
        "customerList"
    );

const clearCustomersBtn =
    document.getElementById(
        "clearCustomersBtn"
    );


const optimizeBtn =
    document.getElementById(
        "optimizeBtn"
    );

const routeResult =
    document.getElementById(
        "routeResult"
    );

const distanceResult =
    document.getElementById(
        "distanceResult"
    );


// CSV

const csvFileInput =
    document.getElementById(
        "csvFileInput"
    );

const importCsvBtn =
    document.getElementById(
        "importCsvBtn"
    );

const csvStatus =
    document.getElementById(
        "csvStatus"
    );


// Send route to driver

const sendToDriverBtn =
    document.getElementById(
        "sendToDriverBtn"
    );

const driverRouteStatus =
    document.getElementById(
        "driverRouteStatus"
    );


// ==========================================
// 5. RESET OPTIMIZATION STATE
//
// If warehouse/customer data changes,
// the old optimized route is no longer valid.
// ==========================================

function resetOptimizationState() {

    lastOptimizedLocations = [];

    lastOptimizationResult = null;

    savedRouteIdForCurrentOptimization =
        null;


    if (sendToDriverBtn) {

        sendToDriverBtn.style.display =
            "none";
    }


    if (driverRouteStatus) {

        driverRouteStatus.textContent =
            "";

        driverRouteStatus.style.color =
            "";
    }


    if (routeResult) {

        routeResult.textContent =
            "Route will appear here after optimization.";
    }


    if (distanceResult) {

        distanceResult.textContent =
            "-- km";
    }
}


// ==========================================
// 6. SET WAREHOUSE LOCATION
// ==========================================

function setWarehouseLocation(
    lat,
    lng,
    address = null
) {

    if (
        warehouseMarker &&
        map.hasLayer(warehouseMarker)
    ) {

        map.removeLayer(
            warehouseMarker
        );
    }


    /*
       Important:
       Remove reference to old warehouse marker
       so it cannot return when old route is cleared.
    */

    warehouseMarker = null;


    warehouse = {

        lat: Number(lat),

        lng: Number(lng),

        address:
            address ||
            `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
    };


    resetOptimizationState();

    removeExistingRoute();


    warehouseMarker =
        L.marker(
            [
                warehouse.lat,
                warehouse.lng
            ]
        )
        .addTo(map)
        .bindPopup(
            "<b>Warehouse</b><br>" +
            escapeHTML(
                warehouse.address
            )
        )
        .openPopup();


    warehouseInfo.textContent =
        "Warehouse: " +
        warehouse.address;


    map.setView(
        [
            warehouse.lat,
            warehouse.lng
        ],
        16
    );


    selectionMode = null;

    map.getContainer().style.cursor =
        "";
}


// ==========================================
// 7. SET TEMPORARY CUSTOMER LOCATION
// ==========================================

function setCustomerLocation(
    lat,
    lng,
    address = null
) {

    if (
        temporaryCustomerMarker &&
        map.hasLayer(
            temporaryCustomerMarker
        )
    ) {

        map.removeLayer(
            temporaryCustomerMarker
        );
    }


    selectedCustomerLocation = {

        lat: Number(lat),

        lng: Number(lng),

        address:
            address ||
            `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
    };


    temporaryCustomerMarker =
        L.marker(
            [
                selectedCustomerLocation.lat,
                selectedCustomerLocation.lng
            ]
        )
        .addTo(map)
        .bindPopup(
            "Selected Customer Location"
        )
        .openPopup();


    customerLocationInfo.textContent =
        "Selected: " +
        selectedCustomerLocation.address;


    map.setView(
        [
            selectedCustomerLocation.lat,
            selectedCustomerLocation.lng
        ],
        16
    );


    selectionMode = null;

    map.getContainer().style.cursor =
        "";
}


// ==========================================
// 8. SELECT LOCATIONS FROM MAP
// ==========================================

warehouseBtn.addEventListener(
    "click",
    function () {

        selectionMode =
            "warehouse";


        warehouseInfo.textContent =
            "Click on the map to select warehouse location.";


        map.getContainer().style.cursor =
            "crosshair";
    }
);


customerLocationBtn.addEventListener(
    "click",
    function () {

        selectionMode =
            "customer";


        customerLocationInfo.textContent =
            "Click on the map to select customer location.";


        map.getContainer().style.cursor =
            "crosshair";
    }
);


// Map click

map.on(
    "click",
    function (event) {

        if (
            selectionMode ===
            "warehouse"
        ) {

            setWarehouseLocation(
                event.latlng.lat,
                event.latlng.lng
            );
        }

        else if (
            selectionMode ===
            "customer"
        ) {

            setCustomerLocation(
                event.latlng.lat,
                event.latlng.lng
            );
        }
    }
);


// ==========================================
// 9. DEBOUNCE
//
// Prevents Geoapify request after every
// single keyboard press.
// ==========================================

function debounce(
    callback,
    delay
) {

    let timer;


    return function (...args) {

        clearTimeout(timer);


        timer =
            setTimeout(
                function () {

                    callback(...args);

                },
                delay
            );
    };
}


// ==========================================
// 10. PROTECT HTML OUTPUT
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


// ==========================================
// 11. GEOAPIFY ADDRESS AUTOCOMPLETE
// ==========================================

function setupAutocomplete(
    inputElement,
    suggestionsElement,
    locationSelectedCallback
) {

    let controller = null;


    const searchAddress =
        debounce(
            async function () {

                const searchText =
                    inputElement
                        .value
                        .trim();


                if (
                    searchText.length < 3
                ) {

                    suggestionsElement
                        .innerHTML = "";

                    return;
                }


                if (
                    !GEOAPIFY_API_KEY ||

                    GEOAPIFY_API_KEY ===
                    "PASTE_YOUR_GEOAPIFY_API_KEY_HERE"
                ) {

                    suggestionsElement.innerHTML =
                        `
                        <div class="search-message">
                            Add your Geoapify API key in script.js.
                        </div>
                        `;

                    return;
                }


                // Cancel previous request

                if (controller) {

                    controller.abort();
                }


                controller =
                    new AbortController();


                suggestionsElement.innerHTML =
                    `
                    <div class="search-message">
                        Searching...
                    </div>
                    `;


                try {

                    const url =

                        "https://api.geoapify.com/v1/geocode/autocomplete"

                        +

                        "?text="

                        +

                        encodeURIComponent(
                            searchText
                        )

                        +

                        "&format=json"

                        +

                        "&limit=6"

                        +

                        "&filter=countrycode:in"

                        +

                        "&lang=en"

                        +

                        "&apiKey="

                        +

                        encodeURIComponent(
                            GEOAPIFY_API_KEY
                        );


                    const response =
                        await fetch(
                            url,
                            {
                                signal:
                                    controller.signal
                            }
                        );


                    if (!response.ok) {

                        const errorText =
                            await response.text();


                        console.error(
                            "Geoapify autocomplete error:",
                            response.status,
                            errorText
                        );


                        throw new Error(
                            "Location search failed."
                        );
                    }


                    const data =
                        await response.json();


                    showSuggestions(

                        data.results || [],

                        inputElement,

                        suggestionsElement,

                        locationSelectedCallback
                    );
                }

                catch (error) {

                    if (
                        error.name ===
                        "AbortError"
                    ) {

                        return;
                    }


                    console.error(
                        "Autocomplete error:",
                        error
                    );


                    suggestionsElement.innerHTML =
                        `
                        <div class="search-message">
                            Unable to search location.
                        </div>
                        `;
                }

            },
            400
        );


    inputElement.addEventListener(
        "input",
        searchAddress
    );
}


// ==========================================
// 12. SHOW ADDRESS SUGGESTIONS
// ==========================================

function showSuggestions(
    results,
    inputElement,
    suggestionsElement,
    locationSelectedCallback
) {

    suggestionsElement.innerHTML =
        "";


    if (
        results.length === 0
    ) {

        suggestionsElement.innerHTML =
            `
            <div class="search-message">
                No locations found.
            </div>
            `;

        return;
    }


    results.forEach(
        function (result) {

            const suggestion =
                document.createElement(
                    "div"
                );


            suggestion.className =
                "suggestion-item";


            const mainAddress =

                result.address_line1

                ||

                result.name

                ||

                result.formatted

                ||

                "Location";


            const secondaryAddress =

                result.address_line2

                ||

                result.city

                ||

                result.state

                ||

                "";


            suggestion.innerHTML =
                `
                <div class="suggestion-main">
                    ${escapeHTML(
                        mainAddress
                    )}
                </div>

                <div class="suggestion-secondary">
                    ${escapeHTML(
                        secondaryAddress
                    )}
                </div>
                `;


            suggestion.addEventListener(
                "click",
                function () {

                    const address =

                        result.formatted

                        ||

                        mainAddress;


                    inputElement.value =
                        address;


                    suggestionsElement.innerHTML =
                        "";


                    locationSelectedCallback(

                        Number(
                            result.lat
                        ),

                        Number(
                            result.lon
                        ),

                        address
                    );
                }
            );


            suggestionsElement.appendChild(
                suggestion
            );
        }
    );
}


// Warehouse search

setupAutocomplete(

    warehouseSearch,

    warehouseSuggestions,

    function (
        lat,
        lng,
        address
    ) {

        setWarehouseLocation(
            lat,
            lng,
            address
        );
    }
);


// Customer search

setupAutocomplete(

    customerSearch,

    customerSuggestions,

    function (
        lat,
        lng,
        address
    ) {

        setCustomerLocation(
            lat,
            lng,
            address
        );
    }
);


// ==========================================
// 13. ADD CUSTOMER
// ==========================================

addCustomerBtn.addEventListener(
    "click",
    function () {

        const customerName =

            customerNameInput
                .value
                .trim();


        if (
            customerName === ""
        ) {

            alert(
                "Please enter customer name."
            );

            return;
        }


        if (
            !selectedCustomerLocation
        ) {

            alert(
                "Please search or select customer location."
            );

            return;
        }


        const marker =
            temporaryCustomerMarker;


        marker.bindPopup(

            "<b>"

            +

            escapeHTML(
                customerName
            )

            +

            "</b><br>"

            +

            escapeHTML(
                selectedCustomerLocation
                    .address
            )
        );


        customers.push(
            {

                id:
                    customerId,

                name:
                    customerName,

                lat:
                    selectedCustomerLocation.lat,

                lng:
                    selectedCustomerLocation.lng,

                address:
                    selectedCustomerLocation.address,

                marker:
                    marker
            }
        );


        customerId++;


        temporaryCustomerMarker =
            null;


        selectedCustomerLocation =
            null;


        customerNameInput.value =
            "";


        customerSearch.value =
            "";


        customerSuggestions.innerHTML =
            "";


        customerLocationInfo.textContent =
            "No location selected";


        resetOptimizationState();

        removeExistingRoute();

        displayCustomers();
    }
);


// ==========================================
// 14. DISPLAY CUSTOMER LIST
// ==========================================

function displayCustomers() {

    customerList.innerHTML =
        "";


    if (
        customers.length === 0
    ) {

        customerList.innerHTML =
            `
            <p class="empty-message">
                No customers added yet.
            </p>
            `;

        return;
    }


    customers.forEach(
        function (
            customer,
            index
        ) {

            const customerDiv =
                document.createElement(
                    "div"
                );


            customerDiv.className =
                "customer-row customer-item";


            customerDiv.innerHTML =
                `
                <div class="customer-details">

                    <strong>
                        ${index + 1}.
                        ${escapeHTML(
                            customer.name
                        )}
                    </strong>

                    <span class="customer-address">
                        ${escapeHTML(
                            customer.address
                        )}
                    </span>

                    <span class="customer-coordinate">
                        ${customer.lat.toFixed(5)},
                        ${customer.lng.toFixed(5)}
                    </span>

                </div>

                <button
                    class="remove-customer"
                    data-id="${customer.id}"
                >
                    Remove
                </button>
                `;


            customerList.appendChild(
                customerDiv
            );
        }
    );
}


// Initial empty list

displayCustomers();


// ==========================================
// 15. REMOVE ONE CUSTOMER
// ==========================================

customerList.addEventListener(
    "click",
    function (event) {

        if (
            !event.target
                .classList
                .contains(
                    "remove-customer"
                )
        ) {

            return;
        }


        const id =
            Number(
                event.target
                    .dataset
                    .id
            );


        const customer =
            customers.find(
                function (item) {

                    return (
                        item.id === id
                    );
                }
            );


        if (
            customer &&
            customer.marker &&
            map.hasLayer(
                customer.marker
            )
        ) {

            map.removeLayer(
                customer.marker
            );
        }


        customers =
            customers.filter(
                function (item) {

                    return (
                        item.id !== id
                    );
                }
            );


        resetOptimizationState();

        removeExistingRoute();

        displayCustomers();
    }
);


// ==========================================
// 16. CLEAR ALL CUSTOMERS
// ==========================================

clearCustomersBtn.addEventListener(
    "click",
    function () {

        customers.forEach(
            function (customer) {

                if (
                    customer.marker &&
                    map.hasLayer(
                        customer.marker
                    )
                ) {

                    map.removeLayer(
                        customer.marker
                    );
                }
            }
        );


        customers = [];


        if (
            temporaryCustomerMarker &&
            map.hasLayer(
                temporaryCustomerMarker
            )
        ) {

            map.removeLayer(
                temporaryCustomerMarker
            );
        }


        temporaryCustomerMarker =
            null;


        selectedCustomerLocation =
            null;


        customerNameInput.value =
            "";


        customerSearch.value =
            "";


        customerSuggestions.innerHTML =
            "";


        customerLocationInfo.textContent =
            "No location selected";


        resetOptimizationState();

        removeExistingRoute();

        displayCustomers();
    }
);


// ==========================================
// 17. ROUTE VISUAL CLEANUP
//
// The normal blue Leaflet pins are hidden
// after optimization so numbered route stops
// remain easy to see.
// ==========================================

function hideInputMarkersForOptimizedRoute() {

    if (
        warehouseMarker &&
        map.hasLayer(
            warehouseMarker
        )
    ) {

        map.removeLayer(
            warehouseMarker
        );
    }


    customers.forEach(
        function (customer) {

            if (
                customer.marker &&
                map.hasLayer(
                    customer.marker
                )
            ) {

                map.removeLayer(
                    customer.marker
                );
            }
        }
    );


    if (
        temporaryCustomerMarker &&
        map.hasLayer(
            temporaryCustomerMarker
        )
    ) {

        map.removeLayer(
            temporaryCustomerMarker
        );
    }
}


// Restore normal markers when route changes

function restoreInputMarkers() {

    if (
        warehouseMarker &&
        warehouse &&
        !map.hasLayer(
            warehouseMarker
        )
    ) {

        warehouseMarker.addTo(map);
    }


    customers.forEach(
        function (customer) {

            if (
                customer.marker &&
                !map.hasLayer(
                    customer.marker
                )
            ) {

                customer.marker.addTo(map);
            }
        }
    );


    if (
        temporaryCustomerMarker &&
        selectedCustomerLocation &&
        !map.hasLayer(
            temporaryCustomerMarker
        )
    ) {

        temporaryCustomerMarker
            .addTo(map);
    }
}


// Remove old optimized route

function removeExistingRoute() {

    if (routeLine) {

        map.removeLayer(
            routeLine
        );

        routeLine = null;
    }


    routeDecorationLayer
        .clearLayers();


    restoreInputMarkers();
}


// ==========================================
// 18. NUMBERED DELIVERY STOPS
//
// Warehouse = home icon
// Customers = 1, 2, 3 ...
// Last customer = LAST
// ==========================================

function drawRouteSequenceMarkers(
    orderedLocations
) {

    orderedLocations.forEach(
        function (
            location,
            index
        ) {

            const isWarehouse =
                index === 0;


            const isLast =

                index ===
                orderedLocations.length - 1;


            const markerHTML =

                isWarehouse

                    ?

                    `
                    <div class="route-start-marker">
                        ⌂
                    </div>
                    `

                    :

                    `
                    <div class="route-number-marker">
                        ${index}
                    </div>
                    `;


            const icon =
                L.divIcon(
                    {

                        className:
                            "route-stop-icon",

                        html:
                            markerHTML,

                        iconSize:
                            [30, 30],

                        iconAnchor:
                            [15, 15],

                        popupAnchor:
                            [0, -18]
                    }
                );


            const marker =
                L.marker(
                    [
                        location.lat,
                        location.lng
                    ],
                    {

                        icon:
                            icon,

                        zIndexOffset:
                            5000
                    }
                );


            if (isWarehouse) {

                marker.bindPopup(

                    "<strong>Route Start — Warehouse</strong><br>"

                    +

                    escapeHTML(
                        location.address ||
                        "Warehouse"
                    )
                );
            }

            else {

                marker.bindPopup(

                    "<strong>Stop "

                    +

                    index

                    +

                    ": "

                    +

                    escapeHTML(
                        location.name ||
                        "Customer"
                    )

                    +

                    "</strong><br>"

                    +

                    escapeHTML(
                        location.address ||
                        ""
                    )

                    +

                    (
                        isLast

                            ?

                            "<br><strong>Final Delivery</strong>"

                            :

                            ""
                    )
                );
            }


            marker.addTo(
                routeDecorationLayer
            );


            // LAST badge

            if (
                isLast &&
                !isWarehouse
            ) {

                const lastIcon =
                    L.divIcon(
                        {

                            className:
                                "route-last-label-icon",

                            html:
                                `
                                <div class="route-last-label">
                                    LAST
                                </div>
                                `,

                            iconSize:
                                [42, 18],

                            iconAnchor:
                                [-7, 20]
                        }
                    );


                L.marker(
                    [
                        location.lat,
                        location.lng
                    ],
                    {

                        icon:
                            lastIcon,

                        interactive:
                            false,

                        keyboard:
                            false,

                        zIndexOffset:
                            4900
                    }
                )
                .addTo(
                    routeDecorationLayer
                );
            }
        }
    );
}


// ==========================================
// 19. GET GEOJSON ROAD COORDINATES
//
// GeoJSON uses:
// [longitude, latitude]
// ==========================================

function getRouteCoordinateLines(
    routeData
) {

    const lines = [];


    routeData.features.forEach(
        function (feature) {

            if (
                !feature.geometry
            ) {

                return;
            }


            if (
                feature.geometry.type ===
                "LineString"
            ) {

                lines.push(
                    feature.geometry.coordinates
                );
            }


            else if (
                feature.geometry.type ===
                "MultiLineString"
            ) {

                feature.geometry.coordinates
                    .forEach(
                        function (line) {

                            lines.push(
                                line
                            );
                        }
                    );
            }
        }
    );


    return lines.filter(
        function (line) {

            return (
                Array.isArray(line) &&
                line.length >= 3
            );
        }
    );
}


// ==========================================
// 20. CALCULATE DIRECTION / BEARING
// ==========================================

function calculateBearing(
    lat1,
    lng1,
    lat2,
    lng2
) {

    const toRadians =
        function (degrees) {

            return (
                degrees *
                Math.PI /
                180
            );
        };


    const latitude1 =
        toRadians(
            lat1
        );


    const latitude2 =
        toRadians(
            lat2
        );


    const longitudeDifference =
        toRadians(
            lng2 - lng1
        );


    const y =

        Math.sin(
            longitudeDifference
        )

        *

        Math.cos(
            latitude2
        );


    const x =

        Math.cos(
            latitude1
        )

        *

        Math.sin(
            latitude2
        )

        -

        Math.sin(
            latitude1
        )

        *

        Math.cos(
            latitude2
        )

        *

        Math.cos(
            longitudeDifference
        );


    const bearing =

        Math.atan2(
            y,
            x
        )

        *

        180

        /

        Math.PI;


    return (
        bearing + 360
    ) % 360;
}


// ==========================================
// 21. ROUTE DIRECTION ARROWS
//
// White arrows are drawn directly on the
// blue actual road route.
// ==========================================

function drawRouteDirectionArrows(
    routeData
) {

    const coordinateLines =
        getRouteCoordinateLines(
            routeData
        );


    if (
        coordinateLines.length === 0
    ) {

        return;
    }


    const totalPoints =

        coordinateLines.reduce(
            function (
                sum,
                line
            ) {

                return (
                    sum +
                    line.length
                );
            },
            0
        );


    /*
       Automatically chooses the number of
       arrows according to route size.
    */

    const desiredArrowCount =

        Math.min(

            22,

            Math.max(
                8,
                Math.floor(
                    totalPoints / 14
                )
            )
        );


    const globalStep =

        Math.max(

            3,

            Math.floor(
                totalPoints /
                desiredArrowCount
            )
        );


    let pointCounter = 0;

    let arrowsAdded = 0;


    coordinateLines.forEach(
        function (line) {

            for (
                let i = 1;
                i < line.length - 1;
                i++
            ) {

                pointCounter++;


                if (
                    pointCounter %
                    globalStep !== 0
                ) {

                    continue;
                }


                if (
                    arrowsAdded >=
                    desiredArrowCount
                ) {

                    return;
                }


                const previous =
                    line[i - 1];


                const current =
                    line[i];


                const next =
                    line[i + 1];


                const bearing =
                    calculateBearing(

                        previous[1],
                        previous[0],

                        next[1],
                        next[0]
                    );


                /*
                   ▶ normally points right/east.
                   Geographic bearing begins north.
                */

                const rotation =
                    bearing - 90;


                const arrowIcon =
                    L.divIcon(
                        {

                            className:
                                "route-arrow-map-icon",

                            html:

                                `
                                <div
                                    class="route-map-arrow"
                                    style="
                                        transform:
                                        rotate(${rotation}deg);
                                    "
                                >
                                    ▶
                                </div>
                                `,

                            iconSize:
                                [12, 12],

                            iconAnchor:
                                [6, 6]
                        }
                    );


                L.marker(
                    [
                        current[1],
                        current[0]
                    ],
                    {

                        icon:
                            arrowIcon,

                        interactive:
                            false,

                        keyboard:
                            false,

                        zIndexOffset:
                            4200
                    }
                )
                .addTo(
                    routeDecorationLayer
                );


                arrowsAdded++;
            }
        }
    );
}


// ==========================================
// 22. DRAW ACTUAL ROAD ROUTE
//
// Java decides optimized customer order.
// Geoapify then provides actual road geometry.
// ==========================================

async function drawActualRoadRoute(
    orderedLocations
) {

    const waypoints =

        orderedLocations

            .map(
                function (location) {

                    return (
                        `${location.lat},${location.lng}`
                    );
                }
            )

            .join("|");


    const url =

        "https://api.geoapify.com/v1/routing"

        +

        "?waypoints="

        +

        encodeURIComponent(
            waypoints
        )

        +

        "&mode=drive"

        +

        "&apiKey="

        +

        encodeURIComponent(
            GEOAPIFY_API_KEY
        );


    const response =
        await fetch(
            url
        );


    if (!response.ok) {

        const errorText =
            await response.text();


        console.error(

            "Geoapify Routing Error:",

            response.status,

            errorText
        );


        throw new Error(
            "Unable to load the actual road route."
        );
    }


    const routeData =
        await response.json();


    if (
        !routeData.features ||
        routeData.features.length === 0
    ) {

        throw new Error(
            "No road route was returned."
        );
    }


    /*
       Remove previous route.
    */

    removeExistingRoute();


    /*
       Hide original blue Leaflet pins.
       Only numbered route markers remain.
    */

    hideInputMarkersForOptimizedRoute();


    /*
       Draw actual road route.
    */

    routeLine =
        L.geoJSON(
            routeData,
            {

                style: {

                    color:
                        "#2563eb",

                    weight:
                        6,

                    opacity:
                        0.95,

                    lineCap:
                        "round",

                    lineJoin:
                        "round"
                }
            }
        )
        .addTo(map);


    /*
       Orange numbered stops.
    */

    drawRouteSequenceMarkers(
        orderedLocations
    );


    /*
       White direction arrows.
    */

    drawRouteDirectionArrows(
        routeData
    );


    /*
       Fit whole route into map.
    */

    const bounds =
        routeLine.getBounds();


    if (
        bounds.isValid()
    ) {

        map.fitBounds(
            bounds,
            {
                padding:
                    [40, 40]
            }
        );
    }
}


// ==========================================
// 23. CSV ADDRESS GEOCODING
//
// Converts text address into lat/lng.
// ==========================================

async function geocodeCustomerAddress(
    address
) {

    const url =

        "https://api.geoapify.com/v1/geocode/search"

        +

        "?text="

        +

        encodeURIComponent(
            address
        )

        +

        "&format=json"

        +

        "&limit=1"

        +

        "&filter=countrycode:in"

        +

        "&apiKey="

        +

        encodeURIComponent(
            GEOAPIFY_API_KEY
        );


    const response =
        await fetch(
            url
        );


    if (!response.ok) {

        throw new Error(

            "Unable to geocode address: "

            +

            address
        );
    }


    const data =
        await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {

        return null;
    }


    return {

        lat:
            Number(
                data.results[0].lat
            ),

        lng:
            Number(
                data.results[0].lon
            ),

        address:
            data.results[0].formatted
            ||
            address
    };
}


// ==========================================
// 24. CSV BULK IMPORT
//
// Required CSV:
//
// name,address
// Aman,Kanke Road Ranchi
// ==========================================

if (importCsvBtn) {

    importCsvBtn.addEventListener(
        "click",
        function () {

            const file =
                csvFileInput.files[0];


            if (!file) {

                csvStatus.textContent =
                    "Please choose a CSV file first.";

                return;
            }


            if (
                typeof Papa ===
                "undefined"
            ) {

                csvStatus.textContent =
                    "Papa Parse library is not loaded.";

                return;
            }


            csvStatus.textContent =
                "Importing customers...";


            importCsvBtn.disabled =
                true;


            Papa.parse(
                file,
                {

                    header:
                        true,

                    skipEmptyLines:
                        true,


                    complete:
                        async function (
                            results
                        ) {

                            let added = 0;

                            let failed = 0;


                            try {

                                for (
                                    const row
                                    of results.data
                                ) {

                                    const customerName =

                                        String(
                                            row.name || ""
                                        )
                                        .trim();


                                    const customerAddress =

                                        String(
                                            row.address || ""
                                        )
                                        .trim();


                                    if (
                                        !customerName ||
                                        !customerAddress
                                    ) {

                                        failed++;

                                        continue;
                                    }


                                    try {

                                        const location =

                                            await geocodeCustomerAddress(
                                                customerAddress
                                            );


                                        if (!location) {

                                            failed++;

                                            continue;
                                        }


                                        const marker =

                                            L.marker(
                                                [
                                                    location.lat,
                                                    location.lng
                                                ]
                                            )

                                            .addTo(map)

                                            .bindPopup(

                                                "<b>"

                                                +

                                                escapeHTML(
                                                    customerName
                                                )

                                                +

                                                "</b><br>"

                                                +

                                                escapeHTML(
                                                    location.address
                                                )
                                            );


                                        customers.push(
                                            {

                                                id:
                                                    customerId,

                                                name:
                                                    customerName,

                                                lat:
                                                    location.lat,

                                                lng:
                                                    location.lng,

                                                address:
                                                    location.address,

                                                marker:
                                                    marker
                                            }
                                        );


                                        customerId++;

                                        added++;
                                    }

                                    catch (error) {

                                        console.error(

                                            "CSV customer import error:",

                                            error
                                        );


                                        failed++;
                                    }
                                }


                                resetOptimizationState();

                                removeExistingRoute();

                                displayCustomers();


                                csvStatus.textContent =

                                    added

                                    +

                                    " customers imported. "

                                    +

                                    failed

                                    +

                                    " failed.";
                            }

                            finally {

                                importCsvBtn.disabled =
                                    false;
                            }
                        },


                    error:
                        function (error) {

                            console.error(
                                "CSV parsing error:",
                                error
                            );


                            csvStatus.textContent =
                                "Unable to read the CSV file.";


                            importCsvBtn.disabled =
                                false;
                        }
                }
            );
        }
    );
}


// ==========================================
// 25. OPTIMIZE ROUTE
//
// FRONTEND
//       ↓ POST
// /api/routing/optimize
//       ↓
// Spring Boot
//       ↓
// Geoapify Road Matrix
//       ↓
// Java Nearest Neighbor + 2-Opt
// ==========================================

optimizeBtn.addEventListener(
    "click",
    async function () {

        if (!warehouse) {

            alert(
                "Please select warehouse location."
            );

            return;
        }


        if (
            customers.length === 0
        ) {

            alert(
                "Please add at least one customer."
            );

            return;
        }


        const originalButtonText =
            optimizeBtn.textContent;


        optimizeBtn.disabled =
            true;


        optimizeBtn.textContent =
            "Optimizing road route...";


        try {

            /*
               Create backend location list.

               Index 0 = Warehouse
               Index 1+ = Customers
            */

            const allLocations = [

                {

                    latitude:
                        warehouse.lat,

                    longitude:
                        warehouse.lng
                },


                ...customers.map(
                    function (customer) {

                        return {

                            latitude:
                                customer.lat,

                            longitude:
                                customer.lng
                        };
                    }
                )
            ];


            const response =

                await fetch(

                    "https://last-mile-delivery-optimizer.onrender.com/api/routing/optimize",

                    

                    {

                        method:
                            "POST",


                        headers: {

                            "Content-Type":
                                "application/json"
                        },


                        body:
                            JSON.stringify(
                                {

                                    locations:
                                        allLocations
                                }
                            )
                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(

                    "Backend Optimization Error:",

                    response.status,

                    errorText
                );


                throw new Error(
                    "Backend route optimization failed."
                );
            }


            const result =
                await response.json();


            console.log(
                "Optimized Route Result:",
                result
            );


            if (
                !Array.isArray(
                    result.order
                )

                ||

                result.order.length === 0
            ) {

                throw new Error(
                    "Backend returned an invalid route order."
                );
            }


            /*
               Convert backend index order
               into real location objects.
            */

            const orderedLocations =

                result.order.map(
                    function (index) {

                        /*
                           Index 0 always means
                           warehouse.
                        */

                        if (
                            index === 0
                        ) {

                            return {

                                name:
                                    "Warehouse",

                                address:
                                    warehouse.address
                                    ||
                                    "Warehouse",

                                lat:
                                    warehouse.lat,

                                lng:
                                    warehouse.lng
                            };
                        }


                        /*
                           Customer index is
                           backend index - 1.
                        */

                        const customer =

                            customers[
                                index - 1
                            ];


                        if (!customer) {

                            throw new Error(
                                "Invalid customer index returned by backend."
                            );
                        }


                        return {

                            name:
                                customer.name,

                            address:
                                customer.address
                                ||
                                "",

                            lat:
                                customer.lat,

                            lng:
                                customer.lng
                        };
                    }
                );


            /*
               Store optimized route for
               Send Route to Driver button.
            */

            lastOptimizedLocations =
                orderedLocations;


            lastOptimizationResult =
                result;


            savedRouteIdForCurrentOptimization =
                null;


            if (sendToDriverBtn) {

                sendToDriverBtn.style.display =
                    "flex";
            }


            if (driverRouteStatus) {

                driverRouteStatus.textContent =
                    "";

                driverRouteStatus.style.color =
                    "";
            }


            /*
               Display route text.
            */

            const routeNames =

                orderedLocations.map(
                    function (location) {

                        return (
                            location.name
                        );
                    }
                );


            routeResult.textContent =

                routeNames.join(
                    " → "
                )

                +

                " | Estimated driving time: "

                +

                result.totalTimeMinutes

                +

                " min";


            /*
               Display total actual
               road distance.
            */

            distanceResult.textContent =

                Number(
                    result.totalDistanceKm
                )
                .toFixed(2)

                +

                " km";


            /*
               Draw actual road route,
               numbers and arrows.
            */

            await drawActualRoadRoute(
                orderedLocations
            );
        }


        catch (error) {

            console.error(
                "Optimization Error:",
                error
            );


            routeResult.textContent =

                "Unable to optimize route. "

                +

                "Make sure Spring Boot is running.";


            alert(

                "Route optimization failed. "

                +

                "Check the browser console and Spring Boot terminal."
            );
        }


        finally {

            optimizeBtn.disabled =
                false;


            optimizeBtn.textContent =
                originalButtonText;
        }
    }
);


// ==========================================
// 26. SEND ROUTE TO DRIVER / SAVE MYSQL
//
// Frontend
//    ↓ POST
// /api/delivery-routes
//    ↓
// Spring Boot
//    ↓
// DeliveryRouteService
//    ↓
// JPA Repository
//    ↓
// MySQL
// ==========================================

if (sendToDriverBtn) {

    sendToDriverBtn.addEventListener(
        "click",
        async function () {

            if (
                !lastOptimizationResult

                ||

                lastOptimizedLocations.length ===
                0
            ) {

                driverRouteStatus.style.color =
                    "#ef4444";


                driverRouteStatus.textContent =
                    "Please optimize the route first.";


                return;
            }


            /*
               Prevent duplicate route rows
               if button is clicked twice.
            */

            if (
                savedRouteIdForCurrentOptimization
                !==
                null
            ) {

                driverRouteStatus.style.color =
                    "#16806f";


                driverRouteStatus.textContent =

                    "✓ Route already saved. Route ID: "

                    +

                    savedRouteIdForCurrentOptimization;


                return;
            }


            const warehouseLocation =
                lastOptimizedLocations[0];


            /*
               Warehouse is index 0.

               Everything after that becomes
               a DeliveryStop.
            */

            const deliveryStops =

                lastOptimizedLocations

                    .slice(1)

                    .map(
                        function (
                            location,
                            index
                        ) {

                            return {

                                stopOrder:
                                    index + 1,

                                customerName:
                                    location.name
                                    ||
                                    "Customer",

                                address:
                                    location.address
                                    ||
                                    "",

                                latitude:
                                    location.lat,

                                longitude:
                                    location.lng
                            };
                        }
                    );


            /*
               JSON sent to Spring Boot.
            */

            const routeData = {

                warehouseAddress:
                    warehouseLocation.address
                    ||
                    "Warehouse",


                warehouseLatitude:
                    warehouseLocation.lat,


                warehouseLongitude:
                    warehouseLocation.lng,


                totalDistanceKm:
                    lastOptimizationResult
                        .totalDistanceKm,


                totalTimeMinutes:
                    lastOptimizationResult
                        .totalTimeMinutes,


                stops:
                    deliveryStops
            };


            console.log(

                "Sending optimized route to Spring Boot:",

                routeData
            );


            try {

                sendToDriverBtn.disabled =
                    true;


                sendToDriverBtn.textContent =
                    "Saving Route...";


                driverRouteStatus.style.color =
                    "#6b7280";


                driverRouteStatus.textContent =
                    "Saving optimized route...";


                const response =

                    await fetch(
                                "https://last-mile-delivery-optimizer.onrender.com/api/delivery-routes",
                        

                        {

                            method:
                                "POST",


                            headers: {

                                "Content-Type":
                                    "application/json"
                            },


                            body:
                                JSON.stringify(
                                    routeData
                                )
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();


                    console.error(

                        "Delivery Route Save Error:",

                        response.status,

                        errorText
                    );


                    throw new Error(

                        "Server returned "

                        +

                        response.status
                    );
                }


                const savedRoute =
                    await response.json();


                savedRouteIdForCurrentOptimization =
                    savedRoute.routeId;


                console.log(
                    "Saved delivery route:",
                    savedRoute
                );


                /*
                   SUCCESS MESSAGE

                   No alert popup.
                   Message appears inside webpage.
                */

                driverRouteStatus.style.color =
                    "#16806f";


                driverRouteStatus.textContent =

                    "✓ Route saved successfully. Route ID: "

                    +

                    savedRoute.routeId;
            }


            catch (error) {

                console.error(
                    "Send to Driver Error:",
                    error
                );


                /*
                   ERROR MESSAGE

                   Also displayed inside website,
                   not browser popup.
                */

                driverRouteStatus.style.color =
                    "#ef4444";


                driverRouteStatus.textContent =

                    "Unable to save route. "

                    +

                    "Check Spring Boot and MySQL.";
            }


            finally {

                sendToDriverBtn.disabled =
                    false;


                sendToDriverBtn.innerHTML =
                    "<span>🚚</span> Send Route to Driver";
            }
        }
    );
}


// ==========================================
// 27. CLOSE AUTOCOMPLETE ON OUTSIDE CLICK
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !warehouseSearch
                .contains(
                    event.target
                )

            &&

            !warehouseSuggestions
                .contains(
                    event.target
                )
        ) {

            warehouseSuggestions.innerHTML =
                "";
        }


        if (
            !customerSearch
                .contains(
                    event.target
                )

            &&

            !customerSuggestions
                .contains(
                    event.target
                )
        ) {

            customerSuggestions.innerHTML =
                "";
        }
    }
);
