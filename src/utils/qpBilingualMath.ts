/**
 * Bilingual (Bengali + English) Mathematical & LaTeX Rendering Engine for প্রশ্নপত্র Maker
 * Supports:
 * 1. QPF Tokens: [EQ:...], [CHEM:...], [SYM:...], [SUB:...], [SUP:...]
 * 2. Standard LaTeX delimiters: $$...$$, $...$, \[...\], \(...\)
 * 3. Bare LaTeX commands: \frac{...}{...}, \sqrt{...}, \div, \times
 * 4. Auto-fraction conversion inside [EQ:...] and $...$ for both Bengali (e.g., ৩/৪, লব/হর) and English (e.g., 3/4, a/b)
 * 5. Preserves Bengali conjuncts (যুক্তাক্ষর), vowel signs (কার), and numerals (০-৯) inside KaTeX by grouping contiguous Bengali runs into \text{...}.
 */

export const CHEM_SUB_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '০': '₀', '১': '₁', '২': '₂', '৩': '₃', '৪': '₄',
  '৫': '₅', '৬': '₆', '৭': '₇', '৮': '₈', '৯': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
};

export const CHEM_SUP_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '০': '⁰', '১': '¹', '২': '²', '৩': '³', '৪': '⁴',
  '৫': '⁵', '৬': '⁶', '৭': '⁷', '৮': '⁸', '৯': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ'
};

export const SYM_MAP: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ',
  theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', sigma: 'σ', Sigma: 'Σ',
  omega: 'ω', Omega: 'Ω', phi: 'φ', psi: 'ψ', rho: 'ρ', tau: 'τ', epsilon: 'ε',
  deg: '°', degree: '°', pm: '±', mp: '∓', times: '×', div: '÷', cdot: '·',
  neq: '≠', leq: '≤', geq: '≥', approx: '≈', equiv: '≡', prop: '∝', inf: '∞', infty: '∞',
  sqrt: '√', cbrt: '∛', int: '∫', sum: '∑', prod: '∏', partial: '∂', nabla: '∇',
  forall: '∀', exists: '∃', in: '∈', notin: '∉', subset: '⊂', union: '∪', cap: '∩',
  and: '∧', or: '∨', not: '¬', implies: '⇒', iff: '⇔', to: '→', gets: '←',
  up: '↑', down: '↓', lr: '↔', rev: '⇌',
  hbar: 'ℏ', angstrom: 'Å', micro: 'μ', ohm: 'Ω', celsius: '°C', fahrenheit: '°F', kelvin: 'K'
};

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatChemToken(formula: string): string {
  let s = formula.trim();
  s = s.replace(/<->|<=>/g, ' ⇌ ').replace(/->/g, ' → ').replace(/\^(\d*[+-]|\+|\-)/g, (_, p1) => {
    return p1.split('').map((c: string) => CHEM_SUP_MAP[c] || c).join('');
  });
  s = s.replace(/([A-Za-z\)\]])(\d+)/g, (_, p1, p2) => {
    return p1 + p2.split('').map((c: string) => CHEM_SUB_MAP[c] || c).join('');
  });
  return `<span class="tok-chem">${escapeHtml(s)}</span>`;
}

/**
 * Prepares a math expression (in Bengali, English, or mixed) for KaTeX rendering:
 * 1. Normalizes Unicode math operators (÷ -> \div, × -> \times, − -> -)
 * 2. Converts simple inline fractions like ৩/৪, ১২/৫, লব/হর, or 3/4 into \frac{...}{...}
 *    when they are not already inside a command like \frac
 * 3. Wraps contiguous runs of Bengali script & Bengali numerals (\u0980-\u09FF)
 *    inside \text{...} so KaTeX keeps Bengali conjuncts (যুক্তাক্ষর) and vowel signs intact!
 */
