import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MainContent } from "@/components/dashboard/main-content";
import { LoadingOverlay } from "@/components/dashboard/loading-overlay";
import {
  useGenerateCampaign,
  useGenerateStrategy,
  useGenerateVideoPlan,
  useGenerateBrand,
  useGenerateInfluencer,
  useTrendStealer,
} from "@workspace/api-client-react";

export type ActionType = "campaign" | "strategy" | "video" | "brand" | "influencer" | "trends";

export interface FormData {
  brand: string;
  product: string;
  audience: string;
  theme: string;
}

export interface GenerateCampaignBody {
  brand: string;
  product: string;
  audience: string;
  theme: string;
}

export type CampaignResponse = {
  campaignIdea: string;
  keyMessage: string;
  coreStrategy: string;
  socialContent: string;
  videoStoryboard: string;
  adScript: string;
  brandPositioning: string;
  influencerAngles: string;
  viralityScore: number;
  estimatedViews: string;
  // Specialized fields
  positioning?: string;
  audiencePsychology?: string;
  viralHooks?: string[];
  sloganIdeas?: string[];
  competitorAngle?: string;
  platformStrategy?: string;
  scenes?: Array<{ sceneNumber: number; visual: string; audio: string }>;
  brandArchetype?: string;
  brandVoice?: string;
  colorPalette?: string[];
  selectedInfluencerName?: string;
  brandCollabAngle?: string;
};

export type ApiResponse<T> = {
  error: boolean;
  message: string;
  data: T | null;
};

export type ModuleResults = {
  campaign?: CampaignResponse;
  strategy?: CampaignResponse;
  video?: CampaignResponse;
  brand?: CampaignResponse;
  influencer?: CampaignResponse;
  trends?: CampaignResponse;
};

export default function Dashboard() {
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    brand: "",
    product: "",
    audience: "",
    theme: "",
  });

  const [activeTab, setActiveTab] = useState<ActionType>("campaign");
  const [results, setResults] = useState<ModuleResults>({});
  const [loadingModule, setLoadingModule] = useState<ActionType | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  // ─── Mutation hooks ──────────────────────────────────────────────────────
  const campaignMutation = useGenerateCampaign();
  const strategyMutation = useGenerateStrategy();
  const videoPlanMutation = useGenerateVideoPlan();
  const brandMutation = useGenerateBrand();
  const influencerMutation = useGenerateInfluencer();
  const trendsMutation = useTrendStealer();

  const isGenerating = loadingModule !== null;

  const LOADING_MESSAGES: Record<ActionType, string> = {
    campaign: "Generating your viral campaign...",
    strategy: "Building deep marketing strategy...",
    video: "Scripting your video production plan...",
    brand: "Designing your brand identity...",
    influencer: "Creating AI influencer persona...",
    trends: "Stealing the hottest trends...",
  };

  // ─── Generate handler ────────────────────────────────────────────────────
  const handleGenerate = useCallback(
    async (type: ActionType) => {
      if (
        !formData.brand.trim() ||
        !formData.product.trim() ||
        !formData.audience.trim() ||
        !formData.theme
      ) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields before generating.",
          variant: "destructive",
        });
        return;
      }

      const payload: GenerateCampaignBody = {
        brand: formData.brand.trim(),
        product: formData.product.trim(),
        audience: formData.audience.trim(),
        theme: formData.theme,
      };

      setLoadingModule(type);
      setLoadingMessage(LOADING_MESSAGES[type]);

      try {
        let data: CampaignResponse | null = null;
        
        switch (type) {
          case "campaign":
            data = await campaignMutation.mutateAsync({ data: payload }) as any;
            break;
          case "strategy":
            data = await strategyMutation.mutateAsync({ data: payload }) as any;
            break;
          case "video":
            data = await videoPlanMutation.mutateAsync({ data: payload }) as any;
            break;
          case "brand":
            data = await brandMutation.mutateAsync({ data: payload }) as any;
            break;
          case "influencer":
            data = await influencerMutation.mutateAsync({ data: payload }) as any;
            break;
          case "trends":
            data = await trendsMutation.mutateAsync({ data: payload }) as any;
            break;
          default:
            throw new Error(`Unknown type: ${type}`);
        }

        if (!data) {
          throw new Error("Generation failed: No data returned from AI");
        }

        setResults((prev) => ({ ...prev, [type]: data }));
        setActiveTab(type);
        toast({
          title: "Generated!",
          description: `Your ${type} content is ready.`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        toast({
          title: "Generation failed",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoadingModule(null);
        setLoadingMessage("");
      }
    },
    [
      formData,
      toast,
      campaignMutation,
      strategyMutation,
      videoPlanMutation,
      brandMutation,
      influencerMutation,
      trendsMutation,
    ]
  );

  const hasAnyResult = Object.keys(results).length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      <AnimatePresence>
        {isGenerating && <LoadingOverlay message={loadingMessage} />}
      </AnimatePresence>

      <Sidebar
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        loadingModule={loadingModule}
        hasData={hasAnyResult}
      />

      <MainContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        results={results}
        hasAnyResult={hasAnyResult}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        loadingModule={loadingModule}
      />

      <Toaster />
    </div>
  );
}
