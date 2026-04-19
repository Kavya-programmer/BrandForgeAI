# 🚀 BrandForgeAI

### AI-Powered Marketing Agency Generator

> Turn a simple idea into a full-scale marketing campaign in seconds.

---

## 📌 Overview

BrandForgeAI is an AI-driven marketing platform that transforms minimal brand inputs into complete, execution-ready marketing strategies.

Users provide:
- Company name  
- Product  
- Target audience  
- Creative theme  

The system generates a full marketing agency output instantly.

It includes:
- Campaign strategy  
- Social media plans  
- Influencer suggestions  
- Content direction  
- Ad scripts  
- Video storyboards  
- Performance insights  

---

## ✨ Key Features

### 🎯 AI Campaign Strategy Generator
- Campaign naming & positioning  
- Platform selection (TikTok, Instagram, YouTube, etc.)  
- Influencer recommendations  
- Hashtag strategy  
- Posting schedules  

---

### 📊 Predictive Campaign Insights
- Expected reach  
- Engagement potential  
- Campaign effectiveness score  
- Optimization suggestions  

---

### 🎬 Video Storyboard Generator
- Scene-by-scene breakdowns  
- Visual concepts  
- Narration & audio guidance  
- On-screen text  
- Compatible with Runway / Pika / HeyGen  

---

### 🧠 AI Marketing Content Suite
- Ad scripts  
- Social media captions  
- Campaign narratives  
- Platform-specific content  

---

### 🎨 Theme-Based Campaign Engine

- Luxury / Emily in Paris aesthetic  
- Gen Z Viral TikTok mode  
- Corporate Professional tone  
- Emotional storytelling  
- Minimal Apple-style branding  
- High-energy sports marketing  
- Trend Stealer mode  
- AI Influencer mode  

Each theme dynamically adapts tone, visuals, and strategy.

---

## 🏗️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui  
- **Backend:** Node.js, Express.js, TypeScript  
- **AI Model:** Groq API (Llama-3.3-70B Versatile)  
- **Architecture:** Monorepo (pnpm workspaces)  
- **State Management:** React Query  

---

## ⚙️ How It Works

1. User enters brand details  
2. Frontend sends request to backend  
3. Backend builds structured LLM prompt  
4. Groq generates campaign output  
5. Response is parsed into sections  
6. Frontend renders dashboard (strategy, content, storyboard, insights)

---

## 🔐 Security

- API keys stored in environment variables (Replit Secrets)
- No sensitive data committed to GitHub
- Git history cleaned of exposed credentials

---

## 📌 Project Status

**Day 2:** Environment setup + backend/frontend integration complete  
**Current:** Functional AI campaign generator MVP

---

## 🚀 Vision

BrandForgeAI combines:
- Strategic marketing intelligence  
- Generative AI creativity  
- Predictive analytics  
- Automated content production  

It supports both:
- startups needing fast execution  
- luxury brands seeking creative reinvention  

---

## 📦 Setup

```bash
pnpm install
pnpm dev
