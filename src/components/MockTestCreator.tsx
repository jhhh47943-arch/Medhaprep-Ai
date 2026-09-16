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
  initialBoard?: ExamBoard;
  initialClass?: string;
  initialSubject?: string;
  initialTopic?: string;
}

export const MockTestCreator: React.FC<MockTestCreatorProps> = ({
  onTestCreated,
  customApiKey,
  selectedModel,
  initialBoard,
  initialClass,
  initialSubject,
  initialTopic,
}) => {
  const [board, setBoard] = useState<ExamBoard>(initialBoard || "WBCHSE Class 12 (Semester 3)");
  const [targetClass, setTargetClass] = useState(initialClass || "Class 12 (Semester 3)");
  const [subject, setSubject] = useState(initialSubject || "Physics");
  const [topic, setTopic] = useState(initialTopic || "Matrices & Determinants");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(["MCQ"]);
  const [includePYQ, setIncludePYQ] = useState(true);
  const [pyqExamFilter, setPyqExamFilter] = useState<string>("All (WBCHSE + JEE + WBJEE)");
  const [language, setLanguage] = useState<LanguageMode>("Bengali");
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
          pyqExamFilter,
          language:
            language === "Bengali"
              ? "Bengali (বাংলা মিডিয়াম)"
              : language === "Bilingual"
              ? "Bilingual (বাংলা ও English)"
              : "English",
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Mock Test Creator</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Generate WBCHSE, WBBSE, JEE & NEET Mock Papers
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Tailor questions by Board, Class, Topic, Difficulty and include authentic Board Past Year Questions (PYQs).
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl text-xs text-indigo-700 font-semibold">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Powered by Gemini 3.6 Flash AI</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>WBCHSE Sem 3 Official Subject Presets (1-Click Fill)</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE Class 12 (Semester 3)", "Class 12 (Semester 3)", "Physics", "Electrostatics & Current Electricity", "Medium", 10)
            }
            className="p-3 rounded-2xl border border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-indigo-900">Sem 3 Physics</p>
            <p className="text-[10px] text-slate-500 truncate">Electrostatics OMR</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE Class 12 (Semester 3)", "Class 12 (Semester 3)", "Chemistry", "Solutions & Electrochemistry", "Medium", 10)
            }
            className="p-3 rounded-2xl border border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-emerald-900">Sem 3 Chem</p>
            <p className="text-[10px] text-slate-500 truncate">Solutions & Kinetics</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE Class 12 (Semester 3)", "Class 12 (Semester 3)", "Mathematics", "Relations, Functions & Matrices", "Medium", 10)
            }
            className="p-3 rounded-2xl border border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-amber-900">Sem 3 Math</p>
            <p className="text-[10px] text-slate-500 truncate">Matrices & Calc</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE Class 12 (Semester 3)", "Class 12 (Semester 3)", "Biological Sciences", "Reproduction & Genetics", "Medium", 12)
            }
            className="p-3 rounded-2xl border border-rose-200 bg-white hover:border-rose-400 hover:bg-rose-50/50 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-rose-900">Sem 3 Biology</p>
            <p className="text-[10px] text-slate-500 truncate">Genetics & Repro</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE Class 12 (Semester 3)", "Class 12 (Semester 3)", "Computer Science (COMS)", "Data Structures (Arrays, Linked Lists, Stacks, Queues) & OOP in C++", "Medium", 10)
            }
            className="p-3 rounded-2xl border border-cyan-200 bg-white hover:border-cyan-400 hover:bg-cyan-50/50 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-cyan-900">Computer Science</p>
            <p className="text-[10px] text-slate-500 truncate">Data Struct & C++</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickPreset("WBCHSE Class 12 (Semester 3)", "Class 12 (Semester 3)", "Modern Computer Applications (COMA)", "Combinational Logic Circuits (Adder, Subtractor, MUX) & Networking", "Medium", 10)
            }
            className="p-3 rounded-2xl border border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50/50 text-left transition-all shadow-sm"
          >
            <p className="font-bold text-xs text-purple-900">Comp Application</p>
            <p className="text-[10px] text-slate-500 truncate">Logic Gates & Net</p>
          </button>
        </div>
      </div>

      {/* Main Generator Form */}
      <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-800">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Board / Exam */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Board / Exam
            </label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value as ExamBoard)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-900"
            >
              <option value="WBCHSE Class 12 (Semester 3)">WBCHSE Class 12 (Semester 3 Official)</option>
              <option value="WBCHSE (Class 11-12)">WBCHSE (Class 11-12 General)</option>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Class / Standard Level
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-900"
            >
              <option value="Class 12 (Semester 3)">Class 12 (Semester 3 - New Curriculum)</option>
              <option value="Class 12">Class 12 (Higher Secondary)</option>
              <option value="Class 11">Class 11 (Semester 1 & 2)</option>
              <option value="Class 10">Class 10 (Madhyamik)</option>
              <option value="Class 9">Class 9</option>
              <option value="Repeater / Dropper">Repeater / Dropper Batch</option>
            </select>
          </div>

          {/* Subject with Quick Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subject Name
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold">Strict Subject Isolation Active</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { name: "Mathematics", defaultTopic: "Matrices & Determinants" },
                { name: "Physics", defaultTopic: "Electrostatics & Gauss Law" },
                { name: "Chemistry", defaultTopic: "Solutions & Chemical Kinetics" },
                { name: "Biological Sciences", defaultTopic: "Genetics & Molecular Basis" },
                { name: "Computer Science", defaultTopic: "Data Structures & OOP" },
              ].map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setSubject(s.name);
                    setTopic(s.defaultTopic);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    subject.toLowerCase() === s.name.toLowerCase()
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, Physics, Chemistry..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 font-medium placeholder-slate-400"
              required
            />
          </div>

          {/* Topic / Chapter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Specific Chapter / Topic
            </label>
            {subject.toLowerCase().includes("math") && (
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  "Matrices & Determinants",
                  "Integrals & Definite Integrals",
                  "Differential Equations",
                  "Relations & Functions",
                  "Vectors & 3D Geometry",
                  "Probability",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      topic === t ? "bg-amber-100 text-amber-900 border-amber-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {subject.toLowerCase().includes("phys") && (
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  "Electrostatics & Gauss Law",
                  "Current Electricity",
                  "Electromagnetic Induction",
                  "Optics & Wave Optics",
                  "Modern Physics",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      topic === t ? "bg-indigo-100 text-indigo-900 border-indigo-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {subject.toLowerCase().includes("chem") && (
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  "Solutions & Colligative Properties",
                  "Chemical Kinetics & Rate Laws",
                  "Electrochemistry & Nernst Equation",
                  "Coordination Compounds & IUPAC",
                  "Haloalkanes & Haloarenes",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      topic === t ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {(subject.toLowerCase().includes("bio") || subject.toLowerCase().includes("life")) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  "Genetics & Mendelian Inheritance",
                  "Molecular Basis of Inheritance (DNA & RNA)",
                  "Reproduction in Flowering Plants",
                  "Human Reproduction",
                  "Biotechnology & Principles",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      topic === t ? "bg-rose-100 text-rose-900 border-rose-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Matrices, Electric Current, Chemical Kinetics..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 font-medium placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Row 2: Difficulty & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Difficulty Standard
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    difficulty === d
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {d === "Easy" ? "Normal (Easy)" : d}
                </button>
              ))}
            </div>
          </div>

          {/* Language Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Language Output
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                বাংলা মাধ্যম সাপোর্ট সক্রিয়
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Bengali", label: "বাংলা (Bengali)", desc: "100% Bengali Medium" },
                { id: "Bilingual", label: "Bilingual", desc: "বাংলা + English" },
                { id: "English", label: "English", desc: "English Only" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLanguage(item.id as LanguageMode)}
                  className={`py-2 px-2.5 rounded-xl text-center transition-all border ${
                    language === item.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className={`text-[9px] ${language === item.id ? "text-indigo-100" : "text-slate-400"}`}>
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real PYQ Source Filter */}
        {includePYQ && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Real Authentic Exam Question Source</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Verified Real PYQs
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "All (WBCHSE + JEE + WBJEE)",
                "WBCHSE 2019-2024 (HS Board)",
                "JEE Mains (2020-2024)",
                "WBJEE Joint Entrance",
              ].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPyqExamFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    pyqExamFilter === filter
                      ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                      : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/60"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Row 3: Question Count, Timer & Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
          {/* Number of Questions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question Count
              </label>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 Qs</span>
              <span>20 Qs</span>
              <span>30 Qs</span>
              <span className="font-bold text-indigo-600">40 Qs</span>
            </div>
          </div>

          {/* Timer Limit */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Test Timer Limit</span>
            </label>
            <select
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 font-medium"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Include Board PYQs
            </label>
            <div
              onClick={() => setIncludePYQ(!includePYQ)}
              className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                includePYQ
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Past Year Questions</span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold ${
                  includePYQ ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {includePYQ && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Question Types checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-white" />}
                  <span>{qType}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-3 transition-all disabled:opacity-60 cursor-pointer"
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
