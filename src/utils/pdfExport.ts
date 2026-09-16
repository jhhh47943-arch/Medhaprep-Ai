import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QuizTest, TestResult, StudyNote } from "../types";
import { preprocessMathText, safeRenderKaTeX } from "./mathUtils";

function renderMathInLine(line: string): string {
  const processed = preprocessMathText(line);
  const parts = processed.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts
    .map((part) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        if (!math) return "";
        const html = safeRenderKaTeX(math, true);
        return `<div style="margin: 10px 0; padding: 12px 16px; background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; text-align: center; color: #0f172a; overflow-x: auto; font-size: 15px;">${html}</div>`;
      }
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const math = part.slice(1, -1).trim();
        if (!math) return "";
        const html = safeRenderKaTeX(math, false);
        return `<span style="display: inline-block; padding: 1px 4px; margin: 0 2px; background-color: #f1f5f9; border-radius: 4px; color: #0f172a; font-weight: 600; font-size: 13.5px;">${html}</span>`;
      }
      return part;
    })
    .join("");
}

function formatTextToHTML(text: string): string {
  if (!text) return "";

  const formatted = preprocessMathText(text);

  // Replace markdown **text**
  const bolded = formatted.replace(/\*\*(.*?)\*\*/g, "<strong style='color: #0f172a; font-weight: 700;'>$1</strong>");

  const lines = bolded.split("\n");
  const parsedLines = lines.map((line) => {
    let trimmed = line.trim();
    if (!trimmed) return '<div style="height: 6px;"></div>';

    if (trimmed.startsWith("# ")) {
      return `<h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 14px 0 8px 0; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">${renderMathInLine(
        trimmed.substring(2)
      )}</h3>`;
    }
    if (trimmed.startsWith("## ")) {
      return `<h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 12px 0 6px 0;">${renderMathInLine(
        trimmed.substring(3)
      )}</h4>`;
    }
    if (trimmed.startsWith("### ")) {
      return `<h5 style="font-size: 13px; font-weight: 700; color: #334155; margin: 10px 0 4px 0;">${renderMathInLine(
        trimmed.substring(4)
      )}</h5>`;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return `<div style="display: flex; align-items: flex-start; margin: 5px 0; padding-left: 8px;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #d97706; border-radius: 50%; margin-top: 6px; margin-right: 8px; flex-shrink: 0;"></span><div style="flex: 1; line-height: 1.6; color: #1e293b;">${renderMathInLine(
        trimmed.substring(2)
      )}</div></div>`;
    }

    return `<div style="margin: 5px 0; line-height: 1.6; color: #1e293b;">${renderMathInLine(trimmed)}</div>`;
  });

  return parsedLines.join("");
}

