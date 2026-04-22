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

    const data = await callGroqJSON<any>(
      client,
      "You are a world-class marketing strategist. Return ONLY valid JSON.",
      `Create a full marketing campaign. Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Return fields: campaignIdea, keyMessage, coreStrategy, socialContent, videoStoryboard, adScript, brandPositioning, influencerAngles.`
    );

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "AI generation failed. Please check your API key or parameters.",
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