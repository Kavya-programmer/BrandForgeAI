import { useState } from "react";
import { useGenerateCampaign } from "@workspace/api-client-react";
import type { CampaignResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { CampaignForm } from "@/components/campaign-form";
import { CampaignOutput } from "@/components/campaign-output";
import { Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [result, setResult] = useState<CampaignResult | null>(null);
  const { toast } = useToast();
  
  const generateCampaign = useGenerateCampaign({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        toast({
          title: "Campaign Generated",
          description: "Your full marketing campaign is ready.",
        });
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: error.error || "An error occurred while generating the campaign.",
          variant: "destructive",
        });
      }
    }
  });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      <header className="flex-none h-16 border-b border-border flex items-center px-6 bg-card">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
            <Rocket className="h-5 w-5" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">AI Marketing Agency OS</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Input Panel */}
        <aside className="w-full md:w-[400px] lg:w-[450px] border-r border-border bg-card/50 flex-none overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-1">Campaign Setup</h2>
              <p className="text-sm text-muted-foreground">Define your brand and parameters to generate a complete marketing package.</p>
            </div>
            
            <CampaignForm 
              onSubmit={(data) => generateCampaign.mutate({ data })} 
              isGenerating={generateCampaign.isPending} 
            />
          </div>
        </aside>

        {/* Right Output Panel */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <CampaignOutput result={result} isGenerating={generateCampaign.isPending} />
        </main>
      </div>
    </div>
  );
}
