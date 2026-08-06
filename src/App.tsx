import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HomeOverview } from "./components/HomeOverview";
import { MockTestCreator } from "./components/MockTestCreator";
import { ActiveMockTest } from "./components/ActiveMockTest";
import { VoiceVivaPractice } from "./components/VoiceVivaPractice";
import { AIVoiceCompanion } from "./components/AIVoiceCompanion";
import { NotesGenerator } from "./components/NotesGenerator";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { SettingsModal } from "./components/SettingsModal";
import { QuizTest, TestResult, AppSettings } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeTest, setActiveTest] = useState<QuizTest | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>({
    customApiKey: "",
    preferredLanguage: "Bilingual",
    autoReadVoiceQuestions: true,
  });

  // Load saved settings & test history on initial mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("medhaprep_app_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedResults = localStorage.getItem("medhaprep_test_results");
      if (savedResults) {
        setTestResults(JSON.parse(savedResults));
      }
    } catch (e) {
      console.error("Error loading localStorage data:", e);
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("medhaprep_app_settings", JSON.stringify(newSettings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  };

  const handleTestCreated = (test: QuizTest) => {
    setActiveTest(test);
    setActiveTab("active_test");
  };

  const handleFinishTest = (result: TestResult) => {
    const updated = [result, ...testResults];
    setTestResults(updated);
    try {
      localStorage.setItem("medhaprep_test_results", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving test result:", e);
    }
  };

  const handleClearResults = () => {
    setTestResults([]);
    try {
      localStorage.removeItem("medhaprep_test_results");
    } catch (e) {
      console.error("Error clearing results:", e);
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={Boolean(settings.customApiKey && settings.customApiKey.trim().length > 5)}
      />

      {/* Main Content Area */}
      <main id="main-content-view" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "home" && (
          <HomeOverview
            onStartTest={() => setActiveTab("test_creator")}
            onStartNotes={() => setActiveTab("notes_generator")}
            onStartViva={() => setActiveTab("voice_viva")}
            onStartVoiceCompanion={() => setActiveTab("voice_companion")}
          />
        )}

        {activeTab === "test_creator" && (
          <MockTestCreator
            onTestCreated={handleTestCreated}
            customApiKey={settings.quizApiKey || settings.customApiKey}
            selectedModel={settings.testGeneratorModel}
          />
        )}

        {activeTab === "active_test" && activeTest && (
          <ActiveMockTest
            test={activeTest}
            onFinishTest={handleFinishTest}
            onExit={() => setActiveTab("test_creator")}
            customApiKey={settings.customApiKey}
          />
        )}

        {activeTab === "notes_generator" && (
          <NotesGenerator 
            customApiKey={settings.customApiKey} 
            selectedModel={settings.notesGeneratorModel}
          />
        )}

        {activeTab === "voice_companion" && (
          <AIVoiceCompanion 
            customApiKey={settings.customApiKey} 
            selectedModel={settings.voiceCompanionModel}
          />
        )}

        {activeTab === "voice_viva" && (
          <VoiceVivaPractice customApiKey={settings.customApiKey} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard
            testResults={testResults}
            onClearResults={handleClearResults}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Footer */}
      <footer id="app-footer" className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">MedhaPrep AI</span>
            <span className="text-slate-600">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-[11px] tracking-wide">
              Development by Darkness
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            WBBSE & WBCHSE (Class 9-12), JEE Mains, NEET & WBJEE Preparation
          </p>
        </div>
      </footer>
    </div>
  );
}
