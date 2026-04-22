import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, getThemeLabel } from "../_lib/campaign-logic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, product, audience, theme } = req.body;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<any>(client, "World class brand strategist.", `Strategy for ${brand}, ${product}, ${audience}, ${themeLabel}`);
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ positioning: "Market leader", keyMessage: "Innovation", viralHooks: ["Hook 1"], sloganIdeas: ["Slogan 1"], platformStrategy: "Social first", competitorAngle: "Unique" });
  }
}
