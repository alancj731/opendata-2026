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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StreetView } from "./street-view";
import { useState } from "react";

export interface EvaluationStats {
  avg_rating: number;
  avg_price: number | null;
  count: number;
  price_count: number;
}

export interface SalesRecord {
  sale_price: number;
  sale_year: number;
  sale_month: number;
  time_adjusted_sale_price: number | null;
}

interface PropertyCardProps {
  property: Property;
  index: number;
  onEvaluate: (evaluation: Evaluation) => void;
  label?: "selected" | "nearby";
  previousStats?: EvaluationStats | null;
  salesHistory?: SalesRecord[] | null;
}

export function PropertyCard({
  property,
  index,
  onEvaluate,
  label,
  previousStats,
  salesHistory,
}: PropertyCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [priceExpectation, setPriceExpectation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const priceValue = priceExpectation
        ? parseInt(priceExpectation.replace(/,/g, ""), 10)
        : null;
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_number: property.roll_number,
          rating,
          comment,
          price_expectation: priceValue,
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

  const assessedNum = property.total_assessed_value
    ? Number(property.total_assessed_value)
    : null;
  const rawProposed = property.total_proposed_assessment_value
    ? Number(property.total_proposed_assessment_value)
    : null;
  const proposedNum = rawProposed && rawProposed > 0 ? rawProposed : null;
  const valueDiff =
    assessedNum != null && proposedNum != null ? proposedNum - assessedNum : null;

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
          {assessedNum == null && (
            <Badge variant="secondary">{assessedValue}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Previous Evaluation Stats */}
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1">
          {previousStats ? (
            <>
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
              {previousStats.avg_price ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Avg. expected price:</span>
                  <span className="font-semibold text-green-700">
                    ${previousStats.avg_price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    ({previousStats.price_count}{" "}
                    {previousStats.price_count === 1 ? "submission" : "submissions"})
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground italic">
                  No price expectations submitted yet
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground italic">
              No previous evaluation found
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Type: </span>
            <span className="font-medium">{property.building_type || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Built: </span>
            <span className="font-medium">{property.year_built || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Area: </span>
            <span className="font-medium">
              {property.total_living_area ? `${property.total_living_area} sq ft` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Rooms: </span>
            <span className="font-medium">{property.rooms || "N/A"}</span>
          </div>
        </div>

        {/* Assessment Value Comparison */}
        {assessedNum != null && (
          <div className="rounded-md border px-3 py-2 text-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Assessed</span>
              <span className="font-medium">{assessedValue}</span>
            </div>
            {proposedNum != null ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Proposed (2027+)</span>
                  <span className="font-medium">{proposedValue}</span>
                </div>
                <div className="border-t pt-1.5 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Change after 2027
                  </span>
                  <span
                    className={`font-semibold ${
                      valueDiff! > 0
                        ? "text-red-600"
                        : valueDiff! < 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {valueDiff! > 0 ? "+" : ""}
                    ${Math.abs(valueDiff!).toLocaleString()}
                    {assessedNum > 0 && (
                      <span className="ml-1 text-xs font-normal">
                        ({valueDiff! > 0 ? "+" : ""}
                        {((valueDiff! / assessedNum) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Tax basis changes from current assessed to proposed value in 2027.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Proposed (2027+)</span>
                <span className="text-muted-foreground italic">No estimation yet</span>
              </div>
            )}
          </div>
        )}

        {/* Sales History */}
        {salesHistory && salesHistory.length > 0 && (
          <div className="rounded-md border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm space-y-1.5">
            <p className="font-medium text-blue-900">Recent Sales</p>
            {salesHistory.map((sale, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {sale.sale_year}/{String(sale.sale_month).padStart(2, "0")}
                </span>
                <span className="font-semibold text-blue-700">
                  ${sale.sale_price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

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
                    onClick={() => setRating(star)}
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
              <div className="mb-2">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Your price expectation ($)
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 350000"
                  value={priceExpectation}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setPriceExpectation(val);
                  }}
                  className="h-9 text-sm"
                />
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
