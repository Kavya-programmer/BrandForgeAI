import Groq from "groq-sdk";

export interface CampaignResponse {
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
}

export const THEMES = [
  { id: "luxury", label: "Luxury / Emily in Paris", description: "Elegant, aspirational, cinematic — romantic branding and emotional storytelling" },
  { id: "genz_viral", label: "Gen Z Viral TikTok", description: "Fast-paced, trendy, raw, authentic — built for algorithm virality" },
  { id: "corporate", label: "Corporate Professional", description: "Clean, trustworthy, data-driven — perfect for B2B and enterprise brands" },
  { id: "emotional", label: "Emotional Storytelling", description: "Heartfelt, narrative-driven, tear-jerking — connects on a human level" },
  { id: "minimal_apple", label: "Minimal Apple Style", description: "Sleek, product-focused, whisper-quiet elegance — let the product speak" },
  { id: "high_energy_sports", label: "High Energy Sports", description: "Explosive, motivational, fast cuts — built for athletes and action brands" },
  { id: "trend_stealer", label: "Trend Stealer Mode", description: "Hijacks viral trends and adapts them to your brand instantly" },
  { id: "ai_influencer", label: "AI Influencer Mode", description: "Creates fictional influencer persona campaigns" },
];

export const CURATED_INFLUENCERS = [
  {
    name: "Cristiano Ronaldo",
    handle: "@cristiano",
    age: 39,
    location: "Riyadh, Saudi Arabia",
    audienceSize: "600M+ followers",
    bio: "Global sports icon",
    aesthetic: "Athletic premium",
    contentStyle: "Sports + lifestyle",
    platforms: ["Instagram"],
    influencerTypes: ["Sports"],
    contentPillars: ["Football"]
  },
  {
    name: "Emma Chamberlain",
    handle: "@emmachamberlain",
    age: 23,
    location: "Los Angeles, CA",
    audienceSize: "16M+ followers",
    bio: "anything goes podcast",
    aesthetic: "Gen Z relatable",
    contentStyle: "Raw vlogs",
    platforms: ["YouTube"],
    influencerTypes: ["Lifestyle"],
    contentPillars: ["Fashion"]
  }
];

export function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    console.error("❌ GROQ_API_KEY missing");
    return null;
  }

  return new Groq({ apiKey: key });
}

export function getThemeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}

/**
 * 🔥 SAFE JSON PARSER (prevents UI breaking)
 */
function safeParseJSON(raw: string, fallbackType?: string, fallbackContext?: any) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("❌ INVALID JSON FROM GROQ:", raw);

    if (fallbackType) {
      return getFallbackResponse(fallbackType, fallbackContext);
    }

    throw new Error("INVALID_JSON_FROM_GROQ");
  }
}

