import katex from "katex";

/**
 * Pre-processes text from AI to normalize LaTeX math expressions,
 * fix unclosed dollar signs, auto-wrap unwrapped formulas, and fix backslashes.
 */
export function preprocessMathText(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 1. Standardize bracket delimiters \[ ... \] -> $$ ... $$ and \( ... \) -> $ ... $
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, " $$$$ $1 $$$$ ");
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, " $ $1 $ ");

  // 2. Fix double escaped backslashes in latex commands e.g. \\frac -> \frac
  text = text.replace(/\\\\([a-zA-Z]+)/g, "\\$1");

  // 3. Fix unclosed dollar sign edge cases e.g. "\frac{p}{E}$" or "$ \frac{p}{E}"
  text = text.replace(/(^|[^$])(\\frac\{[^}]*\}\{[^}]*\}|\\sqrt\{[^}]*\}|\\[a-zA-Z]+(?:\s*[0-9a-zA-Z_^{}\\]+)*)\$/g, "$1 $$$2$$ ");
  text = text.replace(/\$(\\frac\{[^}]*\}\{[^}]*\}|\\sqrt\{[^}]*\}|\\[a-zA-Z]+(?:\s*[0-9a-zA-Z_^{}\\]+)*)([^$]|$)/g, " $$$1$$ $2");

  // 4. Auto-wrap unwrapped LaTeX math expressions:
  // If LaTeX commands exist outside $ ... $ or $$ ... $$, wrap them!
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  const processed = parts.map((part) => {
    if (
      (part.startsWith("$$") && part.endsWith("$$")) ||
      (part.startsWith("$") && part.endsWith("$") && part.length > 2)
    ) {
      return part;
    }

    // Check if part contains unwrapped LaTeX commands like \frac, \sqrt, \vec, \tau, \theta, \int, \sum, \sin, \cos, \int, etc.
    if (
      /\\(?:frac|sqrt|vec|int|sum|prod|lim|alpha|beta|gamma|delta|theta|lambda|mu|pi|rho|sigma|tau|phi|psi|omega|Delta|Gamma|Theta|Lambda|Sigma|Phi|Omega|times|div|pm|mp|le|ge|neq|approx|infty|cdot|partial|nabla|sin|cos|tan|log|ln)\b/.test(
        part
      )
    ) {
      // Auto wrap math expressions containing backslash commands
      return part.replace(
        /(\\?[a-zA-Z0-9_\^\.]+\s*=\s*)?(\\(?:frac\{[^}]*\}\{[^}]*\}|sqrt\{[^}]*\}|vec\{[^}]*\}|[a-zA-Z]+)(?:[^{}\$\n]*|\{[^}]*\}|\^[^{\$\n]+|_[\w\d]+)*)/g,
        (match) => {
          if (match.includes("\\") || match.includes("^") || match.includes("_")) {
            return ` $${match.trim()}$ `;
          }
          return match;
        }
      );
    }

    return part;
  });

  return processed.join("");
}

/**
 * Safely renders a LaTeX math string into KaTeX HTML string.
 */
export function safeRenderKaTeX(math: string, displayMode: boolean = false): string {
  if (!math) return "";
  let cleanMath = math.trim();

  // Strip wrapping $ or $$ if passed
  if (cleanMath.startsWith("$$") && cleanMath.endsWith("$$")) {
    cleanMath = cleanMath.slice(2, -2).trim();
  } else if (cleanMath.startsWith("$") && cleanMath.endsWith("$")) {
    cleanMath = cleanMath.slice(1, -1).trim();
  }

  // Clean common KaTeX error triggers
  cleanMath = cleanMath.replace(/\n/g, " "); // Replace line breaks inside math with spaces
  cleanMath = cleanMath.replace(/\\\\/g, "\\"); // Convert double backslashes

  try {
    return katex.renderToString(cleanMath, {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    return `<span style="font-family: monospace; color: #d97706;">${cleanMath}</span>`;
  }
}
