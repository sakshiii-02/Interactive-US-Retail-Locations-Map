const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

let stores = [];
let isLoaded = false;

function loadData() {
  if (isLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    stores = [];

    fs.createReadStream(path.join(__dirname, "my_pois.csv"))
      .pipe(csv())
      .on("data", (row) => {
        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        stores.push({
          id: row.id,
          lat,
          lng,
          state: row.state ? row.state.toLowerCase() : "",
          brand: row.brand_name || "",
          status: row.status,
          city: row.city,
        });
      })
      .on("end", () => {
        isLoaded = true;
        console.log("Data Loaded:", stores.length);
        resolve();
      })
      .on("error", reject);
  });
}

function getStores() {
  return stores;
}

module.exports = { loadData, getStores };