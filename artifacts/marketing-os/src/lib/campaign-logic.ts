import Groq from "groq-sdk";

export const THEMES = [
  { id: "luxury", label: "Luxury / Emily in Paris", description: "Elegant, aspirational, cinematic — romantic branding and emotional storytelling" },
  { id: "genz_viral", label: "Gen Z Viral TikTok", description: "Fast-paced, trendy, raw, authentic — built for algorithm virality" },
  { id: "corporate", label: "Corporate Professional", description: "Clean, trustworthy, data-driven — perfect for B2B and enterprise brands" },
  { id: "emotional", label: "Emotional Storytelling", description: "Heartfelt, narrative-driven, tear-jerking — connects on a human level" },
  { id: "minimal_apple", label: "Minimal Apple Style", description: "Sleek, product-focused, whisper-quiet elegance — let the product speak" },
  { id: "high_energy_sports", label: "High Energy Sports", description: "Explosive, motivational, fast cuts — built for athletes and action brands" },
  { id: "trend_stealer", label: "Trend Stealer Mode", description: "Hijacks current viral TikTok/IG trends and adapts them to your brand instantly" },
  { id: "ai_influencer", label: "AI Influencer Mode", description: "Creates a complete fictional influencer persona to front your campaign" },
];

export const CURATED_INFLUENCERS = [
  { name: "Cristiano Ronaldo", handle: "@cristiano", age: 39, location: "Riyadh, Saudi Arabia", audienceSize: "600M+ followers", bio: "Join my NFT journey on @Binance.", aesthetic: "Athletic, premium", contentStyle: "Sports + lifestyle", platforms: ["Instagram"], influencerTypes: ["Sports"], contentPillars: ["Football"] },
  { name: "Emma Chamberlain", handle: "@emmachamberlain", age: 23, location: "Los Angeles, CA", audienceSize: "16M+ followers", bio: "anything goes podcast", aesthetic: "Relatable Gen Z", contentStyle: "Raw vlogs", platforms: ["YouTube"], influencerTypes: ["Lifestyle"], contentPillars: ["Fashion"] }
];

export function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;

  console.log("🔑 API KEY EXISTS:", !!key);

  if (!key) {
    console.error("❌ GROQ_API_KEY is missing");
  }

  return key ? new Groq({ apiKey: key }) : null;
}

export function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

export async function callGroqJSON<T = Record<string, unknown>>(
  client: Groq | null,
  systemPrompt: string,
  userPrompt: string,
  fallbackType?: string,
  fallbackContext?: any,
  maxRetries = 2
): Promise<T> {

  console.log("🚀 STARTING GROQ CALL");

  if (!client) {
    console.log("⚠️ NO CLIENT → USING FALLBACK");
    if (fallbackType) return getFallbackResponse(fallbackType, fallbackContext) as T;
    throw new Error("GROQ_KEY_MISSING");
  }

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 3500,
      });

      const raw = completion.choices[0]?.message?.content ?? "";

      try {
        const parsed = JSON.parse(raw);

        console.log("✅ USING REAL AI RESPONSE");

        return parsed as T;
      } catch (e) {
        console.error("❌ INVALID JSON FROM AI:", raw);

        console.log("⚠️ FALLBACK DUE TO INVALID JSON");

        if (fallbackType) return getFallbackResponse(fallbackType, fallbackContext) as T;
        throw new Error("INVALID_JSON_FROM_GROQ");
      }

    } catch (err) {
      console.error("❌ GROQ ERROR:", err);
      lastError = err;

      if (attempt < maxRetries) {
        console.log("🔁 RETRYING...");
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  console.log("⚠️ MAX RETRIES HIT → USING FALLBACK");

  if (fallbackType) return getFallbackResponse(fallbackType, fallbackContext) as T;

  throw lastError;
}