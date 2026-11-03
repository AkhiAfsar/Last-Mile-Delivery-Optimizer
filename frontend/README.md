# Last Mile Delivery Optimizer

A browser-based demo for managing delivery locations and finding a short route from a warehouse to customer stops.

## Features

- Set warehouse coordinates.
- Add and remove customers.
- View locations and the route on a chart.
- Calculate the route distance.
- Optimize routes for up to 9 customers. For larger lists, the app uses a nearest-neighbor approach.

## Run locally

No installation or build step is required. Open `frontend/index.html` in a browser.

The app uses:

- `frontend/index.html` — page entry point
- `frontend/style.css` — page styles
- `frontend/script.js` — dashboard and route logic

## Notes

Route distances are calculated using straight-line distance between coordinates. This demo does not use street maps, traffic data, or live delivery tracking.