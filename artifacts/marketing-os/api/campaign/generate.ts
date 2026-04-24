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

    const systemPrompt = `You are a world-class marketing strategist. 
STRICT RULES:
1. Return ONLY a valid JSON object. 
2. Do NOT use any prior examples, unrelated brands, or legacy data (e.g., Nike, shoes, or generic teen audiences) unless specifically provided in the input.
3. All output MUST strictly align with the provided brand input: "${brand}".
4. No conversational text. No markdown.`;

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

CRITICAL: If the brand is "${brand}", the output must NOT mention any other brands like Nike, Adidas, or unrelated industries.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Hard Validation: Check for context contamination
    if (data && containsForbidden(data, brand, product, audience)) {
      console.warn("Context contamination detected in generate.ts, retrying with stricter prompt...");
      data = await callGroqJSON<any>(client, systemPrompt + "\nSTRICT: You previously mentioned unrelated brands or industries. RECTIFY THIS. ONLY use the provided brand details.", userPrompt);
    }

    // Validation loop - if essential fields are missing or placeholders, retry once
    if (data && (data.competitorAngle === "pending" || !data.competitorAngle || !Array.isArray(data.viralHooks))) {
      console.log("Missing fields in generate.ts, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure competitorAngle and viralHooks (array) are fully populated.");
    }

    if (!data || (data && containsForbidden(data, brand, product, audience))) {
      return res.status(200).json({
        error: true,
        message: "AI generation produced unrelated content. Please try again with more specific inputs.",
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