import { motion } from "framer-motion";
import { TrendingUp, Zap, Hash, Music, Lightbulb, Flame } from "lucide-react";
import type { TrendStealerResult } from "@workspace/api-client-react";
import { CopyButton } from "@/components/ui/copy-button";
import { ViralityGauge } from "@/components/ui/virality-gauge";

interface TrendsPanelProps {
  data: TrendStealerResult;
}

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } },
};

const VIRALITY_COLORS: Record<string, string> = {
  mega: "from-rose-500 to-pink-600",
  extreme: "from-orange-500 to-red-600",
  high: "from-amber-500 to-yellow-500",
  medium: "from-emerald-500 to-teal-500",
};

const PLATFORM_BADGES: Record<string, string> = {
  tiktok: "bg-gray-900 border-white/15 text-white",
  instagram: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  youtube: "bg-red-500/10 border-red-400/25 text-red-400",
  linkedin: "bg-blue-500/10 border-blue-400/25 text-blue-400",
  "youtube shorts": "bg-red-500/10 border-red-400/25 text-red-400",
};

export function TrendsPanel({ data }: TrendsPanelProps) {
  if (!data) {
    return (
      <div className="p-8 text-center glass rounded-2xl border border-dashed border-border/60">
        <p className="text-muted-foreground italic">Trends data is unavailable.</p>
      </div>
    );
  }

  const currentTrends = Array.isArray(data.currentTrends) ? data.currentTrends : [];
  const trendHooks = Array.isArray(data.trendHooks) ? data.trendHooks : [];
  const adaptedCampaign = data.adaptedCampaign || data.campaignIdea || "Trend adaptation pending.";

  return (
    <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="space-y-4">

      {/* Current Trends Grid */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Flame className="w-4 h-4 text-rose-400" />
          <span className="section-label">Trending Right Now</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          {currentTrends.length > 0 ? currentTrends.map((trend, i) => {
            if (!trend) return null;
            const viralKey = (trend.virality || "").toLowerCase();
            const gradient = VIRALITY_COLORS[viralKey] ?? "from-violet-500 to-purple-600";
            const platformKey = (trend.platform || "").toLowerCase();
            const badgeClass = PLATFORM_BADGES[platformKey] ?? "bg-secondary border-border text-muted-foreground";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="glass-strong rounded-xl border border-border/50 overflow-hidden card-hover"
              >
                {/* Trend header */}
                <div className={`px-4 py-2.5 bg-gradient-to-r ${gradient} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                    <span className="text-sm font-bold text-white">{trend.trend || "Trending Topic"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`chip border text-[10px] ${badgeClass}`}>{trend.platform || "Social"}</span>
                    <span className="text-[10px] font-bold text-white/80 uppercase">{trend.virality || "High"}</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-foreground/80 leading-relaxed">{trend.howToUse || "Integration strategy pending."}</p>
                </div>
              </motion.div>
            );
          }) : (
            <p className="text-sm text-muted-foreground italic col-span-2 px-2">No active trends detected.</p>
          )}
        </div>
      </motion.div>

      {/* Adapted Campaign */}
      <motion.div variants={STAGGER.item}
        className="rounded-2xl border border-primary/20 px-6 py-5 glow-primary-sm"
        style={{ background: "linear-gradient(135deg, hsl(252,100%,72%,0.07), hsl(290,100%,70%,0.05))" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="section-label text-primary/70">Adapted Campaign Concept</span>
          </div>
          <CopyButton text={adaptedCampaign} />
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{adaptedCampaign}</p>
      </motion.div>

      {/* 2-col: Hooks + Viral Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Hooks */}
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="section-label">Trend Hooks</span>
            </div>
            <CopyButton text={trendHooks.join("\n")} />
          </div>
          <div className="px-5 py-4 space-y-2">
            {trendHooks.length > 0 ? trendHooks.map((hook, i) => (
              <div key={i} className="flex items-start gap-2.5 group">
                <span className="w-5 h-5 rounded-md bg-amber-400/15 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 leading-snug flex-1">{hook}</p>
                  <CopyButton text={hook} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic">Trend-jacking hooks pending.</p>
            )}
          </div>
        </motion.div>

        {/* Viral Formula + Timing */}
        <div className="space-y-3">
          <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">Viral Formula</span>
              <CopyButton text={data.viralFormula || data.coreStrategy || ""} />
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{data.viralFormula || data.coreStrategy || "Viral formula not available."}</p>
          </motion.div>
          <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">Timing Strategy</span>
              <CopyButton text={data.timingAdvice || ""} />
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{data.timingAdvice || "Optimal timing data pending."}</p>
          </motion.div>
        </div>
      </div>

      {/* Hashtag Strategy */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            <span className="section-label">Hashtag Strategy</span>
          </div>
          <CopyButton text={data.hashtagStrategy || ""} />
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed mb-4">{data.hashtagStrategy || "Hashtag strategy pending."}</p>
        {/* Hashtag chips */}
        {Array.isArray(data.hashtags) && data.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.hashtags.map((tag, i) => (
              <button
                key={i}
                onClick={() => navigator.clipboard.writeText(tag).catch(() => {})}
                className="chip chip-primary hover:bg-primary/20 cursor-pointer"
                title="Click to copy"
              >
                {tag}
              </button>
            ))}
            <CopyButton text={data.hashtags.join(" ")} />
          </div>
        )}
      </motion.div>

      {/* Sound Suggestions */}
      {Array.isArray(data.soundSuggestions) && data.soundSuggestions.length > 0 && (
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
            <Music className="w-4 h-4 text-pink-400" />
            <span className="section-label">Trending Sound Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {data.soundSuggestions.map((sound, i) => (
              <span key={i} className="chip hover:border-pink-400/30 hover:text-pink-300 transition-colors">
                🎵 {sound}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trend Insights */}
      {Array.isArray(data.trendInsights) && data.trendInsights.length > 0 && (
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="section-label">Platform Insights</span>
          </div>
          <div className="divide-y divide-border/40">
            {data.trendInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className="w-6 h-6 rounded-lg bg-amber-400/15 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Virality Score */}
      <motion.div variants={STAGGER.item}>
        <ViralityGauge
          score={data.viralityScore || 85}
          estimatedViews={data.estimatedViews || "500K-1M views"}
          explanation={data.viralityExplanation || "Virality breakdown pending."}
        />
      </motion.div>
    </motion.div>
  );
}
