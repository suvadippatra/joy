import { AppState, defaultRules, Question, QuestionType, Section } from '../types/cbtMaker';

export function parseCBTFormat(rawTxt: string, currentState: AppState): {
  success: boolean;
  state?: Partial<AppState>;
  error?: string;
  count?: number;
} {
  try {
    let txt = rawTxt.trim();
    if (!txt) {
      return { success: false, error: "Input text is empty" };
    }

    // 1. Strip markdown code fences if wrapped by an LLM (e.g. ```text ... ``` or ```cbt ... ```)
    txt = txt.replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    // 2. Clean spans and normalize newlines
    txt = txt.replace(/\[span_[^\]]*\](?:\(start_span\)|\(end_span\))?/gi, '');
    txt = txt.replace(/\\n/g, '\n');
    txt = txt.replace(/(Statement|Assertion|List|Reason)[\s\n]+(I{1,3}|A|B|R)[\s\n]*:/gi, '$1 $2:');

    const lines = txt.split('\n');
    let mode: 'exam' | 'constants' | 'questions' | null = null;
    let curSec: string | null = null;
    let curQ: Question | null = null;
    let lastField: 'type' | 'Q' | 'O' | 'A' | 'T' | 'I' | 'E' | null = null;

    const sections: Section[] = [];
    const questionsBySection: Record<string, Question[]> = {};
    const constants: { name: string; value: string }[] = [];
    let rules: string[] = [];
    const audio = { bg: '', start: '', submit: '' };
    let agencyName = currentState.agencyName || '';
    let examTitle = currentState.examTitle || '';
    let examSubtitle = currentState.examSubtitle || '';
    let duration = currentState.duration || 90;
    let timerMode = currentState.timerMode || 'COUNTDOWN';
    let fontName = currentState.fontName || "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif";
    let mathMode = currentState.mathMode || 'LATEX';

    const ensureSection = () => {
      if (!curSec) {
        curSec = 'Section 1';
        if (!sections.some(s => s.name === curSec)) {
          sections.push({ name: curSec, marks: 4, negative: 1, maxAttempts: 0 });
          questionsBySection[curSec] = [];
        }
      }
    };

    lines.forEach(line => {
      const tr = line.trim();
      if (!tr && lastField !== 'T' && lastField !== 'Q' && lastField !== 'O' && lastField !== 'E') return;
      if (tr.startsWith('#')) return;

      if (tr.startsWith('[EXAM_INFO]')) {
        mode = 'exam';
        lastField = null;
      } else if (tr.startsWith('[CONSTANTS]')) {
        mode = 'constants';
        lastField = null;
      } else if (tr.startsWith('[SECTION:') || /^Section\s*:/i.test(tr) || /^\[Section\s+/i.test(tr)) {
        mode = 'questions';
        lastField = null;
        let secName = 'Section';
        let sMarks = 4;
        let sNeg = 1;
        let sMaxAtt = 0;

        const mFull = tr.match(/\[SECTION:(.*?)(?:\|Marks:([\d.]+))?(?:\|Neg:([\d.]+))?(?:\|MaxAtt:(\d+))?\]/i);
        if (mFull) {
          secName = mFull[1].trim();
          sMarks = parseFloat(mFull[2]) || 4;
          sNeg = parseFloat(mFull[3]) || 1;
          sMaxAtt = parseInt(mFull[4], 10) || 0;
        } else {
          secName = tr.replace(/^\[?Section\s*:?/i, '').replace(/\]$/, '').trim() || 'Section';
        }

        curSec = secName;
        if (!sections.some(s => s.name === curSec)) {
          sections.push({
            name: curSec,
            marks: sMarks,
            negative: sNeg,
            maxAttempts: sMaxAtt
          });
          questionsBySection[curSec] = [];
        }
        curQ = null;
      } else if (mode === 'exam') {
        if (tr.startsWith('Agency:')) agencyName = tr.substring(7).trim();
        else if (tr.startsWith('Title:')) examTitle = tr.substring(6).trim();
        else if (tr.startsWith('Subtitle:')) examSubtitle = tr.substring(9).trim();
        else if (tr.toLowerCase().startsWith('duration:')) duration = parseInt(tr.substring(9), 10) || 90;
        else if (tr.toLowerCase().startsWith('timer:')) {
          const tm = tr.substring(6).trim().toUpperCase();
          if (tm === 'STOPWATCH' || tm === 'COUNTDOWN') timerMode = tm;
        } else if (tr.startsWith('Font:')) fontName = tr.substring(5).trim();
        else if (tr.startsWith('MathMode:')) {
          const mm = tr.substring(9).trim().toUpperCase();
          if (mm === 'HTML' || mm === 'LATEX') mathMode = mm;
        } else if (tr.startsWith('[FORMAT_WATERMARK:')) {
          const wm = tr.replace('[FORMAT_WATERMARK:', '').replace(']', '').trim();
          if (wm === 'PURE_HTML') mathMode = 'HTML';
          else if (wm === 'LATEX') mathMode = 'LATEX';
        } else if (tr.startsWith('Rules:')) {
          rules = tr.substring(6).trim().split('|').filter(Boolean);
        } else if (tr.startsWith('AudioBg:')) audio.bg = tr.substring(8).trim();
        else if (tr.startsWith('AudioStart:')) audio.start = tr.substring(11).trim();
        else if (tr.startsWith('AudioSubmit:')) audio.submit = tr.substring(12).trim();
      } else if (mode === 'constants') {
        const idx = tr.indexOf(':');
        if (idx > 0) {
          constants.push({ name: tr.substring(0, idx).trim(), value: tr.substring(idx + 1).trim() });
        }
      } else {
        // Question or Section detection even without explicit [SECTION:]
        const isQHeader = /^(?:Q(?:uestion)?\s*(?:\d+)?\s*[:\.]|\d+[\.\)]\s+)/i.test(tr);
        const isOption = /^(?:O\s*:|\(?[A-D]\)[\s\.]|[A-D][\.\)][\s]+)/i.test(tr);
        const isAnswer = /^(?:A\s*:|Ans(?:wer)?\s*:|Correct(?:\s*Answer)?\s*:|Key\s*:)/i.test(tr);
        const isExplanation = /^(?:Exp(?:lanation)?\s*:|Sol(?:ution)?\s*:)/i.test(tr);
        const isType = /^(?:QType|Type)\s*:/i.test(tr);

        if (isType) {
          ensureSection();
          const typeStr = tr.replace(/^(?:QType|Type)\s*:/i, '').trim().toUpperCase();
          const qType = (typeStr.includes('NAT') || typeStr.includes('NUMERICAL') ? 'NAT' : typeStr.includes('MSQ') || typeStr.includes('MULTIPLE') ? 'MSQ' : 'MCQ') as QuestionType;
          curQ = {
            id: (questionsBySection[curSec!]?.length || 0) + 1,
            type: qType,
            text: '',
            options: [],
            correct: 0,
            correctNat: '',
            image: '',
            table: ''
          };
          questionsBySection[curSec!].push(curQ);
          lastField = 'type';
        } else if (isQHeader) {
          ensureSection();
          const cleanQText = tr.replace(/^(?:Q(?:uestion)?\s*(?:\d+)?\s*[:\.]\s*|\d+[\.\)]\s*)/i, '').trim();
          if (!curQ || curQ.text !== '') {
            curQ = {
              id: (questionsBySection[curSec!]?.length || 0) + 1,
              type: 'MCQ',
              text: '',
              options: [],
              correct: 0,
              correctNat: '',
              image: '',
              table: ''
            };
            questionsBySection[curSec!].push(curQ);
          }
          curQ.text = cleanQText;
          lastField = 'Q';
        } else if (isOption && curQ && curQ.type !== 'NAT') {
          const optContent = tr.replace(/^(?:O\s*:\s*|\(?[A-D]\)[\s\.]*\s*|[A-D][\.\)][\s]*)/i, '').trim();
          curQ.options.push(optContent);
          lastField = 'O';
        } else if (isAnswer && curQ) {
          const val = tr.replace(/^(?:A\s*:|Ans(?:wer)?\s*:|Correct(?:\s*Answer)?\s*:|Key\s*:)\s*/i, '').trim();
          if (curQ.type === 'NAT') {
            curQ.correctNat = val;
          } else if (curQ.type === 'MSQ' || val.includes(',') || val.length > 2) {
            const letters = val.split(/[,\s]+/).map(item => item.trim().toUpperCase()).filter(Boolean);
            curQ.correct = letters.map(l => {
              if (l.match(/^[A-Z]$/)) return l.charCodeAt(0) - 65;
              const num = parseInt(l, 10);
              return isNaN(num) ? 0 : num;
            });
            if (curQ.correct.length > 1) curQ.type = 'MSQ';
          } else {
            const letter = val.replace(/[^a-zA-Z]/g, '').charAt(0);
            if (letter) curQ.correct = letter.toUpperCase().charCodeAt(0) - 65;
          }
          lastField = 'A';
        } else if (isExplanation && curQ) {
          const expContent = tr.replace(/^(?:Exp(?:lanation)?\s*:|Sol(?:ution)?\s*:)\s*/i, '').trim();
          curQ.explanation = expContent;
          lastField = 'E';
        } else if (/^T\s*:/i.test(tr) && curQ) {
          curQ.table = tr.replace(/^T\s*:/i, '').trim();
          lastField = 'T';
        } else if (/^I\s*:/i.test(tr) && curQ) {
          const imgUrl = tr.replace(/^I\s*:/i, '').trim();
          if (imgUrl === '[IMAGE]' || imgUrl === '[IMAGE_PLACEHOLDER]') curQ.image = 'PLACEHOLDER';
          else if (imgUrl.startsWith('http') || imgUrl.startsWith('data:') || imgUrl.startsWith('./') || imgUrl.startsWith('/')) {
            curQ.image = imgUrl;
            lastField = 'I';
          }
        } else if (curQ && tr) {
          // Multiline continuation for Q, O, or Explanation
          if (lastField === 'Q') curQ.text += '\n' + tr;
          else if (lastField === 'O' && curQ.options.length > 0) curQ.options[curQ.options.length - 1] += '\n' + tr;
          else if (lastField === 'E') curQ.explanation = (curQ.explanation ? curQ.explanation + '\n' : '') + tr;
          else if (lastField === 'T') curQ.table += ' ' + tr;
        }
      }
    });

    // Post-process placeholders
    sections.forEach(sec => {
      (questionsBySection[sec.name] || []).forEach(q => {
        if (q.text.includes('[IMAGE]') || q.text.includes('[IMAGE_PLACEHOLDER]')) {
          q.image = 'PLACEHOLDER';
          q.text = q.text.replace(/\[IMAGE\]/gi, '').replace(/\[IMAGE_PLACEHOLDER\]/gi, '').trim();
        }
        q.options = q.options.map(opt => {
          if (opt.includes('[IMAGE]') || opt.includes('[IMAGE_PLACEHOLDER]')) {
            return opt.replace(/\[IMAGE\]/gi, '').replace(/\[IMAGE_PLACEHOLDER\]/gi, '').trim() + '||IMG:PLACEHOLDER||';
          }
          return opt;
        });
      });
    });

    // Fallback if no sections defined but questions were parsed
    if (sections.length === 0 && Object.keys(questionsBySection).length > 0) {
      Object.keys(questionsBySection).forEach(name => {
        sections.push({ name, marks: 4, negative: 1, maxAttempts: 0 });
      });
    }

    let totalQCount = 0;
    Object.values(questionsBySection).forEach(arr => { totalQCount += arr.length; });

    return {
      success: true,
      count: totalQCount,
      state: {
        agencyName: agencyName || currentState.agencyName,
        examTitle: examTitle || currentState.examTitle,
        examSubtitle: examSubtitle || currentState.examSubtitle,
        duration: duration || currentState.duration,
        timerMode: timerMode || currentState.timerMode,
        fontName: fontName || currentState.fontName,
        mathMode: (mathMode as 'LATEX' | 'HTML') || currentState.mathMode,
        rules: rules.length ? rules : (currentState.rules?.length ? currentState.rules : defaultRules),
        audio: audio.bg || audio.start || audio.submit ? audio : currentState.audio,
        constants: constants.length ? constants : currentState.constants,
        sections: sections.length ? sections : currentState.sections,
        questionsBySection: Object.keys(questionsBySection).length ? questionsBySection : currentState.questionsBySection
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to parse CBT content" };
  }
}

