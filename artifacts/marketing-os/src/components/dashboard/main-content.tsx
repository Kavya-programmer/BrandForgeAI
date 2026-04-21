"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Lightbulb, MessageSquare, Film, Palette, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedData } from "@/app/page";

const tabs = [
  { id: "campaign", label: "Campaign", icon: Sparkles },
  { id: "strategy", label: "Strategy", icon: TrendingUp },
  { id: "video", label: "Video", icon: Film },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "influencer", label: "Influencer", icon: Users },
  { id: "trends", label: "Trends", icon: Lightbulb },
];

interface MainContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  generatedData: GeneratedData | null;
}

export function MainContent({
  activeTab,
  setActiveTab,
  generatedData,
}: MainContentProps) {
  return (
    <main className="flex-1 h-screen overflow-hidden flex flex-col bg-background">
      {/* Tab Navigation */}
      {generatedData && (
        <div className="px-8 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {generatedData ? (
          <ContentPanel activeTab={activeTab} data={generatedData} />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-secondary flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight mb-3 text-balance">
          Ready to create
        </h2>
        <p className="text-muted-foreground text-base max-w-md leading-relaxed text-balance">
          Fill in your brand details and generate production-ready marketing
          assets powered by AI.
        </p>
      </motion.div>
    </div>
  );
}

function ContentPanel({
  activeTab,
  data,
}: {
  activeTab: string;
  data: GeneratedData;
}) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      {activeTab === "campaign" && <CampaignContent data={data.campaign} />}
      {activeTab === "strategy" && <TextContent title="Core Strategy" content={data.strategy} />}
      {activeTab === "video" && <VideoContent data={data.video} />}
      {activeTab === "brand" && <TextContent title="Brand Identity" content={data.brand} />}
      {activeTab === "influencer" && <TextContent title="AI Influencer Strategy" content={data.influencer} />}
      {activeTab === "trends" && <TrendsContent data={data.trends} />}
    </motion.div>
  );
}

function CampaignContent({
  data,
}: {
  data: GeneratedData["campaign"];
}) {
  return (
    <div className="space-y-6 max-w-3xl">
      <ContentCard
        icon={Lightbulb}
        title="Campaign Idea"
        content={data.campaignIdea}
      />
      <ContentCard
        icon={MessageSquare}
        title="Key Message"
        content={data.keyMessage}
        highlight
      />
    </div>
  );
}

function VideoContent({ data }: { data: GeneratedData["video"] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
      <ContentCard
        icon={Film}
        title="Storyboard"
        content={data.videoStoryboard}
        mono
      />
      <ContentCard
        icon={MessageSquare}
        title="Ad Script"
        content={data.adScript}
        mono
      />
    </div>
  );
}

function TrendsContent({ data }: { data: GeneratedData["trends"] }) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Virality Score */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Virality Score
          </h3>
          <span className="text-xs text-muted-foreground">
            Est. {data.estimatedViews} views
          </span>
        </div>
        <div className="flex items-end gap-4">
          <span className="text-5xl font-semibold tracking-tight">
            {data.viralityScore}
          </span>
          <span className="text-muted-foreground pb-1.5">/100</span>
        </div>
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.viralityScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-foreground rounded-full"
          />
        </div>
      </div>

      <ContentCard
        icon={Lightbulb}
        title="Analysis"
        content={data.viralityExplanation}
      />
    </div>
  );
}

function TextContent({ title, content }: { title: string; content: string }) {
  return (
    <div className="max-w-3xl">
      <ContentCard title={title} content={content} mono />
    </div>
  );
}

function ContentCard({
  icon: Icon,
  title,
  content,
  highlight,
  mono,
}: {
  icon?: React.ElementType;
  title: string;
  content: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 transition-all",
        highlight
          ? "bg-foreground text-background border-foreground"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {Icon && (
          <Icon
            className={cn(
              "w-4 h-4",
              highlight ? "text-background/60" : "text-muted-foreground"
            )}
          />
        )}
        <h3
          className={cn(
            "text-sm font-medium uppercase tracking-wide",
            highlight ? "text-background/60" : "text-muted-foreground"
          )}
        >
          {title}
        </h3>
      </div>
      <p
        className={cn(
          "text-base leading-relaxed whitespace-pre-wrap",
          mono && "font-mono text-sm",
          highlight ? "text-background" : "text-foreground"
        )}
      >
        {content}
      </p>
    </div>
  );
}
