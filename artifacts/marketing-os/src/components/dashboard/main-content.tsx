import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Film,
  Palette,
  Users,
  Zap,
  Brain,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionType, ModuleResults } from "@/pages/dashboard";
import { CampaignPanel } from "@/components/panels/campaign-panel";
import { StrategyPanel } from "@/components/panels/strategy-panel";
import { VideoPanel } from "@/components/panels/video-panel";
import { BrandPanel } from "@/components/panels/brand-panel";
import { InfluencerPanel } from "@/components/panels/influencer-panel";
import { TrendsPanel } from "@/components/panels/trends-panel";

const TABS: {
  id: ActionType;
  label: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
}[] = [
  { id: "campaign", label: "Campaign", icon: Sparkles, gradient: "from-violet-500 to-purple-600", description: "Full campaign package" },
  { id: "strategy", label: "Strategy", icon: TrendingUp, gradient: "from-emerald-500 to-teal-600", description: "Deep market insights" },
  { id: "video", label: "Video Plan", icon: Film, gradient: "from-blue-500 to-indigo-600", description: "Production plan" },
  { id: "brand", label: "Brand DNA", icon: Palette, gradient: "from-pink-500 to-rose-600", description: "Identity system" },
  { id: "influencer", label: "Influencer", icon: Users, gradient: "from-amber-500 to-orange-600", description: "AI persona" },
  { id: "trends", label: "Trends", icon: TrendingUp, gradient: "from-cyan-500 to-sky-600", description: "Viral trends" },
];

interface MainContentProps {
  activeTab: ActionType;
  setActiveTab: (tab: ActionType) => void;
  results: ModuleResults;
  hasAnyResult: boolean;
  onGenerate: (type: ActionType) => void;
  isGenerating: boolean;
  loadingModule: ActionType | null;
}

export function MainContent({
  activeTab,
  setActiveTab,
  results,
  hasAnyResult,
  onGenerate,
  isGenerating,
  loadingModule,
}: MainContentProps) {
  const activeTabInfo = TABS.find((t) => t.id === activeTab);

  return (
    <main className="flex-1 h-screen overflow-hidden flex flex-col bg-background">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-4 shrink-0">
        {hasAnyResult ? (
          /* Tab navigation */
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 flex-1">
            {TABS.map((tab) => {
              const hasResult = !!results[tab.id];
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 relative",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "hsl(var(--secondary))" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <div className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center relative z-10 transition-all",
                    isActive ? `bg-gradient-to-br ${tab.gradient}` : "bg-secondary"
                  )}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="relative z-10">{tab.label}</span>
                  {hasResult && !isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 absolute top-1.5 right-1.5 z-10" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Empty state header */
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4" />
            <span>BrandForge AI — Marketing Command Center</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {hasAnyResult ? (
          <div className="px-6 py-6 max-w-5xl">
            {/* Active tab header */}
            {activeTabInfo && results[activeTab] && (
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTabInfo.gradient}`}>
                    <activeTabInfo.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{activeTabInfo.label}</h2>
                    <p className="text-xs text-muted-foreground">{activeTabInfo.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Panel content */}
            <AnimatePresence mode="wait">
              {activeTab === "campaign" && results.campaign && (
                <motion.div key="campaign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CampaignPanel data={results.campaign} />
                </motion.div>
              )}
              {activeTab === "strategy" && results.strategy && (
                <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StrategyPanel data={results.strategy} />
                </motion.div>
              )}
              {activeTab === "video" && results.video && (
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VideoPanel data={results.video} />
                </motion.div>
              )}
              {activeTab === "brand" && results.brand && (
                <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <BrandPanel data={results.brand} />
                </motion.div>
              )}
              {activeTab === "influencer" && results.influencer && (
                <motion.div key="influencer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InfluencerPanel data={results.influencer} />
                </motion.div>
              )}
              {activeTab === "trends" && results.trends && (
                <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TrendsPanel data={results.trends} />
                </motion.div>
              )}

              {/* Tab has no result yet */}
              {!results[activeTab] && (
                <motion.div
                  key="empty-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  {activeTabInfo && (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${activeTabInfo.gradient} mb-4 opacity-60`}>
                      <activeTabInfo.icon className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">
                    {activeTabInfo?.label}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    This module hasn't been generated yet. Click below to use the AI and generate {activeTabInfo?.label.toLowerCase()} based on your brand brief.
                  </p>
                  <button
                    onClick={() => onGenerate(activeTab)}
                    disabled={isGenerating}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg text-sm flex items-center gap-2",
                      isGenerating || loadingModule === activeTab
                        ? "bg-primary/50 cursor-not-allowed"
                        : `bg-gradient-to-r ${activeTabInfo?.gradient} opacity-90 hover:opacity-100 hover:scale-[1.02] active:scale-95 shadow-lg`
                    )}
                  >
                    {isGenerating || loadingModule === activeTab ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Brain className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate {activeTabInfo?.label}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  const features = [
    { icon: Sparkles, label: "AI Campaign Generation", desc: "Full multi-channel marketing campaigns in seconds", gradient: "from-violet-500 to-purple-600" },
    { icon: TrendingUp, label: "Deep Strategy Engine", desc: "Audience psychology, viral hooks & slogan ideas", gradient: "from-emerald-500 to-teal-600" },
    { icon: Film, label: "Video Production Plan", desc: "Scene-by-scene storyboard + AI tool prompts", gradient: "from-blue-500 to-indigo-600" },
    { icon: Palette, label: "Brand Identity System", desc: "Color palettes, fonts, archetypes & moodboards", gradient: "from-pink-500 to-rose-600" },
    { icon: Users, label: "AI Influencer Creator", desc: "Generate complete fictional influencer personas", gradient: "from-amber-500 to-orange-600" },
    { icon: Zap, label: "Trend Stealer Mode", desc: "Hijack viral trends and adapt them to your brand", gradient: "from-cyan-500 to-sky-600" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl text-center"
      >
        {/* Hero icon */}
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
          style={{ background: "linear-gradient(135deg, hsl(252,100%,72%), hsl(330,100%,68%))" }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain className="w-9 h-9 text-white" />
          <div className="absolute -inset-1 rounded-3xl opacity-30"
            style={{ background: "linear-gradient(135deg, hsl(252,100%,72%), hsl(330,100%,68%))", filter: "blur(12px)" }}
          />
        </motion.div>

        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Your AI Marketing
          <span className="gradient-brand-text"> Command Center</span>
        </h2>
        <p className="text-muted-foreground text-base mb-10 max-w-md mx-auto leading-relaxed">
          Fill in your brand brief on the left, then generate any module instantly with Groq LLaMA 3.3.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="glass rounded-xl border border-border/50 p-3.5 card-hover"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${f.gradient} mb-2.5`}>
                <f.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-semibold text-foreground mb-1">{f.label}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground"
        >
          <ArrowRight className="w-4 h-4 rotate-180 text-primary" />
          <span>Fill in your brief on the left to get started</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  );
}
