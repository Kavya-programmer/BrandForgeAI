import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateCampaign,
  useGenerateStrategy,
  useGenerateVideoPlan,
  useGenerateBrand,
  useGenerateInfluencer,
  useTrendStealer,
} from "@workspace/api-client-react";
import type {
  CampaignResult,
  StrategyResult,
  VideoPlanResult,
  BrandResult,
  InfluencerResult,
  TrendStealerResult,
  GenerateCampaignBody,
} from "@workspace/api-client-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MainContent } from "@/components/dashboard/main-content";
import { LoadingOverlay } from "@/components/dashboard/loading-overlay";
import { Toaster } from "@/components/ui/toaster";

export type FormData = {
  brand: string;
  product: string;
  audience: string;
  theme: string;
};

export type ActionType =
  | "campaign"
  | "strategy"
  | "video"
  | "brand"
  | "influencer"
  | "trends";

export type ModuleResults = {
  campaign?: CampaignResult;
  strategy?: StrategyResult;
  video?: VideoPlanResult;
  brand?: BrandResult;
  influencer?: InfluencerResult;
  trends?: TrendStealerResult;
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
        switch (type) {
          case "campaign": {
            const data = await campaignMutation.mutateAsync({ data: payload });
            setResults((prev) => ({ ...prev, campaign: data }));
            break;
          }
          case "strategy": {
            const data = await strategyMutation.mutateAsync({ data: payload });
            setResults((prev) => ({ ...prev, strategy: data }));
            break;
          }
          case "video": {
            const data = await videoPlanMutation.mutateAsync({ data: payload });
            setResults((prev) => ({ ...prev, video: data }));
            break;
          }
          case "brand": {
            const data = await brandMutation.mutateAsync({ data: payload });
            setResults((prev) => ({ ...prev, brand: data }));
            break;
          }
          case "influencer": {
            const data = await influencerMutation.mutateAsync({ data: payload });
            setResults((prev) => ({ ...prev, influencer: data }));
            break;
          }
          case "trends": {
            const data = await trendsMutation.mutateAsync({ data: payload });
            setResults((prev) => ({ ...prev, trends: data }));
            break;
          }
        }
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
