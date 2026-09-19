import katex from 'katex';
import { AppState } from '../types/cbtMaker';

const KATEX_MACROS = {
  "\\cbrt": "\\sqrt[3]{#1}",
  "\\root": "\\sqrt[#1]{#2}",
  "\\d": "\\mathrm{d}",
  "\\degree": "^{\\circ}",
  "\\angstrom": "\\text{\\AA}",
  "\\Angstrom": "\\text{\\AA}",
  "\\unit": "\\,\\text{#1}"
};

// Rich HTML & Unicode Math Formatter for Pure HTML Engine
export function formatMathToHTMLFallback(s: string, isDisplay = false): string {
  if (!s) return '';

  let out = s;

  // 1. Normalize macros
  out = out.replace(/\\cbrt\{([^}]+)\}/g, '\\sqrt[3]{$1}')
           .replace(/\\root\{([^}]+)\}\\of\{([^}]+)\}/g, '\\sqrt[$1]{$2}')
           .replace(/\\(dfrac|tfrac|cfrac)\{/g, '\\frac{');

  // 2. Greek symbols
  out = out
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\Gamma\b/g, 'Γ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\epsilon\b/g, 'ε')
    .replace(/\\varepsilon\b/g, 'ε')
    .replace(/\\zeta\b/g, 'ζ')
    .replace(/\\eta\b/g, 'η')
    .replace(/\\theta\b/g, 'θ')
    .replace(/\\Theta\b/g, 'Θ')
    .replace(/\\iota\b/g, 'ι')
    .replace(/\\kappa\b/g, 'κ')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\Lambda\b/g, 'Λ')
    .replace(/\\mu\b/g, 'μ')
    .replace(/\\nu\b/g, 'ν')
    .replace(/\\xi\b/g, 'ξ')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\Pi\b/g, 'Π')
    .replace(/\\rho\b/g, 'ρ')
    .replace(/\\sigma\b/g, 'σ')
    .replace(/\\Sigma\b/g, 'Σ')
    .replace(/\\tau\b/g, 'τ')
    .replace(/\\upsilon\b/g, 'υ')
    .replace(/\\phi\b/g, 'φ')
    .replace(/\\varphi\b/g, 'φ')
    .replace(/\\Phi\b/g, 'Φ')
    .replace(/\\chi\b/g, 'χ')
    .replace(/\\psi\b/g, 'ψ')
    .replace(/\\Psi\b/g, 'Ψ')
    .replace(/\\omega\b/g, 'ω')
    .replace(/\\Omega\b/g, 'Ω');

  // 3. Operators & Relations
  out = out
    .replace(/\\dagger/g, '†')
    .replace(/\\ddagger/g, '‡')
    .replace(/\\times/g, ' × ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\mp/g, ' ∓ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\ne\b/g, ' ≠ ')
    .replace(/\\leq/g, ' ≤ ')
    .replace(/\\geq/g, ' ≥ ')
    .replace(/\\le\b/g, ' ≤ ')
    .replace(/\\ge\b/g, ' ≥ ')
    .replace(/\\ll\b/g, ' ≪ ')
    .replace(/\\gg\b/g, ' ≫ ')
    .replace(/\\equiv/g, ' ≡ ')
    .replace(/\\propto/g, ' ∝ ')
    .replace(/\\infty/g, '∞')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    .replace(/\\degree/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\in\b/g, ' ∈ ')
    .replace(/\\notin/g, ' ∉ ')
    .replace(/\\subset/g, ' ⊂ ')
    .replace(/\\subseteq/g, ' ⊆ ')
    .replace(/\\cap/g, ' ∩ ')
    .replace(/\\cup/g, ' ∪ ')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\hbar/g, 'ℏ')
    .replace(/\\rightarrow/g, ' → ')
    .replace(/\\leftarrow/g, ' ← ')
    .replace(/\\rightleftharpoons/g, ' ⇌ ')
    .replace(/\\uparrow/g, ' ↑ ')
    .replace(/\\downarrow/g, ' ↓ ')
    .replace(/\\int/g, '∫')
    .replace(/\\oint/g, '∮')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏');

  // 4. Text and Font Modifiers
  out = out
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '<b>$1</b>')
    .replace(/\\mathit\{([^}]+)\}/g, '<i>$1</i>');

  // 5. Accents & Diacritics
  out = out
    .replace(/\\vec\{([^}]+)\}/g, '$1&#x20D7;')
    .replace(/\\hat\{([^}]+)\}/g, '$1&#x0302;')
    .replace(/\\bar\{([^}]+)\}/g, '$1&#x0304;')
    .replace(/\\dot\{([^}]+)\}/g, '$1&#x0307;')
    .replace(/\\ddot\{([^}]+)\}/g, '$1&#x0308;');

  // 6. Common functions (sine, cos, tan, log, ln, exp, lim, max, min, det, etc.)
  out = out.replace(/\\(sin|cos|tan|cot|sec|csc|log|ln|exp|lim|max|min|det)\b/g, '<span class="math-function" style="font-family: \'KaTeX_Main\', serif; font-style: normal; margin-right: 0.15em;">$1</span>');

  // 7. Multi-pass Fractions for HTML with clean fraction vinculum
  let prevS = '';
  while (prevS !== out) {
    prevS = out;
    out = out.replace(
      /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
      '<span class="html-fraction" style="display:inline-flex; flex-direction:column; vertical-align:middle; text-align:center; font-size:0.9em; line-height:1.15; padding:0 3px; font-family:inherit;"><span style="border-bottom:1.5px solid currentColor; padding:0 2px 1px 2px;">$1</span><span style="padding:1px 2px 0 2px;">$2</span></span>'
    );
  }

  // 8. Radicals & Roots
  out = out.replace(
    /\\sqrt\[([^\]]+)\]\{([^}]+)\}/g,
    '<span style="white-space:nowrap; vertical-align:baseline; display:inline-flex; align-items:baseline; font-family:inherit;"><sup style="font-size:0.68em; margin-right:-2px; vertical-align:top;">$1</sup><span style="font-size:1.15em; line-height:1;">√</span><span style="border-top:1.5px solid currentColor; padding:0 2px; margin-left:-1px;">$2</span></span>'
  );
  out = out.replace(
    /\\sqrt\{([^}]+)\}/g,
    '<span style="white-space:nowrap; vertical-align:baseline; display:inline-flex; align-items:baseline; font-family:inherit;"><span style="font-size:1.15em; line-height:1;">√</span><span style="border-top:1.5px solid currentColor; padding:0 2px; margin-left:-1px;">$1</span></span>'
  );
  out = out.replace(/\\sqrt\b/g, '√');

  // 9. Superscripts & Subscripts
  out = out.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>').replace(/\^([0-9a-zA-Z+-])/g, '<sup>$1</sup>');
  out = out.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>').replace(/_([0-9a-zA-Z+-])/g, '<sub>$1</sub>');

  // 10. Spacing & Escaped characters
  out = out.replace(/\\[;,!]/g, ' ')
           .replace(/\\quad/g, ' &nbsp; ')
           .replace(/\\qquad/g, ' &nbsp;&nbsp; ')
           .replace(/\\([a-zA-Z]+)/g, '$1');

  // 11. Wrap in styling
  return isDisplay
    ? `<div class="html-display-math" style="text-align:center; margin: 8px 0; font-family: inherit; font-size: 1.05em;">${out}</div>`
    : `<span class="html-inline-math" style="font-family: inherit;">${out}</span>`;
}

