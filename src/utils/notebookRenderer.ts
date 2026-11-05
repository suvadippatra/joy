import katex from 'katex';
import { DocumentAsset, PageSettings, PAPER_DIMENSIONS } from '../types/notebook';
import { generateQrCodeSvg } from './qrCode';
import { resolveCssColor } from './textFormatter';

export interface RenderOptions {
  fontSizePt?: number;
  lineHeight?: number;
  fontFamily?: string;
  isPrint?: boolean;
}

/**
 * Escapes unsafe HTML characters while preserving intentional entities
 */
function escapeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Normalizes and sanitizes LaTeX formulas:
 * - Fixes redundant double backslashes before LaTeX commands: \\frac -> \frac, \\Omega -> \Omega
 * - Extracts math-only commands placed inside \text{...} like \text{ J\cdot\text{K}^{-1}}
 * - Cleans up nested \text{\text{...}}
 * - Resolves double superscripts like 10^{m}^3 -> 10^{m^3}
 */
export function sanitizeLatex(latex: string): string {
  if (!latex) return '';
  let cleaned = latex.trim();

  // Normalize multiple backslashes before LaTeX commands (e.g. \\frac -> \frac, \\Omega -> \Omega, \\text -> \text)
  cleaned = cleaned.replace(/\\+([a-zA-Z]+)/g, '\\$1');

  // Fix math commands placed inside \text{...}
  cleaned = cleaned.replace(/\\text\{([^{}]*?)\\cdot([^{}]*?)\}/g, '\\text{$1}\\cdot\\text{$2}');
  cleaned = cleaned.replace(/\\text\{([^{}]*?)\\times([^{}]*?)\}/g, '\\text{$1}\\times\\text{$2}');
  cleaned = cleaned.replace(/\\text\{([^{}]*?)\\approx([^{}]*?)\}/g, '\\text{$1}\\approx\\text{$2}');
  cleaned = cleaned.replace(/\\text\{([^{}]*?)\\pm([^{}]*?)\}/g, '\\text{$1}\\pm\\text{$2}');
  cleaned = cleaned.replace(/\\text\{([^{}]*?)\\to([^{}]*?)\}/g, '\\text{$1}\\to\\text{$2}');

  // Fix nested \text{\text{...}} or \text{text{...}}
  cleaned = cleaned.replace(/\\text\{\\?text\{([^}]+)\}\}/g, '\\text{$1}');

  return cleaned;
}

export function normalizeBlockSnippet(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u0002[A-Z]+\d+\u0003/g, '')
    .replace(/^(?:#{1,6}|>|[-*+]|\d+\.)\s*/gm, '')
    .replace(/\\[a-zA-Z]+\{?/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 64);
}

/**
 * Checks if a trimmed line is a standalone mathematical equation (without $ or $$ delimiters)
 */
export function isStandaloneMathEquation(line: string): boolean {
  const trimmed = line.trim();
  if (
    !trimmed ||
    trimmed.includes('\u0002') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('>') ||
    trimmed.startsWith('-') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('|') ||
    trimmed.startsWith('+') ||
    trimmed.startsWith('<')
  ) {
    return false;
  }
  // Never treat normal prose sentences (3+ consecutive English words of 3+ letters outside \text{}) as standalone math
  const withoutTextCmd = trimmed.replace(/\\text\{[^}]*\}/g, '');
  if (/\b[a-zA-Z]{3,}\s+[a-zA-Z]{3,}\s+[a-zA-Z]{3,}\b/.test(withoutTextCmd)) {
    return false;
  }
  // Case 1: Starts with a standard LaTeX math command (not text formatting commands)
  if (/^\\+(?:frac|dfrac|tfrac|sum|int|iint|iiint|oint|prod|sqrt|lim|inf|sup|partial|nabla|Delta|Omega|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|vec|hat|bar|dot|ddot|tilde|mathbf|mathcal|mathbb|mathrm|left)\b/.test(trimmed)) {
    return true;
  }
  // Case 2: Mathematical equality / approximation containing math operators without prose
  if (/[=≈≤≥≠]/.test(trimmed)) {
    const mathIndicators = /\\+(?:frac|dfrac|tfrac|times|cdot|approx|left|right|text|lambda|Omega|alpha|beta|sigma|Delta|mu|sqrt|ln|log|exp|int|partial|to)\b|\^\{|_\{|\^[0-9a-zA-Z]|_[0-9a-zA-Z]/;
    if (mathIndicators.test(trimmed)) {
      return true;
    }
  }
  return false;
}

const katexFormulaCache = new Map<string, string>();
const MAX_KATEX_CACHE = 4000;

/**
 * Renders LaTeX formula with KaTeX in a safe try-catch wrapper with automatic environment fallbacks and O(1) caching
 */
function renderKaTeXFormula(latex: string, displayMode: boolean): string {
  if (!latex) return '';
  const cacheKey = `${displayMode ? 'D' : 'I'}|${latex}`;
  const cached = katexFormulaCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  let sanitized = sanitizeLatex(latex);
  if (!sanitized) return '';

  // Clean out LaTeX document-level environments that KaTeX doesn't support directly
  sanitized = sanitized
    .replace(/\\begin\{align\*?\}/g, '\\begin{aligned}')
    .replace(/\\end\{align\*?\}/g, '\\end{aligned}')
    .replace(/\\begin\{equation\*?\}/g, '')
    .replace(/\\end\{equation\*?\}/g, '')
    .replace(/\\begin\{gather\*?\}/g, '\\begin{gathered}')
    .replace(/\\end\{gather\*?\}/g, '\\end{gathered}')
    .replace(/\\begin\{multline\*?\}/g, '\\begin{aligned}')
    .replace(/\\end\{multline\*?\}/g, '\\end{aligned}')
    .replace(/\\begin\{flalign\*?\}/g, '\\begin{aligned}')
    .replace(/\\end\{flalign\*?\}/g, '\\end{aligned}')
    .replace(/\\tag\{([^}]*)\}/g, '\\quad\\text{($1)}')
    .replace(/\\label\{[^}]*\}/g, '')
    .replace(/\\nonumber\b/g, '')
    .replace(/\\notag\b/g, '')
    .trim();

  const katexMacros = {
    "\\bm": "\\boldsymbol{#1}",
    "\\mathbf": "\\boldsymbol{#1}",
    "\\degree": "^{\\circ}",
    "\\unit": "\\text{#1}",
    "\\pu": "\\text{#1}",
    "\\ce": "\\mathrm{#1}",
    "\\AA": "\\text{Å}",
    "\\dfrac": "\\frac{#1}{#2}",
    "\\tfrac": "\\frac{#1}{#2}"
  };

  const katexOptions: katex.KatexOptions = {
    displayMode,
    throwOnError: true,
    errorColor: '#ef4444',
    output: 'htmlAndMathml',
    strict: false,
    trust: true,
    macros: katexMacros
  };

  let finalHtml = '';

  // Attempt 1: Standard sanitized render
  try {
    const rendered = katex.renderToString(sanitized, katexOptions);
    finalHtml = displayMode
      ? `<div class="katex-display-wrapper my-1.5 py-0.5 text-center w-full max-w-full overflow-x-auto select-all" style="width: 100%; max-width: 100%;">${rendered}</div>`
      : `<span class="katex-inline-wrapper px-0.5 inline-block align-baseline select-all">${rendered}</span>`;
  } catch (err1) {
    // Attempt 2: Try auto-fixing common syntax issues (unmatched \left/\right, raw &, unbalanced braces)
    try {
      let recovered = sanitized;
      const leftCount = (recovered.match(/\\left\b/g) || []).length;
      const rightCount = (recovered.match(/\\right\b/g) || []).length;
      if (leftCount > rightCount) {
        recovered += ' \\right.'.repeat(leftCount - rightCount);
      } else if (rightCount > leftCount) {
        recovered = '\\left. '.repeat(rightCount - leftCount) + recovered;
      }

      // Balance curly braces during live typing
      let openBraces = 0;
      for (let i = 0; i < recovered.length; i++) {
        if (recovered[i] === '\\') { i++; continue; }
        if (recovered[i] === '{') openBraces++;
        else if (recovered[i] === '}') openBraces = Math.max(0, openBraces - 1);
      }
      if (openBraces > 0) {
        recovered += '}'.repeat(openBraces);
      }

      if ((recovered.includes('&') || recovered.includes('\\\\')) && !recovered.includes('\\begin{aligned}')) {
        recovered = `\\begin{aligned} ${recovered} \\end{aligned}`;
      }

      const rendered = katex.renderToString(recovered, katexOptions);
      finalHtml = displayMode
        ? `<div class="katex-display-wrapper my-1.5 py-0.5 text-center w-full max-w-full overflow-x-auto select-all" style="width: 100%; max-width: 100%;">${rendered}</div>`
        : `<span class="katex-inline-wrapper px-0.5 inline-block align-baseline select-all">${rendered}</span>`;
    } catch (err2) {
      // Attempt 3: Render in non-throwing mode
      try {
        const softRendered = katex.renderToString(sanitized, { ...katexOptions, throwOnError: false });
        finalHtml = displayMode
          ? `<div class="katex-display-wrapper my-1.5 py-0.5 text-center w-full max-w-full overflow-x-auto select-all" style="width: 100%; max-width: 100%;">${softRendered}</div>`
          : `<span class="katex-inline-wrapper px-0.5 inline-block align-baseline select-all">${softRendered}</span>`;
      } catch {
        finalHtml = displayMode
          ? `<div class="katex-display-wrapper my-1.5 py-0.5 text-center font-serif italic text-slate-800 dark:text-slate-200 select-all">${escapeHtmlEntities(sanitized)}</div>`
          : `<span class="katex-inline-wrapper font-serif italic text-slate-800 dark:text-slate-200">${escapeHtmlEntities(sanitized)}</span>`;
      }
    }
  }

  if (katexFormulaCache.size > MAX_KATEX_CACHE) {
    katexFormulaCache.clear();
  }
  katexFormulaCache.set(cacheKey, finalHtml);
  return finalHtml;
}

/**
 * Parses markdown inline text styling and LaTeX commands:
 * Font size: \tiny, \small, \normalsize, \large, \Large, \LARGE, \huge, \Huge, \h, \h1, \h2, \size{...}{...}
 * Color: \textcolor{color}{text}, \color{color}{text}, \colorbox{color}{text}, \highlight{color}{text}
 * Styling: \textbf, \textit, \emph, \underline, \sout, \textsc, \texttt
 * Alignment: \centerline, \leftline, \rightline
 * Markdown: **bold**, *italic*, `code`, ~~strike~~, __underline__
 * Does NOT display the LaTeX command names in preview!
 */
export function parseInlineMarkdown(text: string): string {
  if (!text) return '';
  let res = text;

  // 1. LaTeX Text Color: \textcolor{color}{text} and \color{color}{text}
  res = res.replace(/\\(?:textcolor|color)\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, color, inner) => {
    const cssColor = resolveCssColor(color);
    return `<span style="color: ${cssColor};">${parseInlineMarkdown(inner)}</span>`;
  });

  // 2. LaTeX Highlight: \colorbox{color}{text} and \highlight{color}{text}
  res = res.replace(/\\(?:colorbox|highlight)\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, bg, inner) => {
    const cssBg = resolveCssColor(bg);
    return `<mark style="background-color: ${cssBg}; padding: 0.1em 0.3em; border-radius: 3px;">${parseInlineMarkdown(inner)}</mark>`;
  });

  // 3. LaTeX Font Size Commands
  // \size{20px}{text} or \fontsize{16pt}{text}
  res = res.replace(/\\(?:size|fontsize)\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, size, inner) => {
    const formattedSize = /^\d+$/.test(size.trim()) ? `${size.trim()}pt` : size.trim();
    return `<span style="font-size: ${formattedSize};">${parseInlineMarkdown(inner)}</span>`;
  });

  // \fontfamily{family}{text}
  res = res.replace(/\\fontfamily\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, family, inner) => `<span style="font-family: ${family};">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\size\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, size, inner) => `<span style="font-size: ${size};">${parseInlineMarkdown(inner)}</span>`);

  // \h or \h1 to \h4
  res = res.replace(/\\h1\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.85em; font-weight: 700; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h2\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.45em; font-weight: 700; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h3\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.25em; font-weight: 600; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h4\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.1em; font-weight: 600; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.85em; font-weight: 700; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);

  // Standard LaTeX font size scale
  res = res.replace(/\\Huge\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 2.3em; line-height: 1.2;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\huge\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.85em; line-height: 1.25;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\LARGE\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.55em; line-height: 1.3;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\Large\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.35em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\large\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.18em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\normalsize\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\small\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.9em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\footnotesize\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.85em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\scriptsize\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.75em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\tiny\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.65em;">${parseInlineMarkdown(inner)}</span>`);

  // Scoped bracket forms: {\large ...}, {\Huge ...}, etc.
  res = res.replace(/\{\\Huge\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 2.3em; line-height: 1.2;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\huge\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.85em; line-height: 1.25;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\LARGE\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.55em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\Large\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.35em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\large\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.18em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\small\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 0.9em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\tiny\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 0.65em;">${parseInlineMarkdown(inner)}</span>`);

  // 4. LaTeX Text Styles
  res = res.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<strong>${parseInlineMarkdown(inner)}</strong>`);
  res = res.replace(/\\(?:textit|emph)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<em>${parseInlineMarkdown(inner)}</em>`);
  res = res.replace(/\\underline\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<u class="underline underline-offset-2">${parseInlineMarkdown(inner)}</u>`);
  res = res.replace(/\\(?:sout|st)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<del class="line-through text-slate-500">${parseInlineMarkdown(inner)}</del>`);
  res = res.replace(/\\textsc\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-variant: small-caps;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\texttt\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-[0.88em] border border-slate-200 dark:border-slate-700 break-words">${parseInlineMarkdown(inner)}</code>`);

  // 5. LaTeX Alignment Helpers (\centerline, \leftline, \rightline, \aligncenter, \alignleft, \alignright, \alignjustify)
  res = res.replace(/\\(?:centerline|aligncenter)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-center w-full my-1" style="text-align: center;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\(?:leftline|alignleft)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-left w-full my-1" style="text-align: left;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\(?:rightline|alignright)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-right w-full my-1" style="text-align: right;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\alignjustify\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-justify w-full my-1" style="text-align: justify;">${parseInlineMarkdown(inner)}</span>`);

  // 5b. Direct Inline Math Fallback (when parseInlineMarkdown is called directly on captions, tables, or nested macros)
  res = res.replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g, (_, p1, p2) => renderKaTeXFormula((p1 || p2 || '').trim(), true));
  res = res.replace(/\\\(([\s\S]+?)\\\)|\\ensuremath\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, p1, p2) => renderKaTeXFormula((p1 || p2 || '').trim(), false));
  res = res.replace(/(^|[^\\$])\$([^$\n]+?)(?<!\\)\$/g, (m, prefix, p1) => {
    const f = p1.trim();
    return f ? `${prefix}${renderKaTeXFormula(f, false)}` : m;
  });

  // 5c. Bare Inline LaTeX Math Commands used directly in prose without $...$ (e.g. \frac{a}{b}, \sqrt{x}, \alpha, \Delta, \vec{F})
  res = res.replace(/\\(?:d?frac)\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (m) => renderKaTeXFormula(m, false));
  res = res.replace(/\\sqrt(?:\[[^\]]*\])?\{((?:[^{}]|\{[^{}]*\})*)\}/g, (m) => renderKaTeXFormula(m, false));
  res = res.replace(/\\(?:vec|hat|bar|overline|underline|dot|ddot|tilde|mathbf|mathrm|mathcal|mathbb)\{([^{}]+)\}(?:_\{[^{}]+\}|\^\{[^{}]+\}|_[a-zA-Z0-9]|\^[a-zA-Z0-9])*/g, (m) => renderKaTeXFormula(m, false));
  res = res.replace(/\\(?:alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|infty|partial|nabla|pm|mp|times|div|cdot|approx|neq|leq|geq|ll|gg|propto|equiv|sim|simeq|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|Leftrightarrow|to|mapsto|forall|exists|in|notin|subset|subseteq|cup|cap|emptyset|degree|circ)(?:_\{[^{}]+\}|\^\{[^{}]+\}|_[a-zA-Z0-9]|\^[a-zA-Z0-9])*\b/g, (m) => renderKaTeXFormula(m, false));

  // 6. Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-[0.88em] border border-slate-200 dark:border-slate-700 break-words">$1</code>');

  // 7. Bold & Italic: ***text*** or ___text___
  res = res.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  res = res.replace(/___([\s\S]+?)___/g, '<strong><em>$1</em></strong>');

  // 8. Bold: **text** or __text__ (standard CommonMark)
  res = res.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__([\s\S]+?)__/g, '<strong>$1</strong>');

  // 9. Italic: *text* or _text_
  res = res.replace(/(^|[^\\])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  res = res.replace(/(^|[^\w\\])_([^_\s][^_]*?)_([^\w]|$)/g, '$1<em>$2</em>$3');

  // 10. Strikethrough: ~~text~~
  res = res.replace(/~~([\s\S]+?)~~/g, '<del class="line-through text-slate-500">$1</del>');

  // 11. HTML underline: <u>text</u>
  res = res.replace(/<u>([\s\S]+?)<\/u>/gi, '<u class="underline underline-offset-2">$1</u>');

  return res;
}

