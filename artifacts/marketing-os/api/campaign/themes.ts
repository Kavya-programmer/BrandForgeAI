import type { VercelRequest, VercelResponse } from "@vercel/node";
import { THEMES } from "../_lib/campaign-logic.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: true, message: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
    }
    return res.status(200).json({ themes: THEMES });
  } catch (globalErr: any) {
    console.error("Fatal API Error in themes.ts:", globalErr);
    return res.status(500).json({ error: true, message: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
}
