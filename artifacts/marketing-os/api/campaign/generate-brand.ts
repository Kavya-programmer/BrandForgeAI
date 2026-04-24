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

    const systemPrompt = `You are an expert brand identity designer. 
STRICT RULES:
1. Return ONLY a valid JSON object. 
2. Do NOT use any prior examples, unrelated brands, or legacy data (e.g., Nike, shoes, or generic teen audiences) unless specifically provided in the input.
3. All output MUST strictly align with the provided brand input: "${brand}".
4. No conversational text. No markdown.`;

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

CRITICAL: If the brand is "${brand}", the output must NOT mention any other brands like Nike, Adidas, or unrelated industries.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Hard Validation: Check for context contamination
    if (data && containsForbidden(data, brand, product, audience)) {
      console.warn("Context contamination detected in generate-brand.ts, retrying with stricter prompt...");
      data = await callGroqJSON<any>(client, systemPrompt + "\nSTRICT: You previously mentioned unrelated brands or industries. RECTIFY THIS. ONLY use the provided brand details.", userPrompt);
    }

    // Validation
    if (data && (data.logoConceptDescription === "pending" || !data.logoConceptDescription || !data.aestheticDirection)) {
      console.log("Missing brand fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure logoConceptDescription and aestheticDirection are fully written.");
    }

    if (!data || (data && containsForbidden(data, brand, product, audience))) {
      return res.status(200).json({
        error: true,
        message: "Brand identity generation produced unrelated content. Please try again with more specific inputs.",
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
