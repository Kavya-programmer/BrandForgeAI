import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wand2, Zap, Target, 
  TrendingUp, Video, PenTool, Hash, Loader2, Sparkles
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

export default function Dashboard() {
  const [formData, setFormData] = useState({
    brand: "",
    product: "",
    audience: "",
    theme: ""
  });

  const [activeTab, setActiveTab] = useState("campaign");
  const [generatedData, setGeneratedData] = useState<any>({});
  const { toast } = useToast();

  const { data: themesData, isLoading: isLoadingThemes } = useGetThemes();

  // Mutations
  const generateCampaign = useGenerateCampaign({
    mutation: {
      onSuccess: (data) => {
        setGeneratedData((prev: any) => ({ ...prev, campaign: data }));
        setActiveTab("campaign");
        toast({ title: "Campaign generated successfully" });
      },
      onError: () => toast({ title: "Failed to generate campaign", variant: "destructive" })
    }
  });

  const generateStrategy = useGenerateStrategy({
    mutation: {
      onSuccess: (data) => {
        setGeneratedData((prev: any) => ({ ...prev, strategy: data }));
        setActiveTab("strategy");
        toast({ title: "Strategy generated successfully" });
      },
      onError: () => toast({ title: "Failed to generate strategy", variant: "destructive" })
    }
  });

  const generateVideo = useGenerateVideoPlan({
    mutation: {
      onSuccess: (data) => {
        setGeneratedData((prev: any) => ({ ...prev, video: data }));
        setActiveTab("video");
        toast({ title: "Video plan generated successfully" });
      },
      onError: () => toast({ title: "Failed to generate video plan", variant: "destructive" })
    }
  });

  const generateBrand = useGenerateBrand({
    mutation: {
      onSuccess: (data) => {
        setGeneratedData((prev: any) => ({ ...prev, brand: data }));
        setActiveTab("brand");
        toast({ title: "Brand identity generated successfully" });
      },
      onError: () => toast({ title: "Failed to generate brand identity", variant: "destructive" })
    }
  });

  const generateInfluencer = useGenerateInfluencer({
    mutation: {
      onSuccess: (data) => {
        setGeneratedData((prev: any) => ({ ...prev, influencer: data }));
        setActiveTab("influencer");
        toast({ title: "AI Influencer generated successfully" });
      },
      onError: () => toast({ title: "Failed to generate AI influencer", variant: "destructive" })
    }
  });

  const trendStealer = useTrendStealer({
    mutation: {
      onSuccess: (data) => {
        setGeneratedData((prev: any) => ({ ...prev, trends: data }));
        setActiveTab("trends");
        toast({ title: "Trend stealer strategy generated successfully" });
      },
      onError: () => toast({ title: "Failed to steal trends", variant: "destructive" })
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

        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <Button 
            className="w-full h-14 text-base font-medium rounded-xl bg-white text-black hover:bg-white/90 transition-all relative overflow-hidden group"
            onClick={() => {
              if (validateForm()) generateCampaign.mutate({ data: formData });
            }}
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

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white"
              onClick={() => {
                if (validateForm()) generateStrategy.mutate({ data: formData });
              }}
              disabled={isGenerating}
              data-testid="btn-generate-strategy"
            >
              {generateStrategy.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
              Strategy
            </Button>
            <Button 
              variant="outline" 
              className="h-12 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white"
              onClick={() => {
                if (validateForm()) generateVideo.mutate({ data: formData });
              }}
              disabled={isGenerating}
              data-testid="btn-generate-video"
            >
              {generateVideo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 mr-2" />}
              Video Factory
            </Button>
            <Button 
              variant="outline" 
              className="h-12 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white"
              onClick={() => {
                if (validateForm()) generateBrand.mutate({ data: formData });
              }}
              disabled={isGenerating}
              data-testid="btn-generate-brand"
            >
              {generateBrand.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4 mr-2" />}
              Brand Identity
            </Button>
            <Button 
              variant="outline" 
              className="h-12 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white"
              onClick={() => {
                if (validateForm()) trendStealer.mutate({ data: formData });
              }}
              disabled={isGenerating}
              data-testid="btn-generate-trends"
            >
              {trendStealer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Trend Stealer
            </Button>
            <Button 
              variant="outline" 
              className="col-span-2 h-12 bg-transparent border-white/10 hover:bg-white/5 text-white/80 hover:text-white"
              onClick={() => {
                if (validateForm()) generateInfluencer.mutate({ data: formData });
              }}
              disabled={isGenerating}
              data-testid="btn-generate-influencer"
            >
              {generateInfluencer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}
              AI Influencer
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel: Output Tabs */}
      <div className="flex-1 h-[100dvh] overflow-hidden bg-black/95 relative flex flex-col">
        {/* Subtle background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none scanline opacity-20" />

        {Object.keys(generatedData).length === 0 ? (
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
          />
        )}
      </div>
    </div>
  );
}
