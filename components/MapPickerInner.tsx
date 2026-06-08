"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MAP_REFERENCE_TILE_LAYER, SATELLITE_TILE_LAYER } from "./mapTiles";

export interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  centerLat?: number | null;
  centerLng?: number | null;
  zoom?: number;
  centerZoom?: number;
  label?: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

const BELEN_CENTER: [number, number] = [-27.6493, -67.0287];

function hasValidLatLng(lat: number | null | undefined, lng: number | null | undefined) {
  return (
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function getValidLatLng(lat: number | null | undefined, lng: number | null | undefined): [number, number] | null {
  return hasValidLatLng(lat, lng) ? [lat as number, lng as number] : null;
}

function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: false });
  }, [center, map, zoom]);

  return null;
}

function LocationMarker({
  lat,
  lng,
  onLocationSelect,
  label,
  icon,
}: {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  label: string;
  icon: L.Icon;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat !== null && lng !== null ? (
    <Marker
      position={[lat, lng]}
      icon={icon}
      draggable
      eventHandlers={{
        dragend(event) {
          const marker = event.target as L.Marker;
          const position = marker.getLatLng();
          onLocationSelect(position.lat, position.lng);
        },
      }}
    >
      <Popup>{label}</Popup>
    </Marker>
  ) : null;
}

export default function MapPicker({
  lat,
  lng,
  centerLat,
  centerLng,
  zoom = 13,
  centerZoom = 13,
  label = "Ubicacion seleccionada",
  onLocationSelect,
}: MapPickerProps) {
  const icon = useMemo<L.Icon | null>(() => {
    if (typeof window === "undefined") return null;
    return L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
  }, []);

  if (!icon) {
    return (
      <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--color-outline)]">
        <p className="text-[var(--color-on-surface-variant)]">Cargando mapa...</p>
      </div>
    );
  }

  const selectedPosition = getValidLatLng(lat, lng);
  const fallbackCenter = getValidLatLng(centerLat, centerLng);
  const center: [number, number] = selectedPosition ?? fallbackCenter ?? BELEN_CENTER;
  const mapZoom = selectedPosition ? zoom : centerZoom;

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[var(--color-outline)] z-0 relative">
      <MapContainer
        center={center}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <MapViewUpdater center={center} zoom={mapZoom} />
        <TileLayer
          attribution={SATELLITE_TILE_LAYER.attribution}
          url={SATELLITE_TILE_LAYER.url}
        />
        <TileLayer
          attribution={MAP_REFERENCE_TILE_LAYER.attribution}
          url={MAP_REFERENCE_TILE_LAYER.url}
        />
        <LocationMarker
          lat={selectedPosition ? selectedPosition[0] : null}
          lng={selectedPosition ? selectedPosition[1] : null}
          onLocationSelect={onLocationSelect}
          label={label}
          icon={icon}
        />
      </MapContainer>
    </div>
  );
}
