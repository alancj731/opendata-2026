"use client";

import { Property, Evaluation } from "@/lib/types";
import { PropertyCard, EvaluationStats } from "./property-card";

interface PropertyGridProps {
  properties: Property[];
  onEvaluate: (evaluation: Evaluation) => void;
  selectedRollNumber?: string;
  evaluationStats?: Record<string, EvaluationStats>;
}

export function PropertyGrid({
  properties,
  onEvaluate,
  selectedRollNumber,
  evaluationStats,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No properties found.
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
          label={
            selectedRollNumber
              ? property.roll_number === selectedRollNumber
                ? "selected"
                : "nearby"
              : undefined
          }
          previousStats={
            evaluationStats
              ? evaluationStats[property.roll_number] || null
              : undefined
          }
        />
      ))}
    </div>
  );
}
