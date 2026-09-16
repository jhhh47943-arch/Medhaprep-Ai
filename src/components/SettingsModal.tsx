import React, { useState } from "react";
import { Key, X, Check, Globe, Volume2, Shield, Trash2, ExternalLink, KeyRound, AlertTriangle, Sparkles, Cpu } from "lucide-react";
import { AppSettings, LanguageMode, GeminiModelType } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.customApiKey || "");
  const [quizApiKey, setQuizApiKey] = useState(settings.quizApiKey || "");
  const [language, setLanguage] = useState<LanguageMode>(settings.preferredLanguage || "Bilingual");
  const [autoRead, setAutoRead] = useState(settings.autoReadVoiceQuestions ?? true);
  
  const [testModel, setTestModel] = useState<GeminiModelType>(settings.testGeneratorModel || "gemini-3.5-flash");
  const [notesModel, setNotesModel] = useState<GeminiModelType>(settings.notesGeneratorModel || "gemini-3.1-pro-preview");
  const [voiceModel, setVoiceModel] = useState<GeminiModelType>(settings.voiceCompanionModel || "gemini-3.6-flash");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      customApiKey: apiKey.trim(),
      quizApiKey: quizApiKey.trim(),
      preferredLanguage: language,
      autoReadVoiceQuestions: autoRead,
      testGeneratorModel: testModel,
      notesGeneratorModel: notesModel,
      voiceCompanionModel: voiceModel,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClearKey = () => {
    setApiKey("");
    setQuizApiKey("");
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2000);
  };

  return (
    <div id="settings-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="settings-modal-content" className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-900 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">API &amp; AI Model Settings</h2>
              <p className="text-[11px] text-slate-500">Configure Gemini API key and model routing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* SECTION 1: Personal Gemini API Key */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-emerald-700 tracking-wider uppercase flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PERSONAL GEMINI API KEY</span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Add your Gemini API Key to run your AI Study Mentor (তোমার নিজস্ব এপিআই কি ব্যবহার করতে পারো):
                </p>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-extrabold text-[11px] flex items-center space-x-1 transition-all shrink-0 ml-2"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Instruction Box */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-700 font-black tracking-wider uppercase text-[11px]">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                <span>HOW TO GET A 100% FREE GEMINI API KEY:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 leading-relaxed">
                <li>Click the <strong className="text-slate-900">&quot;Get Free Key&quot;</strong> button above to open Google AI Studio.</li>
                <li>Sign in with your Google account.</li>
                <li>Click <strong className="text-slate-900">&quot;Create API key&quot;</strong> &rarr; <em className="text-amber-800 not-italic">&quot;Create API key in new project&quot;</em>.</li>
                <li>Copy your key (starts with <code className="px-1 py-0.5 bg-slate-100 text-amber-800 rounded font-mono text-[10px]">AIzaSy...</code>) and paste it below.</li>
              </ol>
            </div>

            {/* API Key Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your GEMINI_API_KEY"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-rose-500 hover:text-rose-700 transition-colors"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {clearedNotice && (
              <p className="text-[11px] text-rose-600 font-bold animate-fade-in">
                ✓ API Keys cleared! Will use default system key.
              </p>
            )}
          </div>

          {/* SECTION 2: Quiz & Math API Key */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-indigo-700 tracking-wider uppercase flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>QUIZ &amp; MATH API KEY</span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Dedicated key for Quizzes, Mock Tests, and Math Problems (কুইজ এবং গণিত সমাধানের জন্য আলাদা এপিআই কি ব্যবহার করতে পারো):
                </p>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 text-indigo-900 text-[10px] font-bold flex items-center space-x-1 shrink-0 ml-2"
              >
                <span>Get Key (এপিআই কি নাও)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={quizApiKey}
                onChange={(e) => setQuizApiKey(e.target.value)}
                placeholder="Same as Mentor Key"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* SECTION 3: Select Gemini Models */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-black text-amber-800 tracking-wider uppercase flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>SELECT GEMINI MODELS (মডেল বেছে নাও):</span>
            </h3>

            {/* Quizzes & Speed Blitz Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-emerald-700 font-extrabold">Quizzes &amp; Speed Blitz:</span>
                <span className="text-slate-500 font-normal">gemini-3.5-flash</span>
              </label>

              <select
                value={testModel}
                onChange={(e) => setTestModel(e.target.value as GeminiModelType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Latest &amp; Super Smart)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast, Zero Overload)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Extremely Intelligent - Paid Key)</option>
              </select>
            </div>

            {/* Science & Math Solver Dropdown */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                <span className="text-sky-700 font-extrabold">Science &amp; Math Solver:</span>
                <span className="text-slate-500 font-normal">gemini-3.7-flash</span>
              </label>

              <select
                value={notesModel}
                onChange={(e) => setNotesModel(e.target.value as GeminiModelType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (High reasoning, recommended)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Instant solve, bypasses High Demand)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep reasoning - Paid Key)</option>
              </select>
            </div>

            {/* High Demand Warning Banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Note:</strong> &quot;High Demand&quot; error ashle simple-vabe model dropdown theke <strong className="text-amber-800 font-mono">gemini-3.1-flash-lite</strong> build select koro (Allows you to bypass model overload easily!).
              </p>
            </div>
          </div>

          {/* SECTION 4: Language & Voice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>Default Language</span>
              </label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageMode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
              >
                <option value="Bilingual">Bilingual (English + Bengali বাংলা)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Speech Voice</span>
                </span>
                <p className="text-[10px] text-slate-500">Read questions aloud</p>
              </div>

              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
              />
            </div>
          </div>

          {/* SECTION 5: Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Settings Preferences</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


