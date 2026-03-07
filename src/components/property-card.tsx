"use client";

import { Property, Evaluation } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StreetView } from "./street-view";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  index: number;
  onEvaluate: (evaluation: Evaluation) => void;
}

export function PropertyCard({ property, index, onEvaluate }: PropertyCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleRating = (value: number) => {
    setRating(value);
    onEvaluate({ roll_number: property.roll_number, rating: value, comment });
  };

  const handleComment = (value: string) => {
    setComment(value);
    if (rating > 0) {
      onEvaluate({ roll_number: property.roll_number, rating, comment: value });
    }
  };

  const assessedValue = property.total_assessed_value
    ? `$${Number(property.total_assessed_value).toLocaleString()}`
    : "N/A";

  const proposedValue = property.total_proposed_assessment_value
    ? `$${Number(property.total_proposed_assessment_value).toLocaleString()}`
    : null;

  return (
    <Card className="overflow-hidden">
      {property.centroid_lat && property.centroid_lon ? (
        <StreetView
          lat={property.centroid_lat}
          lon={property.centroid_lon}
          address={property.full_address}
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-muted text-sm text-muted-foreground">
          No coordinates available
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardDescription>Property #{index + 1}</CardDescription>
            <CardTitle className="text-lg">{property.full_address}</CardTitle>
          </div>
          <Badge variant="secondary">{assessedValue}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {property.building_type && (
            <div>
              <span className="text-muted-foreground">Type: </span>
              <span className="font-medium">{property.building_type}</span>
            </div>
          )}
          {property.year_built && (
            <div>
              <span className="text-muted-foreground">Built: </span>
              <span className="font-medium">{property.year_built}</span>
            </div>
          )}
          {property.total_living_area && (
            <div>
              <span className="text-muted-foreground">Area: </span>
              <span className="font-medium">{property.total_living_area} sq ft</span>
            </div>
          )}
          {property.rooms && (
            <div>
              <span className="text-muted-foreground">Rooms: </span>
              <span className="font-medium">{property.rooms}</span>
            </div>
          )}
          {property.zoning && (
            <div>
              <span className="text-muted-foreground">Zoning: </span>
              <span className="font-medium">{property.zoning}</span>
            </div>
          )}
          {proposedValue && (
            <div>
              <span className="text-muted-foreground">Proposed: </span>
              <span className="font-medium">{proposedValue}</span>
            </div>
          )}
        </div>

        {/* Evaluation */}
        <div className="border-t pt-3">
          <p className="mb-2 text-sm font-medium">Your Evaluation</p>
          <div className="mb-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`text-2xl transition-colors ${
                  star <= rating
                    ? "text-yellow-500"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your thoughts on this property..."
            value={comment}
            onChange={(e) => handleComment(e.target.value)}
            className="h-20 resize-none text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
