# Implementation Plan - NukkadKart
> "NukkadKart": Empowering Indian Street Vendors Digitally.

## Current Status (Completed Phases ✅)
- **Phase 1: Project Setup**: MERN Stack, Vite (React), TailwindCSS v4, i18n (Hindi/English).
- **Phase 2: Backend Core**: MongoDB connection, User/Product Models, JWT Auth (Vendor/Customer roles).
- **Phase 3: Vendor Features**:
  - Live Dashboard (Status toggle).
  - Product Management (Add/List/Edit).
  - Real-time Location Tracking (GPS + Socket.io).
- **Phase 4: Customer Features**:
  - Interactive Map (Google Maps API) with Live Vendor Pins.
  - Vendor Profiles & Menu.
  - "Request Item" feature with real-time notifications to vendors.

## Work Left (Pending & In-Progress 🚧)
- [x] **Backend Refactor**: Migration to ECMAScript Modules (ESM) `import`/`export`.
- **Analytics**: "Best Location" Heatmap (7-day sales avg) & Profit Tracking.
- **Advanced UI**: Trending/Popularity Badges, Animations, Responsive Mobile Layout Polish.
- **PWA**: Offline Capabilities & Installability.

## Suggested Features 💡
- **Smart Inventory**: Suggest restocking based on past sales trends.
- **Group Buying**: Allow customers in the same area to pool requests for bulk discounts.
- **Voice Commands**: Accessibility for vendors to add products via voice (Hindi/English).
- **QR Identity**: Generate printable QR codes for vendors to share their digital shop.

---

## 👥 Work Division

### Ameer (Backend & Logic Lead)
**Focus**: Server Architecture, Database, intricate Logic.
1.  **Refactor Backend to ESM**: Update `server/` to use `import`/`export`.
    -   *Crucial for modern Node.js features and consistency.*
2.  **Heatmap Logic**: Implement Aggregation Pipeline in MongoDB to calculate "Best Selling Locations".
3.  **Socket.io Optimization**: Ensure robust reconnection logic and room management.
4.  **Analytics API**: Create endpoints for Daily/Weekly profit charts.

### Harsh (Frontend & UI/UX Lead)
**Focus**: Client-side Experience, Visuals, Testing.
1.  **Vendor Heatmap UI**: Integrate Google Maps Heatmap Layer using the data from Ameer's API.
2.  **UI Polish**: Improve `CustomerMap` markers (custom icons), Vendor Profile aesthetics (animations), and Mobile Responsiveness.
3.  **PWA Setup**: Configure `manifest.json`, Service Workers for offline support.
4.  **Testing**:
    -   Simulate "Customer" flow: Login -> Map -> Request.
    -   Verify "Vendor" flow: Dashboard -> Receive Request -> Update Status.

---

## Improvements Needed 🛠
- **Security**: Rate limiting on API requests, Input validation (Zod/Joi).
- **Performance**: Lazy loading for Map components, specific bundle splitting.
- **Error Handling**: Better UI feedback (Toasts instead of Alerts).
