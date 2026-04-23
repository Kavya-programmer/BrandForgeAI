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

    const systemPrompt = "You are a viral marketing expert and trend analyst. Return ONLY a valid JSON object. No conversational text. No markdown. No headings outside the JSON object.";
    const userPrompt = `Create a trend-jacking campaign for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

You MUST return exactly this JSON structure:
{
  "currentTrends": [
    {"trend": "Trend 1", "platform": "Platform", "virality": "High", "howToUse": "Strategy"},
    {"trend": "Trend 2", "platform": "Platform", "virality": "High", "howToUse": "Strategy"}
  ],
  "trendHooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
  "adaptedCampaign": "Description of how to pivot the campaign",
  "viralFormula": "The 'secret sauce' description",
  "timingAdvice": "Best time/day to post advice",
  "hashtagStrategy": "Description of the hashtag approach",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "soundSuggestions": ["Audio 1", "Audio 2", "Audio 3"],
  "trendInsights": ["Insight 1", "Insight 2", "Insight 3"]
}

CRITICAL RULES:
1. Output MUST be valid JSON only.
2. Do NOT include headings or text outside the JSON.
3. All content must be production-ready.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Validation
    if (data && (data.timingAdvice === "pending" || !data.timingAdvice || !Array.isArray(data.trendHooks) || data.trendHooks.length < 2)) {
      console.log("Missing trend fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure timingAdvice and hashtagStrategy are full paragraphs, and trendHooks is an array of 3-5 strings.");
    }

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "Trend-stealer generation failed.",
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
