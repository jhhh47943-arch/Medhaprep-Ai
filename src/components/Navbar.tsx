import React from "react";
import {
  Sparkles,
  BookOpen,
  FileText,
  Mic,
  BarChart3,
  Settings,
  HelpCircle,
  Brain,
  Globe,
  Key,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  hasCustomKey,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-container"
            onClick={() => setActiveTab("home")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  MedhaPrep
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold tracking-wide">
                  Development by Darkness
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                WBCHSE • WBBSE • JEE Mains • NEET Prep
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-home-btn"
              onClick={() => setActiveTab("home")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "home"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>About & Guide</span>
            </button>

            <button
              id="nav-mock-test-btn"
              onClick={() => setActiveTab("test_creator")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "test_creator" || activeTab === "active_test"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Mock Test</span>
            </button>

            <button
              id="nav-notes-btn"
              onClick={() => setActiveTab("notes_generator")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "notes_generator"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>YT & PDF Notes</span>
            </button>

            <button
              id="nav-voice-companion-btn"
              onClick={() => setActiveTab("voice_companion")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "voice_companion"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Mic className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>AI Voice Tutor</span>
            </button>

            <button
              id="nav-voice-viva-btn"
              onClick={() => setActiveTab("voice_viva")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "voice_viva"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Brain className="w-4 h-4 text-rose-400" />
              <span>Voice Viva</span>
            </button>

            <button
              id="nav-analytics-btn"
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Action Tools & Settings */}
          <div className="flex items-center space-x-2">
            <button
              id="open-settings-modal-btn"
              onClick={openSettings}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                hasCustomKey
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title="Configure Gemini API Key & Language Preferences"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {hasCustomKey ? "Custom Key Active" : "API Settings"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bar Sub-navigation */}
      <div id="mobile-bottom-nav" className="md:hidden border-t border-slate-800 bg-slate-900 px-2 py-1.5 flex justify-around">
        <button
          onClick={() => setActiveTab("home")}
          className={`p-2 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "home" ? "text-indigo-400 font-bold" : "text-slate-400"
          }`}
        >
          <HelpCircle className="w-4 h-4 mb-0.5" />
          <span>About</span>
        </button>
        <button
          onClick={() => setActiveTab("test_creator")}
          className={`p-2 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "test_creator" || activeTab === "active_test"
              ? "text-indigo-400 font-bold"
              : "text-slate-400"
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Test AI</span>
        </button>
        <button
          onClick={() => setActiveTab("notes_generator")}
          className={`p-2 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "notes_generator" ? "text-indigo-400 font-bold" : "text-slate-400"
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Notes</span>
        </button>
        <button
          onClick={() => setActiveTab("voice_companion")}
          className={`p-2 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "voice_companion" ? "text-purple-400 font-bold" : "text-slate-400"
          }`}
        >
          <Mic className="w-4 h-4 mb-0.5 text-purple-400" />
          <span>Voice Tutor</span>
        </button>
        <button
          onClick={() => setActiveTab("voice_viva")}
          className={`p-2 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "voice_viva" ? "text-indigo-400 font-bold" : "text-slate-400"
          }`}
        >
          <Brain className="w-4 h-4 mb-0.5" />
          <span>Viva</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`p-2 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "analytics" ? "text-indigo-400 font-bold" : "text-slate-400"
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Analytics</span>
        </button>
      </div>
    </header>
  );
};
