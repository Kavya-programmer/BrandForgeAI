import { motion } from "framer-motion";
import {
  Lightbulb,
  MessageSquare,
  Target,
  Share2,
  Film,
  Users,
  Sparkles,
  Instagram,
  Youtube,
} from "lucide-react";

// Extended type — backend returns more fields than the OpenAPI spec CampaignResult
type ExtendedCampaignResult = {
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
  // legacy fields
  strategy?: string;
  brand?: string;
  theme?: string;
};
import { CopyButton } from "@/components/ui/copy-button";
import { ViralityGauge } from "@/components/ui/virality-gauge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CampaignPanelData = ExtendedCampaignResult & Record<string, any>;

interface CampaignPanelProps {
  data: CampaignPanelData;
}

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } },
};

function Card({
  icon: Icon,
  title,
  children,
  gradient,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}) {
  return (
    <motion.div variants={STAGGER.item} className={`card-hover glass rounded-2xl border border-border/60 overflow-hidden ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${gradient ?? "bg-secondary"}`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

function TextCard({
  icon,
  title,
  content,
  gradient,
}: {
  icon?: React.ElementType;
  title: string;
  content: string;
  gradient?: string;
}) {
  return (
    <Card icon={icon} title={title} gradient={gradient}>
      <div className="flex justify-between items-start gap-3">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap flex-1">{content}</p>
        <CopyButton text={content} className="shrink-0 mt-0.5" />
      </div>
    </Card>
  );
}

export function CampaignPanel({ data }: CampaignPanelProps) {
  // Parse social content sections
  const socialParts = data.socialContent
    ? data.socialContent.split(/(?:instagram|tiktok|twitter|tweet|linkedin)/i)
    : [data.socialContent];

  const socialPlatforms = [
    { label: "Instagram", icon: Instagram, content: socialParts[1] || data.socialContent, color: "from-pink-500 to-rose-500" },
    { label: "TikTok", icon: Film, content: socialParts[2] || data.socialContent, color: "from-gray-800 to-gray-700" },
    { label: "Twitter/X", icon: MessageSquare, content: socialParts[3] || "", color: "from-sky-500 to-blue-600" },
  ].filter((p) => p.content?.trim());

  return (
    <motion.div
      variants={STAGGER.container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Hero: Campaign Idea */}
      <motion.div variants={STAGGER.item} className="relative glass rounded-2xl border border-primary/20 overflow-hidden glow-primary-sm">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ background: "linear-gradient(135deg, hsl(252,100%,72%), hsl(330,100%,68%))" }}
        />
        <div className="relative px-6 pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(252,100%,72%), hsl(290,100%,70%))" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">Campaign Idea</span>
            </div>
            <CopyButton text={data.campaignIdea} />
          </div>
          <p className="text-base text-foreground leading-relaxed font-medium">{data.campaignIdea}</p>
        </div>
      </motion.div>

      {/* Key Message */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="section-label">Key Message</span>
          </div>
          <CopyButton text={data.keyMessage} />
        </div>
        <p className="text-xl font-semibold text-foreground leading-snug">{data.keyMessage}</p>
      </motion.div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Core Strategy */}
        <Card icon={Target} title="Core Strategy" gradient="bg-gradient-to-br from-emerald-500 to-teal-600">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              {data.coreStrategy.split("\n").filter(Boolean).map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                  <span className="leading-relaxed">{line.replace(/^[•\-\*]\s*/, "")}</span>
                </div>
              ))}
            </div>
            <CopyButton text={data.coreStrategy} className="shrink-0" />
          </div>
        </Card>

        {/* Brand Positioning */}
        <TextCard
          icon={Lightbulb}
          title="Brand Positioning"
          content={data.brandPositioning}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        />

        {/* Video Storyboard */}
        <Card icon={Film} title="Video Storyboard" gradient="bg-gradient-to-br from-blue-500 to-indigo-600">
          <div className="flex justify-between items-start gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed font-mono flex-1 whitespace-pre-wrap">{data.videoStoryboard}</p>
            <CopyButton text={data.videoStoryboard} className="shrink-0" />
          </div>
        </Card>

        {/* Influencer Angles */}
        <TextCard
          icon={Users}
          title="Influencer Angles"
          content={data.influencerAngles}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Social Content */}
      <motion.div variants={STAGGER.item} className="glass rounded-2xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-border/40">
          <Share2 className="w-4 h-4 text-primary" />
          <span className="section-label">Social Content</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {socialPlatforms.length > 0 ? socialPlatforms.map((p) => (
            <div key={p.label} className="px-4 py-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br ${p.color}`}>
                    <p.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{p.label}</span>
                </div>
                <CopyButton text={p.content} />
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-6">{p.content}</p>
            </div>
          )) : (
            <div className="px-5 py-4 col-span-3">
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm text-foreground/80 leading-relaxed flex-1 whitespace-pre-wrap">{data.socialContent}</p>
                <CopyButton text={data.socialContent} />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Ad Script */}
      <motion.div variants={STAGGER.item} className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500/80" />
          <div className="terminal-dot bg-yellow-500/80" />
          <div className="terminal-dot bg-green-500/80" />
          <span className="ml-2 text-[11px] text-muted-foreground flex-1">ad-script.txt</span>
          <CopyButton text={data.adScript} />
        </div>
        <div className="px-4 py-4">
          <pre className="text-xs leading-relaxed text-emerald-300/80 whitespace-pre-wrap">{data.adScript}</pre>
        </div>
      </motion.div>

      {/* Virality */}
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
