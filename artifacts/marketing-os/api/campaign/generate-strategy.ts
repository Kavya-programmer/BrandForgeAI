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

    const systemPrompt = "You are a world-class brand strategist. Your ONLY task is to return a valid JSON object. Do NOT include any conversational text, markdown, or headings outside the JSON. No headings like 'Audience Psychology', 'Copy', or 'Platform Strategy'.";
    const userPrompt = `Develop a strategic marketing plan for:
Brand: ${brand}
Product: ${product}
Target Audience: ${audience}
Theme: ${themeLabel}

You MUST return EXACTLY this JSON structure, with NO additional text:
{
  "audiencePsychology": {
    "emotionalTriggers": "Concise list of emotional drivers",
    "logicalTriggers": "Concise list of rational reasons"
  },
  "platformStrategy": {
    "tiktok": "1-2 strategic sentences",
    "instagram": "1-2 strategic sentences",
    "youtube": "1-2 strategic sentences",
    "linkedin": "1-2 strategic sentences"
  }
}

CRITICAL RULES:
1. Output MUST be valid JSON only.
2. NO text outside the JSON.
3. NO headings or markdown.
4. Platform fields MUST be 1-2 concise sentences (no bullet points).`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);
    console.log("[DEBUG] Parsed JSON Data:", data);

    // Validation
    if (data && (!data.audiencePsychology || !data.platformStrategy || !data.platformStrategy.tiktok)) {
      console.log("Missing required strategy fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure all fields in the JSON structure are fully populated with high-quality strategic insights.");
      console.log("[DEBUG] Retried Parsed JSON Data:", data);
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