export async function exportTestToPDF(test: QuizTest, result?: TestResult) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "820px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.fontFamily = "'Plus Jakarta Sans', 'Hind Siliguri', 'Noto Sans Bengali', 'Times New Roman', serif, sans-serif";
  container.style.padding = "28px 32px";
  container.style.boxSizing = "border-box";

  const totalMarks = test.questions.length * (test.questions[0]?.type === "MCQ" ? 1 : 4);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Cinzel:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
      * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', 'Hind Siliguri', 'Noto Sans Bengali', 'Times New Roman', serif, sans-serif; }
      .katex { font-size: 1.08em !important; }
      .katex-display { margin: 8px 0 !important; }
      .exam-border { border: 2.5px solid #0f172a; padding: 2.5px; border-radius: 4px; }
      .exam-inner-border { border: 1.2px solid #0f172a; padding: 16px 20px; }
    </style>
    
    <!-- Real Board Question Paper Header (Authentic Double Border) -->
    <div class="exam-border" style="margin-bottom: 18px; background: #ffffff;">
      <div class="exam-inner-border">
        <!-- Top Board Crest & Text -->
        <div style="text-align: center; border-bottom: 1.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="font-family: 'Cinzel', 'Times New Roman', serif; font-size: 16px; font-weight: 800; letter-spacing: 1.8px; color: #0f172a; text-transform: uppercase;">
            ${(test.board || "WEST BENGAL COUNCIL OF HIGHER SECONDARY EDUCATION").toUpperCase()}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 2px 0;">
            পশ্চিমবঙ্গ উচ্চমাধ্যমিক শিক্ষা সংসদ • উচ্চমাধ্যমিক পরীক্ষা (একাদশ/দ্বাদশ শ্রেণি)
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #000000; text-transform: uppercase; margin: 4px 0 2px 0; letter-spacing: 1px;">
            ${test.subject.toUpperCase()} (NEW SYLLABUS / সেমিস্টার পদ্ধতি)
          </div>
          <div style="font-size: 12.5px; font-weight: 700; color: #334155;">
            TOPIC / অধ্যায়: <span style="text-decoration: underline; color: #000000;">${test.topic}</span>
          </div>
        </div>

        <!-- Official Time & Marks Distribution Strip -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #0f172a; padding-bottom: 8px; border-bottom: 1px solid #cbd5e1;">
          <div><strong>Time Allowed / নির্ধারিত সময় :</strong> ${test.timerMinutes > 0 ? `${test.timerMinutes} Minutes` : "1 Hour 15 Minutes"}</div>
          <div><strong>Full Marks / পূর্ণমান :</strong> ${totalMarks}</div>
          <div><strong>Date / তারিখ :</strong> ${dateStr}</div>
        </div>

        <!-- Real Candidate Information Fill-in Box -->
        <div style="margin-top: 8px; display: grid; grid-template-columns: 1.8fr 1.2fr 1fr; gap: 8px; font-size: 11px; color: #1e293b;">
          <div><strong>Candidate's Name :</strong> ..............................................................</div>
          <div><strong>Roll :</strong> [ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ] &nbsp; <strong>No :</strong> [ &nbsp; ][ &nbsp; ][ &nbsp; ]</div>
          <div><strong>Regn. No :</strong> ................................</div>
        </div>
      </div>
    </div>

    <!-- Official Candidate Instructions (সাধারণ নির্দেশাবলী) -->
    <div style="background-color: #f8fafc; border: 1.2px solid #0f172a; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 11.5px; color: #1e293b; line-height: 1.55;">
      <div style="font-weight: 800; color: #000000; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
        📌 Special Instructions for Candidates (পরীক্ষার্থীদের জন্য বিশেষ নির্দেশাবলী):
      </div>
      <div>১. <strong>পরিমিত এবং যথাযথ উত্তরের জন্য বিশেষ মূল্য দেওয়া হবে।</strong> বর্ণাশুদ্ধি, অপরিচ্ছন্নতা এবং অপরিষ্কার হস্তাক্ষরের ক্ষেত্রে নম্বর কেটে নেওয়া হতে পারে।</div>
      <div>২. Candidates are required to give their answers in their own words as far as practicable.</div>
      <div>৩. <strong>প্রান্তস্থ সংখ্যাগুলি প্রশ্নের পূর্ণমান নির্দেশ করে।</strong> (The figures in the right-hand margin indicate full marks.)</div>
      <div>৪. প্রতিটি বহুবিকল্পভিত্তিক প্রশ্নের জন্য কেবল একটিই সঠিক উত্তর নির্বাচন করো এবং নির্ধারিত স্থানে বা ওএমআর শিটে চিহ্নিত করো।</div>
    </div>
  `;

  // If result is present, display Official Performance Scorecard
  if (result) {
    const accuracy = result.totalQuestions > 0 ? Math.round((result.correctCount / (result.correctCount + result.wrongCount || 1)) * 100) : 0;
    const grade = result.scorePercentage >= 90 ? "AA (Outstanding)" : result.scorePercentage >= 80 ? "A+ (Excellent)" : result.scorePercentage >= 70 ? "A (Very Good)" : result.scorePercentage >= 60 ? "B+ (Good)" : "B (Satisfactory)";

    html += `
      <div style="background-color: #ffffff; border: 2px solid #0284c7; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">
              🏆 OFFICIAL PERFORMANCE SCORECARD & EVALUATION REPORT
            </div>
            <div style="font-size: 12px; color: #475569; font-weight: 600;">
              WBCHSE Sem 3 Standard OMR Evaluation • Model Answer Validation
            </div>
          </div>
          <div style="background: #0284c7; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 800;">
            Grade: ${grade}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; text-align: center;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">Marks Obtained</div>
            <div style="font-size: 18px; font-weight: 800; color: #15803d;">${result.correctCount * (test.questions[0]?.type === "MCQ" ? 1 : 4)} / ${totalMarks}</div>
          </div>
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase;">Percentage</div>
            <div style="font-size: 18px; font-weight: 800; color: #1d4ed8;">${result.scorePercentage}%</div>
          </div>
          <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #854d0e; text-transform: uppercase;">Accuracy</div>
            <div style="font-size: 18px; font-weight: 800; color: #a16207;">${accuracy}%</div>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase;">Time Taken</div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${Math.floor(result.timeSpentSeconds / 60)}m ${result.timeSpentSeconds % 60}s</div>
          </div>
        </div>

        <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 6px;">
          📊 OMR Response Matrix (Question 1 to ${test.questions.length}):
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${test.questions.map((q, qIdx) => {
            const userAns = result.userAnswers[q.id];
            const isCorrect = userAns !== undefined && String(userAns) === String(q.correctAnswer);
            const isSkipped = userAns === undefined || userAns.trim() === "";
            
            const badgeBg = isSkipped ? "#f1f5f9" : isCorrect ? "#dcfce7" : "#fee2e2";
            const badgeColor = isSkipped ? "#475569" : isCorrect ? "#166534" : "#991b1b";
            const symbol = isSkipped ? "-" : isCorrect ? "✓" : "✗";

            return `
              <div style="background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 10.5px; font-weight: 700;">
                Q${qIdx + 1}: ${symbol}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // Authentic Group Header
  html += `
    <div style="margin-bottom: 16px; border-bottom: 2px solid #000000; padding-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <span style="font-size: 15px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
          GROUP - A / বিভাগ - ক
        </span>
        <span style="font-size: 12.5px; font-weight: 600; color: #334155; margin-left: 8px;">
          (বহুবিকল্পভিত্তিক প্রশ্নাবলী / Multiple Choice Questions)
        </span>
      </div>
      <div style="font-size: 12px; font-weight: 800; color: #000000;">
        ১ × ${test.questions.length} = ${totalMarks}
      </div>
    </div>
    <div style="font-size: 12px; font-weight: 700; color: #000000; margin-bottom: 16px; font-style: italic;">
      ১. প্রতিটি প্রশ্নের বিকল্প উত্তরগুলির মধ্য থেকে সঠিক উত্তরটি নির্বাচন করো :
    </div>
  `;

  // Questions Loop
  test.questions.forEach((q, idx) => {
    const userAnsIdx = result?.userAnswers[q.id];

    html += `
      <div style="margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
        <!-- Question Row: Number + Question Text + Marks/PYQ Tag -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
          <div style="display: flex; align-items: flex-start; gap: 8px; flex: 1;">
            <span style="font-size: 14px; font-weight: 800; color: #000000; min-width: 24px;">
              (${idx + 1})
            </span>
            <div style="font-size: 14px; font-weight: 600; color: #000000; line-height: 1.6; flex: 1;">
              ${formatTextToHTML(q.question)}
            </div>
          </div>

          <div style="font-size: 11.5px; font-weight: 800; color: #334155; white-space: nowrap; text-align: right;">
            ${q.pyqTag ? `<span style="border: 1px solid #94a3b8; border-radius: 4px; padding: 1px 5px; font-size: 10px; margin-right: 4px; color: #475569;">${q.pyqTag}</span>` : ""}
            <span>[ 1 ]</span>
          </div>
        </div>

        <!-- Options: Clean Authentic 2-Column Board Exam Format -->
        ${q.options && q.options.length > 0 ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; margin-left: 28px; margin-bottom: 8px;">
            ${q.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = String(oIdx) === userAnsIdx;
              const isCorrectOpt = String(oIdx) === q.correctAnswer;

              let optionStyle = "display: flex; align-items: flex-start; gap: 6px; font-size: 13px; line-height: 1.5; color: #0f172a;";
              let indicator = "";

              if (result) {
                if (isCorrectOpt) {
                  optionStyle = "display: flex; align-items: flex-start; gap: 6px; font-size: 13px; line-height: 1.5; color: #166534; font-weight: 700; background: #f0fdf4; border: 1px solid #86efac; border-radius: 4px; padding: 3px 6px;";
                  indicator = `<span style="margin-left: auto; color: #16a34a; font-size: 11px; font-weight: 800;">✓ [সঠিক উত্তর]</span>`;
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle = "display: flex; align-items: flex-start; gap: 6px; font-size: 13px; line-height: 1.5; color: #991b1b; font-weight: 600; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 4px; padding: 3px 6px;";
                  indicator = `<span style="margin-left: auto; color: #dc2626; font-size: 11px; font-weight: 800;">✗ [আপনার উত্তর]</span>`;
                }
              }

              return `
                <div style="${optionStyle}">
                  <span style="font-weight: 800; min-width: 22px;">(${letter})</span>
                  <div style="flex: 1;">${formatTextToHTML(opt)}</div>
                  ${indicator}
                </div>
              `;
            }).join("")}
          </div>
        ` : ''}

        <!-- If Solved Mode: Authentic Model Solution & Step-by-Step Marking Scheme -->
        ${(result || q.solution) ? `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 3.5px solid #0f172a; border-radius: 6px; padding: 8px 12px; margin-left: 28px; margin-top: 6px; font-size: 12px; color: #1e293b;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; font-size: 11px; margin-bottom: 3px; letter-spacing: 0.3px;">
              📖 আদর্শ সমাধান ও নম্বর বিভাজন (Model Solution & Derivation):
            </div>
            <div style="line-height: 1.6;">
              ${formatTextToHTML(q.solution)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  // If this is pure EXAM mode (not submitted yet), append Space for Rough Work & Authentic Printable OMR Sheet!
  if (!result) {
    html += `
      <!-- Space for Rough Work -->
      <div style="border: 1.5px dashed #64748b; border-radius: 6px; padding: 14px; margin-top: 20px; margin-bottom: 24px; min-height: 120px; page-break-inside: avoid;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 1px; text-align: center; margin-bottom: 4px;">
          SPACE FOR ROUGH WORK / খসড়া কাজের জন্য স্থান
        </div>
      </div>

      <!-- Turn Over indicator -->
      <div style="text-align: right; font-size: 11px; font-weight: 800; color: #000000; margin-bottom: 20px;">
        [ P.T.O. / অপর পৃষ্ঠা দ্রষ্টব্য ]
      </div>

      <!-- Real Official OMR Answer Sheet Page -->
      <div style="page-break-before: always; border: 2.5px solid #0f172a; border-radius: 8px; padding: 18px 22px; background: #ffffff; margin-top: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px;">
          <div style="font-family: 'Cinzel', serif; font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">
            WEST BENGAL COUNCIL OF HIGHER SECONDARY EDUCATION
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #000000; margin-top: 2px;">
            OFFICIAL OMR ANSWER SHEET • ওএমআর উত্তরপত্র
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #334155;">
            Subject: ${test.subject.toUpperCase()} • Topic: ${test.topic}
          </div>
        </div>

        <!-- OMR Marking Guidelines -->
        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; color: #1e293b; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>সঠিক পদ্ধতি :</strong> কালো/নীল বলপয়েন্ট কলম দিয়ে বৃত্তটি সম্পূর্ণ ভরাট করো।
          </div>
          <div style="display: flex; gap: 12px; font-size: 11px; font-weight: 700;">
            <span>সঠিক: <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: #000; vertical-align: middle;"></span></span>
            <span>ভুল: <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #000; text-align: center; line-height: 12px; font-size: 10px; vertical-align: middle;">✓</span></span>
            <span>ভুল: <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #000; text-align: center; line-height: 12px; font-size: 10px; vertical-align: middle;">✗</span></span>
          </div>
        </div>

        <!-- 3-Column OMR Bubbling Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          ${Array.from({ length: test.questions.length }).map((_, i) => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; font-size: 11px;">
              <span style="font-weight: 800; min-width: 32px; color: #0f172a;">Q${i + 1}.</span>
              <div style="display: flex; gap: 6px;">
                ${['A', 'B', 'C', 'D'].map((opt) => `
                  <div style="width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #0f172a; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #0f172a; background: #ffffff;">
                    ${opt}
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Signatures & Official Stamp Footer -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; border-top: 1.5px solid #0f172a; padding-top: 14px; font-size: 11px; text-align: center; color: #334155;">
          <div>
            <div style="height: 30px;"></div>
            <div style="border-top: 1px dotted #000; padding-top: 4px; font-weight: 700;">Signature of Candidate</div>
          </div>
          <div>
            <div style="height: 30px;"></div>
            <div style="border-top: 1px dotted #000; padding-top: 4px; font-weight: 700;">Signature of Invigilator</div>
          </div>
          <div>
            <div style="height: 30px;"></div>
            <div style="border-top: 1px dotted #000; padding-top: 4px; font-weight: 700;">Center Superintendent Seal</div>
          </div>
        </div>
      </div>
    `;
  }

  html += `
    <div style="text-align: center; margin-top: 24px; padding-top: 10px; border-top: 1.5px solid #cbd5e1; font-size: 11px; color: #64748b; font-weight: 600;">
      MedhaPrep AI • West Bengal State Board & Competitive Exam Preparation System • Official Question Paper
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${test.subject.replace(/\s+/g, "_")}_${test.topic.replace(/[^a-zA-Z0-9]/g, "_")}_${result ? "SolvedPaper" : "QuestionPaper"}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportNotesToPDF(note: StudyNote) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "840px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "'Plus Jakarta Sans', 'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif";
  container.style.padding = "36px 40px";
  container.style.boxSizing = "border-box";

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Cinzel:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
      * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', 'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI', sans-serif; }
      .katex { font-size: 1.12em !important; }
      .katex-display { margin: 12px 0 !important; }
    </style>
    
    <!-- Premium Academic Textbook Cover Banner -->
    <div style="border: 2.5px solid #0f172a; border-radius: 14px; padding: 22px 26px; margin-bottom: 24px; background: #ffffff; position: relative;">
      
      <!-- Top Crest & Board Strip -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px;">
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1.5px;">
            ${(note.board || "WBCHSE & JEE / WBJEE PREPARATION").toUpperCase()}
          </div>
          <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 4px;">
            ${note.chapterNumber ? `
              <span style="background: #0f172a; color: #ffffff; font-size: 13px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
                ${note.chapterNumber}
              </span>
            ` : ''}
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.25;">
              ${note.title}
            </h1>
          </div>
          <div style="font-size: 12.5px; color: #475569; font-weight: 600; margin-top: 4px;">
            Comprehensive Academic Textbook Edition &amp; Rigorous Proofs Compendium
          </div>
        </div>
        
        <div style="text-align: right; background: #f8fafc; padding: 10px 16px; border-radius: 10px; border: 1.5px solid #cbd5e1; min-width: 150px;">
          <div style="font-size: 10.5px; color: #64748b; font-weight: 700; text-transform: uppercase;">Subject / Stream</div>
          <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${note.subject || "General Science"}</div>
        </div>
      </div>

      <!-- Note Metadata Grid Strip -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11.5px; color: #334155; background: #f1f5f9; padding: 8px 14px; border-radius: 8px;">
        <div><strong>Edition:</strong> ${note.pageCount || "Full Master Textbook Chapter"}</div>
        <div><strong>Depth:</strong> ${note.detailDepth || "Full Theory, Proofs & Solved Examples"}</div>
        <div><strong>Language:</strong> ${note.language}</div>
        <div><strong>Published:</strong> ${dateStr}</div>
      </div>
    </div>

    <!-- Chapter Executive Overview Summary -->
    ${note.overview ? `
      <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-left: 5px solid #0284c7; border-radius: 12px; padding: 18px 22px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
          <span>📘</span>
          <span>Chapter Executive Concept Map &amp; Theoretical Overview (সামগ্রিক ধারণা ও রূপরেখা)</span>
        </div>
        <div style="font-size: 14px; color: #1e293b; line-height: 1.75;">
          ${formatTextToHTML(note.overview)}
        </div>
      </div>
    ` : ''}

    <!-- Main Content Sections with Derivation Steps & Proofs -->
    ${note.sections && note.sections.length > 0 ? note.sections.map((sec, sIdx) => `
      <div style="background-color: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; page-break-inside: avoid;">
        
        <!-- Section Header -->
        <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span style="background: #0f172a; color: #ffffff; width: 26px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800;">§ ${sIdx + 1}</span>
          <span>${formatTextToHTML(sec.heading)}</span>
        </div>
        
        <!-- Section Core Body with KaTeX Display Formulations -->
        <div style="font-size: 14px; color: #1e293b; line-height: 1.75; margin-bottom: 16px;">
          ${formatTextToHTML(sec.content)}
        </div>

        <!-- Step-by-Step Mathematical Derivations & Proofs Box (if present) -->
        ${sec.derivationSteps && sec.derivationSteps.length > 0 ? `
          <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-left: 5px solid #16a34a; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
            <div style="font-size: 12.5px; font-weight: 800; color: #166534; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between;">
              <span>📐 Step-by-Step Mathematical Derivation &amp; Proof (ধাপভিত্তিক প্রমাণ):</span>
              <span style="background: #16a34a; color: #ffffff; border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 800;">THEOREM PROOF</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${sec.derivationSteps.map((step, stepIdx) => `
                <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #14532d; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #dcfce7;">
                  <span style="color: #166534; font-weight: 800; font-size: 11px; margin-top: 2px;">Step ${stepIdx + 1}:</span>
                  <div style="flex: 1; line-height: 1.6;">${formatTextToHTML(step)}</div>
                </div>
              `).join("")}
            </div>
            <div style="text-align: right; margin-top: 8px; font-size: 14px; color: #166534; font-weight: bold;">
              ∎ (Q.E.D. / প্রমাণিত)
            </div>
          </div>
        ` : ''}

        <!-- Real Exam Worked Example (if present) -->
        ${sec.realExamExample ? `
          <div style="background-color: #f8fafc; border: 1.5px solid #94a3b8; border-left: 4px solid #475569; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; font-size: 13px; color: #1e293b;">
            <strong style="color: #0f172a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">📝 Solved Textbook Example (বইয়ের সমাধানকৃত উদাহরণ):</strong>
            <div style="line-height: 1.65;">${formatTextToHTML(sec.realExamExample)}</div>
          </div>
        ` : ''}

        <!-- Key Takeaways -->
        ${sec.keyTakeaways && sec.keyTakeaways.length > 0 ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-transform: uppercase;">
              💡 High-Yield Key Takeaways (গুরুত্বপূর্ণ বিষয়সংক্ষেপ):
            </div>
            ${sec.keyTakeaways.map((point) => `
              <div style="display: flex; align-items: flex-start; margin: 4px 0; font-size: 13px; color: #334155;">
                <span style="color: #16a34a; font-weight: 800; margin-right: 6px;">✓</span>
                <div style="flex: 1; line-height: 1.5;">${formatTextToHTML(point)}</div>
              </div>
            `).join("")}
          </div>
        ` : ''}
      </div>
    `).join("") : ''}

    <!-- Master Key Formulas, Units & Definitions Sheet -->
    ${note.keyFormulaeAndDefs && note.keyFormulaeAndDefs.length > 0 ? `
      <div style="background-color: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; page-break-inside: avoid;">
        <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span>📐</span>
          <span>Master Formula, Units, Dimensions &amp; Conditions Reference Sheet (গুরুত্বপূর্ণ সূত্রাবলি ও একক)</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${note.keyFormulaeAndDefs.map((item) => `
            <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 14px 16px;">
              <div style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
                ${formatTextToHTML(item.termOrFormula)}
              </div>
              <div style="font-size: 12.5px; color: #475569; line-height: 1.5; margin-bottom: 6px;">
                ${formatTextToHTML(item.explanation)}
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${item.unitOrDimension ? `
                  <div style="display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; border-radius: 4px; padding: 2px 6px; font-size: 10.5px; font-weight: 700;">
                    Unit/Dim: ${item.unitOrDimension}
                  </div>
                ` : ''}
                ${item.conditions ? `
                  <div style="display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 4px; padding: 2px 6px; font-size: 10.5px; font-weight: 700;">
                    Condition: ${item.conditions}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <!-- Exam Shortcut Tricks & Mnemonics -->
    ${note.shortTricks && note.shortTricks.length > 0 ? `
      <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; page-break-inside: avoid;">
        <div style="font-size: 17px; font-weight: 800; color: #92400e; margin-bottom: 14px; border-bottom: 1.5px solid #fde68a; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span>
          <span>WBCHSE &amp; JEE Exam Shortcut Tricks &amp; Rapid Elimination (পরীক্ষার শর্টকাট কৌশল)</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          ${note.shortTricks.map((trick) => `
            <div style="background-color: #ffffff; border: 1.5px solid #fcd34d; border-radius: 10px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 13.5px; font-weight: 800; color: #78350f; margin-bottom: 6px;">
                ${formatTextToHTML(trick.trickTitle)}
              </div>
              ${trick.conceptOrFormula ? `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #334155; margin-bottom: 6px;">
                  <strong style="color: #64748b;">Formula / Principle:</strong> ${formatTextToHTML(trick.conceptOrFormula)}
                </div>
              ` : ''}
              <div style="font-size: 12.5px; color: #451a03; line-height: 1.55; background: #fff7ed; padding: 8px 10px; border-radius: 6px; border: 1px solid #ffedd5;">
                <strong style="color: #ea580c;">⚡ Shortcut Technique:</strong> ${formatTextToHTML(trick.shortcutMethod)}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <!-- Practice Problems & Solved PYQs -->
    ${note.practiceQuestions && note.practiceQuestions.length > 0 ? `
      <div style="background-color: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; page-break-inside: avoid;">
        <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span>📝</span>
          <span>High-Yield Practice Questions &amp; Step-by-Step Model Answers (মডেল সমাধান)</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${note.practiceQuestions.map((qna, qIdx) => `
            <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 14px 18px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; flex: 1;">
                  Q${qIdx + 1}: ${formatTextToHTML(qna.question)}
                </div>
                ${qna.pyqTag ? `
                  <span style="background: #e2e8f0; color: #334155; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #cbd5e1; margin-left: 8px; white-space: nowrap;">
                    ${qna.pyqTag}
                  </span>
                ` : ''}
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1e293b; line-height: 1.65;">
                <strong style="color: #166534;">Answer &amp; Step-by-Step Method:</strong>
                <div style="margin-top: 4px;">${formatTextToHTML(qna.answer)}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <!-- High-Yield Golden Revision Bullet Points -->
    ${note.shortRevisionPoints && note.shortRevisionPoints.length > 0 ? `
      <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px 22px; margin-bottom: 24px; page-break-inside: avoid;">
        <div style="font-size: 14px; font-weight: 800; color: #166534; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
          🎯 60-Second Rapid Recall &amp; Exam Checklist (দ্রুত পুনরাবৃত্তি পয়েন্ট):
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          ${note.shortRevisionPoints.map((pt) => `
            <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #14532d;">
              <span style="color: #16a34a; font-weight: 800;">★</span>
              <div style="line-height: 1.5;">${formatTextToHTML(pt)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <!-- Official Textbook Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 16px; border-top: 2px solid #cbd5e1; font-size: 11.5px; color: #64748b; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
      <span>MedhaPrep AI • Academic Excellence &amp; Concept Mastery System</span>
      <span>${note.subject || "Study Notes"} • Page 1 of ${note.pageCount?.split(" ")[0] || "3"}</span>
      <span>West Bengal Board &amp; Competitive Exam Format</span>
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${(note.subject || "Study").replace(/\s+/g, "_")}_${note.title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.pdf`);
  } catch (err) {
    console.error("Notes PDF generation error:", err);
  } finally {
    document.body.removeChild(container);
  }
}
