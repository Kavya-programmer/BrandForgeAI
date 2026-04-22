import { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

// --- Types & Constants ---
const THEMES = [
  { id: "luxury", label: "Luxury / Emily in Paris", description: "Elegant, aspirational, cinematic — romantic branding and emotional storytelling" },
  { id: "genz_viral", label: "Gen Z Viral TikTok", description: "Fast-paced, trendy, raw, authentic — built for algorithm virality" },
  { id: "corporate", label: "Corporate Professional", description: "Clean, trustworthy, data-driven — perfect for B2B and enterprise brands" },
  { id: "emotional", label: "Emotional Storytelling", description: "Heartfelt, narrative-driven, tear-jerking — connects on a human level" },
  { id: "minimal_apple", label: "Minimal Apple Style", description: "Sleek, product-focused, whisper-quiet elegance — let the product speak" },
  { id: "high_energy_sports", label: "High Energy Sports", description: "Explosive, motivational, fast cuts — built for athletes and action brands" },
  { id: "trend_stealer", label: "Trend Stealer Mode", description: "Hijacks current viral TikTok/IG trends and adapts them to your brand instantly" },
  { id: "ai_influencer", label: "AI Influencer Mode", description: "Creates a complete fictional influencer persona to front your campaign" },
];

const CURATED_INFLUENCERS = [
  { name: "Cristiano Ronaldo", handle: "@cristiano", age: 39, location: "Riyadh, Saudi Arabia", audienceSize: "600M+ followers", bio: "Join my NFT journey on @Binance. Click the link below to get started.", aesthetic: "Athletic, premium, high-energy, global, success-oriented", contentStyle: "Professional sports photography mixed with family moments and high-end brand partnerships.", platforms: ["Instagram", "Twitter", "Facebook"], influencerTypes: ["Sports", "Global Icon", "Fitness"], contentPillars: ["Football", "Fitness", "Family", "Luxury Lifestyle"] },
  { name: "Emma Chamberlain", handle: "@emmachamberlain", age: 23, location: "Los Angeles, CA", audienceSize: "16M+ followers", bio: "anything goes podcast", aesthetic: "Relatable, Gen Z, casual chic, vintage, authentic", contentStyle: "Raw, seemingly unedited, highly relatable vlogs and casual high-fashion crossover content.", platforms: ["YouTube", "Instagram", "TikTok"], influencerTypes: ["Lifestyle", "Fashion", "Gen Z"], contentPillars: ["Fashion", "Coffee", "Mental Health", "Vlogs"] },
  { name: "Marques Brownlee", handle: "@mkbhd", age: 30, location: "New Jersey, USA", audienceSize: "18M+ followers", bio: "MKBHD: Quality Tech Videos | YouTuber | Geek | Ultimate Frisbee Player", aesthetic: "Crisp, ultra-high definition, professional, tech-focused, clean", contentStyle: "In-depth, highly produced technology reviews and commentary.", platforms: ["YouTube", "Twitter", "Instagram"], influencerTypes: ["Tech", "Reviewer", "Educational"], contentPillars: ["Smartphones", "EVs", "Consumer Tech", "Audio"] },
  { name: "MrBeast", handle: "@mrbeast", age: 26, location: "Greenville, NC", audienceSize: "250M+ followers", bio: "I want to make the world a better place before I die.", aesthetic: "High-energy, colorful, loud, philanthropic, extreme", contentStyle: "Massive scale challenges, philanthropy, and highly engaging fast-paced entertainment.", platforms: ["YouTube", "TikTok", "Instagram"], influencerTypes: ["Entertainment", "Philanthropy", "Mega-creator"], contentPillars: ["Challenges", "Giveaways", "Stunts", "Snacks"] },
  { name: "Alix Earle", handle: "@alixearle", age: 23, location: "Miami, FL", audienceSize: "6M+ followers", bio: "Hot mess podcast out now", aesthetic: "Glamorous, 'GRWM', unfiltered, party lifestyle, trendsetter", contentStyle: "Get Ready With Me (GRWM) videos, makeup tutorials, and college/party lifestyle vlogging.", platforms: ["TikTok", "Instagram", "Snapchat"], influencerTypes: ["Beauty", "Lifestyle", "Gen Z"], contentPillars: ["Makeup", "Outfits", "Nightlife", "Storytime"] }
];

// --- Helper Functions ---
function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  return key ? new Groq({ apiKey: key }) : null;
}

function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

