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
import { Button } from "@/components/ui/button";
import { StreetView } from "./street-view";
import { useState } from "react";

export interface EvaluationStats {
  avg_rating: number;
  count: number;
}

interface PropertyCardProps {
  property: Property;
  index: number;
  onEvaluate: (evaluation: Evaluation) => void;
  label?: "selected" | "nearby";
  previousStats?: EvaluationStats | null;
}

export function PropertyCard({
  property,
  index,
  onEvaluate,
  label,
  previousStats,
}: PropertyCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_number: property.roll_number,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        onEvaluate({ roll_number: property.roll_number, rating, comment });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const assessedValue = property.total_assessed_value
    ? `$${Number(property.total_assessed_value).toLocaleString()}`
    : "N/A";

  const proposedValue = property.total_proposed_assessment_value
    ? `$${Number(property.total_proposed_assessment_value).toLocaleString()}`
    : null;

  return (
    <Card
      className={`overflow-hidden ${label === "selected" ? "ring-2 ring-[#003C6E]" : ""}`}
    >
      {label && (
        <div
          className={`px-4 py-1.5 text-xs font-semibold ${
            label === "selected"
              ? "bg-[#003C6E] text-white"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {label === "selected" ? "Selected Property" : "Nearby Property"}
        </div>
      )}
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
        {/* Previous Evaluation Stats */}
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
          {previousStats ? (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">
                {"★".repeat(Math.round(previousStats.avg_rating))}
                {"☆".repeat(5 - Math.round(previousStats.avg_rating))}
              </span>
              <span className="font-medium">{previousStats.avg_rating}</span>
              <span className="text-muted-foreground">
                ({previousStats.count}{" "}
                {previousStats.count === 1 ? "evaluation" : "evaluations"})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">
              No previous evaluation found
            </span>
          )}
        </div>

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
              <span className="font-medium">
                {property.total_living_area} sq ft
              </span>
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
          {submitted ? (
            <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Thank you! Your evaluation has been saved.
            </div>
          ) : (
            <>
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
                onChange={(e) => setComment(e.target.value)}
                className="mb-2 h-20 resize-none text-sm"
              />
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                size="sm"
                className="w-full"
              >
                {submitting ? "Saving..." : "Submit Evaluation"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
