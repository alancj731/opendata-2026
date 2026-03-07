"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Property } from "@/lib/types";

export function AddressSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const json = await res.json();
        if (json.data) {
          setResults(json.data);
          setOpen(json.data.length > 0);
        } else {
          setResults([]);
          setOpen(true);
        }
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (property: Property) => {
    setOpen(false);
    setQuery(property.full_address);
    router.push(
      `/evaluate?mode=address&roll=${encodeURIComponent(property.roll_number)}&lat=${property.centroid_lat}&lon=${property.centroid_lon}&address=${encodeURIComponent(property.full_address)}`
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="Type an address to search..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="h-12 text-base"
      />
      {loading && (
        <div className="absolute right-3 top-3.5 text-xs text-muted-foreground">
          Searching...
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
          {results.map((property) => (
            <button
              key={property.roll_number}
              onClick={() => handleSelect(property)}
              className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium">
                {property.full_address}
              </span>
              <span className="text-xs text-muted-foreground">
                {property.neighbourhood_area}
                {property.total_assessed_value &&
                  ` · $${Number(property.total_assessed_value).toLocaleString()}`}
                {property.building_type && ` · ${property.building_type}`}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-4 text-center text-sm text-muted-foreground shadow-lg">
          No properties found
        </div>
      )}
    </div>
  );
}
