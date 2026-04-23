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

    const systemPrompt = "You are an expert video director. Return ONLY valid JSON. Every field is MANDATORY. No placeholders.";
    const userPrompt = `Create a detailed video production plan for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

You MUST return these fields in JSON:
1. scenes (Array of 3-5 objects with 'sceneNumber', 'duration', 'visual', 'audio', 'cameraAngle', 'textOverlay')
2. adScript (Complete spoken script)
3. musicStyle (Genre and mood)
4. editingStyle (e.g., 'Fast-paced rhythmic cuts')
5. captionsText (Complete text for on-screen captions)
6. runwayPrompt (AI video generation prompt for Runway)
7. pikaPrompt (AI video generation prompt for Pika)
8. heygen_prompt (Script for AI spokesperson in HeyGen)
9. thumbnailPrompt (Prompt for a YouTube/TikTok thumbnail image)
10. versions (Object with keys: 'tiktokViral', 'luxuryCinematic', 'memeVersion' - each value is a description of how to adapt the video)

CRITICAL: NO 'pending'. All prompts must be descriptive and ready to use.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Validation
    if (data && (data.captionsText === "pending" || !data.captionsText || !Array.isArray(data.scenes))) {
      console.log("Missing video fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure captionsText is fully written and scenes is a complete array.");
    }

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "Video plan generation failed.",
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
