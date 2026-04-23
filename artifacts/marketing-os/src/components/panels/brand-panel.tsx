import { motion } from "framer-motion";
import { Palette, Type, Sparkles, Star, Hash } from "lucide-react";
import type { BrandResult } from "@workspace/api-client-react";
import { CopyButton } from "@/components/ui/copy-button";

interface BrandPanelProps {
  data: BrandResult;
}

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } },
};

export function BrandPanel({ data }: BrandPanelProps) {
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
  };

  if (!data) return null;
  if (typeof data !== "object") {
    return <div className="p-6 text-gray-500 glass rounded-2xl border border-dashed border-border/60">No brand data available</div>;
  }

  const tagline = data?.tagline || "—";
  const brandArchetype = data?.brandArchetype || "Modern Innovator";
  const colorPalette = Array.isArray(data?.colorPalette) ? data.colorPalette : [];
  const brandVoice = data?.brandVoice || "—";
  const fontPairings = Array.isArray(data?.fontPairings) ? data.fontPairings : [];
  const moodboardKeywords = Array.isArray(data?.moodboardKeywords) ? data.moodboardKeywords : [];

  return (
    <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="space-y-4">

      {/* Hero Tagline */}
      <motion.div variants={STAGGER.item}
        className="rounded-2xl border border-primary/25 px-6 py-6 text-center glow-primary-sm"
        style={{ background: "linear-gradient(135deg, hsl(252,100%,72%,0.08), hsl(330,100%,68%,0.06))" }}>
        <p className="section-label text-primary/60 mb-2">Brand Tagline</p>
        <h2 className="text-2xl font-bold gradient-brand-text leading-tight mb-3">&ldquo;{tagline}&rdquo;</h2>
        <div className="flex items-center justify-center gap-3">
          <span className="chip chip-primary">{(brandArchetype.split(" ")[0] || "Brand")} Archetype</span>
          <CopyButton text={tagline} />
        </div>
      </motion.div>

      {/* Color Palette */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Palette className="w-4 h-4 text-pink-400" />
          <span className="section-label">Brand Color Palette</span>
        </div>
        <div className="px-5 py-4">
          {/* Large color blocks */}
          <div className="flex gap-2 mb-4 h-16 rounded-xl overflow-hidden">
            {colorPalette.length > 0 ? colorPalette.map((color, i) => (
              <motion.button
                key={i}
                style={{ backgroundColor: color?.hex || "#ccc", flex: 1 }}
                whileHover={{ flex: 2 }}
                transition={{ duration: 0.2 }}
                onClick={() => color?.hex && handleCopyHex(color.hex)}
                title={`Click to copy ${color?.hex || ""}`}
                className="transition-all duration-200 group relative"
              >
                {color?.hex && (
                  <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-mono bg-black/50 text-white px-1.5 py-0.5 rounded">{color.hex}</span>
                  </div>
                )}
              </motion.button>
            )) : (
              <div className="flex-1 bg-secondary flex items-center justify-center text-xs text-muted-foreground">Palette pending</div>
            )}
          </div>

          {/* Color details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorPalette.map((color, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60 group">
                <button
                  onClick={() => color?.hex && handleCopyHex(color.hex)}
                  style={{ backgroundColor: color?.hex || "#ccc" }}
                  className="w-10 h-10 rounded-lg shrink-0 border border-white/10 shadow-sm"
                  title={`Copy ${color?.hex || ""}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{color?.name || "Color"}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{color?.hex || "N/A"}</p>
                </div>
                {color?.hex && (
                  <button
                    onClick={() => handleCopyHex(color.hex)}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    copy
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2-col: Brand Voice + Archetype */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Brand Voice */}
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="section-label">Brand Voice</span>
            </div>
            <CopyButton text={brandVoice} />
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{brandVoice}</p>
        </motion.div>

        {/* Brand Archetype */}
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="section-label">Brand Archetype</span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{brandArchetype}</p>
        </motion.div>
      </div>

      {/* Font Pairings */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Type className="w-4 h-4 text-cyan-400" />
          <span className="section-label">Font Pairings</span>
        </div>
        <div className="divide-y divide-border/40">
          {fontPairings.length > 0 ? fontPairings.map((font, i) => {
            if (!font) return null;
            const parts = font.split(":");
            const role = parts[0];
            const content = parts.slice(1).join(":").trim();
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-3.5 group">
                <span className="text-[11px] text-primary/60 font-mono uppercase tracking-wider w-16 shrink-0 mt-0.5">{role?.trim() || "FONT"}</span>
                <p className="text-sm text-foreground/90 flex-1">{content || "Font suggestion"}</p>
                <CopyButton text={font} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            );
          }) : (
            <p className="text-sm text-muted-foreground italic px-5 py-4">Font pairings pending.</p>
          )}
        </div>
      </motion.div>

      {/* Logo Concept + Aesthetic Direction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Logo Concept</span>
            <CopyButton text={data?.logoConceptDescription || "Logo concept pending."} />
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{data?.logoConceptDescription || "Logo concept pending."}</p>
        </motion.div>
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Visual Direction</span>
            <CopyButton text={data?.aestheticDirection || "Visual direction pending."} />
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{data?.aestheticDirection || "Visual direction pending."}</p>
        </motion.div>
      </div>

      {/* Moodboard Keywords */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-4 h-4 text-rose-400" />
          <span className="section-label">Moodboard Keywords</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {moodboardKeywords.length > 0 ? moodboardKeywords.map((kw, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="chip hover:chip-primary cursor-default"
            >
              {kw}
            </motion.span>
          )) : (
            <p className="text-sm text-muted-foreground italic">Moodboard keywords pending.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
