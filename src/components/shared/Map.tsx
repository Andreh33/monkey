"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ICON = L.divIcon({
  className: "custom-marker",
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#FF2A2A 0%,#FF8800 100%);border-radius:50%;border:3px solid #FAFAFA;box-shadow:0 0 20px rgba(255,42,42,0.6);display:flex;align-items:center;justify-content:center;color:#0A0A0C;font-weight:bold;font-family:monospace;font-size:14px;">M</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const POSITION: [number, number] = [41.1175, 1.2530];

export function ShopMap() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-border">
      <MapContainer center={POSITION} zoom={16} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={POSITION} icon={ICON}>
          <Popup>
            <strong>MonopatinShop</strong>
            <br />
            Venta y reparación de patinetes
            <br />
            C/ Jaume I, 5 · Tarragona
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
