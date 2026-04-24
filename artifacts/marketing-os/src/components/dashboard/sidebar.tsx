import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  Video,
  PenTool,
  TrendingUp,
  Users,
  Zap,
  Brain,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetThemes, getGetThemesQueryKey } from "@workspace/api-client-react";
import type { FormData, ActionType } from "@/pages/dashboard";
import { cn } from "@/lib/utils";

interface SidebarProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onGenerate: (type: ActionType) => void;
  isGenerating: boolean;
  loadingModule: ActionType | null;
  hasData: boolean;
}

const FALLBACK_THEMES = [
  { id: "modern_minimalist", label: "Modern & Minimalist" },
  { id: "bold_energetic", label: "Bold & Energetic" },
  { id: "premium_luxury", label: "Premium Luxury" },
  { id: "playful_quirky", label: "Playful & Quirky" },
  { id: "corporate_professional", label: "Corporate Professional" },
];

export function Sidebar({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
  loadingModule,
  hasData,
}: SidebarProps) {
  const { data: themesData, isLoading: isLoadingThemes } = useGetThemes({
    query: { queryKey: getGetThemesQueryKey() },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    formData.brand.trim() &&
    formData.product.trim() &&
    formData.audience.trim() &&
    formData.theme;

  const themesToUse = themesData?.themes?.length ? themesData.themes : FALLBACK_THEMES;

  return (
    <aside className="w-[340px] h-screen border-r border-border flex flex-col shrink-0 relative overflow-hidden"
      style={{ background: "hsl(var(--sidebar))" }}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(252,100%,72%), transparent)", transform: "translate(-30%, -30%)" }}
        />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(290,100%,70%), transparent)", transform: "translate(30%, 30%)" }}
        />
      </div>

      {/* Header / Logo */}
      <div className="relative px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Animated logo orb */}
          <motion.div
            className="w-9 h-9 rounded-xl relative flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(252,100%,72%), hsl(290,100%,70%))" }}
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4.5 h-4.5 text-white relative z-10" />
            <motion.div
              className="absolute inset-0 opacity-50"
              style={{ background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              BrandForge
              <span className="gradient-brand-text font-bold">AI</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">AI Marketing Command Center</p>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">live</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 relative">
        <p className="section-label">Brand Brief</p>

        <FormField label="Brand Name">
          <Input
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g. Acme Corp, TechLaunch, ZenBase..."
            className="h-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary/40 text-sm placeholder:text-muted-foreground/50"
          />
        </FormField>

        <FormField label="Product / Service">
          <Textarea
            name="product"
            value={formData.product}
            onChange={handleInputChange}
            placeholder="What are you selling? Be specific..."
            className="min-h-[88px] bg-secondary border-0 resize-none focus-visible:ring-1 focus-visible:ring-primary/40 text-sm placeholder:text-muted-foreground/50"
          />
        </FormField>

        <FormField label="Target Audience">
          <Textarea
            name="audience"
            value={formData.audience}
            onChange={handleInputChange}
            placeholder="Who is this for? Age, interests, behavior..."
            className="min-h-[72px] bg-secondary border-0 resize-none focus-visible:ring-1 focus-visible:ring-primary/40 text-sm placeholder:text-muted-foreground/50"
          />
        </FormField>

        <FormField label="Campaign Theme">
          <Select
            value={formData.theme}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, theme: val }))
            }
            disabled={isLoadingThemes}
          >
            <SelectTrigger className="h-10 bg-secondary border-0 focus:ring-1 focus:ring-primary/40 text-sm">
              <SelectValue
                placeholder={isLoadingThemes ? "Loading themes..." : "Select campaign style"}
              />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {themesToUse.map((t) => (
                <SelectItem
                  key={t.id}
                  value={t.id}
                  className="focus:bg-secondary text-sm"
                >
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Generate Button */}
        <div className="pt-4 mt-4 border-t border-border">
          <motion.button
            id="btn-generate-campaign"
            onClick={() => onGenerate("campaign")}
            disabled={isGenerating || !isFormValid}
            whileHover={!isGenerating && isFormValid ? { scale: 1.02 } : {}}
            whileTap={!isGenerating && isFormValid ? { scale: 0.98 } : {}}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg text-sm",
              isGenerating || loadingModule === "campaign"
                ? "bg-primary/50 text-white cursor-not-allowed"
                : isFormValid
                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-violet-500/25"
                : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            {isGenerating || loadingModule === "campaign" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-4 h-4" />
              </motion.div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating || loadingModule === "campaign" ? "Generating..." : "Generate Campaign"}
          </motion.button>
        </div>
      </div>

      {/* Footer status */}
      <AnimatePresence>
        {hasData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-5 py-3 border-t border-border"
          >
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Results ready — click tabs to explore</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="section-label">{label}</label>
      {children}
    </div>
  );
}
