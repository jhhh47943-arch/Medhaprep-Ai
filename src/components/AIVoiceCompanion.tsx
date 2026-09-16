import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RotateCw,
  GraduationCap,
  Send,
  UserCheck,
  PenTool,
  BookOpen,
  Camera,
  Settings,
  Lock,
  Award,
  Eraser,
  Trash2,
  Download,
  Layers,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { SpeechHelper, MAHI_AVATARS } from "../utils/speech";
import { MathRenderer } from "./MathRenderer";
import { Visualizer } from "./Visualizer";

interface AIVoiceCompanionProps {
  customApiKey: string;
  selectedModel?: string;
  initialSubject?: string;
  initialTopic?: string;
}

const PRESET_FORMULAS = [
  {
    subject: "Physics",
    title: "Gauss's Law",
    formula: "$$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{encl}}{\\epsilon_0}$$",
    desc: "Electric flux through a closed surface equals enclosed charge divided by permittivity.",
    query: "Explain Gauss's Law with a simple real-life example and JEE numerical trick.",
  },
  {
    subject: "Physics",
    title: "Snell's Law of Refraction",
    formula: "$$n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$$",
    desc: "Relationship between angles of incidence and refraction when passing through media.",
    query: "Explain Snell's law and total internal reflection condition clearly.",
  },
  {
    subject: "Mathematics",
    title: "Quadratic Formula",
    formula: "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
    desc: "Roots of $ax^2 + bx + c = 0$ with discriminant $D = b^2 - 4ac$.",
    query: "Explain quadratic roots and nature of roots with discriminant conditions.",
  },
  {
    subject: "Mathematics",
    title: "Integration by Parts",
    formula: "$$\\int u \\, dv = u v - \\int v \\, du$$",
    desc: "ILATE rule prioritization for product rule in calculus integration.",
    query: "Explain Integration by Parts using ILATE rule with an easy example.",
  },
  {
    subject: "Chemistry",
    title: "Nernst Equation",
    formula: "$$E = E^\\circ - \\frac{RT}{nF} \\ln Q$$",
    desc: "Cell potential under non-standard temperature and ion concentration conditions.",
    query: "Explain Nernst equation for electrochemistry with WBCHSE exam tips.",
  },
  {
    subject: "Biology",
    title: "Photosynthesis Net Equation",
    formula: "$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$",
    desc: "Light and dark reactions converting solar energy into chemical glucose.",
    query: "Explain light and dark reaction stages of photosynthesis simply in Bengali.",
  },
];

