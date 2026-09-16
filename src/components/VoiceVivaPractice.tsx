import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Globe,
  Brain,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { VivaQuestionData, VivaEvaluation, ExamBoard } from "../types";
import { SpeechHelper } from "../utils/speech";
import { MathRenderer } from "./MathRenderer";

interface VoiceVivaPracticeProps {
  customApiKey: string;
  initialBoard?: ExamBoard;
  initialSubject?: string;
  initialTopic?: string;
}

export const VoiceVivaPractice: React.FC<VoiceVivaPracticeProps> = ({ 
  customApiKey,
  initialBoard,
  initialSubject,
  initialTopic,
}) => {
  const [board, setBoard] = useState<ExamBoard>(initialBoard || "WBCHSE Class 12 (Semester 3)");
  const [subject, setSubject] = useState(initialSubject || "Physics");
  const [topic, setTopic] = useState(initialTopic || "Electromagnetic Induction & AC Currents");
  const [difficulty, setDifficulty] = useState("Medium");

  const [questionData, setQuestionData] = useState<VivaQuestionData | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);

  // Speech & Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<VivaEvaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      SpeechHelper.stopSpeaking();
    };
  }, []);

  const handleGenerateQuestion = async () => {
    setLoadingQ(true);
    setQuestionData(null);
    setEvaluation(null);
    setSpokenTranscript("");
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customApiKey && customApiKey.trim().length > 5) {
        headers["x-custom-gemini-key"] = customApiKey.trim();
      }

      const res = await fetch("/api/generate-viva-question", {
        method: "POST",
        headers,
        body: JSON.stringify({ board, subject, topic, difficulty }),
      });

      const data = await res.json();
      if (!data.success || !data.questionData) {
        throw new Error(data.error || "Failed to generate viva question");
      }

      setQuestionData(data.questionData);
      // Auto speak question if supported
      SpeechHelper.speak(data.questionData.vivaQuestion);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Error generating viva question");
    } finally {
      setLoadingQ(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      setErrorMessage("Speech recognition is not available on this mobile browser. Please type your answer in the text box below!");
      return;
    }

    try {
      const rec = SpeechHelper.createRecognition("en-US") || SpeechHelper.createRecognition("bn-IN");
      if (!rec) {
        setErrorMessage("Could not start microphone on this browser. Please type your answer in the text box below.");
        return;
      }

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let currentText = "";
        if (event?.results) {
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i][0]) {
              currentText += event.results[i][0].transcript + " ";
            }
          }
        }
        setSpokenTranscript(currentText.trim());
      };

      rec.onerror = (event: any) => {
        console.warn("Speech rec error:", event?.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleEvaluateAnswer = async () => {
    if (!spokenTranscript.trim() || !questionData) return;

    setEvaluating(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customApiKey && customApiKey.trim().length > 5) {
        headers["x-custom-gemini-key"] = customApiKey.trim();
      }

      const res = await fetch("/api/evaluate-voice-viva", {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: questionData.vivaQuestion,
          userSpokenAnswer: spokenTranscript,
          expectedKeyPoints: questionData.keyPointsExpected,
          language: "Bilingual",
        }),
      });

      const data = await res.json();
      if (!data.success || !data.evaluation) {
        throw new Error(data.error || "Failed to evaluate verbal response");
      }

      setEvaluation(data.evaluation);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Evaluation error");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div id="voice-viva-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Mic className="w-4 h-4 text-rose-400" />
            <span>AI Voice Reasoning & Viva Practice</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Oral Viva Voce & Concept Clarity Practice
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Speak your answers live via mic. Gemini analyzes conceptual accuracy, fluency, missed points & provides model answers in Bengali & English.
          </p>
        </div>

        <button
          onClick={handleGenerateQuestion}
          disabled={loadingQ}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all shrink-0 disabled:opacity-60"
        >
          {loadingQ ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>New Viva Question</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Configuration Inputs */}
      {!questionData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
            Setup Viva Voce Subject & Topic
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Board/Exam</label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value as ExamBoard)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
              >
                <option value="WBCHSE Class 12 (Semester 3)">WBCHSE Class 12 (Semester 3 Official)</option>
                <option value="WBCHSE (Class 11-12)">WBCHSE (Class 11-12 General)</option>
                <option value="WBBSE (Class 9-10)">WBBSE (Madhyamik)</option>
                <option value="JEE Mains">JEE Mains</option>
                <option value="NEET UG">NEET UG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chapter / Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
              />
            </div>
          </div>
          <button
            onClick={handleGenerateQuestion}
            disabled={loadingQ}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Viva Question</span>
          </button>
        </div>
      )}

      {/* Active Viva Question Card */}
      {questionData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {subject} • {topic}
            </span>
            <button
              onClick={() => SpeechHelper.speak(questionData.vivaQuestion)}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1"
            >
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span>Read Aloud</span>
            </button>
          </div>

          <div className="space-y-3">
            <MathRenderer
              text={questionData.vivaQuestion}
              className="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed"
            />
            {questionData.vivaQuestionBengali && (
              <p className="text-sm font-medium text-slate-600 italic">
                বাংলা অনুবাদ: "{questionData.vivaQuestionBengali}"
              </p>
            )}
          </div>

          {/* Expected Concept Badges */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Key Expected Concepts</span>
            <div className="flex flex-wrap gap-2">
              {questionData.keyPointsExpected.map((pt, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-medium"
                >
                  • {pt}
                </span>
              ))}
            </div>
          </div>

          {/* Voice Recording / Typing Section */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                <Mic className="w-4 h-4 text-rose-500" />
                <span>Your Spoken Answer</span>
              </span>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? "Stop Recording..." : "Start Mic Recording"}</span>
              </button>
            </div>

            <textarea
              value={spokenTranscript}
              onChange={(e) => setSpokenTranscript(e.target.value)}
              placeholder="Speak using microphone or type your spoken response here..."
              rows={4}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
            />

            <div className="flex justify-end">
              <button
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !spokenTranscript.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Voice Speech...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Evaluate Speech Response</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Evaluation Results Card */}
          {evaluation && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Speech & Reasoning Report
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-100">
                    Conceptual Rating: {evaluation.conceptualAccuracyRating}
                  </h3>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-400">Concept Score</p>
                    <p className="text-2xl font-extrabold text-emerald-400">
                      {evaluation.scoreOutOf100}/100
                    </p>
                  </div>
                  <div className="text-center bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-400">Fluency Score</p>
                    <p className="text-2xl font-extrabold text-indigo-400">
                      {evaluation.clarityAndFluencyScore}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">AI Speech Feedback</span>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  {evaluation.detailedFeedback}
                </p>
              </div>

              {/* Missed Concepts */}
              {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase">Missed Key Points</span>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.missingConcepts.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-medium"
                      >
                        • {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Answers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase">
                      Ideal Model Answer (English)
                    </span>
                    <button
                      onClick={() => SpeechHelper.speak(evaluation.suggestedModelAnswerEnglish, "mahi", "en-US")}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.suggestedModelAnswerEnglish}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase">
                      আদর্শ মডেল উত্তর (বাংলা)
                    </span>
                    <button
                      onClick={() => SpeechHelper.speak(evaluation.suggestedModelAnswerBengali, "mahi", "bn-IN")}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>শুনুন</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.suggestedModelAnswerBengali}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
