import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel } from "../_lib/campaign-logic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, product, audience, theme } = req.body;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<any>(client, "Viral marketing expert.", `Trend Jacking for ${brand}, ${product}, ${audience}, ${themeLabel}`);
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ currentTrends: [{ trend: "POV", platform: "TikTok", virality: "Mega", howToUse: "Adapt to product" }], adaptedCampaign: "Viral push", trendHooks: ["Hook 1"], viralFormula: "Hook + Value" });
  }
}
