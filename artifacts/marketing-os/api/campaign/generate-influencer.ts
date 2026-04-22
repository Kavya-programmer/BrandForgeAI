import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel, CURATED_INFLUENCERS } from "../_lib/campaign-logic";

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
      const data = await callGroqJSON<any>(client, "Influencer expert.", `Match influencer for ${brand}, ${product}, ${audience}, ${themeLabel}. Curated list: ${JSON.stringify(CURATED_INFLUENCERS)}`);
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Influencer Error:", err?.message || err);
      return res.status(200).json({ ...CURATED_INFLUENCERS[1], brandCollabAngle: "Perfect fit", collaborationIdeas: ["Post 1"], sampleCaptions: ["Check it out!"], notice: "AI fallback" });
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-influencer.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
