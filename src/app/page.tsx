"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const router = useRouter();
  const [neighbourhoods, setNeighbourhoods] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/neighbourhoods")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setNeighbourhoods(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = () => {
    if (selected) {
      router.push(`/evaluate?neighbourhood=${encodeURIComponent(selected)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Winnipeg Property Explorer
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Discover and evaluate properties across Winnipeg neighbourhoods.
            Powered by open data and AI.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select a Neighbourhood</CardTitle>
            <CardDescription>
              Choose a neighbourhood to randomly explore 10 properties with
              Street View and AI-powered analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">
                Failed to load neighbourhoods: {error}
              </p>
            )}

            {!loading && !error && (
              <>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Choose a neighbourhood...</option>
                  {neighbourhoods.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleStart}
                  disabled={!selected}
                  className="w-full"
                  size="lg"
                >
                  Explore Properties
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Data from{" "}
          <a
            href="https://data.winnipeg.ca/Assessment-Taxation-Corporate/Assessment-Parcels/d4mq-wa44"
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            City of Winnipeg Open Data
          </a>
        </div>
      </div>
    </div>
  );
}
