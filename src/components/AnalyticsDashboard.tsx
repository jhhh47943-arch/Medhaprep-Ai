import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  TrendingUp,
  Brain,
  Target,
} from "lucide-react";
import { TestResult } from "../types";

interface AnalyticsDashboardProps {
  testResults: TestResult[];
  onClearResults: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  testResults,
  onClearResults,
}) => {
  const totalTests = testResults.length;

  const avgScore = totalTests > 0
    ? Math.round(testResults.reduce((acc, r) => acc + r.scorePercentage, 0) / totalTests)
    : 0;

  const totalTimeSecs = testResults.reduce((acc, r) => acc + r.timeSpentSeconds, 0);
  const totalMins = Math.floor(totalTimeSecs / 60);

  const totalQuestions = testResults.reduce((acc, r) => acc + r.totalQuestions, 0);
  const totalCorrect = testResults.reduce((acc, r) => acc + r.correctCount, 0);

  // Group by Subject for Weak Area Detection
  const subjectMap: Record<string, { totalScore: number; count: number; weakTopics: string[] }> = {};

  testResults.forEach((r) => {
    if (!subjectMap[r.subject]) {
      subjectMap[r.subject] = { totalScore: 0, count: 0, weakTopics: [] };
    }
    subjectMap[r.subject].totalScore += r.scorePercentage;
    subjectMap[r.subject].count += 1;
    if (r.scorePercentage < 60 && !subjectMap[r.subject].weakTopics.includes(r.topic)) {
      subjectMap[r.subject].weakTopics.push(r.topic);
    }
  });

  const chartData = testResults.slice(-10).map((r, idx) => ({
    name: `Test ${idx + 1}`,
    score: r.scorePercentage,
    topic: r.topic.length > 15 ? r.topic.substring(0, 15) + "..." : r.topic,
  }));

  return (
    <div id="analytics-dashboard-container" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Performance Analytics Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Track Exam Mastery & Weak Area Alerts
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Analyze score trends, topic accuracy, time efficiency, and target chapters needing revision.
          </p>
        </div>

        {totalTests > 0 && (
          <button
            onClick={onClearResults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700 shrink-0"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Reset History</span>
          </button>
        )}
      </div>

      {/* High-Level Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Tests Attempted</span>
          <p className="text-2xl font-extrabold text-slate-900">{totalTests}</p>
          <span className="text-[10px] text-slate-400">Mock papers completed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Average Score</span>
          <p className={`text-2xl font-extrabold ${avgScore >= 60 ? "text-emerald-600" : "text-amber-600"}`}>
            {avgScore}%
          </p>
          <span className="text-[10px] text-slate-400">Across all tests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Accuracy Rate</span>
          <p className="text-2xl font-extrabold text-indigo-600">
            {totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%
          </p>
          <span className="text-[10px] text-slate-400">{totalCorrect}/{totalQuestions} questions correct</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Study Time</span>
          <p className="text-2xl font-extrabold text-cyan-600">{totalMins} mins</p>
          <span className="text-[10px] text-slate-400">Time spent in tests</span>
        </div>
      </div>

      {/* Recharts Score Trend Graph */}
      {chartData.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Recent Score Percentage Trends</span>
            </h3>
            <span className="text-xs text-slate-500">Last 10 Attempted Tests</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "Score"]}
                  labelFormatter={(label: any, payload: any) =>
                    payload[0] ? `${label} - ${payload[0].payload.topic}` : label
                  }
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none" }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 70 ? "#10b981" : entry.score >= 50 ? "#6366f1" : "#f43f5e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <Brain className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Test History Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Generate and complete AI mock tests to view your performance metrics, score trends, and weak topic alerts here.
          </p>
        </div>
      )}

      {/* Weak Areas Alert Card */}
      {Object.keys(subjectMap).some((s) => subjectMap[s].weakTopics.length > 0) && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Target Revision Needed (Score &lt; 60%)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(subjectMap).map((sub) => {
              const weak = subjectMap[sub].weakTopics;
              if (weak.length === 0) return null;
              return (
                <div key={sub} className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                  <p className="font-bold text-xs text-slate-900">{sub}</p>
                  <p className="text-xs text-slate-600">
                    Weak Chapters: <span className="font-semibold text-rose-600">{weak.join(", ")}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Test History Table */}
      {testResults.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
            Test Attempt History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold">
                <tr>
                  <th className="p-3">Test / Topic</th>
                  <th className="p-3">Board</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Time Spent</th>
                  <th className="p-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{r.topic}</td>
                    <td className="p-3 text-slate-600">{r.board}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          r.scorePercentage >= 60
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {r.scorePercentage}%
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {Math.floor(r.timeSpentSeconds / 60)}m {r.timeSpentSeconds % 60}s
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(r.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
