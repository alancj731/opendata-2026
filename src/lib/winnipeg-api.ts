import { Property } from "./types";

const SODA_URL = "https://data.winnipeg.ca/resource/d4mq-wa44.json";
const V3_URL = "https://data.winnipeg.ca/api/v3/views/d4mq-wa44/query.json";

function getAppToken(): string {
  return process.env.NEXT_PUBLIC_WINNIPEG_DATA_APP_TOKEN || "";
}

/** SODA2 endpoint — supports SoQL ($where, $select, $group, etc.) */
function buildSodaUrl(params: Record<string, string>): string {
  const url = new URL(SODA_URL);
  const token = getAppToken();
  if (token) {
    url.searchParams.set("$$app_token", token);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/** V3 endpoint — pagination with pageNumber/pageSize */
function buildV3Url(pageNumber: number, pageSize: number): string {
  const url = new URL(V3_URL);
  const token = getAppToken();
  if (token) {
    url.searchParams.set("app_token", token);
  }
  url.searchParams.set("pageNumber", String(pageNumber));
  url.searchParams.set("pageSize", String(pageSize));
  return url.toString();
}

export async function getMarketRegions(): Promise<string[]> {
  const url = buildSodaUrl({
    $select: "market_region",
    $group: "market_region",
    $order: "market_region ASC",
    $limit: "500",
    $where: "market_region IS NOT NULL",
  });

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch market regions: ${res.statusText}`);
  }

  const data: Array<{ market_region: string }> = await res.json();
  return data.map((d) => d.market_region).filter(Boolean);
}

export async function fetchPropertiesByRegion(
  region: string,
  limit: number = 100
): Promise<Property[]> {
  const url = buildSodaUrl({
    $where: `market_region='${region.replace(/'/g, "''")}'`,
    $limit: String(limit),
    $order: "roll_number ASC",
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch properties: ${res.statusText}`);
  }

  return res.json();
}

/** Fetch a page of properties using the v3 API */
export async function fetchPropertiesPage(
  pageNumber: number,
  pageSize: number
): Promise<Property[]> {
  const url = buildV3Url(pageNumber, pageSize);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch properties page: ${res.statusText}`);
  }
  return res.json();
}

export async function getRandomProperties(
  region: string,
  count: number = 10
): Promise<Property[]> {
  const pool = await fetchPropertiesByRegion(region, 200);

  if (pool.length <= count) {
    return pool;
  }

  // Fisher-Yates shuffle and take first `count`
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
