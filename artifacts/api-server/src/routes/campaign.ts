import { Router } from "express";
import Groq from "groq-sdk";
import {
  GenerateCampaignBody,
  GenerateStrategyBody,
  GenerateVideoPlanBody,
  GenerateBrandBody,
  GenerateInfluencerBody,
  TrendStealerBody,
} from "@workspace/api-zod";

const router = Router();

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

// ─── In-memory response cache ─────────────────────────────────────────────────
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(endpoint: string, body: object): string {
  return `${endpoint}:${JSON.stringify(body)}`;
}
function getFromCache(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) { responseCache.delete(key); return null; }
  return cached.data;
}
function setCache(key: string, data: unknown): void {
  responseCache.set(key, { data, timestamp: Date.now() });
  if (responseCache.size > 200) { const k = responseCache.keys().next().value; if (k) responseCache.delete(k); }
}

// ─── Groq client ──────────────────────────────────────────────────────────────
function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not configured");
  return new Groq({ apiKey: key });
}
function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

// ─── Strict JSON call — forces model to output valid JSON every time ──────────
async function callGroqJSON<T = Record<string, unknown>>(
  client: Groq,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 3500,
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      if (!raw.trim()) throw new Error("Empty response");
      return JSON.parse(raw) as T;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, attempt * 1200));
    }
  }
  throw lastError ?? new Error("All retries exhausted");
}

// ─── Multi-turn conversation (refine endpoint) ────────────────────────────────
async function callGroqConversation(
  client: Groq,
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  newMessage: string,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: newMessage },
        ] as Groq.Chat.ChatCompletionMessageParam[],
        temperature: 0.85,
        max_tokens: 3000,
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (!content.trim()) throw new Error("Empty response");
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1200));
    }
  }
  throw lastError ?? new Error("Conversation retries exhausted");
}

// ─── Virality scorer (works on stringified JSON) ──────────────────────────────
function computeViralityScore(content: string, theme: string): number {
  const lower = content.toLowerCase();
  const hookScore = ["what if", "imagine", "the secret", "nobody talks about", "here's why", "stop doing", "you won't believe", "warning", "breaking", "viral"].filter(p => lower.includes(p)).length * 4;
  const ctaScore = ["shop now", "link in bio", "swipe up", "comment", "subscribe", "get yours", "limited time", "act now", "sign up", "buy now"].filter(p => lower.includes(p)).length * 5;
  const emotionalScore = ["love", "amazing", "obsessed", "life-changing", "incredible", "must have", "game changer", "fire", "inspiring", "powerful", "iconic"].filter(p => lower.includes(p)).length * 3;
  const platformScore = ["tiktok", "instagram", "youtube", "fyp", "reels", "shorts", "trending", "hashtag"].filter(p => lower.includes(p)).length * 2;
  let base = 48 + hookScore + ctaScore + emotionalScore + platformScore + Math.floor(Math.random() * 12);
  if (theme === "genz_viral" || theme === "trend_stealer") base = Math.min(base + 18, 99);
  if (theme === "luxury" || theme === "minimal_apple") base = Math.max(base - 5, 45);
  if (theme === "high_energy_sports") base = Math.min(base + 8, 99);
  return Math.min(Math.max(base, 40), 99);
}
function getEstimatedViews(score: number): string {
  if (score >= 90) return "5M–20M+ views likely";
  if (score >= 80) return "1M–5M views likely";
  if (score >= 70) return "500K–1M views likely";
  if (score >= 60) return "100K–500K views likely";
  return "50K–100K views likely";
}

// ─── GET /campaign/themes ──────────────────────────────────────────────────────
router.get("/campaign/themes", (_req, res) => {
  res.json({ themes: THEMES });
});