/**
 * Normalizes LaTeX dimension notations (e.g. 0.40\textwidth, 0.35\linewidth, 0.5) to CSS percentages/lengths.
 */
function normalizeLatexDimension(val: string): string {
  if (!val) return '100%';
  const trimmed = val.trim();
  const textWidthMatch = trimmed.match(/^([\d.]+)\s*\\(?:textwidth|linewidth|columnwidth|textheight)$/);
  if (textWidthMatch) {
    const factor = parseFloat(textWidthMatch[1]);
    return `${Math.round(factor * 100)}%`;
  }
  if (trimmed.startsWith('\\textwidth') || trimmed.startsWith('\\linewidth') || trimmed.startsWith('\\columnwidth')) {
    return '100%';
  }
  const pureNumMatch = trimmed.match(/^0\.(\d+)$/);
  if (pureNumMatch) {
    const factor = parseFloat(trimmed);
    return `${Math.round(factor * 100)}%`;
  }
  return trimmed;
}

/**
 * Formats textbook academic captions with colored labels (e.g. Figure 1.11, Fig. 1.15, (a)).
 */
function formatFigureCaption(captionText: string, subLabel?: string): string {
  if (!captionText && !subLabel) return '';

  let html = '';
  if (subLabel) {
    html += `<span class="font-bold text-sky-600 dark:text-sky-400 mr-1.5">${escapeHtmlEntities(subLabel)}</span>`;
  }

  if (captionText) {
    const figPrefixMatch = captionText.match(/^((?:Figure|Fig\.|Table)\s*[\d.]+[a-z]?)([\s:\.\-]?)(.*)$/i);
    if (figPrefixMatch) {
      const [_, figNum, sep, rest] = figPrefixMatch;
      html += `<strong class="font-bold text-emerald-800 dark:text-emerald-400 font-serif mr-1">${escapeHtmlEntities(figNum)}${sep || ':'}</strong>`;
      html += `<span>${parseInlineMarkdown(rest.trim())}</span>`;
    } else {
      html += `<span>${parseInlineMarkdown(captionText)}</span>`;
    }
  }

  return `<figcaption class="text-[9pt] leading-snug text-slate-700 dark:text-slate-300 mt-1.5 font-serif text-left max-w-full break-words">${html}</figcaption>`;
}

/**
 * Builds HTML figure for an image with live preview dragging, layout docking, and textbook positioning hooks
 */
