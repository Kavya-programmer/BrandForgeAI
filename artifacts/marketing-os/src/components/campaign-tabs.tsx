import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, CheckCircle2, TrendingUp, Target, Video, PenTool,
  Hash, Activity, ThumbsUp, ThumbsDown, RefreshCw, Sparkles,
  MessageSquare, Zap, Music, BarChart3
} from "lucide-react";

interface CampaignTabsProps {
  activeTab: string;
  setActiveTab: (v: string) => void;
  data: any;
  onFeedback: (type: "up" | "down") => void;
  onRegenerate: () => void;
  feedbackGiven: "up" | "down" | null;
  refineResult: string | null;
  lastActionType: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-4 px-1 font-medium">{children}</h3>
  );
}
function InfoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 bg-black border border-white/10 rounded-2xl ${className}`}>{children}</div>
  );
}

export function CampaignTabs({
  activeTab, setActiveTab, data, onFeedback, onRegenerate,
  feedbackGiven, refineResult,
}: CampaignTabsProps) {
  return (
    <div className="flex flex-col h-full relative z-10">
      <div className="px-8 pt-8 pb-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border border-white/10 h-12 p-1 rounded-xl gap-1 overflow-x-auto w-full justify-start hide-scrollbar">
            <TabsTrigger value="campaign" disabled={!data.campaign} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <Activity className="w-4 h-4 mr-2" /> Campaign
            </TabsTrigger>
            <TabsTrigger value="viral" disabled={!data.campaign && !data.strategy} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <TrendingUp className="w-4 h-4 mr-2" /> Viral Score
            </TabsTrigger>
            <TabsTrigger value="strategy" disabled={!data.strategy && !data.campaign} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <Target className="w-4 h-4 mr-2" /> Strategy
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!data.video} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <Video className="w-4 h-4 mr-2" /> Video
            </TabsTrigger>
            <TabsTrigger value="brand" disabled={!data.brand} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <PenTool className="w-4 h-4 mr-2" /> Brand
            </TabsTrigger>
            <TabsTrigger value="influencer" disabled={!data.influencer} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <Hash className="w-4 h-4 mr-2" /> Influencer
            </TabsTrigger>
            <TabsTrigger value="trends" disabled={!data.trends} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[disabled]:opacity-30">
              <Zap className="w-4 h-4 mr-2" /> Trends
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">

        {/* ── CAMPAIGN TAB ─────────────────────────────────────────── */}
        {activeTab === "campaign" && data.campaign && (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
            <motion.div variants={item}>
              <Card className="bg-black border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-white/80 uppercase text-xs tracking-widest">Campaign Idea</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-xl leading-relaxed font-medium text-white/90">{data.campaign.campaignIdea}</p>
                </CardContent>
              </Card>
            </motion.div>

            {data.campaign.keyMessage && (
              <motion.div variants={item}>
                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <MessageSquare className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white/40 text-[10px] uppercase tracking-widest block mb-2">Key Message</span>
                    <p className="text-white/90 text-lg font-medium leading-snug">{data.campaign.keyMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <Card className="bg-black border-white/10 h-full">
                  <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="text-white/80 uppercase text-xs tracking-widest">Core Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{data.campaign.strategy}</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="bg-black border-white/10 h-full">
                  <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="text-white/80 uppercase text-xs tracking-widest">Social Content</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{data.campaign.socialContent}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={item}>
              <Card className="bg-black border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-white/80 uppercase text-xs tracking-widest">Ad Script</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <pre className="font-mono text-sm text-white/70 whitespace-pre-wrap leading-relaxed bg-white/5 p-4 rounded-lg">{data.campaign.adScript}</pre>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ── VIRAL SCORE TAB ────────────────────────────────────────── */}
        {activeTab === "viral" && (data.campaign || data.strategy) && (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
            <motion.div variants={item} className="flex flex-col items-center justify-center p-12 bg-black border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-white/60 uppercase tracking-widest text-sm mb-4">Predicted Virality</h3>
                <div className="text-8xl font-medium tracking-tighter text-white mb-2">
                  {(data.campaign || data.strategy).viralityScore}
                  <span className="text-4xl text-white/40">/100</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 mt-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">{(data.campaign || data.strategy).estimatedViews}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-black border-white/10">
                <CardContent className="p-8">
                  <p className="text-xl text-white/80 leading-relaxed font-medium">{(data.campaign || data.strategy).viralityExplanation}</p>
                </CardContent>
              </Card>
            </motion.div>

            {data.campaign?.adsFactory && (
              <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-black border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white/80 uppercase text-xs tracking-widest">Platforms & Timing</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {data.campaign.adsFactory.platforms.map((p: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-white/20 bg-white/5 text-white px-3 py-1 rounded-full">{p}</Badge>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3">Best Posting Times</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.campaign.adsFactory.bestPostingTimes.map((t: string, i: number) => (
                          <div key={i} className="bg-white/10 text-white/90 text-sm px-3 py-1.5 rounded font-mono border border-white/5">{t}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white/80 uppercase text-xs tracking-widest">Hashtag Sets</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    {data.campaign.adsFactory.hashtagSets?.instagram && (
                      <div>
                        <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Instagram</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.campaign.adsFactory.hashtagSets.instagram.map((h: string, i: number) => (
                            <span key={i} className="text-white/70 text-sm">{h.startsWith("#") ? h : `#${h}`}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.campaign.adsFactory.hashtagSets?.tiktok && (
                      <div>
                        <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">TikTok</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.campaign.adsFactory.hashtagSets.tiktok.map((h: string, i: number) => (
                            <span key={i} className="text-white/70 text-sm">{h.startsWith("#") ? h : `#${h}`}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── STRATEGY TAB ───────────────────────────────────────────── */}
        {activeTab === "strategy" && (data.strategy || data.campaign) && (() => {
          const s = data.strategy ?? {};
          return (
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">

              {/* Key Message banner */}
              {s.keyMessage && (
                <motion.div variants={item}>
                  <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/20 rounded-2xl">
                    <Sparkles className="w-5 h-5 text-white/60 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white/40 text-[10px] uppercase tracking-widest block mb-2">Key Message</span>
                      <p className="text-white text-xl font-semibold leading-snug">{s.keyMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard>
                  <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Positioning</h3>
                  <p className="text-white/90 leading-relaxed">
                    {s.positioning || "Generate the Deep Strategy module to see positioning."}
                  </p>
                </InfoCard>
                <InfoCard>
                  <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Audience Psychology</h3>
                  <p className="text-white/90 leading-relaxed">
                    {s.audiencePsychology || "Generate the Deep Strategy module to see audience psychology."}
                  </p>
                </InfoCard>
              </motion.div>

              {s.platformStrategy && (
                <motion.div variants={item}>
                  <InfoCard>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Platform Strategy</h3>
                    <p className="text-white/80 leading-relaxed">{s.platformStrategy}</p>
                  </InfoCard>
                </motion.div>
              )}

              {s.competitorAngle && (
                <motion.div variants={item}>
                  <InfoCard>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Competitor Differentiation</h3>
                    <p className="text-white/80 leading-relaxed">{s.competitorAngle}</p>
                  </InfoCard>
                </motion.div>
              )}

              {Array.isArray(s.viralHooks) && s.viralHooks.length > 0 && (
                <motion.div variants={item}>
                  <SectionLabel>Viral Hooks</SectionLabel>
                  <div className="space-y-3">
                    {s.viralHooks.map((hook: string, i: number) => (
                      <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono shrink-0 text-sm">{i + 1}</div>
                        <p className="text-white/90 font-medium pt-1 text-lg">{hook}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {Array.isArray(s.sloganIdeas) && s.sloganIdeas.length > 0 && (
                <motion.div variants={item}>
                  <SectionLabel>Slogan Ideas</SectionLabel>
                  <div className="flex flex-wrap gap-4">
                    {s.sloganIdeas.map((slogan: string, i: number) => (
                      <div key={i} className="px-6 py-4 bg-white text-black font-semibold rounded-full text-lg tracking-tight">
                        "{slogan}"
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })()}

        {/* ── VIDEO TAB ──────────────────────────────────────────────── */}
        {activeTab === "video" && data.video && (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-10">

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard>
                <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Music Style</h3>
                <p className="text-white/90">{data.video.musicStyle}</p>
              </InfoCard>
              <InfoCard>
                <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Editing Style</h3>
                <p className="text-white/90">{data.video.editingStyle}</p>
              </InfoCard>
            </motion.div>

            {data.video.script && (
              <motion.div variants={item}>
                <SectionLabel>Script</SectionLabel>
                <InfoCard>
                  <pre className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed font-mono">{data.video.script}</pre>
                </InfoCard>
              </motion.div>
            )}

            <motion.div variants={item}>
              <SectionLabel>Storyboard — {data.video.scenes.length} Scenes</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.video.scenes.map((scene: any, i: number) => (
                  <div key={i} className="bg-black border border-white/10 rounded-xl overflow-hidden flex flex-col h-full hover:border-white/25 transition-colors">
                    <div className="aspect-video bg-white/5 border-b border-white/10 flex items-center justify-center p-4 relative">
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] px-2 py-1 rounded font-mono">{scene.duration}</div>
                      <p className="text-xs text-center text-white/60 leading-relaxed">{scene.visual}</p>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-3">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Camera</span>
                        <p className="text-xs text-white/80">{scene.cameraAngle}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Audio</span>
                        <p className="text-xs text-white/80">{scene.audio}</p>
                      </div>
                      {scene.textOverlay && (
                        <div className="mt-auto pt-3 border-t border-white/5">
                          <p className="text-xs font-mono text-white bg-white/10 px-2 py-1 rounded text-center">"{scene.textOverlay}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item}>
              <SectionLabel>AI Video Tool Prompts</SectionLabel>
              <div className="space-y-4">
                {[
                  { name: "Runway Gen-3", prompt: data.video.runwayPrompt },
                  { name: "Pika Labs", prompt: data.video.pikaPrompt },
                  { name: "HeyGen", prompt: data.video.heygen_prompt },
                ].filter(t => t.prompt).map((tool, i) => (
                  <div key={i} className="bg-black border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                    <div className="w-24 shrink-0 font-medium text-white/80 pt-1 text-sm">{tool.name}</div>
                    <div className="flex-1 font-mono text-sm text-white/60 bg-white/5 p-3 rounded leading-relaxed">{tool.prompt}</div>
                    <CopyButton text={tool.prompt} />
                  </div>
                ))}
              </div>
            </motion.div>

            {data.video.versions && (
              <motion.div variants={item}>
                <SectionLabel>Platform Adaptations</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "TikTok Viral", value: data.video.versions.tiktokViral },
                    { label: "Luxury Cinematic", value: data.video.versions.luxuryCinematic },
                    { label: "Meme Version", value: data.video.versions.memeVersion },
                  ].filter(v => v.value).map((v, i) => (
                    <InfoCard key={i}>
                      <h4 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">{v.label}</h4>
                      <p className="text-white/80 text-sm leading-relaxed">{v.value}</p>
                    </InfoCard>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── BRAND TAB ──────────────────────────────────────────────── */}
        {activeTab === "brand" && data.brand && (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-10">
            <motion.div variants={item} className="text-center py-10">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">"{data.brand.tagline}"</h2>
              <div className="flex items-center justify-center gap-4 text-white/60">
                <span className="uppercase tracking-widest text-sm">{data.brand.brandArchetype}</span>
                <span>•</span>
                <span className="uppercase tracking-widest text-sm">{data.brand.brandVoice}</span>
              </div>
            </motion.div>

            {(data.brand.tone || data.brand.positioning) && (
              <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.brand.tone && (
                  <InfoCard>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Brand Tone</h3>
                    <p className="text-white/90 leading-relaxed">{data.brand.tone}</p>
                  </InfoCard>
                )}
                {data.brand.positioning && (
                  <InfoCard>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Market Positioning</h3>
                    <p className="text-white/90 leading-relaxed">{data.brand.positioning}</p>
                  </InfoCard>
                )}
              </motion.div>
            )}

            {data.brand.uniqueSellingPoints?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Unique Selling Points</SectionLabel>
                <div className="space-y-3">
                  {data.brand.uniqueSellingPoints.map((usp: string, i: number) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4">
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-mono text-xs shrink-0 font-bold">{i + 1}</div>
                      <p className="text-white/90 font-medium pt-0.5">{usp}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div variants={item}>
              <SectionLabel>Color Palette</SectionLabel>
              <div className="flex flex-wrap gap-4">
                {data.brand.colorPalette.map((color: any, i: number) => (
                  <div key={i} className="flex-1 min-w-[120px] group cursor-pointer">
                    <div
                      className="h-28 rounded-xl mb-3 shadow-lg border border-white/5 transition-transform group-hover:-translate-y-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white/90">{color.name}</span>
                      <span className="font-mono text-xs text-white/50">{color.hex}</span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{color.usage}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {data.brand.logoConceptDescription && (
              <motion.div variants={item}>
                <SectionLabel>Logo Concept</SectionLabel>
                <InfoCard>
                  <p className="text-white/80 leading-relaxed">{data.brand.logoConceptDescription}</p>
                </InfoCard>
              </motion.div>
            )}

            {data.brand.aestheticDirection && (
              <motion.div variants={item}>
                <SectionLabel>Aesthetic Direction</SectionLabel>
                <InfoCard>
                  <p className="text-white/80 leading-relaxed">{data.brand.aestheticDirection}</p>
                </InfoCard>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.brand.fontPairings?.length > 0 && (
                <motion.div variants={item}>
                  <InfoCard>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-4">Typography</h3>
                    <div className="space-y-4">
                      {data.brand.fontPairings.map((font: string, i: number) => (
                        <div key={i} className="text-xl font-medium text-white/90">{font}</div>
                      ))}
                    </div>
                  </InfoCard>
                </motion.div>
              )}
              {data.brand.moodboardKeywords?.length > 0 && (
                <motion.div variants={item}>
                  <InfoCard>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-4">Moodboard</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.brand.moodboardKeywords.map((word: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-white/80 py-1.5 px-3">{word}</Badge>
                      ))}
                    </div>
                  </InfoCard>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── INFLUENCER TAB ─────────────────────────────────────────── */}
        {activeTab === "influencer" && data.influencer && (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
            <motion.div variants={item} className="bg-black border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-white/5 p-8 flex flex-col items-center justify-center text-center border-r border-white/10">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/20 mb-6 flex items-center justify-center">
                  <Hash className="w-10 h-10 text-white/40" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{data.influencer.name}</h2>
                <p className="text-white/60 font-mono text-sm mb-4">{data.influencer.handle}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge className="bg-white/10 hover:bg-white/10 text-white">{data.influencer.age}y</Badge>
                  <Badge className="bg-white/10 hover:bg-white/10 text-white">{data.influencer.location}</Badge>
                </div>
                <div className="mt-auto">
                  <div className="text-3xl font-bold tracking-tight text-white mb-1">{data.influencer.audienceSize}</div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">Est. Audience</div>
                </div>
              </div>

              <div className="w-full md:w-2/3 p-8 md:p-10 space-y-6">
                <div>
                  <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Bio</h3>
                  <p className="text-lg text-white/90 leading-relaxed">{data.influencer.bio}</p>
                </div>
                {data.influencer.aesthetic && (
                  <div>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Aesthetic</h3>
                    <p className="text-white/80">{data.influencer.aesthetic}</p>
                  </div>
                )}
                {data.influencer.contentStyle && (
                  <div>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Content Style</h3>
                    <p className="text-white/80 leading-relaxed">{data.influencer.contentStyle}</p>
                  </div>
                )}
                {data.influencer.contentPillars?.length > 0 && (
                  <div>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Content Pillars</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.influencer.contentPillars.map((pillar: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">{pillar}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.influencer.platforms?.length > 0 && (
                  <div>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.influencer.platforms.map((p: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-white/20 text-white/80">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {data.influencer.influencerTypes?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Influencer Types to Target</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.influencer.influencerTypes.map((type: string, i: number) => (
                    <InfoCard key={i} className="flex items-start gap-3">
                      <BarChart3 className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                      <p className="text-white/80 text-sm leading-relaxed">{type}</p>
                    </InfoCard>
                  ))}
                </div>
              </motion.div>
            )}

            {data.influencer.characterStory && (
              <motion.div variants={item}>
                <SectionLabel>Character Story</SectionLabel>
                <InfoCard>
                  <p className="text-white/80 leading-relaxed">{data.influencer.characterStory}</p>
                </InfoCard>
              </motion.div>
            )}

            {data.influencer.brandCollabAngle && (
              <motion.div variants={item}>
                <SectionLabel>Brand Integration Angle</SectionLabel>
                <InfoCard>
                  <p className="text-white/80 leading-relaxed">{data.influencer.brandCollabAngle}</p>
                </InfoCard>
              </motion.div>
            )}

            {data.influencer.collaborationIdeas?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Collaboration Ideas</SectionLabel>
                <div className="space-y-3">
                  {data.influencer.collaborationIdeas.map((idea: string, i: number) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono shrink-0 text-sm">{i + 1}</div>
                      <p className="text-white/90 font-medium pt-1">{idea}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {data.influencer.sampleCaptions?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Sample Captions</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.influencer.sampleCaptions.map((caption: string, i: number) => (
                    <Card key={i} className="bg-black border-white/10">
                      <CardContent className="p-6">
                        <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{caption}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── TRENDS TAB ─────────────────────────────────────────────── */}
        {activeTab === "trends" && data.trends && (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.trends.currentTrends.map((trend: any, i: number) => (
                <Card key={i} className="bg-black border-white/10 overflow-hidden hover:border-white/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="border-white/20 text-white/80">{trend.platform}</Badge>
                      <Badge className="bg-white text-black hover:bg-white font-semibold">{trend.virality}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{trend.trend}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{trend.howToUse}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={item} className="p-8 bg-black border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-4">Adapted Campaign Concept</h3>
                <p className="text-2xl font-medium text-white/90 leading-snug max-w-2xl">{data.trends.adaptedCampaign}</p>
              </div>
            </motion.div>

            {data.trends.hashtags?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Hashtag Strategy</SectionLabel>
                <div className="flex flex-wrap gap-3">
                  {data.trends.hashtags.map((tag: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/80 text-sm font-mono hover:bg-white/10 transition-colors cursor-pointer">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
                {data.trends.hashtagStrategy && (
                  <p className="mt-4 text-white/50 text-sm leading-relaxed">{data.trends.hashtagStrategy}</p>
                )}
              </motion.div>
            )}

            {data.trends.trendInsights?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Trend Insights</SectionLabel>
                <div className="space-y-3">
                  {data.trends.trendInsights.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <Zap className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                      <p className="text-white/80 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {data.trends.viralFormats?.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel>Viral Content Formats</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.trends.viralFormats.map((format: string, i: number) => (
                    <InfoCard key={i}>
                      <p className="text-white/80 text-sm leading-relaxed">{format}</p>
                    </InfoCard>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.trends.trendHooks?.length > 0 && (
                <motion.div variants={item}>
                  <SectionLabel>Trend Hooks</SectionLabel>
                  <div className="space-y-3">
                    {data.trends.trendHooks.map((hook: string, i: number) => (
                      <div key={i} className="p-4 bg-black border border-white/10 rounded-xl text-white/80 text-sm">{hook}</div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div variants={item} className="space-y-6">
                {data.trends.viralFormula && (
                  <div>
                    <SectionLabel>Viral Formula</SectionLabel>
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-white/90 font-mono text-sm leading-relaxed">
                      {data.trends.viralFormula}
                    </div>
                  </div>
                )}
                {data.trends.soundSuggestions?.length > 0 && (
                  <div>
                    <SectionLabel>Trending Sounds</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {data.trends.soundSuggestions.map((sound: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-white/20 bg-black text-white/80 py-1.5 px-3 gap-1.5">
                          <Music className="w-3 h-3" /> {sound}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── Refine Result ──────────────────────────────────────────── */}
        {refineResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <div className="p-6 bg-white/5 border border-white/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <h3 className="text-white/70 text-xs uppercase tracking-widest font-medium">AI Refined Version</h3>
              </div>
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{refineResult}</p>
            </div>
          </motion.div>
        )}

        {/* ── Feedback Footer ────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto mt-10 mb-2">
          <div className="flex items-center justify-between px-2 py-4 border-t border-white/10">
            <span className="text-white/30 text-xs uppercase tracking-wider">Was this output useful?</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onFeedback("up")}
                className={`h-8 gap-1.5 text-xs border ${feedbackGiven === "up" ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-white/40 hover:text-white hover:bg-white/5"}`}>
                <ThumbsUp className="w-3.5 h-3.5" /> Helpful
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onFeedback("down")}
                className={`h-8 gap-1.5 text-xs border ${feedbackGiven === "down" ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-white/40 hover:text-white hover:bg-white/5"}`}>
                <ThumbsDown className="w-3.5 h-3.5" /> Not quite
              </Button>
              <Button variant="ghost" size="sm" onClick={onRegenerate}
                className="h-8 gap-1.5 text-xs border border-white/10 text-white/40 hover:text-white hover:bg-white/5">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}
      className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 shrink-0">
      {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}
