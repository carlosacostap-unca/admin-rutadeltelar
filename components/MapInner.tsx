"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface MapProps {
  lat: number | string;
  lng: number | string;
  zoom?: number;
  label?: string;
}

export default function Map({ lat, lng, zoom = 13, label = "Ubicación" }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const icon = useMemo(() => {
    if (typeof window === "undefined") return null;

    return L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
  }, []);

  const parsedLat = typeof lat === "number" ? lat : Number(lat);
  const parsedLng = typeof lng === "number" ? lng : Number(lng);
  const hasValidCoordinates =
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    Math.abs(parsedLat) <= 90 &&
    Math.abs(parsedLng) <= 180;

  if (!isMounted || !icon) {
    return (
      <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--color-outline)]">
        <p className="text-[var(--color-on-surface-variant)]">Cargando mapa...</p>
      </div>
    );
  }

  if (!hasValidCoordinates) {
    return (
      <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--color-outline)]">
        <p className="text-[var(--color-on-surface-variant)]">Coordenadas no validas para mostrar el mapa.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[var(--color-outline)] z-0 relative">
      <MapContainer 
        center={[parsedLat, parsedLng]} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[parsedLat, parsedLng]} icon={icon}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
