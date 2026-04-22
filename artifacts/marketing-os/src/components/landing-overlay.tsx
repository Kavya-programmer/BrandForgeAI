import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "entering" | "idle" | "transitioning" | "reveal" | "exit";

// ─── Data ─────────────────────────────────────────────────────────────────────
const INPUT_CARDS = [
  { id: 1, text: "#growth",      sub: "Trending signal",    x: 4,  y: 18, rot: -4,  delay: 0    },
  { id: 2, text: "#branding",    sub: "Identity layer",     x: 7,  y: 42, rot:  5,  delay: 0.15 },
  { id: 3, text: "#ads",         sub: "Paid acquisition",   x: 3,  y: 65, rot: -3,  delay: 0.3  },
  { id: 4, text: "👥 Gen Z",     sub: "Primary audience",   x: 13, y: 28, rot:  3,  delay: 0.45 },
  { id: 5, text: "💡 Big idea",  sub: "Creative brief",     x: 8,  y: 80, rot: -6,  delay: 0.6  },
  { id: 6, text: "📊 ROI 3x",   sub: "Growth target",      x: 17, y: 55, rot:  4,  delay: 0.75 },
  { id: 7, text: "🎯 Target",    sub: "Audience mapping",   x: 5,  y: 92, rot: -2,  delay: 0.9  },
];

const OUTPUT_CARDS = [
  { id: 1, icon: "📣", title: "Campaign Draft",    stat: "+340% CTR",    color: "#2563eb", delay: 0.2  },
  { id: 2, icon: "🎯", title: "Brand Strategy",   stat: "Score 9.4/10", color: "#0891b2", delay: 0.38 },
  { id: 3, icon: "📊", title: "Analytics",        stat: "$2.4M reach",  color: "#059669", delay: 0.56 },
  { id: 4, icon: "🌟", title: "Influencer Match", stat: "12 profiles",  color: "#7c3aed", delay: 0.74 },
  { id: 5, icon: "🎬", title: "Video Plan",       stat: "3 scripts",    color: "#dc2626", delay: 0.92 },
];

// Neural node positions (on the sphere)
const NODES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i / 8) * 360,
  r: 55 + (i % 3) * 12,
}));

