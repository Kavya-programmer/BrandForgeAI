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
        "You are a viral marketing expert and trend analyst. Every field must contain detailed, realistic, and highly actionable trend-jacking strategies. Do NOT return placeholders like 'Hook 1' or 'Adapt to product'. Ensure the output is a valid JSON object.",
        `Create a trend-jacking (Trend Stealer) campaign for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Provide: currentTrends (list with trend name, platform, virality level, and specific howToUse instructions), adaptedCampaign (detailed concept), trendHooks (list of specific viral hooks), and viralFormula (specific engagement strategy).`,
        "trend-stealer",
        { brand, product, audience }
      );
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Trend Stealer Error in trend-stealer.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("trend-stealer", { brand, product, audience }));
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in trend-stealer.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
