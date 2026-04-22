import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Mic, Music, Scissors, Type, Camera, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import type { VideoPlanResult } from "@workspace/api-client-react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface VideoPanelProps {
  data: VideoPlanResult;
  videoUrl?: string; // optional backend-provided video URL
}

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } },
};

const AI_TOOLS = [
  { key: "runwayPrompt", label: "Runway Gen-3", color: "from-violet-500 to-purple-600", description: "AI video generation prompt" },
  { key: "pikaPrompt", label: "Pika Labs", color: "from-blue-500 to-indigo-600", description: "Motion video prompt" },
  { key: "heygen_prompt", label: "HeyGen Avatar", color: "from-emerald-500 to-teal-600", description: "AI spokesperson script" },
  { key: "thumbnailPrompt", label: "Thumbnail", color: "from-amber-500 to-orange-600", description: "AI image generation prompt" },
];

const VERSION_LABELS = [
  { key: "tiktokViral", label: "🎵 TikTok FYP Version", gradient: "from-gray-800 to-gray-700" },
  { key: "luxuryCinematic", label: "🎬 Luxury Cinematic", gradient: "from-violet-600 to-purple-700" },
  { key: "memeVersion", label: "😂 Meme / Comedy Version", gradient: "from-amber-600 to-orange-700" },
];


// ─── Main Panel ────────────────────────────────────────────────────────────────

export function VideoPanel({ data, videoUrl }: VideoPanelProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  return (
    <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="space-y-4">

      {/* Script — Teleprompter */}
      <motion.div variants={STAGGER.item} className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500/80" />
          <div className="terminal-dot bg-yellow-500/80" />
          <div className="terminal-dot bg-green-500/80" />
          <span className="ml-2 text-[11px] text-muted-foreground flex-1">voiceover-script.txt</span>
          <CopyButton text={data.script} />
        </div>
        <div className="px-5 py-4 max-h-52 overflow-y-auto">
          <pre className="text-sm leading-relaxed text-emerald-300/90 whitespace-pre-wrap font-mono">{data.script}</pre>
        </div>
      </motion.div>

      {/* Scene Timeline */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Film className="w-4 h-4 text-blue-400" />
          <span className="section-label">Scene Timeline</span>
          <CopyButton
            text={data.scenes.map((s) => `Scene ${s.sceneNumber} (${s.duration}): ${s.visual} | ${s.audio}`).join("\n")}
            className="ml-auto"
          />
        </div>
        <div className="p-4 space-y-3">
          {data.scenes.map((scene, i) => (
            <motion.div
              key={scene.sceneNumber}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 group"
            >
              {/* Scene number + timeline */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{scene.sceneNumber}</span>
                </div>
                {i < data.scenes.length - 1 && (
                  <div className="w-px h-full min-h-[12px] bg-border/60 mt-1 mb-0" />
                )}
              </div>

              {/* Scene content */}
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="chip chip-primary">{scene.duration}</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Camera className="w-3 h-3" /> {scene.cameraAngle}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-1">{scene.visual}</p>
                <p className="text-xs text-muted-foreground">{scene.audio}</p>
                {scene.textOverlay && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                    <Type className="w-3 h-3" />
                    {scene.textOverlay}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Production details row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Music, label: "Music Direction", content: data.musicStyle, color: "text-pink-400" },
          { icon: Scissors, label: "Editing Style", content: data.editingStyle, color: "text-cyan-400" },
          { icon: Type, label: "Captions", content: data.captionsText, color: "text-amber-400" },
        ].map(({ icon: Icon, label, content, color }) => content ? (
          <motion.div key={label} variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-3.5 h-3.5", color)} />
              <span className="section-label">{label}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <p className="text-xs text-foreground/85 leading-relaxed flex-1">{content}</p>
              <CopyButton text={content} className="shrink-0" />
            </div>
          </motion.div>
        ) : null)}
      </div>

      {/* AI Tool Prompts */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Wand2 className="w-4 h-4 text-violet-400" />
          <span className="section-label">AI Tool Prompts</span>
        </div>
        <div className="divide-y divide-border/40">
          {AI_TOOLS.map((tool) => {
            const content = data[tool.key as keyof VideoPlanResult] as string;
            if (!content) return null;
            const isOpen = expandedTool === tool.key;
            return (
              <div key={tool.key}>
                <button
                  onClick={() => setExpandedTool(isOpen ? null : tool.key)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br ${tool.color}`}>
                    <Wand2 className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{tool.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{tool.description}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4">
                        <div className="terminal rounded-xl">
                          <div className="terminal-header px-3 py-2">
                            <div className="terminal-dot bg-red-500/50" />
                            <div className="terminal-dot bg-yellow-500/50" />
                            <div className="terminal-dot bg-green-500/50" />
                            <span className="ml-2 text-[10px] text-muted-foreground flex-1">prompt</span>
                            <CopyButton text={content} />
                          </div>
                          <pre className="px-4 py-3 text-xs text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{content}</pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Platform Versions */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Mic className="w-4 h-4 text-rose-400" />
          <span className="section-label">Platform Adaptations</span>
        </div>
        <div className="divide-y divide-border/40">
          {VERSION_LABELS.map(({ key, label, gradient }) => {
            const v = data.versions as unknown as Record<string, string>;
            const content = v[key];
            if (!content) return null;
            return (
              <div key={key} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r ${gradient} text-xs font-semibold text-white`}>
                    {label}
                  </div>
                  <CopyButton text={content} />
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">{content}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
