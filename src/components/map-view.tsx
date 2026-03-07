"use client";

import { Property } from "@/lib/types";

interface MapViewProps {
  properties: Property[];
}

export function MapView({ properties }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const validProperties = properties.filter(
    (p) => p.centroid_lat && p.centroid_lon
  );

  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        Map requires Google Maps API key in .env.local
      </div>
    );
  }

  if (validProperties.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        No properties with coordinates to display
      </div>
    );
  }

  // Calculate center from all properties
  const avgLat =
    validProperties.reduce((sum, p) => sum + Number(p.centroid_lat), 0) /
    validProperties.length;
  const avgLon =
    validProperties.reduce((sum, p) => sum + Number(p.centroid_lon), 0) /
    validProperties.length;

  // Build markers string for Google Maps Embed API
  const markersParam = validProperties
    .map((p, i) => `${p.centroid_lat},${p.centroid_lon}`)
    .join("|");

  const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${avgLat},${avgLon}&zoom=14`;

  return (
    <div className="overflow-hidden rounded-lg border">
      <iframe
        className="h-80 w-full"
        src={src}
        title="Property Map"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        Showing {validProperties.length} properties near{" "}
        {validProperties[0]?.neighbourhood_area || "selected area"}
      </div>
    </div>
  );
}
