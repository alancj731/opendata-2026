import { GoogleGenerativeAI } from "@google/generative-ai";
import { Property } from "./types";

function getClient() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeProperties(
  properties: Property[]
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const propertyData = properties.map((p, i) => ({
    index: i + 1,
    address: p.full_address,
    assessed_value: p.total_assessed_value,
    proposed_value: p.total_proposed_assessment_value,
    year_built: p.year_built,
    building_type: p.building_type,
    living_area: p.total_living_area,
    rooms: p.rooms,
    zoning: p.zoning,
    neighbourhood: p.neighbourhood_area,
    basement: p.basement,
    garage: p.attached_garage === "Yes" ? "Attached" : p.detached_garage === "Yes" ? "Detached" : "None",
    pool: p.pool,
    air_conditioning: p.air_conditioning,
  }));

  const prompt = `You are a real estate analyst. Analyze these ${properties.length} properties from Winnipeg, Canada.

Property Data:
${JSON.stringify(propertyData, null, 2)}

Provide a concise analysis including:
1. **Overview**: Brief summary of the properties
2. **Value Analysis**: Compare assessed values, identify best/worst value per sq ft
3. **Key Highlights**: Notable features, newest/oldest buildings, unique characteristics
4. **Investment Insights**: Which properties stand out and why

Keep your response under 500 words. Use markdown formatting.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
