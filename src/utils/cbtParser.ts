import { AppState, defaultRules, Question, QuestionType, Section } from '../types/cbtMaker';

export function parseCBTFormat(rawTxt: string, currentState: AppState): {
  success: boolean;
  state?: Partial<AppState>;
  error?: string;
  count?: number;
  missingImagesCount?: number;
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
    let missingImagesCount = 0;
    Object.values(questionsBySection).forEach(arr => {
      totalQCount += arr.length;
      arr.forEach(q => {
        if (q.image === 'PLACEHOLDER') missingImagesCount++;
        (q.options || []).forEach(opt => {
          if (opt.includes('||IMG:PLACEHOLDER||') || opt.includes('PLACEHOLDER')) missingImagesCount++;
        });
      });
    });

    return {
      success: true,
      count: totalQCount,
      missingImagesCount,
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

export function getAIPrompt(mode: 'LATEX' | 'HTML', subject = 'General Science', sections?: { name: string; marks: number; negative: number; maxAttempts: number }[]): string {
  let sectionStr = '';
  if (sections && sections.length > 0) {
    sections.forEach(s => {
      sectionStr += `[SECTION:${s.name}|Marks:${s.marks}|Neg:${s.negative}|MaxAtt:${s.maxAttempts || 0}]\n`;
    });
  } else {
    sectionStr = `[SECTION:${subject || 'Section 1'}|Marks:4|Neg:1|MaxAtt:0]\n`;
  }

  let modeSpecificRules = '';
  if (mode === 'LATEX') {
    modeSpecificRules = `CRITICAL MATH & IMAGE RULES:
- You MUST extract ALL mathematical equations, variables, and scientific notation using ONLY standard LaTeX wrapped EXACTLY in $ (inline) or $$ (display block).
- DO NOT use \\( ... \\) or \\[ ... \\]. Use ONLY $ and $$.
- MULTIPLICATION RULE: NEVER use the asterisk '*' for multiplication in math (e.g. $2 * 3$ breaks formatting). Always use \\times ($2 \\times 3$) or \\cdot ($2 \\cdot 3$).
- FORBIDDEN: NEVER write scientific units or constants in Bengali or extraneous scripts. Use standard LaTeX (e.g., $m/s^2$, $C$).
- REQUIRED: Always use LaTeX for Greek letters (\\alpha, \\beta, \\gamma) and arrows (\\rightarrow, \\rightleftharpoons).
- COMPLEX MATRICES / DIAGRAMS: If a question contains a complex matrix, diagram, or chart, output EXACTLY \`[IMAGE]\` on a new line. NEVER use a single dot '.'.`;
  } else {
    modeSpecificRules = `CRITICAL HTML & IMAGE RULES:
- ABSOLUTELY NO LATEX. Do not use $ or \\frac or any backslashes like \\rightarrow.
- MULTIPLICATION RULE: Use standard multiplication sign '×' or '·'.
- ARROWS & SEQUENCES: In biological pathways, reactions, or developmental sequences, use the literal Unicode arrow '→' or '⇌'. NEVER write '\\rightarrow' or '$' in HTML mode.
- Use standard Unicode for symbols (π, α, β, ∑, ∫, √, →, ←, ⇌, ±, °, μ).
- Use raw HTML <sup>2</sup> for exponents and <sub>2</sub> for subscripts (e.g., H<sub>2</sub>O, Ca<sup>2+</sup>, 10<sup>5</sup>).
- COMPLEX DIAGRAMS: If a question contains a diagram, complex structure, or chart, output EXACTLY \`[IMAGE]\` on a new line. NEVER use a single dot '.'.`;
  }

  return `SYSTEM INSTRUCTION: You are an expert Data Extraction AI. Extract EVERY SINGLE question from the provided document and format them EXACTLY into the strict plain-text .CBT format specified below.

CRITICAL EXTRACTION RULES (FOLLOW OR FAIL):
1. NEVER SKIP: Extract every question. Grab all questions from the provided document without limit.
2. MCQ FORMAT: Exactly 4 'O:' lines. The 'A:' line must be a single letter (A, B, C, or D).
3. NAT FORMAT: DO NOT output any 'O:' lines. The 'A:' line must be the exact text/number or range.
4. TEXT EMPHASIS: You MUST preserve all italics from the original document using *italic* (CRITICAL for biological names like *Mangifera indica*). Preserve bold text using **bold**.
5. LISTS & LINE BREAKS: If a question contains an internal list of items (e.g., 1., 2., 3. or A., B., C., D. or I., II., III.), you MUST insert a literal \\n before each item so they stack vertically.
6. STATEMENTS: DO NOT break "Statement I:", "List-I", "List-II", "Assertion A:" into multiple lines. Keep the label and its text on the SAME line.
7. TABLES: Convert tables into a minified HTML <table> string on a single line starting with 'T: '.
8. NO HALLUCINATIONS: Do NOT output "[span_0]" or bounding box artifacts.

${modeSpecificRules}

FORMAT BLUEPRINT TO FOLLOW:
[EXAM_INFO]
Agency: National Testing Agency
Title: ${subject || 'CBT Exam'}
Subtitle: High-Legibility CBT Paper
Duration: 60
Timer: STOPWATCH
[FORMAT_WATERMARK: ${mode === 'LATEX' ? 'LATEX' : 'PURE_HTML'}]

${sectionStr}QType: MCQ
Q: Read the statements:\\n**Statement I:** First statement...\\n**Statement II:** Second statement...
O: Option A text
O: Option B text
O: Option C text
O: Option D text
A: B

QType: NAT
Q: The value of the charge is ____________ C.
A: 2.5-2.6

Now, parse the attached document and output ONLY the raw .CBT code inside a \`\`\`text block.`;
}
