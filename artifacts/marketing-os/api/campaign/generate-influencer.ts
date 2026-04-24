import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getGroqClient,
  callGroqJSON,
  getThemeLabel,
  CURATED_INFLUENCERS,
  unifyResponse,
  containsForbidden
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

    const { brand = "", product = "", audience = "", theme = "luxury" } = req.body || {};
    
    if (!brand || !product) {
      return res.status(400).json({ error: true, message: "Brand and Product are required." });
    }

    const themeLabel = getThemeLabel(theme);
    const client = getGroqClient();

    const systemPrompt = `You are an influencer marketing specialist. 
STRICT RULES:
1. Return ONLY a valid JSON object. 
2. Do NOT use any prior examples, unrelated brands, or legacy data (e.g., Nike, shoes, or generic teen audiences) unless specifically provided in the input.
3. All output MUST strictly align with the provided brand input: "${brand}".
4. No conversational text. No markdown.`;

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

CRITICAL: If the brand is "${brand}", the output must NOT mention any other brands like Nike, Adidas, or unrelated industries.`;

    let data = await callGroqJSON<any>(client, systemPrompt, userPrompt);

    // Hard Validation: Check for context contamination
    if (data && containsForbidden(data, brand, product, audience)) {
      console.warn("Context contamination detected in generate-influencer.ts, retrying with stricter prompt...");
      data = await callGroqJSON<any>(client, systemPrompt + "\nSTRICT: You previously mentioned unrelated brands or industries. RECTIFY THIS. ONLY use the provided brand details.", userPrompt);
    }

    // Validation
    if (data && (data.characterStory === "pending" || !data.characterStory || !Array.isArray(data.collaborationIdeas))) {
      console.log("Missing influencer fields, retrying...");
      data = await callGroqJSON<any>(client, systemPrompt, userPrompt + "\nRETRY: Ensure characterStory is a full paragraph and collaborationIdeas is an array.");
    }

    if (!data || (data && containsForbidden(data, brand, product, audience))) {
      return res.status(200).json({
        error: true,
        message: "Influencer generation produced unrelated content. Please try again with more specific inputs.",
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