export async function callGroqJSON<T = Record<string, unknown>>(
  client: Groq | null,
  systemPrompt: string,
  userPrompt: string,
  fallbackType?: string,
  fallbackContext?: any,
  maxRetries = 2
): Promise<T> {

  if (!client) {
    console.log("⚠️ NO GROQ CLIENT → fallback used");
    return getFallbackResponse(fallbackType || "strategy", fallbackContext) as T;
  }

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              systemPrompt +
              "\n\nIMPORTANT: Return ONLY valid JSON. No text, no markdown."
          },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 3500,
      });

      const raw = completion.choices[0]?.message?.content ?? "";

      const parsed = safeParseJSON(raw, fallbackType, fallbackContext);

      console.log("✅ GROQ SUCCESS");

      return parsed as T;

    } catch (err) {
      console.error("❌ GROQ ERROR:", err);
      lastError = err;

      if (attempt < maxRetries) {
        console.log("🔁 RETRYING GROQ...");
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  console.log("⚠️ ALL RETRIES FAILED → fallback");

  return getFallbackResponse(fallbackType || "strategy", fallbackContext) as T;
}

/**
 * 🔥 GUARANTEED UI SAFE FALLBACKS
 */
export function getFallbackResponse(type: string, context: any = {}): CampaignResponse {
  const brand = context.brand || "Brand";
  const product = context.product || "Product";
  const audience = context.audience || "Audience";

  const base = {
    campaignIdea: `The ${brand} Transformation: A bold approach to ${product} for ${audience}.`,
    keyMessage: `${brand} delivers quality and innovation.`,
    coreStrategy: "• Market disruption\n• High engagement content\n• Community building",
    socialContent: "Daily authentic updates and user testimonials.",
    videoStoryboard: "Scene 1: Problem. Scene 2: Product Solution. Scene 3: CTA.",
    adScript: "Stop settling for less. Experience the best with ${brand}.",
    brandPositioning: "Premium leader in the space.",
    influencerAngles: "Authentic lifestyle and expert reviews.",
    viralityScore: 75,
    estimatedViews: "100K–500K views likely"
  };

  if (type === "strategy") {
    return {
      ...base,
      campaignIdea: `Strategic positioning for ${brand} in the ${product} market.`,
      brandPositioning: `${brand} is the premier solution for ${audience}.`,
      coreStrategy: "• Focus on quality\n• Emphasize durability\n• Target niche communities"
    };
  }

  if (type === "influencer") {
    const influencer = CURATED_INFLUENCERS[0];
    return {
      ...base,
      influencerAngles: `Aligning with ${influencer.name} to reach ${audience}. Angle: Authentic lifestyle integration.`
    };
  }

  if (type === "video-plan") {
    return {
      ...base,
      videoStoryboard: "Scene 1: Epic reveal. Scene 2: Feature demo. Scene 3: Social proof.",
      adScript: "This is the video script for the next big thing."
    };
  }

  if (type === "trend-stealer") {
    return {
      ...base,
      campaignIdea: "Trend-jacking current viral movements.",
      coreStrategy: "• Identify trends early\n• Adapt quickly\n• High-frequency posting"
    };
  }

  return base;
}

export function computeViralityScore(content: string, theme: string): number {
  const lower = content.toLowerCase();
  const hooks = ["imagine", "the secret", "here's why", "stop doing", "viral", "pov", "truth"].filter(p => lower.includes(p)).length * 5;
  let base = 50 + hooks + Math.floor(Math.random() * 10);
  if (theme === "genz_viral" || theme === "trend_stealer") base += 15;
  return Math.min(Math.max(base, 40), 99);
}

export function getEstimatedViews(score: number): string {
  if (score >= 90) return "5M–20M+ views likely";
  if (score >= 80) return "1M–5M views likely";
  if (score >= 70) return "500K–1M views likely";
  return "100K–500K views likely";
}

export function normalizeBulletPoints(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(l => `• ${String(l).trim()}`).join("\n");
  }
  if (typeof value !== "string" || !value) return "• High impact strategy\n• Market disruption\n• Community engagement";
  return value.split("\n").filter(Boolean).map(l => `• ${l.replace(/^[-*•\d.)\s]+/, "").trim()}`).join("\n");
}

/**
 * 🔥 UNIFY RESPONSE (Ensures all data matches CampaignResponse interface)
 */
export function unifyResponse(data: any, brand: string, product: string, audience: string, theme: string): CampaignResponse {
  const score = computeViralityScore(JSON.stringify(data), theme);
  
  return {
    campaignIdea: typeof data.campaignIdea === 'string' ? data.campaignIdea : (data.positioning || data.adaptedCampaign || `The ${brand} campaign for ${audience}.`),
    keyMessage: typeof data.keyMessage === 'string' ? data.keyMessage : (data.tagline || `${brand}: The choice for ${audience}.`),
    coreStrategy: normalizeBulletPoints(data.coreStrategy || data.viralHooks || data.platformStrategy || data.uniqueSellingPoints),
    socialContent: typeof data.socialContent === 'string' ? data.socialContent : (data.brandVoice || (Array.isArray(data.collaborationIdeas) ? data.collaborationIdeas.join("\n") : "Social strategy pending.")),
    videoStoryboard: typeof data.videoStoryboard === 'string' ? data.videoStoryboard : (Array.isArray(data.scenes) ? data.scenes.map((s:any) => s.visual).join(" | ") : "Cinematic video sequence."),
    adScript: typeof data.adScript === 'string' ? data.adScript : (data.script || data.sampleCaptions?.[0] || "High-converting ad copy."),
    brandPositioning: typeof data.brandPositioning === 'string' ? data.brandPositioning : (data.positioning || data.brandArchetype || "Premium market leader."),
    influencerAngles: typeof data.influencerAngles === 'string' ? data.influencerAngles : (data.brandCollabAngle || data.selectedInfluencerName || "Strategic influencer partnerships."),
    viralityScore: score,
    estimatedViews: getEstimatedViews(score)
  };
}