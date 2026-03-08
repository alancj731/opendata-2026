# Winnipeg Property Explorer

A web app for exploring and evaluating residential properties in Winnipeg using open data from the City of Winnipeg assessment parcels dataset (~245,000 properties).

## Features

- **Region-Based Exploration** — Select a market region and browse 10 randomly selected properties
- **Address Search** — Find a specific property by address with autocomplete, plus 9 nearby properties
- **Property Evaluation** — Rate properties (1-5 stars), submit price expectations, and leave comments
- **Street View & Maps** — Google Street View imagery and interactive map for each property
- **Sales History** — View recent sales data with time-adjusted pricing
- **Evaluation Stats** — See aggregated ratings and price expectations from other users

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Database:** Supabase (PostgreSQL) — stores evaluations and sales data
- **Data Source:** [City of Winnipeg Open Data](https://data.winnipeg.ca/resource/d4mq-wa44.json) (SODA2 API)
- **Maps:** Google Maps Embed + Street View

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page (region select + address search)
│   ├── evaluate/page.tsx         # Property evaluation interface
│   └── api/
│       ├── search/               # Search properties by address
│       ├── nearby/               # Find nearby properties by coordinates
│       ├── properties/           # Get random properties by region
│       ├── neighbourhoods/       # List available market regions
│       └── evaluations/          # User evaluations and sales data
├── components/
│   ├── address-search.tsx        # Address autocomplete search bar
│   ├── property-grid.tsx         # Grid layout of property cards
│   ├── property-card.tsx         # Property details, rating, and evaluation
│   ├── map-view.tsx              # Google Maps embed
│   └── street-view.tsx           # Street View image
└── lib/
    ├── winnipeg-api.ts           # Winnipeg Open Data API client
    ├── db.ts                     # Supabase queries (evaluations, sales)
    ├── types.ts                  # TypeScript interfaces
    └── utils.ts                  # Helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- Google Maps API key

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WINNIPEG_DATA_APP_TOKEN=   # Optional — Winnipeg Open Data app token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=       # Google Maps / Street View
NEXT_PUBLIC_SUPABASE_URL=              # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # Supabase anon key
DATABASE_URL=                          # PostgreSQL connection string
```

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
