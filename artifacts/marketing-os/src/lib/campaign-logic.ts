import Groq from "groq-sdk";

export interface CampaignResponse {
  // Common fields
  campaignIdea: string;
  keyMessage: string;
  coreStrategy: string;
  socialContent: string;
  videoStoryboard: string;
  adScript: string;
  brandPositioning: string;
  influencerAngles: string;
  viralityScore: number;
  estimatedViews: string;

  // Strategy specific
  positioning?: string;
  audiencePsychology?: {
    emotionalTriggers: string;
    logicalTriggers: string;
  } | string;
  viralHooks?: string[];
  sloganIdeas?: string[];
  competitorAngle?: string;
  platformStrategy?: {
    tiktok: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  } | string;

  // Video specific
  scenes?: Array<{
    sceneNumber: number;
    duration?: string;
    visual: string;
    audio: string;
    cameraAngle?: string;
    textOverlay?: string;
  }>;
  musicStyle?: string;
  editingStyle?: string;
  captionsText?: string;
  runwayPrompt?: string;
  pikaPrompt?: string;
  heygen_prompt?: string;
  thumbnailPrompt?: string;
  versions?: Record<string, string>;

  // Brand specific
  tagline?: string;
  brandArchetype?: string;
  brandVoice?: string;
  colorPalette?: Array<{ name: string; hex: string }>;
  fontPairings?: string[];
  logoConceptDescription?: string;
  aestheticDirection?: string;
  moodboardKeywords?: string[];

  // Influencer specific
  selectedInfluencerName?: string;
  brandCollabAngle?: string;
  handle?: string;
  audienceSize?: string;
  bio?: string;
  location?: string;
  age?: string;
  aesthetic?: string;
  platforms?: string[];
  influencerTypes?: string[];
  contentStyle?: string;
  contentPillars?: string[];
  collaborationIdeas?: string[];
  sampleCaptions?: string[];
  characterStory?: string;
  viralityExplanation?: string;

  // Trend specific
  currentTrends?: Array<{
    trend: string;
    platform: string;
    virality: string;
    howToUse: string;
  }>;
  trendHooks?: string[];
  adaptedCampaign?: string;
  viralFormula?: string;
  timingAdvice?: string;
  hashtagStrategy?: string;
  hashtags?: string[];
  soundSuggestions?: string[];
  trendInsights?: string[];
}

export interface ApiResponse<T = CampaignResponse> {
  error: boolean;
  message: string;
  data: T | null;
}

/* ---------------- THEMES ---------------- */

export const THEMES = [
  { id: "luxury", label: "Luxury / Emily in Paris", description: "Elegant storytelling" },
  { id: "genz_viral", label: "Gen Z Viral TikTok", description: "Fast viral content" },
  { id: "corporate", label: "Corporate Professional", description: "B2B focused" },
  { id: "emotional", label: "Emotional Storytelling", description: "Narrative driven" },
  { id: "minimal_apple", label: "Minimal Apple Style", description: "Clean premium design" },
  { id: "high_energy_sports", label: "High Energy Sports", description: "Explosive motivation" },
  { id: "trend_stealer", label: "Trend Stealer Mode", description: "Trend hijacking" },
  { id: "ai_influencer", label: "AI Influencer Mode", description: "AI persona campaigns" },
];

export const CURATED_INFLUENCERS = [
  { name: "Alex Rivers", handle: "@arivers", audience: "2.4M", niche: "Lifestyle & Tech", aesthetic: "Minimalist High-End" },
  { name: "Sarah Zen", handle: "@zen_sarah", audience: "850K", niche: "Wellness & Productivity", aesthetic: "Earth Tone / Organic" },
  { name: "Jordan Byte", handle: "@j_byte", audience: "1.2M", niche: "Gaming & Gen-Z Culture", aesthetic: "Neon / High Energy" },
  { name: "Elena Luxe", handle: "@elena_luxe", audience: "3.1M", niche: "Luxury Fashion", aesthetic: "Old Money / Paris" },
  { name: "Marcus Fit", handle: "@marcusfit", audience: "1.8M", niche: "Athletics & Biohacking", aesthetic: "Gritty / Cinematic" },
];

/* ---------------- GROQ CLIENT ---------------- */

export function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  console.log("[RUNTIME DIAGNOSTIC] GROQ KEY EXISTS:", !!key);
  if (!key) {
    console.error("❌ GROQ_API_KEY missing in process.env");
    return null;
  }
  return new Groq({ apiKey: key });
}

