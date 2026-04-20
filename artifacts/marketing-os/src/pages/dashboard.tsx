import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wand2, Zap, Target, 
  TrendingUp, Video, PenTool, Hash, Loader2, Sparkles,
  RefreshCw, AlertCircle, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  useGetThemes, 
  useGenerateCampaign, 
  useGenerateStrategy,
  useGenerateVideoPlan,
  useGenerateBrand,
  useGenerateInfluencer,
  useTrendStealer
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CampaignTabs } from "@/components/campaign-tabs";

type FormData = { brand: string; product: string; audience: string; theme: string };
type ActionType = "campaign" | "strategy" | "video" | "brand" | "influencer" | "trends";

export default function Dashboard() {
  const [formData, setFormData] = useState<FormData>({
    brand: "",
    product: "",
    audience: "",
    theme: ""
  });

  const [activeTab, setActiveTab] = useState("campaign");
  const [generatedData, setGeneratedData] = useState<any>({});
  const [lastAction, setLastAction] = useState<{ type: ActionType; data: FormData } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [refineText, setRefineText] = useState("");
  const [refineResult, setRefineResult] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);
  const { toast } = useToast();

  const { data: themesData, isLoading: isLoadingThemes } = useGetThemes();

  const onSuccess = (type: ActionType, tab: string, label: string, data: unknown) => {
    setGeneratedData((prev: any) => ({ ...prev, [type === "trends" ? "trends" : type]: data }));
    setActiveTab(tab);
    setApiError(null);
    setRefineResult(null);
    setFeedbackGiven(null);
    toast({ title: `${label} generated successfully` });
  };

  const onError = (label: string, msg?: string) => {
    const errorMsg = msg || `Failed to generate ${label}. Please try again.`;
    setApiError(errorMsg);
    toast({ title: errorMsg, variant: "destructive" });
  };

  const generateCampaign = useGenerateCampaign({
    mutation: {
      onSuccess: (data) => onSuccess("campaign", "campaign", "Campaign", data),
      onError: () => onError("campaign"),
    }
  });

  const generateStrategy = useGenerateStrategy({
    mutation: {
      onSuccess: (data) => onSuccess("strategy", "strategy", "Strategy", data),
      onError: () => onError("strategy"),
    }
  });

  const generateVideo = useGenerateVideoPlan({
    mutation: {
      onSuccess: (data) => onSuccess("video", "video", "Video plan", data),
      onError: () => onError("video plan"),
    }
  });

  const generateBrand = useGenerateBrand({
    mutation: {
      onSuccess: (data) => onSuccess("brand", "brand", "Brand identity", data),
      onError: () => onError("brand identity"),
    }
  });

  const generateInfluencer = useGenerateInfluencer({
    mutation: {
      onSuccess: (data) => onSuccess("influencer", "influencer", "AI Influencer", data),
      onError: () => onError("influencer"),
    }
  });

  const trendStealer = useTrendStealer({
    mutation: {
      onSuccess: (data) => onSuccess("trends", "trends", "Trend strategy", data),
      onError: () => onError("trend strategy"),
    }
  });

  const isGenerating = 
    generateCampaign.isPending || 
    generateStrategy.isPending || 
    generateVideo.isPending || 
    generateBrand.isPending || 
    generateInfluencer.isPending || 
    trendStealer.isPending;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleThemeChange = (val: string) => {
    setFormData(prev => ({ ...prev, theme: val }));
  };

  const validateForm = () => {
    if (!formData.brand || !formData.product || !formData.audience || !formData.theme) {
      toast({ title: "Please fill in all fields before generating", variant: "destructive" });
      return false;
    }
    return true;
  };

  const triggerAction = (type: ActionType) => {
    if (!validateForm()) return;
    const snapshot = { ...formData };
    setLastAction({ type, data: snapshot });
    const map: Record<ActionType, () => void> = {
      campaign: () => generateCampaign.mutate({ data: snapshot }),
      strategy: () => generateStrategy.mutate({ data: snapshot }),
      video: () => generateVideo.mutate({ data: snapshot }),
      brand: () => generateBrand.mutate({ data: snapshot }),
      influencer: () => generateInfluencer.mutate({ data: snapshot }),
      trends: () => trendStealer.mutate({ data: snapshot }),
    };
    map[type]();
  };

  const handleRegenerate = () => {
    if (!lastAction) return;
    setRefineResult(null);
    setFeedbackGiven(null);
    setApiError(null);
    triggerAction(lastAction.type);
  };

  const handleRefine = async () => {
    if (!refineText.trim() || Object.keys(generatedData).length === 0) return;
    setIsRefining(true);
    try {
      const previousResponse = JSON.stringify(generatedData, null, 2);
      const resp = await fetch("/api/campaign/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousResponse,
          refinement: refineText,
          brand: formData.brand,
          theme: formData.theme,
        }),
      });
      if (!resp.ok) throw new Error("Refine failed");
      const result = await resp.json();
      setRefineResult(result.refinedContent);
      setRefineText("");
      toast({ title: "Content refined successfully" });
    } catch {
      toast({ title: "Failed to refine content", variant: "destructive" });
    } finally {
      setIsRefining(false);
    }
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedbackGiven(type);
    console.log(`[Feedback] ${type === "up" ? "👍 Positive" : "👎 Negative"} feedback for action: ${lastAction?.type}, brand: ${formData.brand}`);
    toast({ title: type === "up" ? "Thanks for the feedback!" : "Got it — try regenerating for a better result" });
  };

  const hasData = Object.keys(generatedData).length > 0;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin"></div>
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <motion.h2 
            className="mt-8 text-2xl font-mono tracking-widest text-white uppercase"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            AI IS THINKING...
          </motion.h2>
        </div>
      )}

      {/* Left Panel: Input Form */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-white/10 bg-black p-6 md:p-8 flex flex-col h-[100dvh] overflow-y-auto shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black">
            <Zap className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-medium tracking-tight">Agency OS</h1>
        </div>

        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-white/60 text-xs uppercase tracking-wider">Brand Name</Label>
            <Input 
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="bg-white/5 border-white/10 focus-visible:ring-white/20 font-medium"
              placeholder="e.g. Acme Corp"
              data-testid="input-brand"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product" className="text-white/60 text-xs uppercase tracking-wider">Product / Service</Label>
            <Textarea 
              id="product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              className="bg-white/5 border-white/10 focus-visible:ring-white/20 min-h-[100px] resize-none font-medium"
              placeholder="Describe what you are selling..."
              data-testid="input-product"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience" className="text-white/60 text-xs uppercase tracking-wider">Target Audience</Label>
            <Textarea 
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              className="bg-white/5 border-white/10 focus-visible:ring-white/20 min-h-[80px] resize-none font-medium"
              placeholder="Who is this for?"
              data-testid="input-audience"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme" className="text-white/60 text-xs uppercase tracking-wider">Campaign Theme</Label>
            <Select value={formData.theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme" className="bg-white/5 border-white/10 focus-visible:ring-white/20 font-medium" data-testid="select-theme">
                <SelectValue placeholder={isLoadingThemes ? "Loading themes..." : "Select a theme"} />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white">
                {themesData?.themes?.map(t => (
                  <SelectItem key={t.id} value={t.id} className="focus:bg-white/10">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          {/* Primary: Generate Campaign */}
          <Button 
            className="w-full h-14 text-base font-medium rounded-xl bg-white text-black hover:bg-white/90 transition-all relative overflow-hidden group"
            onClick={() => triggerAction("campaign")}
            disabled={isGenerating}
            data-testid="btn-generate-campaign"
          >
            {generateCampaign.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="relative z-10 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" /> Generate Campaign
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </>
            )}
          </Button>

          {/* Module grid */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="h-11 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-sm"
              onClick={() => triggerAction("strategy")}
              disabled={isGenerating}
              data-testid="btn-generate-strategy"
            >
              {generateStrategy.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4 mr-1.5" />}
              Strategy
            </Button>
            <Button 
              variant="outline" 
              className="h-11 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-sm"
              onClick={() => triggerAction("video")}
              disabled={isGenerating}
              data-testid="btn-generate-video"
            >
              {generateVideo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 mr-1.5" />}
              Video Factory
            </Button>
            <Button 
              variant="outline" 
              className="h-11 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-sm"
              onClick={() => triggerAction("brand")}
              disabled={isGenerating}
              data-testid="btn-generate-brand"
            >
              {generateBrand.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4 mr-1.5" />}
              Brand Identity
            </Button>
            <Button 
              variant="outline" 
              className="h-11 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-sm"
              onClick={() => triggerAction("trends")}
              disabled={isGenerating}
              data-testid="btn-generate-trends"
            >
              {trendStealer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-1.5" />}
              Trend Stealer
            </Button>
            <Button 
              variant="outline" 
              className="col-span-2 h-11 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-sm"
              onClick={() => triggerAction("influencer")}
              disabled={isGenerating}
              data-testid="btn-generate-influencer"
            >
              {generateInfluencer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4 mr-1.5" />}
              AI Influencer
            </Button>
          </div>

          {/* Regenerate button — shown when there's a last action */}
          {lastAction && !isGenerating && (
            <Button 
              variant="ghost"
              className="w-full h-10 border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm gap-2"
              onClick={handleRegenerate}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate {lastAction.type.charAt(0).toUpperCase() + lastAction.type.slice(1)}
            </Button>
          )}

          {/* Refine input — shown when there's output data */}
          {hasData && !isGenerating && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <Label className="text-white/40 text-xs uppercase tracking-wider">Refine with AI</Label>
              <div className="flex gap-2">
                <Input
                  value={refineText}
                  onChange={e => setRefineText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
                  placeholder="Make it more emotional..."
                  className="bg-white/5 border-white/10 focus-visible:ring-white/20 text-sm h-10 flex-1"
                  disabled={isRefining}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 bg-white text-black hover:bg-white/90"
                  onClick={handleRefine}
                  disabled={isRefining || !refineText.trim()}
                >
                  {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Output Tabs */}
      <div className="flex-1 h-[100dvh] overflow-hidden bg-black/95 relative flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none scanline opacity-20" />

        {/* API Error Banner */}
        {apiError && !isGenerating && (
          <div className="relative z-20 mx-6 mt-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-300">{apiError}</p>
            </div>
            <button onClick={() => setApiError(null)} className="text-red-400/60 hover:text-red-400 text-xs shrink-0">✕</button>
          </div>
        )}

        {!hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mb-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm"
            >
              <Sparkles className="w-10 h-10 text-white/40" />
            </motion.div>
            <h2 className="text-3xl font-medium tracking-tight mb-3">Awaiting Command</h2>
            <p className="text-white/40 max-w-md text-lg">
              Enter your brand parameters and trigger a module to generate production-ready marketing assets.
            </p>
          </div>
        ) : (
          <CampaignTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            data={generatedData}
            onFeedback={handleFeedback}
            onRegenerate={handleRegenerate}
            feedbackGiven={feedbackGiven}
            refineResult={refineResult}
            lastActionType={lastAction?.type ?? null}
          />
        )}
      </div>
    </div>
  );
}