const formatCache = new Map<string, string>();
const MAX_CACHE_SIZE = 3000;

/**
 * Unified Markdown, LaTeX, MathML & HTML Formatter
 * Accurately honors mathMode ('LATEX' | 'HTML') and renderEngine ('KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE')
 */
export function formatContent(
  text: string,
  engine: 'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE' = 'KATEX_LOCAL',
  mathMode: 'LATEX' | 'HTML' = 'LATEX',
  isLivePreview = false
): string {
  if (!text) return '';

  const cacheKey = `${engine}|${mathMode}|${isLivePreview ? 1 : 0}|${text}`;
  const cached = formatCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const mathBlocks: { raw: string; content: string; isDisplay: boolean }[] = [];
  let maskedText = text;

  // 1. Protect explicitly escaped dollars
  maskedText = maskedText.replace(/\\\$/g, '@@ESC_DOLLAR@@');

  // 2. Display math: $$...$$ or \[...\]
  maskedText = maskedText.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g, (match, d1, d2) => {
    const content = (d1 !== undefined ? d1 : d2) || '';
    mathBlocks.push({
      raw: match,
      content,
      isDisplay: true
    });
    return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
  });

  // 3. Inline math: $...$ or \(...\)
  maskedText = maskedText.replace(/\$([^\$\n]+?)\$|\\\(([\s\S]*?)\\\)/g, (match, i1, i2) => {
    const content = (i1 !== undefined ? i1 : i2) || '';
    mathBlocks.push({
      raw: match,
      content,
      isDisplay: false
    });
    return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
  });

  // 4. Markdown Parsing (Bold, Underline, Italic, Strikethrough)
  maskedText = maskedText.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
                         .replace(/__([\s\S]*?)__/g, '<u>$1</u>')
                         .replace(/\*([^\*]+?)\*/g, '<em>$1</em>');

  // 5. Restore escaped dollars
  maskedText = maskedText.replace(/@@ESC_DOLLAR@@/g, '$');

  // 6. Process Math Blocks based on specific engine and mode
  mathBlocks.forEach((block, i) => {
    let processedMath = '';
    const rawContent = block.content.trim();

    if (mathMode === 'HTML' || engine === 'HTML_FALLBACK') {
      // Pure HTML Engine: Formatted with standard HTML & Unicode symbols
      processedMath = formatMathToHTMLFallback(rawContent, block.isDisplay);
    } else if (engine === 'MATHML') {
      // MathML Engine: Render native MathML
      try {
        processedMath = katex.renderToString(rawContent, {
          displayMode: block.isDisplay,
          output: 'mathml',
          throwOnError: false,
          macros: KATEX_MACROS
        });
      } catch {
        processedMath = formatMathToHTMLFallback(rawContent, block.isDisplay);
      }
    } else {
      // LaTeX KaTeX Engine (Local or Online) - Pre-render using katex.renderToString in both preview and compiled CBT
      try {
        processedMath = katex.renderToString(rawContent, {
          displayMode: block.isDisplay,
          throwOnError: false,
          macros: KATEX_MACROS
        });
      } catch {
        // Double-escape backslashes in fallback raw math string to prevent JS escape character corruption (\f, \t, \b, \r)
        const safeRaw = rawContent.replace(/\\/g, '\\\\');
        processedMath = block.isDisplay ? `$$${safeRaw}$$` : `$${safeRaw}$`;
      }
    }

    maskedText = maskedText.replace(`@@MATH_BLOCK_${i}@@`, processedMath);
  });

  if (formatCache.size > MAX_CACHE_SIZE) {
    formatCache.clear();
  }
  formatCache.set(cacheKey, maskedText);

  return maskedText;
}

