import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  Code,
  Info,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowUp,
  ArrowDown,
  Lightbulb
} from 'lucide-react';
import { Question, QuestionType, Section } from '../../types/cbtMaker';
import AutoExpandingTextarea from './AutoExpandingTextarea';
import Base64ImageGuard from './Base64ImageGuard';
import VisualTableEditor from './VisualTableEditor';

// Helper to parse option strings that embed base64 image data
function parseOptionData(optStr: string): { text: string; image: string } {
  if (!optStr) return { text: '', image: '' };
  const match = optStr.match(/\|\|IMG:([\s\S]+?)\|\|/);
  if (match) {
    const image = match[1].trim();
    const text = optStr.replace(/\|\|IMG:([\s\S]+?)\|\|/g, '').trim();
    return { text, image };
  }
  return { text: optStr, image: '' };
}

// Helper to safely parse string/fraction input (e.g., "1/2" -> 0.5, "1/4" -> 0.25)
function parseFractionOrNumber(val: string): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const trimmed = val.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }
  const num = parseFloat(trimmed);
  return isNaN(num) ? undefined : num;
}

interface QuestionEditorProps {
  question: Question | null;
  questionIndex: number;
  totalQuestions: number;
  section: Section | null;
  sectionIndex: number;
  mathMode: 'LATEX' | 'HTML';
  isActive?: boolean;
  showNavigationFooter?: boolean;
  onFocusQuestion?: () => void;
  onUpdateQuestion: (fields: Partial<Question>) => void;
  onImageFilePicked: (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'question' | { optionIndex: number }
  ) => void;
  onOpenLaTeXGuide: () => void;
  onOpenCropper: (
    imageSrc: string,
    target: 'question' | { optionIndex: number }
  ) => void;
  onPrevQuestion?: () => void;
  onNextQuestion?: () => void;
  onAddQuestionNext?: () => void;
  onDuplicateQuestion?: () => void;
  onDeleteQuestion?: () => void;
  onMoveQuestionUp?: () => void;
  onMoveQuestionDown?: () => void;
}

type FocusedFieldTarget = 'text' | 'explanation' | { optionIndex: number };

