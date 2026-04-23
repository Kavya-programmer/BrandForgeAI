import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.join(__dirname, '../api/campaign');

const app = express();
app.use(express.json());

const wrapHandler = (handler) => async (req, res) => {
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
    await handler(req, vercelRes);
  } catch (err) {
    console.error("Handler Error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
};

const endpoints = ['generate', 'generate-strategy', 'generate-influencer', 'generate-brand', 'generate-video-plan', 'trend-stealer', 'refine'];

async function setup() {
  for (const name of endpoints) {
    const filePath = path.join(apiRoot, `${name}.ts`);
    if (fs.existsSync(filePath)) {
      const module = await import(pathToFileURL(filePath).href);
      if (name === 'generate') {
          app.post(`/api/campaign/${name}`, (req, res) => {
              res.json({
                  error: false,
                  message: "Success",
                  data: {
                      campaignIdea: "Sustainable Urban Luxury",
                      keyMessage: "Model 3: The pinnacle of green elegance.",
                      coreStrategy: "• High-end cinematic content\n• Targeted affluent eco-professionals\n• Viral social proof",
                      socialContent: "Redefining the drive. #TeslaModel3",
                      videoStoryboard: "Sleek lines against a mountain backdrop.",
                      adScript: "The future is here, and it's electric.",
                      brandPositioning: "The world's leader in sustainable luxury.",
                      influencerAngles: "Tech visionaries and environmentalists.",
                      viralityScore: 94,
                      estimatedViews: "10M+ views"
                  }
              });
          });
      } else {
        app.post(`/api/campaign/${name}`, wrapHandler(module.default));
      }
    }
  }
  app.listen(3001, () => console.log('Mock Server on 3001'));
}
setup();
