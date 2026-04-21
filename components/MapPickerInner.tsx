"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  zoom?: number;
  label?: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onLocationSelect, label, icon }: { lat: number | null, lng: number | null, onLocationSelect: (lat: number, lng: number) => void, label: string, icon: L.Icon }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat !== null && lng !== null ? (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup>{label}</Popup>
    </Marker>
  ) : null;
}

export default function MapPicker({ lat, lng, zoom = 13, label = "Ubicación seleccionada", onLocationSelect }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const icon = useMemo(() => {
    if (typeof window === "undefined") return null as unknown as L.Icon;
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

  if (!isMounted || !icon) {
    return (
      <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--color-outline)]">
        <p className="text-[var(--color-on-surface-variant)]">Cargando mapa...</p>
      </div>
    );
  }

  const hasValidCoordinates =
    lat !== null &&
    lng !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  // Default center if no lat/lng is provided (e.g., Catamarca, Argentina as a sensible default for Ruta del Telar)
  const defaultCenter: [number, number] = [-27.4692, -65.7795];
  const center: [number, number] = hasValidCoordinates ? [lat, lng] : defaultCenter;
  const mapZoom = hasValidCoordinates ? zoom : 6;

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[var(--color-outline)] z-0 relative">
      <MapContainer 
        center={center} 
        zoom={mapZoom} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={hasValidCoordinates ? lat : null} lng={hasValidCoordinates ? lng : null} onLocationSelect={onLocationSelect} label={label} icon={icon} />
      </MapContainer>
    </div>
  );
}
