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

function EvaluateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const neighbourhood = searchParams.get("neighbourhood") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [evaluations, setEvaluations] = useState<Map<string, Evaluation>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!neighbourhood) return;
    setLoading(true);
    fetch(
      `/api/properties?neighbourhood=${encodeURIComponent(neighbourhood)}&count=10`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setProperties(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [neighbourhood]);

  const handleEvaluate = useCallback((evaluation: Evaluation) => {
    setEvaluations((prev) => {
      const next = new Map(prev);
      next.set(evaluation.roll_number, evaluation);
      return next;
    });
  }, []);

  const evaluatedCount = evaluations.size;
  const totalCount = properties.length;

  if (!neighbourhood) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No neighbourhood selected.</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">{neighbourhood}</h1>
            <p className="text-sm text-muted-foreground">
              {evaluatedCount}/{totalCount} properties evaluated
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              Change Area
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Shuffle
            </Button>
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
