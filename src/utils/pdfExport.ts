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
        return `<div style="margin: 8px 0; padding: 10px 14px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center; color: #0f172a; overflow-x: auto;">${html}</div>`;
      }
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const math = part.slice(1, -1).trim();
        if (!math) return "";
        const html = safeRenderKaTeX(math, false);
        return `<span style="display: inline-block; padding: 2px 6px; margin: 0 2px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; color: #1e1b4b; font-weight: 700; font-size: 13px;">${html}</span>`;
      }
      return part;
    })
    .join("");
}

function formatTextToHTML(text: string): string {
  if (!text) return "";

  const formatted = preprocessMathText(text);

  // Replace markdown **text**
  const bolded = formatted.replace(/\*\*(.*?)\*\*/g, "<strong style='color: #1e1b4b; font-weight: 700;'>$1</strong>");

  const lines = bolded.split("\n");
  const parsedLines = lines.map((line) => {
    let trimmed = line.trim();
    if (!trimmed) return '<div style="height: 6px;"></div>';

    if (trimmed.startsWith("# ")) {
      return `<h3 style="font-size: 16px; font-weight: 800; color: #1e1b4b; margin: 12px 0 6px 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px;">${renderMathInLine(
        trimmed.substring(2)
      )}</h3>`;
    }
    if (trimmed.startsWith("## ")) {
      return `<h4 style="font-size: 14px; font-weight: 700; color: #312e81; margin: 10px 0 4px 0;">${renderMathInLine(
        trimmed.substring(3)
      )}</h4>`;
    }
    if (trimmed.startsWith("### ")) {
      return `<h5 style="font-size: 13px; font-weight: 700; color: #4338ca; margin: 8px 0 4px 0;">${renderMathInLine(
        trimmed.substring(4)
      )}</h5>`;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return `<div style="display: flex; align-items: flex-start; margin: 4px 0; padding-left: 8px;"><span style="display: inline-block; width: 6px; height: 6px; background-color: #d97706; border-radius: 50%; margin-top: 6px; margin-right: 8px; flex-shrink: 0;"></span><div style="flex: 1; line-height: 1.5; color: #1e293b;">${renderMathInLine(
        trimmed.substring(2)
      )}</div></div>`;
    }

    return `<div style="margin: 4px 0; line-height: 1.5; color: #1e293b;">${renderMathInLine(trimmed)}</div>`;
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
  container.style.color = "#0f172a";
  container.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif";
  container.style.padding = "28px 32px";
  container.style.boxSizing = "border-box";

  let html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
      * { box-sizing: border-box; font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI', sans-serif; }
      .katex { font-size: 1.05em !important; }
      .katex-display { margin: 8px 0 !important; }
    </style>
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 22px 26px; border-radius: 12px; margin-bottom: 22px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="color: #fbbf24; font-weight: 800; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">MedhaPrep AI • Practice & Exam Suite</div>
          <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">${test.title || `${test.subject} Mock Test`}</h1>
        </div>
        <div style="text-align: right; background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
          <div style="font-size: 11px; color: #cbd5e1;">Target Board</div>
          <div style="font-size: 13px; font-weight: 700; color: #fbbf24;">${test.board}</div>
        </div>
      </div>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 12px; color: #e2e8f0; display: flex; flex-wrap: wrap; gap: 16px;">
        <span><strong>Subject:</strong> ${test.subject}</span>
        <span>•</span>
        <span><strong>Topic:</strong> ${test.topic}</span>
        <span>•</span>
        <span><strong>Difficulty:</strong> ${test.difficulty}</span>
        <span>•</span>
        <span><strong>Total Qs:</strong> ${test.questions.length}</span>
      </div>
    </div>
  `;

  if (result) {
    html += `
      <!-- Score Summary Card -->
      <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px 22px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Test Result Summary</span>
          <div style="font-size: 22px; font-weight: 800; color: ${result.scorePercentage >= 60 ? '#166534' : '#991b1b'}; margin-top: 2px;">
            Score: ${result.scorePercentage}% (${result.correctCount}/${result.totalQuestions} Correct)
          </div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #475569;">
          <div><strong>Time Spent:</strong> ${Math.floor(result.timeSpentSeconds / 60)} mins ${result.timeSpentSeconds % 60} secs</div>
          <div style="margin-top: 2px; color: #0284c7; font-weight: 600;">Status: Completed</div>
        </div>
      </div>
    `;
  }

  // Questions loop
  test.questions.forEach((q, idx) => {
    const userAnsIdx = result?.userAnswers[q.id];

    html += `
      <div style="background-color: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); page-break-inside: avoid;">
        <!-- Question Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background-color: #1e1b4b; color: #fbbf24; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
              Question ${idx + 1}
            </span>
            <span style="background-color: #e0e7ff; color: #3730a3; font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 6px;">
              ${q.type}
            </span>
            ${q.pyqTag ? `<span style="background-color: #fef3c7; color: #92400e; font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid #fde68a;">${q.pyqTag}</span>` : ''}
          </div>
        </div>

        <!-- Question Body -->
        <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 14px; line-height: 1.6;">
          ${formatTextToHTML(q.question)}
        </div>

        <!-- Options list -->
        ${q.options && q.options.length > 0 ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
            ${q.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = String(oIdx) === userAnsIdx;
              const isCorrectOpt = String(oIdx) === q.correctAnswer;

              let bg = "#f8fafc";
              let border = "#e2e8f0";
              let textColor = "#334155";
              let badgeBg = "#e2e8f0";
              let badgeColor = "#475569";
              let statusTag = "";

              if (result) {
                if (isCorrectOpt) {
                  bg = "#f0fdf4";
                  border = "#22c55e";
                  textColor = "#14532d";
                  badgeBg = "#16a34a";
                  badgeColor = "#ffffff";
                  statusTag = `<span style="margin-left: auto; color: #16a34a; font-weight: 800; font-size: 12px;">✓ Correct</span>`;
                } else if (isSelected && !isCorrectOpt) {
                  bg = "#fef2f2";
                  border = "#ef4444";
                  textColor = "#7f1d1d";
                  badgeBg = "#dc2626";
                  badgeColor = "#ffffff";
                  statusTag = `<span style="margin-left: auto; color: #dc2626; font-weight: 800; font-size: 12px;">✗ Your Choice</span>`;
                }
              } else if (isSelected) {
                bg = "#eef2ff";
                border = "#6366f1";
                textColor = "#1e1b4b";
                badgeBg = "#4f46e5";
                badgeColor = "#ffffff";
              }

              return `
                <div style="background-color: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 10px;">
                  <span style="background-color: ${badgeBg}; color: ${badgeColor}; width: 24px; height: 24px; border-radius: 6px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${letter}
                  </span>
                  <div style="font-size: 13px; font-weight: 500; color: ${textColor}; flex: 1;">
                    ${formatTextToHTML(opt)}
                  </div>
                  ${statusTag}
                </div>
              `;
            }).join("")}
          </div>
        ` : ''}

        <!-- Solution Box -->
        ${(result || q.solution) ? `
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 14px 18px; margin-top: 12px;">
            <div style="font-size: 12px; font-weight: 800; color: #3730a3; margin-bottom: 6px;">
              📖 Detailed Solution & Explanation (ব্যাখ্যাসহ সমাধান):
            </div>
            <div style="font-size: 13px; color: #1e293b; line-height: 1.6;">
              ${formatTextToHTML(q.solution)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `
    <div style="text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
      Generated by MedhaPrep AI • Smart Exam & Revision Suite
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for font ready & KaTeX layout
  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

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

    pdf.save(`${test.subject.replace(/\s+/g, "_")}_MockTest_${Date.now()}.pdf`);
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
  container.style.width = "820px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif";
  container.style.padding = "28px 32px";
  container.style.boxSizing = "border-box";

  let html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
      * { box-sizing: border-box; font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI', sans-serif; }
      .katex { font-size: 1.05em !important; }
      .katex-display { margin: 8px 0 !important; }
    </style>
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 22px 26px; border-radius: 12px; margin-bottom: 22px;">
      <div style="color: #fbbf24; font-weight: 800; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">MedhaPrep AI • Smart Study Notes</div>
      <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">${note.title}</h1>
      <div style="margin-top: 10px; font-size: 12px; color: #cbd5e1;">
        Subject: <strong>${note.subject || "General"}</strong> • Language: <strong>${note.language}</strong>
      </div>
    </div>
  `;

  if (note.overview) {
    html += `
      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 10px; padding: 16px 20px; margin-bottom: 22px; font-size: 14px; color: #1e293b; line-height: 1.6;">
        <div style="font-weight: 700; color: #1d4ed8; margin-bottom: 4px; font-size: 12px; text-transform: uppercase;">Overview & Summary</div>
        ${formatTextToHTML(note.overview)}
      </div>
    `;
  }

  note.sections.forEach((sec, idx) => {
    html += `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); page-break-inside: avoid;">
        <h2 style="font-size: 16px; font-weight: 800; color: #1e1b4b; margin: 0 0 10px 0; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 6px;">
          ${idx + 1}. ${sec.heading}
        </h2>
        <div style="font-size: 14px; color: #1e293b; line-height: 1.6;">
          ${formatTextToHTML(sec.content)}
        </div>
        ${sec.keyTakeaways && sec.keyTakeaways.length > 0 ? `
          <div style="margin-top: 12px; padding: 10px 14px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: #15803d; margin-bottom: 4px;">Key Takeaways:</div>
            ${sec.keyTakeaways.map(p => `<div style="font-size: 13px; color: #166534; margin: 2px 0;">• ${formatTextToHTML(p)}</div>`).join("")}
          </div>
        ` : ''}
      </div>
    `;
  });

  if (note.shortTricks && note.shortTricks.length > 0) {
    html += `
      <div style="background-color: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 22px; page-break-inside: avoid;">
        <h2 style="font-size: 16px; font-weight: 800; color: #5b21b6; margin: 0 0 12px 0; border-bottom: 1px solid #e9d5ff; padding-bottom: 6px;">
          ⚡ Exam Short Tricks & Mnemonics (পরীক্ষার শর্টকাট কৌশল)
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${note.shortTricks.map(tr => `
            <div style="background-color: #ffffff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 12px;">
              <div style="font-weight: 800; font-size: 13px; color: #4c1d95; margin-bottom: 4px;">${tr.trickTitle}</div>
              ${tr.conceptOrFormula ? `<div style="font-size: 11px; color: #6d28d9; margin-bottom: 4px;">Concept: ${formatTextToHTML(tr.conceptOrFormula)}</div>` : ''}
              <div style="font-size: 12px; color: #1e1b4b; line-height: 1.5;">${formatTextToHTML(tr.shortcutMethod)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (note.keyFormulaeAndDefs && note.keyFormulaeAndDefs.length > 0) {
    html += `
      <div style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 22px; page-break-inside: avoid;">
        <h2 style="font-size: 16px; font-weight: 800; color: #92400e; margin: 0 0 12px 0; border-bottom: 1px solid #fef3c7; padding-bottom: 6px;">
          📐 Key Formulae & Important Definitions
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${note.keyFormulaeAndDefs.map(item => `
            <div style="background-color: #ffffff; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px;">
              <div style="font-weight: 800; font-size: 13px; color: #78350f; margin-bottom: 4px;">${formatTextToHTML(item.termOrFormula)}</div>
              <div style="font-size: 12px; color: #451a03; line-height: 1.5;">${formatTextToHTML(item.explanation)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  html += `
    <div style="text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
      Generated by MedhaPrep AI • Smart Exam & Revision Suite
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

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

    pdf.save(`${note.title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
  } finally {
    document.body.removeChild(container);
  }
}
