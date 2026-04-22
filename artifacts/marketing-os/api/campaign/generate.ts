import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, callGroqJSON, computeViralityScore, getEstimatedViews, getThemeLabel, normalizeBulletPoints, getFallbackResponse } from "../../src/lib/campaign-logic.js";

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
        "You are a professional marketing strategist. Every field must contain detailed, realistic, and high-converting marketing content. Do NOT return placeholders like 'Hook 1', 'Slogan 1', or 'Not available'. Ensure the output is a valid JSON object.",
        `Create a comprehensive marketing campaign for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}. Provide: campaignIdea, keyMessage, coreStrategy (list), socialContent, videoStoryboard, adScript, brandPositioning, and influencerAngles.`,
        "generate",
        { brand, product, audience }
      );
      const viralityScore = computeViralityScore(JSON.stringify(data), theme);
      return res.status(200).json({
        ...data,
        coreStrategy: normalizeBulletPoints(data.coreStrategy),
        viralityScore,
        estimatedViews: getEstimatedViews(viralityScore)
      });
    } catch (err: any) {
      console.error("Groq Generation Error in generate.ts:", err?.message || err);
      // Even if everything fails, we return a rich fallback from callGroqJSON or manual fallback
      return res.status(200).json(getFallbackResponse("generate", { brand, product, audience }));
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
