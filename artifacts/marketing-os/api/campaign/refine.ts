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

    const { previousResponse = {}, refinement = "", brand = "Brand", product = "Product", audience = "Audience", theme = "luxury" } = req.body || {};

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
          { role: "system", content: "You are an expert copy editor. Refine the provided content. Return ONLY valid JSON matching the full campaign schema. No placeholders like 'pending'." },
          { role: "assistant", content: typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse) },
          { role: "user", content: `Refine this content based on this feedback: "${refinement}". Return the FULL campaign JSON with updated fields: campaignIdea, keyMessage, coreStrategy, socialContent, videoStoryboard, adScript, brandPositioning, influencerAngles.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 3000,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const data = safeParse(raw);

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
