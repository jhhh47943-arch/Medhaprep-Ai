import React, { useState, useEffect } from "react";
import { Sparkles, Brain, CheckCircle2, BookOpen, Layers, ShieldCheck } from "lucide-react";

interface GenerationLoadingModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
}

const STEP_MESSAGES = [
  "WBCHSE / WBBSE / JEE / NEET পাঠ্যক্রম ও বিগত বছরের প্রশ্ন বিশ্লেষণ করা হচ্ছে...",
  "মানসম্মত বহুবিকল্পভিত্তিক ও তত্ত্বীয় প্রশ্নাবলী প্রস্তুত করা হচ্ছে...",
  "LaTeX KaTeX ফরম্যাটে গাণিতিক সূত্রাবলী ও সমীকরণ টাইপসেট করা হচ্ছে...",
  "উচ্চমাধ্যমিক স্ট্যান্ডার্ড প্রাতিষ্ঠানিক বাংলা ও ইংরেজি পরিভাষা যুক্ত হচ্ছে...",
  "ধাপভিত্তিক সমাধান, উত্তর সংকেত ও ফাইনাল পেপার প্রস্তুত হচ্ছে...",
];

const BENGALI_QUOTES = [
  "\"সংগ্রামই জীবনের অন্য নাম - লেগে থাকো, জয় তোমারই হবে।\"",
  "\"পরিশ্রম ও সঠিক রিভিশনের জোরে যেকোনো পরীক্ষায় সেরা স্থান অর্জন সম্ভব।\"",
  "\"WBCHSE, JEE ও NEET পরীক্ষায় নির্ভুল প্র্যাকটিসই সর্বোচ্চ স্কোরের চাবিকাঠি।\"",
  "\"প্রতিটি ভুল উত্তর থেকে শিখে এগিয়ে যাওয়াই হলো প্রকৃত সফলতার পথ।\"",
];

export const GenerationLoadingModal: React.FC<GenerationLoadingModalProps> = ({
  isOpen,
  title = "AI Engine Generating Your Content...",
  subtitle = "Gemini 3.6 Flash is crafting authentic board exam materials in real-time.",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Prevent background scroll and reset states
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentStep(0);
      setProgress(15);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev < STEP_MESSAGES.length - 1 ? prev + 1 : prev;
        setProgress(Math.min(94, 20 + next * 18));
        return next;
      });
    }, 1900);

    const progressSubInterval = setInterval(() => {
      setProgress((p) => (p < 92 ? p + 1 : p));
    }, 350);

    const quoteInterval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % BENGALI_QUOTES.length);
    }, 4200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressSubInterval);
      clearInterval(quoteInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="generation-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      {/* Gentle ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-blue-600/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div
        id="generation-modal-box"
        className="relative bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-white text-center animate-in zoom-in-95 duration-200"
      >
        {/* Glow Ring Loader */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping duration-[2500ms]" />
          <div className="absolute inset-0 rounded-full border-3 border-t-indigo-400 border-r-amber-400 border-b-emerald-400 border-l-transparent animate-spin duration-[1100ms]" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>MedhaPrep AI Generation Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{subtitle}</p>
        </div>

        {/* Progress Bar with Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span className="text-indigo-300">প্রস্তুতির অগ্রগতি (Progress)</span>
            <span className="font-mono text-amber-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-500 via-blue-500 to-amber-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Live Stepper List */}
        <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5">
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
                    ? "text-indigo-200 font-bold scale-[1.01]"
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
                <span className="truncate leading-relaxed">{msg}</span>
              </div>
            );
          })}
        </div>

        {/* Motivational Bengali Quote Footer */}
        <div className="pt-2 border-t border-slate-800 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center justify-center space-x-1">
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span>MedhaPrep পরীক্ষার প্রস্তুতি মোটিভেশন</span>
          </span>
          <p className="text-xs text-slate-300 italic font-medium min-h-[32px] transition-all duration-500 flex items-center justify-center">
            {BENGALI_QUOTES[quoteIdx]}
          </p>
        </div>
      </div>
    </div>
  );
};

