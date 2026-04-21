"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Video,
  PenTool,
  TrendingUp,
  Users,
  Zap,
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
import { Spinner } from "@/components/ui/spinner";
import type { FormData, ActionType } from "@/app/page";

const themes = [
  { id: "innovative", label: "Innovative & Bold" },
  { id: "minimal", label: "Minimal & Clean" },
  { id: "playful", label: "Playful & Fun" },
  { id: "luxury", label: "Luxury & Premium" },
  { id: "sustainable", label: "Sustainable & Eco" },
];

interface SidebarProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onGenerate: (type: ActionType) => void;
  isGenerating: boolean;
  hasData: boolean;
}

export function Sidebar({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
}: SidebarProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    formData.brand &&
    formData.product &&
    formData.audience &&
    formData.theme;

  return (
    <aside className="w-[380px] h-screen border-r border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
            <Zap className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              Agency OS
            </h1>
            <p className="text-xs text-muted-foreground">AI Marketing Studio</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-5">
          <FormField label="Brand Name">
            <Input
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g. Acme Corp"
              className="h-11 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </FormField>

          <FormField label="Product / Service">
            <Textarea
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              placeholder="Describe what you're selling..."
              className="min-h-[100px] bg-secondary border-0 resize-none focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </FormField>

          <FormField label="Target Audience">
            <Textarea
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              placeholder="Who is this for?"
              className="min-h-[80px] bg-secondary border-0 resize-none focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </FormField>

          <FormField label="Campaign Theme">
            <Select
              value={formData.theme}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, theme: val }))
              }
            >
              <SelectTrigger className="h-11 bg-secondary border-0 focus:ring-1 focus:ring-foreground/20">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {themes.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={t.id}
                    className="focus:bg-secondary"
                  >
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-border space-y-3">
        <Button
          className="w-full h-12 text-sm font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
          onClick={() => onGenerate("campaign")}
          disabled={isGenerating || !isFormValid}
        >
          {isGenerating ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Campaign
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <ModuleButton
            icon={Target}
            label="Strategy"
            onClick={() => onGenerate("strategy")}
            disabled={isGenerating || !isFormValid}
          />
          <ModuleButton
            icon={Video}
            label="Video"
            onClick={() => onGenerate("video")}
            disabled={isGenerating || !isFormValid}
          />
          <ModuleButton
            icon={PenTool}
            label="Brand"
            onClick={() => onGenerate("brand")}
            disabled={isGenerating || !isFormValid}
          />
          <ModuleButton
            icon={TrendingUp}
            label="Trends"
            onClick={() => onGenerate("trends")}
            disabled={isGenerating || !isFormValid}
          />
        </div>

        <Button
          variant="ghost"
          className="w-full h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={() => onGenerate("influencer")}
          disabled={isGenerating || !isFormValid}
        >
          <Users className="w-4 h-4 mr-2" />
          AI Influencer
        </Button>
      </div>
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
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function ModuleButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="outline"
        className="w-full h-10 text-sm bg-transparent border-border hover:bg-secondary hover:border-border text-muted-foreground hover:text-foreground"
        onClick={onClick}
        disabled={disabled}
      >
        <Icon className="w-4 h-4 mr-1.5" />
        {label}
      </Button>
    </motion.div>
  );
}
