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

    const data = await callGroqJSON<any>(
      client,
      "You are a world-class brand strategist. Return ONLY valid JSON.",
      `Create a comprehensive brand strategy. Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Return fields: campaignIdea, keyMessage, coreStrategy, socialContent, videoStoryboard, adScript, brandPositioning, influencerAngles.`
    );

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