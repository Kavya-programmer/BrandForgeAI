import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";

const AI_MESSAGES = [
  "Analyzing market landscape...",
  "Engineering viral hooks...",
  "Calibrating audience psychology...",
  "Crafting emotional narratives...",
  "Optimizing for maximum reach...",
  "Synthesizing brand intelligence...",
  "Building campaign architecture...",
  "Tuning persuasion engines...",
];

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % AI_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(8, 10, 20, 0.88)", backdropFilter: "blur(24px)" }}
    >
      {/* Animated neural orb */}
      <div className="relative mb-10">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(252,100%,72%,0.2), transparent 70%)", width: 160, height: 160, top: -30, left: -30 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Core orb */}
        <motion.div
          className="w-[100px] h-[100px] rounded-full relative"
          style={{ background: "linear-gradient(135deg, hsl(252,100%,72%), hsl(290,100%,70%))" }}
          animate={{ scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Inner shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-40"
            style={{ background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.4), transparent)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Brain icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-violet-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 0" }}
          />
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-pink-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "38px 0" }}
          />
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
            style={{ transformOrigin: "55px 0" }}
          />
        </div>
      </div>

      {/* Text area */}
      <div className="text-center space-y-3 max-w-xs px-4">
        {/* Primary message */}
        <motion.p
          className="text-base font-semibold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message || "Generating with AI"}
        </motion.p>

        {/* Rotating sub-message */}
        <div className="h-5 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-xs text-muted-foreground absolute inset-0 text-center"
            >
              {AI_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-48 mx-auto h-1 rounded-full overflow-hidden mt-2" style={{ background: "hsl(var(--secondary))" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(252,100%,72%), hsl(330,100%,68%))" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Powered by LLaMA 3.3 · 70B parameters
        </p>
      </div>
    </motion.div>
  );
}
