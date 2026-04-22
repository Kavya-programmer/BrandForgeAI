import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Quote, Zap, MessageSquare, Target } from "lucide-react";
import type { StrategyResult } from "@workspace/api-client-react";
import { CopyButton } from "@/components/ui/copy-button";
import { ViralityGauge } from "@/components/ui/virality-gauge";
import { cn } from "@/lib/utils";

// Backend sends keyMessage but it's not in the generated schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtendedStrategyResult = StrategyResult & { keyMessage?: string } & Record<string, any>;

interface StrategyPanelProps {
  data: ExtendedStrategyResult;
}

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } },
};

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", gradient: "from-gray-800 to-gray-700", indicator: "bg-white" },
  { id: "instagram", label: "Instagram", gradient: "from-pink-500 to-rose-500", indicator: "bg-pink-300" },
  { id: "youtube", label: "YouTube", gradient: "from-red-500 to-red-600", indicator: "bg-red-300" },
  { id: "linkedin", label: "LinkedIn", gradient: "from-blue-600 to-blue-700", indicator: "bg-blue-300" },
];

export function StrategyPanel({ data }: StrategyPanelProps) {
  const [activeHook, setActiveHook] = useState(0);

  return (
    <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="space-y-4">

      {/* Positioning Statement */}
      <motion.div variants={STAGGER.item}
        className="glass rounded-2xl border border-border/60 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-4 right-5 opacity-5">
          <Quote className="w-20 h-20 text-primary" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <span className="section-label">Market Positioning</span>
        </div>
        <div className="flex justify-between items-start gap-3">
          <p className="text-sm text-foreground/90 leading-relaxed flex-1">{data.positioning}</p>
          <CopyButton text={data.positioning} className="shrink-0 mt-0.5" />
        </div>
      </motion.div>

      {/* Key Message */}
      {data.keyMessage && (
        <motion.div variants={STAGGER.item}
          className="rounded-2xl border border-primary/25 px-6 py-5 glow-primary-sm"
          style={{ background: "linear-gradient(135deg, hsl(252,100%,72%,0.08), hsl(290,100%,70%,0.05))" }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="section-label text-primary/70">Core Message</span>
          </div>
          <p className="text-xl font-semibold text-foreground leading-snug">{data.keyMessage}</p>
        </motion.div>
      )}

      {/* Audience Psychology */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="section-label">Audience Psychology</span>
          </div>
          <CopyButton text={data.audiencePsychology} />
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed">{data.audiencePsychology}</p>
      </motion.div>

      {/* Viral Hooks — interactive flashcards */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="section-label">Viral Hooks</span>
          <span className="ml-auto text-[10px] text-muted-foreground">{activeHook + 1} / {data.viralHooks.length}</span>
        </div>
        {/* Hook display */}
        <div className="px-5 py-5 min-h-[90px] flex items-center">
          <motion.p
            key={activeHook}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-base font-medium text-foreground leading-snug"
          >
            &ldquo;{data.viralHooks[activeHook]}&rdquo;
          </motion.p>
        </div>
        {/* Hook selector pills */}
        <div className="flex flex-wrap gap-2 px-5 pb-4">
          {data.viralHooks.map((hook, i) => (
            <button
              key={i}
              onClick={() => setActiveHook(i)}
              className={cn(
                "chip transition-all",
                i === activeHook ? "chip-primary border-primary/40" : "hover:border-border"
              )}
            >
              Hook {i + 1}
            </button>
          ))}
          <CopyButton text={data.viralHooks.join("\n")} className="ml-auto" />
        </div>
      </motion.div>

      {/* 2-col: Slogans + Competitor Angle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Slogan Ideas */}
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <span className="section-label">Slogan Ideas</span>
            </div>
            <CopyButton text={data.sloganIdeas.join("\n")} />
          </div>
          <div className="px-5 py-4 space-y-2">
            {data.sloganIdeas.map((slogan, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <span className="text-[11px] text-primary/60 font-mono w-4 shrink-0">0{i + 1}</span>
                <p className="text-sm text-foreground/90 font-medium flex-1">&ldquo;{slogan}&rdquo;</p>
                <CopyButton text={slogan} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Competitor Angle */}
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="section-label">Competitor Angle</span>
            </div>
            <CopyButton text={data.competitorAngle} />
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-foreground/85 leading-relaxed">{data.competitorAngle}</p>
          </div>
        </motion.div>
      </div>

      {/* Platform Strategy */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
          <span className="section-label">Platform Strategy</span>
          <CopyButton text={data.platformStrategy} />
        </div>
        {/* Platform icons row */}
        <div className="flex gap-2 px-5 pt-4">
          {PLATFORMS.map((p) => (
            <div key={p.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br ${p.gradient} border border-white/10`}>
              <div className={`w-1.5 h-1.5 rounded-full ${p.indicator}`} />
              <span className="text-[11px] text-white font-medium">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-3">
          <p className="text-sm text-foreground/85 leading-relaxed">{data.platformStrategy}</p>
        </div>
      </motion.div>

      {/* Virality Score */}
      <motion.div variants={STAGGER.item}>
        <ViralityGauge
          score={data.viralityScore}
          estimatedViews={data.estimatedViews}
          explanation={data.viralityExplanation}
        />
      </motion.div>
    </motion.div>
  );
}
