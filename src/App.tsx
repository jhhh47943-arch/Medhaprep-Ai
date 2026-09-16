import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HomeOverview } from "./components/HomeOverview";
import { WBCHSESem3Hub } from "./components/WBCHSESem3Hub";
import { MockTestCreator } from "./components/MockTestCreator";
import { ActiveMockTest } from "./components/ActiveMockTest";
import { VoiceVivaPractice } from "./components/VoiceVivaPractice";
import { NotesGenerator } from "./components/NotesGenerator";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { SettingsModal } from "./components/SettingsModal";
import { QuizTest, TestResult, AppSettings, ExamBoard } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("wbchse_sem3");
  const [activeTest, setActiveTest] = useState<QuizTest | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Contextual topic & subject navigation state from WBCHSE Sem 3 Hub
  const [contextBoard, setContextBoard] = useState<ExamBoard>("WBCHSE Class 12 (Semester 3)");
  const [contextClass, setContextClass] = useState<string>("Class 12 (Semester 3)");
  const [contextSubject, setContextSubject] = useState<string>("Physics");
  const [contextTopic, setContextTopic] = useState<string>("Electrostatics: Electric Charges and Fields");

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

  // Quick Action Handlers from WBCHSE Sem 3 Hub
  const handleLaunchSem3MockTest = (subjectName: string, chapterName: string) => {
    setContextBoard("WBCHSE Class 12 (Semester 3)");
    setContextClass("Class 12 (Semester 3)");
    setContextSubject(subjectName);
    setContextTopic(chapterName);
    setActiveTab("test_creator");
  };

  const handleLaunchSem3Notes = (subjectName: string, chapterName: string) => {
    setContextSubject(subjectName);
    setContextTopic(chapterName);
    setActiveTab("notes_generator");
  };

  const handleLaunchSem3Viva = (subjectName: string, chapterName: string) => {
    setContextBoard("WBCHSE Class 12 (Semester 3)");
    setContextSubject(subjectName);
    setContextTopic(chapterName);
    setActiveTab("voice_viva");
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={Boolean(settings.customApiKey && settings.customApiKey.trim().length > 5)}
      />

      {/* Main Content Area */}
      <main id="main-content-view" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "wbchse_sem3" && (
          <WBCHSESem3Hub
            onSelectForMockTest={handleLaunchSem3MockTest}
            onSelectForNotes={handleLaunchSem3Notes}
            onSelectForViva={handleLaunchSem3Viva}
          />
        )}

        {activeTab === "home" && (
          <HomeOverview
            onStartTest={() => setActiveTab("test_creator")}
            onStartNotes={() => setActiveTab("notes_generator")}
            onStartViva={() => setActiveTab("voice_viva")}
            onStartWBCHSESem3={() => setActiveTab("wbchse_sem3")}
          />
        )}

        {activeTab === "test_creator" && (
          <MockTestCreator
            key={`${contextBoard}-${contextSubject}-${contextTopic}`}
            initialBoard={contextBoard}
            initialClass={contextClass}
            initialSubject={contextSubject}
            initialTopic={contextTopic}
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
            key={`${contextSubject}-${contextTopic}`}
            initialSubject={contextSubject}
            initialTopic={contextTopic}
            customApiKey={settings.customApiKey} 
            selectedModel={settings.notesGeneratorModel}
          />
        )}

        {activeTab === "voice_viva" && (
          <VoiceVivaPractice 
            key={`${contextBoard}-${contextSubject}-${contextTopic}`}
            initialBoard={contextBoard}
            initialSubject={contextSubject}
            initialTopic={contextTopic}
            customApiKey={settings.customApiKey} 
          />
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
      <footer id="app-footer" className="bg-white border-t border-slate-200 text-slate-500 py-6 text-center text-xs shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">MedhaPrep AI</span>
            <span className="text-slate-400">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[11px] tracking-wide">
              WBCHSE Class 12 Semester 3 Official Ready
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            WBCHSE (Physics, Chemistry, Math, Bio, COMS, COMA, English, Bengali), WBBSE, JEE Mains, NEET & WBJEE
          </p>
        </div>
      </footer>
    </div>
  );
}
