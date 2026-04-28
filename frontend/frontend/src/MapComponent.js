import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  OverlayView,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import debounce from "lodash.debounce";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 37.0902,
  lng: -95.7129,
};

export default function MapComponent() {
  const [data, setData] = useState([]);
  const [type, setType] = useState("state");
  const [zoom, setZoom] = useState(4);
  const [map, setMap] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const fetchData = async () => {
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const currentZoom = map.getZoom();

    try {
      const res = await axios.get("http://localhost:5000/stores", {
        params: {
          neLat: ne.lat(),
          neLng: ne.lng(),
          swLat: sw.lat(),
          swLng: sw.lng(),
          zoom: currentZoom,
        },
      });

      setData(res.data.data);
      setType(res.data.type);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchData, 300), [map]);

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const onIdle = () => {
    if (!map) return;

    const currentZoom = map.getZoom();

    if (currentZoom !== zoom) {
      setZoom(currentZoom);
      setData([]); 
    }

    debouncedFetch();
  };

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onIdle={onIdle}
    >
      {Array.isArray(data) &&
        data.map((item, i) => {
          const lat = item.lat || item.geometry?.coordinates?.[1];
          const lng = item.lng || item.geometry?.coordinates?.[0];

          if (!lat || !lng) return null;

          // -------- TIER 1 --------
          if (type === "state") {
            return (
              <OverlayView
                key={i}
                position={{ lat, lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid black",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  <div>{item.state?.slice(0, 2).toUpperCase()}</div>
                  <div style={{ color: "#777" }}>
                    {item.count > 1000
                      ? (item.count / 1000).toFixed(1) + "k"
                      : item.count}
                  </div>
                </div>
              </OverlayView>
            );
          }

          // -------- TIER 2 --------
          if (type === "cluster") {
            if (item.properties?.cluster) {
              const lat = item.geometry.coordinates[1];
              const lng = item.geometry.coordinates[0];

              return (
                <Marker
                  key={i}
                  position={{ lat, lng }}
                  label={{
                    text: `${item.properties.point_count}`,
                    color: "white",
                    fontSize: "12px",
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    // scale: Math.min(
                    //   25,
                    //   10 + item.properties.point_count / 100
                    // ),
                    scale: 20,
                    fillColor: "#000",
                    fillOpacity: 0.9,
                    strokeColor: "#ffff",
                    strokeWeight: 2,
                  }}
                  onClick={() => {
                    const lat = item.geometry.coordinates[1];
                    const lng = item.geometry.coordinates[0];
                    const count = item.properties.point_count;

                    let zoomIncrease = 2;

                    if (count < 10) zoomIncrease = 5;
                    else if (count < 50) zoomIncrease = 4;
                    else if (count < 100) zoomIncrease = 3;
                    else zoomIncrease = 2;

                    map.panTo({ lat, lng });
                    map.setZoom(map.getZoom() + zoomIncrease);
                 }}
                    // onClick={() => {
                    // const lat = item.geometry.coordinates[1];
                    // const lng = item.geometry.coordinates[0];

                    // setSelectedCluster({
                    //     count: item.properties.point_count,
                    // });

                    // map.panTo({ lat, lng });
                    // map.setZoom(map.getZoom() + 6);
                    // }}
                />
              );
            }
            return null;
          }

          // -------- TIER 3 --------
          if (type === "point") {
            return (
              <Marker
                // key={i}
                // position={{ lat, lng }}
                // icon={{
                //   url: item.brand
                //     ? `/logos/${item.brand}.png`
                //     : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                //   scaledSize: new window.google.maps.Size(30, 30),
                // }}
                key={i}
                position={{ lat, lng }}
                label={{
                    text: item.brand || "",
                    color: "black",
                    fontSize: "15px",
                    fontWeight: "bold",
                }}
                icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 20, // controls size
                    fillColor: "#ffffff",
                    fillOpacity: 0.9,
                    strokeColor: "#9c0303",
                    strokeWeight: 2,
                }}
                // onClick={() => {console.log("clicked", item); setSelectedStore(item)}}
                onClick={() => {
                    if (selectedStore?.id === item.id) {
                        setSelectedStore(null);
                    } else {
                        setSelectedStore(item); 
                    }
                }}
              />
            );

          }

          return null;
        })}

        {selectedStore && (
        <InfoWindow
            position={{
            lat: selectedStore.lat,
            lng: selectedStore.lng,
            }}
            onCloseClick={() => setSelectedStore(null)}
        >
            <div>
                <h4>Brand :</h4> {selectedStore.brand}
                <h4>Address :</h4><p> {selectedStore.city}, {selectedStore.state}</p>
                <h4>Status :</h4><p> {selectedStore.status}</p>
            </div>
        </InfoWindow>
        )}
    </GoogleMap>
  );
}