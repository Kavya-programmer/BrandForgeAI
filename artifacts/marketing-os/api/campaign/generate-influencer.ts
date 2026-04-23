import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  CURATED_INFLUENCERS,
  unifyResponse
} from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: true,
        message: "Method not allowed",
        data: null
      });
    }

    const { brand = "Brand", product = "Product", audience = "Audience", theme = "luxury" } = req.body || {};
    const themeLabel = getThemeLabel(theme);
    const client = getGroqClient();

    const systemPrompt = "You are an influencer marketing specialist. Return ONLY valid JSON. Every field is MANDATORY. No placeholders.";
    const userPrompt = `Select and develop an influencer persona for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

Available curated influencers: ${JSON.stringify(CURATED_INFLUENCERS)}

You MUST return these fields in JSON:
1. selectedInfluencerName (Full name)
2. handle (Social media handle)
3. audienceSize (e.g., '1.2M')
4. bio (Influencer bio)
5. location (City/Country)
6. age (e.g., '24-28')
7. aesthetic (Visual style, e.g., 'Minimalist High-End')
8. platforms (Array of platforms, e.g., ['Instagram', 'TikTok'])
9. influencerTypes (Array of types, e.g., ['Tech Reviewer', 'Lifestyle'])
10. contentStyle (Description of their content)
11. contentPillars (Array of 3 pillars)
12. brandCollabAngle (Why this brand fits them)
13. collaborationIdeas (Array of 3 specific post ideas)
14. sampleCaptions (Array of 2 captions)
15. characterStory (Deep background story for this persona)
16. viralityExplanation (Why they will drive views)

CRITICAL: NO 'pending' or 'TBD'. Every field must be a detailed string or populated array.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Validation
    if (data && (data.characterStory === "pending" || !data.characterStory || !Array.isArray(data.collaborationIdeas))) {
      console.log("Missing influencer fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure characterStory is a full paragraph and collaborationIdeas is an array.");
    }

    if (!data) {
      return res.status(200).json({
        error: true,
        message: "Influencer matching failed.",
        data: null
      });
    }

    return res.status(200).json({
      error: false,
      message: "Success",
      data: unifyResponse(data, brand, product, audience, theme)
    });

  } catch (err: any) {
    console.error("Fatal API Error:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      data: null
    });
  }
}
