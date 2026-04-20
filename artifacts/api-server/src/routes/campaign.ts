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
  {
    id: "luxury",
    label: "Luxury / Emily in Paris",
    description: "Elegant, aspirational, cinematic — romantic branding and emotional storytelling",
  },
  {
    id: "genz_viral",
    label: "Gen Z Viral TikTok",
    description: "Fast-paced, trendy, raw, authentic — built for algorithm virality",
  },
  {
    id: "corporate",
    label: "Corporate Professional",
    description: "Clean, trustworthy, data-driven — perfect for B2B and enterprise brands",
  },
  {
    id: "emotional",
    label: "Emotional Storytelling",
    description: "Heartfelt, narrative-driven, tear-jerking — connects on a human level",
  },
  {
    id: "minimal_apple",
    label: "Minimal Apple Style",
    description: "Sleek, product-focused, whisper-quiet elegance — let the product speak",
  },
  {
    id: "high_energy_sports",
    label: "High Energy Sports",
    description: "Explosive, motivational, fast cuts — built for athletes and action brands",
  },
  {
    id: "trend_stealer",
    label: "Trend Stealer Mode",
    description: "Hijacks current viral TikTok/IG trends and adapts them to your brand instantly",
  },
  {
    id: "ai_influencer",
    label: "AI Influencer Mode",
    description: "Creates a complete fictional influencer persona to front your campaign",
  },
];

// ─── In-memory response cache ────────────────────────────────────────────────
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint: string, body: object): string {
  return `${endpoint}:${JSON.stringify(body)}`;
}

function getFromCache(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCache(key: string, data: unknown): void {
  responseCache.set(key, { data, timestamp: Date.now() });
  if (responseCache.size > 200) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
}

// ─── Groq client ─────────────────────────────────────────────────────────────
function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not configured");
  return new Groq({ apiKey: key });
}

function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

// ─── Groq call with retry logic ──────────────────────────────────────────────
async function callGroqWithRetry(
  client: Groq,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 3,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 3000,
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (!content.trim()) throw new Error("Empty response from AI — retrying");
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 1200));
      }
    }
  }
  throw lastError ?? new Error("All Groq retries exhausted");
}

// ─── Multi-turn conversation call ────────────────────────────────────────────
async function callGroqConversation(
  client: Groq,
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  newMessage: string,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: newMessage },
      ];
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.85,
        max_tokens: 3000,
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (!content.trim()) throw new Error("Empty response — retrying");
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1200));
    }
  }
  throw lastError ?? new Error("Conversation retries exhausted");
}

// ─── Section extraction helpers ───────────────────────────────────────────────
function extractSection(content: string, emoji: string, nextEmoji?: string): string {
  const startIdx = content.indexOf(emoji);
  if (startIdx === -1) return "";
  const afterHeader = content.indexOf("\n", startIdx);
  if (afterHeader === -1) return "";
  let endIdx = content.length;
  if (nextEmoji) {
    const nextIdx = content.indexOf(nextEmoji, afterHeader);
    if (nextIdx !== -1) endIdx = nextIdx;
  }
  return content.slice(afterHeader, endIdx).trim();
}

