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

    const systemPrompt = "You are a viral marketing expert and trend analyst. Return ONLY valid JSON. Every field is MANDATORY. No placeholders.";
    const userPrompt = `Create a trend-jacking campaign for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

You MUST return these fields in JSON:
1. currentTrends (Array of 2 objects with 'trend', 'platform', 'virality', 'howToUse')
2. trendHooks (Array of 3-5 catchy hooks related to the trends)
3. adaptedCampaign (Description of how to pivot the campaign for these trends)
4. viralFormula (The 'secret sauce' for this campaign to go viral)
5. timingAdvice (Best time/day to post for maximum impact)
6. hashtagStrategy (Description of the hashtag approach)
7. hashtags (Array of 5-10 specific hashtags)
8. soundSuggestions (Array of 3 trending audio ideas)
9. trendInsights (Array of 3 deep platform-specific insights)

CRITICAL: NO 'pending' or 'TBD'. Trend Hooks MUST be an array of strings.`;

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
