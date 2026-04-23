import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

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
       console.log(`[MOCK] Serving mock data for ${name}`);
       return res.status(200).json(getMockData(name, req.body));
    }
    
    await handler(req, vercelRes);
  } catch (err) {
    console.error(`Handler Error for ${name}:`, err);
    res.status(500).json({ error: true, message: err.message });
  }
};

function getMockData(name, body) {
  const { brand = "Nike", product = "shoes", audience = "teens", theme = "High Energy Sports" } = body || {};
  
  const common = {
    campaignIdea: `${brand} ${product.charAt(0).toUpperCase() + product.slice(1)}: Unleash Your Potential`,
    keyMessage: `Built for the next generation of ${audience}.`,
    coreStrategy: "• High-energy visual storytelling\n• Social-first viral challenges\n• Community-led brand advocacy",
    socialContent: "Level up your game. #NikeSport #NextGen",
    videoStoryboard: "Fast cuts of high-intensity sports action.",
    adScript: "You don't wait for the future. You build it.",
    brandPositioning: "The ultimate performance brand for modern athletes.",
    influencerAngles: "Partnering with rising stars and local icons.",
    viralityScore: 88,
    estimatedViews: "1M–5M views"
  };

  switch (name) {
    case 'generate': return { error: false, message: "Success", data: common };
    case 'generate-strategy': return { error: false, message: "Success", data: { ...common, positioning: common.brandPositioning, audiencePsychology: "Driven by achievement and status", viralHooks: ["The Secret to 10x Performance", "Stop Waiting for Permission"], sloganIdeas: ["Just Built Different", "Run Your Own Race"] } };
    case 'generate-influencer': return { error: false, message: "Success", data: { ...common, selectedInfluencerName: "Alex Rivers", handle: "@arivers", audienceSize: "2.4M", bio: "Tech & Lifestyle visionary", collaborationIdeas: ["Behind the scenes training", "Day in the life with Nike"], sampleCaptions: ["The grind never stops.", "Ready for anything."] } };
    case 'generate-video-plan': return { error: false, message: "Success", data: { ...common, scenes: [{ sceneNumber: 1, duration: "3s", visual: "Close up of shoes hitting pavement", audio: "Heavy breathing, rhythmic thumping", cameraAngle: "Low angle" }, { sceneNumber: 2, duration: "5s", visual: "Wide shot of athlete at sunrise", audio: "Inspirational synth pad", cameraAngle: "Drone" }], script: common.adScript, musicStyle: "Cinematic Trap", editingStyle: "Fast-paced glitch cuts" } };
    case 'generate-brand': return { error: false, message: "Success", data: { ...common, tagline: "Unleash Your Potential", brandArchetype: "The Hero", brandVoice: "Inspirational, bold, and energetic", colorPalette: [{ name: "Volt Green", hex: "#CEFF00" }, { name: "Deep Obsidian", hex: "#111111" }], fontPairings: ["Heading: Futura Extra Bold", "Body: Inter"], moodboardKeywords: ["Speed", "Energy", "Grit", "Victory"] } };
    case 'trend-stealer': return { error: false, message: "Success", data: { ...common, currentTrends: [{ trend: "AI Athletics", platform: "TikTok", virality: "Explosive", howToUse: "Use AI filters to show future performance" }], trendHooks: ["How AI is changing the game", "My AI coach said this..."], adaptedCampaign: `Viral ${brand} campaign leveraging AI-driven performance tracking.` } };
    default: return { error: false, message: "Success", data: common };
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