// ─── POST /campaign/generate ───────────────────────────────────────────────────
router.post("/campaign/generate", async (req, res) => {
  const parsed = GenerateCampaignBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("generate", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<{
      campaignIdea: string;
      strategy: string;
      adScript: string;
      socialContent: string;
      videoStoryboard: string;
      keyMessage: string;
    }>(
      client,
      `You are a world-class marketing strategist. You MUST respond with ONLY valid JSON. No explanations, no text outside the JSON object.`,
      `Create a complete viral marketing campaign for:
Brand: ${brand}
Product/Service: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

Respond with ONLY this JSON structure (all fields required, no null values):
{
  "campaignIdea": "1 powerful campaign concept in 3 sentences with a strong hook, emotional angle, and clear CTA",
  "keyMessage": "The single core message this campaign drives home in 1 sentence",
  "strategy": "5-6 bullet points covering platform strategy for Instagram/TikTok/YouTube, virality hooks, psychological angles, emotional triggers, and content cadence. Use • for each bullet.",
  "adScript": "Full scene-by-scene ad script with SCENE labels, dialogue, visuals, and emotion. Include strong opening hook and closing CTA.",
  "socialContent": "Instagram caption with 10 hashtags. Then TikTok caption optimized for FYP. Then 3 tweet ideas. Then LinkedIn version.",
  "videoStoryboard": "Numbered storyboard for 15-30 sec ad. For each scene include: Scene number, Duration, Visual description, Camera angle, Audio note, Text overlay."
}`
    );

    const raw = JSON.stringify(data);
    const viralityScore = computeViralityScore(raw, theme);
    const result = {
      campaignIdea: data.campaignIdea || "Campaign concept could not be generated. Please try again.",
      keyMessage: data.keyMessage || "",
      strategy: data.strategy || "",
      adScript: data.adScript || "",
      socialContent: data.socialContent || "",
      videoStoryboard: data.videoStoryboard || "",
      viralityScore,
      viralityExplanation: `This campaign scores ${viralityScore}/100 based on hook strength, CTA presence, emotional resonance, and platform alignment for ${themeLabel}.`,
      estimatedViews: getEstimatedViews(viralityScore),
      adsFactory: {
        thumbnailPrompt: `Ultra-HD thumbnail for ${brand}: ${themeLabel} aesthetic, ${audience}, cinematic lighting, bold typography, scroll-stopping`,
        bestPostingTimes: ["Tuesday 6–9 PM", "Thursday 7–10 PM", "Saturday 10 AM–12 PM"],
        platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
        hashtagSets: {
          instagram: [`#${brand.replace(/\s/g, "")}`, "#MarketingTips", "#BrandStrategy", "#ContentCreator", "#ViralMarketing"],
          tiktok: [`#${brand.replace(/\s/g, "")}`, "#FYP", "#ForYouPage", "#MarketingTikTok", "#BrandTok"],
        },
      },
      theme,
      brand,
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating campaign");
    res.status(500).json({ error: "Failed to generate campaign. Please try again." });
  }
});

// ─── POST /campaign/generate-strategy ────────────────────────────────────────
router.post("/campaign/generate-strategy", async (req, res) => {
  const parsed = GenerateStrategyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("strategy", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<{
      positioning: string;
      audiencePsychology: string;
      keyMessage: string;
      viralHooks: string[];
      sloganIdeas: string[];
      platformStrategy: string;
      competitorAngle: string;
    }>(
      client,
      `You are a world-class brand strategist. You MUST respond with ONLY valid JSON. No explanations, no markdown, no text outside the JSON object.`,
      `Create a deep marketing strategy for:
Brand: ${brand}
Product/Service: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

Respond with ONLY this JSON structure (all fields required, no null values):
{
  "positioning": "How this brand should position itself in the market. 3-4 sentences covering what makes it uniquely ownable and differentiated.",
  "audiencePsychology": "Deep dive into what makes this audience tick. Include their fears, desires, aspirations, decision triggers, and emotional hot buttons. Write as flowing paragraph.",
  "keyMessage": "The single most important message this brand must communicate. One powerful sentence.",
  "viralHooks": ["Hook 1 that stops scrolling", "Hook 2 with emotional angle", "Hook 3 with curiosity gap", "Hook 4 with controversy", "Hook 5 with aspiration"],
  "sloganIdeas": ["Slogan 1", "Slogan 2", "Slogan 3", "Slogan 4", "Slogan 5"],
  "platformStrategy": "Specific tactics for TikTok, Instagram, YouTube, and LinkedIn. What to post, when, how often, what format, and what CTA to use on each platform. Write as flowing paragraph.",
  "competitorAngle": "How to differentiate from competitors. What unique territory to own. Include 3 specific differentiation tactics. Write as flowing paragraph."
}`
    );

    const raw = JSON.stringify(data);
    const viralityScore = computeViralityScore(raw, theme);
    const result = {
      positioning: data.positioning || "Strategic positioning not available.",
      audiencePsychology: data.audiencePsychology || "Audience psychology not available.",
      keyMessage: data.keyMessage || "",
      viralHooks: Array.isArray(data.viralHooks) && data.viralHooks.length > 0 ? data.viralHooks.slice(0, 5) : ["Hook data not available — try regenerating."],
      sloganIdeas: Array.isArray(data.sloganIdeas) && data.sloganIdeas.length > 0 ? data.sloganIdeas.slice(0, 5) : ["Slogan data not available — try regenerating."],
      platformStrategy: data.platformStrategy || "Platform strategy not available.",
      competitorAngle: data.competitorAngle || "Competitor analysis not available.",
      viralityScore,
      viralityExplanation: `Based on hook strength, CTA presence, emotional resonance, and platform fit for ${themeLabel}, this strategy scores ${viralityScore}/100.`,
      estimatedViews: getEstimatedViews(viralityScore),
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating strategy");
    res.status(500).json({ error: "Failed to generate strategy. Please try again." });
  }
});

// ─── POST /campaign/generate-video-plan ──────────────────────────────────────
router.post("/campaign/generate-video-plan", async (req, res) => {
  const parsed = GenerateVideoPlanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("video-plan", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<{
      script: string;
      voiceover: string;
      musicStyle: string;
      editingStyle: string;
      captionsText: string;
      thumbnailPrompt: string;
      runwayPrompt: string;
      pikaPrompt: string;
      heygen_prompt: string;
      scenes: Array<{
        sceneNumber: number;
        duration: string;
        visual: string;
        cameraAngle: string;
        audio: string;
        textOverlay: string;
      }>;
      versions: {
        tiktokViral: string;
        luxuryCinematic: string;
        memeVersion: string;
      };
    }>(
      client,
      `You are a world-class video director and content strategist. You MUST respond with ONLY valid JSON. No explanations, no markdown, no text outside the JSON.`,
      `Create a complete video production plan for:
Brand: ${brand}
Product/Service: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

Respond with ONLY this JSON structure (all fields required):
{
  "script": "Complete 30-second voiceover script with a strong hook in the first 3 seconds, emotional build, and clear CTA at the end",
  "voiceover": "Full narration text with emotional beats noted in [brackets]",
  "musicStyle": "Specific music direction including tempo, mood, energy level, and 2-3 reference artist/song styles",
  "editingStyle": "Specific editing direction including cut rhythm, transitions, color grade palette, and visual effects",
  "captionsText": "On-screen text sequence — what text appears on screen and when during the video",
  "thumbnailPrompt": "Detailed AI image generation prompt for a scroll-stopping thumbnail that captures the essence of the ad",
  "runwayPrompt": "Specific Runway Gen-3 video generation prompt for the hero shot scene",
  "pikaPrompt": "Specific Pika Labs video generation prompt",
  "heygen_prompt": "HeyGen avatar script with tone, emotion, and delivery direction for a spokesperson version",
  "scenes": [
    {"sceneNumber": 1, "duration": "3s", "visual": "Detailed visual description of what appears on screen", "cameraAngle": "Specific camera angle", "audio": "What plays on audio", "textOverlay": "Any text shown on screen"},
    {"sceneNumber": 2, "duration": "6s", "visual": "Detailed visual description", "cameraAngle": "Camera angle", "audio": "Audio description", "textOverlay": "Text overlay"},
    {"sceneNumber": 3, "duration": "7s", "visual": "Detailed visual description", "cameraAngle": "Camera angle", "audio": "Audio description", "textOverlay": "Text overlay"},
    {"sceneNumber": 4, "duration": "8s", "visual": "Detailed visual description", "cameraAngle": "Camera angle", "audio": "Audio description", "textOverlay": "Text overlay"},
    {"sceneNumber": 5, "duration": "6s", "visual": "Detailed visual description and CTA", "cameraAngle": "Camera angle", "audio": "Audio with CTA", "textOverlay": "CTA text overlay"}
  ],
  "versions": {
    "tiktokViral": "How to adapt this for TikTok FYP — hook format, trend sounds, text overlays, and CTA",
    "luxuryCinematic": "How to adapt this for luxury cinematic Instagram Reels style",
    "memeVersion": "How to adapt this as a meme or comedic viral version"
  }
}`
    );

    const scenes = Array.isArray(data.scenes) && data.scenes.length > 0
      ? data.scenes.slice(0, 5).map((s, i) => ({
          sceneNumber: s.sceneNumber ?? i + 1,
          duration: s.duration ?? `${[3, 6, 7, 8, 6][i]}s`,
          visual: s.visual ?? `Scene ${i + 1} visual`,
          cameraAngle: s.cameraAngle ?? "Medium shot",
          audio: s.audio ?? "Background music + voiceover",
          textOverlay: s.textOverlay ?? "",
        }))
      : [1, 2, 3, 4, 5].map(n => ({
          sceneNumber: n, duration: `${[3, 6, 7, 8, 6][n - 1]}s`,
          visual: `Scene ${n}: ${themeLabel} branded shot for ${brand}`,
          cameraAngle: "Medium shot", audio: "Background music + voiceover", textOverlay: "",
        }));

    const result = {
      script: data.script || "Script not available.",
      scenes,
      voiceover: data.voiceover || "",
      musicStyle: data.musicStyle || "",
      editingStyle: data.editingStyle || "",
      captionsText: data.captionsText || "",
      thumbnailPrompt: data.thumbnailPrompt || "",
      runwayPrompt: data.runwayPrompt || "",
      pikaPrompt: data.pikaPrompt || "",
      heygen_prompt: data.heygen_prompt || "",
      versions: {
        tiktokViral: data.versions?.tiktokViral || "",
        luxuryCinematic: data.versions?.luxuryCinematic || "",
        memeVersion: data.versions?.memeVersion || "",
      },
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating video plan");
    res.status(500).json({ error: "Failed to generate video plan. Please try again." });
  }
});

// ─── POST /campaign/generate-brand ───────────────────────────────────────────
router.post("/campaign/generate-brand", async (req, res) => {
  const parsed = GenerateBrandBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("brand", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<{
      tagline: string;
      brandArchetype: string;
      brandVoice: string;
      tone: string;
      positioning: string;
      uniqueSellingPoints: string[];
      colorPalette: Array<{ name: string; hex: string; usage: string }>;
      fontPairings: string[];
      logoConceptDescription: string;
      aestheticDirection: string;
      moodboardKeywords: string[];
    }>(
      client,
      `You are a world-class brand designer and identity strategist. You MUST respond with ONLY valid JSON. No explanations, no markdown, no text outside the JSON.`,
      `Design a complete brand identity system for:
Brand: ${brand}
Product/Service: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

Respond with ONLY this JSON structure (all fields required, no null values):
{
  "tagline": "One perfect, memorable brand tagline — short and powerful",
  "brandArchetype": "The brand archetype name (e.g. Hero, Sage, Outlaw, Creator, Lover, Jester) with a 1-sentence explanation of how it applies to this brand",
  "brandVoice": "3 adjectives describing the brand voice plus a description of exactly how the brand speaks and writes — tone, word choices, sentence structure",
  "tone": "The emotional tone of the brand in 2-3 sentences — what feeling it creates in the audience",
  "positioning": "How this brand positions itself in the market — its unique territory and why customers should choose it over alternatives. 2-3 sentences.",
  "uniqueSellingPoints": ["USP 1 — specific and concrete", "USP 2 — specific and concrete", "USP 3 — specific and concrete", "USP 4 — specific and concrete", "USP 5 — specific and concrete"],
  "colorPalette": [
    {"name": "Color name", "hex": "#XXXXXX", "usage": "When and where to use this color"},
    {"name": "Color name", "hex": "#XXXXXX", "usage": "When and where to use this color"},
    {"name": "Color name", "hex": "#XXXXXX", "usage": "When and where to use this color"},
    {"name": "Color name", "hex": "#XXXXXX", "usage": "When and where to use this color"},
    {"name": "Color name", "hex": "#XXXXXX", "usage": "When and where to use this color"}
  ],
  "fontPairings": ["Heading font: Font name — why it fits this brand", "Body font: Font name — why it fits this brand", "Accent font: Font name — where to use it"],
  "logoConceptDescription": "Detailed description of the logo concept: shape, symbol, style, what it communicates, and how it looks at small sizes",
  "aestheticDirection": "3-4 sentences describing the overall visual world of this brand — photography style, graphic elements, layout principles",
  "moodboardKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"]
}`
    );

    const colorPalette = Array.isArray(data.colorPalette) && data.colorPalette.length > 0
      ? data.colorPalette.filter(c => c.hex && /^#[0-9A-Fa-f]{6}$/.test(c.hex))
      : [
          { name: "Primary", hex: "#6366F1", usage: "Main brand color" },
          { name: "Dark", hex: "#0F172A", usage: "Backgrounds" },
          { name: "Accent", hex: "#F59E0B", usage: "CTAs and highlights" },
        ];

    const result = {
      tagline: data.tagline || "Your brand tagline",
      brandArchetype: data.brandArchetype || "The Creator",
      brandVoice: data.brandVoice || "Bold, confident, and authentic",
      tone: data.tone || "",
      positioning: data.positioning || "",
      uniqueSellingPoints: Array.isArray(data.uniqueSellingPoints) && data.uniqueSellingPoints.length > 0
        ? data.uniqueSellingPoints.slice(0, 5)
        : ["Premium quality", "Innovative design", "Customer-first approach"],
      colorPalette,
      fontPairings: Array.isArray(data.fontPairings) ? data.fontPairings.slice(0, 3) : ["Heading: Inter", "Body: DM Sans", "Accent: Space Grotesk"],
      logoConceptDescription: data.logoConceptDescription || "",
      aestheticDirection: data.aestheticDirection || "",
      moodboardKeywords: Array.isArray(data.moodboardKeywords) ? data.moodboardKeywords.slice(0, 10) : [],
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating brand");
    res.status(500).json({ error: "Failed to generate brand identity. Please try again." });
  }
});

// ─── POST /campaign/generate-influencer ──────────────────────────────────────
router.post("/campaign/generate-influencer", async (req, res) => {
  const parsed = GenerateInfluencerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("influencer", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<{
      name: string;
      handle: string;
      age: number;
      location: string;
      audienceSize: string;
      bio: string;
      aesthetic: string;
      contentStyle: string;
      platforms: string[];
      influencerTypes: string[];
      contentPillars: string[];
      characterStory: string;
      brandCollabAngle: string;
      collaborationIdeas: string[];
      sampleCaptions: string[];
    }>(
      client,
      `You are an influencer marketing expert. You MUST respond with ONLY valid JSON. No explanations, no markdown, no text outside the JSON.`,
      `Create a complete AI influencer persona for a campaign for:
Brand: ${brand}
Product/Service: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

Respond with ONLY this JSON structure (all fields required):
{
  "name": "Realistic first and last name",
  "handle": "@lowercasehandle",
  "age": 24,
  "location": "City, Country",
  "audienceSize": "2.3M followers",
  "bio": "Instagram-style bio in 2-3 lines including personality, niche, and a CTA",
  "aesthetic": "Five words describing their visual aesthetic",
  "contentStyle": "2-3 sentences describing how they create content, their signature style, and posting frequency",
  "platforms": ["TikTok", "Instagram", "YouTube"],
  "influencerTypes": ["Type of influencer 1 that would work for this brand", "Type 2", "Type 3"],
  "contentPillars": ["Pillar 1 — specific to their niche", "Pillar 2", "Pillar 3", "Pillar 4", "Pillar 5"],
  "characterStory": "2-3 sentence origin story — how they became an influencer and what drives them",
  "brandCollabAngle": "Exactly how they would organically integrate the brand into their content — specific series ideas and storytelling hooks",
  "collaborationIdeas": ["Collaboration idea 1 — title, format, platform", "Collaboration idea 2", "Collaboration idea 3"],
  "sampleCaptions": ["Full sample caption 1 with hashtags and CTA", "Full sample caption 2 with hashtags and CTA", "Full sample caption 3 with hashtags and CTA"]
}`
    );

    const result = {
      name: data.name || "Alex Rivera",
      handle: data.handle?.startsWith("@") ? data.handle : `@${data.handle || "alexrivera"}`,
      age: typeof data.age === "number" ? data.age : 24,
      location: data.location || "Los Angeles, USA",
      audienceSize: data.audienceSize || "1.2M followers",
      bio: data.bio || "",
      aesthetic: data.aesthetic || "",
      contentStyle: data.contentStyle || "",
      platforms: Array.isArray(data.platforms) && data.platforms.length > 0 ? data.platforms : ["TikTok", "Instagram"],
      influencerTypes: Array.isArray(data.influencerTypes) && data.influencerTypes.length > 0 ? data.influencerTypes : ["Lifestyle creator", "Brand ambassador"],
      contentPillars: Array.isArray(data.contentPillars) && data.contentPillars.length > 0 ? data.contentPillars.slice(0, 5) : ["Lifestyle", "Fashion", "Brand collabs"],
      characterStory: data.characterStory || "",
      brandCollabAngle: data.brandCollabAngle || "",
      collaborationIdeas: Array.isArray(data.collaborationIdeas) && data.collaborationIdeas.length > 0 ? data.collaborationIdeas.slice(0, 3) : [`Organic product integration for ${brand}`],
      sampleCaptions: Array.isArray(data.sampleCaptions) && data.sampleCaptions.length > 0 ? data.sampleCaptions.slice(0, 3) : [`Obsessed with @${brand} right now.`],
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating influencer");
    res.status(500).json({ error: "Failed to generate influencer persona. Please try again." });
  }
});

// ─── POST /campaign/trend-stealer ────────────────────────────────────────────
router.post("/campaign/trend-stealer", async (req, res) => {
  const parsed = TrendStealerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("trend-stealer", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const data = await callGroqJSON<{
      currentTrends: Array<{ trend: string; platform: string; virality: string; howToUse: string }>;
      adaptedCampaign: string;
      trendHooks: string[];
      viralFormula: string;
      soundSuggestions: string[];
      hashtagStrategy: string;
      hashtags: string[];
      viralFormats: string[];
      trendInsights: string[];
    }>(
      client,
      `You are a viral marketing expert who specializes in trend-jacking. You MUST respond with ONLY valid JSON. No explanations, no markdown, no text outside the JSON.`,
      `Activate TREND STEALER MODE for:
Brand: ${brand}
Product/Service: ${product}
Target Audience: ${audience}
Campaign Theme: ${themeLabel}

Respond with ONLY this JSON structure (all fields required):
{
  "currentTrends": [
    {"trend": "Trend name", "platform": "TikTok", "virality": "Mega", "howToUse": "Specific adaptation with hook and CTA for this brand"},
    {"trend": "Trend name", "platform": "Instagram", "virality": "Extreme", "howToUse": "Specific adaptation"},
    {"trend": "Trend name", "platform": "TikTok", "virality": "High", "howToUse": "Specific adaptation"},
    {"trend": "Trend name", "platform": "YouTube Shorts", "virality": "Mega", "howToUse": "Specific adaptation"}
  ],
  "adaptedCampaign": "Full campaign concept that weaves 2-3 of these trends together into a cohesive campaign. Include hook, story arc, and CTA.",
  "trendHooks": ["Hook line 1 ready to paste into a TikTok caption", "Hook line 2", "Hook line 3", "Hook line 4", "Hook line 5"],
  "viralFormula": "The exact formula for why these trends work and how the brand can own them — 2-3 sentences",
  "soundSuggestions": ["Trending sound 1 description", "Trending sound 2", "Trending sound 3", "Trending sound 4", "Trending sound 5"],
  "hashtagStrategy": "Full hashtag strategy — Instagram set, TikTok set, and branded hashtag concept",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"],
  "viralFormats": ["Format 1 description", "Format 2 description", "Format 3 description"],
  "trendInsights": ["Key insight about current platform behavior", "Second insight about audience trends", "Third insight about content patterns"]
}`
    );

    const currentTrends = Array.isArray(data.currentTrends) && data.currentTrends.length > 0
      ? data.currentTrends
      : [
          { trend: "POV storytelling", platform: "TikTok", virality: "Mega", howToUse: `Use POV format to show ${brand} from the customer's perspective` },
          { trend: "Before/After transformation", platform: "Instagram", virality: "High", howToUse: `Show the transformation ${product} enables` },
        ];

    const result = {
      currentTrends,
      adaptedCampaign: data.adaptedCampaign || "Adapted campaign not available.",
      trendHooks: Array.isArray(data.trendHooks) && data.trendHooks.length > 0 ? data.trendHooks : [`The ${brand} trend no one is talking about yet`],
      viralFormula: data.viralFormula || "",
      soundSuggestions: Array.isArray(data.soundSuggestions) && data.soundSuggestions.length > 0 ? data.soundSuggestions : ["Trending pop beat", "Viral audio clip"],
      hashtagStrategy: data.hashtagStrategy || "",
      hashtags: Array.isArray(data.hashtags) && data.hashtags.length > 0 ? data.hashtags : [`#${brand.replace(/\s/g, "")}`, "#FYP", "#Trending"],
      viralFormats: Array.isArray(data.viralFormats) && data.viralFormats.length > 0 ? data.viralFormats : ["Short-form video", "Carousel post"],
      trendInsights: Array.isArray(data.trendInsights) && data.trendInsights.length > 0 ? data.trendInsights : ["Audiences respond to authenticity", "Short hooks drive higher completion rates"],
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error in trend stealer");
    res.status(500).json({ error: "Failed to steal trends. Please try again." });
  }
});

// ─── POST /campaign/refine (multi-turn) ──────────────────────────────────────
router.post("/campaign/refine", async (req, res) => {
  const { previousResponse, refinement, brand, theme } = req.body ?? {};
  if (typeof previousResponse !== "string" || !previousResponse.trim() ||
      typeof refinement !== "string" || !refinement.trim()) {
    res.status(400).json({ error: "previousResponse and refinement are required" });
    return;
  }
  const themeLabel = theme ? getThemeLabel(theme) : "";

  try {
    const client = getGroqClient();
    const refined = await callGroqConversation(
      client,
      `You are a world-class marketing strategist. Refine and improve marketing content based on user feedback. Keep what's working, enhance what the user has requested.`,
      [{ role: "assistant", content: previousResponse }],
      `Refine the above marketing content based on this specific feedback: ${refinement}
${brand ? `Brand: ${brand}` : ""}${themeLabel ? `\nStyle: ${themeLabel}` : ""}
Keep the same overall structure but make it better and more impactful. Output the complete improved version.`
    );
    res.json({ refinedContent: refined, refinement });
  } catch (err) {
    req.log.error({ err }, "Error refining content");
    res.status(500).json({ error: "Failed to refine content. Please try again." });
  }
});

export default router;
