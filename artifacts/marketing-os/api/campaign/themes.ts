import type { VercelRequest, VercelResponse } from "@vercel/node";
import { THEMES } from "../_lib/campaign-logic";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ themes: THEMES });
}
