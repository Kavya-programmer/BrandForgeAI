import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel, CURATED_INFLUENCERS, getFallbackResponse } from "../../src/lib/campaign-logic.js";

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
        "You are an influencer marketing specialist. Every field must contain detailed, realistic, and strategic collaboration ideas. Do NOT return placeholders like 'Post 1' or 'Check it out!'. Match the brand with one or more influencers from the curated list provided and explain the strategic fit. Ensure the output is a valid JSON object.",
        `Match the best influencer(s) from this curated list for the campaign: ${JSON.stringify(CURATED_INFLUENCERS)}. Campaign Context - Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Provide: selectedInfluencerName, brandCollabAngle (detailed explanation of the fit), collaborationIdeas (list of specific campaign concepts), and sampleCaptions (realistic high-engagement captions).`,
        "influencer",
        { brand, product, audience }
      );
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Influencer Error in generate-influencer.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("influencer", { brand, product, audience }));
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-influencer.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