function buildFigureHtml(
  src: string, 
  rawSrc: string,
  alt: string, 
  width: string, 
  align: string, 
  customFilter: string, 
  rawSyntax: 'latex' | 'markdown' | 'html',
  subLabel?: string,
  figureNumber?: string
): string {
  const normWidth = normalizeLatexDimension(width);
  let wrapperClass = 'my-4 clear-both max-w-full';
  let inlineStyle = `width: ${normWidth};`;

  const normalizedAlign = align.toLowerCase().trim();

  if (normalizedAlign === 'float-left' || normalizedAlign === 'wrap-left' || normalizedAlign === 'wrap_left') {
    wrapperClass = 'notebook-figure float-left mr-5 mb-3 my-1.5 max-w-[55%] clear-left text-left';
    inlineStyle = `float: left; margin-right: 1.25rem; margin-bottom: 0.75rem; width: ${normWidth}; max-width: 55%; clear: left;`;
  } else if (normalizedAlign === 'float-right' || normalizedAlign === 'wrap-right' || normalizedAlign === 'wrap_right') {
    wrapperClass = 'notebook-figure float-right ml-5 mb-3 my-1.5 max-w-[55%] clear-right text-left';
    inlineStyle = `float: right; margin-left: 1.25rem; margin-bottom: 0.75rem; width: ${normWidth}; max-width: 55%; clear: right;`;
  } else if (normalizedAlign === 'margin' || normalizedAlign === 'margin-rail' || normalizedAlign === 'marginfigure') {
    wrapperClass = 'notebook-figure float-left mr-5 mb-4 my-2 w-[32%] max-w-[36%] clear-left text-left border-r border-slate-200/80 dark:border-slate-800 pr-3.5';
    inlineStyle = `float: left; margin-right: 1.25rem; margin-bottom: 1rem; width: ${normWidth === '100%' ? '32%' : normWidth}; max-width: 38%; clear: left;`;
  } else if (normalizedAlign === 'span-full' || normalizedAlign === 'span' || normalizedAlign === 'full-width' || normalizedAlign === 'figure*') {
    wrapperClass = 'notebook-figure my-5 clear-both w-full max-w-full flex flex-col items-center justify-center';
    inlineStyle = `column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%; clear: both;`;
  } else if (normalizedAlign === 'block-left' || normalizedAlign === 'left') {
    wrapperClass = 'notebook-figure my-3 clear-both max-w-full flex flex-col items-start justify-start';
    inlineStyle = `clear: both; margin-right: auto; width: ${normWidth}; max-width: 100%;`;
  } else if (normalizedAlign === 'block-right' || normalizedAlign === 'right') {
    wrapperClass = 'notebook-figure my-3 clear-both max-w-full flex flex-col items-end justify-end';
    inlineStyle = `clear: both; margin-left: auto; width: ${normWidth}; max-width: 100%;`;
  } else if (normalizedAlign === 'inline') {
    wrapperClass = 'notebook-figure inline-block align-middle mx-1.5 max-w-full';
    inlineStyle = `display: inline-block; vertical-align: middle; width: ${normWidth}; max-width: 100%;`;
  } else {
    wrapperClass = 'notebook-figure my-4 flex flex-col items-center justify-center clear-both max-w-full';
    inlineStyle = `clear: both; margin-left: auto; margin-right: auto; width: ${normWidth}; max-width: 100%;`;
  }

  const imgStyle = `width: 100%; max-width: 100%; height: auto; border-radius: 6px; ${customFilter}`;
  const captionHtml = formatFigureCaption(alt, subLabel);

  return `
    <figure 
      class="${wrapperClass} relative group/figure transition-all select-none" 
      data-img-wrapper="true"
      data-asset-src="${rawSrc || src}"
      data-img-syntax="${rawSyntax}"
      data-img-width="${normWidth}"
      data-img-align="${normalizedAlign}"
      data-img-caption="${escapeHtmlEntities(alt)}"
      style="${inlineStyle}"
    >
      <div class="relative inline-block w-full max-w-full image-wrapper-inner">
        <img 
          src="${src}" 
          data-asset-src="${rawSrc || src}" 
          alt="${alt || 'Figure'}" 
          style="${imgStyle}" 
          class="notebook-preview-img block shadow-2xs border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-400/50 select-none" 
        />
        <!-- In-preview interactive corner resize handle (visible on hover & drag) -->
        <div 
          class="image-resize-handle print:hidden absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white border-2 border-white shadow-md cursor-se-resize flex items-center justify-center opacity-0 group-hover/figure:opacity-100 transition-opacity z-20"
          data-image-resize-handle="se"
          title="Drag to Resize Image"
        >
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
      ${captionHtml}
    </figure>
  `;
}

/**
 * Parses LaTeX figure environments, \\includegraphics, Markdown images, and legacy HTML <figure> tags
 * with alignment and width, resolving asset:// URIs and standardizing for interactive preview.
 */
