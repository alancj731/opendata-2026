"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Property, Evaluation } from "@/lib/types";
import { PropertyGrid } from "@/components/property-grid";
import { AiInsights } from "@/components/ai-insights";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EvaluationStats, SalesRecord } from "@/components/property-card";

function EvaluateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode") || "region";
  const region = searchParams.get("region") || "";
  const rollNumber = searchParams.get("roll") || "";
  const lat = searchParams.get("lat") || "";
  const lon = searchParams.get("lon") || "";
  const address = searchParams.get("address") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [evaluationStats, setEvaluationStats] = useState<
    Record<string, EvaluationStats>
  >({});
  const [salesData, setSalesData] = useState<
    Record<string, SalesRecord[]>
  >({});
  const [evaluations, setEvaluations] = useState<Map<string, Evaluation>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch evaluation stats once properties are loaded
  const fetchEvaluationStats = useCallback(
    async (props: Property[]) => {
      if (props.length === 0) return;
      const rolls = props.map((p) => p.roll_number).join(",");
      try {
        const res = await fetch(
          `/api/evaluations?rolls=${encodeURIComponent(rolls)}`
        );
        const json = await res.json();
        if (json.data) {
          setEvaluationStats(json.data);
        }
        if (json.sales) {
          setSalesData(json.sales);
        }
      } catch {
        // Non-critical, just leave stats empty
      }
    },
    []
  );

  useEffect(() => {
    if (mode === "address" && lat && lon && rollNumber) {
      setLoading(true);
      Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(address)}`).then((r) =>
          r.json()
        ),
        fetch(
          `/api/nearby?lat=${lat}&lon=${lon}&exclude=${encodeURIComponent(rollNumber)}`
        ).then((r) => r.json()),
      ])
        .then(([searchJson, nearbyJson]) => {
          const selected = (searchJson.data as Property[])?.find(
            (p) => p.roll_number === rollNumber
          );
          const nearby: Property[] = nearbyJson.data || [];
          const all = selected ? [selected, ...nearby] : nearby;
          setProperties(all);
          fetchEvaluationStats(all);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (mode === "region" && region) {
      setLoading(true);
      fetch(
        `/api/properties?region=${encodeURIComponent(region)}&count=10`
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.error) throw new Error(json.error);
          setProperties(json.data);
          fetchEvaluationStats(json.data);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [mode, region, rollNumber, lat, lon, address, fetchEvaluationStats]);

  const handleEvaluate = useCallback((evaluation: Evaluation) => {
    setEvaluations((prev) => {
      const next = new Map(prev);
      next.set(evaluation.roll_number, evaluation);
      return next;
    });
  }, []);

  const evaluatedCount = evaluations.size;
  const totalCount = properties.length;

  const hasParams = mode === "address" ? !!(lat && lon) : !!region;

  if (!hasParams) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            No {mode === "address" ? "address" : "market region"} selected.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const title =
    mode === "address" ? address : region.replace(/^\d+,\s*/, "");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {evaluatedCount}/{totalCount} properties evaluated
              {mode === "address" && " · Address search"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              {mode === "address" ? "New Search" : "Change Area"}
            </Button>
            {mode === "region" && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Shuffle
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <>
            <MapView properties={properties} />

            <Separator />

            <PropertyGrid
              properties={properties}
              onEvaluate={handleEvaluate}
              selectedRollNumber={mode === "address" ? rollNumber : undefined}
              evaluationStats={evaluationStats}
              salesData={salesData}
            />

            <Separator />

            <AiInsights properties={properties} />
          </>
        )}
      </main>
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <EvaluateContent />
    </Suspense>
  );
}
