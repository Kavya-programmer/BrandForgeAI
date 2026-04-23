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

    const systemPrompt = "You are a world-class marketing strategist. Return ONLY a valid JSON object. No conversational text. No markdown. No headings outside the JSON object.";
    const userPrompt = `Create a comprehensive marketing campaign for:
Brand: ${brand}
Product: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

You MUST return exactly this JSON structure:
{
  "campaignIdea": "Creative concept description",
  "keyMessage": "Main takeaway / tagline",
  "coreStrategy": "3-5 high-impact bullet points",
  "socialContent": "Platform rollout overview",
  "videoStoryboard": "Narrative flow description",
  "adScript": "Short form video script",
  "brandPositioning": "Market stance description",
  "influencerAngles": "How creators should pitch it",
  "competitorAngle": "Specific edge over rivals",
  "viralHooks": ["Hook 1", "Hook 2", "Hook 3"]
}

CRITICAL RULES:
1. Output MUST be valid JSON only.
2. Do NOT include headings or text outside the JSON.
3. All content must be production-ready.`;

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