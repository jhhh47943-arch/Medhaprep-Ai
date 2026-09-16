import katex from "katex";

/**
 * Normalizes and cleans mathematical expressions from AI text to ensure
 * robust KaTeX typesetting of all formulas, calculations, and derivations.
 */
export function preprocessMathText(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let text = raw;

  // 1. Standardize bracket delimiters:
  // \[ ... \] -> $$ ... $$ and \( ... \) -> $ ... $
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => ` $$${inner}$$ `);
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => ` $${inner}$ `);

  // 2. Fix double escaped backslashes e.g. \\frac -> \frac, \\sqrt -> \sqrt
  text = text.replace(/\\\\([a-zA-Z]+)/g, "\\$1");

  // 3. Fix unclosed or misplaced single dollar tags at boundaries
  // e.g. " = $\frac{a}{b}" -> " = $\frac{a}{b}$ "
  // 4. Auto-wrap unwrapped LaTeX commands outside existing $ blocks
  // We split by existing $...$ and $$...$$ first to protect already wrapped math
  const tokens = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

  const processed = tokens.map((segment) => {
    // If segment is already wrapped in $...$ or $$...$$, preserve it
    if (segment.startsWith("$") && segment.endsWith("$")) {
      return segment;
    }

    let s = segment;

    // Auto-wrap LaTeX environment blocks like \begin{matrix}...\end{matrix} or \begin{pmatrix}...\end{pmatrix}
    s = s.replace(/(\\begin\{(?:matrix|pmatrix|bmatrix|vmatrix|aligned|array)\}[\s\S]*?\\end\{(?:matrix|pmatrix|bmatrix|vmatrix|aligned|array)\})/g, " $$$$$1$$$$ ");

    // Auto-wrap standalone LaTeX expressions with commands like \frac, \sqrt, \int, \sum, etc.
    s = s.replace(/(\\(?:frac|sqrt|vec|hat|bar|dot|ddot|int|sum|prod|lim|infty|partial|nabla|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Delta|Gamma|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|approx|times|cdot|div|pm|mp|leq|geq|le|ge|neq|equiv|sim|subset|supset|subseteq|supseteq|cup|cap|to|rightarrow|Rightarrow|leftarrow|Leftarrow|sin|cos|tan|cot|sec|csc|log|ln|det)(?:\{[^{}]*\}|\[[^[\]]*\]|\^[a-zA-Z0-9{}]+|_\{?[a-zA-Z0-9]+\}?|[a-zA-Z0-9_\^\.\+\-\*\/=\(\)])+)/g, " $$$1$$ ");

    return s;
  });

  return processed.join("");
}

/**
 * Safely renders a LaTeX math string into KaTeX HTML string.
 */
export function safeRenderKaTeX(math: string, displayMode: boolean = false): string {
  if (!math || typeof math !== "string") return "";
  let cleanMath = math.trim();

  // Strip wrapping $ or $$ if passed
  if (cleanMath.startsWith("$$") && cleanMath.endsWith("$$")) {
    cleanMath = cleanMath.slice(2, -2).trim();
  } else if (cleanMath.startsWith("$") && cleanMath.endsWith("$")) {
    cleanMath = cleanMath.slice(1, -1).trim();
  }

  if (!cleanMath) return "";

  // Normalize common math symbols and formatting
  cleanMath = cleanMath.replace(/\r?\n/g, " ");
  // Fix unescaped % inside KaTeX which comments out the rest of the equation
  cleanMath = cleanMath.replace(/([^\\])%/g, "$1\\%");

  try {
    return katex.renderToString(cleanMath, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      macros: {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
        "\\C": "\\mathbb{C}",
        "\\unit": "\\text{#1}",
      },
    });
  } catch (_err) {
    return `<span class="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">${escapeHtml(cleanMath)}</span>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
