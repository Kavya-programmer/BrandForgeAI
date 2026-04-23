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

    const systemPrompt = "You are an expert brand identity designer. Return ONLY a valid JSON object. No conversational text. No markdown. No headings outside the JSON object.";
    const userPrompt = `Create a detailed brand identity for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

You MUST return exactly this JSON structure:
{
  "tagline": "Catchy 3-5 word tagline",
  "brandArchetype": "e.g., The Hero, The Outlaw",
  "colorPalette": [
    {"name": "Color 1", "hex": "#HEX"},
    {"name": "Color 2", "hex": "#HEX"},
    {"name": "Color 3", "hex": "#HEX"}
  ],
  "brandVoice": "Description of how the brand speaks",
  "fontPairings": ["Heading: Name", "Body: Name"],
  "logoConceptDescription": "Detailed visual description of a logo",
  "aestheticDirection": "Overall visual style description",
  "moodboardKeywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"]
}

CRITICAL RULES:
1. Output MUST be valid JSON only.
2. Do NOT include headings or text outside the JSON.
3. All content must be production-ready.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Validation
    if (data && (data.logoConceptDescription === "pending" || !data.logoConceptDescription || !data.aestheticDirection)) {
      console.log("Missing brand fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure logoConceptDescription and aestheticDirection are fully written.");
    }

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "Brand identity generation failed.",
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
