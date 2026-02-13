# Implementation Plan - NukkadKart

NukkadKart is a mobile-first Progressive Web App (PWA) designed to empower street vendors in India by helping them go digital.

## Tech Stack
- **Frontend**: React.js (Vite), TailwindCSS, i18next (Hindi/English).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (Mongoose).
- **Real-time**: Socket.io.
- **Maps**: Google Maps API.
- **Authentication**: JWT.

## Directory Structure
```text
NukkadKart/
├── client/         # React Frontend
├── server/         # Node/Express Backend
└── plan.md         # This file
```

## Phase 1: Project Setup & Dependencies
- Initialize Root & Directory Structure.
- Setup Server (Node/Express) & Install Backend Deps:
    - `express`, `mongoose`, `dotenv`, `cors`, `socket.io`, `jsonwebtoken`, `bcryptjs`.
- Setup Client (React/Vite) & Install Frontend Deps:
    - `axios`, `react-router-dom`, `socket.io-client`, `i18next`, `react-i18next`, `google-maps-react` (or similar), `chart.js`, `html5-qrcode`.
- Configure i18n skeleton.

## Phase 2: Backend Core
- Database Connection (MongoDB Atlas).
- User Models (Vendor/Customer).
- Auth Routes (JWT).

## Phase 3: Vendor Features
- Vendor Dashboard UI.
- Product Management (Add/Edit/Delete).
- GPS Location Logic.

## Phase 4: Customer Features
- Customer Map View.
- Vendor Discovery & Profile.

## Phase 5: Real-time & Advanced
- Socket.io Setup (Location/Requests).
- Analytics & Profit Tracking.