// ─── Improved virality scoring ────────────────────────────────────────────────
function computeViralityScore(content: string, theme: string): number {
  const lower = content.toLowerCase();

  const hookPatterns = [
    "what if", "imagine", "the secret", "nobody talks about", "here's why",
    "stop doing", "this changed", "i tried", "honest review", "viral",
    "breaking", "you won't believe", "they don't want you to", "warning",
  ];
  const hookScore = hookPatterns.filter((p) => lower.includes(p)).length * 4;

  const ctaPatterns = [
    "click", "shop now", "link in bio", "swipe up", "comment below",
    "share this", "follow for more", "subscribe", "get yours", "limited time",
    "don't miss", "act now", "join us", "sign up", "buy now",
  ];
  const ctaScore = ctaPatterns.filter((p) => lower.includes(p)).length * 5;

  const emotionalKeywords = [
    "love", "amazing", "obsessed", "life-changing", "incredible",
    "never seen", "must have", "game changer", "fire", "goals",
    "heartbreaking", "inspiring", "powerful", "revolutionary", "iconic",
  ];
  const emotionalScore = emotionalKeywords.filter((p) => lower.includes(p)).length * 3;

  const platformKeywords = [
    "tiktok", "instagram", "youtube", "fyp", "reels", "shorts",
    "viral", "trending", "hashtag", "for you page",
  ];
  const platformScore = platformKeywords.filter((p) => lower.includes(p)).length * 2;

  let base = 48 + hookScore + ctaScore + emotionalScore + platformScore + Math.floor(Math.random() * 12);

  if (theme === "genz_viral" || theme === "trend_stealer") base = Math.min(base + 18, 99);
  if (theme === "luxury" || theme === "minimal_apple") base = Math.max(base - 5, 45);
  if (theme === "high_energy_sports") base = Math.min(base + 8, 99);
  if (content.length > 1500) base = Math.min(base + 5, 99);

  return Math.min(Math.max(base, 40), 99);
}

function getEstimatedViews(score: number): string {
  if (score >= 90) return "5M–20M+ views likely";
  if (score >= 80) return "1M–5M views likely";
  if (score >= 70) return "500K–1M views likely";
  if (score >= 60) return "100K–500K views likely";
  return "50K–100K views likely";
}

// ─── GET /campaign/themes ─────────────────────────────────────────────────────
router.get("/campaign/themes", (_req, res) => {
  res.json({ themes: THEMES });
});