function parseCustomImages(text: string, assets?: Record<string, DocumentAsset>): string {
  let res = text;

  // Helper to resolve asset:// URI
  const resolveSrc = (src: string): { resolvedSrc: string; customFilter: string } => {
    let resolvedSrc = src;
    let customFilter = '';
    if (src.startsWith('asset://')) {
      const assetId = src.replace('asset://', '').trim();
      const asset = assets ? assets[assetId] : undefined;
      if (asset?.dataUrl) {
        resolvedSrc = asset.dataUrl;
        if (asset.filter === 'grayscale') customFilter = 'filter: grayscale(100%);';
        else if (asset.filter === 'bw_diagram') customFilter = 'filter: contrast(220%) grayscale(100%) brightness(105%);';
        else if (asset.filter === 'invert') customFilter = 'filter: invert(100%);';
      } else {
        resolvedSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320" fill="%23f8fafc"><rect width="600" height="320" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="2" rx="8"/><path d="M220 200l50-60 50 60 60-80 60 90H200z" fill="%2394a3b8"/><circle cx="240" cy="110" r="22" fill="%2394a3b8"/><text x="300" y="245" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle" fill="%23475569">${assetId || 'Document Figure'}</text><text x="300" y="270" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%2394a3b8">Click or drag handle to resize &amp; position</text></svg>`;
      }
    }
    return { resolvedSrc, customFilter };
  };

  // Helper to parse key-value option strings (e.g. width=40%, wrap=right, caption="Text")
  const parseImageOptions = (optStr: string) => {
    let width = '100%';
    let align = 'center';
    let caption = '';
    let sublabel = '';

    if (!optStr) return { width, align, caption, sublabel };

    const wMatch = optStr.match(/width=([^\s,}]+)/i);
    if (wMatch) width = normalizeLatexDimension(wMatch[1]);

    const aMatch = optStr.match(/(?:align|wrap|layout)=([^\s,}]+)/i);
    if (aMatch) {
      const val = aMatch[1].toLowerCase();
      if (val === 'right' || val === 'float-right' || val === 'wrap-right' || val === 'r') align = 'float-right';
      else if (val === 'left' || val === 'float-left' || val === 'wrap-left' || val === 'l') align = 'float-left';
      else if (val === 'margin' || val === 'margin-rail') align = 'margin';
      else if (val === 'span' || val === 'span-full' || val === 'full-width') align = 'span-full';
      else if (val === 'inline') align = 'inline';
      else align = 'center';
    }

    const cMatch = optStr.match(/caption=(?:"([^"]*)"|'([^']*)'|([^,}]+))/i);
    if (cMatch) {
      caption = cMatch[1] || cMatch[2] || cMatch[3] || '';
    }

    const subMatch = optStr.match(/(?:sublabel|subfigure|label)=([^\s,}]+)/i);
    if (subMatch) {
      sublabel = subMatch[1];
    }

    return { width, align, caption, sublabel };
  };

  // 1. Process LaTeX \begin{wrapfigure}{r|l}{width} ... \end{wrapfigure}
  res = res.replace(/\\begin\{wrapfigure\}\{([rlRL])\}\{([^}]+)\}([\s\S]*?)\\end\{wrapfigure\}/g, (_, pos, widthStr, inner) => {
    const align = (pos.toLowerCase() === 'r') ? 'float-right' : 'float-left';
    const normWidth = normalizeLatexDimension(widthStr) || '40%';
    let caption = '';
    const capMatch = inner.match(/\\caption\{([^}]+)\}/);
    if (capMatch) caption = capMatch[1];

    let imgMatch = inner.match(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/);
    if (imgMatch) {
      const [__, optStr, src] = imgMatch;
      const { resolvedSrc, customFilter } = resolveSrc(src);
      return buildFigureHtml(resolvedSrc, src, caption, normWidth, align, customFilter, 'latex');
    }

    let mdMatch = inner.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (mdMatch) {
      const [__, mdAlt, mdSrc] = mdMatch;
      const { resolvedSrc, customFilter } = resolveSrc(mdSrc);
      return buildFigureHtml(resolvedSrc, mdSrc, caption || mdAlt, normWidth, align, customFilter, 'latex');
    }

    return `<div class="notebook-figure float-${align === 'float-right' ? 'right ml-5' : 'left mr-5'} mb-3" style="width: ${normWidth};">${inner}</div>`;
  });

  // 2. Process LaTeX \begin{marginfigure} ... \end{marginfigure}
  res = res.replace(/\\begin\{marginfigure\}([\s\S]*?)\\end\{marginfigure\}/g, (_, inner) => {
    let caption = '';
    const capMatch = inner.match(/\\caption\{([^}]+)\}/);
    if (capMatch) caption = capMatch[1];

    let imgMatch = inner.match(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/);
    if (imgMatch) {
      const [__, optStr, src] = imgMatch;
      const opts = parseImageOptions(optStr || '');
      const { resolvedSrc, customFilter } = resolveSrc(src);
      return buildFigureHtml(resolvedSrc, src, caption || opts.caption, opts.width === '100%' ? '100%' : opts.width, 'margin', customFilter, 'latex');
    }

    let mdMatch = inner.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (mdMatch) {
      const [__, mdAlt, mdSrc] = mdMatch;
      const { resolvedSrc, customFilter } = resolveSrc(mdSrc);
      return buildFigureHtml(resolvedSrc, mdSrc, caption || mdAlt, '100%', 'margin', customFilter, 'latex');
    }

    return `<div class="notebook-figure float-left mr-5 mb-4 my-2 w-[32%] clear-left">${inner}</div>`;
  });

  // 3. Process LaTeX \begin{figure*} ... \end{figure*} (Full page width span)
  res = res.replace(/\\begin\{figure\*\}([\s\S]*?)\\end\{figure\*\}/g, (_, inner) => {
    let caption = '';
    const capMatch = inner.match(/\\caption\{([^}]+)\}/);
    if (capMatch) caption = capMatch[1];

    let imgMatch = inner.match(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/);
    if (imgMatch) {
      const [__, optStr, src] = imgMatch;
      const { resolvedSrc, customFilter } = resolveSrc(src);
      return buildFigureHtml(resolvedSrc, src, caption, '100%', 'span-full', customFilter, 'latex');
    }

    let mdMatch = inner.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (mdMatch) {
      const [__, mdAlt, mdSrc] = mdMatch;
      const { resolvedSrc, customFilter } = resolveSrc(mdSrc);
      return buildFigureHtml(resolvedSrc, mdSrc, caption || mdAlt, '100%', 'span-full', customFilter, 'latex');
    }

    return `<div class="notebook-figure my-5 clear-both w-full" style="column-span: all; -webkit-column-span: all; width: 100%;">${inner}</div>`;
  });

  // 4. Process LaTeX \begin{subfigure}{(a)} ... \end{subfigure}
  res = res.replace(/\\begin\{subfigure\}(?:\{([^}]+)\})?([\s\S]*?)\\end\{subfigure\}/g, (_, subParam, inner) => {
    let sublabel = subParam || '';
    let caption = '';
    const capMatch = inner.match(/\\caption\{([^}]+)\}/);
    if (capMatch) caption = capMatch[1];

    let imgMatch = inner.match(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/);
    if (imgMatch) {
      const [__, optStr, src] = imgMatch;
      const opts = parseImageOptions(optStr || '');
      const { resolvedSrc, customFilter } = resolveSrc(src);
      return buildFigureHtml(resolvedSrc, src, caption || opts.caption, opts.width, 'block-left', customFilter, 'latex', sublabel || opts.sublabel);
    }

    return `<div class="my-2">${inner}</div>`;
  });

  // 5. Process standard LaTeX \begin{figure}[...] ... \end{figure}
  res = res.replace(/\\begin\{figure\}(?:\[([^\]]*)\])?([\s\S]*?)\\end\{figure\}/g, (_, figPos, inner) => {
    let caption = '';
    const capMatch = inner.match(/\\caption\{([^}]+)\}/);
    if (capMatch) caption = capMatch[1];

    let align = 'center';
    if (figPos) {
      if (figPos.includes('r')) align = 'float-right';
      else if (figPos.includes('l')) align = 'float-left';
    }

    let imgMatch = inner.match(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/);
    if (imgMatch) {
      const [__, optStr, src] = imgMatch;
      const opts = parseImageOptions(optStr || '');
      const { resolvedSrc, customFilter } = resolveSrc(src);
      return buildFigureHtml(resolvedSrc, src, caption || opts.caption, opts.width, opts.align !== 'center' ? opts.align : align, customFilter, 'latex');
    }

    return `<div class="my-4 clear-both">${inner}</div>`;
  });

  // 6. Process standalone LaTeX \includegraphics[options]{src}
  res = res.replace(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/g, (_, optStr, src) => {
    const { resolvedSrc, customFilter } = resolveSrc(src);
    const opts = parseImageOptions(optStr || '');
    return buildFigureHtml(resolvedSrc, src, opts.caption, opts.width, opts.align, customFilter, 'latex', opts.sublabel);
  });

  // 7. Process Markdown ![alt](src){options}
  res = res.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g, (_, alt, src, paramsStr) => {
    const { resolvedSrc, customFilter } = resolveSrc(src);
    const opts = parseImageOptions(paramsStr || '');
    const finalCaption = opts.caption || alt || '';
    return buildFigureHtml(resolvedSrc, src, finalCaption, opts.width, opts.align !== 'center' ? opts.align : 'center', customFilter, 'markdown', opts.sublabel);
  });

  // 8. Process existing HTML <figure>...<img ...>...</figure>
  res = res.replace(/<figure\b[^>]*>[\s\S]*?<img\b([^>]*)>[\s\S]*?(?:<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi, (_, imgAttrs, figCaption) => {
    const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';
    if (!src) return '';
    const { resolvedSrc, customFilter } = resolveSrc(src);

    let width = '75%';
    let align = 'center';
    const styleMatch = imgAttrs.match(/style=["']([^"']*)["']/);
    if (styleMatch) {
      const wMatch = styleMatch[1].match(/width:\s*([^;]+)/);
      if (wMatch) width = normalizeLatexDimension(wMatch[1].trim());
      const fMatch = styleMatch[1].match(/float:\s*([^;]+)/);
      if (fMatch) align = fMatch[1].trim() === 'left' ? 'float-left' : fMatch[1].trim() === 'right' ? 'float-right' : 'center';
    }

    return buildFigureHtml(resolvedSrc, src, figCaption || '', width, align, customFilter, 'html');
  });

  // 9. Process standalone HTML <img ...> in legacy texts
  res = res.replace(/<img\b([^>]*)\/?>/gi, (match, imgAttrs) => {
    if (imgAttrs.includes('notebook-preview-img') || imgAttrs.includes('data-asset-src')) return match;
    const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';
    if (!src) return match;
    const { resolvedSrc, customFilter } = resolveSrc(src);

    let width = '75%';
    let align = 'center';
    const altMatch = imgAttrs.match(/alt=["']([^"']*)["']/);
    const alt = altMatch ? altMatch[1] : '';
    const styleMatch = imgAttrs.match(/style=["']([^"']*)["']/);
    if (styleMatch) {
      const wMatch = styleMatch[1].match(/width:\s*([^;]+)/);
      if (wMatch) width = normalizeLatexDimension(wMatch[1].trim());
      const fMatch = styleMatch[1].match(/float:\s*([^;]+)/);
      if (fMatch) align = fMatch[1].trim() === 'left' ? 'float-left' : fMatch[1].trim() === 'right' ? 'float-right' : 'center';
    }

    return buildFigureHtml(resolvedSrc, src, alt, width, align, customFilter, 'html');
  });

  return res;
}


/**
 * Renders an interactive simulation or iframe block with a live screen sandbox and print-ready QR poster.
 */
