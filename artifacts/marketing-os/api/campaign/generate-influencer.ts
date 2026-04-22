import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel, CURATED_INFLUENCERS } from "../_lib/campaign-logic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, product, audience, theme } = req.body;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<any>(client, "Influencer expert.", `Match influencer for ${brand}, ${product}, ${audience}, ${themeLabel}. Curated list: ${JSON.stringify(CURATED_INFLUENCERS)}`);
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ ...CURATED_INFLUENCERS[1], brandCollabAngle: "Perfect fit", collaborationIdeas: ["Post 1"], sampleCaptions: ["Check it out!"] });
  }
}
