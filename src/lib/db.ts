import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function saveEvaluation(
  rollNumber: string,
  rating: number,
  comment: string,
  priceExpectation: number | null
) {
  const { error } = await supabase.from("evaluations").insert({
    roll_number: rollNumber,
    rating,
    comment,
    price_expectation: priceExpectation,
  });

  if (error) {
    throw new Error(`Failed to save evaluation: ${error.message}`);
  }
}

export interface EvaluationStats {
  roll_number: string;
  avg_rating: number;
  avg_price: number | null;
  count: number;
  price_count: number;
}

export async function getEvaluationStats(
  rollNumbers: string[]
): Promise<Map<string, EvaluationStats>> {
  if (rollNumbers.length === 0) return new Map();

  const { data, error } = await supabase
    .from("evaluations")
    .select("roll_number, rating, price_expectation")
    .in("roll_number", rollNumbers);

  if (error) {
    throw new Error(`Failed to fetch evaluations: ${error.message}`);
  }

  // Aggregate in JS since Supabase REST API doesn't support GROUP BY
  const grouped = new Map<
    string,
    { ratings: number[]; prices: number[] }
  >();

  for (const row of data || []) {
    if (!grouped.has(row.roll_number)) {
      grouped.set(row.roll_number, { ratings: [], prices: [] });
    }
    const group = grouped.get(row.roll_number)!;
    group.ratings.push(row.rating);
    if (row.price_expectation != null) {
      group.prices.push(row.price_expectation);
    }
  }

  const map = new Map<string, EvaluationStats>();
  for (const [rollNumber, group] of grouped) {
    const avgRating =
      Math.round(
        (group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length) * 10
      ) / 10;
    const avgPrice =
      group.prices.length > 0
        ? Math.round(
            group.prices.reduce((a, b) => a + b, 0) / group.prices.length
          )
        : null;

    map.set(rollNumber, {
      roll_number: rollNumber,
      avg_rating: avgRating,
      avg_price: avgPrice,
      count: group.ratings.length,
      price_count: group.prices.length,
    });
  }

  return map;
}

export interface SalesRecord {
  sale_price: number;
  sale_year: number;
  sale_month: number;
  time_adjusted_sale_price: number | null;
}

export async function getSalesData(
  rollNumbers: string[]
): Promise<Map<string, SalesRecord[]>> {
  if (rollNumbers.length === 0) return new Map();

  // Winnipeg API returns roll numbers with leading zeros (e.g. "08005124800")
  // but the sales table stores them without (e.g. "8005124800").
  // Query both formats to ensure matches.
  const stripped = rollNumbers.map((r) => r.replace(/^0+/, ""));
  const allVariants = [...new Set([...rollNumbers, ...stripped])];

  const { data, error } = await supabase
    .from("sales")
    .select("roll_number, sale_price, sale_year, sale_month, time_adjusted_sale_price")
    .in("roll_number", allVariants)
    .order("sale_year", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }

  // Build a lookup from stripped roll number back to original (with leading zeros)
  const strippedToOriginal = new Map<string, string>();
  for (const r of rollNumbers) {
    strippedToOriginal.set(r.replace(/^0+/, ""), r);
  }

  const map = new Map<string, SalesRecord[]>();
  for (const row of data || []) {
    // Map back to the original roll number format the caller used
    const key = strippedToOriginal.get(row.roll_number) || row.roll_number;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push({
      sale_price: row.sale_price,
      sale_year: row.sale_year,
      sale_month: row.sale_month,
      time_adjusted_sale_price: row.time_adjusted_sale_price,
    });
  }

  return map;
}
