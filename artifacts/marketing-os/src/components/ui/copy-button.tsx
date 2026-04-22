import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border transition-all duration-200",
        "text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5",
        size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        copied && "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
