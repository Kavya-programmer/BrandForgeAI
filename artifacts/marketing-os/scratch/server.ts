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
  const { brand = "Nike", product = "shoes", audience = "teens" } = body || {};
  
  const common = {
    campaignIdea: `${brand} ${product.charAt(0).toUpperCase() + product.slice(1)}: Unleash Your Potential`,
    keyMessage: `Built for the next generation of ${audience}.`,
    coreStrategy: "• High-energy visual storytelling\n• Social-first viral challenges\n• Community-led brand advocacy",
    socialContent: "Level up your game. #NikeSport #NextGen",
    videoStoryboard: "Fast cuts of high-intensity sports action.",
    adScript: "You don't wait for the future. You build it.",
    brandPositioning: "The ultimate performance brand for modern athletes.",
    influencerAngles: "Partnering with rising stars and local icons.",
    competitorAngle: "Unlike competitors who focus on legacy, we emphasize the explosive energy of the next generation through raw, unfiltered content."
  };

  switch (name) {
    case 'generate': return common;
    case 'generate-strategy': return { 
      ...common, 
      positioning: common.brandPositioning, 
      audiencePsychology: "Driven by achievement and status, they seek brands that validate their hustle and individuality.", 
      viralHooks: ["The Secret to 10x Performance", "Stop Waiting for Permission", "Why Elite Athletes are Switching"], 
      sloganIdeas: ["Just Built Different", "Run Your Own Race", "Future of Speed"],
      platformStrategy: "TikTok: High-intensity transition videos. Instagram: Cinematic lifestyle reels. LinkedIn: Thought leadership on performance engineering."
    };
    case 'generate-influencer': return { 
      ...common, 
      selectedInfluencerName: "Alex Rivers", 
      handle: "@arivers", 
      audienceSize: "2.4M", 
      bio: "Tech & Lifestyle visionary helping the next generation optimize their performance.", 
      location: "Los Angeles, CA",
      age: "22-26",
      aesthetic: "Cyber-Athletic / Neo-Noir",
      collaborationIdeas: ["Behind the scenes training with Nike Proto-X", "Day in the life of a high-performance athlete", "Custom Nike DIY modification challenge"], 
      sampleCaptions: ["The grind never stops. We built this for the ones who never sleep.", "Ready for anything. The future is active."],
      characterStory: "Alex started as a local track star who documented their recovery using high-tech gear, eventually becoming the global face of tech-infused athletics.",
      viralityExplanation: "Alex has a 12% engagement rate with teens, specifically in the high-energy sports niche."
    };
    case 'generate-video-plan': return { 
      ...common, 
      scenes: [
        { sceneNumber: 1, duration: "3s", visual: "Close up of shoes hitting pavement with electric sparks", audio: "Heavy breathing, rhythmic thumping", cameraAngle: "Ultra-low ground level" }, 
        { sceneNumber: 2, duration: "5s", visual: "Wide shot of athlete at sunrise on a skyscraper roof", audio: "Inspirational synth pad swelling", cameraAngle: "Cinematic drone orbit" }
      ], 
      script: common.adScript, 
      musicStyle: "High-BPM Cinematic Trap with industrial accents", 
      editingStyle: "Fast-paced rhythmic glitch cuts matching the beat",
      captionsText: "[BEAT DROPS] UNLEASH YOUR POTENTIAL. [CUT TO LOGO] NIKE: THE FUTURE IS NOW.",
      runwayPrompt: "Cinematic close-up of a futuristic running shoe with neon accents, ultra-realistic, 8k, slow motion, city lights bokeh.",
      pikaPrompt: "Athlete sprinting through a neon-lit tunnel, motion blur, dramatic lighting, high energy.",
      heygen_prompt: "Welcome to the future of performance. These shoes aren't just gear; they're your evolution.",
      thumbnailPrompt: "Close-up of a glowing Nike shoe on a dark background, high contrast, text: 'THE EVOLUTION' in bold yellow.",
      versions: {
        tiktokViral: "Fast-paced POV transition focusing on the transformation from casual to pro.",
        luxuryCinematic: "Slow, sweeping shots emphasizing the premium materials and design.",
        memeVersion: "A relatable 'before and after' showing the confidence boost from wearing the shoes."
      }
    };
    case 'generate-brand': return { 
      ...common, 
      tagline: "Unleash Your Potential", 
      brandArchetype: "The Hero", 
      brandVoice: "Bold, inspirational, and unapologetically energetic, using punchy, direct language.", 
      colorPalette: [{ name: "Volt Green", hex: "#CEFF00" }, { name: "Deep Obsidian", hex: "#111111" }, { name: "Flash Crimson", hex: "#FF0055" }], 
      fontPairings: ["Heading: Futura Extra Bold", "Body: Inter Tight"], 
      moodboardKeywords: ["Speed", "Energy", "Grit", "Victory", "Neon"],
      logoConceptDescription: "A minimalist swoosh combined with an abstract lightning bolt, representing the fusion of legacy and speed.",
      aestheticDirection: "Cyber-Athletic Minimalist: Sharp lines, high contrast, and vibrant neon accents against dark obsidian backgrounds."
    };
    case 'trend-stealer': return { 
      ...common, 
      currentTrends: [
        { trend: "AI Athletics", platform: "TikTok", virality: "Explosive", howToUse: "Use AI filters to show future performance and results" },
        { trend: "Midnight Run Clubs", platform: "Instagram", virality: "High", howToUse: "Host exclusive midnight runs and capture with low-light cinematic reels" }
      ], 
      trendHooks: ["How AI is changing your recovery game", "The midnight secret to peak performance", "Stop running like it's 2024"], 
      adaptedCampaign: `A nocturnal, tech-driven campaign focusing on the 'After Hours' athlete who uses AI to gain an edge.`,
      viralFormula: "Combining the 'secret club' aesthetic of midnight runs with the curiosity of AI performance data.",
      timingAdvice: "Post between 9 PM and 11 PM to target the night-owl athlete demographic.",
      hashtagStrategy: "Use a mix of ultra-niche tech tags and broad athletic tags to bridge the gap between lifestyle and performance.",
      hashtags: ["#MidnightAthlete", "#AIPerformance", "#NikeNextGen", "#SpeedEvolution", "#ActiveNightLife"]
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
