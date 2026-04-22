import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel } from "../_lib/campaign-logic.js";

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
      const data = await callGroqJSON<any>(client, "Brand identity designer.", `Brand Identity for ${brand}, ${product}, ${audience}, ${themeLabel}`);
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("Groq Brand Error:", err?.message || err);
      return res.status(200).json({ tagline: "The Future", brandArchetype: "Creator", brandVoice: "Bold", colorPalette: [{ name: "Primary", hex: "#000000", usage: "Main" }], uniqueSellingPoints: ["Quality"], notice: "AI fallback" });
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate-brand.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
