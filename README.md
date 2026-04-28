# Interactive US Retail Locations Map

## 📌 Overview

This project is an interactive map that visualizes retail store locations across the United States using Google Maps. It efficiently handles large datasets (~150k records) using viewport-based fetching and clustering.

---

## 🚀 Features

### 🔹 Tier 1 (Zoom ≤ 5)

* Displays state-level aggregated store counts
* One marker per state (centroid-based)

### 🔹 Tier 2 (Zoom 6–10)

* Displays clustered markers using Supercluster
* Cluster size dynamically adjusts based on density
* Clicking cluster zooms into its expansion level

### 🔹 Tier 3 (Zoom > 10)

* Displays individual store markers
* Brand-based markers (logo/text)
* Click marker → InfoWindow popup with store details

---

## ⚡ Performance Optimizations

* Viewport-based API fetching
* Debounced API calls (300ms)
* Server-side clustering (Supercluster)
* Precomputed cluster index (built once at startup)
* Avoids fetching full dataset

---

## 🛠️ Tech Stack

### Frontend

* React
* @react-google-maps/api
* Axios
* Lodash.debounce

### Backend

* Node.js
* Express
* Supercluster

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <https://github.com/sakshiii-02/Interactive-US-Retail-Locations-Map>
cd interactive-map
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
```

Run:

```bash
node server.js
```

---

### 3. Frontend Setup

```bash
cd frontend/frontend
npm install
```

Create `.env`:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```

Run:

```bash
npm start
```

---

## 🌍 API Endpoints

### GET /stores

Returns data based on zoom level:

* `state` → aggregated state data
* `cluster` → clustered geojson
* `point` → individual stores

### GET /cluster-expansion

Returns optimal zoom level for cluster expansion

---

## 🤝 Trade-offs & Decisions

* Used in-memory dataset instead of database for speed (time constraint)
* Used Supercluster on backend for better scalability
* Approximate state centroid calculation (not geo-accurate polygons)
* Did not implement filters due to time constraint

---

## 🎥 Demo Video

https://www.loom.com/share/d5d2a3f430b44121a198fb52c8a0d30d
Transcript: 
Hi, this is my solution for the Interactive US Retail Map assignment. It handles large datasets using viewport-based fetching and clustering.
At low zoom, I show state-level aggregated counts.
At mid zoom, clustering is applied using Supercluster.
At deep zoom, individual stores are shown.
Clicking a marker shows store details in a popup.
Data is fetched based on the current viewport. We never load the entire dataset.

---

## ✅ Assignment Coverage

✔ Three zoom tiers implemented
✔ Viewport-based fetching
✔ Clustering implemented
✔ InfoWindow for store details
✔ Backend API optimized

---

## 🙌 Notes

This implementation focuses on performance, scalability, and clean architecture within the given time constraint.
