import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Clock,
  HelpCircle,
  Zap,
  Check,
  AlertCircle,
  Layers,
  GraduationCap,
  FileCheck,
  Flame,
} from "lucide-react";
import { QuizTest, ExamBoard, QuestionType, DifficultyLevel, LanguageMode } from "../types";
import { GenerationLoadingModal } from "./GenerationLoadingModal";

interface MockTestCreatorProps {
  onTestCreated: (test: QuizTest) => void;
  customApiKey: string;
  selectedModel?: string;
}

export const MockTestCreator: React.FC<MockTestCreatorProps> = ({
  onTestCreated,
  customApiKey,
  selectedModel,
}) => {
  const [board, setBoard] = useState<ExamBoard>("WBCHSE (Class 11-12)");
  const [targetClass, setTargetClass] = useState("Class 12");
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("Optics & Wave Motion");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(["MCQ"]);
  const [includePYQ, setIncludePYQ] = useState(true);
  const [language, setLanguage] = useState<LanguageMode>("Bilingual");
  const [timerMinutes, setTimerMinutes] = useState(15);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableQuestionTypes: QuestionType[] = [
    "MCQ",
    "Short Answer",
    "True/False",
    "Numerical",
    "Matching",
    "Assertion-Reason",
  ];

  const handleTypeToggle = (type: QuestionType) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter((t) => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleQuickPreset = (
    pBoard: ExamBoard,
    pClass: string,
    pSubject: string,
    pTopic: string,
    pDiff: DifficultyLevel,
    pNum: number
  ) => {
    setBoard(pBoard);
    setTargetClass(pClass);
    setSubject(pSubject);
    setTopic(pTopic);
    setDifficulty(pDiff);
    setNumQuestions(pNum);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a chapter or topic name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customApiKey && customApiKey.trim().length > 5) {
        headers["x-custom-gemini-key"] = customApiKey.trim();
      }
      if (selectedModel) {
        headers["x-gemini-model"] = selectedModel;
      }

      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers,
        body: JSON.stringify({
          board,
          targetClass,
          subject,
          topic,
          difficulty,
          numQuestions,
          questionTypes,
          includePYQ,
          language,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.test) {
        throw new Error(data.error || "Failed to generate test. Please try again.");
      }

      const generatedTest: QuizTest = {
        id: `test_${Date.now()}`,
        title: data.test.title || `${subject} - ${topic} (${board})`,
        description: data.test.description || `Mock test generated for ${topic}`,
        board: data.test.board || board,
        subject: data.test.subject || subject,
        topic: data.test.topic || topic,
        targetClass,
        difficulty,
        timerMinutes,
        createdAt: new Date().toISOString(),
        questions: data.test.questions || [],
      };

      onTestCreated(generatedTest);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while contacting Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="mock-test-creator-container" className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Animated Loading Overlay */}
      <GenerationLoadingModal
        isOpen={loading}
        title="Synthesizing Board & Competitive Exam Paper..."
        subtitle={`Generating ${numQuestions} ${difficulty} level questions with KaTeX formulas & Bengali solutions.`}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Mock Test Creator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Generate WBCHSE, WBBSE, JEE & NEET Mock Papers
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Tailor questions by Board, Class, Topic, Difficulty and include authentic Board Past Year Questions (PYQs).
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs text-indigo-300">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Powered by Gemini 3.6 Flash AI</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Popular Exam Presets (1-Click Fill)</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE (Class 11-12)", "Class 12", "Physics", "Ray Optics & Optical Instruments", "Medium", 10)
            }
            className="p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:border-indigo-500 hover:bg-slate-800 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-slate-100">WBCHSE Physics</p>
            <p className="text-[10px] text-slate-400 truncate">Class 12 • Ray Optics PYQs</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBBSE (Class 9-10)", "Class 10", "Physical Science", "Chemical Bonding & Electricity", "Easy", 10)
            }
            className="p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:border-indigo-500 hover:bg-slate-800 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-slate-100">WBBSE Physical Sci</p>
            <p className="text-[10px] text-slate-400 truncate">Madhyamik Class 10</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("JEE Mains", "Class 12", "Mathematics", "Definite Integrals & Vectors", "Hard", 12)
            }
            className="p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:border-indigo-500 hover:bg-slate-800 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-slate-100">JEE Mains Math</p>
            <p className="text-[10px] text-slate-400 truncate">Calculus & Vectors</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("NEET UG", "Class 12", "Biology", "Genetics & Molecular Basis", "Medium", 15)
            }
            className="p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:border-indigo-500 hover:bg-slate-800 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-slate-100">NEET Biology</p>
            <p className="text-[10px] text-slate-400 truncate">Genetics & Evolution</p>
          </button>
        </div>
      </div>

      {/* Main Generator Form */}
      <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Board / Exam */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Target Board / Exam
            </label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value as ExamBoard)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-950 font-medium text-slate-100"
            >
              <option value="WBCHSE (Class 11-12)">WBCHSE (West Bengal Higher Secondary)</option>
              <option value="WBBSE (Class 9-10)">WBBSE (West Bengal Madhyamik)</option>
              <option value="JEE Mains">JEE Mains (Engineering Entrance)</option>
              <option value="NEET UG">NEET UG (Medical Entrance)</option>
              <option value="WBJEE">WBJEE (West Bengal Joint Entrance)</option>
              <option value="CBSE / ICSE">CBSE / ICSE Board</option>
              <option value="Custom / Other">Custom Exam / General Practice</option>
            </select>
          </div>

          {/* Class / Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Class / Standard Level
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-950 font-medium text-slate-100"
            >
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10 (Madhyamik)</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12 (Higher Secondary)</option>
              <option value="Repeater / Dropper">Repeater / Dropper Batch</option>
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Subject Name
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics, Chemistry, Life Science..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-100 font-medium placeholder-slate-600"
              required
            />
          </div>

          {/* Topic / Chapter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Specific Chapter / Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Electric Current, Electrostatics, Photosynthesis..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-100 font-medium placeholder-slate-600"
              required
            />
          </div>
        </div>

        {/* Row 2: Difficulty & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Difficulty Standard
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    difficulty === d
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {d === "Easy" ? "Normal (Easy)" : d}
                </button>
              ))}
            </div>
          </div>

          {/* Language Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Language Output
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["English", "Bengali", "Bilingual"] as LanguageMode[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    language === lang
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {lang === "Bengali" ? "বাংলা" : lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Question Count, Timer & Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800">
          {/* Number of Questions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Question Count
              </label>
              <span className="text-xs font-extrabold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                {numQuestions} Questions
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 Qs</span>
              <span>20 Qs</span>
              <span>30 Qs</span>
              <span className="font-bold text-indigo-400">40 Qs</span>
            </div>
          </div>

          {/* Timer Limit */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Timer Limit</span>
            </label>
            <select
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-100 font-medium"
            >
              <option value={0}>No Timer (Untimed Practice)</option>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
            </select>
          </div>

          {/* PYQ Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Include Board PYQs
            </label>
            <div
              onClick={() => setIncludePYQ(!includePYQ)}
              className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                includePYQ
                  ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Past Year Questions</span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-slate-950 font-bold ${
                  includePYQ ? "bg-emerald-400" : "bg-slate-700 text-slate-400"
                }`}
              >
                {includePYQ && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Question Types checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
            Included Question Styles
          </label>
          <div className="flex flex-wrap gap-2">
            {availableQuestionTypes.map((qType) => {
              const active = questionTypes.includes(qType);
              return (
                <button
                  key={qType}
                  type="button"
                  onClick={() => handleTypeToggle(qType)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{qType}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-3 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Crafting AI Questions with PYQs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate AI Mock Paper Now</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
