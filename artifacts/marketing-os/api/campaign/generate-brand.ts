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

    const systemPrompt = "You are an expert brand identity designer. Return ONLY valid JSON. Every field is MANDATORY. No placeholders.";
    const userPrompt = `Create a detailed brand identity for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

You MUST return these fields in JSON:
1. tagline (Catchy 3-5 word tagline)
2. brandArchetype (e.g., The Hero, The Outlaw)
3. colorPalette (Array of 3-5 objects with 'name' and 'hex' keys)
4. brandVoice (Description of how the brand speaks)
5. fontPairings (Array of 2 strings: 'Heading: Name', 'Body: Name')
6. logoConceptDescription (Detailed visual description of a logo)
7. aestheticDirection (Overall visual style, e.g., 'Minimalist Brutalism')
8. moodboardKeywords (Array of 5 descriptive keywords)

CRITICAL: NO 'pending' or 'TBD'. Every field must be production-ready content.`;

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