export function generateCBTString(appState: AppState): string {
  let out = `[EXAM_INFO]\n`;
  if (appState.agencyName) out += `Agency: ${appState.agencyName}\n`;
  if (appState.examTitle) out += `Title: ${appState.examTitle}\n`;
  if (appState.examSubtitle) out += `Subtitle: ${appState.examSubtitle}\n`;
  if (appState.duration) out += `Duration: ${appState.duration}\n`;
  out += `Timer: ${appState.timerMode}\n`;
  out += `Font: ${appState.fontName}\n`;
  out += `MathMode: ${appState.mathMode}\n`;
  out += `[FORMAT_WATERMARK: ${appState.mathMode === 'LATEX' ? 'LATEX' : 'PURE_HTML'}]\n`;

  if (appState.rules?.length) out += `Rules: ${appState.rules.join('|')}\n`;
  if (appState.audio?.bg) out += `AudioBg: ${appState.audio.bg}\n`;
  if (appState.audio?.start) out += `AudioStart: ${appState.audio.start}\n`;
  if (appState.audio?.submit) out += `AudioSubmit: ${appState.audio.submit}\n`;

  if (appState.constants?.length) {
    out += `\n[CONSTANTS]\n`;
    appState.constants.forEach(c => {
      out += `${c.name}: ${c.value}\n`;
    });
  }

  appState.sections.forEach(s => {
    out += `\n[SECTION:${s.name}|Marks:${s.marks}|Neg:${s.negative}|MaxAtt:${s.maxAttempts}]\n`;
    const qs = appState.questionsBySection[s.name] || [];
    qs.forEach(q => {
      out += `QType: ${q.type || 'MCQ'}\n`;
      let cleanQText = q.text.replace(/\n/g, '\\n');
      if (q.image === 'PLACEHOLDER') cleanQText += ` [IMAGE]`;
      out += `Q: ${cleanQText}\n`;

      if (q.table) {
        out += `T: ${q.table}\n`;
      }

      if (q.image && q.image !== 'PLACEHOLDER') {
        out += `I: ${q.image}\n`;
      }

      if (q.type !== 'NAT') {
        (q.options || []).forEach(opt => {
          let cleanOpt = opt.replace(/\n/g, '\\n');
          out += `O: ${cleanOpt}\n`;
        });

        if (q.type === 'MSQ' && Array.isArray(q.correct)) {
          const ansLetters = q.correct.map(idx => String.fromCharCode(65 + idx)).join(', ');
          out += `A: ${ansLetters}\n`;
        } else {
          const corrIdx = typeof q.correct === 'number' ? q.correct : 0;
          out += `A: ${String.fromCharCode(65 + corrIdx)}\n`;
        }
      } else {
        out += `A: ${q.correctNat || ''}\n`;
      }
      out += `\n`;
    });
  });

  return out.trim();
}

