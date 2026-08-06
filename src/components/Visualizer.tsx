import React, { useEffect, useRef, useState } from "react";
import { MAHI_AVATARS } from "../utils/speech";
import { Sparkles, Mic, Volume2, Brain } from "lucide-react";

interface VisualizerProps {
  emotion: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  isLoading?: boolean;
  audioVolume?: number; // Real-time audio volume level (0-1)
  onEmotionChange?: (emotion: string) => void;
  className?: string;
  showSelector?: boolean;
}

// Map emotion string variations to canonical MAHI_AVATARS keys
function normalizeEmotionKey(rawKey: string): string {
  if (!rawKey) return "greeting";
  const cleaned = rawKey.toLowerCase().trim().replace(/\.jpg$/i, "").replace(/\.png$/i, "");
  
  if (MAHI_AVATARS[cleaned]) return cleaned;

  // Synonyms and file mappings
  const map: Record<string, string> = {
    hay: "greeting",
    welcome: "greeting",
    welcoming: "greeting",
    wink: "teasing",
    tease: "teasing",
    blush: "blushing",
    shy: "blushing",
    nervous2: "concerned",
    caring: "concerned",
    sad: "concerned",
    nervous1: "confused",
    awkward: "confused",
    angry: "angry",
    pout: "pout",
    hair_swirl: "relaxed",
    swirl: "relaxed",
    heart: "heart_eyes",
    starry: "starry_eyes",
    think: "thinking",
  };

  return map[cleaned] || "greeting";
}

