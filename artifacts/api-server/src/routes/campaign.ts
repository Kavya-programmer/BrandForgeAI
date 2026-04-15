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

function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not configured");
  return new Groq({ apiKey: key });
}

function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

async function callGroq(client: Groq, systemPrompt: string, userPrompt: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.85,
    max_tokens: 3000,
  });
  return completion.choices[0]?.message?.content ?? "";
}

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

function computeViralityScore(content: string, theme: string): number {
  let base = 55 + Math.floor(Math.random() * 30);
  if (theme === "genz_viral" || theme === "trend_stealer") base = Math.min(base + 15, 99);
  if (theme === "luxury" || theme === "minimal_apple") base = Math.max(base - 5, 45);
  if (content.length > 1000) base = Math.min(base + 5, 99);
  return base;
}

function getEstimatedViews(score: number): string {
  if (score >= 90) return "5M–20M+ views likely";
  if (score >= 80) return "1M–5M views likely";
  if (score >= 70) return "500K–1M views likely";
  if (score >= 60) return "100K–500K views likely";
  return "50K–100K views likely";
}

// GET /campaign/themes
router.get("/campaign/themes", (_req, res) => {
  res.json({ themes: THEMES });
});

// POST /campaign/generate
router.post("/campaign/generate", async (req, res) => {
  const parsed = GenerateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();

    const raw = await callGroq(
      client,
      "You are a world-class marketing strategist and creative director. Output is always structured, specific, and immediately actionable.",
      `Generate a complete viral marketing campaign package for:

BRAND: ${brand}
PRODUCT: ${product}
AUDIENCE: ${audience}
THEME: ${themeLabel}

Return EXACTLY in this format:

🎯 CAMPAIGN IDEA:
[1 powerful campaign concept in 2-3 sentences, fully adapted to ${themeLabel} style]

🧠 STRATEGY:
[4-6 bullet points: platform strategy, virality hooks, psychological angles, content cadence]

🎬 AD SCRIPT:
[Full scene-by-scene script with scene descriptions, voiceover, visuals. Label each scene.]

📱 SOCIAL CONTENT:
[Instagram caption with hashtags + TikTok caption with hashtags + 3 tweet ideas]

🎥 VIDEO STORYBOARD:
[Numbered storyboard for 15-30 sec ad: Scene, Duration, Visual, Camera Angle, Audio, Text Overlay. Include Runway/Pika/Sora prompts.]

Make everything authentically ${themeLabel} in tone and style.`
    );

    const viralityScore = computeViralityScore(raw, theme);

    res.json({
      campaignIdea: extractSection(raw, "🎯", "🧠") || raw,
      strategy: extractSection(raw, "🧠", "🎬"),
      adScript: extractSection(raw, "🎬", "📱"),
      socialContent: extractSection(raw, "📱", "🎥"),
      videoStoryboard: extractSection(raw, "🎥"),
      viralityScore,
      viralityExplanation: `This campaign scores ${viralityScore}/100 based on theme fit, emotional resonance, and platform alignment for the ${themeLabel} style.`,
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
    });
  } catch (err) {
    req.log.error({ err }, "Error generating campaign");
    res.status(500).json({ error: "Failed to generate campaign. Please try again." });
  }
});

// POST /campaign/generate-strategy
router.post("/campaign/generate-strategy", async (req, res) => {
  const parsed = GenerateStrategyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const raw = await callGroq(
      client,
      "You are a world-class brand strategist. Output must be deeply specific, actionable, and highly creative.",
      `Create a deep marketing strategy for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Return in JSON-like labeled sections:

POSITIONING:
[How this brand should position itself in the market. 3-4 sentences.]

AUDIENCE PSYCHOLOGY:
[Deep dive into what makes this audience tick — fears, desires, aspirations, decision triggers. 4-5 bullet points.]

VIRAL HOOKS:
[5 specific viral hook angles that would stop someone mid-scroll]

SLOGAN IDEAS:
[5 punchy, memorable slogans for this brand]

PLATFORM STRATEGY:
[Specific tactics for TikTok, Instagram, YouTube, and LinkedIn. What to post, when, how often.]

COMPETITOR ANGLE:
[How to differentiate from competitors. What unique territory to own.]`
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
      text.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(Boolean);

    const positioning = extractLabel(raw, "POSITIONING", "AUDIENCE PSYCHOLOGY");
    const audiencePsychology = extractLabel(raw, "AUDIENCE PSYCHOLOGY", "VIRAL HOOKS");
    const viralHooksRaw = extractLabel(raw, "VIRAL HOOKS", "SLOGAN IDEAS");
    const sloganRaw = extractLabel(raw, "SLOGAN IDEAS", "PLATFORM STRATEGY");
    const platformStrategy = extractLabel(raw, "PLATFORM STRATEGY", "COMPETITOR ANGLE");
    const competitorAngle = extractLabel(raw, "COMPETITOR ANGLE");

    res.json({
      positioning: positioning || raw.slice(0, 400),
      audiencePsychology,
      viralHooks: extractList(viralHooksRaw).slice(0, 5),
      sloganIdeas: extractList(sloganRaw).slice(0, 5),
      platformStrategy,
      competitorAngle,
      viralityScore,
      viralityExplanation: `Based on hook strength, emotional resonance, and platform fit for ${themeLabel}, this strategy scores ${viralityScore}/100.`,
      estimatedViews: getEstimatedViews(viralityScore),
    });
  } catch (err) {
    req.log.error({ err }, "Error generating strategy");
    res.status(500).json({ error: "Failed to generate strategy." });
  }
});

