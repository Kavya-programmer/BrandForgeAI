import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel } from "../_lib/campaign-logic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, product, audience, theme } = req.body;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<any>(client, "Brand identity designer.", `Brand Identity for ${brand}, ${product}, ${audience}, ${themeLabel}`);
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ tagline: "The Future", brandArchetype: "Creator", brandVoice: "Bold", colorPalette: [{ name: "Primary", hex: "#000000", usage: "Main" }], uniqueSellingPoints: ["Quality"] });
  }
}
