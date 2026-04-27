import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LandingOverlay from "@/components/landing-overlay";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const [showLanding, setShowLanding] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Dashboard always mounted, landing overlays it */}
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />

        {/* Cinematic landing overlay — plug-and-play, remove this block to disable */}
        {showLanding && (
          <LandingOverlay onComplete={() => setShowLanding(false)} />
        )}
        
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
