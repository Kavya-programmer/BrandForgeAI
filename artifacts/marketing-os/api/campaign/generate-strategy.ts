import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  getFallbackResponse,
  unifyResponse
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

    try {
      const data = await callGroqJSON<any>(
        client,
        "You are a world-class brand strategist. Return ONLY valid JSON.",
        `Create a comprehensive brand strategy and full campaign context for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Provide: positioning, keyMessage, viralHooks, sloganIdeas, platformStrategy, campaignIdea, coreStrategy, socialContent, videoStoryboard, adScript, and brandPositioning.`,
        "strategy",
        { brand, product, audience }
      );

      return res.status(200).json(unifyResponse(data, brand, product, audience, theme));
    } catch (err: any) {
      console.error("Groq Strategy Error in generate-strategy.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("strategy", { brand, product, audience }));
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