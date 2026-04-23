import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
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

    const systemPrompt = "You are a world-class marketing strategist. You MUST return ONLY a complete JSON object. Every field is MANDATORY. Do NOT use placeholders like 'pending' or 'TBD'.";
    const userPrompt = `Create a comprehensive marketing campaign for:
Brand: ${brand}
Product: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

You MUST return exactly these fields in valid JSON:
1. campaignIdea (Creative concept)
2. keyMessage (Main takeaway)
3. coreStrategy (At least 3 bullet points)
4. socialContent (Platform rollout overview)
5. videoStoryboard (Narrative flow)
6. adScript (Short form video script)
7. brandPositioning (Market stance)
8. influencerAngles (How creators should pitch it)
9. competitorAngle (Specific edge over rivals)
10. viralHooks (Array of 3 catchy hooks)

CRITICAL: All fields must be fully written marketing copy. No 'pending' or 'not available'.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Validation loop - if essential fields are missing or placeholders, retry once
    if (data && (data.competitorAngle === "pending" || !data.competitorAngle || !Array.isArray(data.viralHooks))) {
      console.log("Missing fields in generate.ts, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure competitorAngle and viralHooks (array) are fully populated.");
    }

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "AI generation failed. Please check your API key or parameters.",
        data: null
      });
    }

    const unified = unifyResponse(data, brand, product, audience, theme);
    return res.status(200).json({
      error: false,
      message: "Success",
      data: unified
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