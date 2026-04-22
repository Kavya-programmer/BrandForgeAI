import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type CampaignTabsData = {
  campaign: { campaignIdea: string; keyMessage: string };
  strategy: string;
  video: { videoStoryboard: string; adScript: string };
  brand: string;
  influencer: string;
  trends: {
    viralityScore: number;
    viralityExplanation: string;
    estimatedViews: string;
  };
};

type CampaignTabsProps = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  data: CampaignTabsData;
};

export function CampaignTabs({ activeTab, setActiveTab, data }: CampaignTabsProps) {
  const generatedData = data;
  console.log(generatedData);

  const safeText = (value: string | undefined | null): string => {
    return value && value.trim() ? value : "Not available";
  };

  const safeScore = (value: number | undefined | null): string => {
    return typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "Not available";
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

      <TabsList>
        <TabsTrigger value="campaign">Campaign</TabsTrigger>
        <TabsTrigger value="strategy">Strategy</TabsTrigger>
        <TabsTrigger value="video">Video</TabsTrigger>
        <TabsTrigger value="brand">Brand</TabsTrigger>
        <TabsTrigger value="influencer">Influencer</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
      </TabsList>

      <TabsContent value="campaign">
        <div className="space-y-2">
          <p className="text-base font-medium">{safeText(data.campaign.campaignIdea)}</p>
          <p className="text-sm text-white/70">{safeText(data.campaign.keyMessage)}</p>
        </div>
      </TabsContent>

      <TabsContent value="strategy">
        <pre className="whitespace-pre-wrap break-words">{safeText(data.strategy)}</pre>
      </TabsContent>

      <TabsContent value="video">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Storyboard</p>
            <pre className="whitespace-pre-wrap break-words">
              {safeText(data.video.videoStoryboard)}
            </pre>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Ad Script</p>
            <pre className="whitespace-pre-wrap break-words">{safeText(data.video.adScript)}</pre>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="brand">
        <pre className="whitespace-pre-wrap break-words">{safeText(data.brand)}</pre>
      </TabsContent>

      <TabsContent value="influencer">
        <pre className="whitespace-pre-wrap break-words">{safeText(data.influencer)}</pre>
      </TabsContent>

      <TabsContent value="trends">
        <div className="space-y-2">
          <p className="text-base font-medium">Virality Score: {safeScore(data.trends.viralityScore)}</p>
          <p className="text-sm text-white/70">{safeText(data.trends.viralityExplanation)}</p>
          <p className="text-sm text-white/70">{safeText(data.trends.estimatedViews)}</p>
        </div>
      </TabsContent>

    </Tabs>
  );
}