function renderSimulationBlock(info: { title: string; url: string; width: string; height: string; idx: number }): string {
  const qrSvg = generateQrCodeSvg(info.url, 84);
  const escTitle = escapeHtmlEntities(info.title);
  const escUrl = escapeHtmlEntities(info.url);

  return `
    <div class="notebook-simulation-wrapper my-4 clear-both w-full max-w-full relative group/sim" data-simulation-idx="${info.idx}" data-simulation-url="${escUrl}" style="column-span: all; -webkit-column-span: all; width: ${info.width}; max-width: 100%;">
      <!-- Live Screen Container -->
      <div class="simulation-live-container border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-sm print:hidden">
        <!-- Header bar -->
        <div class="flex items-center justify-between px-3.5 py-2 bg-slate-850 text-slate-200 border-b border-slate-700 text-xs select-none">
          <div class="flex items-center gap-2 font-medium truncate max-w-[70%]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span class="font-bold text-slate-100 truncate">${escTitle}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-400">
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Interactive Lab
            </span>
            <a href="${escUrl}" target="_blank" rel="noopener noreferrer" class="p-1 hover:text-white rounded hover:bg-slate-700 transition-colors" title="Open Simulation in New Tab">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
        <!-- Interactive iframe -->
        <div class="relative w-full overflow-hidden bg-white simulation-iframe-box" style="height: ${info.height};">
          <iframe
            src="${escUrl}"
            title="${escTitle}"
            class="w-full h-full border-0 block"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
        <!-- Interactive resize handle -->
        <div 
          class="simulation-resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 z-20 text-slate-400 hover:text-blue-500 transition-colors"
          data-sim-resize="${info.idx}"
          title="Drag to resize simulation height"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M22 22h-4v-2h2v-2h2v4zm0-8h-2v2h2v-2zm-8 8h2v-2h-2v2zm-4 0h2v-2h-2v2zm12-16h-2v2h2v-2z"/></svg>
        </div>
      </div>

      <!-- Print Poster Placeholder (visible ONLY in print mode / PDF export) -->
      <div class="simulation-print-poster hidden p-4 border-2 border-slate-300 rounded-xl bg-slate-50 items-center justify-between gap-4 break-inside-avoid print:flex" style="page-break-inside: avoid;">
        <div class="flex-1">
          <div class="text-[9.5pt] font-bold uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1.5">
            <span>🔬</span>
            <span>Interactive Virtual Lab & Simulation</span>
          </div>
          <div class="text-[12pt] font-bold text-slate-900 mb-1">${escTitle}</div>
          <div class="text-[8.5pt] text-slate-600 font-mono mb-2 break-all">${escUrl}</div>
          <div class="text-[8pt] text-slate-500 italic">Scan QR code or use the link above to run this simulation live on your smartphone or desktop.</div>
        </div>
        <div class="shrink-0 flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
          ${qrSvg}
          <span class="text-[7.5pt] font-mono text-slate-500 mt-1 uppercase tracking-tight">Scan to Launch</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Parses LaTeX environments: \\begin{center}, \\begin{flushleft}, \\begin{theorem}, etc.
 */
function parseLatexEnvironments(content: string): string {
  let res = content;

  // \begin{center} ... \end{center}
  res = res.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (_, inner) => {
    return inner
      .trim()
      .split('\n')
      .map((line: string) => (line.trim() ? `\\aligncenter{${line.trim()}}` : ''))
      .join('\n');
  });

  // \begin{flushleft} ... \end{flushleft}
  res = res.replace(/\\begin\{flushleft\}([\s\S]*?)\\end\{flushleft\}/g, (_, inner) => {
    return inner
      .trim()
      .split('\n')
      .map((line: string) => (line.trim() ? `\\alignleft{${line.trim()}}` : ''))
      .join('\n');
  });

  // \begin{flushright} ... \end{flushright}
  res = res.replace(/\\begin\{flushright\}([\s\S]*?)\\end\{flushright\}/g, (_, inner) => {
    return inner
      .trim()
      .split('\n')
      .map((line: string) => (line.trim() ? `\\alignright{${line.trim()}}` : ''))
      .join('\n');
  });

  // \begin{theorem} ... \end{theorem}
  res = res.replace(/\\begin\{theorem\}([\s\S]*?)\\end\{theorem\}/g, (_, inner) => {
    return `> [!THEOREM]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{definition} ... \end{definition}
  res = res.replace(/\\begin\{definition\}([\s\S]*?)\\end\{definition\}/g, (_, inner) => {
    return `> [!DEFINITION]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{lemma} ... \end{lemma}
  res = res.replace(/\\begin\{lemma\}([\s\S]*?)\\end\{lemma\}/g, (_, inner) => {
    return `> [!LEMMA]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{proof} ... \end{proof}
  res = res.replace(/\\begin\{proof\}([\s\S]*?)\\end\{proof\}/g, (_, inner) => {
    return `> [!PROOF]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{caution} ... \end{caution} (Sears & Zemansky style Caution Callout)
  res = res.replace(/\\begin\{caution\}([\s\S]*?)\\end\{caution\}/g, (_, inner) => {
    return `
      <div class="my-3.5 p-3 rounded-md bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-500 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-serif clear-both">
        <span class="inline-block bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider mr-2 font-sans select-none">Caution</span>
        <span>${inner.trim()}</span>
      </div>
    `;
  });

  // \marginnote{...} or \sidenote{...}
  res = res.replace(/\\(?:marginnote|sidenote)\{([^}]+)\}/g, (_, note) => {
    return `<span class="float-left mr-4 mb-2 p-2 rounded bg-slate-100 dark:bg-slate-800 text-[8.5pt] text-slate-600 dark:text-slate-300 w-[30%] border-l-2 border-slate-400 clear-left italic font-serif">${note}</span>`;
  });

  // \begin{marginlayout} ... \end{marginlayout} (Textbook Margin Rail Asymmetric Layout)
  res = res.replace(/\\begin\{marginlayout\}([\s\S]*?)\\end\{marginlayout\}/g, (_, inner) => {
    const marginMatch = inner.match(/\\begin\{margincol\}([\s\S]*?)\\end\{margincol\}/);
    const mainMatch = inner.match(/\\begin\{maincol\}([\s\S]*?)\\end\{maincol\}/);

    if (marginMatch && mainMatch) {
      return `
        <div class="textbook-margin-grid grid grid-cols-12 gap-5 my-4 w-full clear-both" style="column-span: all; -webkit-column-span: all; width: 100%;">
          <div class="col-span-4 border-r border-slate-200/90 dark:border-slate-800 pr-3.5 space-y-3 text-left">
            ${marginMatch[1].trim()}
          </div>
          <div class="col-span-8 pl-1">
            ${mainMatch[1].trim()}
          </div>
        </div>
      `;
    }
    return `<div class="textbook-margin-grid w-full my-3" style="column-span: all; -webkit-column-span: all;">${inner.trim()}</div>`;
  });

  // \begin{twocolumn} ... \end{twocolumn} or :::layout twocolumn
  res = res.replace(/(?:\\begin\{twocolumn\}|:::layout\s+twocolumn)\s*\n?([\s\S]*?)\n?(?:\\end\{twocolumn\}|:::)/g, (_, inner) => {
    return `<div class="scientific-twocolumn my-4" style="column-count: 2; column-gap: 1.5rem; column-rule: 1px solid #e2e8f0; width: 100%; text-align: justify;">\n${inner.trim()}\n</div>`;
  });

  // \begin{onecolumn} ... \end{onecolumn} or :::layout single
  res = res.replace(/(?:\\begin\{onecolumn\}|:::layout\s+(?:single|onecolumn))\s*\n?([\s\S]*?)\n?(?:\\end\{onecolumn\}|:::)/g, (_, inner) => {
    return `<div class="scientific-onecolumn my-4" style="column-count: 1; column-span: all; -webkit-column-span: all; width: 100%;">\n${inner.trim()}\n</div>`;
  });

  // :::layout marginrail
  res = res.replace(/:::layout\s+marginrail\s*\n?([\s\S]*?)\n?:::/g, (_, inner) => {
    return `<div class="textbook-margin-grid w-full my-3" style="column-span: all; -webkit-column-span: all;">${inner.trim()}</div>`;
  });

  return res;
}

interface TokenStore {
  mathDisplayTokens: string[];
  mathInlineTokens: string[];
  rawHtmlTokens: string[];
  iframeTokens: { title: string; url: string; width: string; height: string; idx: number }[];
}

interface ContentBlock {
  type: string;
  html: string;
  estimatedHeight: number;
  rawText?: string;
  rowCount?: number;
  linesCount?: number;
  isSpacer?: boolean;
}

/**
 * Restores KaTeX formulas, iframes, and raw HTML tokens into final HTML
 */
function restoreTokens(html: string, tokens: TokenStore): string {
  let res = html;

  // 1. Restore Raw HTML tokens (up to 3 passes in case a container wraps another token)
  for (let pass = 0; pass < 3; pass++) {
    if (!res.includes('\u0002RAWHTML')) break;
    res = res.replace(/\u0002RAWHTML(\d+)\u0003/g, (_, id) => {
      const idx = parseInt(id, 10);
      return tokens.rawHtmlTokens[idx] || '';
    });
  }

  // 2. Restore Display Math tokens
  res = res.replace(/\u0002MATHDISP(\d+)\u0003/g, (_, id) => {
    const idx = parseInt(id, 10);
    const formula = tokens.mathDisplayTokens[idx] || '';
    return renderKaTeXFormula(formula, true);
  });

  // 3. Restore Inline Math tokens
  res = res.replace(/\u0002MATHINL(\d+)\u0003/g, (_, id) => {
    const idx = parseInt(id, 10);
    const formula = tokens.mathInlineTokens[idx] || '';
    return renderKaTeXFormula(formula, false);
  });

  // 4. Restore Simulation iframe tokens
  res = res.replace(/\u0002IFRAME(\d+)\u0003/g, (_, id) => {
    const idx = parseInt(id, 10);
    const info = tokens.iframeTokens[idx];
    return info ? renderSimulationBlock(info) : '';
  });

  return res;
}

/**
 * Estimates rendered height of a block in pixels given page settings
 */
function estimateBlockHeight(block: ContentBlock, settings?: PageSettings): number {
  const fontSize = settings?.fontSizePt ?? 11;
  const lineHeight = settings?.lineHeight ?? 1.6;
  const lineHeightPx = fontSize * 1.333 * lineHeight;

  const paperDim = settings && settings.paperSize !== 'Custom' && PAPER_DIMENSIONS[settings.paperSize]
    ? PAPER_DIMENSIONS[settings.paperSize]
    : { width: settings?.customWidthMm || 210, height: settings?.customHeightMm || 297 };
  const isPortrait = !settings || settings.orientation === 'portrait';
  const pageWidthMm = isPortrait ? paperDim.width : paperDim.height;
  const leftMarginMm = settings?.margins?.left ?? 20;
  const rightMarginMm = settings?.margins?.right ?? 20;
  const usableWidthPx = Math.max(300, (pageWidthMm - leftMarginMm - rightMarginMm) * 3.7795);

  const isTwoColumn = settings?.layoutMode === 'two-column' || settings?.columns === 2;
  const colWidthPx = isTwoColumn ? (usableWidthPx - 30) / 2 : usableWidthPx;
  const charWidthPx = Math.max(5.5, fontSize * 0.6);
  const charsPerLine = Math.max(25, Math.floor(colWidthPx / charWidthPx));

  switch (block.type) {
    case 'h1':
      return 74;
    case 'h2':
      return 56;
    case 'h3':
      return 46;
    case 'h4':
      return 38;
    case 'hr':
      return 30;
    case 'spacer':
      return 12;
    case 'math_disp':
      return 64;
    case 'table':
      return 52 + (block.rowCount || 3) * 34 + 22;
    case 'figure':
      return 280;
    case 'simulation':
      return 420;
    case 'code':
      return 36 + (block.linesCount || 3) * 21;
    case 'blockquote':
      return 44 + Math.ceil(((block.rawText || '').length) / charsPerLine) * lineHeightPx;
    case 'list':
      return 22 + (block.linesCount || 3) * 28;
    case 'p':
    default: {
      const raw = block.rawText || '';
      const hasFigureToken = /\u0002RAWHTML\d+\u0003/.test(raw);
      const textLen = raw.length;
      const explicitBreaks = raw.split('<br/>').length - 1;
      const wrappedLines = Math.max(1, Math.ceil(textLen / charsPerLine));
      const totalLines = wrappedLines + explicitBreaks;
      const figureExtra = hasFigureToken ? 180 : 0;
      return Math.max(26, Math.round(totalLines * lineHeightPx + 18 + figureExtra));
    }
  }
}

/**
 * Parses markdown into structured, self-contained HTML blocks with height estimations
 */
function parseContentToBlocks(
  sectionMarkdown: string,
  assets: Record<string, DocumentAsset> | undefined,
  tokens: TokenStore,
  pageTableOffset: number = 0,
  pageIframeOffset: number = 0,
  settings?: PageSettings
): { blocks: ContentBlock[]; tableCount: number; iframeCount: number } {
  let content = sectionMarkdown;

  // 1. Extract LaTeX Math Environments FIRST so math inside environments/captions/tables is never mangled
  const MATH_ENV_REGEX = /\\begin\{(equation\*?|align\*?|gather\*?|multline\*?|flalign\*?|split|aligned|matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|array)\}([\s\S]*?)\\end\{\1\}/g;
  content = content.replace(MATH_ENV_REGEX, (fullMatch) => {
    const token = `\u0002MATHDISP${tokens.mathDisplayTokens.length}\u0003`;
    tokens.mathDisplayTokens.push(fullMatch.trim());
    return `\n${token}\n`;
  });

  // 2. Extract Display Math: $$ ... $$ or \[ ... \]
  content = content.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g, (_, p1, p2) => {
    const formula = (p1 || p2 || '').trim();
    const token = `\u0002MATHDISP${tokens.mathDisplayTokens.length}\u0003`;
    tokens.mathDisplayTokens.push(formula);
    return `\n${token}\n`;
  });

  // 3. Extract Inline Math: \( ... \), \begin{math}...\end{math}, \ensuremath{...}
  content = content.replace(/\\\(([\s\S]*?)\\\)|\\begin\{math\}([\s\S]*?)\\end\{math\}|\\ensuremath\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, p1, p2, p3) => {
    const formula = (p1 || p2 || p3 || '').trim();
    const token = `\u0002MATHINL${tokens.mathInlineTokens.length}\u0003`;
    tokens.mathInlineTokens.push(formula);
    return token;
  });

  // 4. Extract Inline Math: $ ... $ (supports multiple inline math expressions on the same line or inside macros)
  content = content.replace(/(^|[^\\$])\$([^$]+?)(?<!\\)\$/g, (match, prefix, p1) => {
    const formula = p1.trim();
    if (!formula) return match;
    const token = `\u0002MATHINL${tokens.mathInlineTokens.length}\u0003`;
    tokens.mathInlineTokens.push(formula);
    return `${prefix}${token}`;
  });

  // 5. Parse LaTeX environments (theorems, definitions, layout grids, columns)
  content = parseLatexEnvironments(content);

  // 6. Pre-process images (\includegraphics, ![alt](src), <figure>)
  content = parseCustomImages(content, assets);

  // 7. Extract interactive simulations (:::iframe or :::simulation)
  content = content.replace(/:::(?:iframe|simulation)\s*\n([\s\S]*?)\n:::/g, (_, block) => {
    const lines = block.split('\n');
    let title = 'Interactive Simulation';
    let url = '';
    let width = '100%';
    let height = '380px';

    lines.forEach((l: string) => {
      const [k, ...vParts] = l.split(':');
      const val = vParts.join(':').trim();
      if (!k) return;
      const key = k.trim().toLowerCase();
      if (key === 'title') title = val;
      if (key === 'url' || key === 'src') url = val;
      if (key === 'width') width = val;
      if (key === 'height') height = val;
    });

    if (!url) return '';
    const idx = pageIframeOffset + tokens.iframeTokens.length;
    const token = `\u0002IFRAME${tokens.iframeTokens.length}\u0003`;
    tokens.iframeTokens.push({ title, url, width, height, idx });
    return `\n\n${token}\n\n`;
  });

  // 8. Extract raw HTML iframes
  content = content.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>|<iframe\b([^>]*)\/>/gi, (_, attrs1, attrs2) => {
    const attrs = attrs1 || attrs2 || '';
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    const url = srcMatch ? srcMatch[1] : '';
    if (!url) return '';

    const titleMatch = attrs.match(/title=["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : 'Embedded Simulation';

    const widthMatch = attrs.match(/width=["']?([^\s"'>]+)["']?/);
    const width = widthMatch ? (widthMatch[1].endsWith('%') || widthMatch[1].endsWith('px') ? widthMatch[1] : `${widthMatch[1]}px`) : '100%';

    const heightMatch = attrs.match(/height=["']?([^\s"'>]+)["']?/);
    const height = heightMatch ? (heightMatch[1].endsWith('%') || heightMatch[1].endsWith('px') ? heightMatch[1] : `${heightMatch[1]}px`) : '380px';

    const idx = pageIframeOffset + tokens.iframeTokens.length;
    const token = `\u0002IFRAME${tokens.iframeTokens.length}\u0003`;
    tokens.iframeTokens.push({ title, url, width, height, idx });
    return `\n\n${token}\n\n`;
  });

  // 9. Extract MathML (<math> ... </math>)
  content = content.replace(/<math\b[\s\S]*?<\/math>/gi, (match) => {
    const isBlock = /display=["']block["']/i.test(match);
    if (isBlock) {
      const token = `\u0002RAWHTML${tokens.rawHtmlTokens.length}\u0003`;
      tokens.rawHtmlTokens.push(`<div class="katex-display-wrapper my-1.5 py-0.5 text-center w-full max-w-full overflow-x-auto select-all">${match}</div>`);
      return `\n${token}\n`;
    } else {
      const token = `\u0002RAWHTML${tokens.rawHtmlTokens.length}\u0003`;
      tokens.rawHtmlTokens.push(`<span class="inline-block align-baseline select-all">${match}</span>`);
      return token;
    }
  });

  // 10. Extract LaTeX tabular: \begin{tabular}{...} ... \end{tabular}
  content = content.replace(/\\begin\{tabular\}\{[^}]*\}([\s\S]*?)\\end\{tabular\}/g, (_, inner) => {
    const rows = inner
      .split('\\\\')
      .map((r: string) => r.replace(/\\hline/g, '').trim())
      .filter((r: string) => r.length > 0);
    if (rows.length === 0) return '';
    const tableLines = rows.map((r: string, idx: number) => {
      const cells = r.split('&').map((c: string) => c.trim());
      const line = `| ${cells.join(' | ')} |`;
      if (idx === 0 && rows.length > 1) {
        const sep = `| ${cells.map(() => '---').join(' | ')} |`;
        return `${line}\n${sep}`;
      }
      return line;
    });
    return `\n${tableLines.join('\n')}\n`;
  });

  // 11. Extract raw HTML tables
  content = content.replace(/<table\b([\s\S]*?)<\/table>/gi, (match) => {
    const token = `\u0002RAWHTML${tokens.rawHtmlTokens.length}\u0003`;
    const wrapped = `<div class="my-3 overflow-x-auto w-full max-w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">${match.replace(/<table\b([^>]*)>/i, '<table class="notebook-table w-full border-collapse break-words max-w-full"$1>')}</div>`;
    tokens.rawHtmlTokens.push(wrapped);
    return `\n${token}\n`;
  });

  // 12. Extract intentional HTML tags (like <span style="...">, <u>, <mark>, <del>, <figure>, <img>)
  content = content.replace(/<(span|mark|del|u|b|i|figure|img|figcaption|font|div)[^>]*>[\s\S]*?<\/\1>|<(img|hr|br)[^>]*\/?>/gi, (match) => {
    const token = `\u0002RAWHTML${tokens.rawHtmlTokens.length}\u0003`;
    tokens.rawHtmlTokens.push(match);
    return token;
  });

  // Line-by-line block builder
  const lines = content.split('\n');
  const blocks: ContentBlock[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let listItems: string[] = [];

  let inBlockquote = false;
  let blockquoteType = 'normal';
  let blockquoteCustomTitle: string | undefined = undefined;
  let blockquoteBuffer: string[] = [];

  let inTable = false;
  let tableBuffer: string[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  let paragraphBuffer: string[] = [];
  let currentTableIndex = pageTableOffset;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;

    let pContent = '';
    for (let idx = 0; idx < paragraphBuffer.length; idx++) {
      const rawL = paragraphBuffer[idx];
      const trimL = rawL.trim();
      if (!trimL) continue;

      // Question options check: e.g. (A), (B), (1), (a), etc.
      const isOptionLine = /^(\([A-Za-z0-9]+\)|[A-Za-z0-9]+\))\s+/.test(trimL);
      // Hard line break check: line ending with 2 spaces, '\\', or '<br>'
      const hasExplicitBreak = /(?: {2,}|\\\\|<br\s*\/?>)$/i.test(rawL);
      const cleanL = rawL.replace(/(?: {2,}|\\\\|<br\s*\/?>)$/i, '').trim();

      if (idx === 0) {
        pContent = cleanL;
      } else {
        if (hasExplicitBreak || isOptionLine) {
          pContent += '<br/>' + cleanL;
        } else {
          pContent += ' ' + cleanL;
        }
      }
    }

    if (pContent.trim()) {
      const parsed = parseInlineMarkdown(pContent);
      const snippet = normalizeBlockSnippet(pContent);
      const pBlock: ContentBlock = {
        type: 'p',
        rawText: pContent,
        html: `<p data-source-snippet="${snippet}" class="my-2 leading-relaxed text-slate-800 dark:text-slate-200 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${parsed}</p>`,
        estimatedHeight: 0
      };
      pBlock.estimatedHeight = estimateBlockHeight(pBlock, settings);
      blocks.push(pBlock);
    }

    paragraphBuffer = [];
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      const itemsHtml = listItems.map(item => `<li data-source-snippet="${normalizeBlockSnippet(item)}" class="break-words w-full max-w-full">${parseInlineMarkdown(item)}</li>`).join('');
      const tag = listType;
      const listClass = listType === 'ol' ? 'list-decimal' : 'list-disc';
      const listHtml = `<${tag} data-source-snippet="${normalizeBlockSnippet(listItems[0] || '')}" class="${listClass} list-outside pl-6 my-2 space-y-1 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${itemsHtml}</${tag}>`;

      const lBlock: ContentBlock = {
        type: 'list',
        linesCount: listItems.length,
        html: listHtml,
        estimatedHeight: 16 + listItems.length * 26
      };
      blocks.push(lBlock);

      inList = false;
      listItems = [];
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      const inner = blockquoteBuffer.map(l => parseInlineMarkdown(l)).join('<br/>');
      let borderClass = 'border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200';
      let defaultBadge = '';

      if (blockquoteType === 'THEOREM') {
        borderClass = 'border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100';
        defaultBadge = 'Theorem';
      } else if (blockquoteType === 'DEFINITION') {
        borderClass = 'border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100';
        defaultBadge = 'Definition';
      } else if (blockquoteType === 'LEMMA') {
        borderClass = 'border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100';
        defaultBadge = 'Lemma';
      } else if (blockquoteType === 'PROOF') {
        borderClass = 'border-l-4 border-slate-400 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 italic';
        defaultBadge = 'Proof';
      } else if (blockquoteType === 'EXAM_QUESTION') {
        borderClass = 'border-l-4 border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100';
        defaultBadge = 'Examination Question';
      } else if (blockquoteType === 'NOTE') {
        borderClass = 'border-l-4 border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 text-sky-950 dark:text-sky-100';
        defaultBadge = 'Note';
      } else if (blockquoteType === 'FORMULA' || blockquoteType === 'KEY') {
        borderClass = 'border-l-4 border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 text-purple-950 dark:text-purple-100';
        defaultBadge = 'Important Formula';
      } else if (blockquoteType === 'BOX' || blockquoteType === 'CALLOUT' || blockquoteType === 'IMPORTANT' || blockquoteType === 'CUSTOM') {
        borderClass = 'border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100';
        defaultBadge = 'Important Note';
      }

      let activeBadgeText = defaultBadge;
      if (blockquoteCustomTitle !== undefined) {
        const trimmedTitle = blockquoteCustomTitle.trim();
        if (trimmedTitle === '' || trimmedTitle.toLowerCase() === 'none' || trimmedTitle.toLowerCase() === 'false' || trimmedTitle.toLowerCase() === 'off') {
          activeBadgeText = '';
        } else {
          activeBadgeText = trimmedTitle;
        }
      }

      const titleBadge = activeBadgeText ? `<div class="text-xs font-bold uppercase tracking-wider mb-1 opacity-90">${escapeHtmlEntities(activeBadgeText)}</div>` : '';
      const rawJoined = blockquoteBuffer.join(' ');
      const bHtml = `<blockquote data-source-snippet="${normalizeBlockSnippet(rawJoined)}" class="my-3 px-4 py-2.5 rounded-r-xl ${borderClass} break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${titleBadge}${inner}</blockquote>`;

      const bBlock: ContentBlock = {
        type: 'blockquote',
        rawText: rawJoined,
        html: bHtml,
        estimatedHeight: 0
      };
      bBlock.estimatedHeight = estimateBlockHeight(bBlock, settings);
      blocks.push(bBlock);

      inBlockquote = false;
      blockquoteBuffer = [];
      blockquoteType = 'normal';
      blockquoteCustomTitle = undefined;
    }
  };

  const flushTable = () => {
    if (inTable && tableBuffer.length > 0) {
      const tHtml = renderMarkdownTable(tableBuffer, currentTableIndex++);
      const tBlock: ContentBlock = {
        type: 'table',
        rowCount: tableBuffer.length,
        html: tHtml,
        estimatedHeight: 45 + tableBuffer.length * 34 + 24
      };
      blocks.push(tBlock);

      inTable = false;
      tableBuffer = [];
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      const codeContent = codeBuffer.map(l => escapeHtmlEntities(l)).join('\n');
      const cHtml = `
        <pre class="my-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto w-full max-w-full border border-slate-800" style="width: 100%; max-width: 100%;">
          <code>${codeContent}</code>
        </pre>
      `;
      const cBlock: ContentBlock = {
        type: 'code',
        linesCount: codeBuffer.length,
        html: cHtml,
        estimatedHeight: 32 + codeBuffer.length * 20
      };
      blocks.push(cBlock);

      inCodeBlock = false;
      codeBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Check for standalone display math token
    const dispMatch = trimmed.match(/^\u0002MATHDISP(\d+)\u0003$/);
    if (dispMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();
      flushCodeBlock();
      blocks.push({
        type: 'math_disp',
        html: `\u0002MATHDISP${dispMatch[1]}\u0003`,
        estimatedHeight: 75
      });
      continue;
    }

    // 2. Check for standalone simulation token
    const iframeMatch = trimmed.match(/^\u0002IFRAME(\d+)\u0003$/);
    if (iframeMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();
      flushCodeBlock();
      blocks.push({
        type: 'simulation',
        html: `\u0002IFRAME${iframeMatch[1]}\u0003`,
        estimatedHeight: 420
      });
      continue;
    }

    // 3. Code block fences (```)
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        flushList();
        flushBlockquote();
        flushTable();
        inCodeBlock = true;
      } else {
        flushCodeBlock();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 4. Table line check (Markdown pipe tables, ASCII grid tables +---+---+, or borderless tables)
    const isGridBorder = /^\+[-+=| ]+\+$/.test(trimmed);
    const isPipeLine = (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1) ||
      (inTable && trimmed.includes('|')) ||
      (trimmed.includes('|') && !trimmed.includes('\u0002') && !trimmed.startsWith('#') && !trimmed.startsWith('>') && !trimmed.startsWith('$') && !trimmed.startsWith('\\') && trimmed.split('|').length >= 3);

    if (isGridBorder || isPipeLine) {
      flushParagraph();
      flushList();
      flushBlockquote();
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Standalone LaTeX / Math equation check (without $ or $$ delimiters)
    if (isStandaloneMathEquation(trimmed)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();
      const token = `\u0002MATHDISP${tokens.mathDisplayTokens.length}\u0003`;
      tokens.mathDisplayTokens.push(trimmed);
      blocks.push({
        type: 'math_disp',
        html: token,
        estimatedHeight: 46
      });
      continue;
    }

    // 5. Horizontal divider (---, ***, ___)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      flushList();
      flushBlockquote();
      blocks.push({
        type: 'hr',
        html: '<hr class="my-5 border-t border-slate-200 dark:border-slate-800" />',
        estimatedHeight: 30
      });
      continue;
    }

    // 6. Callout / Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      flushTable();
      inBlockquote = true;
      const quoteText = trimmed.replace(/^>\s?/, '');
      const calloutMatch = quoteText.match(/^\[!([A-Z_]+)(?::\s*([^\]]*))?\](?:\s*(.*))?/i);

      if (calloutMatch) {
        const typeUpper = calloutMatch[1].toUpperCase();
        const titleInBrackets = calloutMatch[2] !== undefined ? calloutMatch[2].trim() : undefined;
        const restOfLine = calloutMatch[3] ? calloutMatch[3].trim() : '';

        blockquoteType = typeUpper;
        blockquoteCustomTitle = titleInBrackets;

        if (restOfLine) {
          blockquoteBuffer.push(restOfLine);
        }
      } else {
        blockquoteBuffer.push(quoteText);
      }
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // 7. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();

      if (trimmed.startsWith('# ')) {
        const raw = trimmed.substring(2);
        const text = parseInlineMarkdown(raw);
        blocks.push({
          type: 'h1',
          rawText: raw,
          html: `<h1 data-source-snippet="${normalizeBlockSnippet(raw)}" class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-6 mb-3 text-slate-900 dark:text-slate-50 border-b border-slate-200/80 dark:border-slate-800 pb-1.5 break-words w-full max-w-full" style="column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%;">${text}</h1>`,
          estimatedHeight: 68
        });
      } else if (trimmed.startsWith('## ')) {
        const raw = trimmed.substring(3);
        const text = parseInlineMarkdown(raw);
        blocks.push({
          type: 'h2',
          rawText: raw,
          html: `<h2 data-source-snippet="${normalizeBlockSnippet(raw)}" class="text-xl sm:text-2xl font-bold tracking-tight mt-5 mb-2.5 text-slate-800 dark:text-slate-100 break-words w-full max-w-full" style="column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%;">${text}</h2>`,
          estimatedHeight: 52
        });
      } else if (trimmed.startsWith('### ')) {
        const raw = trimmed.substring(4);
        const text = parseInlineMarkdown(raw);
        blocks.push({
          type: 'h3',
          rawText: raw,
          html: `<h3 data-source-snippet="${normalizeBlockSnippet(raw)}" class="text-lg sm:text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${text}</h3>`,
          estimatedHeight: 42
        });
      } else if (trimmed.startsWith('#### ')) {
        const raw = trimmed.substring(5);
        const text = parseInlineMarkdown(raw);
        blocks.push({
          type: 'h4',
          rawText: raw,
          html: `<h4 data-source-snippet="${normalizeBlockSnippet(raw)}" class="text-base sm:text-lg font-semibold mt-3 mb-1.5 text-slate-700 dark:text-slate-300 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${text}</h4>`,
          estimatedHeight: 36
        });
      }
      continue;
    }

    // 8. Unordered Lists (- , * , + )
    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(trimmed.replace(/^[-*+]\s+/, ''));
      continue;
    }

    // 9. Ordered Lists (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // If active list was in progress and current line doesn't match list, flush it
    flushList();

    // 10. Empty line / paragraph break - preserves vertical spacing without huge gaps
    if (trimmed === '') {
      flushParagraph();
      flushBlockquote();
      flushTable();
      const lastBlock = blocks[blocks.length - 1];
      if (!lastBlock || lastBlock.isSpacer) {
        continue;
      }
      blocks.push({
        type: 'spacer',
        isSpacer: true,
        html: '<div class="h-2.5 my-0.5" aria-hidden="true"></div>',
        estimatedHeight: 12
      });
      continue;
    }

    // 11. Normal text line: accumulate in paragraphBuffer to prevent breaking sentences across lines
    paragraphBuffer.push(line);
  }

  // Final block flushes
  flushParagraph();
  flushList();
  flushBlockquote();
  flushTable();
  flushCodeBlock();

  return {
    blocks,
    tableCount: currentTableIndex,
    iframeCount: tokens.iframeTokens.length
  };
}

