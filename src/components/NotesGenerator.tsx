import React, { useState } from "react";
import {
  FileText,
  Youtube,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  Globe,
  BookOpen,
  Zap,
  AlertCircle,
  Layers,
  Flame,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Hash,
  Sliders,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { StudyNote, LanguageMode } from "../types";
import { exportNotesToPDF } from "../utils/pdfExport";
import { MathRenderer } from "./MathRenderer";
import { GenerationLoadingModal } from "./GenerationLoadingModal";

interface NotesGeneratorProps {
  customApiKey: string;
  selectedModel?: string;
  initialSubject?: string;
  initialTopic?: string;
}

const PAGE_COUNT_OPTIONS = [
  { id: "1 Page (Quick Exam Snapshot & Formulas)", label: "1 Page (Quick Summary)", desc: "Essential formulas & definitions" },
  { id: "2-3 Pages (Standard High-Yield Chapter)", label: "2-3 Pages (Standard)", desc: "Balanced theory, derivations & PYQs" },
  { id: "4-6 Pages (Comprehensive Chapter Handbook)", label: "4-6 Pages (Detailed Handbook)", desc: "In-depth theory, all theorem proofs & examples" },
  { id: "8-12+ Pages (Full Authentic Master Textbook / সম্পূর্ণ বইয়ের অধ্যায়)", label: "8-12+ Pages (Master Textbook Chapter)", desc: "Exhaustive textbook chapter with all subtopics, proofs & PYQ solutions" },
  { id: "15+ Pages (Complete Research & Board Master Volume)", label: "15+ Pages (Complete Master Volume)", desc: "Deepest academic compendium with full derivations" },
];

const DETAIL_DEPTH_OPTIONS = [
  {
    id: "Full Textbook Chapter with Detailed Theory, Subsections, Rigorous Proofs & Solved Examples",
    label: "📖 Full Textbook Edition (বইয়ের মতো পূর্ণাঙ্গ অধ্যায়)",
    desc: "Complete textbook narrative: theory, subtopics, step-by-step proofs, conditions & worked examples",
  },
  {
    id: "Deep Dive with All Theorem Proofs & Step-by-Step Derivations",
    label: "📐 Mathematical Rigor & Derivations (গাণিতিক প্রতিপাদন)",
    desc: "Every intermediate calculus/algebra step formatted in KaTeX $...$ & $$...$$",
  },
  {
    id: "High-Yield Exam Focus with PYQs, Marking Schemes & Shortcut Tricks",
    label: "🎯 Board & JEE Exam Focus (বিগত বছরের সমাধান ও শর্টকাট)",
    desc: "Targeted for WBCHSE / JEE scoring with real past questions & rapid elimination tricks",
  },
  {
    id: "Formula Mastery, Dimensional Analysis, Limiting Cases & Numerical Solutions",
    label: "⚡ Formula Rigor, Units, Dimensions & Numericals",
    desc: "Units, dimensional analysis, limiting conditions & worked numerical problems",
  },
];

const QUICK_DETAIL_CHIPS = [
  "বইয়ের মতো প্রতিটি উপপাদ্যের পুঙ্খানুপুঙ্খ প্রমাণ (Step-by-Step Proofs)",
  "প্রতিটি সূত্রের একক, মাত্রা, সীমাবদ্ধতা ও শর্তাবলি (Units, Dimensions & Conditions)",
  "বিগত ৫ বছরের উচ্চমাধ্যমিক ও JEE সমাধানকৃত গাণিতিক সমস্যা (Solved PYQ Numericals)",
  "পরীক্ষায় সচরাচর যে ভুলগুলো হয় ও সতর্কবার্তা (Common Pitfalls & Traps)",
  "শর্টকাট ট্রিক ও দ্রুত এলিমিনেশন কৌশল (Rapid Elimination Shortcuts)",
];

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({ 
  customApiKey, 
  selectedModel,
  initialSubject,
  initialTopic,
}) => {
  const [inputType, setInputType] = useState<"youtube" | "text" | "pdf">(initialTopic ? "text" : "youtube");
  const [sourceContent, setSourceContent] = useState(
    initialTopic ? `WBCHSE Class 12 Semester 3: ${initialSubject || ""} - ${initialTopic}` : ""
  );
  const [subject, setSubject] = useState(initialSubject || "Mathematics");
  const [board, setBoard] = useState("WBCHSE Class 12 (Semester 3)");
  const [noteStyle, setNoteStyle] = useState<string>("detailed");
  const [targetLanguage, setTargetLanguage] = useState<LanguageMode>("Bengali");
  
  // Custom Granular Controls - Defaulted to Full Authentic Master Textbook
  const [pageCount, setPageCount] = useState<string>("8-12+ Pages (Full Authentic Master Textbook / সম্পূর্ণ বইয়ের অধ্যায়)");
  const [detailDepth, setDetailDepth] = useState<string>("Full Textbook Chapter with Detailed Theory, Subsections, Rigorous Proofs & Solved Examples");
  const [customInstructions, setCustomInstructions] = useState<string>("বইয়ের মতো প্রতিটি উপপাদ্যের পুঙ্খানুপুঙ্খ প্রমাণ, সূত্রের শর্তাবলি, এবং বিগত বছরের সমাধান যোগ করো।");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<StudyNote | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Active flashcard index
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleExportPDF = async () => {
    if (!generatedNote) return;
    setIsExportingPDF(true);
    try {
      await exportNotesToPDF(generatedNote);
    } catch (e) {
      console.error("PDF Notes export error:", e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSourceContent(text || `Uploaded File: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceContent.trim()) {
      setError("Please provide a YouTube video URL, chapter topic, or file content.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedNote(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customApiKey && customApiKey.trim().length > 5) {
        headers["x-custom-gemini-key"] = customApiKey.trim();
      }
      if (selectedModel) {
        headers["x-gemini-model"] = selectedModel;
      }

      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers,
        body: JSON.stringify({
          inputType,
          sourceContent,
          noteStyle,
          targetLanguage,
          subject,
          board,
          pageCount,
          detailDepth,
          customInstructions,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.notes) {
        throw new Error(data.error || "Failed to generate study notes.");
      }

      const note: StudyNote = {
        id: `note_${Date.now()}`,
        title: data.notes.title || `${subject} Master Notes`,
        subject: data.notes.subject || subject,
        board: data.notes.board || board,
        language: data.notes.language || targetLanguage,
        pageCount: data.notes.pageCount || pageCount,
        detailDepth: data.notes.detailDepth || detailDepth,
        overview: data.notes.overview || "",
        sections: data.notes.sections || [],
        keyFormulaeAndDefs: data.notes.keyFormulaeAndDefs || [],
        shortTricks: data.notes.shortTricks || [],
        shortRevisionPoints: data.notes.shortRevisionPoints || [],
        flashcards: data.notes.flashcards || [],
        practiceQuestions: data.notes.practiceQuestions || [],
        createdAt: new Date().toISOString(),
      };

      setGeneratedNote(note);
      setCardIdx(0);
      setIsFlipped(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedNote) return;
    const textToCopy = `${generatedNote.title}\n\nOverview:\n${generatedNote.overview}\n\n` +
      generatedNote.sections.map((s) => `### ${s.heading}\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="notes-generator-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Animated Loading Overlay */}
      <GenerationLoadingModal
        isOpen={loading}
        title="Synthesizing Comprehensive Master Study Notes..."
        subtitle="Formatting all mathematical proofs in LaTeX KaTeX, structuring derivations & generating textbook PDF layout."
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>WBCHSE / JEE Master Notes &amp; PDF Generator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Comprehensive Study Notes, Formulas &amp; Derivations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Generate detailed multi-page textbook notes with step-by-step theorem proofs, crystal-clear KaTeX equations, real PYQ numerical solutions, and premium PDF exports.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2 bg-sky-500/10 border border-sky-500/30 px-3 py-2 rounded-xl text-xs text-sky-300">
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Authentic Bengali (বাংলা) &amp; English</span>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs text-emerald-300">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Custom Page Count &amp; Depth Controls</span>
          </div>
        </div>
      </div>

      {/* WBCHSE Sem 3 One-Click Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>WBCHSE Sem 3 Official Syllabus 1-Click Fill</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => {
              setInputType("text");
              setSubject("Mathematics");
              setBoard("WBCHSE Class 12 (Semester 3)");
              setSourceContent("WBCHSE Class 12 Semester 3 Mathematics: Matrices (Types, Operations, Transpose, Symmetric/Skew-symmetric, Adjoint, Inverse using Matrix Inversion Method, System of Linear Equations solving)");
              setPageCount("3-5 Pages (Deep Dive Comprehensive Notes)");
              setDetailDepth("Deep Dive with All Theorem Proofs & Step-by-Step Derivations");
            }}
            className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-all shadow-xs"
          >
            <p className="font-bold text-xs text-amber-950">Sem 3 Math</p>
            <p className="text-[10px] text-amber-700 truncate">Matrices &amp; Inverse</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputType("text");
              setSubject("Physics");
              setBoard("WBCHSE Class 12 (Semester 3)");
              setSourceContent("WBCHSE Class 12 Semester 3 Physics Unit 1: Electrostatics, Coulomb's Law, Electric Field & Dipole, Gauss's Theorem and its Applications, Electric Potential & Capacitors with Dielectrics");
              setPageCount("3-5 Pages (Deep Dive Comprehensive Notes)");
              setDetailDepth("Deep Dive with All Theorem Proofs & Step-by-Step Derivations");
            }}
            className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100 text-left transition-all shadow-xs"
          >
            <p className="font-bold text-xs text-sky-950">Sem 3 Physics</p>
            <p className="text-[10px] text-sky-700 truncate">Electrostatics &amp; Gauss</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputType("text");
              setSubject("Chemistry");
              setBoard("WBCHSE Class 12 (Semester 3)");
              setSourceContent("WBCHSE Class 12 Semester 3 Chemistry: Solutions (Raoult's Law, Colligative Properties, Van't Hoff Factor, Elevation of Boiling Point, Depression of Freezing Point, Osmotic Pressure) & Electrochemistry (Nernst Equation)");
              setPageCount("3-5 Pages (Deep Dive Comprehensive Notes)");
              setDetailDepth("Deep Dive with All Theorem Proofs & Step-by-Step Derivations");
            }}
            className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-left transition-all shadow-xs"
          >
            <p className="font-bold text-xs text-teal-950">Sem 3 Chemistry</p>
            <p className="text-[10px] text-teal-700 truncate">Solutions &amp; Nernst</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputType("text");
              setSubject("Biological Sciences");
              setBoard("WBCHSE Class 12 (Semester 3)");
              setSourceContent("WBCHSE Class 12 Semester 3 Biology: Sexual Reproduction in Flowering Plants (Microsporogenesis, Megasporogenesis, Double Fertilization, Endosperm development) & Human Reproduction");
              setPageCount("3-5 Pages (Deep Dive Comprehensive Notes)");
            }}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-left transition-all shadow-xs"
          >
            <p className="font-bold text-xs text-rose-950">Sem 3 Biology</p>
            <p className="text-[10px] text-rose-700 truncate">Reproduction &amp; Embryo</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputType("text");
              setSubject("Computer Science (COMS)");
              setBoard("WBCHSE Class 12 (Semester 3)");
              setSourceContent("WBCHSE Class 12 Semester 3 Computer Science: Data Structures (Arrays, Linked Lists, Stacks, Queues with C++ implementation algorithms) & Object-Oriented Programming");
              setPageCount("3-5 Pages (Deep Dive Comprehensive Notes)");
            }}
            className="p-2.5 rounded-xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100 text-left transition-all shadow-xs"
          >
            <p className="font-bold text-xs text-cyan-950">Computer Science</p>
            <p className="text-[10px] text-cyan-700 truncate">Data Struct &amp; C++</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputType("text");
              setSubject("Modern Computer Applications (COMA)");
              setBoard("WBCHSE Class 12 (Semester 3)");
              setSourceContent("WBCHSE Class 12 Semester 3 Computer Applications: Combinational Logic Circuits (Half/Full Adder, Subtractor, Multiplexer, Demultiplexer, Decoder, Encoder) & Karnaugh Maps (K-Maps)");
              setPageCount("3-5 Pages (Deep Dive Comprehensive Notes)");
            }}
            className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left transition-all shadow-xs"
          >
            <p className="font-bold text-xs text-purple-950">Comp Application</p>
            <p className="text-[10px] text-purple-700 truncate">Adders &amp; MUX</p>
          </button>
        </div>
      </div>

      {/* Input & Detailed Config Form */}
      <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Type Selector Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Select Source Input Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setInputType("youtube")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                inputType === "youtube"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube Video URL</span>
            </button>

            <button
              type="button"
              onClick={() => setInputType("text")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                inputType === "text"
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Chapter Topic / Text</span>
            </button>

            <button
              type="button"
              onClick={() => setInputType("pdf")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                inputType === "pdf"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>File / Syllabus PDF</span>
            </button>
          </div>
        </div>

        {/* Source Content Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            {inputType === "youtube" && "Paste YouTube Video Link or Class Title"}
            {inputType === "text" && "Topic, Chapter Summary, or Syllabus Concepts to Detail"}
            {inputType === "pdf" && "Upload Document or Paste Syllabus Content"}
          </label>

          {inputType === "pdf" && (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Upload .txt or document:</span>
              <input type="file" onChange={handleFileUpload} accept=".txt,.pdf,.doc,.docx" className="text-xs" />
            </div>
          )}

          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            rows={3}
            placeholder={
              inputType === "youtube"
                ? "e.g. https://www.youtube.com/watch?v=... or 'WBCHSE Class 12 Matrices Full Concept'"
                : "Enter topic (e.g. 'WBCHSE Class 12 Matrices: Invertibility, Cramer's Rule, Cayley-Hamilton Theorem & Step-by-Step Derivations')..."
            }
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 bg-slate-50 font-medium"
            required
          />
        </div>

        {/* User-Requested Granular Control: Page Length & Target Range */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase flex items-center space-x-1.5">
              <Hash className="w-4 h-4 text-sky-600" />
              <span>Target Page Length (কতো পৃষ্ঠা পর্যন্ত নোট চান)</span>
            </label>
            <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              {pageCount.split("(")[0]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PAGE_COUNT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPageCount(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  pageCount === opt.id
                    ? "bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-950"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {pageCount === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* User-Requested Granular Control: Detail Depth */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Note Detail Depth &amp; Mathematical Rigor (কতোটা ডিটেইলসে চান)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DETAIL_DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDetailDepth(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  detailDepth === opt.id
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {detailDepth === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Custom Details & Proofs Textarea */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Specific Proofs, Equations, or Extra Topics to Detail (ঐচ্ছিক স্পেসিফিক নির্দেশিকা):
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Include step-by-step proof of Cayley-Hamilton theorem, 2023 WBCHSE 4-mark question, and dimensional analysis..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_DETAIL_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!customInstructions.includes(chip)) {
                      setCustomInstructions((prev) => (prev ? `${prev}; ${chip}` : chip));
                    }
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 transition-all"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Basic Metadata Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, Physics..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Board / Target Exam</label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
            >
              <option value="WBCHSE Class 12 (Semester 3)">WBCHSE Class 12 (Semester 3)</option>
              <option value="WBCHSE Class 12 (Semester 4)">WBCHSE Class 12 (Semester 4)</option>
              <option value="WBCHSE Class 11 (Semester 1 & 2)">WBCHSE Class 11</option>
              <option value="WBBSE Class 10 (Madhyamik)">WBBSE Class 10 (Madhyamik)</option>
              <option value="WBJEE & JEE Main">WBJEE &amp; JEE Main</option>
              <option value="NEET UG">NEET UG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Output Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as LanguageMode)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 text-slate-800"
            >
              <option value="Bengali">বাংলা (Pure Academic Bengali)</option>
              <option value="Bilingual">Bilingual (English + Bengali)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {/* Generate CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 via-emerald-600 to-sky-700 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-base shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Detailed Master Notes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate Master Notes &amp; Premium PDF Now</span>
            </>
          )}
        </button>
      </form>

      {/* Render Generated Notes */}
      {generatedNote && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  {generatedNote.subject} • {generatedNote.language}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {generatedNote.pageCount || "Multi-Page Handbook"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {generatedNote.title}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Premium PDF Handbook</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Overview */}
          {generatedNote.overview && (
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
              <h3 className="font-bold text-sky-950 text-sm flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Chapter Executive Concept Map &amp; Theoretical Overview (সামগ্রিক ধারণা)</span>
              </h3>
              <MathRenderer
                text={generatedNote.overview}
                className="text-xs sm:text-sm text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {/* Main Topic Sections */}
          <div className="space-y-6">
            {generatedNote.sections.map((sec, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{sec.heading}</span>
                </h3>

                <div>
                  <MathRenderer
                    text={sec.content}
                    className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2"
                  />
                </div>

                {/* Step-by-Step Derivation Steps (if available) */}
                {sec.derivationSteps && sec.derivationSteps.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step-by-Step Mathematical Proof &amp; Derivation (ধাপভিত্তিক গাণিতিক প্রমাণ)</span>
                    </h4>
                    <div className="space-y-1.5">
                      {sec.derivationSteps.map((step, sIdx) => (
                        <div key={sIdx} className="text-xs text-emerald-950 flex items-start space-x-2 bg-white/70 p-2 rounded-lg border border-emerald-100">
                          <span className="font-extrabold text-emerald-700 shrink-0">Step {sIdx + 1}:</span>
                          <div className="flex-1">
                            <MathRenderer text={step} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real Exam Worked Example (if available) */}
                {sec.realExamExample && (
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
                    <div className="font-bold text-sky-900 uppercase tracking-wider text-[11px]">
                      📝 High-Yield Worked Example:
                    </div>
                    <MathRenderer text={sec.realExamExample} />
                  </div>
                )}

                {/* Key Takeaways */}
                {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase">
                      💡 High-Yield Key Points:
                    </div>
                    {sec.keyTakeaways.map((pt, pIdx) => (
                      <div key={pIdx} className="text-xs text-slate-800 font-medium flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <MathRenderer text={pt} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exam Short Tricks & Fast Elimination Techniques */}
          {generatedNote.shortTricks && generatedNote.shortTricks.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 border border-amber-500/40 text-white space-y-4 shadow-md">
              <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>WBCHSE &amp; JEE Exam Shortcut Tricks (পরীক্ষার শর্ট ট্রিক ও সহজ সমাধান)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedNote.shortTricks.map((trick, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <h4 className="font-bold text-xs text-amber-200">{trick.trickTitle}</h4>
                    </div>
                    {trick.conceptOrFormula && (
                      <div className="text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="font-bold text-amber-400/90">Formula / Rule: </span>
                        <MathRenderer text={trick.conceptOrFormula} inline />
                      </div>
                    )}
                    <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 space-y-1">
                      <span className="font-bold text-emerald-400 block">⚡ Fast Shortcut Method:</span>
                      <MathRenderer text={trick.shortcutMethod} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Formulae, Units & Important Definitions */}
          {generatedNote.keyFormulaeAndDefs && generatedNote.keyFormulaeAndDefs.length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-4">
              <h3 className="font-bold text-amber-950 text-sm flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Master Formula Reference &amp; Dimension Sheet (সূত্রাবলি ও একক)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedNote.keyFormulaeAndDefs.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-amber-200 space-y-2 shadow-xs">
                    <div className="font-bold text-sm text-slate-900">
                      <MathRenderer text={item.termOrFormula} inline />
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <MathRenderer text={item.explanation} />
                    </div>
                    {item.unitOrDimension && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-300 text-[10px] font-bold text-amber-900">
                        Unit/Dim: {item.unitOrDimension}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Exam Solved Practice Questions */}
          {generatedNote.practiceQuestions && generatedNote.practiceQuestions.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>High-Yield Real Exam Questions &amp; Step-by-Step Solutions (মডেল প্রশ্নোত্তর)</span>
              </h3>
              <div className="space-y-3">
                {generatedNote.practiceQuestions.map((qna, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900 flex-1">
                        <span className="text-sky-600 font-extrabold mr-1">Q{idx + 1}:</span>
                        <MathRenderer text={qna.question} inline />
                      </div>
                      {qna.pyqTag && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold shrink-0">
                          {qna.pyqTag}
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs text-emerald-950 space-y-1">
                      <span className="font-bold text-emerald-800 block text-[11px]">Step-by-Step Solution:</span>
                      <MathRenderer text={qna.answer} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flashcards Section */}
          {generatedNote.flashcards && generatedNote.flashcards.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Interactive Flashcards ({cardIdx + 1} of {generatedNote.flashcards.length})</span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setCardIdx((prev) => Math.max(0, prev - 1));
                      setIsFlipped(false);
                    }}
                    disabled={cardIdx === 0}
                    className="px-3 py-1 rounded-lg border text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      setCardIdx((prev) => Math.min(generatedNote.flashcards!.length - 1, prev + 1));
                      setIsFlipped(false);
                    }}
                    disabled={cardIdx === generatedNote.flashcards.length - 1}
                    className="px-3 py-1 rounded-lg border text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Flashcard Component */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer bg-slate-900 text-white rounded-2xl p-8 text-center min-h-[160px] flex flex-col items-center justify-center space-y-3 shadow-md hover:scale-[1.01] transition-all"
              >
                <span className="text-[10px] uppercase font-bold text-sky-400">
                  {isFlipped ? "Answer (Click to Flip Back)" : "Question (Click Card to Reveal Answer)"}
                </span>
                <MathRenderer
                  text={
                    isFlipped
                      ? generatedNote.flashcards[cardIdx].back
                      : generatedNote.flashcards[cardIdx].front
                  }
                  className="text-sm sm:text-base font-bold text-slate-100"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
