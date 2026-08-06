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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
          handleSubmitTest(); // Auto-submit when timer expires
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
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: String(optIdx),
    }));
  };

  const handleTextAnswer = (qId: string, text: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const handleSubmitTest = () => {
    if (isSubmitted) return;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    test.questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      if (userAns === undefined || userAns.trim() === "") {
        unansweredCount++;
      } else if (
        userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      ) {
        correctCount++;
      } else {
        wrongCount++;
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

    // Trigger celebratory confetti if score >= 60%
    if (scorePercentage >= 50) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = test.questions[currentIdx];

  return (
    <div id="active-mock-test-container" className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Test Navigation & Timer Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30">
        <div>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            {test.board} • {test.subject}
          </span>
          <h2 className="text-lg font-bold text-slate-100">{test.topic}</h2>
        </div>

        <div className="flex items-center space-x-4">
          {totalSeconds > 0 && !isSubmitted && (
            <div
              className={`px-3.5 py-1.5 rounded-xl border flex items-center space-x-2 text-sm font-extrabold ${
                secondsRemaining < 180
                  ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-slate-800 border-slate-700 text-amber-300"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          {isSubmitted ? (
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all disabled:opacity-60"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Paper</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmitTest}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              Submit Test Paper
            </button>
          )}

          <button
            onClick={onExit}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Submitted Result Overview */}
      {isSubmitted && testResult && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>Test Completed</span>
              </span>
              <h3 className="text-2xl font-extrabold text-slate-100">
                Performance Score Summary
              </h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-emerald-400">
                {testResult.scorePercentage}%
              </div>
              <p className="text-xs text-slate-400 font-medium">Final Percentage</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-center">
              <p className="text-xs text-slate-400">Total Questions</p>
              <p className="text-xl font-bold text-white mt-1">{testResult.totalQuestions}</p>
            </div>
            <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-500/30 text-center">
              <p className="text-xs text-emerald-300">Correct Answers</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{testResult.correctCount}</p>
            </div>
            <div className="bg-rose-950/60 p-4 rounded-xl border border-rose-500/30 text-center">
              <p className="text-xs text-rose-300">Incorrect Answers</p>
              <p className="text-xl font-bold text-rose-400 mt-1">{testResult.wrongCount}</p>
            </div>
            <div className="bg-amber-950/60 p-4 rounded-xl border border-amber-500/30 text-center">
              <p className="text-xs text-amber-300">Unanswered</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{testResult.unansweredCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question Palette Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
          <span className="flex items-center space-x-2 text-indigo-400">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Question Navigation Palette</span>
          </span>
          <span className="bg-slate-800 text-amber-300 px-3 py-1 rounded-lg border border-slate-700 font-mono text-[11px]">
            {Object.keys(userAnswers).length} of {test.questions.length} Attempted
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {test.questions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== "";
            const isCurrent = idx === currentIdx;
            const isCorrect = isSubmitted && userAnswers[q.id] === q.correctAnswer;
            const isWrong = isSubmitted && isAnswered && !isCorrect;

            let btnStyle = "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700";
            if (isSubmitted) {
              if (isCorrect) btnStyle = "bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm shadow-emerald-500/30";
              else if (isWrong) btnStyle = "bg-rose-600 text-white border-rose-500 font-bold shadow-sm shadow-rose-500/30";
              else btnStyle = "bg-amber-950/60 text-amber-300 border-amber-600/50";
            } else if (isCurrent) {
              btnStyle = "bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/80 font-bold shadow-md shadow-indigo-600/30";
            } else if (isAnswered) {
              btnStyle = "bg-slate-800 text-indigo-300 border-indigo-500/60 font-bold";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 rounded-xl border text-xs font-mono flex items-center justify-center transition-all ${btnStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
              Question {currentIdx + 1} / {test.questions.length}
            </span>
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              {currentQ.type}
            </span>
            {currentQ.pyqTag && (
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentQ.pyqTag}</span>
              </span>
            )}
          </div>
        </div>

        {/* Question Text Box with High Contrast */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-inner">
          <MathRenderer
            text={currentQ.question}
            className="text-base sm:text-xl font-bold text-slate-100 leading-relaxed tracking-wide"
          />
        </div>

        {/* Question Options or Input */}
        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = userAnswers[currentQ.id] === String(optIdx);
              const isCorrectOpt = String(optIdx) === currentQ.correctAnswer;

              let optionStyle = "bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-slate-700";

              if (isSubmitted) {
                if (isCorrectOpt) {
                  optionStyle = "bg-emerald-950/80 border-2 border-emerald-500 text-emerald-100 font-bold shadow-md shadow-emerald-500/20";
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle = "bg-rose-950/80 border-2 border-rose-500 text-rose-100 font-bold shadow-md shadow-rose-500/20";
                }
              } else if (isSelected) {
                optionStyle = "bg-indigo-950/90 border-2 border-indigo-500 text-indigo-100 font-bold shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400";
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${optionStyle}`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl border text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                          : "bg-slate-950 text-slate-400 border-slate-700"
                      }`}
                    >
                      {letter}
                    </div>
                    <MathRenderer text={opt} className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed" />
                  </div>

                  {isSubmitted && (
                    <div className="shrink-0 ml-2">
                      {isCorrectOpt && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                      {isSelected && !isCorrectOpt && <XCircle className="w-6 h-6 text-rose-400" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              Type Your Answer / Numerical Solution
            </label>
            <input
              type="text"
              value={userAnswers[currentQ.id] || ""}
              onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
              disabled={isSubmitted}
              placeholder="Enter your calculation answer..."
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-100 placeholder-slate-600 font-mono"
            />
          </div>
        )}

        {/* Detailed High-Contrast Solution Box when Submitted */}
        {isSubmitted && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-950 to-emerald-950/60 border-2 border-indigo-500/40 text-slate-100 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/30 pb-3">
              <div className="flex items-center space-x-2 text-indigo-300 font-extrabold text-sm sm:text-base">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Step-by-Step Detailed Solution (বাংলা ও ইংরেজি ব্যাখ্যা)</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 self-start sm:self-auto">
                Step-by-Step Explanation
              </span>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-inner">
              <MathRenderer
                text={currentQ.solution}
                className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-bold hover:bg-slate-800 hover:text-white disabled:opacity-30 flex items-center space-x-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setCurrentIdx((prev) => Math.min(test.questions.length - 1, prev + 1))}
            disabled={currentIdx === test.questions.length - 1}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold disabled:opacity-30 flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
