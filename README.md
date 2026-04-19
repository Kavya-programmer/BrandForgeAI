#🚀 BrandForgeAI
AI-Powered Marketing Agency Generator

BrandForgeAI is an AI-driven marketing platform that transforms minimal brand input into complete, execution-ready marketing campaigns in seconds.

Users provide a company name, product, target audience, and creative direction — and the system generates a full-stack marketing strategy including campaign concepts, social media plans, influencer strategies, content direction, and ready-to-use marketing assets.

It also produces AI-generated video storyboards and predictive campaign insights, simulating how a real-world marketing agency would plan, execute, and optimize a campaign.

✨ Key Features
🎯 AI Campaign Strategy Generator

Generates full marketing campaigns from simple inputs:

Campaign name & positioning
Platform strategy (TikTok, Instagram, YouTube, etc.)
Influencer recommendations
Hashtag strategy
Posting schedule
📊 Predictive Campaign Insights

AI-based estimates for:

Expected reach
Engagement potential
Campaign effectiveness score
Optimization suggestions
🎬 Video Storyboard Generator

Creates structured scene-by-scene marketing video breakdowns:

Scene direction
Visual concepts
Audio/narration
On-screen text
AI video tool compatibility (Runway, Pika, HeyGen)
🧠 AI Marketing Content Suite

Generates ready-to-use:

Ad scripts
Social media captions
Campaign narratives
Platform-specific content
🎨 Theme-Based Campaign Engine

Users can choose creative directions such as:

Luxury / Emily in Paris aesthetic
Gen Z Viral TikTok mode
Corporate Professional tone
Emotional storytelling
Minimal Apple-style branding
High-energy sports marketing
Trend Stealer mode
AI Influencer mode

Each theme dynamically changes tone, visuals, and strategy.

🏗️ Tech Stack
Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
Backend: Node.js, Express.js, TypeScript
AI Model: Groq API (Llama-3.3-70B Versatile)
Architecture: Monorepo (pnpm workspaces)
State Management: React Query
Styling: Tailwind CSS
⚙️ How It Works
User enters brand details (name, product, audience, theme)
Frontend sends request to backend API
Backend formats structured prompt for LLM
Groq LLM generates full marketing strategy
Response is parsed into structured sections
Frontend renders:
Strategy dashboard
Content suggestions
Video storyboard
Performance insights
🔐 Security
API keys are stored securely using environment variables (Replit Secrets)
No sensitive data is committed to GitHub
Git history cleaned to remove exposed credentials
📌 Project Status

Day 2: Environment setup + initial backend/frontend integration complete
Current Stage: Functional AI campaign generator MVP in development

🚀 Vision

BrandForgeAI aims to replace traditional marketing agencies for early-stage businesses while also serving luxury and enterprise brands seeking innovative, AI-driven creative direction.

It combines:

Strategic marketing intelligence
Generative AI creativity
Predictive analytics
Automated content production

into a single unified marketing system.

📦 Setup (for developers)
pnpm install
pnpm dev

🧠 Future Improvements
Real video rendering pipeline integration
Advanced engagement prediction model
Brand memory system (long-term learning per user)
Multi-model AI routing (different LLMs per task)
Exportable campaign decks (PDF/Notion)
