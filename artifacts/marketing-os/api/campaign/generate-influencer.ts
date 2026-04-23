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

    const systemPrompt = "You are an influencer marketing specialist. Return ONLY a valid JSON object. No conversational text. No markdown. No headings outside the JSON object.";
    const userPrompt = `Select and develop an influencer persona for:
Brand: ${brand}
Product: ${product}
Audience: ${audience}
Theme: ${themeLabel}

Available curated influencers: ${JSON.stringify(CURATED_INFLUENCERS)}

You MUST return exactly this JSON structure:
{
  "selectedInfluencerName": "Full name",
  "handle": "Social media handle",
  "audienceSize": "e.g., 1.2M",
  "bio": "Influencer bio description",
  "location": "City/Country",
  "age": "e.g., 24-28",
  "aesthetic": "Visual style description",
  "platforms": ["Instagram", "TikTok"],
  "influencerTypes": ["Type 1", "Type 2"],
  "contentStyle": "Description of their content approach",
  "contentPillars": ["Pillar 1", "Pillar 2", "Pillar 3"],
  "brandCollabAngle": "Why this brand fits them",
  "collaborationIdeas": ["Idea 1", "Idea 2", "Idea 3"],
  "sampleCaptions": ["Caption 1", "Caption 2"],
  "characterStory": "Deep background story for this persona",
  "viralityExplanation": "Why they will drive views"
}

CRITICAL RULES:
1. Output MUST be valid JSON only.
2. Do NOT include headings or text outside the JSON.
3. All content must be production-ready.`;

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
