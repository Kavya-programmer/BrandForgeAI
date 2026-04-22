import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, getFallbackResponse, unifyResponse } from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: true, message: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
    }

    const body = req.body || {};
    const previousResponse = body.previousResponse || {};
    const refinement = body.refinement || "";
    const brand = body.brand || "Brand";
    const product = body.product || "Product";
    const audience = body.audience || "Audience";
    const theme = body.theme || "luxury";

    try {
      const client = getGroqClient();
      if (!client) throw new Error("GROQ_API_KEY_MISSING");
      
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert copy editor. Refine the provided marketing content according to the instructions. You MUST return valid JSON matching the full campaign schema." },
          { role: "assistant", content: typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse) },
          { role: "user", content: `Refine this content: ${refinement}. Ensure you return a full JSON object with: campaignIdea, keyMessage, coreStrategy, socialContent, videoStoryboard, adScript, and brandPositioning.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 3000,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const data = JSON.parse(raw);

      return res.status(200).json(unifyResponse(data, brand, product, audience, theme));
    } catch (err: any) {
      console.error("Groq Refine Error in refine.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("refine", { brand, product, audience }));
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in refine.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
