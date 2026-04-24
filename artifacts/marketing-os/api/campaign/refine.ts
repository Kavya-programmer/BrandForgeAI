import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, unifyResponse, safeParse } from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: true,
        message: "Method not allowed",
        data: null
      });
    }

    const { previousResponse = {}, refinement = "", brand = "", product = "", audience = "", theme = "luxury" } = req.body || {};

    if (!brand || !product) {
      return res.status(400).json({ error: true, message: "Brand and Product are required." });
    }

    const client = getGroqClient();
    if (!client) {
      return res.status(200).json({
        error: true,
        message: "GROQ_API_KEY missing",
        data: null
      });
    }
    
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: `You are an expert copy editor. 
STRICT RULES:
1. Return ONLY a valid JSON object. 
2. Do NOT use any prior examples, unrelated brands, or legacy data (e.g., Nike, shoes, or generic teen audiences) unless specifically provided in the input.
3. All output MUST strictly align with the provided brand input: "${brand}".
4. No conversational text. No markdown.` },
          { role: "assistant", content: typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse) },
          { role: "user", content: `Refine this content for brand "${brand}" and product "${product}" based on this feedback: "${refinement}". Return the FULL campaign JSON with updated fields: campaignIdea, keyMessage, coreStrategy, socialContent, videoStoryboard, adScript, brandPositioning, influencerAngles. CRITICAL: Ensure no mention of unrelated brands.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 3000,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const data = safeParse(raw);

      // Hard Validation: Check for context contamination
      const { containsForbidden } = await import("../../src/lib/campaign-logic.js");
      if (data && containsForbidden(data, brand, product, audience)) {
        return res.status(200).json({
          error: true,
          message: "Refinement produced unrelated content. Please try again with more specific instructions.",
          data: null
        });
      }

      return res.status(200).json({
        error: false,
        message: "Success",
        data: unifyResponse(data, brand, product, audience, theme)
      });
    } catch (err: any) {
      console.error("Refine Error:", err);
      return res.status(200).json({
        error: true,
        message: "Refinement failed.",
        data: null
      });
    }
  } catch (err: any) {
    console.error("Fatal API Error:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      data: null
    });
  }
}
