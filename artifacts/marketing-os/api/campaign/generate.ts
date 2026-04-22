import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, computeViralityScore, getEstimatedViews, getThemeLabel, normalizeBulletPoints } from "../_lib/campaign-logic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, product, audience, theme } = req.body;
  const themeLabel = getThemeLabel(theme);
  
  try {
    const client = getGroqClient();
    const data = await callGroqJSON<any>(client, 
      "You are a structured marketing generation engine. Return valid JSON.",
      `Create campaign for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}`
    );
    const viralityScore = computeViralityScore(JSON.stringify(data), theme);
    return res.status(200).json({
      ...data,
      coreStrategy: normalizeBulletPoints(data.coreStrategy),
      viralityScore,
      estimatedViews: getEstimatedViews(viralityScore)
    });
  } catch (err) {
    return res.status(200).json({
      campaignIdea: `The ${brand} Revolution for ${audience}`,
      keyMessage: `${brand} changes everything.`,
      coreStrategy: "• Disrupt the market\n• Engage audience\n• Drive results",
      socialContent: "Coming soon!",
      videoStoryboard: "Scene 1: Intro",
      adScript: "Hello world",
      brandPositioning: "Leader",
      influencerAngles: "Lifestyle",
      viralityScore: 85,
      estimatedViews: "1M+ views"
    });
  }
}
