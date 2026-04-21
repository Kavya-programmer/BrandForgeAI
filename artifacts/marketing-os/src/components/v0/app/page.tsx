"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MainContent } from "@/components/dashboard/main-content";
import { LoadingOverlay } from "@/components/dashboard/loading-overlay";
import { Toaster } from "@/components/ui/toaster";

export type FormData = {
  brand: string;
  product: string;
  audience: string;
  theme: string;
};

export type ActionType =
  | "campaign"
  | "strategy"
  | "video"
  | "brand"
  | "influencer"
  | "trends";

export type MarketingPayload = {
  campaignIdea: string;
  keyMessage: string;
  coreStrategy: string;
  socialContent: string;
  videoStoryboard: string;
  adScript: string;
  brandPositioning: string;
  influencerAngles: string;
  viralityScore: number;
  viralityExplanation: string;
  estimatedViews: string;
};

export type GeneratedData = {
  campaign: { campaignIdea: string; keyMessage: string };
  strategy: string;
  video: { videoStoryboard: string; adScript: string };
  brand: string;
  influencer: string;
  trends: {
    viralityScore: number;
    viralityExplanation: string;
    estimatedViews: string;
  };
};

export default function Dashboard() {
  const [formData, setFormData] = useState<FormData>({
    brand: "",
    product: "",
    audience: "",
    theme: "",
  });

  const [activeTab, setActiveTab] = useState("campaign");
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Demo function to simulate AI generation
  const handleGenerate = async (type: ActionType) => {
    if (
      !formData.brand ||
      !formData.product ||
      !formData.audience ||
      !formData.theme
    ) {
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockData: GeneratedData = {
      campaign: {
        campaignIdea: `Revolutionary ${formData.theme} campaign for ${formData.brand} targeting ${formData.audience}. This multi-channel approach combines emotional storytelling with data-driven personalization.`,
        keyMessage: `${formData.brand}: Where innovation meets ${formData.audience.toLowerCase()}'s aspirations.`,
      },
      strategy: `Core Strategy for ${formData.brand}:\n\n1. Market Positioning: Premium ${formData.theme} positioning\n2. Target Audience: ${formData.audience}\n3. Key Differentiators: AI-powered personalization\n4. Distribution Channels: Social, Search, Display`,
      video: {
        videoStoryboard: `Scene 1: Open on ${formData.audience} in their daily environment\nScene 2: Problem moment - frustration visible\nScene 3: Discovery of ${formData.brand}\nScene 4: Transformation montage\nScene 5: New reality with ${formData.product}`,
        adScript: `[OPEN: Soft morning light]\nNARRATOR: "In a world where ${formData.audience.toLowerCase()} deserve more..."\n[CUT TO: Product reveal]\nNARRATOR: "${formData.brand}. ${formData.product}."\n[END: Logo + CTA]`,
      },
      brand: `Brand Identity Framework for ${formData.brand}:\n\n• Voice: Confident, approachable, innovative\n• Visual Language: Clean lines, premium materials\n• Emotional Territory: Empowerment & aspiration\n• Brand Promise: Transformative experiences`,
      influencer: `AI Influencer Strategy:\n\n• Tier 1 (Macro): Tech thought leaders\n• Tier 2 (Micro): ${formData.audience} community voices\n• Content Pillars: Education, Entertainment, Inspiration\n• Collaboration Format: Long-term partnerships`,
      trends: {
        viralityScore: 87,
        viralityExplanation: `High virality potential due to strong emotional hooks and ${formData.theme} positioning that resonates with current market trends.`,
        estimatedViews: "2.4M - 5.8M",
      },
    };

    setGeneratedData(mockData);
    setActiveTab(type);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      <AnimatePresence>{isGenerating && <LoadingOverlay />}</AnimatePresence>

      <Sidebar
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasData={generatedData !== null}
      />

      <MainContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        generatedData={generatedData}
      />

      <Toaster />
    </div>
  );
}
