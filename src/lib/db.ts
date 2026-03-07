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
