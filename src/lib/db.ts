import { Pool } from "pg";

function parseConnectionString(connStr: string) {
  const match = connStr.match(
    /^postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)$/
  );
  if (!match) {
    return { connectionString: connStr, ssl: { rejectUnauthorized: false } };
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool(
  parseConnectionString(
    process.env.NEXT_PUBLIC_SUPABASE_CONNECTION_STRING || ""
  )
);

export async function saveEvaluation(
  rollNumber: string,
  rating: number,
  comment: string
) {

  await pool.query(
    "INSERT INTO evaluations (roll_number, rating, comment) VALUES ($1, $2, $3)",
    [rollNumber, rating, comment]
  );
}

export interface EvaluationStats {
  roll_number: string;
  avg_rating: number;
  count: number;
}

export async function getEvaluationStats(
  rollNumbers: string[]
): Promise<Map<string, EvaluationStats>> {
  if (rollNumbers.length === 0) return new Map();


  const placeholders = rollNumbers.map((_, i) => `$${i + 1}`).join(",");
  const result = await pool.query(
    `SELECT roll_number,
            ROUND(AVG(rating)::numeric, 1) as avg_rating,
            COUNT(*)::int as count
     FROM evaluations
     WHERE roll_number IN (${placeholders})
     GROUP BY roll_number`,
    rollNumbers
  );

  const map = new Map<string, EvaluationStats>();
  for (const row of result.rows) {
    map.set(row.roll_number, {
      roll_number: row.roll_number,
      avg_rating: parseFloat(row.avg_rating),
      count: row.count,
    });
  }
  return map;
}
