import React from "react";
import {
  Sparkles,
  BookOpen,
  Mic,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Award,
  Zap,
  Globe,
  Download,
  Target,
  Brain,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface HomeOverviewProps {
  onStartTest: () => void;
  onStartNotes: () => void;
  onStartViva: () => void;
  onStartWBCHSESem3?: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onStartTest,
  onStartNotes,
  onStartViva,
  onStartWBCHSESem3,
}) => {
  return (
    <div id="home-overview-wrapper" className="space-y-12 pb-16">
      {/* Hero Section */}
      <section id="hero-banner" className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 text-slate-900 p-8 sm:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Dedicated WBCHSE Class 12 (Semester 3) Official Curriculum Hub Included</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Welcome to <span className="text-indigo-600">MedhaPrep AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            West Bengal's most advanced AI study platform. Full syllabus mastery for <strong>WBCHSE Class 12 (Semester 3)</strong>, JEE & NEET. Practice OMR tests with KaTeX math steps, speech reasoning viva voce, and YouTube & PDF smart notes!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {onStartWBCHSESem3 && (
              <button
                id="hero-wbchse-sem3-cta"
                onClick={onStartWBCHSESem3}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md shadow-amber-400/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>WBCHSE Sem 3 Syllabus Hub (সেমিস্টার ৩)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              id="hero-create-mock-test-cta"
              onClick={onStartTest}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>AI Mock Test & OMR</span>
            </button>

            <button
              id="hero-generate-notes-cta"
              onClick={onStartNotes}
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold flex items-center space-x-2 transition-all"
            >
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Notes & PDF</span>
            </button>

            <button
              id="hero-voice-viva-cta"
              onClick={onStartViva}
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold flex items-center space-x-2 transition-all"
            >
              <Mic className="w-5 h-5 text-rose-600" />
              <span>Oral Viva Practice</span>
            </button>
          </div>
        </div>
      </section>

      {/* Target Boards & Syllabus Supported */}
      <section id="supported-boards-section" className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Supported Exams & Curriculum</h2>
          <p className="text-slate-600 text-sm">
            Curated question banks and notes compliant with latest state board & national syllabus guidelines.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              10th
            </div>
            <h3 className="font-bold text-slate-800 text-sm">WBBSE Board</h3>
            <p className="text-xs text-slate-500">Madhyamik Class 9 & 10 (Physical Science, Life Science, Math)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              12th
            </div>
            <h3 className="font-bold text-slate-800 text-sm">WBCHSE Board</h3>
            <p className="text-xs text-slate-500">Higher Secondary 11 & 12 (Physics, Chem, Math, Bio)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              JEE
            </div>
            <h3 className="font-bold text-slate-800 text-sm">JEE Mains</h3>
            <p className="text-xs text-slate-500">Engineering Entrance (MCQ, Integer Type, PYQs)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              NEET
            </div>
            <h3 className="font-bold text-slate-800 text-sm">NEET UG</h3>
            <p className="text-xs text-slate-500">Medical Entrance (Physics, Chemistry, Biology)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-indigo-300 transition-colors col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              WB
            </div>
            <h3 className="font-bold text-slate-800 text-sm">WBJEE Entrance</h3>
            <p className="text-xs text-slate-500">West Bengal Joint Entrance Examinations</p>
          </div>
        </div>
      </section>

      {/* Deep Feature Highlights */}
      <section id="deep-features-grid" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Why Choose MedhaPrep AI?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Power Modules in One Platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1: AI Mock Test Generator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">1. AI Mock Test Generator</h3>
                <span className="text-xs text-indigo-600 font-semibold">Custom Boards, Subjects & PYQs</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Generate customizable tests for any chapter or topic. Choose difficulty (Easy, Medium, Hard), number of questions, MCQs or numericals, and incorporate real Board Past Year Questions (PYQs).
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Timer mode with real-time countdown & question palette</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant step-by-step solutions & formulas after completion</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>One-click PDF Export for offline practice printouts</span>
              </li>
            </ul>
          </div>

          {/* Module 2: YouTube & Document Notes Creator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">2. YouTube & PDF Notes Creator</h3>
                <span className="text-xs text-emerald-600 font-semibold">Bengali (বাংলা) & English Support</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Paste any educational YouTube video link or upload study PDFs/text. Gemini extracts key concepts, short revision notes, key formulas, flashcards, and practice questions.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dual language output: Bengali (বাংলা), English, or Bilingual</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Interactive flashcard flipper for rapid recall</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Download as formatted PDF notes with key takeaway boxes</span>
              </li>
            </ul>
          </div>

          {/* Module 3: AI Voice Viva Practice */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">3. AI Voice Viva & Oral Reasoning</h3>
                <span className="text-xs text-rose-600 font-semibold">Speech Recognition & Analysis</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Prepare for oral viva examinations, practical lab questions, and logical reasoning. Speak directly into your mic; Gemini evaluates your spoken answer for accuracy, conceptual depth, and missed points.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Speech-to-text transcript analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Score out of 100 with fluency & accuracy feedback</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Model viva answer provided in both English and Bengali</span>
              </li>
            </ul>
          </div>

          {/* Module 4: Analytics Dashboard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">4. Performance Analytics</h3>
                <span className="text-xs text-cyan-600 font-semibold">Score Trends & Weak Spot Detection</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Review your test history, total attempts, accuracy percentage, time spent per question, and identify chapters that require extra focus before exams.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Visual progress charts and historical test attempts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Subject & chapter weakness breakdown</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Saved locally for session persistence</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Simple Step-by-Step Usage Guide */}
      <section id="how-it-works-section" className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">How to Get Started in 3 Steps</h2>
          <p className="text-xs text-slate-500">Supercharge your preparation in less than 2 minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Select Board & Topic</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose WBBSE, WBCHSE, JEE Mains or NEET, input your chapter name, set the question count & timer.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Take Test or Generate Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solve the live test with countdown timer or convert YouTube videos to Bengali & English revision notes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Review Solutions & Export PDF</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Check step-by-step explanations, practice viva voice questions, and download offline PDF revision sheets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
