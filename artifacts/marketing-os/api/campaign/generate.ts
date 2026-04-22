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
        `You are a world-class marketing strategist. Return ONLY valid JSON.`,
        `Create a marketing campaign for: Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Return JSON with: campaignIdea, keyMessage, coreStrategy, socialContent, videoStoryboard, adScript, brandPositioning, influencerAngles`,
        "generate",
        { brand, product, audience }
      );

      return res.status(200).json(unifyResponse(data, brand, product, audience, theme));

    } catch (err: any) {
      console.error("Groq Generation Error:", err?.message || err);
      return res.status(200).json(getFallbackResponse("generate", { brand, product, audience }));
    }

  } catch (globalErr: any) {
    console.error("Fatal API Error:", globalErr);

    return res.status(500).json({
      error: true,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
}