export function getAIPrompt(mode: 'LATEX' | 'HTML', subject = 'General Science', questionCount = 5): string {
  const isLatex = mode === 'LATEX';

  if (isLatex) {
    return `You are a Senior Question Author & Exam Curator for an NTA-standard Computer Based Test (CBT) platform.
Create a complete, high-quality test paper for: "${subject}" in STRICT CBT Maker LaTeX Format.

==================================================
OUTPUT FORMAT SPECIFICATIONS (LATEX MATH MODE):
==================================================

1. EXAM METADATA (Header):
[EXAM_INFO]
Agency: National Testing Agency
Title: ${subject}
Subtitle: Comprehensive NTA / NEET / JEE Standard Test
Duration: 60
Timer: COUNTDOWN
Font: 'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif
MathMode: LATEX
Rules: +4 marks for correct answer|-1 mark penalty for wrong answer|No negative marking for NAT questions|Use scratchpad for rough calculations

2. PHYSICAL / CHEMICAL CONSTANTS (Optional, add if relevant):
[CONSTANTS]
c: 3.00 × 10^8 m/s
h: 6.626 × 10^-34 J·s
R: 8.314 J/(mol·K)
g: 9.8 m/s^2
e: 1.602 × 10^-19 C

3. SECTION HEADER:
[SECTION:${subject} Section A|Marks:4|Neg:1|MaxAtt:0]

4. QUESTION STRUCTURE RULES:
- QType: Must be "MCQ" (Single Choice), "MSQ" (Multiple Correct Options), or "NAT" (Numerical Answer Type).
- Q: Question statement. Use $...$ for inline math (e.g. $E = mc^2$, $\\lambda = \\frac{h}{p}$) and $$...$$ for display formulas.
  * For chemical formulas, use $\\text{H}_2\\text{SO}_4$, $\\text{KMnO}_4$, etc.
  * For units, use $\\text{m/s}^2$, $\\text{J}\\cdot\\text{s}$, etc.
- O: Exactly 4 options for MCQ/MSQ (One per line starting with O:).
- A: Answer key:
  * For MCQ: Single letter (e.g. A, B, C, or D).
  * For MSQ: Comma-separated letters (e.g. A, C or B, D).
  * For NAT: Exact number (e.g. 24) or range (e.g. 23.5-24.5).
- E: Step-by-step solution / rationale with formulas.

==================================================
SAMPLE QUESTIONS TEMPLATE:
==================================================

[SECTION:${subject} Section A|Marks:4|Neg:1|MaxAtt:0]

QType: MCQ
Q: An electron transitions from the $n = 3$ energy level to the $n = 1$ ground state in a hydrogen atom. If the Rydberg constant is $R_H$, what is the wavelength $\\lambda$ of the emitted photon?
O: $\\frac{8}{9 R_H}$
O: $\\frac{9}{8 R_H}$
O: $\\frac{3}{4 R_H}$
O: $\\frac{4}{3 R_H}$
A: B
E: Using the Rydberg formula: $\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{1^2} - \\frac{1}{3^2} \\right) = R_H \\left( 1 - \\frac{1}{9} \\right) = \\frac{8}{9} R_H$. Therefore, $\\lambda = \\frac{9}{8 R_H}$.

QType: MSQ
Q: Which of the following statements regarding electromagnetic waves in vacuum are TRUE?
O: The electric and magnetic field vectors $\\vec{E}$ and $\\vec{B}$ oscillate in phase.
O: The ratio $\\frac{|\\vec{E}|}{|\\vec{B}|}$ is equal to the speed of light $c$.
O: The energy density stored in the electric field is greater than that in the magnetic field.
O: EM waves transport both energy and linear momentum.
A: A, B, D
E: Statements A, B, and D are correct. The electric and magnetic energy densities are equal ($u_E = u_B$).

QType: NAT
Q: A parallel plate capacitor with plate area $A = 100\\text{ cm}^2$ and plate separation $d = 2\\text{ mm}$ is filled with a dielectric of constant $K = 4.0$. Calculate its capacitance in picofarads (pF). (Take $\\varepsilon_0 = 8.85 \\times 10^{-12}\\text{ F/m}$)
A: 175-180
E: $C = \\frac{K \\varepsilon_0 A}{d} = \\frac{4.0 \\times 8.85 \\times 10^{-12} \\times 10^{-2}}{2 \\times 10^{-3}} = 1.77 \\times 10^{-10}\\text{ F} = 177\\text{ pF}$.

Generate ${questionCount} diverse, conceptually rigorous questions following this exact syntax. Output ONLY the raw test text without markdown fences or extraneous chat commentary.`;
  }

  // HTML / Unicode Mode AI Prompt
  return `You are a Senior Question Author & Exam Curator for a Computer Based Test (CBT) platform.
Create a complete, high-quality test paper for: "${subject}" in STRICT CBT Maker Pure HTML & Unicode Format.

==================================================
OUTPUT FORMAT SPECIFICATIONS (PURE HTML / UNICODE MODE):
==================================================

1. EXAM METADATA (Header):
[EXAM_INFO]
Agency: National Testing Agency
Title: ${subject}
Subtitle: Pure HTML & Unicode High-Legibility Test
Duration: 60
Timer: COUNTDOWN
Font: system-ui, -apple-system, sans-serif
MathMode: HTML
Rules: +4 marks for correct answer|-1 mark penalty for wrong answer|No negative marking for NAT questions|All questions are based on standard syllabus

2. SECTION HEADER:
[SECTION:${subject} Section A|Marks:4|Neg:1|MaxAtt:0]

3. QUESTION STRUCTURE RULES:
- QType: Must be "MCQ" (Single Choice), "MSQ" (Multiple Correct Options), or "NAT" (Numerical Answer Type).
- Q: Question statement. Use standard HTML tags:
  * Subscripts: <sub>2</sub> (e.g. H<sub>2</sub>O, CO<sub>2</sub>, glucose C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>)
  * Superscripts: <sup>2+</sup>, <sup>-34</sup>, 10<sup>8</sup>
  * Formatting: <b>bold</b>, <i>italic</i>, <code>code</code>
  * Unicode Symbols: α, β, γ, θ, λ, μ, π, Ω, Δ, √, ∫, ±, ×, ÷, ≠, ≤, ≥, →, ⇌, °C, ℏ, Å
- T: (Optional) Match-the-Columns / Matrix HTML Table snippet:
  T: <table class="w-full border text-sm"><tr class="bg-slate-100 dark:bg-slate-800"><th class="border p-2">Column I</th><th class="border p-2">Column II</th></tr><tr><td class="border p-2">A. Item 1</td><td class="border p-2">P. Match 1</td></tr><tr><td class="border p-2">B. Item 2</td><td class="border p-2">Q. Match 2</td></tr></table>
- O: Exactly 4 options for MCQ/MSQ (One per line starting with O:).
- A: Answer key (A, B, C, or D for MCQ; A, C for MSQ; exact numeric value or range like 14.5-15.5 for NAT).
- E: Step-by-step solution / rationale with clean HTML formatting.

==================================================
SAMPLE QUESTIONS TEMPLATE:
==================================================

[SECTION:${subject} Section A|Marks:4|Neg:1|MaxAtt:0]

QType: MCQ
Q: During aerobic cellular respiration, which of the following processes produces the maximum number of ATP molecules per glucose (C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>) molecule?
O: Glycolysis in the cytosol
O: Citric Acid (Krebs) Cycle in mitochondrial matrix
O: Oxidative Phosphorylation via Electron Transport Chain (ETC)
O: Lactic acid fermentation
A: C
E: Oxidative phosphorylation yields approximately 26–28 ATP per glucose molecule, accounting for the vast majority of cellular ATP production.

QType: MCQ
Q: Match the hormones listed in <b>Column I</b> with their respective endocrine glands in <b>Column II</b>:
T: <table class="w-full border text-sm"><tr class="bg-slate-100 dark:bg-slate-800"><th class="border p-2">Column I (Hormone)</th><th class="border p-2">Column II (Gland)</th></tr><tr><td class="border p-2">A. Insulin</td><td class="border p-2">1. Thyroid Gland</td></tr><tr><td class="border p-2">B. Thyroxine (T<sub>4</sub>)</td><td class="border p-2">2. Pancreas (β-cells)</td></tr><tr><td class="border p-2">C. Aldosterone</td><td class="border p-2">3. Adrenal Cortex</td></tr><tr><td class="border p-2">D. Calcitonin</td><td class="border p-2">4. Thyroid Parafollicular cells</td></tr></table>
O: A-2, B-1, C-3, D-4
O: A-1, B-2, C-4, D-3
O: A-2, B-4, C-3, D-1
O: A-3, B-1, C-2, D-4
A: A
E: Insulin is secreted by pancreatic β-cells, Thyroxine by thyroid follicular cells, Aldosterone by adrenal cortex, and Calcitonin by thyroid parafollicular (C) cells.

QType: NAT
Q: What is the net gain of ATP molecules produced directly during glycolysis from the breakdown of 1 molecule of glucose?
A: 2
E: Glycolysis consumes 2 ATP and produces 4 ATP, resulting in a net yield of 2 ATP per glucose.

Generate ${questionCount} diverse, conceptually rigorous questions following this exact syntax. Output ONLY the raw test text without markdown fences or extraneous chat commentary.`;
}
