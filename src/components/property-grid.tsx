"use client";

import { Property, Evaluation } from "@/lib/types";
import { PropertyCard } from "./property-card";

interface PropertyGridProps {
  properties: Property[];
  onEvaluate: (evaluation: Evaluation) => void;
}

export function PropertyGrid({ properties, onEvaluate }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No properties found for this neighbourhood.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.roll_number}
          property={property}
          index={index}
          onEvaluate={onEvaluate}
        />
      ))}
    </div>
  );
}
