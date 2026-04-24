import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  CURATED_INFLUENCERS,
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

    const systemPrompt = `You are a world-class brand strategist. 
STRICT RULES:
1. Return ONLY a valid JSON object. 
2. Do NOT use any prior examples, unrelated brands, or legacy data (e.g., Nike, shoes, or generic teen audiences) unless specifically provided in the input.
3. All output MUST strictly align with the provided brand input: "${brand}".
4. No conversational text. No markdown.`;

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

CRITICAL: If the brand is "${brand}", the output must NOT mention any other brands like Nike, Adidas, or unrelated industries. Platform fields MUST be 1-2 concise sentences (no bullet points).`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Hard Validation: Check for context contamination
    if (data && containsForbidden(data, brand, product, audience)) {
      console.warn("Context contamination detected in generate-strategy.ts, retrying with stricter prompt...");
      data = await callGroqJSON<any>(client, systemPrompt + "\nSTRICT: You previously mentioned unrelated brands or industries. RECTIFY THIS. ONLY use the provided brand details.", userPrompt);
    }

    // Validation
    if (data && (!data.audiencePsychology || !data.platformStrategy || !data.platformStrategy.tiktok)) {
      console.log("Missing required strategy fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure all fields in the JSON structure are fully populated with high-quality strategic insights.");
    }

    if (!data || (data && containsForbidden(data, brand, product, audience))) {
      return res.status(200).json({
        error: true,
        message: "Strategy generation produced unrelated content. Please try again with more specific inputs.",
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