// ─── POST /campaign/generate ──────────────────────────────────────────────────
router.post("/campaign/generate", async (req, res) => {
  const parsed = GenerateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);
  const cacheKey = getCacheKey("generate", { brand, product, audience, theme });
  const cached = getFromCache(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const client = getGroqClient();
    const raw = await callGroqWithRetry(
      client,
      "You are a world-class marketing strategist and creative director. Output is always structured, specific, and immediately actionable. Always include strong hooks, clear CTAs, and emotional triggers.",
      `Generate a complete viral marketing campaign package for:

BRAND: ${brand}
PRODUCT: ${product}
AUDIENCE: ${audience}
THEME: ${themeLabel}

Return EXACTLY in this format — include all 5 sections:

🎯 CAMPAIGN IDEA:
[1 powerful campaign concept in 2-3 sentences, fully adapted to ${themeLabel} style. Start with a strong hook that stops scrolling.]

🧠 STRATEGY:
[5-6 bullet points: platform strategy for Instagram/TikTok/YouTube, virality hooks, psychological angles, emotional triggers, content cadence]

🎬 AD SCRIPT:
[Full scene-by-scene script. Include: strong opening hook, emotional build, clear CTA. Label each scene with dialogue, visuals, and emotion.]

📱 SOCIAL CONTENT:
[Instagram caption with 10 hashtags + TikTok caption optimized for FYP + 3 tweet/X ideas + LinkedIn version]

🎥 VIDEO STORYBOARD:
[Numbered storyboard for 15-30 sec ad: Scene, Duration, Visual, Camera Angle, Audio, Text Overlay. Include Runway/Pika/Sora prompts for each scene.]

Make everything authentically ${themeLabel} in tone and style. Include strong CTAs throughout.`
    );

    const viralityScore = computeViralityScore(raw, theme);
    const result = {
      campaignIdea: extractSection(raw, "🎯", "🧠") || raw,
      strategy: extractSection(raw, "🧠", "🎬"),
      adScript: extractSection(raw, "🎬", "📱"),
      socialContent: extractSection(raw, "📱", "🎥"),
      videoStoryboard: extractSection(raw, "🎥"),
      viralityScore,
      viralityExplanation: `This campaign scores ${viralityScore}/100 based on hook strength, CTA presence, emotional resonance, and platform alignment for the ${themeLabel} style.`,
      estimatedViews: getEstimatedViews(viralityScore),
      adsFactory: {
        thumbnailPrompt: `Ultra-HD thumbnail for ${brand}: ${themeLabel} aesthetic, ${audience}, vibrant and scroll-stopping, cinematic lighting, bold typography overlay`,
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
    const raw = await callGroqWithRetry(
      client,
      "You are a world-class brand strategist. Output must be deeply specific, actionable, and highly creative. Always include strong hooks, emotional triggers, and platform-specific tactics.",
      `Create a deep marketing strategy for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Return in labeled sections (all required):

POSITIONING:
[How this brand should position itself in the market. 3-4 sentences. Include what makes it uniquely ownable.]

AUDIENCE PSYCHOLOGY:
[Deep dive into what makes this audience tick — fears, desires, aspirations, decision triggers, emotional hot buttons. 5 bullet points.]

VIRAL HOOKS:
[5 specific viral hook angles that would stop someone mid-scroll on TikTok/Instagram. Make them punchy and platform-native.]

SLOGAN IDEAS:
[5 punchy, memorable slogans for this brand — think Nike-level brevity and power]

PLATFORM STRATEGY:
[Specific tactics for TikTok, Instagram, YouTube, and LinkedIn. What to post, when, how often, what format. Include CTAs for each.]

COMPETITOR ANGLE:
[How to differentiate from competitors. What unique territory to own. Include 3 specific differentiation tactics.]`
    );

    const viralityScore = computeViralityScore(raw, theme);

    const extractLabel = (text: string, label: string, next?: string): string => {
      const start = text.indexOf(label + ":");
      if (start === -1) return "";
      const contentStart = text.indexOf("\n", start);
      if (contentStart === -1) return "";
      let end = text.length;
      if (next) {
        const nextIdx = text.indexOf(next + ":", contentStart);
        if (nextIdx !== -1) end = nextIdx;
      }
      return text.slice(contentStart, end).trim();
    };

    const extractList = (text: string): string[] =>
      text.split("\n").map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(Boolean);

    const positioning = extractLabel(raw, "POSITIONING", "AUDIENCE PSYCHOLOGY");
    const audiencePsychology = extractLabel(raw, "AUDIENCE PSYCHOLOGY", "VIRAL HOOKS");
    const viralHooksRaw = extractLabel(raw, "VIRAL HOOKS", "SLOGAN IDEAS");
    const sloganRaw = extractLabel(raw, "SLOGAN IDEAS", "PLATFORM STRATEGY");
    const platformStrategy = extractLabel(raw, "PLATFORM STRATEGY", "COMPETITOR ANGLE");
    const competitorAngle = extractLabel(raw, "COMPETITOR ANGLE");

    const result = {
      positioning: positioning || raw.slice(0, 400),
      audiencePsychology,
      viralHooks: extractList(viralHooksRaw).slice(0, 5),
      sloganIdeas: extractList(sloganRaw).slice(0, 5),
      platformStrategy,
      competitorAngle,
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
    const raw = await callGroqWithRetry(
      client,
      "You are a world-class video director and content strategist. You create cinematic, viral marketing videos with strong hooks, emotional arcs, and clear CTAs.",
      `Create a complete video production plan for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

FULL SCRIPT:
[Complete 30-second voiceover script with strong hook in first 3 seconds, emotional build, and clear CTA]

SCENE 1: [Duration: 3s] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 2: [Duration: 5s] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 3: [Duration: 7s] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 4: [Duration: 8s] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 5: [Duration: 7s] [Visual description] [Camera angle] [Audio] [Text overlay]

VOICEOVER:
[Full narration text with emotional beats marked]

MUSIC STYLE:
[Specific music direction including tempo, mood, reference artists]

EDITING STYLE:
[Specific editing direction including cut rhythm, transitions, color grade]

CAPTIONS TEXT:
[On-screen text sequence — what appears and when]

THUMBNAIL PROMPT:
[AI image generation prompt for a scroll-stopping thumbnail]

RUNWAY ML PROMPT:
[Specific Runway Gen-3 video generation prompt for the hero shot]

PIKA PROMPT:
[Specific Pika video generation prompt]

HEYGEN PROMPT:
[HeyGen avatar script and direction for a spokesperson version]

TIKTOK VIRAL VERSION:
[How to adapt this for TikTok FYP — hook, trend sounds, text overlays, CTA]

LUXURY CINEMATIC VERSION:
[How to adapt this for luxury/cinematic Instagram Reels style]

MEME VERSION:
[How to adapt this as a meme/comedic viral version]`
    );

    const scenes = [];
    for (let i = 1; i <= 5; i++) {
      const sceneMatch = raw.match(new RegExp(`SCENE ${i}:[^]*?(?=SCENE ${i + 1}:|VOICEOVER:)`, "s"));
      const sceneText = sceneMatch ? sceneMatch[0] : `Scene ${i}: Dynamic ${themeLabel} branded shot`;
      const durationMatch = sceneText.match(/Duration:\s*(\d+s|\d+-\d+s)/i);
      scenes.push({
        sceneNumber: i,
        duration: durationMatch ? durationMatch[1] : `${[3, 5, 7, 8, 7][i - 1]}s`,
        visual: sceneText.replace(/SCENE \d+:.*\n/, "").split("\n")[0]?.trim() || `Scene ${i} visual`,
        cameraAngle: sceneText.toLowerCase().includes("close") ? "Close-up" : sceneText.toLowerCase().includes("wide") ? "Wide shot" : "Medium shot",
        audio: "Background music + voiceover",
        textOverlay: "",
      });
    }

    const extractField = (label: string, next?: string): string => {
      const idx = raw.indexOf(label + ":");
      if (idx === -1) return "";
      const start = raw.indexOf("\n", idx);
      if (start === -1) return "";
      let end = raw.length;
      if (next) { const ni = raw.indexOf(next + ":", start); if (ni !== -1) end = ni; }
      return raw.slice(start, end).trim();
    };

    const result = {
      script: extractField("FULL SCRIPT", "SCENE 1") || raw.slice(0, 300),
      scenes,
      voiceover: extractField("VOICEOVER", "MUSIC STYLE"),
      musicStyle: extractField("MUSIC STYLE", "EDITING STYLE"),
      editingStyle: extractField("EDITING STYLE", "CAPTIONS TEXT"),
      captionsText: extractField("CAPTIONS TEXT", "THUMBNAIL PROMPT"),
      thumbnailPrompt: extractField("THUMBNAIL PROMPT", "RUNWAY ML PROMPT"),
      runwayPrompt: extractField("RUNWAY ML PROMPT", "PIKA PROMPT"),
      pikaPrompt: extractField("PIKA PROMPT", "HEYGEN PROMPT"),
      heygen_prompt: extractField("HEYGEN PROMPT", "TIKTOK VIRAL VERSION"),
      versions: {
        tiktokViral: extractField("TIKTOK VIRAL VERSION", "LUXURY CINEMATIC VERSION"),
        luxuryCinematic: extractField("LUXURY CINEMATIC VERSION", "MEME VERSION"),
        memeVersion: extractField("MEME VERSION"),
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
    const raw = await callGroqWithRetry(
      client,
      "You are a world-class brand designer and identity strategist. You create iconic visual systems with strong brand voice, distinctive positioning, and unique selling propositions.",
      `Design a complete brand identity system for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Return this exact format (all sections required):

TAGLINE:
[One perfect brand tagline — short, powerful, memorable]

BRAND ARCHETYPE:
[The brand archetype (e.g. Hero, Sage, Outlaw, Creator) with 1-sentence explanation of how it applies]

BRAND VOICE:
[3 adjectives + how the brand speaks and writes — tone, word choices, what it never says]

UNIQUE SELLING POINTS:
[5 specific USPs that differentiate this brand from competitors]

COLOR PALETTE:
PRIMARY: [Name] | #[hex] | [Usage]
SECONDARY: [Name] | #[hex] | [Usage]
ACCENT: [Name] | #[hex] | [Usage]
DARK: [Name] | #[hex] | [Usage]
LIGHT: [Name] | #[hex] | [Usage]

FONT PAIRINGS:
[Font 1: Heading font + why it fits the brand]
[Font 2: Body font + why it fits the brand]
[Font 3: Accent/display font + where to use it]

LOGO CONCEPT:
[Detailed description of the logo concept: shape, symbol, style, what it communicates]

AESTHETIC DIRECTION:
[3-4 sentences describing the overall visual world of this brand]

MOODBOARD KEYWORDS:
[10 specific visual keywords that capture the brand's aesthetic]`
    );

    const colorPalette = [];
    const colorLines = raw.match(/(PRIMARY|SECONDARY|ACCENT|DARK|LIGHT):\s*([^|]+)\s*\|\s*(#[A-Fa-f0-9]{6})\s*\|\s*([^\n]+)/g) || [];
    for (const line of colorLines) {
      const parts = line.match(/(PRIMARY|SECONDARY|ACCENT|DARK|LIGHT):\s*([^|]+)\s*\|\s*(#[A-Fa-f0-9]{6})\s*\|\s*([^\n]+)/);
      if (parts) colorPalette.push({ name: parts[2].trim(), hex: parts[3].trim(), usage: parts[4].trim() });
    }
    if (colorPalette.length === 0) {
      colorPalette.push(
        { name: "Primary Blue", hex: "#6366F1", usage: "Main brand color" },
        { name: "Dark Space", hex: "#0F172A", usage: "Backgrounds" },
        { name: "Accent Gold", hex: "#F59E0B", usage: "CTAs and highlights" },
      );
    }

    const extractField = (label: string, next?: string): string => {
      const idx = raw.indexOf(label + ":");
      if (idx === -1) return "";
      const start = raw.indexOf("\n", idx);
      if (start === -1) return "";
      let end = raw.length;
      if (next) { const ni = raw.indexOf(next + ":", start); if (ni !== -1) end = ni; }
      return raw.slice(start, end).trim();
    };

    const fontRaw = extractField("FONT PAIRINGS", "LOGO CONCEPT");
    const fonts = fontRaw.split("\n").filter(Boolean).slice(0, 3);

    const uspRaw = extractField("UNIQUE SELLING POINTS", "COLOR PALETTE");
    const uniqueSellingPoints = uspRaw
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    const moodRaw = extractField("MOODBOARD KEYWORDS");
    const moodKeywords = moodRaw
      .split(/[,\n]/)
      .map((k) => k.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 10);

    const result = {
      tagline: extractField("TAGLINE", "BRAND ARCHETYPE"),
      brandArchetype: extractField("BRAND ARCHETYPE", "BRAND VOICE"),
      brandVoice: extractField("BRAND VOICE", "UNIQUE SELLING POINTS"),
      uniqueSellingPoints: uniqueSellingPoints.length > 0 ? uniqueSellingPoints : ["Premium quality", "Innovative design", "Customer-first approach"],
      colorPalette,
      fontPairings: fonts,
      logoConceptDescription: extractField("LOGO CONCEPT", "AESTHETIC DIRECTION"),
      aestheticDirection: extractField("AESTHETIC DIRECTION", "MOODBOARD KEYWORDS"),
      moodboardKeywords: moodKeywords,
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
    const raw = await callGroqWithRetry(
      client,
      "You are an influencer marketing expert. You create detailed, believable AI influencer personas with specific content strategies, audience profiles, and collaboration plans.",
      `Create a complete AI influencer persona for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

NAME: [First + Last name, realistic and memorable]
HANDLE: [@handle, no spaces, lowercase]
AGE: [Age as number only]
LOCATION: [City, Country]
AUDIENCE SIZE: [e.g. "2.3M followers"]
BIO: [Instagram-style bio, 2-3 lines, includes personality + niche + CTA]
AESTHETIC: [Their visual aesthetic in 5 words]
CONTENT STYLE: [How they create content, their signature style, posting frequency]
PLATFORMS: [TikTok, Instagram, YouTube — list the ones they're on]

CONTENT PILLARS:
[5 content categories they cover — specific to their niche and the brand]

CHARACTER STORY:
[2-3 sentence origin story — how they became an influencer, what drives them, what makes them authentic]

BRAND COLLAB ANGLE:
[Exactly how they would organically integrate ${brand} into their content — specific series ideas, storytelling hooks, CTA approaches]

COLLABORATION IDEAS:
[3 specific campaign ideas for how this influencer would promote ${brand} — title, format, platform, hook]

SAMPLE CAPTIONS:
[3 sample post captions they might write featuring ${brand} — include hashtags and CTAs]`
    );

    const extractField = (label: string, next?: string): string => {
      const idx = raw.indexOf(label + ":");
      if (idx === -1) return "";
      const start = raw.indexOf("\n", idx);
      let end = raw.length;
      if (next) { const ni = raw.indexOf(next + ":", start > -1 ? start : 0); if (ni !== -1) end = ni; }
      return start > -1 ? raw.slice(start, end).trim() : "";
    };

    const extractInline = (label: string): string => {
      const match = raw.match(new RegExp(`${label}:\\s*([^\\n]+)`));
      return match ? match[1].trim() : "";
    };

    const platformRaw = extractInline("PLATFORMS");
    const platforms = platformRaw.split(/[,/]/).map((p) => p.trim()).filter(Boolean);

    const pillarsRaw = extractField("CONTENT PILLARS", "CHARACTER STORY");
    const contentPillars = pillarsRaw
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    const collabRaw = extractField("COLLABORATION IDEAS", "SAMPLE CAPTIONS");
    const collaborationIdeas = collabRaw
      .split("\n")
      .filter((l) => l.trim().length > 15)
      .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .slice(0, 3);

    const captionsRaw = extractField("SAMPLE CAPTIONS");
    const sampleCaptions = captionsRaw
      .split(/\n\d+\.|—\n/)
      .map((c) => c.trim())
      .filter((c) => c.length > 20)
      .slice(0, 3);

    const ageRaw = extractInline("AGE");
    const age = parseInt(ageRaw) || 24;

    const result = {
      name: extractInline("NAME"),
      handle: extractInline("HANDLE").replace(/^@/, "@"),
      age,
      location: extractInline("LOCATION"),
      bio: extractField("BIO", "AESTHETIC"),
      aesthetic: extractInline("AESTHETIC"),
      contentStyle: extractField("CONTENT STYLE", "PLATFORMS"),
      audienceSize: extractInline("AUDIENCE SIZE"),
      platforms: platforms.length > 0 ? platforms : ["TikTok", "Instagram"],
      contentPillars: contentPillars.length > 0 ? contentPillars : ["Lifestyle", "Fashion", "Brand collabs"],
      characterStory: extractField("CHARACTER STORY", "BRAND COLLAB ANGLE"),
      brandCollabAngle: extractField("BRAND COLLAB ANGLE", "COLLABORATION IDEAS"),
      collaborationIdeas: collaborationIdeas.length > 0 ? collaborationIdeas : [`Organic product integration into daily content for ${brand}`],
      sampleCaptions: sampleCaptions.length > 0 ? sampleCaptions : [`Just discovered @${brand} and I'm absolutely obsessed 🔥`],
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
    const raw = await callGroqWithRetry(
      client,
      "You are a viral marketing expert who specializes in trend-jacking. You know exactly which trends brands can steal and how to adapt them for maximum virality with strong hooks and CTAs.",
      `Activate TREND STEALER MODE for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Identify the 4 hottest current trends on TikTok/Instagram this brand can hijack:

CURRENT TRENDS:
TREND 1: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation with hook and CTA]
TREND 2: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation with hook and CTA]
TREND 3: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation with hook and CTA]
TREND 4: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation with hook and CTA]

ADAPTED CAMPAIGN:
[Full campaign concept that weaves 2-3 of these trends into a cohesive campaign for ${brand}. Include hook, story, and CTA.]

TREND HOOKS:
[5 specific hook lines that steal these trends for ${brand} — ready to paste into TikTok captions]

VIRAL FORMULA:
[The exact formula for why these trends work + how ${brand} can own them]

SOUND SUGGESTIONS:
[5 trending sounds/songs on TikTok/Instagram that would amplify this campaign]

HASHTAG STRATEGY:
[Instagram hashtags set + TikTok hashtag set + branded hashtag idea]`
    );

    const trendLines = raw.match(/TREND \d+:[^\n]+\n/g) || [];
    const currentTrends = trendLines.map((line) => {
      const trendMatch = line.match(/TREND \d+:\s*([^|]+)/);
      const platformMatch = line.match(/PLATFORM:\s*([^|]+)/);
      const viralityMatch = line.match(/VIRALITY:\s*([^|]+)/);
      const howMatch = line.match(/HOW TO USE:\s*(.+)/);
      return {
        trend: trendMatch ? trendMatch[1].trim() : "Trending format",
        platform: platformMatch ? platformMatch[1].trim() : "TikTok",
        virality: viralityMatch ? viralityMatch[1].trim() : "High",
        howToUse: howMatch ? howMatch[1].trim() : "Adapt to brand story",
      };
    });

    const extractField = (label: string, next?: string): string => {
      const idx = raw.indexOf(label + ":");
      if (idx === -1) return "";
      const start = raw.indexOf("\n", idx);
      if (start === -1) return "";
      let end = raw.length;
      if (next) { const ni = raw.indexOf(next + ":", start); if (ni !== -1) end = ni; }
      return raw.slice(start, end).trim();
    };

    const hooksRaw = extractField("TREND HOOKS", "VIRAL FORMULA");
    const trendHooks = hooksRaw
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter((l) => l.length > 10)
      .slice(0, 5);

    const soundRaw = extractField("SOUND SUGGESTIONS", "HASHTAG STRATEGY");
    const soundSuggestions = soundRaw
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    const result = {
      currentTrends: currentTrends.length > 0 ? currentTrends : [
        { trend: "POV storytelling", platform: "TikTok", virality: "Mega", howToUse: `Use POV format to show ${brand} from the customer's perspective` },
        { trend: "Before/After transformation", platform: "Instagram", virality: "High", howToUse: `Show the transformation ${product} enables` },
      ],
      adaptedCampaign: extractField("ADAPTED CAMPAIGN", "TREND HOOKS"),
      trendHooks: trendHooks.length > 0 ? trendHooks : [`The ${brand} trend no one is talking about yet...`],
      viralFormula: extractField("VIRAL FORMULA", "SOUND SUGGESTIONS"),
      soundSuggestions: soundSuggestions.length > 0 ? soundSuggestions : ["Trending pop beat", "Viral audio clip", "Emotional piano"],
      hashtagStrategy: extractField("HASHTAG STRATEGY"),
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
      `You are a world-class marketing strategist. Refine and improve marketing content based on user feedback. Keep what's working, enhance what the user has requested. Maintain the same quality and structure but make specific improvements.`,
      [
        { role: "assistant", content: previousResponse },
      ],
      `Please refine the above marketing content based on this feedback: ${refinement}

${brand ? `Brand: ${brand}` : ""}
${themeLabel ? `Style: ${themeLabel}` : ""}

Keep the same overall structure but make it better, more specific, and more impactful based on the feedback. Output the complete improved version.`
    );

    res.json({ refinedContent: refined, refinement });
  } catch (err) {
    req.log.error({ err }, "Error refining content");
    res.status(500).json({ error: "Failed to refine content. Please try again." });
  }
});

export default router;