async function callGroqJSON<T = Record<string, unknown>>(
  client: Groq | null,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 2
): Promise<T> {
  if (!client) throw new Error("GROQ_KEY_MISSING");
  let lastError: unknown;
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

function computeViralityScore(content: string, theme: string): number {
  const lower = content.toLowerCase();
  const hooks = ["imagine", "the secret", "here's why", "stop doing", "viral"].filter(p => lower.includes(p)).length * 5;
  let base = 50 + hooks + Math.floor(Math.random() * 10);
  if (theme === "genz_viral" || theme === "trend_stealer") base += 15;
  return Math.min(Math.max(base, 40), 99);
}

function getEstimatedViews(score: number): string {
  if (score >= 90) return "5M–20M+ views likely";
  if (score >= 80) return "1M–5M views likely";
  return "100K–500K views likely";
}

function normalizeBulletPoints(value: unknown): string {
  if (typeof value !== "string") return "Not available";
  return value.split("\n").filter(Boolean).map(l => `• ${l.replace(/^[-*•\d.)\s]+/, "").trim()}`).join("\n");
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { route } = req.query;
  const path = Array.isArray(route) ? route.join("/") : route || "";

  // 1. GET Themes
  if (req.method === "GET" && path === "themes") {
    return res.status(200).json({ themes: THEMES });
  }

  // 2. POST Generate
  if (req.method === "POST" && path === "generate") {
    const { brand, product, audience, theme } = req.body;
    const themeLabel = getThemeLabel(theme);
    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(client, 
        "You are a structured marketing generation engine. Return valid JSON.",
        `Create campaign for Brand: ${brand}, Product: ${product}, Audience: ${audience}, Theme: ${themeLabel}`
      );
      const viralityScore = computeViralityScore(JSON.stringify(data), theme);
      return res.status(200).json({
        ...data,
        coreStrategy: normalizeBulletPoints(data.coreStrategy),
        viralityScore,
        estimatedViews: getEstimatedViews(viralityScore)
      });
    } catch (err) {
      return res.status(200).json({
        campaignIdea: `The ${brand} Revolution for ${audience}`,
        keyMessage: `${brand} changes everything.`,
        coreStrategy: "• Disrupt the market\n• Engage audience\n• Drive results",
        socialContent: "Coming soon!",
        videoStoryboard: "Scene 1: Intro",
        adScript: "Hello world",
        brandPositioning: "Leader",
        influencerAngles: "Lifestyle",
        viralityScore: 85,
        estimatedViews: "1M+ views"
      });
    }
  }

  // 3. POST Strategy
  if (req.method === "POST" && path === "generate-strategy") {
    const { brand, product, audience, theme } = req.body;
    const themeLabel = getThemeLabel(theme);
    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(client, "World class brand strategist.", `Strategy for ${brand}, ${product}, ${audience}, ${themeLabel}`);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ positioning: "Market leader", keyMessage: "Innovation", viralHooks: ["Hook 1"], sloganIdeas: ["Slogan 1"], platformStrategy: "Social first", competitorAngle: "Unique" });
    }
  }

  // 4. POST Video Plan
  if (req.method === "POST" && path === "generate-video-plan") {
    const { brand, product, audience, theme } = req.body;
    const themeLabel = getThemeLabel(theme);
    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(client, "Video director.", `Video plan for ${brand}, ${product}, ${audience}, ${themeLabel}`);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ script: "Video script", scenes: [{ sceneNumber: 1, duration: "5s", visual: "Hero shot", cameraAngle: "Wide", audio: "Music", textOverlay: brand }], versions: { tiktokViral: "TikTok adapt", luxuryCinematic: "Luxury adapt", memeVersion: "Meme adapt" } });
    }
  }

  // 5. POST Brand
  if (req.method === "POST" && path === "generate-brand") {
    const { brand, product, audience, theme } = req.body;
    const themeLabel = getThemeLabel(theme);
    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(client, "Brand identity designer.", `Brand Identity for ${brand}, ${product}, ${audience}, ${themeLabel}`);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ tagline: "The Future", brandArchetype: "Creator", brandVoice: "Bold", colorPalette: [{ name: "Primary", hex: "#000000", usage: "Main" }], uniqueSellingPoints: ["Quality"] });
    }
  }

  // 6. POST Influencer
  if (req.method === "POST" && path === "generate-influencer") {
    const { brand, product, audience, theme } = req.body;
    const themeLabel = getThemeLabel(theme);
    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(client, "Influencer expert.", `Match influencer for ${brand}, ${product}, ${audience}, ${themeLabel}. Curated list: ${JSON.stringify(CURATED_INFLUENCERS)}`);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ ...CURATED_INFLUENCERS[1], brandCollabAngle: "Perfect fit", collaborationIdeas: ["Post 1"], sampleCaptions: ["Check it out!"] });
    }
  }

  // 7. POST Trend Stealer
  if (req.method === "POST" && path === "trend-stealer") {
    const { brand, product, audience, theme } = req.body;
    const themeLabel = getThemeLabel(theme);
    try {
      const client = getGroqClient();
      const data = await callGroqJSON<any>(client, "Viral marketing expert.", `Trend Jacking for ${brand}, ${product}, ${audience}, ${themeLabel}`);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ currentTrends: [{ trend: "POV", platform: "TikTok", virality: "Mega", howToUse: "Adapt to product" }], adaptedCampaign: "Viral push", trendHooks: ["Hook 1"], viralFormula: "Hook + Value" });
    }
  }

  // 8. POST Refine
  if (req.method === "POST" && path === "refine") {
    const { previousResponse, refinement } = req.body;
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
    } catch {
      return res.status(200).json({ refinedContent: previousResponse, refinement, notice: "Refinement fallback" });
    }
  }

  return res.status(404).json({ error: `Route ${path} not found` });
}
