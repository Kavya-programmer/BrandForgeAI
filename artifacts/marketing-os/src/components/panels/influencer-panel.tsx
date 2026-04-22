import { motion } from "framer-motion";
import { Users, MapPin, Globe, Lightbulb, Star, MessageSquare } from "lucide-react";
import type { InfluencerResult } from "@workspace/api-client-react";
import { CopyButton } from "@/components/ui/copy-button";

// Backend sends collaborationIdeas + influencerTypes but they're not in the schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtendedInfluencerResult = InfluencerResult & {
  collaborationIdeas?: string[];
  influencerTypes?: string[];
} & Record<string, any>;

interface InfluencerPanelProps {
  data: ExtendedInfluencerResult;
}

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } },
};

const PLATFORM_STYLES: Record<string, string> = {
  tiktok: "badge-tiktok",
  instagram: "badge-instagram",
  youtube: "badge-youtube",
  linkedin: "badge-linkedin",
};

export function InfluencerPanel({ data }: InfluencerPanelProps) {
  const name = data.name || data.selectedInfluencerName || "Influencer Persona";
  const handle = data.handle || `@${name.toLowerCase().replace(/\s/g, "")}`;
  const collaborationIdeas = Array.isArray(data.collaborationIdeas) ? data.collaborationIdeas : [];
  const contentPillars = Array.isArray(data.contentPillars) ? data.contentPillars : [];
  const sampleCaptions = Array.isArray(data.sampleCaptions) ? data.sampleCaptions : [];
  const platforms = Array.isArray(data.platforms) ? data.platforms : ["Instagram", "TikTok"];
  const influencerTypes = Array.isArray(data.influencerTypes) ? data.influencerTypes : [];

  // Generate a consistent avatar background from name
  const avatarColors = ["from-violet-500 to-purple-600", "from-pink-500 to-rose-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600"];
  const avatarGradient = avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="space-y-4">

      {/* Profile Card */}
      <motion.div variants={STAGGER.item}
        className="glass rounded-2xl border border-border/60 overflow-hidden">
        {/* Banner */}
        <div className="h-24 relative"
          style={{ background: "linear-gradient(135deg, hsl(252,100%,72%,0.3), hsl(330,100%,68%,0.2))" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(252,100%,72%), transparent)" }}
          />
        </div>

        {/* Profile info */}
        <div className="px-6 pb-5">
          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold border-4 border-card shadow-xl`}>
              {initials}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-foreground">{name}</h2>
              <p className="text-sm text-primary font-medium">{handle}</p>
            </div>
            <div className="ml-auto pb-1 text-right">
              <p className="text-xl font-bold text-foreground">{data.audienceSize || "500K+"}</p>
              <p className="text-xs text-muted-foreground">Total Following</p>
            </div>
          </div>

          {/* Meta info row */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {data.location || "Global"}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              Age {data.age || "24-32"}
            </span>
            {data.aesthetic && (
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {data.aesthetic}
              </span>
            )}
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {platforms.map((platform) => (
              <span key={platform}
                className={`chip border ${PLATFORM_STYLES[platform.toLowerCase()] ?? "chip"}`}>
                {platform}
              </span>
            ))}
          </div>

          {/* Bio */}
          <div className="bg-secondary/60 rounded-xl p-3">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm text-foreground/85 leading-relaxed flex-1 italic">&ldquo;{data.bio || data.campaignIdea || "AI Influencer profile pending."}&rdquo;</p>
              <CopyButton text={data.bio || data.campaignIdea || ""} className="shrink-0" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Style + Influencer Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="section-label">Content Style</span>
            </div>
            <CopyButton text={data.contentStyle || data.coreStrategy || ""} />
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{data.contentStyle || data.coreStrategy || "Content direction pending."}</p>
        </motion.div>

        {influencerTypes.length > 0 && (
          <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="section-label">Influencer Types</span>
            </div>
            <div className="space-y-2">
              {influencerTypes.map((type, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                  <span className="text-primary/60 font-mono text-xs w-5">{i + 1}.</span>
                  {type}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Content Pillars */}
      {contentPillars.length > 0 && (
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="section-label">Content Pillars</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {contentPillars.map((pillar, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="chip chip-primary"
              >
                {pillar}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Brand Collab Angle */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-violet-400" />
            <span className="section-label">Collaboration Angle</span>
          </div>
          <CopyButton text={data.brandCollabAngle || data.influencerAngles || ""} />
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed">{data.brandCollabAngle || data.influencerAngles || "Partnership strategy pending."}</p>
      </motion.div>

      {/* Collab Ideas */}
      {collaborationIdeas.length > 0 && (
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
            <Lightbulb className="w-4 h-4 text-rose-400" />
            <span className="section-label">Collaboration Ideas</span>
          </div>
          <div className="divide-y divide-border/40">
            {collaborationIdeas.map((idea, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5 group">
                <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, hsl(${252 + i * 40}, 100%, 70%), hsl(${290 + i * 40}, 100%, 70%))` }}>
                  {i + 1}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed flex-1">{idea}</p>
                <CopyButton text={idea} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sample Captions */}
      {sampleCaptions.length > 0 && (
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="section-label">Sample Captions</span>
          </div>
          <div className="divide-y divide-border/40">
            {sampleCaptions.map((caption, i) => (
              <div key={i} className="px-5 py-4 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="chip chip-primary">Caption {i + 1}</span>
                  <CopyButton text={caption} />
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">{caption}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Character Story */}
      {data.characterStory && (
        <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Origin Story</span>
            <CopyButton text={data.characterStory} />
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed italic">&ldquo;{data.characterStory}&rdquo;</p>
        </motion.div>
      )}

      {/* Virality Score */}
      <motion.div variants={STAGGER.item}>
        <ViralityGauge
          score={data.viralityScore}
          estimatedViews={data.estimatedViews}
          explanation={data.viralityExplanation || "Virality breakdown pending."}
        />
      </motion.div>
    </motion.div>
  );
}
