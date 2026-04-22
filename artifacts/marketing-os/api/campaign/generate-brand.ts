import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel, getFallbackResponse } from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: true, message: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
    }

    const body = req.body || {};
    const brand = body.brand || "Brand";
    const product = body.product || "Product";
    const audience = body.audience || "Audience";
    const theme = body.theme || "luxury";

    const themeLabel = getThemeLabel(theme);

    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(
        client, 
        "You are an expert brand identity designer. Every field must contain detailed, realistic, and unique brand guidelines. Do NOT return placeholders like 'Tagline 1' or 'Not available'. Ensure the output is a valid JSON object.",
        `Create a detailed brand identity for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Provide: tagline, brandArchetype, brandVoice, colorPalette (with hex codes and usage descriptions), and uniqueSellingPoints.`,
        "brand",
        { brand, product, audience }
      );
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Brand Error in generate-brand.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("brand", { brand, product, audience }));
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-brand.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
