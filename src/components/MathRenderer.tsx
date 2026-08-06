import React from "react";
import { preprocessMathText, safeRenderKaTeX } from "../utils/mathUtils";

interface MathRendererProps {
  text: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className = "",
  inline = false,
}) => {
  if (!text) return null;

  // Helper to render bold markdown **text** and clean up inline tags
  const renderTextWithBold = (str: string) => {
    const subParts = str.split(/(\*\*.*?\*\*)/g);
    return subParts.map((sub, idx) => {
      if (sub.startsWith("**") && sub.endsWith("**") && sub.length > 4) {
        return (
          <strong key={idx} className="font-extrabold text-amber-300 font-sans">
            {sub.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{sub}</React.Fragment>;
    });
  };

  // Parse lines to remove raw '#' markdown headers and convert into clean styled blocks
  const renderFormattedText = (raw: string) => {
    const formatted = preprocessMathText(raw);
    const lines = formatted.split("\n");

    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={lineIdx} className="h-2" />;

      // Handle Markdown Heading #, ##, ###, ####
      let isHeader = false;
      let headerLevel = 0;

      if (trimmed.startsWith("# ")) {
        isHeader = true;
        headerLevel = 1;
        trimmed = trimmed.substring(2);
      } else if (trimmed.startsWith("## ")) {
        isHeader = true;
        headerLevel = 2;
        trimmed = trimmed.substring(3);
      } else if (trimmed.startsWith("### ")) {
        isHeader = true;
        headerLevel = 3;
        trimmed = trimmed.substring(4);
      } else if (trimmed.startsWith("#### ")) {
        isHeader = true;
        headerLevel = 4;
        trimmed = trimmed.substring(5);
      }

      // Handle bullet points (- or *)
      let isBullet = false;
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        isBullet = true;
        trimmed = trimmed.substring(2);
      }

      // Split line into math blocks ($$...$$ and $...$) and standard text
      const parts = trimmed.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

      const lineContent = parts.map((part, index) => {
        // Block level LaTeX math ($$ ... $$)
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2).trim();
          if (!math) return null;

          const html = safeRenderKaTeX(math, true);
          return (
            <div
              key={index}
              className="my-3 block text-center overflow-x-auto py-2.5 px-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-100 font-semibold text-sm sm:text-base shadow-inner font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        // Inline LaTeX math ($ ... $)
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const math = part.slice(1, -1).trim();
          if (!math) return null;

          const html = safeRenderKaTeX(math, false);
          return (
            <span
              key={index}
              className="inline-block px-2 py-0.5 my-0.5 mx-0.5 rounded-lg bg-emerald-950/80 text-amber-200 font-bold text-xs sm:text-sm border border-emerald-700/60 font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return <React.Fragment key={index}>{renderTextWithBold(part)}</React.Fragment>;
      });

      if (isHeader) {
        return (
          <div
            key={lineIdx}
            className={`font-black tracking-wide my-2 border-b border-emerald-800/50 pb-1 ${
              headerLevel === 1
                ? "text-base sm:text-lg text-amber-300 uppercase"
                : headerLevel === 2
                ? "text-sm sm:text-base text-amber-200"
                : "text-xs sm:text-sm text-emerald-200"
            }`}
          >
            {lineContent}
          </div>
        );
      }

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start space-x-2 my-1 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
            <div className="text-xs sm:text-sm leading-relaxed flex-1">
              {lineContent}
            </div>
          </div>
        );
      }

      return (
        <div key={lineIdx} className="my-1 text-xs sm:text-sm leading-relaxed">
          {lineContent}
        </div>
      );
    });
  };

  if (inline) {
    return <span className={`inline ${className}`}>{renderFormattedText(text)}</span>;
  }

  return <div className={`space-y-1 ${className}`}>{renderFormattedText(text)}</div>;
};



