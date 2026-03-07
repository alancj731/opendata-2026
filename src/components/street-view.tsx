"use client";

interface StreetViewProps {
  lat: string;
  lon: string;
  address: string;
}

export function StreetView({ lat, lon, address }: StreetViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    return (
      <div className="flex h-48 items-center justify-center rounded-t-lg bg-muted text-sm text-muted-foreground">
        <span>Street View requires Google Maps API key</span>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lon}&heading=210&pitch=10&fov=90`;

  return (
    <iframe
      className="h-48 w-full rounded-t-lg"
      src={src}
      title={`Street View of ${address}`}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
