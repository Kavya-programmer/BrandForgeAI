import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
import { unifyResponse } from '../src/lib/campaign-logic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.join(__dirname, '../api/campaign');

const app = express();
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

const wrapHandler = (handler, name) => async (req, res) => {
  const vercelRes = {
    status: (code) => {
      res.status(code);
      return vercelRes;
    },
    json: (data) => {
      res.json(data);
      return vercelRes;
    },
    setHeader: (name, value) => {
      res.setHeader(name, value);
      return vercelRes;
    }
  };
  
  try {
    // If GROQ_API_KEY is missing, provide high-quality mock data instead of calling the handler
    if (!process.env.GROQ_API_KEY && name !== 'themes') {
       const mockRaw = getMockDataRaw(name, req.body);
       const { brand = "Nike", product = "shoes", audience = "teens", theme = "luxury" } = req.body || {};
       const unified = unifyResponse(mockRaw, brand, product, audience, theme);
       
       console.log(`[MOCK] Serving unified mock data for ${name}`);
       console.log(`[MOCK] Fields present: ${Object.keys(unified).filter(k => unified[k]).join(', ')}`);
       
       return res.status(200).json({ error: false, message: "Success", data: unified });
    }
    
    await handler(req, vercelRes);
  } catch (err) {
    console.error(`Handler Error for ${name}:`, err);
    res.status(500).json({ error: true, message: err.message });
  }
};

