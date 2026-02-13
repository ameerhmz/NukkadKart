# NukkadKart - Full Feature Documentation

This file details all the functions and features of the NukkadKart Progressive Web App.

## 1. User Roles & Authentication
- **Vendor Role**: Can manage products, toggle live location, view requests, and see analytics.
- **Customer Role**: Can view map, discover vendors, request items (specific/general), and view vendor profiles.
- **Authentication**: JWT-based login/registration. Secure routes based on roles.

## 2. Vendor Features
- **Dashboard**: Overview of sales, active items, and "Go Live" toggle.
- **Live Location**: Toggle to broadcast GPS coordinates. Updates in real-time.
- **Product Management**:
  - Add products via **Barcode Scanning** or Manual Entry.
  - Edit/Delete products.
  - Product fields: Name, Selling Price, Cost Price, Stock, Barcode, Vendor ID.
- **QR Profile**: Unique QR code for each vendor. Scanning opens vendor's public profile for customers.
- **Request Management**: Real-time notification of customer item requests. Accept/Decline status.

## 3. Customer Features
- **Map View**: Interactive map showing nearby *live* vendors.
- **Vendor Discovery**: Click on map pin to view vendor profile.
- **Item Requests**: "Request Item" feature. Sent to vendor instantly.
- **QR Scan**: Scan vendor QR to view their catalogue directly.

## 4. Location System
- **GeoJSON**: Store location as `{ type: "Point", coordinates: [long, lat] }`.
- **Real-time**: Use Socket.io to push location updates to active customers nearby.
- **Map Interface**: Leaflet or Google Maps integration.

## 5. Popularity System
- **Score Calculation**: Based on:
  - Number of completed requests.
  - Active hours online.
  - Profile visits (QR scans).
- **Badge**: "Trending Vendor" badge for top-scoring vendors.

## 6. Inventory System
- **Barcode Library**: Browser-based scanning (e.g., `html5-qrcode`).
- **Database**: Products stored in MongoDB.
- **Stock Tracking**: Auto-decrement stock on sale (future scope) or manual update.

## 7. Customer Request System
- **Flow**: Customer sends request -> Vendor receives notification -> Vendor accepts/declines.
- **Data**: Vendor ID, Customer ID, Item Name, Status (Pending/Accepted/Rejected), Timestamp.

## 8. Profit Tracking & Analytics
- **Metrics**: Daily Profit, Weekly Profit, Monthly Profit.
- **Calculation**: `(Selling Price - Cost Price) * Quantity`.
  - *Fallback*: If Cost Price is missing, assume 30% margin (`Selling Price * 0.30`).
- **Visualization**: Charts (Chart.js/Recharts) on Vendor Dashboard.

## 9. Technical Stack
- **Frontend**: React.js, Vite, TailwindCSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **Real-time**: Socket.io.
- **Deployment**: Vercel (Client), Render (Server).
