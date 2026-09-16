import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  FileText,
  HelpCircle,
  Tag,
  Layers,
  Loader2,
  Flag,
  Grid,
  Check,
  Eye,
  BarChart2,
  Flame,
} from "lucide-react";
import { QuizTest, TestResult } from "../types";
import { exportTestToPDF } from "../utils/pdfExport";
import { MathRenderer } from "./MathRenderer";

interface ActiveMockTestProps {
  test: QuizTest;
  onFinishTest: (result: TestResult) => void;
  onExit: () => void;
  customApiKey?: string;
}

export const ActiveMockTest: React.FC<ActiveMockTestProps> = ({
  test,
  onFinishTest,
  onExit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showOMRDrawer, setShowOMRDrawer] = useState(true);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportTestToPDF(test, testResult || undefined);
    } catch (e) {
      console.error("PDF Export error:", e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Timer state
  const totalSeconds = (test.timerMinutes || 0) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  useEffect(() => {
    if (isSubmitted || totalSeconds === 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          doSubmitTest(); // Auto-submit when timer expires
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, totalSeconds]);

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => {
      // Toggle or set
      if (prev[qId] === String(optIdx)) {
        const next = { ...prev };
        delete next[qId];
        return next;
      }
      return {
        ...prev,
        [qId]: String(optIdx),
      };
    });
  };

  const handleTextAnswer = (qId: string, text: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Helper to normalize answer indices ("0", "A", option text, etc.)
  const normalizeAns = (ans: string | undefined, options?: string[]): string => {
    if (!ans) return "";
    const trimmed = String(ans).trim();
    if (/^[0-3]$/.test(trimmed)) return trimmed;
    const upper = trimmed.toUpperCase();
    if (upper === "A" || upper === "OPTION A" || upper === "OPTION 1") return "0";
    if (upper === "B" || upper === "OPTION B" || upper === "OPTION 2") return "1";
    if (upper === "C" || upper === "OPTION C" || upper === "OPTION 3") return "2";
    if (upper === "D" || upper === "OPTION D" || upper === "OPTION 4") return "3";
    if (options && options.length > 0) {
      const idx = options.findIndex((opt) => opt.trim().toLowerCase() === trimmed.toLowerCase());
      if (idx !== -1) return String(idx);
    }
    return trimmed.toLowerCase();
  };

  const doSubmitTest = () => {
    if (isSubmitted) return;
    setShowSubmitConfirm(false);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    test.questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      if (userAns === undefined || userAns.trim() === "") {
        unansweredCount++;
      } else {
        const normUser = normalizeAns(userAns, q.options);
        const normCorrect = normalizeAns(q.correctAnswer, q.options);
        if (normUser === normCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const scorePercentage = Math.round((correctCount / test.questions.length) * 100);

    const result: TestResult = {
      id: `res_${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      board: test.board,
      subject: test.subject,
      topic: test.topic,
      totalQuestions: test.questions.length,
      correctCount,
      wrongCount,
      unansweredCount,
      scorePercentage,
      timeSpentSeconds: totalSeconds > 0 ? totalSeconds - secondsRemaining : timeSpentSeconds,
      userAnswers,
      completedAt: new Date().toISOString(),
    };

    setTestResult(result);
    setIsSubmitted(true);
    onFinishTest(result);

    // Trigger celebratory confetti if score >= 50%
    if (scorePercentage >= 50) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsSubmitted(false);
    setTestResult(null);
    setCurrentIdx(0);
    setSecondsRemaining(totalSeconds);
    setTimeSpentSeconds(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = test.questions[currentIdx];
  const attemptedCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = test.questions.length - attemptedCount;

  return (
    <div id="active-mock-test-container" className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Test Navigation & Timer Bar */}
      <div className="bg-white text-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-18 z-30">
        <div>
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{test.board} • {test.subject}</span>
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{test.topic}</h2>
        </div>

        <div className="flex items-center space-x-3">
          {totalSeconds > 0 && !isSubmitted && (
            <div
              className={`px-3.5 py-1.5 rounded-xl border flex items-center space-x-2 text-sm font-extrabold shadow-sm ${
                secondsRemaining < 180
                  ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          <button
            onClick={() => setShowOMRDrawer(!showOMRDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
              showOMRDrawer
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
            title="Toggle Live OMR Bubble Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>OMR Sheet</span>
          </button>

          {isSubmitted ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-60"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Solved Paper (PDF)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRetake}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 border border-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Retake</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-60"
                title="Download Official Board Question Paper + OMR Sheet PDF"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Official Question Paper (PDF)</span>
              </button>
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                Submit OMR Paper
              </button>
            </div>
          )}

          <button
            onClick={onExit}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Submitted Result Overview */}
      {isSubmitted && testResult && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-emerald-700 font-extrabold uppercase tracking-wider flex items-center space-x-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>WBCHSE Sem 3 OMR Evaluation Result</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Performance Score Summary
              </h3>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center sm:text-right">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {testResult.scorePercentage}%
              </div>
              <p className="text-xs text-slate-600 font-medium">Final Percentage</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500">Total Questions</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{testResult.totalQuestions}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
              <p className="text-xs text-emerald-800">Correct Answers</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{testResult.correctCount}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
              <p className="text-xs text-rose-800">Incorrect Answers</p>
              <p className="text-xl font-bold text-rose-700 mt-1">{testResult.wrongCount}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <p className="text-xs text-amber-800">Unanswered</p>
              <p className="text-xl font-bold text-amber-700 mt-1">{testResult.unansweredCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left is Question Area, Right is OMR Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area (Question Box & Navigation) */}
        <div className={showOMRDrawer ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          {/* Question Palette Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-bold">
              <span className="flex items-center space-x-2 text-indigo-700">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Question Navigation ({test.questions.length} Total)</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                  {attemptedCount} Answered
                </span>
                {flaggedCount > 0 && (
                  <span className="bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-lg border border-purple-200 text-[11px] flex items-center space-x-1">
                    <Flag className="w-3 h-3 text-purple-600" />
                    <span>{flaggedCount} Marked</span>
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                  {unansweredCount} Left
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {test.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== "";
                const isFlagged = Boolean(flaggedQuestions[q.id]);
                const isCurrent = idx === currentIdx;
                const isCorrect = isSubmitted && normalizeAns(userAnswers[q.id], q.options) === normalizeAns(q.correctAnswer, q.options);
                const isWrong = isSubmitted && isAnswered && !isCorrect;

                let btnStyle = "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
                if (isSubmitted) {
                  if (isCorrect) btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm";
                  else if (isWrong) btnStyle = "bg-rose-600 text-white border-rose-600 font-bold shadow-sm";
                  else btnStyle = "bg-amber-50 text-amber-800 border-amber-200";
                } else if (isCurrent) {
                  btnStyle = "bg-amber-400 text-slate-950 border-amber-400 ring-2 ring-amber-400/80 font-black shadow-sm";
                } else if (isFlagged) {
                  btnStyle = "bg-purple-100 text-purple-900 border-purple-300 font-bold ring-1 ring-purple-300";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8.5 h-8.5 rounded-xl border text-xs font-mono flex items-center justify-center transition-all relative ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && !isSubmitted && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-600 ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Active Question Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold uppercase tracking-wider">
                  Question {currentIdx + 1} / {test.questions.length}
                </span>
                <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  {currentQ.type}
                </span>
                {currentQ.pyqTag && (
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>{currentQ.pyqTag}</span>
                  </span>
                )}
              </div>

              {!isSubmitted && (
                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                    flaggedQuestions[currentQ.id]
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flaggedQuestions[currentQ.id] ? "Marked for Review" : "Mark for Review"}</span>
                </button>
              )}
            </div>

            {/* Question Text Box with High Contrast Light Styling */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
              <MathRenderer
                text={currentQ.question}
                className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed tracking-wide"
              />
            </div>

            {/* Question Options or Input */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = userAnswers[currentQ.id] === String(optIdx);
                  const normCorrect = normalizeAns(currentQ.correctAnswer, currentQ.options);
                  const isCorrectOpt = isSubmitted && String(optIdx) === normCorrect;

                  let optionStyle = "bg-white border-slate-200 text-slate-800 hover:bg-indigo-50/40 hover:border-indigo-300";

                  if (isSubmitted) {
                    if (isCorrectOpt) {
                      optionStyle = "bg-emerald-50 border-2 border-emerald-600 text-emerald-950 font-bold shadow-sm";
                    } else if (isSelected && !isCorrectOpt) {
                      optionStyle = "bg-rose-50 border-2 border-rose-500 text-rose-950 font-bold shadow-sm";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-indigo-50/90 border-2 border-indigo-600 text-indigo-950 font-bold shadow-sm";
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`p-4 sm:p-5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-3.5 flex-1 pr-2">
                        <div
                          className={`w-9 h-9 rounded-full border text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {letter}
                        </div>
                        <MathRenderer text={opt} className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed" />
                      </div>

                      {isSubmitted && (
                        <div className="shrink-0 ml-2">
                          {isCorrectOpt && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                          {isSelected && !isCorrectOpt && <XCircle className="w-6 h-6 text-rose-600" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Type Your Answer / Numerical Solution
                </label>
                <input
                  type="text"
                  value={userAnswers[currentQ.id] || ""}
                  onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Enter your calculation answer..."
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 placeholder-slate-400 font-mono"
                />
              </div>
            )}

            {/* Detailed High-Contrast Solution Box when Submitted */}
            {isSubmitted && (
              <div className="mt-8 p-6 rounded-2xl bg-indigo-50/50 border-2 border-indigo-200 text-slate-900 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-sm sm:text-base">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span>Step-by-Step KaTeX Solution (বাংলা ও ইংরেজি ব্যাখ্যা)</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 self-start sm:self-auto">
                    Official Board Pattern
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-inner">
                  <MathRenderer
                    text={currentQ.solution}
                    className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 flex items-center space-x-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentIdx((prev) => Math.min(test.questions.length - 1, prev + 1))}
                disabled={currentIdx === test.questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black disabled:opacity-30 flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Interactive Real WBCHSE Sem 3 OMR Sheet */}
        {showOMRDrawer && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-amber-700">
                  WBCHSE SEM 3
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Grid className="w-4 h-4 text-indigo-600" />
                  <span>OMR Bubble Sheet</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {attemptedCount}/{test.questions.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Click bubbles A, B, C, D to mark responses just like the physical WBCHSE Semester 3 OMR exam sheet.
            </p>

            <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2">
              {test.questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCurrent = idx === currentIdx;
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <div
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-amber-50 border-amber-400 ring-1 ring-amber-300"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-mono font-bold ${isCurrent ? "text-amber-900" : "text-slate-700"}`}>
                          Q.{idx + 1}
                        </span>
                        {isFlagged && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-300">
                            Review
                          </span>
                        )}
                      </div>
                      {isSubmitted && (
                        <span className="text-[10px] font-bold">
                          {normalizeAns(userAns, q.options) === normalizeAns(q.correctAnswer, q.options) ? (
                            <span className="text-emerald-700">✓ Correct</span>
                          ) : userAns ? (
                            <span className="text-rose-700">✗ Wrong</span>
                          ) : (
                            <span className="text-slate-400">Unanswered</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 4 OMR Bubble buttons */}
                    <div className="flex items-center justify-around gap-1.5 pt-1">
                      {[0, 1, 2, 3].map((optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isChosen = userAns === String(optIdx);
                        const normCorrect = normalizeAns(q.correctAnswer, q.options);
                        const isCorrectOpt = isSubmitted && String(optIdx) === normCorrect;

                        let bubbleStyle = "bg-white border-slate-300 text-slate-600 hover:border-slate-400";
                        if (isSubmitted) {
                          if (isCorrectOpt) bubbleStyle = "bg-emerald-600 border-emerald-600 text-white font-black shadow-sm";
                          else if (isChosen && !isCorrectOpt) bubbleStyle = "bg-rose-600 border-rose-600 text-white font-black";
                        } else if (isChosen) {
                          bubbleStyle = "bg-indigo-600 border-indigo-600 text-white font-black shadow-sm ring-2 ring-indigo-300";
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOption(q.id, optIdx);
                            }}
                            className={`w-7.5 h-7.5 rounded-full border text-[11px] font-bold flex items-center justify-center transition-all ${bubbleStyle}`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pre-Submission Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-900">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Ready to Submit OMR Test?
              </h3>
              <p className="text-xs text-slate-500">
                Please verify your question response summary before final evaluation:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <p className="text-emerald-700 font-black text-xl">{attemptedCount}</p>
                <p className="text-[11px] text-slate-500">Answered</p>
              </div>
              <div>
                <p className="text-purple-700 font-black text-xl">{flaggedCount}</p>
                <p className="text-[11px] text-slate-500">Flagged</p>
              </div>
              <div>
                <p className="text-amber-700 font-black text-xl">{unansweredCount}</p>
                <p className="text-[11px] text-slate-500">Unanswered</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={doSubmitTest}
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition-all"
              >
                Confirm & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