/**
 * Renders the markdown content of a single page into pristine HTML.
 */
export function renderPageContent(
  pageMarkdown: string,
  assets?: Record<string, DocumentAsset>,
  pageTableOffset: number = 0,
  pageIframeOffset: number = 0,
  settings?: PageSettings
): string {
  if (!pageMarkdown || !pageMarkdown.trim()) {
    return '<p class="text-slate-400 italic py-8 text-center text-sm">Empty page content. Type or insert elements in the editor.</p>';
  }

  const tokens: TokenStore = {
    mathDisplayTokens: [],
    mathInlineTokens: [],
    rawHtmlTokens: [],
    iframeTokens: []
  };

  const { blocks } = parseContentToBlocks(
    pageMarkdown,
    assets,
    tokens,
    pageTableOffset,
    pageIframeOffset,
    settings
  );

  const rawJoined = blocks.map(b => b.html).join('\n');
  return restoreTokens(rawJoined, tokens);
}

/**
 * Splits document text into individual pages automatically based on printable page height and manual page breaks.
 */
export function parseDocumentToPages(
  rawContent: string,
  assets?: Record<string, DocumentAsset>,
  settings?: PageSettings
): string[] {
  if (!rawContent || !rawContent.trim()) {
    return ['<p class="text-slate-400 italic py-8 text-center text-sm">Empty page content. Type or insert elements in the editor.</p>'];
  }

  const normalized = rawContent.replace(/\r\n/g, '\n');

  // Split on manual page break markers: \newpage, \pagebreak, \clearpage, ---pagebreak---, or \break
  const manualSections = normalized.split(/(?:^|\n)[ \t]*(?:\\newpage|\\pagebreak|\\clearpage|---pagebreak---|\\break)[ \t]*(?:\n|$)/gi);

  // Calculate printable page dimensions in pixels
  const paperDim = settings && settings.paperSize !== 'Custom' && PAPER_DIMENSIONS[settings.paperSize]
    ? PAPER_DIMENSIONS[settings.paperSize]
    : { width: settings?.customWidthMm || 210, height: settings?.customHeightMm || 297 };

  const isPortrait = !settings || settings.orientation === 'portrait';
  const pageHeightMm = isPortrait ? paperDim.height : paperDim.width;
  const baseHeightPx = Math.round(pageHeightMm * 3.7795);

  const topMarginPx = (settings?.margins?.top ?? 20) * 3.7795;
  const bottomMarginPx = (settings?.margins?.bottom ?? 20) * 3.7795;
  const headerHeightPx = settings?.runningHeader?.enabled ? 42 : 0;
  const footerHeightPx = settings?.pageNumbering?.enabled ? 42 : 0;

  // Usable height for body content
  const usableBodyHeightPx = Math.max(350, baseHeightPx - topMarginPx - bottomMarginPx - headerHeightPx - footerHeightPx);

  // In two-column mode, capacity is doubled
  const isTwoColumn = settings?.layoutMode === 'two-column' || settings?.columns === 2;
  const pageCapacityPx = isTwoColumn ? usableBodyHeightPx * 1.85 : usableBodyHeightPx;

  const finalPages: string[] = [];
  let globalTableCount = 0;
  let globalIframeOffset = 0;

  for (const sectionText of manualSections) {
    const cleanSection = sectionText.replace(/(?:\\newpage|\\pagebreak|\\clearpage|---pagebreak---|\\break)/gi, '');
    if (!cleanSection.trim()) {
      continue;
    }

    const tokens: TokenStore = {
      mathDisplayTokens: [],
      mathInlineTokens: [],
      rawHtmlTokens: [],
      iframeTokens: []
    };

    const { blocks } = parseContentToBlocks(
      cleanSection,
      assets,
      tokens,
      globalTableCount,
      globalIframeOffset,
      settings
    );

    globalTableCount += (cleanSection.match(/(?:^|\n)\|[^\n]+\|(?:\n\|[^\n]+\|)+/g) || []).length;
    globalIframeOffset += tokens.iframeTokens.length;

    let currentPageBlocks: string[] = [];
    let currentPageHeight = 0;

    for (const block of blocks) {
      // Avoid starting a new page with a leading empty spacer
      if (currentPageBlocks.length === 0 && block.isSpacer) {
        continue;
      }

      // If a single paragraph is larger than the page capacity, split it across pages
      if (block.type === 'p' && block.estimatedHeight > pageCapacityPx) {
        if (currentPageBlocks.length > 0) {
          finalPages.push(restoreTokens(currentPageBlocks.join('\n'), tokens));
          currentPageBlocks = [];
          currentPageHeight = 0;
        }

        const sentences = (block.rawText || '').split(/(?<=[.?!;])\s+/);
        let chunkText = '';

        for (const sentence of sentences) {
          const testText = chunkText ? `${chunkText} ${sentence}` : sentence;
          const testHeight = estimateBlockHeight({ type: 'p', rawText: testText, html: '', estimatedHeight: 0 }, settings);

          if (testHeight > pageCapacityPx && chunkText) {
            const parsed = parseInlineMarkdown(chunkText);
            finalPages.push(restoreTokens(`<p class="my-2 leading-relaxed text-slate-800 dark:text-slate-200 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${parsed}</p>`, tokens));
            chunkText = sentence;
          } else {
            chunkText = testText;
          }
        }

        if (chunkText) {
          const parsed = parseInlineMarkdown(chunkText);
          const remainingHeight = estimateBlockHeight({ type: 'p', rawText: chunkText, html: '', estimatedHeight: 0 }, settings);
          currentPageBlocks = [`<p class="my-2 leading-relaxed text-slate-800 dark:text-slate-200 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${parsed}</p>`];
          currentPageHeight = remainingHeight;
        }
        continue;
      }

      // Check if adding this block overflows the current page
      if (currentPageHeight + block.estimatedHeight > pageCapacityPx && currentPageBlocks.length > 0) {
        finalPages.push(restoreTokens(currentPageBlocks.join('\n'), tokens));
        currentPageBlocks = [block.html];
        currentPageHeight = block.estimatedHeight;
      } else {
        currentPageBlocks.push(block.html);
        currentPageHeight += block.estimatedHeight;
      }
    }

    if (currentPageBlocks.length > 0) {
      finalPages.push(restoreTokens(currentPageBlocks.join('\n'), tokens));
    }
  }

  return finalPages.length > 0 ? finalPages : ['<p class="text-slate-400 italic py-8 text-center text-sm">Empty page content. Type or insert elements in the editor.</p>'];
}

