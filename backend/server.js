require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { loadData, getStores } = require("./dataLoader");

const app = express();
app.use(cors());
app.use(express.json());

let clusterIndex = null;
let Supercluster = null; 


function buildClusterIndex(stores) {
  const geoPoints = stores.map((store) => ({
    type: "Feature",
    properties: {
      cluster: false,
      storeId: store.id,
      brand: store.brand,
    },
    geometry: {
      type: "Point",
      coordinates: [store.lng, store.lat],
    },
  }));

  const index = new Supercluster({
    radius: 60,
    maxZoom: 16,
  });

  index.load(geoPoints);
  return index;
}


function getStateCounts(stores) {
  const stateMap = {};

  for (const s of stores) {
    if (!stateMap[s.state]) {
      stateMap[s.state] = {
        count: 0,
        latSum: 0,
        lngSum: 0,
      };
    }

    stateMap[s.state].count += 1;
    stateMap[s.state].latSum += s.lat;
    stateMap[s.state].lngSum += s.lng;
  }

  return Object.entries(stateMap).map(([state, data]) => ({
    state,
    count: data.count,
    lat: data.latSum / data.count,
    lng: data.lngSum / data.count,
  }));
}


function getPoints(stores, swLat, swLng, neLat, neLng) {
  return stores.filter(
    (s) =>
      s.lat >= swLat &&
      s.lat <= neLat &&
      s.lng >= swLng &&
      s.lng <= neLng
  );
}


app.get("/stores", async (req, res) => {
  try {
    const { neLat, neLng, swLat, swLng, zoom } = req.query;

    const parsedZoom = Number(zoom);

    const bounds = [
      Number(swLng),
      Number(swLat),
      Number(neLng),
      Number(neLat),
    ];

    const stores = getStores();

    if (parsedZoom <= 5) {
      const states = getStateCounts(stores);
      return res.json({ type: "state", data: states });
    }

    if (parsedZoom <= 10) {
      const clusters = clusterIndex.getClusters(bounds, parsedZoom);

      return res.json({
        type: "cluster",
        data: clusters,
      });
    }

    const points = getPoints(
      stores,
      Number(swLat),
      Number(swLng),
      Number(neLat),
      Number(neLng)
    );

    return res.json({ type: "point", data: points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await loadData();

  const stores = getStores();

  const superclusterModule = await import("supercluster");
  Supercluster = superclusterModule.default;

  clusterIndex = buildClusterIndex(stores);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();