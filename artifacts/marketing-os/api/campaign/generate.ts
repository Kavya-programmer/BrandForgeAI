import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, computeViralityScore, getEstimatedViews, getThemeLabel, normalizeBulletPoints } from "../../src/lib/campaign-logic.js";

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
    } catch (err: any) {
      // Fallback response if Groq fails or key is missing
      console.error("Groq Generation Error:", err?.message || err);
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
        estimatedViews: "1M+ views",
        notice: "AI generation failed, returning fallback data."
      });
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in generate.ts:", globalErr);
    return res.status(500).json({
      error: true,
      message: "Internal server error during campaign generation",
      code: "INTERNAL_SERVER_ERROR",
      details: globalErr?.message || String(globalErr)
    });
  }
}