/**
 * Helper to render markdown table lines into a clean, interactive, responsive HTML table.
 * Supports standard Markdown pipe tables, tables without outer pipes, and ASCII grid tables (+---+---+).
 */
export function renderMarkdownTable(lines: string[], tableIndex: number = 0): string {
  if (lines.length < 1) return '';

  // 1. Filter out pure ASCII grid border lines (e.g. +---+---+, +===+===+)
  const contentLines = lines.filter(l => {
    const t = l.trim();
    return !/^\+[-+=| ]+\+$/.test(t);
  });

  if (contentLines.length === 0) return '';

  // 2. Parse rows into cells
  const rows: string[][] = contentLines.map(line => {
    const t = line.trim();
    // If enclosed in pipes | ... |
    if (t.startsWith('|') && t.endsWith('|') && t.length > 1) {
      return t.slice(1, -1).split('|').map(c => c.trim());
    }
    // If starts with | but doesn't end with |
    if (t.startsWith('|')) {
      return t.slice(1).split('|').map(c => c.trim());
    }
    // If ends with | but doesn't start with |
    if (t.endsWith('|')) {
      return t.slice(0, -1).split('|').map(c => c.trim());
    }
    // No outer pipes: "Col 1 | Col 2 | Col 3"
    return t.split('|').map(c => c.trim());
  });

  if (rows.length === 0 || rows[0].length === 0) return '';

  // 3. Detect separator row (e.g. |---|:---:|---:| or |===|===|)
  const isSeparator = (r: string[]) => r.length > 0 && r.every(cell => /^:?[-=]+:?$/.test(cell.trim()));
  const sepIdx = rows.findIndex(isSeparator);

  let headerRow: string[];
  let bodyRows: string[][];
  let sepRow: string[] | undefined;

  if (sepIdx > 0) {
    headerRow = rows[0];
    sepRow = rows[sepIdx];
    bodyRows = rows.slice(1).filter((_, idx) => idx !== (sepIdx - 1));
  } else if (rows.length === 1) {
    headerRow = rows[0];
    bodyRows = [];
  } else {
    // Treat first row as header if no explicit separator
    headerRow = rows[0];
    bodyRows = rows.slice(1).filter(r => !isSeparator(r));
  }

  // Determine alignments from separator if present
  const alignments = headerRow.map((_, i) => {
    if (!sepRow || !sepRow[i]) return 'left';
    const s = sepRow[i].trim();
    if (s.startsWith(':') && s.endsWith(':')) return 'center';
    if (s.endsWith(':')) return 'right';
    return 'left';
  });

  const thead = `
    <thead>
      <tr class="bg-slate-100 dark:bg-slate-800/80 font-bold border-b border-slate-300 dark:border-slate-700">
        ${headerRow.map((h, colIdx) => `
          <th 
            contenteditable="true" 
            data-table-cell="true" 
            data-table-idx="${tableIndex}" 
            data-row-idx="0" 
            data-col-idx="${colIdx}" 
            style="text-align: ${alignments[colIdx] || 'left'}; position: relative;"
            class="notebook-table-cell px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold break-words transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/30 focus:outline-none focus:bg-blue-50/80 dark:focus:bg-blue-900/40 focus:ring-1 focus:ring-blue-500"
          >
            ${parseInlineMarkdown(h)}
            <div class="table-col-resizer print:hidden absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/70 active:bg-blue-600 transition-colors z-10" data-col-resizer="${colIdx}"></div>
          </th>`).join('')}
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody>
      ${bodyRows.map((row, rowIdx) => `
        <tr class="${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/40'} border-b border-slate-200 dark:border-slate-800">
          ${row.map((cell, colIdx) => `
            <td 
              contenteditable="true" 
              data-table-cell="true" 
              data-table-idx="${tableIndex}" 
              data-row-idx="${rowIdx + 1}" 
              data-col-idx="${colIdx}" 
              style="text-align: ${alignments[colIdx] || 'left'};"
              class="notebook-table-cell px-3 py-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm break-words transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/30 focus:outline-none focus:bg-blue-50/80 dark:focus:bg-blue-900/40 focus:ring-1 focus:ring-blue-500"
            >
              ${parseInlineMarkdown(cell)}
            </td>
          `).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;

  const actionToolbar = `
    <div class="print:hidden opacity-0 group-hover/table:opacity-100 transition-opacity flex items-center justify-end gap-1 px-2 py-1 bg-slate-100/90 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold select-none">
      <button type="button" data-table-action="add-row" data-table-idx="${tableIndex}" class="px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors">+ Row</button>
      <button type="button" data-table-action="add-col" data-table-idx="${tableIndex}" class="px-2 py-0.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors">+ Col</button>
      <button type="button" data-table-action="remove-row" data-table-idx="${tableIndex}" class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-100 hover:text-rose-600 cursor-pointer transition-colors">- Row</button>
    </div>
  `;

  return `
    <div class="notebook-table-wrapper my-4 overflow-x-auto w-full max-w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs relative group/table" data-table-wrapper="${tableIndex}" style="column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%;">
      <table class="notebook-table w-full border-collapse break-words max-w-full" data-table-idx="${tableIndex}" style="width: 100%; max-width: 100%;">
        ${thead}
        ${tbody}
      </table>
      ${actionToolbar}
    </div>
  `;
}
