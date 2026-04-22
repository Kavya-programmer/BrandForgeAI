import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel, getFallbackResponse } from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: true, message: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
    }

    const body = req.body || {};
    const brand = body.brand || "Brand";
    const product = body.product || "Product";
    const audience = body.audience || "Audience";
    const theme = body.theme || "luxury";

    const themeLabel = getThemeLabel(theme);

    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(
        client, 
        "You are an expert video director and social media content creator. Every field must contain detailed, realistic, and highly engaging video production plans. Do NOT return placeholders like 'Video script' or 'Scene 1'. Ensure the output is a valid JSON object.",
        `Create a detailed video production plan for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Provide: script (full high-converting script), scenes (list with sceneNumber, duration, visual, cameraAngle, audio, and textOverlay), and versions (specific adaptations for tiktokViral, luxuryCinematic, and memeVersion).`,
        "video-plan",
        { brand, product, audience }
      );
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Video Plan Error in generate-video-plan.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("video-plan", { brand, product, audience }));
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-video-plan.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