export const AIVoiceCompanion: React.FC<AIVoiceCompanionProps> = ({ 
  customApiKey, 
  selectedModel,
  initialSubject,
  initialTopic,
}) => {
  const [activeTab, setActiveTab] = useState<"mentor" | "board" | "tools">("mentor");
  const [subjectTopic, setSubjectTopic] = useState(
    initialTopic ? `WBCHSE Class 12 Sem 3: ${initialSubject || ""} - ${initialTopic}` : "Physics & Mathematics"
  );
  const [mahiEmotion, setMahiEmotion] = useState<string>("greeting");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [pts, setPts] = useState(750);

  // Board Specific State
  const [boardSubject, setBoardSubject] = useState(initialSubject || "All");
  const [isDrawing, setIsDrawing] = useState(false);
  const [chalkColor, setChalkColor] = useState("#fef08a"); // Yellow chalk default
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingNowRef = useRef(false);

  const [latestResponse, setLatestResponse] = useState<{
    speechText: string;
    displayMarkdown: string;
    reaction: string;
  } | null>({
    speechText: initialTopic
      ? `নমস্কার! I am Mahi, and I am ready to guide you through WBCHSE Class 12 Semester 3: ${initialTopic}! Ask me any derivation, doubt, or shortcut trick!`
      : "নমস্কার! I am Mahi (মাহি), your live AI Voice & Avatar Tutor! Speak your question or tap the microphone below to talk to me live!",
    displayMarkdown: initialTopic
      ? `### 🎓 WBCHSE Class 12 Semester 3 Live Voice Tutor\n**Active Chapter:** ${initialTopic} (${initialSubject || "Science"})\n\n- Tap **Start Speaking** to ask doubts in Bengali or English\n- Switch to the **Blackboard** tab to write formulas or see live derivations\n- Ask for **shortcut tricks**, **sample numericals**, or **past year exam questions**!`
      : "### 👋 নমস্কার! I am Mahi (মাহি)\nYour interactive live AI Voice & Visual Avatar Study Companion!\n\n- **12 Live Avatar Expressions**: My face and emotion change automatically as I talk to you!\n- **Hands-Free Live Voice**: Tap the mic below and speak your doubt directly.\n- **Subjects**: Physics, Chemistry, Mathematics & Biology for WBBSE, WBCHSE, JEE & NEET.",
    reaction: "Greeting & Welcome",
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      SpeechHelper.stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Set canvas resolution on resize or tab switch
  useEffect(() => {
    if (activeTab === "board" && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }
  }, [activeTab]);

  const accumulatedTranscriptRef = useRef<string>("");

  const [micNotice, setMicNotice] = useState<string | null>(null);

  const handleStartListening = () => {
    // Stop any ongoing speech output first so audio hardware is free for recording
    try {
      SpeechHelper.stopSpeaking();
    } catch (e) {}
    setIsSpeaking(false);
    setMicNotice(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (isListening) {
      setIsListening(false);
      const textToProcess = accumulatedTranscriptRef.current.trim();
      if (textToProcess) {
        processVoiceQuery(textToProcess);
      }
      return;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      setMicNotice("Speech recognition is not available in this mobile browser. You can type your question in the text box below!");
      setUserTranscript("Voice input unsupported on this browser. Type your question below!");
      return;
    }

    // Try speech recognition with Bengali (bn-IN), then fallback gracefully
    const rec = SpeechHelper.createRecognition("bn-IN") || SpeechHelper.createRecognition("en-IN") || SpeechHelper.createRecognition("en-US");
    if (!rec) {
      setMicNotice("Could not start microphone on this device. Please type your doubt below.");
      setUserTranscript("Microphone initialization failed. Please type your doubt below.");
      return;
    }

    accumulatedTranscriptRef.current = "";
    setIsListening(true);
    setMahiEmotion("thinking");
    setUserTranscript("🎙️ Listening to your voice... Speak your doubt clearly now!");

    recognitionRef.current = rec;
    rec.onstart = () => {
      setIsListening(true);
      setMahiEmotion("thinking");
    };

    rec.onerror = (event: any) => {
      console.warn("Speech recognition error:", event?.error);
      setIsListening(false);
      const errType = event?.error || "";
      if (errType === "not-allowed" || errType === "service-not-allowed" || errType === "security") {
        setMicNotice("Microphone permission was blocked. Please allow mic access in your browser settings or type below!");
        setUserTranscript("Microphone access blocked. Please allow mic in settings or type below.");
      } else if (errType === "no-speech") {
        setUserTranscript("No speech detected. Tap live mic to speak again or type below!");
      } else {
        setUserTranscript("Voice input stopped. You can type your doubt below!");
      }
    };

    rec.onend = () => {
      setIsListening(false);
      const spoken = accumulatedTranscriptRef.current.trim();
      if (spoken) {
        processVoiceQuery(spoken);
      }
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
      const trimmed = currentText.trim();
      accumulatedTranscriptRef.current = trimmed;
      setUserTranscript(trimmed);
    };

    try {
      rec.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      setIsListening(false);
      setMicNotice("Microphone start failed. Please type your question below.");
      setUserTranscript("Microphone start failed. Please type your doubt below.");
    }
  };

  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setLoading(true);
    setMahiEmotion("thinking");
    SpeechHelper.stopSpeaking();
    setIsSpeaking(false);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customApiKey && customApiKey.trim().length > 5) {
        headers["x-custom-gemini-key"] = customApiKey.trim();
        headers["x-gemini-api-key"] = customApiKey.trim();
      }
      if (selectedModel) {
        headers["x-gemini-model"] = selectedModel;
      }

      const res = await fetch("/api/voice-doubt-solver", {
        method: "POST",
        headers,
        body: JSON.stringify({
          questionContext: `Subject: ${subjectTopic}. General voice study discussion.`,
          userVoiceQuery: queryText,
          personaId: "mahi",
          language: "Bilingual",
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        const returnedEmotion = data.result.avatarEmotion || "starry_eyes";
        if (MAHI_AVATARS[returnedEmotion]) {
          setMahiEmotion(returnedEmotion);
        }

        setLatestResponse({
          speechText: data.result.aiSpeechText,
          displayMarkdown: data.result.aiDisplayMarkdown,
          reaction: data.result.reactionUsed || "Friendly response",
        });

        setPts((prev) => prev + 25);

        // Speak response out loud in appropriate accent
        setIsSpeaking(true);
        const isBengali = /[\u0980-\u09FF]/.test(data.result.aiSpeechText);
        SpeechHelper.speak(data.result.aiSpeechText, "mahi", isBengali ? "bn-IN" : "en-US", () => {
          setIsSpeaking(false);
        });
      } else {
        setMicNotice("Could not fetch online response. Tap live mic to speak again or use the text box below.");
      }
    } catch (err) {
      console.error(err);
      setMicNotice("AI server connection notice. You can continue speaking or typing below!");
    } finally {
      setLoading(false);
    }
  };

  const handleReplayVoice = () => {
    if (!latestResponse?.speechText) return;
    setIsSpeaking(true);
    const isBengali = /[\u0980-\u09FF]/.test(latestResponse.speechText);
    SpeechHelper.speak(latestResponse.speechText, "mahi", isBengali ? "bn-IN" : "en-US", () => {
      setIsSpeaking(false);
    });
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingNowRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingNowRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = chalkColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingNowRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const copyBoardText = () => {
    if (!latestResponse?.displayMarkdown) return;
    navigator.clipboard.writeText(latestResponse.displayMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFormulas = boardSubject === "All"
    ? PRESET_FORMULAS
    : PRESET_FORMULAS.filter((f) => f.subject === boardSubject);

  return (
    <div id="ai-voice-companion-container" className="max-w-6xl mx-auto space-y-4 pb-28 px-3 sm:px-6 font-sans">
      {/* Top Status Bar & Points Header */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] uppercase tracking-wider">
              {loading ? "PROCESSING..." : isListening ? "LISTENING..." : isSpeaking ? "SPEAKING..." : "LIVE VOICE READY"}
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black flex items-center space-x-1 shadow-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{pts} PTS</span>
          </div>

          <button className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {micNotice && (
        <div className="bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <MicOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{micNotice}</span>
          </div>
          <button
            onClick={() => setMicNotice(null)}
            className="text-amber-400 hover:text-white font-bold ml-2 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Segmented Navbar (Mobile Only) */}
      <div className="lg:hidden bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-800 grid grid-cols-3 gap-1 shadow-xl">
        <button
          onClick={() => setActiveTab("mentor")}
          className={`py-2.5 px-3 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "mentor"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>MENTOR</span>
        </button>

        <button
          onClick={() => setActiveTab("board")}
          className={`py-2.5 px-3 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "board"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>BOARD</span>
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`py-2.5 px-3 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "tools"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>TOOLS</span>
        </button>
      </div>

      {/* Main Responsive Layout Grid (Side-by-Side on Desktop, Tabbed on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mahi Live Avatar & Voice Controls (Visible on Mobile when 'mentor' or Desktop) */}
        <div className={`space-y-4 lg:col-span-5 ${activeTab !== "mentor" ? "hidden lg:block" : ""}`}>
          {/* High-Res Interactive Mahi Avatar Visualizer */}
          <Visualizer
            emotion={mahiEmotion}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isLoading={loading}
            onEmotionChange={(e) => setMahiEmotion(e)}
            showSelector={true}
          />

          {/* Preset Voice Chips */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              🎙️ Tap to ask Mahi live:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "⚡ Gauss Law Trick", query: "Explain Gauss's Law with a simple real-life example and JEE numerical trick." },
                { label: "🧪 Nernst Equation", query: "Explain Nernst equation for electrochemistry with WBCHSE exam tips." },
                { label: "📐 Quadratic Roots", query: "Explain quadratic roots and nature of roots with discriminant conditions." },
                { label: "🌿 Photosynthesis", query: "Explain light and dark reaction stages of photosynthesis simply in Bengali." },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => processVoiceQuery(chip.query)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 font-semibold transition-all hover:border-amber-500/40"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Typed Doubt Bar below Mentor */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && typedInput.trim()) {
                  processVoiceQuery(typedInput);
                  setTypedInput("");
                }
              }}
              placeholder="Type your question for Mahi..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (typedInput.trim()) {
                  processVoiceQuery(typedInput);
                  setTypedInput("");
                }
              }}
              disabled={loading || !typedInput.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {userTranscript && (
            <p className="text-xs text-slate-300 italic bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-center">
              "{userTranscript}"
            </p>
          )}

          {/* Solution Explanation Box */}
          {latestResponse && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-200 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>MAHI'S VOICE EXPLANATION</span>
                </div>

                <button
                  onClick={handleReplayVoice}
                  disabled={isSpeaking}
                  className="px-3 py-1 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Replay Voice</span>
                </button>
              </div>

              <MathRenderer
                text={latestResponse.displayMarkdown}
                className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal"
              />
            </div>
          )}
        </div>

        {/* Right Column: Board & Formulas (Visible on Mobile when 'board' or Desktop) */}
        <div className={`space-y-4 lg:col-span-7 ${activeTab !== "board" && activeTab !== "tools" ? "hidden lg:block" : ""}`}>
          {/* Main Slate Chalkboard Area */}
          <div className="relative bg-[#0c1e17] border-4 border-[#1f3a2e] rounded-3xl p-5 text-emerald-100 shadow-2xl min-h-[460px] overflow-hidden flex flex-col justify-between">
            {/* Grid Chalkboard Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e3a2f_1px,transparent_1px)] [background-size:18px_18px] opacity-60 pointer-events-none" />

            {/* Blackboard Header Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#1b3d2f] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-sm font-black text-amber-300 tracking-wider uppercase font-mono">
                  Mahi's Smart Digital Chalkboard
                </h2>
              </div>

              {/* Toolbar: Chalk Colors, Eraser, Clear */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#06120d]/80 p-1 rounded-2xl border border-[#1b3d2f]">
                {/* Draw Mode Toggle */}
                <button
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                    isDrawing
                      ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                      : "bg-[#122e23] text-emerald-300 hover:text-white"
                  }`}
                  title="Toggle Hand Drawing Mode"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isDrawing ? "Chalk ON" : "Chalk OFF"}</span>
                </button>

                {/* Chalk Colors */}
                <div className="flex items-center space-x-1 px-1">
                  {[
                    { color: "#fef08a", label: "Yellow" },
                    { color: "#ffffff", label: "White" },
                    { color: "#38bdf8", label: "Cyan" },
                    { color: "#f472b6", label: "Pink" },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => {
                        setChalkColor(item.color);
                        setIsEraser(false);
                        setIsDrawing(true);
                      }}
                      className={`w-5 h-5 rounded-full border transition-all ${
                        !isEraser && isDrawing && chalkColor === item.color
                          ? "scale-125 border-white shadow-md shadow-white/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={`${item.label} Chalk`}
                    />
                  ))}
                </div>

                <div className="w-px h-4 bg-[#1b3d2f]" />

                {/* Eraser */}
                <button
                  onClick={() => {
                    setIsEraser(!isEraser);
                    if (!isDrawing) setIsDrawing(true);
                  }}
                  className={`p-1.5 rounded-xl transition-all ${
                    isEraser && isDrawing
                      ? "bg-amber-500 text-slate-950 font-bold scale-105"
                      : "text-slate-400 hover:text-amber-300"
                  }`}
                  title="Eraser"
                >
                  <Eraser className="w-4 h-4" />
                </button>

                {/* Clear Board */}
                <button
                  onClick={clearCanvas}
                  className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-all"
                  title="Clear Hand Drawings"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Copy Text */}
                <button
                  onClick={copyBoardText}
                  className="p-1.5 rounded-xl text-emerald-400 hover:bg-emerald-950/50 transition-all"
                  title="Copy Board Text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Drawing Layer Canvas on top of text */}
            <div className="relative my-3 flex-1 min-h-[300px] w-full rounded-2xl bg-black/10 border border-[#163025] p-4 overflow-y-auto">
              {/* Drawing Layer Canvas */}
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`absolute inset-0 w-full h-full z-20 cursor-crosshair transition-opacity ${
                  isDrawing ? "pointer-events-auto touch-none opacity-100" : "pointer-events-none opacity-80"
                }`}
              />

              {/* Rendered Math Content from Mahi */}
              <div className="relative z-10 pointer-events-auto select-text font-serif">
                {latestResponse ? (
                  <div className="space-y-3">
                    <MathRenderer
                      text={latestResponse.displayMarkdown}
                      className="text-xs sm:text-sm text-emerald-50 leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="text-center py-20 text-emerald-400/60 space-y-3">
                    <PenTool className="w-10 h-10 mx-auto text-amber-400/60 animate-bounce" />
                    <p className="text-xs font-semibold tracking-wider font-mono uppercase">
                      Write with chalk above or ask Mahi a doubt to view step-by-step solutions here!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Board Action Controls */}
            <div className="relative z-10 pt-2 border-t border-[#1b3d2f] flex items-center justify-between">
              <button
                onClick={handleReplayVoice}
                disabled={isSpeaking || !latestResponse}
                className="px-3.5 py-1.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Listen to Voice</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => processVoiceQuery("Please solve an example numerical step-by-step on this topic.")}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-[#163327] hover:bg-[#1f4535] text-emerald-200 text-xs font-bold transition-all border border-[#244f3d]"
                >
                  ⚡ Solve Example
                </button>
                <button
                  onClick={() => processVoiceQuery("Give me a short memory trick for this concept.")}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-[#163327] hover:bg-[#1f4535] text-amber-300 text-xs font-bold transition-all border border-[#244f3d]"
                >
                  💡 Memory Trick
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Formula Bank Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white tracking-wider uppercase">
                  Quick Formula Cheat-Sheets
                </h3>
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center space-x-1 text-[11px] font-bold">
                {["All", "Physics", "Mathematics", "Chemistry", "Biology"].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setBoardSubject(sub)}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      boardSubject === sub
                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                        : "text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredFormulas.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => processVoiceQuery(f.query)}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {f.subject} • {f.title}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>

                  <MathRenderer text={f.formula} className="text-xs text-white font-serif" />

                  <p className="text-[11px] text-slate-400 line-clamp-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-full px-5 py-3 shadow-2xl flex items-center justify-between z-50">
        {/* Left Camera Button */}
        <button
          onClick={() => alert("Attachment / Camera doubt solver available in Main Doubt Solver menu!")}
          className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Center Main Circular Mic Syncing Toggle Button */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={handleStartListening}
            className={`w-16 h-16 rounded-full font-bold flex items-center justify-center transition-all shadow-2xl ${
              isListening
                ? "bg-rose-600 text-white animate-pulse shadow-rose-600/50 scale-110"
                : "bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white shadow-orange-500/40 hover:scale-105"
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">
            {isListening ? "LISTENING" : isSpeaking ? "SPEAKING" : "LIVE MIC"}
          </span>
        </div>

        {/* Right Settings / Hub Button */}
        <button
          onClick={() => setActiveTab(activeTab === "tools" ? "mentor" : "tools")}
          className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