function getMockDataRaw(name, body) {
  const { brand = "Generic Brand", product = "Premium Product", audience = "Target Audience" } = body || {};
  
  const common = {
    campaignIdea: `${brand} ${product.charAt(0).toUpperCase() + product.slice(1)}: The New Standard`,
    keyMessage: `Revolutionizing the way ${audience} experience ${product}.`,
    coreStrategy: "• High-impact digital storytelling\n• Strategic platform-specific rollout\n• Community-driven engagement loops",
    socialContent: `Elevate your lifestyle with ${brand}. #Innovation #NextGen`,
    videoStoryboard: `Cinematic sequences showing the real-world impact of ${product} on ${audience}.`,
    adScript: "The future doesn't just happen. You create it.",
    brandPositioning: `The leading ${product} choice for the modern ${audience}.`,
    influencerAngles: "Highlighting authentic usage and transformation stories.",
    competitorAngle: `While others focus on tradition, ${brand} pushes boundaries to deliver unmatched value to ${audience}.`
  };

  switch (name) {
    case 'generate': return common;
    case 'generate-strategy': return { 
      ...common, 
      positioning: common.brandPositioning, 
      audiencePsychology: `Driven by quality and efficiency, ${audience} seek solutions that simplify their lives and provide status.`, 
      viralHooks: [`The Secret to ${product} Mastery`, `Stop Settling for Less`, `Why ${audience} are Switching to ${brand}`], 
      sloganIdeas: [`Simply Better`, `The ${brand} Way`, `Future of ${product}`],
      platformStrategy: "TikTok: High-energy transitions. Instagram: Cinematic lifestyle reels. LinkedIn: Industry-leading insights."
    };
    case 'generate-influencer': return { 
      ...common, 
      selectedInfluencerName: "Taylor Morgan", 
      handle: "@taylor_innovates", 
      audienceSize: "1.2M", 
      bio: `Niche expert and lifestyle influencer focused on ${product} and innovation.`, 
      location: "Global",
      age: "25-34",
      aesthetic: "Modern / Minimalist / Professional",
      collaborationIdeas: [`Unboxing and first impressions of ${product}`, `A day in the life powered by ${brand}`, `${product} stress test challenge`], 
      sampleCaptions: [`The search is over. Finally a ${product} that gets it.`, `Everything changed when I started using ${brand}.`],
      characterStory: `Taylor is a respected voice in the ${product} space, known for honest reviews and high-quality production.`,
      viralityExplanation: `Taylor has a high trust score with ${audience}, ensuring rapid adoption of ${brand}.`
    };
    case 'generate-video-plan': return { 
      ...common, 
      scenes: [
        { sceneNumber: 1, duration: "3s", visual: `Close up of ${product} in action`, audio: "Dynamic ambient soundscape", cameraAngle: "Close-up / Detail" }, 
        { sceneNumber: 2, duration: "5s", visual: `Satisfied user (${audience}) interacting with the brand`, audio: "Upbeat inspirational track", cameraAngle: "Medium shot" }
      ], 
      script: common.adScript, 
      musicStyle: "Modern Cinematic Ambient with driving percussion", 
      editingStyle: "Clean, rhythmic cuts with smooth transitions",
      captionsText: `[DYNAMIC MUSIC] DISCOVER ${brand.toUpperCase()}. [CUT TO LOGO] THE FUTURE IS HERE.`,
      runwayPrompt: `Cinematic close-up of ${product}, ultra-realistic, 8k, slow motion, elegant lighting, professional studio setup.`,
      pikaPrompt: `Person representing ${audience} using ${product} in a modern environment, dramatic lighting, high quality.`,
      heygen_prompt: `Welcome to the new standard of ${product}. ${brand} isn't just a choice; it's an upgrade for your lifestyle.`,
      thumbnailPrompt: `Professional product shot of ${product} on a clean background, high contrast, text: 'THE NEW STANDARD' in bold white.`,
      versions: {
        tiktokViral: "Fast-paced POV showing the immediate benefit of the brand.",
        luxuryCinematic: "Slow, sweeping shots highlighting premium quality.",
        educational: "Breakdown of the top 3 features that matter to the audience."
      }
    };
    case 'generate-brand': return { 
      ...common, 
      tagline: "The New Standard", 
      brandArchetype: "The Explorer", 
      brandVoice: "Confident, clear, and forward-thinking, using sophisticated yet accessible language.", 
      colorPalette: [{ name: "Modern Slate", hex: "#2D3436" }, { name: "Pure White", hex: "#FFFFFF" }, { name: "Electric Accent", hex: "#0984E3" }], 
      fontPairings: ["Heading: Plus Jakarta Sans", "Body: Inter"], 
      moodboardKeywords: ["Innovation", "Clarity", "Growth", "Quality", "Future"],
      logoConceptDescription: `A geometric emblem representing the core values of ${brand}, balanced and modern.`,
      aestheticDirection: "Modern Professional: Clean layouts, generous white space, and high-quality photography."
    };
    case 'trend-stealer': return { 
      ...common, 
      currentTrends: [
        { trend: "Silent Luxury", platform: "TikTok", virality: "High", howToUse: `Emphasize the understated quality of ${product}` },
        { trend: "Daily Rituals", platform: "Instagram", virality: "Stable", howToUse: `Show how ${brand} fits into the user's everyday routine` }
      ], 
      trendHooks: [`How ${brand} is redefining ${product}`, `The secret ritual of ${audience}`, `Stop doing it the old way`], 
      adaptedCampaign: `A lifestyle-centric campaign focusing on the seamless integration of ${brand} into the user's life.`,
      viralFormula: "Combining high-value educational content with visually satisfying product demonstrations.",
      timingAdvice: "Post during peak engagement hours for the specific target demographic.",
      hashtagStrategy: "Use a mix of industry-standard tags and unique brand-specific identifiers.",
      hashtags: [`#${brand.replace(/\s+/g, '')}`, `#${product.replace(/\s+/g, '')}`, "#Innovation", "#ModernLiving", "#QualityFirst"]
    };
    default: return common;
  }
}

const endpoints = ['generate', 'generate-strategy', 'generate-influencer', 'generate-brand', 'generate-video-plan', 'trend-stealer', 'refine', 'themes'];

async function setup() {
  for (const name of endpoints) {
    const filePath = path.join(apiRoot, `${name}.ts`);
    if (fs.existsSync(filePath)) {
      const module = await import(pathToFileURL(filePath).href);
      app[name === 'themes' ? 'get' : 'post'](`/api/campaign/${name}`, wrapHandler(module.default, name));
    }
  }
  
  // Health check
  app.get('/api/healthz', (req, res) => res.json({ status: 'ok' }));
  
  const PORT = 8080;
  app.listen(PORT, '0.0.0.0', () => console.log(`API Server running on port ${PORT}`));
}

setup();
