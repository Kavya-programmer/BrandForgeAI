import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViralityGaugeProps {
  score: number;
  estimatedViews: string;
  explanation?: string;
  compact?: boolean;
}

export function ViralityGauge({ score, estimatedViews, explanation, compact }: ViralityGaugeProps) {
  const colorClass =
    score >= 80 ? "text-emerald-400" :
    score >= 60 ? "text-amber-400" :
    "text-muted-foreground";

  const barColor =
    score >= 80 ? "from-emerald-500 to-teal-400" :
    score >= 60 ? "from-amber-500 to-yellow-400" :
    "from-blue-500 to-indigo-400";

  const label =
    score >= 85 ? "🔥 Mega Viral" :
    score >= 75 ? "⚡ High Potential" :
    score >= 65 ? "📈 Strong Reach" :
    "💡 Solid Base";

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <span className={cn("text-2xl font-bold tabular-nums", colorClass)}>{score}</span>
        <div className="flex-1">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Virality Score</span>
            <span className={colorClass}>{label}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 border border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="section-label mb-2">Virality Score</p>
          <div className="flex items-end gap-2">
            <span className={cn("text-5xl font-bold tabular-nums tracking-tight", colorClass)}>
              {score}
            </span>
            <span className="text-muted-foreground text-lg mb-1">/100</span>
          </div>
          <span className="text-sm font-medium mt-1 block">{label}</span>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Estimated reach</span>
          </div>
          <p className="text-base font-semibold text-foreground">{estimatedViews}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full overflow-hidden bg-secondary mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
        />
      </div>

      {/* Segment ticks */}
      <div className="flex justify-between text-[10px] text-muted-foreground/50 mb-3">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      {explanation && (
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
          {explanation}
        </p>
      )}
    </div>
  );
}
