import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Laptop,
  Cpu,
  BookMarked,
  Feather,
  FileCheck,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight,
  Mic,
  FileText,
  Layers,
  Search,
  Flame,
  Info,
  Download,
  Share2,
} from "lucide-react";
import {
  WBCHSE_SEM3_SUBJECTS,
  WBCHSE_SEM3_EXAM_INFO,
  Sem3Subject,
  Sem3Chapter,
} from "../data/wbchseSem3Syllabus";
import { MathRenderer } from "./MathRenderer";

interface WBCHSESem3HubProps {
  onSelectForMockTest: (subject: string, chapterName: string) => void;
  onSelectForNotes: (subject: string, chapterName: string) => void;
  onSelectForVoiceTutor?: (subject: string, chapterName: string) => void;
  onSelectForViva: (subject: string, chapterName: string) => void;
}

export const WBCHSESem3Hub: React.FC<WBCHSESem3HubProps> = ({
  onSelectForMockTest,
  onSelectForNotes,
  onSelectForViva,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("physics");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("phy-electrostatics-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"syllabus" | "formulas" | "omr_guide">("syllabus");

  const currentSubject =
    WBCHSE_SEM3_SUBJECTS.find((s) => s.id === selectedSubjectId) ||
    WBCHSE_SEM3_SUBJECTS[0];

  const currentChapter =
    currentSubject.chapters.find((c) => c.id === selectedChapterId) ||
    currentSubject.chapters[0];

  const renderSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Atom":
        return <Atom className="w-5 h-5" />;
      case "FlaskConical":
        return <FlaskConical className="w-5 h-5" />;
      case "Calculator":
        return <Calculator className="w-5 h-5" />;
      case "Dna":
        return <Dna className="w-5 h-5" />;
      case "Laptop":
        return <Laptop className="w-5 h-5" />;
      case "Cpu":
        return <Cpu className="w-5 h-5" />;
      case "BookMarked":
        return <BookMarked className="w-5 h-5" />;
      case "Feather":
        return <Feather className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Filter chapters based on search query
  const filteredSubjects = WBCHSE_SEM3_SUBJECTS.map((sub) => ({
    ...sub,
    chapters: sub.chapters.filter(
      (ch) =>
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.nameBengali.includes(searchQuery) ||
        ch.keyTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter((sub) => sub.chapters.length > 0 || searchQuery === "");

  return (
    <div id="wbchse-sem3-hub-root" className="space-y-8 pb-16">
      {/* Official Board Hero Header */}
      <section
        id="wbchse-sem3-hero"
        className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gradient-to-br from-indigo-600/30 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-gradient-to-tr from-amber-600/20 to-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs tracking-wider flex items-center space-x-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>WBCHSE CLASS 12 • SEMESTER 3 SPECIALIZED HUB</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              Official 4-Semester Curriculum (wbchse.wb.gov.in)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
            উচ্চ মাধ্যমিক সেমিস্টার ৩ (Class 12 Semester 3)
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              Complete Official Syllabus, OMR Mock Tests & AI Tutor
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            West Bengal Council of Higher Secondary Education (WBCHSE) new semester curriculum.
            Directly mapped to council syllabus units for <strong>Physics, Chemistry, Mathematics, Biology, Computer Science, English B, and Bengali</strong> with instant OMR mock papers, KaTeX formula derivations, and voice explanation!
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Theory Exam</span>
              <span className="text-lg font-black text-amber-400">40 Marks</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">OMR MCQ Share</span>
              <span className="text-lg font-black text-emerald-400">30% - 40%</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Negative Marking</span>
              <span className="text-lg font-black text-indigo-400">0 (No Penalty)</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Pass Criteria</span>
              <span className="text-lg font-black text-rose-400">30% Each</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "syllabus"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chapter & Topic Syllabus</span>
          </button>

          <button
            onClick={() => setActiveTab("formulas")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "formulas"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Formula Sheet & Key Concepts</span>
          </button>

          <button
            onClick={() => setActiveTab("omr_guide")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "omr_guide"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>WBCHSE OMR Exam Guide</span>
          </button>
        </div>

        {/* Live Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or chapter..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* TAB 1: CHAPTER & TOPIC SYLLABUS HUB */}
      {activeTab === "syllabus" && (
        <div className="space-y-6">
          {/* Subject Horizontal Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {WBCHSE_SEM3_SUBJECTS.map((sub) => {
              const isActive = sub.id === selectedSubjectId;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setSelectedChapterId(sub.chapters[0]?.id || "");
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    isActive
                      ? "bg-slate-900 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`p-2 rounded-xl ${
                        isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {renderSubjectIcon(sub.iconName)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-indigo-500/30 text-indigo-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sub.chapters.length} Ch
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs leading-tight line-clamp-1">{sub.name}</h3>
                    <p className={`text-[10px] truncate ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                      {sub.nameBengali}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chapter Details & Interactive Action Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Chapters List */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {currentSubject.name} Chapters ({currentSubject.chapters.length})
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  Sem 3 Weightage: ~{currentSubject.theoryMarks} Marks
                </span>
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {currentSubject.chapters.map((ch, idx) => {
                  const isSelected = ch.id === currentChapter.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapterId(ch.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              isSelected
                                ? "bg-white/20 text-indigo-100"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ch.unit}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm leading-snug">
                            {idx + 1}. {ch.name}
                          </h4>
                          <p
                            className={`text-xs ${
                              isSelected ? "text-indigo-100 font-medium" : "text-slate-500"
                            }`}
                          >
                            {ch.nameBengali}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? "bg-amber-400 text-slate-950"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {ch.weightageMarks}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep Chapter Breakdown & Quick Actions */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Chapter Header */}
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                    {currentChapter.unit}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      Weightage: {currentChapter.weightageMarks}
                    </span>
                    {currentChapter.pyqYears && currentChapter.pyqYears.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        PYQ: {currentChapter.pyqYears.join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentChapter.name}
                </h2>
                <h3 className="text-sm font-semibold text-slate-600">
                  {currentChapter.nameBengali}
                </h3>
              </div>

              {/* 4 Super Quick 1-Click Action Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant 1-Click Launch for this Chapter:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      onSelectForMockTest(currentSubject.name, currentChapter.name)
                    }
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Start Sem 3 OMR Mock Test</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      onSelectForNotes(currentSubject.name, currentChapter.name)
                    }
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-300" />
                      <span>Generate Notes, Tricks & PDF</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab("formulas")}
                    className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs flex items-center justify-between border border-slate-800 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>View Key Formulas & Equations</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() =>
                      onSelectForViva(currentSubject.name, currentChapter.name)
                    }
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between border border-slate-200 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4 text-rose-500" />
                      <span>Oral Viva & Reasoning</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Official Syllabus Topic Bullets */}
              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>WBCHSE Official Syllabus Topics (wbchse.wb.gov.in):</span>
                </h4>
                <ul className="space-y-2">
                  {currentChapter.keyTopics.map((topic, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div className="leading-relaxed">
                        <MathRenderer text={topic} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulas & Equations in KaTeX */}
              {currentChapter.keyFormulas && currentChapter.keyFormulas.length > 0 && (
                <div className="space-y-3 bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calculator className="w-4 h-4 text-amber-600" />
                    <span>Essential Formulas & KaTeX Equations:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentChapter.keyFormulas.map((formula, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-xl border border-amber-200 text-xs font-mono shadow-sm overflow-x-auto"
                      >
                        <MathRenderer text={`$$${formula}$$`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Viva Question */}
              {currentChapter.vivaSampleQuestion && (
                <div className="space-y-2 bg-rose-50/60 rounded-2xl p-4 border border-rose-200/80">
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Mic className="w-4 h-4 text-rose-600" />
                    <span>Official Practical / Viva Sample Question:</span>
                  </h4>
                  <div className="text-xs text-rose-950 font-medium leading-relaxed italic">
                    <MathRenderer text={`"${currentChapter.vivaSampleQuestion}"`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORMULA CHEAT SHEET & QUICK CONCEPT VAULT */}
      {activeTab === "formulas" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-3 shadow-xl">
            <h2 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-amber-400" />
              <span>WBCHSE Class 12 Sem 3 Formula & Derivation Vault</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete formula handbook with LaTeX KaTeX representations for fast problem solving in Physics, Chemistry and Mathematics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WBCHSE_SEM3_SUBJECTS.filter(s => s.chapters.some(c => c.keyFormulas && c.keyFormulas.length > 0)).map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                    {renderSubjectIcon(sub.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{sub.name}</h3>
                    <span className="text-[11px] text-indigo-600 font-semibold">{sub.nameBengali}</span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {sub.chapters.map((ch) => {
                    if (!ch.keyFormulas || ch.keyFormulas.length === 0) return null;
                    return (
                      <div key={ch.id} className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800">{ch.name}</span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                            {ch.weightageMarks}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {ch.keyFormulas.map((f, i) => (
                            <div key={i} className="bg-white p-2 rounded-xl border border-slate-200 text-xs overflow-x-auto font-mono">
                              <MathRenderer text={`$$${f}$$`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WBCHSE OMR EXAM FORMAT GUIDE */}
      {activeTab === "omr_guide" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 shadow-xl">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs inline-block">
              WBCHSE Official Guidelines 2025-2027
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              WBCHSE Class 12 Semester 3 Exam Pattern & OMR Rules
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Official circular details from West Bengal Council of Higher Secondary Education on Optical Mark Recognition (OMR) sheets, question varieties, marks weighting, and answering guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OMR Dos and Don'ts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2 text-indigo-600">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <span>OMR Sheet Answering Rules (ওএমআর নিয়মাবলী)</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pen Allowed:</strong> Only Blue or Black ballpoint pens. Gel pens, ink pens, or pencils are strictly prohibited on OMR sheets.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Complete Darkening:</strong> Darken the complete circle evenly. Do not put ticks (✓), crosses (✗), or faint dots.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>No Overwriting / Whitener:</strong> Do not use correcting fluid, blade scraping, or erase bubbles. Multiple bubbles per question will be marked invalid.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>No Negative Marking:</strong> There is 0 negative marking for wrong answers. Attempt all questions confidently.</span>
                </li>
              </ul>
            </div>

            {/* Question Breakdown & Cognitive Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2 text-emerald-600">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Difficulty & Cognitive Distribution</span>
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Direct / Basic Concept MCQs</span>
                    <span className="text-emerald-600">50%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[50%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Moderate / Formula Application MCQs</span>
                    <span className="text-indigo-600">30%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[30%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>High Achiever / Analytical Reasoning MCQs</span>
                    <span className="text-amber-600">20%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[20%]" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">MCQ Format Varieties Included:</p>
                <p className="text-[11px] text-amber-800">
                  Direct selection, Assertion-Reasoning ($A$ & $R$), Column Match type ($I$ to $II$), Diagram/Circuit-based reasoning, and Statement truth validation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