/* ---------------- THEME ---------------- */

export function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

/* ---------------- SAFE PARSER ---------------- */

export function safeParse(raw: string) {
  try {
    // Basic cleanup in case AI includes markdown markers
    let jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    
    // Find first { and last } to handle cases where AI adds text outside the JSON
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch {
    console.error("❌ INVALID JSON:", raw);
    return null;
  }
}

/* ---------------- MAIN GROQ CALL ---------------- */

export async function callGroqJSON<T>(
  client: Groq | null,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 2
): Promise<T | null> {
  if (!client) return null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt + "\nCRITICAL: Return ONLY a valid JSON object. Do NOT include headings, markdown, or any text outside the JSON. Ensure fields are strictly strings or arrays as defined."
          },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 3500,
      });

      const raw = res.choices[0]?.message?.content || "";
      console.log("[GROQ RAW RESPONSE]:", raw);
      const parsed = safeParse(raw);
      if (parsed) return parsed as T;
    } catch (err) {
      console.error("❌ GROQ ATTEMPT ERROR:", err);
    }
  }
  return null;
}

/* ---------------- VIRALITY ---------------- */

export function computeViralityScore(text: string, theme: string): number {
  const t = text.toLowerCase();
  const keywords = ["viral", "pov", "secret", "stop", "imagine", "truth", "hack", "algorithm"];
  const hooks = keywords.filter(w => t.includes(w)).length;

  let score = 50 + hooks * 6;
  if (theme === "genz_viral" || theme === "trend_stealer") score += 15;

  return Math.min(99, Math.max(45, score));
}

export function getEstimatedViews(score: number): string {
  if (score > 90) return "5M–20M+ views";
  if (score > 80) return "1M–5M views";
  if (score > 70) return "500K–1M views";
  return "100K–500K views";
}

/* ---------------- BULLETS ---------------- */

export function normalizeBulletPoints(v: any): string {
  if (Array.isArray(v)) return v.map(i => `• ${String(i).trim()}`).join("\n");
  
  if (v && typeof v === "object") {
    return Object.entries(v)
      .map(([key, val]) => `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
      .join("\n");
  }

  if (typeof v === "string" && v.trim()) {
    if (v.includes("•")) return v;
    return v.split("\n").filter(Boolean).map(l => `• ${l.trim()}`).join("\n");
  }
  return "• High-impact rollout\n• Targeted engagement\n• Conversion-led strategy";
}

/* ---------------- UNIFY RESPONSE ---------------- */

export function unifyResponse(data: any, brand: string, product: string, audience: string, theme: string): CampaignResponse {
  const score = computeViralityScore(JSON.stringify(data), theme);

  // Map specialized fields back to common fields for consistency
  const campaignIdea = data.campaignIdea || data.positioning || data.adaptedCampaign || `Viral strategy for ${brand}`;
  const keyMessage = data.keyMessage || data.tagline || `Revolutionizing ${product}`;
  const coreStrategy = normalizeBulletPoints(data.coreStrategy || data.platformStrategy || data.viralFormula || data.strategy);
  const socialContent = data.socialContent || (Array.isArray(data.sloganIdeas) ? data.sloganIdeas.join("\n") : data.brandVoice) || "Social media roadmap";
  const videoStoryboard = data.videoStoryboard || (Array.isArray(data.scenes) ? data.scenes.map((s:any) => s.visual).join("\n") : "Cinematic production plan");
  const adScript = data.adScript || data.script || "Persuasive marketing copy";
  const brandPositioning = data.brandPositioning || data.positioning || data.brandArchetype || "Premium market positioning";
  const influencerAngles = data.influencerAngles || data.brandCollabAngle || "Strategic creator partnership";

  // Enforce Trend Hooks as array
  let trendHooks = data.trendHooks;
  if (typeof trendHooks === 'string') {
    trendHooks = trendHooks.split('\n').filter(h => h.trim()).map(h => h.replace(/^\d+\.\s*/, '').trim());
  }
  if (!Array.isArray(trendHooks)) {
    trendHooks = [];
  }

  return {
    ...data, // Keep original fields for specialized panels
    campaignIdea,
    keyMessage,
    coreStrategy,
    socialContent,
    videoStoryboard,
    adScript,
    brandPositioning,
    influencerAngles,
    trendHooks,
    viralityScore: score,
    estimatedViews: getEstimatedViews(score)
  };
}