import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  getFallbackResponse
} from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: true,
        message: "Method not allowed",
        code: "METHOD_NOT_ALLOWED"
      });
    }

    const body = req.body || {};
    const brand = body.brand || "Brand";
    const product = body.product || "Product";
    const audience = body.audience || "Audience";
    const theme = body.theme || "luxury";

    const themeLabel = getThemeLabel(theme);

    const client = getGroqClient();

    const systemPrompt = `
You are a world-class brand strategist AI.

CRITICAL RULES:
- You MUST return ONLY valid JSON
- Do NOT include explanations, markdown, or any text outside JSON
- Output must be strictly parseable JSON
- Follow the schema exactly

Return ONLY this JSON format:

{
  "positioning": "",
  "keyMessage": "",
  "viralHooks": [],
  "sloganIdeas": [],
  "platformStrategy": "",
  "competitorAngle": ""
}

Guidelines:
- No placeholders like "Hook 1" or "Slogan 1"
- Be specific, realistic, and marketing-grade
- Tailor output to brand, product, audience, and theme
- Make hooks viral and emotionally engaging
`;

    const userPrompt = `
Create a high-performing brand strategy.

Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

Return a complete strategy following the JSON format exactly.
`;

    try {
      const data = await callGroqJSON<any>(
        client,
        systemPrompt,
        userPrompt,
        "strategy",
        { brand, product, audience }
      );

      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Strategy Error in generate-strategy.ts:", err?.message || err);

      return res.status(200).json(
        getFallbackResponse("strategy", { brand, product, audience })
      );
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-strategy.ts:", globalErr);

    return res.status(500).json({
      error: true,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
}