// POST /campaign/generate-video-plan
router.post("/campaign/generate-video-plan", async (req, res) => {
  const parsed = GenerateVideoPlanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const raw = await callGroq(
      client,
      "You are a world-class video director and content strategist specializing in viral marketing videos.",
      `Create a complete 1-Click Ads Factory video production plan for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

FULL SCRIPT:
[Complete 30-second voiceover script]

SCENE 1: [Duration: Xs] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 2: [Duration: Xs] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 3: [Duration: Xs] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 4: [Duration: Xs] [Visual description] [Camera angle] [Audio] [Text overlay]
SCENE 5: [Duration: Xs] [Visual description] [Camera angle] [Audio] [Text overlay]

VOICEOVER:
[Full narration text]

MUSIC STYLE:
[Specific music direction]

EDITING STYLE:
[Specific editing direction]

CAPTIONS TEXT:
[On-screen text sequence]

THUMBNAIL PROMPT:
[AI image generation prompt for thumbnail]

RUNWAY ML PROMPT:
[Specific Runway Gen-3 video generation prompt]

PIKA PROMPT:
[Specific Pika video generation prompt]

HEYGEN PROMPT:
[HeyGen avatar script and direction]

TIKTOK VIRAL VERSION:
[How to adapt this for TikTok viral format]

LUXURY CINEMATIC VERSION:
[How to adapt this for luxury/cinematic style]

MEME VERSION:
[How to adapt this as a meme/comedic version]`
    );

    const scenes = [];
    for (let i = 1; i <= 5; i++) {
      const sceneMatch = raw.match(new RegExp(`SCENE ${i}:[^]*?(?=SCENE ${i+1}:|VOICEOVER:)`, "s"));
      const sceneText = sceneMatch ? sceneMatch[0] : `Scene ${i}: Dynamic ${themeLabel} branded shot`;
      const durationMatch = sceneText.match(/Duration:\s*(\d+s|\d+-\d+s)/i);
      scenes.push({
        sceneNumber: i,
        duration: durationMatch ? durationMatch[1] : `${i * 5}s`,
        visual: sceneText.replace(/SCENE \d+:.*\n/, "").split("\n")[0]?.trim() || `Scene ${i} visual`,
        cameraAngle: sceneText.includes("close") ? "Close-up" : sceneText.includes("wide") ? "Wide shot" : "Medium shot",
        audio: sceneText.includes("Audio]") ? sceneText.split("[Audio]")[1]?.split("\n")[0]?.trim() || "Background music" : "Background music",
        textOverlay: sceneText.includes("Text") ? sceneText.split("Text")[1]?.replace(/[[\]]/g, "")?.split("\n")[0]?.trim() || "" : "",
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

    res.json({
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
    });
  } catch (err) {
    req.log.error({ err }, "Error generating video plan");
    res.status(500).json({ error: "Failed to generate video plan." });
  }
});

// POST /campaign/generate-brand
router.post("/campaign/generate-brand", async (req, res) => {
  const parsed = GenerateBrandBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const raw = await callGroq(
      client,
      "You are a world-class brand designer and identity strategist. You create iconic visual systems.",
      `Design a complete brand identity system for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Return this exact format:

TAGLINE:
[One perfect brand tagline]

BRAND ARCHETYPE:
[The brand archetype (e.g. Hero, Sage, Outlaw, Creator) with 1-sentence explanation]

BRAND VOICE:
[3 adjectives + how the brand speaks and writes]

COLOR PALETTE:
PRIMARY: [Name] | #[hex] | [Usage]
SECONDARY: [Name] | #[hex] | [Usage]
ACCENT: [Name] | #[hex] | [Usage]
DARK: [Name] | #[hex] | [Usage]
LIGHT: [Name] | #[hex] | [Usage]

FONT PAIRINGS:
[Font 1: Heading font + why]
[Font 2: Body font + why]
[Font 3: Accent font + why]

LOGO CONCEPT:
[Detailed description of the logo concept: shape, symbol, style, what it communicates]

AESTHETIC DIRECTION:
[3-4 sentences describing the overall visual world of this brand]

MOODBOARD KEYWORDS:
[10 specific visual keywords]`
    );

    // Parse color palette
    const colorPalette = [];
    const colorLines = raw.match(/(PRIMARY|SECONDARY|ACCENT|DARK|LIGHT):\s*([^|]+)\s*\|\s*(#[A-Fa-f0-9]{6})\s*\|\s*([^\n]+)/g) || [];
    for (const line of colorLines) {
      const parts = line.match(/(PRIMARY|SECONDARY|ACCENT|DARK|LIGHT):\s*([^|]+)\s*\|\s*(#[A-Fa-f0-9]{6})\s*\|\s*([^\n]+)/);
      if (parts) {
        colorPalette.push({ name: parts[2].trim(), hex: parts[3].trim(), usage: parts[4].trim() });
      }
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

    const moodRaw = extractField("MOODBOARD KEYWORDS");
    const moodKeywords = moodRaw
      .split(/[,\n]/)
      .map(k => k.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 10);

    res.json({
      tagline: extractField("TAGLINE", "BRAND ARCHETYPE"),
      brandArchetype: extractField("BRAND ARCHETYPE", "BRAND VOICE"),
      brandVoice: extractField("BRAND VOICE", "COLOR PALETTE"),
      colorPalette,
      fontPairings: fonts,
      logoConceptDescription: extractField("LOGO CONCEPT", "AESTHETIC DIRECTION"),
      aestheticDirection: extractField("AESTHETIC DIRECTION", "MOODBOARD KEYWORDS"),
      moodboardKeywords: moodKeywords,
    });
  } catch (err) {
    req.log.error({ err }, "Error generating brand");
    res.status(500).json({ error: "Failed to generate brand identity." });
  }
});

// POST /campaign/generate-influencer
router.post("/campaign/generate-influencer", async (req, res) => {
  const parsed = GenerateInfluencerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const raw = await callGroq(
      client,
      "You are an influencer marketing expert and creative writer. You create detailed, believable fictional influencer personas.",
      `Create a complete AI influencer persona to front a campaign for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Create a vivid, believable fictional influencer who would be perfect for this brand:

NAME: [First + Last name, realistic]
HANDLE: [@handle, no spaces]
AGE: [Age as number only]
LOCATION: [City, Country]
AUDIENCE SIZE: [e.g. "2.3M followers"]
BIO: [Instagram-style bio, 2-3 lines, includes personality + niche]
AESTHETIC: [Their visual aesthetic in 5 words]
CONTENT STYLE: [How they create content, their signature style]
PLATFORMS: [TikTok, Instagram, YouTube — list the ones they're on]

CONTENT PILLARS:
[4-5 content categories they cover]

CHARACTER STORY:
[2-3 sentence origin story — how they became an influencer, what drives them]

BRAND COLLAB ANGLE:
[Exactly how they would organically integrate ${brand} into their content]

SAMPLE CAPTIONS:
[3 sample post captions they might use featuring ${brand}]`
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
    const platforms = platformRaw.split(/[,/]/).map(p => p.trim()).filter(Boolean);

    const pillarsRaw = extractField("CONTENT PILLARS", "CHARACTER STORY");
    const contentPillars = pillarsRaw
      .split("\n")
      .map(l => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    const captionsRaw = extractField("SAMPLE CAPTIONS");
    const sampleCaptions = captionsRaw
      .split(/\n\d+\.|—\n/)
      .map(c => c.trim())
      .filter(c => c.length > 20)
      .slice(0, 3);

    const ageRaw = extractInline("AGE");
    const age = parseInt(ageRaw) || 24;

    res.json({
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
      brandCollabAngle: extractField("BRAND COLLAB ANGLE", "SAMPLE CAPTIONS"),
      sampleCaptions: sampleCaptions.length > 0 ? sampleCaptions : [`Just discovered @${brand} and I'm obsessed 🔥`],
    });
  } catch (err) {
    req.log.error({ err }, "Error generating influencer");
    res.status(500).json({ error: "Failed to generate influencer persona." });
  }
});

// POST /campaign/trend-stealer
router.post("/campaign/trend-stealer", async (req, res) => {
  const parsed = TrendStealerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { brand, product, audience, theme } = parsed.data;
  const themeLabel = getThemeLabel(theme);

  try {
    const client = getGroqClient();
    const raw = await callGroq(
      client,
      "You are a viral marketing expert who specializes in trend-jacking and making brands go viral on social media.",
      `Activate TREND STEALER MODE for:
BRAND: ${brand} | PRODUCT: ${product} | AUDIENCE: ${audience} | THEME: ${themeLabel}

Identify the 4 hottest current trends on TikTok/Instagram that this brand can hijack, and create a trend-adapted campaign.

CURRENT TRENDS:
TREND 1: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation]
TREND 2: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation]
TREND 3: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation]
TREND 4: [Trend name] | PLATFORM: [platform] | VIRALITY: [High/Mega/Extreme] | HOW TO USE: [Specific adaptation]

ADAPTED CAMPAIGN:
[Full campaign concept that weaves 2-3 of these trends together into a cohesive campaign for ${brand}]

TREND HOOKS:
[5 specific hook lines that steal these trends for ${brand}]

VIRAL FORMULA:
[The exact structural formula to make this content go viral: what to say in first 3 seconds, middle, and CTA]

SOUND SUGGESTIONS:
[4 specific trending audio tracks or sounds to use]

TIMING ADVICE:
[When exactly to post for maximum algorithmic amplification]

PREDICTED PLATFORMS:
[Which platforms will this blow up on and why]`
    );

    const extractField = (label: string, next?: string): string => {
      const idx = raw.indexOf(label + ":");
      if (idx === -1) return "";
      const start = raw.indexOf("\n", idx);
      let end = raw.length;
      if (next) { const ni = raw.indexOf(next + ":", start > -1 ? start : 0); if (ni !== -1) end = ni; }
      return start > -1 ? raw.slice(start, end).trim() : "";
    };

    // Parse trends
    const currentTrends = [];
    const trendMatches = raw.match(/TREND \d+:[^\n]+(?:\n.*HOW TO USE:[^\n]+)?/g) || [];
    for (const t of trendMatches.slice(0, 4)) {
      const namePart = t.match(/TREND \d+:\s*([^|]+)/);
      const platformPart = t.match(/PLATFORM:\s*([^|]+)/);
      const viralPart = t.match(/VIRALITY:\s*([^|]+)/);
      const usePart = t.match(/HOW TO USE:\s*([^\n]+)/);
      currentTrends.push({
        trend: namePart ? namePart[1].trim() : "Viral trend",
        platform: platformPart ? platformPart[1].trim() : "TikTok",
        virality: viralPart ? viralPart[1].trim() : "High",
        howToUse: usePart ? usePart[1].trim() : "Adapt to brand messaging",
      });
    }

    if (currentTrends.length === 0) {
      currentTrends.push({ trend: "GRWM (Get Ready With Me)", platform: "TikTok", virality: "Mega", howToUse: "Show brand product in GRWM routine" });
      currentTrends.push({ trend: "Day in my life", platform: "Instagram", virality: "High", howToUse: "Feature brand naturally in daily routine" });
    }

    const hooksRaw = extractField("TREND HOOKS", "VIRAL FORMULA");
    const trendHooks = hooksRaw.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(Boolean).slice(0, 5);

    const soundsRaw = extractField("SOUND SUGGESTIONS", "TIMING ADVICE");
    const soundSuggestions = soundsRaw.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(Boolean).slice(0, 4);

    const platformsRaw = extractField("PREDICTED PLATFORMS");
    const predictedPlatforms = platformsRaw.split(/[,\n]/).map(p => p.replace(/^[-•*\d.]+\s*/, "").trim()).filter(p => p.length > 2 && p.length < 30).slice(0, 4);

    res.json({
      currentTrends,
      adaptedCampaign: extractField("ADAPTED CAMPAIGN", "TREND HOOKS"),
      trendHooks: trendHooks.length > 0 ? trendHooks : ["Hook 1", "Hook 2"],
      viralFormula: extractField("VIRAL FORMULA", "SOUND SUGGESTIONS"),
      soundSuggestions: soundSuggestions.length > 0 ? soundSuggestions : ["Trending audio from TikTok"],
      timingAdvice: extractField("TIMING ADVICE", "PREDICTED PLATFORMS"),
      predictedPlatforms: predictedPlatforms.length > 0 ? predictedPlatforms : ["TikTok", "Instagram"],
    });
  } catch (err) {
    req.log.error({ err }, "Error in trend stealer");
    res.status(500).json({ error: "Failed to run trend stealer mode." });
  }
});

export default router;
