import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  CURATED_INFLUENCERS,
  unifyResponse
} from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: true,
        message: "Method not allowed",
        data: null
      });
    }

    const { brand = "Brand", product = "Product", audience = "Audience", theme = "luxury" } = req.body || {};
    const themeLabel = getThemeLabel(theme);
    const client = getGroqClient();

    const systemPrompt = "You are a world-class brand strategist. Return ONLY valid JSON. Every field is MANDATORY. No placeholders.";
    const userPrompt = `Develop a deep marketing strategy for:
Brand: ${brand}
Product: ${product}
Target Audience: ${audience}
Theme: ${themeLabel}

You MUST return these fields in JSON:
1. positioning (Detailed brand stance)
2. keyMessage (Primary campaign tagline)
3. audiencePsychology (Emotional and logical triggers)
4. viralHooks (Array of 5 high-impact hooks)
5. sloganIdeas (Array of 5 catchy slogans)
6. competitorAngle (Strategic advantage over competitors)
7. platformStrategy (How to win on TikTok, IG, and LinkedIn)

CRITICAL: NO 'pending' or 'placeholder' text. All fields must contain actionable marketing intelligence.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Validation
    if (data && (data.competitorAngle === "pending" || !data.competitorAngle || !Array.isArray(data.viralHooks))) {
      console.log("Missing strategy fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure competitorAngle is a detailed paragraph and viralHooks is a full array.");
    }

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "Strategy generation failed.",
        data: null
      });
    }

    return res.status(200).json({
      error: false,
      message: "Success",
      data: unifyResponse(data, brand, product, audience, theme)
    });

  } catch (err: any) {
    console.error("Fatal API Error:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      data: null
    });
  }
}