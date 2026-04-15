import { Router } from "express";
import Groq from "groq-sdk";
import { GenerateCampaignBody } from "@workspace/api-zod";

const router = Router();

const THEMES = [
  {
    id: "luxury",
    label: "Luxury / Emily in Paris",
    description: "Elegant, aspirational, cinematic — think high-end fashion and lifestyle",
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
];

router.get("/campaign/themes", (req, res) => {
  res.json({ themes: THEMES });
});

router.post("/campaign/generate", async (req, res) => {
  const parsed = GenerateCampaignBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { brand, product, audience, theme } = parsed.data;

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    res.status(500).json({ error: "GROQ_API_KEY is not configured" });
    return;
  }

  const client = new Groq({ apiKey: groqApiKey });

  const themeObj = THEMES.find((t) => t.id === theme);
  const themeLabel = themeObj ? themeObj.label : theme;

  const prompt = `You are an elite AI marketing strategist at the world's most innovative creative agency.

Generate a complete, world-class marketing campaign package for the following brand. Adapt EVERY element to perfectly match the theme style.

BRAND: ${brand}
PRODUCT/SERVICE: ${product}
TARGET AUDIENCE: ${audience}
CAMPAIGN THEME: ${themeLabel}

Return your response in EXACTLY this format with these exact section headers:

🎯 CAMPAIGN IDEA:
[One powerful, memorable campaign concept tailored to the ${themeLabel} style. 2-3 sentences max.]

🧠 STRATEGY:
[How this campaign goes viral. Include platform strategy, content cadence, influencer angle if relevant, and the core psychological hook. 4-6 bullet points.]

🎬 AD SCRIPT:
[A full scene-by-scene video ad script. Include scene descriptions, dialogue/voiceover, visual direction, and pacing. Format as numbered scenes. Should feel like a real professional ad script.]

📱 SOCIAL CONTENT:
[Instagram caption (with hashtags) + TikTok caption (with hashtags) + 3 tweet ideas. Label each clearly.]

🎥 VIDEO STORYBOARD:
[Detailed storyboard for a 15-30 second video ad. Include: Scene number, Duration, Visual Description, Camera Angle, Audio/Music, Text Overlay. Format as a table or numbered list. Include prompts for AI video generation tools like Runway/Pika/Sora.]

Make everything feel authentically ${themeLabel} in tone, aesthetic, and style. Make it competition-winning quality.`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a world-class marketing strategist and creative director. You create viral, culturally resonant campaigns for top brands. Your output is always structured, specific, and immediately actionable.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.85,
      max_tokens: 3000,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    const extractSection = (content: string, emoji: string, nextEmoji?: string): string => {
      const startMarker = `${emoji}`;
      const startIdx = content.indexOf(startMarker);
      if (startIdx === -1) return "";

      const afterHeader = content.indexOf("\n", startIdx);
      if (afterHeader === -1) return "";

      let endIdx = content.length;
      if (nextEmoji) {
        const nextIdx = content.indexOf(nextEmoji, afterHeader);
        if (nextIdx !== -1) endIdx = nextIdx;
      }

      return content.slice(afterHeader, endIdx).trim();
    };

    const campaignIdea = extractSection(rawContent, "🎯", "🧠");
    const strategy = extractSection(rawContent, "🧠", "🎬");
    const adScript = extractSection(rawContent, "🎬", "📱");
    const socialContent = extractSection(rawContent, "📱", "🎥");
    const videoStoryboard = extractSection(rawContent, "🎥");

    res.json({
      campaignIdea: campaignIdea || rawContent,
      strategy,
      adScript,
      socialContent,
      videoStoryboard,
      theme,
      brand,
    });
  } catch (err) {
    req.log.error({ err }, "Error calling Groq API");
    res.status(500).json({ error: "Failed to generate campaign. Please try again." });
  }
});

export default router;