const QuestionEditor = memo(function QuestionEditor({
  question,
  questionIndex,
  totalQuestions,
  section,
  sectionIndex,
  mathMode,
  isActive,
  showNavigationFooter = true,
  onFocusQuestion,
  onUpdateQuestion,
  onImageFilePicked,
  onOpenLaTeXGuide,
  onOpenCropper,
  onPrevQuestion,
  onNextQuestion,
  onAddQuestionNext,
  onDuplicateQuestion,
  onDeleteQuestion,
  onMoveQuestionUp,
  onMoveQuestionDown
}: QuestionEditorProps) {
  const [openTable, setOpenTable] = useState<boolean>(false);
  const [openExplanation, setOpenExplanation] = useState<boolean>(() => Boolean(question?.explanation));

  // Track which field was last focused so math toolbar buttons insert into the active input
  const [focusedField, setFocusedField] = useState<FocusedFieldTarget>('text');

  // Local state for raw text in marks inputs to support fractions like "1/2" or "1/4"
  const [rawMarksStr, setRawMarksStr] = useState<string | null>(null);
  const [rawPenaltyStr, setRawPenaltyStr] = useState<string | null>(null);

  // Local input state for 0ms fluid typing response
  const [localText, setLocalText] = useState<string>(() => question?.text || '');
  const [localOptions, setLocalOptions] = useState<string[]>(() => question?.options || []);
  const [localCorrectNat, setLocalCorrectNat] = useState<string>(() => question?.correctNat || '');
  const [localExplanation, setLocalExplanation] = useState<string>(() => question?.explanation || '');

  // Track active question and last synced prop values to support both 0ms typing and external resets
  const activeQIdRef = useRef<number | string | null>(question?.id ?? null);
  const lastPropTextRef = useRef(question?.text || '');
  const lastPropOptionsStrRef = useRef(JSON.stringify(question?.options || []));
  const lastPropNatRef = useRef(question?.correctNat || '');
  const lastPropExpRef = useRef(question?.explanation || '');

  useEffect(() => {
    if (!question) {
      setLocalText('');
      setLocalOptions(['', '', '', '']);
      setLocalCorrectNat('');
      setLocalExplanation('');
      return;
    }

    const qText = question.text || '';
    const qOptions = question.options || [];
    const qNat = question.correctNat || '';
    const qExp = question.explanation || '';
    const qOptionsStr = JSON.stringify(qOptions);

    // Question ID changed (user switched question)
    if (question.id !== activeQIdRef.current) {
      activeQIdRef.current = question.id;
      lastPropTextRef.current = qText;
      lastPropOptionsStrRef.current = qOptionsStr;
      lastPropNatRef.current = qNat;
      lastPropExpRef.current = qExp;
      setLocalText(qText);
      setLocalOptions(qOptions);
      setLocalCorrectNat(qNat);
      setLocalExplanation(qExp);
      setOpenExplanation(Boolean(qExp));
      return;
    }

    // External reset / update occurred from parent (e.g. Clean Draft or Paste Import)
    if (qText !== lastPropTextRef.current) {
      lastPropTextRef.current = qText;
      setLocalText(qText);
    }

    if (qOptionsStr !== lastPropOptionsStrRef.current) {
      lastPropOptionsStrRef.current = qOptionsStr;
      setLocalOptions(qOptions);
    }

    if (qNat !== lastPropNatRef.current) {
      lastPropNatRef.current = qNat;
      setLocalCorrectNat(qNat);
    }

    if (qExp !== lastPropExpRef.current) {
      lastPropExpRef.current = qExp;
      setLocalExplanation(qExp);
    }
  }, [question?.id, question?.text, JSON.stringify(question?.options), question?.correctNat, question?.explanation, questionIndex]);

  // Rapid 50ms debounce sync localText -> parent onUpdateQuestion for instant KaTeX live preview
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && localText !== question.text) {
        lastPropTextRef.current = localText;
        onUpdateQuestion({ text: localText });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [localText]);

  // Rapid 50ms debounce sync localOptions -> parent onUpdateQuestion
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && JSON.stringify(localOptions) !== JSON.stringify(question.options)) {
        lastPropOptionsStrRef.current = JSON.stringify(localOptions);
        onUpdateQuestion({ options: localOptions });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [localOptions]);

  // Rapid 50ms debounce sync localCorrectNat -> parent onUpdateQuestion
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && localCorrectNat !== question.correctNat) {
        lastPropNatRef.current = localCorrectNat;
        onUpdateQuestion({ correctNat: localCorrectNat });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [localCorrectNat]);

  // Rapid 50ms debounce sync localExplanation -> parent onUpdateQuestion
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && localExplanation !== (question.explanation || '')) {
        lastPropExpRef.current = localExplanation;
        onUpdateQuestion({ explanation: localExplanation });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [localExplanation]);

  if (!question) return null;

  const insertMathSnippet = (snippet: string) => {
    if (typeof focusedField === 'object' && 'optionIndex' in focusedField) {
      const idx = focusedField.optionIndex;
      const currentOpts = [...(localOptions || [])];
      if (idx >= 0 && idx < currentOpts.length) {
        const { text: optText, image: optImgSrc } = parseOptionData(currentOpts[idx]);
        const updatedText = `${optText}${snippet}`;
        currentOpts[idx] = optImgSrc ? `${updatedText} ||IMG:${optImgSrc}||` : updatedText;
        setLocalOptions(currentOpts);
        onUpdateQuestion({ options: currentOpts });
        return;
      }
    }
    if (focusedField === 'explanation') {
      const newExp = `${localExplanation || ''}${snippet}`;
      setLocalExplanation(newExp);
      setOpenExplanation(true);
      onUpdateQuestion({ explanation: newExp });
      return;
    }
    const newText = `${localText || ''}${snippet}`;
    setLocalText(newText);
    onUpdateQuestion({ text: newText });
  };

  const sLabel = `S${sectionIndex + 1}Q${questionIndex + 1}`;

  const handleSelectQuestionType = (newType: QuestionType) => {
    if (newType === question.type) return;
    if (newType === 'MCQ') {
      onUpdateQuestion({
        type: 'MCQ',
        options: question.options?.length ? question.options : ['', '', '', ''],
        correct: Array.isArray(question.correct) ? (question.correct[0] ?? 0) : (typeof question.correct === 'number' ? question.correct : 0)
      });
    } else if (newType === 'MSQ') {
      onUpdateQuestion({
        type: 'MSQ',
        options: question.options?.length ? question.options : ['', '', '', ''],
        correct: Array.isArray(question.correct) ? question.correct : [typeof question.correct === 'number' ? question.correct : 0]
      });
    } else {
      onUpdateQuestion({
        type: 'NAT',
        options: [],
        correctNat: question.correctNat || ''
      });
    }
  };

  const activeTargetLabel =
    focusedField === 'text'
      ? 'Statement'
      : focusedField === 'explanation'
      ? 'Solution'
      : `Option ${String.fromCharCode(65 + focusedField.optionIndex)}`;

  return (
    <div
      id={`editor-question-${questionIndex}`}
      onClick={onFocusQuestion}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}
      className={`w-full bg-white dark:bg-slate-900 rounded-2xl border p-3 sm:p-3.5 space-y-2.5 scroll-mt-16 transition-colors ${
        isActive
          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
      }`}
    >
      {/* Compact Header Row: Badge + Type Switcher + Marks + Quick Actions */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {/* Left: S1Q1 Badge & Direct Question Type Segmented Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900/50 shrink-0 font-mono">
            {sLabel}
          </span>

          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
            {(['MCQ', 'MSQ', 'NAT'] as QuestionType[]).map(t => {
              const label = t === 'MCQ' ? 'SCQ' : t === 'MSQ' ? 'MCQ' : 'NAT';
              const active = question.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectQuestionType(t);
                  }}
                  title={
                    t === 'MCQ'
                      ? 'Single Choice Question (SCQ)'
                      : t === 'MSQ'
                      ? 'Multiple Correct Question (MSQ)'
                      : 'Numerical Answer Type (NAT)'
                  }
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Marks Override + Quick Question Actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Compact +[4] -[1] Inline Marks with Fraction Support */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">+</span>
            <input
              type="text"
              value={rawMarksStr !== null ? rawMarksStr : question.marksCorrect !== undefined ? String(question.marksCorrect) : ''}
              placeholder={String(section?.marks ?? 4)}
              onChange={e => {
                const val = e.target.value;
                setRawMarksStr(val);
                const parsed = parseFractionOrNumber(val);
                onUpdateQuestion({ marksCorrect: parsed });
              }}
              onFocus={onFocusQuestion}
              onBlur={() => setRawMarksStr(null)}
              className="w-9 px-1 py-0.5 text-center font-bold font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none text-xs"
              title="Correct Marks (supports fractions like 1/2)"
            />

            <span className="text-red-500 font-extrabold ml-0.5">-</span>
            <input
              type="text"
              value={rawPenaltyStr !== null ? rawPenaltyStr : question.marksWrong !== undefined ? String(question.marksWrong) : ''}
              placeholder={String(question.type === 'NAT' ? 0 : (section?.negative ?? 1))}
              onChange={e => {
                const val = e.target.value;
                setRawPenaltyStr(val);
                const parsed = parseFractionOrNumber(val);
                onUpdateQuestion({ marksWrong: parsed });
              }}
              onFocus={onFocusQuestion}
              onBlur={() => setRawPenaltyStr(null)}
              className="w-9 px-1 py-0.5 text-center font-bold font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none text-xs"
              title="Incorrect Penalty (supports fractions like 1/4)"
            />

            {(question.marksCorrect !== undefined || question.marksWrong !== undefined) && (
              <button
                type="button"
                onClick={() => {
                  setRawMarksStr(null);
                  setRawPenaltyStr(null);
                  onUpdateQuestion({ marksCorrect: undefined, marksWrong: undefined });
                }}
                title="Reset to Section Defaults"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          {/* Quick Reorder / Duplicate / Delete Controls */}
          <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {onMoveQuestionUp && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onMoveQuestionUp();
                }}
                disabled={questionIndex <= 0}
                title="Move Question Up"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
              >
                <ArrowUp size={13} />
              </button>
            )}
            {onMoveQuestionDown && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onMoveQuestionDown();
                }}
                disabled={questionIndex >= totalQuestions - 1}
                title="Move Question Down"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
              >
                <ArrowDown size={13} />
              </button>
            )}
            {onDuplicateQuestion && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onDuplicateQuestion();
                }}
                title="Duplicate Question"
                className="p-1 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <Copy size={13} />
              </button>
            )}
            {onDeleteQuestion && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onDeleteQuestion();
                }}
                title="Delete / Clear Question"
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Context-Aware Math & Formatting Ribbon (Rendered on active card to eliminate DOM bloat across 100+ questions) */}
      {isActive && (
        <div className="bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100/80 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {activeTargetLabel}
            </span>
          {mathMode === 'LATEX' ? (
            <>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$x$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Inline Math ($x$)"
              >
                $x$
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$$x = y$$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Display Block Equation ($$...$$)"
              >
                $$
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\frac{a}{b}$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Fraction (\frac{a}{b})"
              >
                a/b
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\sqrt{x}$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Square Root (\sqrt{x})"
              >
                √x
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('^{2}')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Superscript ^{2}"
              >
                x²
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('_{i}')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Subscript _{i}"
              >
                xᵢ
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\vec{F}$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Vector (\vec{F})"
              >
                F⃗
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\int_{a}^{b}$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Definite Integral"
              >
                ∫
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\Delta$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Delta (\Delta)"
              >
                Δ
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\theta$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Theta (\theta)"
              >
                θ
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$\\rightleftharpoons$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Equilibrium (\rightleftharpoons)"
              >
                ⇌
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('$^{\\circ}\\text{C}$')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Degree Celsius"
              >
                °C
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('<sup>2</sup>')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                x²
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('<sub>2</sub>')}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                x₂
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('√')}
                className="px-2 py-0.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                √
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertMathSnippet('⇌')}
                className="px-2 py-0.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                ⇌
              </button>
            </>
          )}
        </div>

          <button
            type="button"
            onClick={onOpenLaTeXGuide}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
            title="LaTeX Cheatsheet"
          >
            <Info size={12} />
            <span>LaTeX</span>
          </button>
        </div>
      )}

      {/* Question Statement Input (No redundant headings) */}
      <AutoExpandingTextarea
        value={localText}
        onChange={e => setLocalText(e.target.value)}
        onFocus={() => {
          setFocusedField('text');
          onFocusQuestion?.();
        }}
        placeholder={`Question ${questionIndex + 1} statement... ($x^2$ for inline math, $$...$$ for display)`}
        className="w-full min-h-[76px] p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
        minRows={2}
      />

      {/* Auxiliary Tools Row (Diagram, Table, Solution) */}
      <div className="space-y-2 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Diagram Attach Button or Base64 Image Guard */}
          {question.image ? (
            <Base64ImageGuard
              imageSrc={question.image}
              label="Diagram"
              onOpenStudio={() => {
                onOpenCropper(question.image || '', 'question');
              }}
              onReplaceImage={e => onImageFilePicked(e, 'question')}
              onRemoveImage={() => onUpdateQuestion({ image: '' })}
            />
          ) : (
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors">
              <ImageIcon size={14} className="text-blue-500" />
              <span>+ Diagram</span>
              <input
                type="file"
                accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp,.bmp"
                className="hidden"
                onChange={e => onImageFilePicked(e, 'question')}
              />
            </label>
          )}

          {/* Table Match Toggle */}
          <button
            type="button"
            onClick={() => setOpenTable(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              question.table || openTable
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Code size={14} />
            <span>Table / Matrix {question.table ? '• Active' : ''}</span>
          </button>

          {/* Solution / Explanation Toggle */}
          <button
            type="button"
            onClick={() => setOpenExplanation(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              localExplanation || openExplanation
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Lightbulb size={14} className="text-amber-500" />
            <span>Solution / Explanation {localExplanation ? '• Added' : ''}</span>
          </button>
        </div>

        {/* Table Drawer (Visual Grid Mode) */}
        {(openTable || Boolean(question.table)) && (
          <VisualTableEditor
            initialHtml={question.table || ''}
            onChange={html => onUpdateQuestion({ table: html })}
            onClear={() => onUpdateQuestion({ table: '' })}
          />
        )}
      </div>

      {/* Options Section */}
      <div className="space-y-1.5 w-full">
        {question.type !== 'NAT' ? (
          <div className="space-y-1.5 w-full">
            <div className="space-y-1.5 w-full">
              {(localOptions || []).map((opt, oi) => {
                const { text: optText, image: optImgSrc } = parseOptionData(opt);

                const isCorrect =
                  question.type === 'MSQ'
                    ? Array.isArray(question.correct) && question.correct.includes(oi)
                    : question.correct === oi;

                return (
                  <div
                    key={oi}
                    className={`p-2.5 rounded-xl border transition-all w-full ${
                      isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 w-full">
                      {/* Correct Indicator button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (question.type === 'MSQ') {
                            const cur = Array.isArray(question.correct) ? [...question.correct] : [];
                            const updated = cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi];
                            onUpdateQuestion({ correct: updated });
                          } else {
                            onUpdateQuestion({ correct: oi });
                          }
                        }}
                        title="Click to mark as correct answer key"
                        className={`w-7 h-7 mt-0.5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors touch-manipulation ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}
                      </button>

                      {/* Option Text Area */}
                      <div className="flex-1 min-w-0">
                        <AutoExpandingTextarea
                          value={optText}
                          onChange={e => {
                            const currentOpts = [...(localOptions || [])];
                            const newText = e.target.value;
                            currentOpts[oi] = optImgSrc ? `${newText} ||IMG:${optImgSrc}||` : newText;
                            setLocalOptions(currentOpts);
                          }}
                          onFocus={() => {
                            setFocusedField({ optionIndex: oi });
                            onFocusQuestion?.();
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + oi)} statement...`}
                          className="w-full px-2 py-1 text-xs sm:text-sm rounded-lg bg-transparent border-0 text-slate-800 dark:text-slate-100 focus:outline-none min-h-[32px] leading-relaxed"
                          minRows={1}
                        />
                      </div>

                      {/* Option Actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {!optImgSrc && (
                          <label
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors flex items-center gap-1"
                            title="Attach Image to Option"
                          >
                            <ImageIcon size={14} />
                            <input
                              type="file"
                              accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp,.bmp"
                              className="hidden"
                              onChange={e => onImageFilePicked(e, { optionIndex: oi })}
                            />
                          </label>
                        )}

                        {(localOptions || []).length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentOpts = (localOptions || []).filter((_, i) => i !== oi);
                              setLocalOptions(currentOpts);
                              onUpdateQuestion({ options: currentOpts });
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 shrink-0"
                            title="Delete Option"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Render Option Image Guard if attached */}
                    {optImgSrc && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <Base64ImageGuard
                          imageSrc={optImgSrc}
                          label={`Option ${String.fromCharCode(65 + oi)} Image`}
                          onOpenStudio={() => {
                            onOpenCropper(optImgSrc, { optionIndex: oi });
                          }}
                          onReplaceImage={e => onImageFilePicked(e, { optionIndex: oi })}
                          onRemoveImage={() => {
                            const currentOpts = [...(localOptions || [])];
                            currentOpts[oi] = optText;
                            setLocalOptions(currentOpts);
                            onUpdateQuestion({ options: currentOpts });
                          }}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                const currentOpts = [...(localOptions || [])];
                currentOpts.push('');
                setLocalOptions(currentOpts);
                onUpdateQuestion({ options: currentOpts });
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
            >
              <Plus size={12} />
              <span>Add Option</span>
            </button>
          </div>
        ) : (
          /* NAT Mode Input */
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">NAT Key:</span>
            <input
              type="text"
              value={localCorrectNat}
              onChange={e => setLocalCorrectNat(e.target.value)}
              onFocus={onFocusQuestion}
              placeholder="Numerical value or range (e.g. 15 or 14.5-15.5)"
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Solution / Explanation Editor Card */}
      {(openExplanation || Boolean(localExplanation)) && (
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-2 w-full">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Lightbulb size={15} />
              <span>Solution / Step-by-Step Explanation</span>
            </label>
            {localExplanation && (
              <button
                type="button"
                onClick={() => {
                  setLocalExplanation('');
                  onUpdateQuestion({ explanation: '' });
                }}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <AutoExpandingTextarea
            value={localExplanation}
            onChange={e => setLocalExplanation(e.target.value)}
            onFocus={() => {
              setFocusedField('explanation');
              onFocusQuestion?.();
            }}
            placeholder="Write the detailed solution or derivation here (supports $...$ and $$...$$ LaTeX equations)..."
            className="w-full min-h-[72px] p-3 text-sm rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
            minRows={2}
          />
        </div>
      )}

      {/* Bottom Sticky Question Navigation & Addition Footer (Shown only in Single Focus mode) */}
      {showNavigationFooter && onPrevQuestion && onNextQuestion && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 max-w-3xl mx-auto shadow-lg rounded-t-2xl">
          <button
            type="button"
            onClick={onPrevQuestion}
            disabled={questionIndex <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Prev Q</span>
          </button>

          {onAddQuestionNext && (
            <button
              type="button"
              onClick={onAddQuestionNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Add Question Next</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNextQuestion}
            disabled={questionIndex >= totalQuestions - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-200 transition-colors"
          >
            <span>Next Q</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.question === next.question &&
    prev.isActive === next.isActive &&
    prev.questionIndex === next.questionIndex &&
    prev.totalQuestions === next.totalQuestions &&
    prev.sectionIndex === next.sectionIndex &&
    prev.mathMode === next.mathMode &&
    prev.showNavigationFooter === next.showNavigationFooter &&
    prev.section?.marks === next.section?.marks &&
    prev.section?.negative === next.section?.negative
  );
});

export default QuestionEditor;
