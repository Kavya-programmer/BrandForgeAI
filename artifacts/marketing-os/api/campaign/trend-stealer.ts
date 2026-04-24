import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  unifyResponse,
  containsForbidden
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

    const { brand = "", product = "", audience = "", theme = "luxury" } = req.body || {};
    
    if (!brand || !product) {
      return res.status(400).json({ error: true, message: "Brand and Product are required." });
    }

    const themeLabel = getThemeLabel(theme);
    const client = getGroqClient();

    const systemPrompt = `You are a viral marketing expert and trend analyst. 
STRICT RULES:
1. Return ONLY a valid JSON object. 
2. Do NOT use any prior examples, unrelated brands, or legacy data (e.g., Nike, shoes, or generic teen audiences) unless specifically provided in the input.
3. All output MUST strictly align with the provided brand input: "${brand}".
4. No conversational text. No markdown.`;

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

CRITICAL: If the brand is "${brand}", the output must NOT mention any other brands like Nike, Adidas, or unrelated industries.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Hard Validation: Check for context contamination
    if (data && containsForbidden(data, brand, product, audience)) {
      console.warn("Context contamination detected in trend-stealer.ts, retrying with stricter prompt...");
      data = await callGroqJSON<any>(client, systemPrompt + "\nSTRICT: You previously mentioned unrelated brands or industries. RECTIFY THIS. ONLY use the provided brand details.", userPrompt);
    }

    // Validation
    if (data && (data.timingAdvice === "pending" || !data.timingAdvice || !Array.isArray(data.trendHooks) || data.trendHooks.length < 2)) {
      console.log("Missing trend fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure timingAdvice and hashtagStrategy are full paragraphs, and trendHooks is an array of 3-5 strings.");
    }

    if (!data || (data && containsForbidden(data, brand, product, audience))) {
      return res.status(200).json({
        error: true,
        message: "Trend-jacking generation produced unrelated content. Please try again with more specific inputs.",
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
