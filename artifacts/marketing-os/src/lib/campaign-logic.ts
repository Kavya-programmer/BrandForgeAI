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
  { name: "Cristiano Ronaldo", handle: "@cristiano", age: 39, location: "Riyadh, Saudi Arabia", audienceSize: "600M+ followers", bio: "Join my NFT journey on @Binance. Click the link below to get started.", aesthetic: "Athletic, premium, high-energy, global, success-oriented", contentStyle: "Professional sports photography mixed with family moments and high-end brand partnerships.", platforms: ["Instagram", "Twitter", "Facebook"], influencerTypes: ["Sports", "Global Icon", "Fitness"], contentPillars: ["Football", "Fitness", "Family", "Luxury Lifestyle"] },
  { name: "Emma Chamberlain", handle: "@emmachamberlain", age: 23, location: "Los Angeles, CA", audienceSize: "16M+ followers", bio: "anything goes podcast", aesthetic: "Relatable, Gen Z, casual chic, vintage, authentic", contentStyle: "Raw, seemingly unedited, highly relatable vlogs and casual high-fashion crossover content.", platforms: ["YouTube", "Instagram", "TikTok"], influencerTypes: ["Lifestyle", "Fashion", "Gen Z"], contentPillars: ["Fashion", "Coffee", "Mental Health", "Vlogs"] },
  { name: "Marques Brownlee", handle: "@mkbhd", age: 30, location: "New Jersey, USA", audienceSize: "18M+ followers", bio: "MKBHD: Quality Tech Videos | YouTuber | Geek | Ultimate Frisbee Player", aesthetic: "Crisp, ultra-high definition, professional, tech-focused, clean", contentStyle: "In-depth, highly produced technology reviews and commentary.", platforms: ["YouTube", "Twitter", "Instagram"], influencerTypes: ["Tech", "Reviewer", "Educational"], contentPillars: ["Smartphones", "EVs", "Consumer Tech", "Audio"] },
  { name: "MrBeast", handle: "@mrbeast", age: 26, location: "Greenville, NC", audienceSize: "250M+ followers", bio: "I want to make the world a better place before I die.", aesthetic: "High-energy, colorful, loud, philanthropic, extreme", contentStyle: "Massive scale challenges, philanthropy, and highly engaging fast-paced entertainment.", platforms: ["YouTube", "TikTok", "Instagram"], influencerTypes: ["Entertainment", "Philanthropy", "Mega-creator"], contentPillars: ["Challenges", "Giveaways", "Stunts", "Snacks"] },
  { name: "Alix Earle", handle: "@alixearle", age: 23, location: "Miami, FL", audienceSize: "6M+ followers", bio: "Hot mess podcast out now", aesthetic: "Glamorous, 'GRWM', unfiltered, party lifestyle, trendsetter", contentStyle: "Get Ready With Me (GRWM) videos, makeup tutorials, and college/party lifestyle vlogging.", platforms: ["TikTok", "Instagram", "Snapchat"], influencerTypes: ["Beauty", "Lifestyle", "Gen Z"], contentPillars: ["Makeup", "Outfits", "Nightlife", "Storytime"] }
];

export function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  return key ? new Groq({ apiKey: key }) : null;
}

export function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

export async function callGroqJSON<T = Record<string, unknown>>(
  client: Groq | null,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 2
): Promise<T> {
  if (!client) throw new Error("GROQ_KEY_MISSING");
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 3500,
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      return JSON.parse(raw) as T;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw lastError;
}

export function computeViralityScore(content: string, theme: string): number {
  const lower = content.toLowerCase();
  const hooks = ["imagine", "the secret", "here's why", "stop doing", "viral"].filter(p => lower.includes(p)).length * 5;
  let base = 50 + hooks + Math.floor(Math.random() * 10);
  if (theme === "genz_viral" || theme === "trend_stealer") base += 15;
  return Math.min(Math.max(base, 40), 99);
}

export function getEstimatedViews(score: number): string {
  if (score >= 90) return "5M–20M+ views likely";
  if (score >= 80) return "1M–5M views likely";
  return "100K–500K views likely";
}

export function normalizeBulletPoints(value: unknown): string {
  if (typeof value !== "string") return "Not available";
  return value.split("\n").filter(Boolean).map(l => `• ${l.replace(/^[-*•\d.)\s]+/, "").trim()}`).join("\n");
}
