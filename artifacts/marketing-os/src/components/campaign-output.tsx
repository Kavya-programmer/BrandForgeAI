import type { CampaignResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Lightbulb, 
  Target, 
  Clapperboard, 
  Share2, 
  LayoutTemplate 
} from "lucide-react";

interface CampaignOutputProps {
  result: CampaignResult | null;
  isGenerating: boolean;
}

export function CampaignOutput({ result, isGenerating }: CampaignOutputProps) {
  if (isGenerating) {
    return (
      <div className="space-y-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border/50 bg-card/30">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              {i > 2 && <Skeleton className="h-4 w-[80%]" />}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground animate-in fade-in zoom-in-95 duration-500">
        <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
          <LayoutTemplate className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">No Campaign Generated Yet</h3>
        <p className="max-w-md mx-auto text-sm">
          Fill out the campaign setup form on the left and hit "Generate Campaign" to produce a complete marketing package in seconds.
        </p>
      </div>
    );
  }

  const sections = [
    {
      id: "idea",
      title: "Campaign Idea",
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      content: result.campaignIdea,
    },
    {
      id: "strategy",
      title: "Strategy",
      icon: <Target className="h-5 w-5 text-emerald-500" />,
      content: result.strategy,
    },
    {
      id: "script",
      title: "Ad Script",
      icon: <Clapperboard className="h-5 w-5 text-blue-500" />,
      content: result.adScript,
    },
    {
      id: "social",
      title: "Social Content",
      icon: <Share2 className="h-5 w-5 text-purple-500" />,
      content: result.socialContent,
    },
    {
      id: "storyboard",
      title: "Video Storyboard",
      icon: <LayoutTemplate className="h-5 w-5 text-rose-500" />,
      content: result.videoStoryboard,
    }
  ];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-12">
      <div className="mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-primary" data-testid="text-result-brand">
          {result.brand}
        </h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-muted text-xs uppercase tracking-wider text-muted-foreground" data-testid="text-result-theme">
            {result.theme} Theme
          </span>
          Campaign Package
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card 
            key={section.id} 
            className="border-border/50 bg-card overflow-hidden shadow-md animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
            style={{ animationDelay: `${index * 150}ms`, animationDuration: "600ms" }}
            data-testid={`card-section-${section.id}`}
          >
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 rounded-md bg-background border border-border/50 shadow-sm">
                  {section.icon}
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50">
                {/* Basic text formatting to handle line breaks simply */}
                {section.content.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i} className="mb-4 last:mb-0 text-card-foreground/90">{paragraph}</p> : <br key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
