import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Zap, CheckCircle2, BookOpen, Layers } from "lucide-react";

interface GenerationLoadingModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
}

const STEP_MESSAGES = [
  "🔍 Scanning WBBSE / WBCHSE / JEE / NEET Syllabi & Board PYQs...",
  "⚡ Synthesizing High-Yield Questions & Step-by-Step Solutions...",
  "📐 Typesetting Mathematical Formulas & KaTeX Equations ($E=mc^2$)...",
  "🌐 Formatting Bengali (বাংলা) & English Translations & Short Tricks...",
  "✨ Finalizing Exam-Ready Paper & Answer Key...",
];

const BENGALI_QUOTES = [
  "\"সংগ্রামই জীবনের অন্য নাম - লেগে থাকো, জয় তোমারই হবে।\"",
  "\"পরিশ্রম ও সঠিক গাইডলাইনের জোরে যেকোনো পরীক্ষায় সেরা স্থান অর্জন সম্ভব।\"",
  "\"WBCHSE, JEE ও NEET পরীক্ষায় সঠিক রিভিশন ও প্র্যাকটিসই সাফল্যের চাবিকাঠি।\"",
  "\"প্রতিটি ভুল উত্তর থেকে শিখে এগিয়ে যাওয়াই হলো প্রকৃত মেধাবীর লক্ষণ।\"",
];

export const GenerationLoadingModal: React.FC<GenerationLoadingModalProps> = ({
  isOpen,
  title = "AI Engine Generating Your Content...",
  subtitle = "Gemini 3.6 Flash is crafting customized exam materials in real-time.",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEP_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1800);

    const quoteInterval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % BENGALI_QUOTES.length);
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(quoteInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="generation-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Background Animated Floating Math Symbols */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden select-none">
        <div className="absolute top-10 left-10 text-3xl font-serif text-indigo-400 animate-bounce duration-[3000ms]">
          {"\\int_{0}^{\\infty} e^{-x^2} dx"}
        </div>
        <div className="absolute top-1/4 right-16 text-4xl font-serif text-emerald-400 animate-pulse duration-[2500ms]">
          {"E = h\\nu"}
        </div>
        <div className="absolute bottom-20 left-1/4 text-3xl font-serif text-amber-400 animate-bounce duration-[4000ms]">
          {"\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J}"}
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl font-serif text-purple-400 animate-pulse duration-[3500ms]">
          {"\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1"}
        </div>
        <div className="absolute top-1/3 left-1/3 text-4xl font-serif text-rose-400 animate-ping duration-[5000ms]">
          {"\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}"}
        </div>
      </div>

      <div
        id="generation-modal-box"
        className="relative bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-white text-center animate-in zoom-in-95 duration-200"
      >
        {/* Glow Ring Loader */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-emerald-400 border-b-pink-500 border-l-amber-400 animate-spin duration-[1200ms]" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* Live Stepper List */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5">
          {STEP_MESSAGES.map((msg, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs transition-all duration-300 ${
                  isDone
                    ? "text-emerald-400 font-semibold"
                    : isCurrent
                    ? "text-indigo-300 font-bold scale-[1.02]"
                    : "text-slate-600 opacity-60"
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                </div>
                <span className="truncate">{msg}</span>
              </div>
            );
          })}
        </div>

        {/* Motivational Bengali Quote Footer */}
        <div className="pt-2 border-t border-slate-800 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center justify-center space-x-1">
            <Brain className="w-3 h-3" />
            <span>MedhaPrep AI Study Motivation</span>
          </span>
          <p className="text-xs text-slate-300 italic font-medium min-h-[32px] transition-all duration-500 flex items-center justify-center">
            {BENGALI_QUOTES[quoteIdx]}
          </p>
        </div>
      </div>
    </div>
  );
};
