import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient, getFallbackResponse } from "../../src/lib/campaign-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: true, message: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
    }

    const body = req.body || {};
    const previousResponse = body.previousResponse || "";
    const refinement = body.refinement || "";

    try {
      const client = getGroqClient();
      if (!client) throw new Error("GROQ_API_KEY_MISSING");
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert copy editor and marketing strategist. Your task is to refine the provided content according to the user's instructions. Ensure the result is professional, high-quality, and realistic. Do NOT return placeholders or 'Not available'." },
          { role: "assistant", content: typeof previousResponse === 'string' ? previousResponse : JSON.stringify(previousResponse) },
          { role: "user", content: refinement }
        ],
        temperature: 0.85,
        max_tokens: 3000,
      });
      const refined = completion.choices[0]?.message?.content ?? "Refinement failed to generate content.";
      return res.status(200).json({ refinedContent: refined, refinement });
    } catch (err: any) {
      console.error("Groq Refine Error in refine.ts:", err?.message || err);
      return res.status(200).json(getFallbackResponse("refine"));
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in refine.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
