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
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-container"
            onClick={() => setActiveTab("home")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  MedhaPrep
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold tracking-wide">
                  Development by Darkness
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                WBCHSE • WBBSE • JEE Mains • NEET Prep
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <button
              id="nav-wbchse-sem3-btn"
              onClick={() => setActiveTab("wbchse_sem3")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 border shadow-sm ${
                activeTab === "wbchse_sem3"
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-amber-400/20 ring-2 ring-amber-400/30"
                  : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>WBCHSE Sem 3</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 font-black">
                NEW
              </span>
            </button>

            <button
              id="nav-home-btn"
              onClick={() => setActiveTab("home")}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                activeTab === "home"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>

            <button
              id="nav-mock-test-btn"
              onClick={() => setActiveTab("test_creator")}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                activeTab === "test_creator" || activeTab === "active_test"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Mock Test & OMR</span>
            </button>

            <button
              id="nav-notes-btn"
              onClick={() => setActiveTab("notes_generator")}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                activeTab === "notes_generator"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Study Notes & PDF</span>
            </button>

            <button
              id="nav-voice-viva-btn"
              onClick={() => setActiveTab("voice_viva")}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                activeTab === "voice_viva"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-rose-600" />
              <span>Oral Viva</span>
            </button>

            <button
              id="nav-analytics-btn"
              onClick={() => setActiveTab("analytics")}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Action Tools & Settings */}
          <div className="flex items-center space-x-2">
            <button
              id="open-settings-modal-btn"
              onClick={openSettings}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                hasCustomKey
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Configure Gemini API Key & Language Preferences"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">
                {hasCustomKey ? "Custom Key Active" : "API Settings"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bar Sub-navigation */}
      <div id="mobile-bottom-nav" className="md:hidden border-t border-slate-200 bg-white px-2 py-1.5 flex justify-around">
        <button
          onClick={() => setActiveTab("wbchse_sem3")}
          className={`p-1.5 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "wbchse_sem3" ? "text-amber-600 font-bold" : "text-amber-800/80"
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-amber-600" />
          <span>Sem 3</span>
        </button>
        <button
          onClick={() => setActiveTab("test_creator")}
          className={`p-1.5 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "test_creator" || activeTab === "active_test"
              ? "text-indigo-600 font-bold"
              : "text-slate-500"
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>OMR Test</span>
        </button>
        <button
          onClick={() => setActiveTab("notes_generator")}
          className={`p-1.5 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "notes_generator" ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Notes & PDF</span>
        </button>
        <button
          onClick={() => setActiveTab("voice_viva")}
          className={`p-1.5 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "voice_viva" ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <Brain className="w-4 h-4 mb-0.5" />
          <span>Viva</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`p-1.5 rounded-lg flex flex-col items-center text-[10px] ${
            activeTab === "analytics" ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Stats</span>
        </button>
      </div>
    </header>
  );
};
