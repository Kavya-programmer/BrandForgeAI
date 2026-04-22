import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGroqClient } from "../_lib/campaign-logic";

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
      if (!client) throw new Error("Missing Key");
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: "Refine marketing content." }, { role: "assistant", content: previousResponse }, { role: "user", content: refinement }],
        temperature: 0.85,
        max_tokens: 3000,
      });
      const refined = completion.choices[0]?.message?.content ?? previousResponse;
      return res.status(200).json({ refinedContent: refined, refinement });
    } catch (err: any) {
      console.error("Groq Refine Error:", err?.message || err);
      return res.status(200).json({ refinedContent: previousResponse, refinement, notice: "Refinement fallback" });
    }
  } catch (globalErr: any) {
    console.error("Fatal API Error in refine.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