export async function fetchBaseTemplate(): Promise<string> {
  const possiblePaths = [
    `${import.meta.env.BASE_URL}cbt_demo.html`,
    `/cbt_demo.html`,
    `./cbt_demo.html`
  ];

  for (const path of possiblePaths) {
    try {
      const resp = await fetch(path);
      if (resp.ok) {
        const text = await resp.text();
        if (text.includes('QUESTION_BANK') || text.includes('EXAM_S_HTML')) {
          return text;
        }
      }
    } catch {
      // Continue to next path
    }
  }

  throw new Error("Unable to locate canonical 'cbt_demo.html' template. Ensure cbt_demo.html is in root or public folder.");
}

export async function compileCBTHTML(appState: AppState): Promise<{ html: string; filename: string }> {
  let txt = await fetchBaseTemplate();

  const title = appState.examTitle || 'Exam';
  const agency = appState.agencyName || 'National Testing Agency';
  const subtitle = appState.examSubtitle || '';

  // Parameter 1 (Title & Headers)
  txt = txt.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  txt = txt.replace(/<h2 style="color:var\(--primary\); margin-bottom: 5px;">.*?<\/h2>/, `<h2 style="color:var(--primary); margin-bottom: 5px;">${agency}</h2>`);
  txt = txt.replace(/<h1 style="color:#666; margin-bottom: 5px;">.*?<\/h1>/, `<h1 style="color:#666; margin-bottom: 5px;">${title}</h1>`);
  txt = txt.replace(/<h2 style="margin:0; color:var\(--text-dark\);">.*?<\/h2>/, `<h2 style="margin:0; color:var(--text-dark);">${title}</h2>`);
  txt = txt.replace(/<div class="exam-title">.*?<\/div>/, `<div class="exam-title">${title}</div>`);
  txt = txt.replace(/<span class="exam-subtitle">.*?<\/span>/, `<span class="exam-subtitle">${subtitle}</span>`);

  // Audio configuration
  txt = txt.replace(/const BACKGROUND_AUDIO_BASE64 = ".*?";/, `const BACKGROUND_AUDIO_BASE64 = "${appState.audio?.bg || ''}";`);
  txt = txt.replace(/const START_EXAM_AUDIO_B64 = ".*?";/, `const START_EXAM_AUDIO_B64 = "${appState.audio?.start || ''}";`);
  txt = txt.replace(/const SUBMIT_EXAM_AUDIO_B64 = ".*?";/, `const SUBMIT_EXAM_AUDIO_B64 = "${appState.audio?.submit || ''}";`);
  if (!appState.audio?.bg) {
    txt = txt.replace(/<button class="tool-btn" id="btn-audio".*?<\/button>/i, '<button class="tool-btn hidden" id="btn-audio" style="display:none;"></button>');
  }

  // Math Rendering Engine configuration
  const engineVal = appState.mathMode === 'HTML' || appState.renderEngine === 'HTML_FALLBACK'
    ? 'html_fallback' 
    : (appState.renderEngine === 'MATHML' ? 'mathml' : 'katex_local');
  txt = txt.replace(/window\.mathRenderEngine\s*=\s*['"].*?['"];/i, `window.mathRenderEngine = '${engineVal}';`);

  // Parameter 5: Constants list
  const cHtml = (appState.constants || []).map(c => 
    `<div class="const-card"><div class="const-text-line"><span>${c.name}</span><strong>${c.value}</strong></div></div>`
  ).join('');
  txt = txt.replace(
    /<!-- PARAMETER 5 \(Global\): List of Constants\. -->[\s\S]*?<!-- RESULT GATEWAY -->/i,
    `<!-- PARAMETER 5 (Global): List of Constants. -->\n<div class="const-list">\n${cHtml}\n</div>\n</div>\n</div>\n<!-- RESULT GATEWAY -->`
  );

  // Parameter 6: Print & Header title row
  txt = txt.replace(/<div class="header-exam-title-row">.*?<\/div>/i, `<div class="header-exam-title-row">${title} ${subtitle ? ': ' + subtitle : ''}</div>`);
  txt = txt.replace(
    /(<div class="print-secondary-header">\s*<!-- PARAMETER 6 \(Global\): Exam Name & Subtitle for Print Header\. -->\s*<div>).*?(<\/div>)/i,
    `$1${title} ${subtitle ? '- ' + subtitle : ''}$2`
  );

  // Timer & Font settings
  txt = txt.replace(/const TIMER_MODE = '[^']*';/i, `const TIMER_MODE = '${appState.timerMode || 'COUNTDOWN'}';`);
  txt = txt.replace(/const EXAM_DURATION_MINS = \d+;/i, `const EXAM_DURATION_MINS = ${parseInt(String(appState.duration), 10) || 90};`);
  const fontChoice = appState.fontName || "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif";
  txt = txt.replace(/const Q_FONT_FAMILY = ".*?";/i, `const Q_FONT_FAMILY = "${fontChoice.replace(/"/g, '\\"')}";`);

  // Inject CSS root font variable immediately into head
  const fontCssTag = `<style id="q-font-style">:root { --q-font: ${fontChoice}; }</style>`;
  txt = txt.replace('</head>', `${fontCssTag}\n</head>`);

  // Rules & Instructions HTML
  const finalRules = [...(appState.rules || [])];
  const durVal = parseInt(String(appState.duration), 10) || 90;
  const durText = `Total Duration: ${durVal} Minutes.`;
  const timerText = appState.timerMode === 'COUNTDOWN' 
    ? "Timer is in Countdown mode (time counts down to zero)." 
    : "Timer is in Stopwatch mode (counts up from zero).";

  const updatedRules = finalRules.map(r => r.toLowerCase().includes('duration') ? durText : r);
  if (!updatedRules.some(r => r.toLowerCase().includes('timer') || r.toLowerCase().includes('mode'))) {
    updatedRules.push(timerText);
  }

  const rulesStr = updatedRules.map((r, i) => `<p>${i + 1}. ${r}</p>`).join('');
  const instHtml = `<div class="inst-section"><h3>📋 Instructions</h3>${rulesStr}</div><div class="inst-section"><p>Please familiarize yourself with the status indicators used in the Question Palette:<br><span class="inst-status-icon circle status-ans"></span> <strong>Green:</strong> Answered.<br><span class="inst-status-icon square status-not-ans"></span> <strong>Red:</strong> Not Answered.<br><span class="inst-status-icon circle status-rev"></span> <strong>Purple:</strong> Marked for Review.<br><span class="inst-status-icon circle status-rev-ans"></span> <strong>Purple with Tick:</strong> Answered & Marked for Review (will be considered for evaluation).<br><span class="inst-status-icon circle" style="border:1px solid #ccc; color:#333"></span> <strong>White/Grey:</strong> Not Visited.</p><br><p style="color:var(--nta-red);"><strong>Critical Rule:</strong> If you attempt more questions than the maximum allowed in a specific section, only your first valid attempts (chronologically by question number) up to the limit will be evaluated.</p></div><div class="inst-section"><p>The Question Paper is divided into distinct <strong>Sections</strong>. Below is the section-wise distribution and marking schema:</p><h3>Marking Scheme</h3><table class="scheme-table"><thead><tr><th>Section</th><th>Total Qs</th><th>Max Attempt</th><th>Correct</th><th>Incorrect</th><th>Max Marks</th></tr></thead><tbody id="scheme-table-body"></tbody><tfoot id="scheme-table-foot"></tfoot></table></div>`;

  let instRegex = /\/\*<INST_START>\*\/[\s\S]*?\/\*<INST_END>\*\//i;
  if (!instRegex.test(txt)) {
    instRegex = /(?:const|let|var)\s+EXAM_S_HTML\s*=\s*`[\s\S]*?`;/i;
  }
  const safeInstInject = `/*<INST_START>*/\nconst EXAM_S_HTML = \`${instHtml.replace(/`/g, '\\`')}\`;\n/*<INST_END>*/`;
  txt = txt.replace(instRegex, safeInstInject);

  // KaTeX CSS & JS Injections (Always include KaTeX assets & box-sizing reset for pristine math rendering)
  const katexCSS = `<link rel="stylesheet" href="./libs/katex.min.css">\n<style>.katex, .katex *, .katex *:before, .katex *:after { box-sizing: content-box !important; }\n.katex, body, table, td, th, .q-text, .opt-text { font-variant-numeric: lining-nums tabular-nums !important; font-feature-settings: "lnum" 1, "tnum" 1 !important; }</style>`;
  const katexJS = `\n<script defer src="./libs/katex.min.js"></script>\n<script defer src="./libs/auto-render.min.js" onload="if(typeof triggerMathRender === 'function'){ triggerMathRender(null, true); } else if(typeof renderMathInElement !== 'undefined') { renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '\\\\[', right: '\\\\]', display: true}, {left: '$', right: '$', display: false}, {left: '\\\\(', right: '\\\\)', display: false}], throwOnError: false}); }"></script>\n`;
  txt = txt.replace(/<!--\s*PARAMETER 11.*?-->/i, () => katexCSS)
           .replace(/<!--\s*PARAMETER 12.*?-->/i, () => katexJS)
           .replace(/<!--\s*PARAMETER 11.*?-->/gi, '')
           .replace(/<!--\s*PARAMETER 12.*?-->/gi, '');

  // Parameter 9: Question Bank compilation
  const qb: any[] = [];
  for (const sec of appState.sections) {
    const qs = (appState.questionsBySection[sec.name] || []).map((q, i) => {
      const processedText = formatContent(q.text, appState.renderEngine, appState.mathMode, false);
      const processedTable = q.table ? formatContent(q.table, appState.renderEngine, appState.mathMode, false) : '';

      const finalOptionsHtmlReady: string[] = [];
      (q.options || []).forEach(o => {
        let optText = o || '';
        let optImg = '';
        const imgMatch = optText.match(/\|\|IMG:(.+?)\|\|/);
        if (imgMatch) {
          optImg = imgMatch[1];
          optText = optText.replace(imgMatch[0], '');
        }

        let processedOpt = formatContent(optText, appState.renderEngine, appState.mathMode, false);
        if (optImg && optImg !== 'PLACEHOLDER') {
          processedOpt += `<br><img src="${optImg}" onclick="openLightbox(this.src)" style="max-height:25vh; max-width:100%; object-fit:contain; border-radius:4px; margin-top:5px; border:1px solid #ccc; cursor:pointer; background:white;">`;
        }
        finalOptionsHtmlReady.push(processedOpt);
      });

      return {
        id: i + 1,
        type: q.type || 'MCQ',
        text: processedText,
        img: (q.image && q.image !== 'PLACEHOLDER') ? q.image : '',
        table: processedTable,
        options: q.type !== 'NAT' ? finalOptionsHtmlReady : [],
        correct: q.type === 'NAT' ? (q.correctNat || '') : q.correct,
        marksCorrect: (typeof q.marksCorrect === 'number' && !isNaN(q.marksCorrect)) ? q.marksCorrect : sec.marks,
        marksWrong: (typeof q.marksWrong === 'number' && !isNaN(q.marksWrong)) ? q.marksWrong : (q.type === 'NAT' ? 0 : sec.negative),
        explanation: q.explanation || ''
      };
    });

    qb.push({
      sectionTitle: sec.name,
      marksCorrect: sec.marks,
      marksWrong: sec.negative,
      maxAttempts: sec.maxAttempts,
      questions: qs
    });
  }

  let qbRegex = /\/\*<QB_START>\*\/[\s\S]*?\/\*<QB_END>\*\//i;
  if (!qbRegex.test(txt)) {
    qbRegex = /(?:const|let|var)\s+QUESTION_BANK\s*=\s*\[[\s\S]*?(?=\s*\/\/ ==========================================================)/i;
  }
  if (!qbRegex.test(txt)) {
    qbRegex = /(?:const|let|var)\s+QUESTION_BANK\s*=\s*\[[\s\S]*?\];/i;
  }

  const safeQBInject = `/*<QB_START>*/\nconst QUESTION_BANK = ${JSON.stringify(qb, null, 2)};\n/*<QB_END>*/`;
  txt = txt.replace(qbRegex, safeQBInject);

  // Styling & table cleanup
  if (!txt.includes('.q-text, .opt-text { white-space: pre-wrap !important; }')) {
    const vkPatch = `
    <style>
    .q-text, .opt-text { white-space: pre-wrap !important; }
    .html-fraction { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; line-height: 1.15; font-size: 0.9em; padding: 0 3px; }
    .question-content table { border-collapse: collapse; width: 100%; max-width: 800px; margin: 12px 0; }
    .question-content th, .question-content td { border: 1px solid var(--border-color, #cbd5e1); padding: 8px 12px; text-align: left; }
    .question-content th { background: var(--bg-main, #f1f5f9); font-weight: 600; }
    @media (max-width: 768px) {
        #virtual-keyboard, .keyboard-container, .virtual-keyboard { transform: scale(0.85); transform-origin: bottom center; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; z-index: 9999 !important; }
    }
    </style>
    <script>
    if (typeof answer === 'undefined') { window.answer = ""; }
    document.addEventListener('input', e => { 
        if(e.target && e.target.value && typeof e.target.value === 'string' && e.target.value.includes('undefined')) {
            e.target.value = e.target.value.replace(/undefined/g, ''); 
            window.answer = e.target.value;
        }
    }, true);
    <\/script>`;
    txt = txt.replace('</head>', vkPatch + '</head>');
  }

  const filename = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Final.html`;
  return { html: txt, filename };
}

export function prepareHtmlForDownload(html: string): string {
  if (!html) return '';
  let out = html;
  // Enforce 100% local offline paths for KaTeX & Cropper assets
  out = out.replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/katex\.min\.css/gi, './libs/katex.min.css');
  out = out.replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/katex\.min\.js/gi, './libs/katex.min.js');
  out = out.replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/contrib\/auto-render\.min\.js/gi, './libs/auto-render.min.js');
  out = out.replace(/https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/cropperjs\/[^/]+\/cropper\.min\.css/gi, './libs/cropper.min.css');
  out = out.replace(/https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/cropperjs\/[^/]+\/cropper\.min\.js/gi, './libs/cropper.min.js');
  out = out.replace(/onerror="this\.onerror=null;this\.href='https:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^']+'"/gi, '');
  out = out.replace(/onerror="this\.onerror=null;this\.src='https:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^']+'"/gi, '');
  return out;
}

export function triggerHtmlDownload(filename: string, rawHtml: string) {
  const cdnHtml = prepareHtmlForDownload(rawHtml);
  const blob = new Blob([cdnHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
