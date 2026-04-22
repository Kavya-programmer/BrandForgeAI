import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel } from "../_lib/campaign-logic";

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
      const data = await callGroqJSON<any>(client, "Video director.", `Video plan for ${brand}, ${product}, ${audience}, ${themeLabel}`);
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Video Plan Error:", err?.message || err);
      return res.status(200).json({ script: "Video script", scenes: [{ sceneNumber: 1, duration: "5s", visual: "Hero shot", cameraAngle: "Wide", audio: "Music", textOverlay: brand }], versions: { tiktokViral: "TikTok adapt", luxuryCinematic: "Luxury adapt", memeVersion: "Meme adapt" }, notice: "AI fallback" });
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-video-plan.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
