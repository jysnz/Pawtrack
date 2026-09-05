"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons reference image files that Next.js's bundler
// doesn't resolve automatically. Point them at the CDN copies instead.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842]; // Manila, fallback

type LatLng = { lat: number; lng: number };

function LocationPicker({
  onPick,
}: {
  onPick: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function FoundPetMap({
  onLocationChange,
}: {
  onLocationChange: (pos: LatLng) => void;
}) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);

  // Try to center the map on the user's current location on load.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setCenter(here);
        const picked = { lat: here[0], lng: here[1] };
        setPosition(picked);
        onLocationChange(picked);
      },
      () => {
        // Geolocation denied or unavailable — keep the fallback center.
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePick(pos: LatLng) {
    setPosition(pos);
    onLocationChange(pos);
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
        key={center.join(",")}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onPick={handlePick} />
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