// ─── Neural Brain ──────────────────────────────────────────────────────────────
function AIBrain({ phase }: { phase: Phase }) {
  const isIdle = phase === "idle";
  const isTransitioning = phase === "transitioning";
  const isReveal = phase === "reveal";

  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      {/* Outer soft glow ring */}
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale:   isReveal      ? [1, 2.5]      :
                     isTransitioning? [1, 0.85, 1.6] :
                     isIdle        ? [1, 1.12, 1]   : [1, 1.06, 1],
            opacity: isReveal      ? [0.25, 0]      :
                     isTransitioning? [0.2, 0.5, 0]  : [0.08, 0.2, 0.08],
          }}
          transition={{
            duration:  isReveal ? 1.2 : isTransitioning ? 1.0 : 3.5 + i * 0.8,
            repeat:    isReveal || isTransitioning ? 0 : Infinity,
            ease:      "easeInOut",
            delay:     i * 0.4,
          }}
          style={{
            position:     "absolute",
            inset:        -(i * 24),
            borderRadius: "50%",
            border:       `1px solid rgba(37,99,235,${isIdle ? 0.2 : 0.1})`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Core sphere */}
      <motion.div
        animate={{
          scale:   isReveal       ? [1, 0.5, 0.5, 0.5] :
                   isTransitioning ? [1, 0.88, 1.15, 0.95, 1] :
                   isIdle         ? [1, 1.04, 1]          : [1, 1.02, 1],
          boxShadow: isReveal ? [
              "0 0 40px rgba(37,99,235,0.25), 0 8px 40px rgba(0,0,0,0.06)",
              "0 0 120px rgba(37,99,235,0.6),  0 0 200px rgba(99,102,241,0.4)",
              "0 0 200px rgba(37,99,235,0.9),  0 0 300px rgba(99,102,241,0.6)",
              "0 0 200px rgba(37,99,235,0.9),  0 0 300px rgba(99,102,241,0.6)",
            ] : isIdle ? [
              "0 0 40px rgba(37,99,235,0.2), 0 8px 40px rgba(0,0,0,0.06)",
              "0 0 60px rgba(37,99,235,0.35), 0 8px 40px rgba(0,0,0,0.06)",
              "0 0 40px rgba(37,99,235,0.2), 0 8px 40px rgba(0,0,0,0.06)",
            ] : "0 0 40px rgba(37,99,235,0.2), 0 8px 40px rgba(0,0,0,0.06)",
        }}
        transition={{
          duration: isReveal ? 1.4 : isTransitioning ? 1.2 : 4,
          times:    isReveal ? [0, 0.3, 0.7, 1] : undefined,
          repeat:   isReveal || isTransitioning ? 0 : Infinity,
          ease:     "easeInOut",
        }}
        style={{
          width:        200,
          height:       200,
          borderRadius: "50%",
          background:   "radial-gradient(circle at 38% 36%, #eff6ff 0%, #dbeafe 30%, #bfdbfe 60%, #93c5fd 85%, #60a5fa 100%)",
          position:     "relative",
          overflow:     "hidden",
        }}
      >
        {/* Scan sweep (idle thinking mode) */}
        <AnimatePresence>
          {isIdle && (
            <motion.div
              key="scan"
              initial={{ top: "-10%" }}
              animate={{ top: ["−10%", "110%"] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              style={{
                position:   "absolute",
                left:       0,
                right:      0,
                height:     3,
                background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)",
                filter:     "blur(2px)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Inner rotating mesh ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position:     "absolute",
            inset:        20,
            borderRadius: "50%",
            border:       "1px dashed rgba(37,99,235,0.15)",
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{
            position:     "absolute",
            inset:        40,
            borderRadius: "50%",
            border:       "1px dashed rgba(99,102,241,0.12)",
          }}
        />

        {/* Neural nodes */}
        {NODES.map((n) => (
          <motion.div
            key={n.id}
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.5 + n.id * 0.3, repeat: Infinity, delay: n.id * 0.2, ease: "easeInOut" }}
            style={{
              position:     "absolute",
              width:        5,
              height:       5,
              borderRadius: "50%",
              background:   "#2563eb",
              top:          `${50 + (n.r / 100) * 50 * Math.sin((n.angle * Math.PI) / 180)}%`,
              left:         `${50 + (n.r / 100) * 50 * Math.cos((n.angle * Math.PI) / 180)}%`,
              transform:    "translate(-50%,-50%)",
              boxShadow:    "0 0 6px rgba(37,99,235,0.6)",
            }}
          />
        ))}

        {/* Center label */}
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}>
          <motion.span
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize:      9,
              letterSpacing: 3,
              color:         "rgba(37,99,235,0.7)",
              fontFamily:    "monospace",
              textTransform: "uppercase",
            }}
          >
            AI
          </motion.span>
        </div>
      </motion.div>

      {/* Orbiting micro-particles */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: -10, transformOrigin: "center" }}
        >
          <motion.div
            animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position:     "absolute",
              width:        4,
              height:       4,
              borderRadius: "50%",
              background:   "rgba(37,99,235,0.6)",
              top:          0,
              left:         "50%",
              boxShadow:    "0 0 8px rgba(37,99,235,0.5)",
              transform:    `rotate(${deg}deg) translateY(-110px)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Input Signal Card ──────────────────────────────────────────────────────
function InputCard({ card, pulling }: { card: typeof INPUT_CARDS[0]; pulling: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={pulling
        ? {
            x: "calc(50vw - 50% - 8vw)",
            y: "calc(50vh - 50%)",
            opacity: 0,
            scale: 0.3,
            transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: card.delay * 0.3 },
          }
        : {
            opacity: 1,
            scale: 1,
            x: [0, 5, -3, 4, 0],
            y: [0, -8, 5, -6, 0],
            rotate: [card.rot, card.rot + 1.5, card.rot - 1, card.rot + 1, card.rot],
            transition: {
              opacity: { duration: 0.6, delay: card.delay + 0.4 },
              scale:   { duration: 0.6, delay: card.delay + 0.4 },
              x: { duration: 8 + card.delay, repeat: Infinity, ease: "easeInOut", delay: card.delay },
              y: { duration: 7 + card.delay, repeat: Infinity, ease: "easeInOut", delay: card.delay },
              rotate: { duration: 10 + card.delay, repeat: Infinity, ease: "easeInOut" },
            },
          }
      }
      style={{
        position:      "absolute",
        left:          `${card.x}%`,
        top:           `${card.y}%`,
        background:    "rgba(255,255,255,0.7)",
        backdropFilter:"blur(16px)",
        border:        "1px solid rgba(37,99,235,0.1)",
        borderRadius:  10,
        padding:       "8px 14px",
        boxShadow:     "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        whiteSpace:    "nowrap",
        userSelect:    "none",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "#1e40af" }}>{card.text}</div>
      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{card.sub}</div>
    </motion.div>
  );
}

// ─── Output Card ───────────────────────────────────────────────────────────
function OutputCard({ card, pulling, revealed }: { card: typeof OUTPUT_CARDS[0]; pulling: boolean; revealed: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={revealed
        ? {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, delay: card.delay, ease: [0.22, 1, 0.36, 1] },
          }
        : pulling
        ? { opacity: 0, y: -12, transition: { duration: 0.4 } }
        : {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, delay: card.delay + 0.6, ease: [0.22, 1, 0.36, 1] },
          }
      }
      whileHover={{ scale: 1.03, y: -2, transition: { duration: 0.25 } }}
      style={{
        background:    "rgba(255,255,255,0.75)",
        backdropFilter:"blur(20px)",
        border:        "1px solid rgba(0,0,0,0.07)",
        borderRadius:  12,
        padding:       "12px 16px",
        display:       "flex",
        alignItems:    "center",
        gap:           12,
        boxShadow:     "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        cursor:        "default",
      }}
    >
      <span style={{ fontSize: 20 }}>{card.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{card.title}</div>
        <div style={{ fontSize: 11, color: card.color, marginTop: 2, fontWeight: 500 }}>{card.stat}</div>
      </div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: card.delay }}
        style={{
          width:        6,
          height:       6,
          borderRadius: "50%",
          background:   card.color,
        }}
      />
    </motion.div>
  );
}

// ─── Main Overlay ─────────────────────────────────────────────────────────────
export default function LandingOverlay({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("entering");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition into idle mode after 3s of inactivity
  useEffect(() => {
    if (phase !== "entering") return;
    idleRef.current = setTimeout(() => setPhase("idle"), 3000);
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
  }, [phase]);

  const handleStart = useCallback(() => {
    if (phase === "transitioning" || phase === "reveal" || phase === "exit") return;
    if (idleRef.current) clearTimeout(idleRef.current);

    setPhase("transitioning");

    // Reveal text step
    setTimeout(() => setPhase("reveal"), 1400);

    // Fade out overlay
    setTimeout(() => {
      setPhase("exit");
      setTimeout(() => {
        setOverlayVisible(false);
        onComplete();
      }, 900);
    }, 3000);
  }, [phase, onComplete]);

  if (!overlayVisible) return null;

  const isPulling   = phase === "transitioning";
  const isReveal    = phase === "reveal";
  const isExiting   = phase === "exit";

  return (
    <AnimatePresence>
      <motion.div
        key="apple-landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: isExiting ? 0.9 : 0.6, ease: "easeInOut" }}
        style={{
          position:       "fixed",
          inset:          0,
          zIndex:         9999,
          background:     "linear-gradient(160deg, #f8faff 0%, #eef2ff 40%, #f0f9ff 70%, #f8faff 100%)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          overflow:       "hidden",
          fontFamily:     "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
        }}
      >
        {/* Subtle background texture dots */}
        <div style={{
          position:        "absolute",
          inset:           0,
          backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.04) 1px, transparent 1px)",
          backgroundSize:  "40px 40px",
          pointerEvents:   "none",
        }} />

        {/* Ambient blobs */}
        <div style={{
          position:   "absolute",
          top:        "10%",
          left:       "15%",
          width:      400,
          height:     400,
          background: "radial-gradient(circle, rgba(219,234,254,0.6) 0%, transparent 70%)",
          filter:     "blur(60px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position:   "absolute",
          bottom:     "15%",
          right:      "15%",
          width:      350,
          height:     350,
          background: "radial-gradient(circle, rgba(224,231,255,0.5) 0%, transparent 70%)",
          filter:     "blur(60px)",
          pointerEvents: "none",
        }} />

        {/* ── LEFT: Input Signals ── */}
        <div style={{
          position:      "absolute",
          left:          0,
          top:           0,
          width:         "26%",
          height:        "100%",
          pointerEvents: "none",
        }}>
          {INPUT_CARDS.map((c) => (
            <InputCard key={c.id} card={c} pulling={isPulling || isReveal || isExiting} />
          ))}
        </div>

        {/* ── RIGHT: Output System ── */}
        <div style={{
          position:  "absolute",
          right:     "2.5%",
          top:       "50%",
          transform: "translateY(-50%)",
          width:     220,
          display:   "flex",
          flexDirection: "column",
          gap:       10,
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{ fontSize: 9, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}
          >
            Output System
          </motion.div>
          {OUTPUT_CARDS.map((c) => (
            <OutputCard key={c.id} card={c} pulling={isPulling} revealed={isReveal || isExiting} />
          ))}
        </div>

        {/* ── CENTER ── */}
        <div style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          gap:            36,
          zIndex:         10,
          textAlign:      "center",
        }}>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#3b82f6", textTransform: "uppercase", marginBottom: 10 }}>
              BrandForge AI
            </div>
            <h1 style={{
              fontSize:   36,
              fontWeight: 700,
              color:      "#0f172a",
              margin:     0,
              lineHeight: 1.2,
              letterSpacing: -0.5,
            }}>
              AI Marketing<br />
              <span style={{
                background:            "linear-gradient(135deg, #2563eb 0%, #0891b2 50%, #7c3aed 100%)",
                WebkitBackgroundClip:  "text",
                WebkitTextFillColor:   "transparent",
              }}>
                Command Centre
              </span>
            </h1>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 12, letterSpacing: 0.2 }}>
              Silence. Then intelligence.
            </p>
          </motion.div>

          {/* AI Brain */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.34, 1.2, 0.64, 1] }}
          >
            <AIBrain phase={phase} />
          </motion.div>

          {/* Reveal text: "AI MARKETING COMMAND CENTRE" */}
          <AnimatePresence>
            {(isReveal || isExiting) && (
              <motion.div
                key="reveal-text"
                initial={{ opacity: 0, scale: 0.8, letterSpacing: 20 }}
                animate={{ opacity: isExiting ? 0 : 1, scale: 1, letterSpacing: 6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize:      11,
                  fontWeight:    700,
                  color:         "#1e40af",
                  textTransform: "uppercase",
                  letterSpacing: 6,
                  position:      "absolute",
                  bottom:        "28%",
                }}
              >
                AI Marketing Command Centre
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status indicator */}
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: 18 }}
          >
            {(phase === "entering" || phase === "idle") && (
              <motion.p
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 10, color: "#9ca3af", letterSpacing: 3, margin: 0, textTransform: "uppercase" }}
              >
                {phase === "idle" ? "● Thinking mode" : "Initializing..."}
              </motion.p>
            )}
            {phase === "transitioning" && (
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 10, color: "#3b82f6", letterSpacing: 3, margin: 0, textTransform: "uppercase" }}
              >
                Processing...
              </motion.p>
            )}
          </motion.div>

          {/* CTA */}
          <AnimatePresence>
            {!isReveal && !isExiting && (
              <motion.div
                key="cta-group"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 1.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
              >
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 40px rgba(37,99,235,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  style={{
                    padding:      "14px 52px",
                    borderRadius: 100,
                    background:   "linear-gradient(135deg, #2563eb, #0891b2)",
                    border:       "none",
                    color:        "#fff",
                    fontSize:     14,
                    fontWeight:   600,
                    letterSpacing: 0.3,
                    cursor:       "pointer",
                    boxShadow:    "0 4px 24px rgba(37,99,235,0.25), 0 1px 4px rgba(0,0,0,0.08)",
                    transition:   "box-shadow 0.3s ease",
                    position:     "relative",
                    overflow:     "hidden",
                  }}
                >
                  {/* Shimmer */}
                  <motion.span
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    style={{
                      position:   "absolute",
                      inset:      0,
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      pointerEvents: "none",
                    }}
                  />
                  Start →
                </motion.button>

                <motion.button
                  whileHover={{ opacity: 0.7 }}
                  onClick={handleStart}
                  style={{
                    background: "none",
                    border:     "none",
                    color:      "#9ca3af",
                    fontSize:   10,
                    cursor:     "pointer",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  skip intro
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flash on reveal */}
        <AnimatePresence>
          {isReveal && (
            <motion.div
              key="reveal-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0] }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              style={{
                position:        "absolute",
                inset:           0,
                background:      "radial-gradient(circle at 50% 50%, #bfdbfe, #dbeafe, transparent 65%)",
                pointerEvents:   "none",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
