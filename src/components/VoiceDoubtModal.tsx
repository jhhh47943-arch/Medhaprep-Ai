import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  Zap,
  HelpCircle,
} from "lucide-react";
import { SpeechHelper, VOICE_PERSONAS, VoicePersonaId } from "../utils/speech";
import { MathRenderer } from "./MathRenderer";

interface VoiceDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionContext: string;
  questionNumber?: number;
  customApiKey?: string;
}

export const VoiceDoubtModal: React.FC<VoiceDoubtModalProps> = ({
  isOpen,
  onClose,
  questionContext,
  questionNumber,
  customApiKey = "",
}) => {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersonaId>("ananya");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [aiSpeechResponse, setAiSpeechResponse] = useState<string | null>(null);
  const [aiMarkdownResponse, setAiMarkdownResponse] = useState<string | null>(null);
  const [reactionText, setReactionText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      SpeechHelper.stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      setUserQuery("Voice recognition is not available on this mobile browser. Please type your doubt here!");
      return;
    }

    try {
      const rec = SpeechHelper.createRecognition("bn-IN") || SpeechHelper.createRecognition("en-US");
      if (!rec) {
        setUserQuery("Could not start microphone on this device. Please type your doubt here!");
        return;
      }

      recognitionRef.current = rec;
      rec.onstart = () => setIsListening(true);
      rec.onerror = (e: any) => {
        console.warn("Speech rec error:", e?.error);
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);

      rec.onresult = (event: any) => {
        let transcript = "";
        if (event?.results) {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i][0]) {
              transcript += event.results[i][0].transcript + " ";
            }
          }
        }
        setUserQuery(transcript.trim());
      };

      rec.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSubmitQuery = async (queryToSubmit?: string) => {
    const activeQuery = queryToSubmit || userQuery;
    if (!activeQuery.trim()) return;

    setLoading(true);
    SpeechHelper.stopSpeaking();
    setIsSpeaking(false);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customApiKey && customApiKey.trim().length > 5) {
        headers["x-custom-gemini-key"] = customApiKey.trim();
        headers["x-gemini-api-key"] = customApiKey.trim();
      }

      const res = await fetch("/api/voice-doubt-solver", {
        method: "POST",
        headers,
        body: JSON.stringify({
          questionContext,
          userVoiceQuery: activeQuery,
          personaId: selectedPersona,
          language: "Bilingual",
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAiSpeechResponse(data.result.aiSpeechText);
        setAiMarkdownResponse(data.result.aiDisplayMarkdown);
        setReactionText(data.result.reactionUsed || "Warm AI Tutor Response");

        // Automatically speak AI response out loud with proper language code!
        const isBengali = /[\u0980-\u09FF]/.test(data.result.aiSpeechText);
        const speechLang = isBengali ? "bn-IN" : "en-US";

        setIsSpeaking(true);
        SpeechHelper.speak(data.result.aiSpeechText, selectedPersona, speechLang, () => {
          setIsSpeaking(false);
        });
      } else {
        setAiSpeechResponse("এখানে সমাধানটি বিস্তারিতভাবে দেওয়া হলো। তুমি যেকোনো সময় পুনরায় প্রশ্ন করতে পারো।");
        setAiMarkdownResponse("### 💡 গাণিতিক ব্যাখ্যা ও সমাধান:\n\nসূত্রের প্রয়োগ ও বিস্তারিত হিসাব দেখতে সংশ্লিষ্ট অধ্যায়ের সূত্র তালিকাটি রিভিশন করে নাও।");
      }
    } catch (err) {
      console.error(err);
      setAiSpeechResponse("ধাপভিত্তিক সমাধান নিচে প্রদর্শিত হলো।");
      setAiMarkdownResponse("### 💡 সমাধান:\n\nগাণিতিক সমীকরণ ও ব্যাখ্যার জন্য ফর্মুলা শিট ও নোটস জেনারেটর ব্যবহার করো।");
    } finally {
      setLoading(false);
    }
  };

  const handleReplaySpeech = () => {
    if (!aiSpeechResponse) return;
    setIsSpeaking(true);
    SpeechHelper.speak(aiSpeechResponse, selectedPersona, "en-US", () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeech = () => {
    SpeechHelper.stopSpeaking();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  const currentPersona = VOICE_PERSONAS.find((p) => p.id === selectedPersona) || VOICE_PERSONAS[0];

  return (
    <div
      id="voice-doubt-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="voice-doubt-modal-card"
        className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-slate-900 space-y-6 my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
                <span>Live AI Voice Doubt Solver</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Interactive Audio
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {questionNumber ? `Discussing Question #${questionNumber}` : "Ask any doubt about this question"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopSpeech();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector (4 Voices: 2 Female, 2 Male) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Choose Voice Persona (2 Girl Voices, 2 Boy Voices):</span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Selected: {currentPersona.name} ({currentPersona.gender})
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VOICE_PERSONAS.map((p) => {
              const isSelected = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPersona(p.id);
                    if (aiSpeechResponse) {
                      SpeechHelper.speak(aiSpeechResponse, p.id);
                    }
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{p.avatar}</span>
                    <div className="truncate">
                      <p className={`text-xs font-bold ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                        {p.name.split(" - ")[0]}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">{p.gender} Voice</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Question Preview Context */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center space-x-1.5 text-indigo-600 font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Target Question Context:</span>
          </div>
          <div className="max-h-20 overflow-y-auto pr-1">
            <MathRenderer text={questionContext} className="text-xs text-slate-700" />
          </div>
        </div>

        {/* Animated AI Voice Avatar & Sound Wave */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {isSpeaking && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping" />
                <div className="absolute -inset-2 rounded-full border border-emerald-500/30 animate-pulse" />
              </>
            )}
            <div className="w-16 h-16 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center text-3xl shadow-md">
              {currentPersona.avatar}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">{currentPersona.name}</p>
            <p className="text-xs text-slate-600">{currentPersona.tagline}</p>
            {reactionText && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold mt-1">
                Emotion: {reactionText}
              </span>
            )}
          </div>

          {/* Voice Wave Animation */}
          {isSpeaking ? (
            <div className="flex items-center justify-center space-x-1 py-1">
              <div className="w-1 h-6 bg-indigo-500 rounded-full animate-bounce duration-300" />
              <div className="w-1 h-10 bg-emerald-500 rounded-full animate-bounce duration-500 delay-100" />
              <div className="w-1 h-8 bg-pink-500 rounded-full animate-bounce duration-400 delay-200" />
              <div className="w-1 h-12 bg-amber-500 rounded-full animate-bounce duration-300 delay-150" />
              <div className="w-1 h-7 bg-indigo-500 rounded-full animate-bounce duration-500 delay-75" />
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {loading ? "AI is thinking & preparing voice response..." : "Tap microphone or type your question below."}
            </p>
          )}

          {/* Speech Audio Action Controls */}
          {aiSpeechResponse && (
            <div className="flex items-center justify-center space-x-3 pt-2">
              {isSpeaking ? (
                <button
                  onClick={handleStopSpeech}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Pause Voice</span>
                </button>
              ) : (
                <button
                  onClick={handleReplaySpeech}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Replay Voice ({currentPersona.name.split(" ")[0]})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Markdown Solution Display */}
        {aiMarkdownResponse && (
          <div className="bg-slate-50 border border-emerald-300 rounded-2xl p-4 space-y-2 max-h-56 overflow-y-auto">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>AI Step-by-Step Explanation & Shortcut:</span>
            </div>
            <MathRenderer text={aiMarkdownResponse} className="text-xs text-slate-800 leading-relaxed" />
          </div>
        )}

        {/* Input Controls (Voice Microphone + Text Input) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartListening}
              className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center space-x-2 transition-all ${
                isListening
                  ? "bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="hidden sm:inline">{isListening ? "Listening..." : "Speak Doubt"}</span>
            </button>

            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitQuery();
              }}
              placeholder="Speak or type your doubt (e.g., 'How to derive this formula?')"
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />

            <button
              onClick={() => handleSubmitQuery()}
              disabled={loading || !userQuery.trim()}
              className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Preset Doubt Prompts */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 shrink-0 font-medium">Quick Doubts:</span>
            {[
              "Can you explain this step by step?",
              "Is there any short trick for this question?",
              "Why is option A correct and not option B?",
              "What is the basic formula used here?",
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserQuery(preset);
                  handleSubmitQuery(preset);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
