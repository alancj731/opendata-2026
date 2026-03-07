"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AddressSearch } from "@/components/address-search";

export default function Home() {
  const router = useRouter();
  const [regions, setRegions] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/neighbourhoods")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setRegions(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = () => {
    if (selected) {
      router.push(`/evaluate?region=${encodeURIComponent(selected)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="relative bg-[#003C6E] text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center">
          <Image
            src="/winnipeg-logo.svg"
            alt="City of Winnipeg"
            width={80}
            height={80}
            priority
          />
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Winnipeg Property Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Explore, compare, and evaluate residential properties across
            Winnipeg market regions using open assessment data, Google Street
            View, and AI-powered analysis.
          </p>
        </div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full">
            <path
              d="M0 48h1440V24C1200 0 960 48 720 48S240 0 0 24v24z"
              className="fill-background"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto -mt-2 w-full max-w-5xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Neighbourhood Selector */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Select a Market Region
                </CardTitle>
                <CardDescription>
                  Choose a market region to randomly explore 10 properties with
                  Street View imagery and AI-powered insights.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive">
                    Failed to load market regions: {error}
                  </p>
                )}

                {!loading && !error && (
                  <>
                    <select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Choose a market region...</option>
                      {regions.map((n) => (
                        <option key={n} value={n}>
                          {n.replace(/^\d+,\s*/, "")}
                        </option>
                      ))}
                    </select>

                    <Button
                      onClick={handleStart}
                      disabled={!selected}
                      className="h-12 w-full text-base"
                      size="lg"
                    >
                      Explore Properties
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            <Separator className="my-2" />

            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-xl">Search by Address</CardTitle>
                <CardDescription>
                  Find a specific property and explore 9 nearby properties with
                  Street View and AI analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <AddressSearch />
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold">How It Works</h3>
                <Separator className="my-2" />
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003C6E] text-xs font-bold text-white">
                      1
                    </span>
                    <span>Pick a market region from the dropdown</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003C6E] text-xs font-bold text-white">
                      2
                    </span>
                    <span>
                      View 10 randomly selected properties with Street View
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003C6E] text-xs font-bold text-white">
                      3
                    </span>
                    <span>Rate and evaluate each property</span>
                  </li>
                  {/* <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003C6E] text-xs font-bold text-white">
                      4
                    </span>
                    <span>Get AI-powered analysis from Gemini</span>
                  </li> */}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold">About the Data</h3>
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground">
                  Assessment data for{" "}
                  <strong className="text-foreground">245,000+</strong> parcels
                  sourced from the City of Winnipeg Open Data portal. Includes
                  property values, building details, zoning, and geographic
                  coordinates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span>
            Data from{" "}
            <a
              href="https://data.winnipeg.ca/Assessment-Taxation-Corporate/Assessment-Parcels/d4mq-wa44"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              City of Winnipeg Open Data
            </a>
          </span>
          <span>
            Powered by Google Gemini &middot; Google Maps &middot; Next.js
          </span>
        </div>
      </footer>
    </div>
  );
}