export const Visualizer: React.FC<VisualizerProps> = ({
  emotion,
  isListening = false,
  isSpeaking = false,
  isLoading = false,
  audioVolume,
  onEmotionChange,
  className = "",
  showSelector = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const normalizedKey = normalizeEmotionKey(emotion);
  const activeAvatar = MAHI_AVATARS[normalizedKey] || MAHI_AVATARS.greeting;

  // Image transition & lip-syncing states
  const [displayedAvatar, setDisplayedAvatar] = useState(activeAvatar);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lipSyncScale, setLipSyncScale] = useState(1);
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);

  useEffect(() => {
    if (activeAvatar.url !== displayedAvatar.url) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedAvatar(activeAvatar);
        setIsTransitioning(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [activeAvatar, displayedAvatar]);

  // Real-time Canvas Audio Frequency Analyser & Lip-Sync Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isSpeaking || isListening) {
        phase += 0.12;
        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;
        const bars = 20;
        const barWidth = width / bars;

        // Calculate current audio amplitude (use actual audioVolume if provided, or dynamic wave)
        const volumeFactor = typeof audioVolume === "number" ? Math.max(0.1, audioVolume) : 0.6;
        const currentMouthOpen = isSpeaking
          ? Math.abs(Math.sin(phase * 1.5)) * volumeFactor
          : isListening
          ? Math.abs(Math.sin(phase * 0.8)) * 0.2
          : 0;

        setMouthOpenAmount(currentMouthOpen);
        setLipSyncScale(1 + currentMouthOpen * 0.05);

        // Render Canvas Frequency Analyzer bars
        for (let i = 0; i < bars; i++) {
          const freqMultiplier = Math.sin(phase + i * 0.35);
          const amp = isSpeaking
            ? Math.max(6, (freqMultiplier * 20 + 28) * volumeFactor)
            : Math.max(4, (freqMultiplier * 10 + 14) * 0.5);

          const hue = isSpeaking ? (280 + i * 4) % 360 : (150 + i * 4) % 360;
          const gradient = ctx.createLinearGradient(0, centerY - amp, 0, centerY + amp);
          gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.9)`);
          gradient.addColorStop(1, `hsla(${hue + 40}, 85%, 55%, 0.4)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(
            i * barWidth + barWidth * 0.15,
            centerY - amp / 2,
            barWidth * 0.7,
            amp,
            4
          );
          ctx.fill();
        }
      } else {
        setMouthOpenAmount(0);
        setLipSyncScale(1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening, audioVolume]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 3D / Interactive Frame Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 group">
        {/* Reaction Image with Smooth Motion Fade, Scale & Lip-Sync Deformation */}
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
          <img
            key={displayedAvatar.url}
            src={displayedAvatar.url}
            alt={displayedAvatar.label}
            style={{
              transform: `scale(${lipSyncScale}) translateY(${-mouthOpenAmount * 4}px)`,
            }}
            className={`w-full h-full object-cover transition-transform duration-75 ease-out ${
              isTransitioning ? "opacity-40 scale-105 blur-[2px]" : "opacity-100 blur-0"
            } ${isLoading ? "brightness-90" : "brightness-100"}`}
          />

          {/* Lip-Sync Animated Mouth Pulse Overlay */}
          {isSpeaking && (
            <div
              style={{
                opacity: Math.min(0.8, mouthOpenAmount * 1.5),
                transform: `scale(${1 + mouthOpenAmount * 0.8})`,
              }}
              className="absolute bottom-[38%] left-1/2 -translate-x-1/2 w-8 h-4 rounded-full bg-pink-500/30 blur-sm pointer-events-none transition-all duration-75"
            />
          )}
        </div>

        {/* Audio Waveform Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={320}
          height={60}
          className="absolute inset-x-0 bottom-16 w-full h-14 pointer-events-none z-10 opacity-85"
        />

        {/* Status Live Banners */}
        {isLoading && (
          <div className="absolute inset-x-0 top-0 py-3 bg-amber-950/80 backdrop-blur-md flex items-center justify-center space-x-2 z-20 border-b border-amber-500/20">
            <Brain className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs font-black text-amber-200 uppercase tracking-widest">
              Mahi is thinking...
            </span>
          </div>
        )}

        {isSpeaking && !isLoading && (
          <div className="absolute inset-x-0 top-0 py-3 bg-gradient-to-b from-purple-950/90 via-purple-950/60 to-transparent flex items-center justify-center space-x-2 z-20">
            <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="w-2 h-5 bg-amber-400 rounded-full animate-bounce duration-300" />
            <span className="w-2 h-8 bg-pink-400 rounded-full animate-bounce duration-500" />
            <span className="w-2 h-4 bg-purple-300 rounded-full animate-bounce duration-400" />
            <span className="text-xs font-black text-purple-200 uppercase tracking-wider ml-1">
              Mahi Speaking Live
            </span>
          </div>
        )}

        {isListening && !isLoading && !isSpeaking && (
          <div className="absolute inset-x-0 top-0 py-3 bg-emerald-950/90 backdrop-blur-xs flex items-center justify-center space-x-2 z-20 border-b border-emerald-500/20">
            <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-emerald-200 uppercase tracking-widest">
              Listening to Mic...
            </span>
          </div>
        )}

        {/* Bottom In-Card Badge & Mahi Label */}
        <div className="absolute inset-x-0 bottom-0 pt-16 pb-5 px-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col items-center justify-end text-center space-y-1.5 z-20">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 backdrop-blur-md shadow-md">
            <span className="text-sm">{displayedAvatar.emoji}</span>
            <span className="text-[11px] font-black text-pink-200 tracking-wider uppercase">
              {displayedAvatar.label}
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-md flex items-center space-x-2">
            <span>MAHI AI</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </h2>
        </div>
      </div>

      {/* Optional Interactive Emotion Switcher Bar */}
      {showSelector && onEmotionChange && (
        <div className="w-full mt-3 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
            <span>🎭 Live Reaction Selector:</span>
            <span className="text-amber-400 font-normal">{Object.keys(MAHI_AVATARS).length} Emotions</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-0.5">
            {Object.entries(MAHI_AVATARS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => onEmotionChange(key)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
                  normalizedKey === key
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm scale-105"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{val.emoji}</span>
                <span>{key}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
