import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const allKeys = Object.keys(process.env);
  const groqExists = !!process.env.GROQ_API_KEY;
  const groqLength = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0;
  
  return res.status(200).json({
    status: "ok",
    env: {
      GROQ_API_KEY_EXISTS: groqExists,
      GROQ_API_KEY_LENGTH: groqLength,
      ENV_KEYS_COUNT: allKeys.length,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
  });
}
