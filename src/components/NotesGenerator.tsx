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
  HelpCircle,
  Zap,
  AlertCircle,
  RotateCw,
  Layers,
  Flame,
  Loader2,
} from "lucide-react";
import { StudyNote, LanguageMode } from "../types";
import { exportNotesToPDF } from "../utils/pdfExport";
import { MathRenderer } from "./MathRenderer";
import { GenerationLoadingModal } from "./GenerationLoadingModal";

interface NotesGeneratorProps {
  customApiKey: string;
  selectedModel?: string;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({ customApiKey, selectedModel }) => {
  const [inputType, setInputType] = useState<"youtube" | "text" | "pdf">("youtube");
  const [sourceContent, setSourceContent] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [noteStyle, setNoteStyle] = useState<string>("detailed");
  const [targetLanguage, setTargetLanguage] = useState<LanguageMode>("Bengali");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<StudyNote | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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

  // Active flashcard index
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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
      setError("Please provide a YouTube video URL, text, or file content.");
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
        }),
      });

      const data = await res.json();
      if (!data.success || !data.notes) {
        throw new Error(data.error || "Failed to generate study notes.");
      }

      const note: StudyNote = {
        id: `note_${Date.now()}`,
        title: data.notes.title || "AI Generated Study Notes",
        subject: data.notes.subject || subject,
        language: data.notes.language || targetLanguage,
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
        title="Synthesizing Detailed Video & PDF Notes..."
        subtitle="Extracting complete syllabus concepts, KaTeX formulas & exam short tricks."
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>AI Notes & Revision Generator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            YouTube Video, PDF & Link to Notes Creator
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Convert YouTube videos, text or documents into structured Bengali (বাংলা) or English notes, key formula sheets, flashcards, and instant PDF downloads.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs text-emerald-300">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Dual Bengali (বাংলা) & English Support</span>
        </div>
      </div>

      {/* Input & Config Form */}
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
              <span>YouTube URL</span>
            </button>

            <button
              type="button"
              onClick={() => setInputType("text")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                inputType === "text"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Text / Chapter</span>
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
              <span>File / PDF</span>
            </button>
          </div>
        </div>

        {/* Source Content Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            {inputType === "youtube" && "Paste YouTube Video Link or Title"}
            {inputType === "text" && "Paste Text, Syllabus Notes, or Chapter Content"}
            {inputType === "pdf" && "Upload PDF/Text Document or Paste Text"}
          </label>

          {inputType === "pdf" && (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Upload .txt or text file:</span>
              <input type="file" onChange={handleFileUpload} accept=".txt,.pdf,.doc,.docx" className="text-xs" />
            </div>
          )}

          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            rows={4}
            placeholder={
              inputType === "youtube"
                ? "e.g. https://www.youtube.com/watch?v=... or 'WBBSE Class 10 Life Science Photosynthesis Full Chapter'"
                : "Paste your chapter summary, lecture transcript, or study material here..."
            }
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
            required
          />
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics, Chemistry..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note Format</label>
            <select
              value={noteStyle}
              onChange={(e) => setNoteStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
            >
              <option value="detailed">Comprehensive Notes & Explanations</option>
              <option value="short_notes">Short Revision Sheet & Formulas</option>
              <option value="flashcards">Flashcards & Rapid Recall</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Output Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as LanguageMode)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 text-slate-800"
            >
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="English">English</option>
              <option value="Bilingual">Bilingual (English + Bengali)</option>
            </select>
          </div>
        </div>

        {/* Generate CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Bengali & English Notes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate AI Notes & PDF Now</span>
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
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {generatedNote.subject} • {generatedNote.language}
              </span>
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
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-60"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Overview */}
          {generatedNote.overview && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Executive Overview Summary</span>
              </h3>
              <MathRenderer
                text={generatedNote.overview}
                className="text-xs sm:text-sm text-slate-700 leading-relaxed"
              />
            </div>
          )}

          {/* Main Topic Sections */}
          <div className="space-y-6">
            {generatedNote.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{sec.heading}</span>
                </h3>

                <div className="pl-8">
                  <MathRenderer
                    text={sec.content}
                    className="text-xs sm:text-sm text-slate-700 leading-relaxed"
                  />
                </div>

                {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                  <div className="ml-8 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                    {sec.keyTakeaways.map((pt, pIdx) => (
                      <div key={pIdx} className="text-xs text-emerald-900 font-medium flex items-start space-x-1">
                        <span className="text-emerald-600 font-bold">•</span>
                        <MathRenderer text={pt} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exam Short Tricks & Fast Elimination Techniques (শর্ট ট্রিক ও সহজ সমাধান কৌশল) */}
          {generatedNote.shortTricks && generatedNote.shortTricks.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 border border-amber-500/40 text-white space-y-4 shadow-md">
              <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Exam Short Tricks & Mnemonics (শর্ট ট্রিক ও সহজ সমাধান কৌশল)</span>
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
                        <span className="font-bold text-amber-400/90">Standard Method: </span>
                        <MathRenderer text={trick.conceptOrFormula} inline />
                      </div>
                    )}
                    <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 space-y-1">
                      <span className="font-bold text-emerald-400 block">⚡ Fast Shortcut Trick:</span>
                      <MathRenderer text={trick.shortcutMethod} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Formulae & Important Definitions */}
          {generatedNote.keyFormulaeAndDefs && generatedNote.keyFormulaeAndDefs.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
              <h3 className="font-bold text-amber-950 text-sm flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Key Formulae & Important Definitions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedNote.keyFormulaeAndDefs.map((item, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                    <div className="font-bold text-xs text-slate-900">
                      <MathRenderer text={item.termOrFormula} inline />
                    </div>
                    <div className="text-xs text-slate-600">
                      <MathRenderer text={item.explanation} />
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
                <span className="text-[10px] uppercase font-bold text-indigo-400">
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