export function normalizeBilingualLatex(rawExpr: string): string {
  let expr = rawExpr.trim();
  if (!expr) return '';

  // Normalize common Unicode division/multiplication symbols into LaTeX commands
  expr = expr
    .replace(/÷/g, ' \\div ')
    .replace(/×/g, ' \\times ')
    .replace(/±/g, ' \\pm ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≤/g, ' \\leq ')
    .replace(/≥/g, ' \\geq ')
    .replace(/≈/g, ' \\approx ')
    .replace(/∞/g, ' \\infty ');

  // Convert simple slash fractions a/b (supporting Bengali numerals ০-৯, Bengali words, or English numbers/variables)
  // into \frac{a}{b} when not preceded by a backslash command or URL-like pattern
  expr = expr.replace(
    /(^|[^\\a-zA-Z0-9\u0980-\u09FF\/])([\u0980-\u09FFa-zA-Z0-9]+)\s*\/\s*([\u0980-\u09FFa-zA-Z0-9]+)(?=$|[^\/a-zA-Z0-9\u0980-\u09FF])/g,
    (_, prefix, num, den) => `${prefix}\\frac{${num}}{${den}}`
  );

  // Protect existing \text{...} blocks before wrapping bare Bengali script runs
  const protectedBlocks: string[] = [];
  expr = expr.replace(/\\(?:text|mathrm|textbf|textit)\s*\{[^{}]*\}/g, (match) => {
    protectedBlocks.push(match);
    return `@@PROTECTED_TEXT_${protectedBlocks.length - 1}@@`;
  });

  // Wrap contiguous Bengali characters & Bengali numerals (\u0980-\u09FF) in \text{...}
  // This prevents KaTeX from splitting Bengali vowel signs (কার) and conjuncts (যুক্তাক্ষর) into separate math atoms
  expr = expr.replace(/[\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+)*/g, (bnMatch) => {
    return `\\text{${bnMatch}}`;
  });

  // Restore protected \text{...} blocks
  expr = expr.replace(/@@PROTECTED_TEXT_(\d+)@@/g, (_, idx) => protectedBlocks[Number(idx)] || '');

  return expr;
}

/**
 * Renders a single LaTeX expression to HTML using offline KaTeX (if available on window)
 * or a clean HTML fraction/math fallback if KaTeX fails.
 */
export function renderLatexExpression(rawExpr: string, displayMode = false): string {
  const normalized = normalizeBilingualLatex(rawExpr);
  const katexObj = (window as unknown as { katex?: { renderToString: (tex: string, opts: Record<string, unknown>) => string } }).katex;

  if (katexObj && typeof katexObj.renderToString === 'function') {
    try {
      const rendered = katexObj.renderToString(normalized, {
        throwOnError: false,
        displayMode,
        strict: false,
        trust: true
      });
      return `<span class="tok-eq${displayMode ? ' tok-eq-block' : ''}">${rendered}</span>`;
    } catch {
      // Fallback below
    }
  }

  // Pure HTML fallback for fractions, square roots, superscripts, subscripts, and division
  let fallback = escapeHtml(rawExpr.trim());
  fallback = fallback.replace(
    /\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
    '<span class="qp-inline-frac"><span class="qp-frac-num">$1</span><span class="qp-frac-den">$2</span></span>'
  );
  fallback = fallback.replace(
    /([\u0980-\u09FFa-zA-Z0-9]+)\s*\/\s*([\u0980-\u09FFa-zA-Z0-9]+)/g,
    '<span class="qp-inline-frac"><span class="qp-frac-num">$1</span><span class="qp-frac-den">$2</span></span>'
  );
  fallback = fallback
    .replace(/\\div\b/g, '÷')
    .replace(/\\times\b/g, '×')
    .replace(/\\pm\b/g, '±')
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)');

  return `<span class="tok-eq">${fallback}</span>`;
}

/**
 * Renders full text containing QPF tokens ([EQ:...], [CHEM:...], [SYM:...], [SUB:...], [SUP:...]),
 * standard LaTeX ($...$, $$...$$, \(...\), \[...\]), and inline Bengali/English fractions.
 */
export function renderQpfText(rawText: unknown): string {
  if (!rawText) return '';
  const text = String(rawText);

  // Master tokenizer regex matching:
  // 1. QPF tags: [EQ:...], [FRAC:...], [CHEM:...], [SYM:...], [SUB:...], [SUP:...]
  // 2. Display LaTeX: $$...$$ or \[...\]
  // 3. Inline LaTeX: $...$ or \(...\)
  // 4. Bare \frac{...}{...} or \sqrt{...}
  // 5. Simple Bengali fractions in plain text like ৩/৪ or লব/হর (where numerator/denominator contain Bengali numerals/script)
  const tokenRegex = /\[(EQ|FRAC|CHEM|SYM|SUB|SUP):([\s\S]*?)\]|\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|(\\frac\s*\{[^{}]+\}\s*\{[^{}]+\}|\\sqrt\s*(?:\[[^\]]+\])?\s*\{[^{}]+\})|((?:[\u09E6-\u09EF]+|[\u0980-\u09FF]{1,12})\s*\/\s*(?:[\u09E6-\u09EF]+|[\u0980-\u09FF]{1,12}))/g;

  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(text.slice(lastIndex, match.index));
    }

    const [
      ,
      qpfType,
      qpfVal,
      displayDollar,
      displayBracket,
      inlineDollar,
      inlineParen,
      bareLatexCmd,
      bengaliSlashFrac
    ] = match;

    if (qpfType) {
      const val = qpfVal.trim();
      if (qpfType === 'EQ' || qpfType === 'FRAC') {
        result += renderLatexExpression(val, false);
      } else if (qpfType === 'CHEM') {
        result += formatChemToken(val);
      } else if (qpfType === 'SYM') {
        const sym = SYM_MAP[val] || val;
        result += `<span class="tok-sym">${escapeHtml(sym)}</span>`;
      } else if (qpfType === 'SUB') {
        result += `<sub>${escapeHtml(val)}</sub>`;
      } else if (qpfType === 'SUP') {
        result += `<sup>${escapeHtml(val)}</sup>`;
      }
    } else if (displayDollar !== undefined || displayBracket !== undefined) {
      const expr = (displayDollar ?? displayBracket).trim();
      result += renderLatexExpression(expr, true);
    } else if (inlineDollar !== undefined || inlineParen !== undefined) {
      const expr = (inlineDollar ?? inlineParen).trim();
      result += renderLatexExpression(expr, false);
    } else if (bareLatexCmd !== undefined) {
      result += renderLatexExpression(bareLatexCmd.trim(), false);
    } else if (bengaliSlashFrac !== undefined) {
      result += renderLatexExpression(bengaliSlashFrac.trim(), false);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    result += escapeHtml(text.slice(lastIndex));
  }

  return result;
}
