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
  RefreshCw
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
}

const QuestionEditor = memo(function QuestionEditor({
  question,
  questionIndex,
  totalQuestions,
  section,
  sectionIndex,
  mathMode,
  onUpdateQuestion,
  onImageFilePicked,
  onOpenLaTeXGuide,
  onOpenCropper,
  onPrevQuestion,
  onNextQuestion,
  onAddQuestionNext
}: QuestionEditorProps) {
  const [openTable, setOpenTable] = useState<boolean>(false);

  // Local state for raw text in marks inputs to support fractions like "1/2" or "1/4"
  const [rawMarksStr, setRawMarksStr] = useState<string | null>(null);
  const [rawPenaltyStr, setRawPenaltyStr] = useState<string | null>(null);

  // Local input state for 0ms fluid typing response
  const [localText, setLocalText] = useState<string>(() => question?.text || '');
  const [localOptions, setLocalOptions] = useState<string[]>(() => question?.options || []);
  const [localCorrectNat, setLocalCorrectNat] = useState<string>(() => question?.correctNat || '');

  // Track active question ID to only reset local state when switching questions
  const activeQIdRef = useRef<number | string | null>(question?.id ?? null);

  useEffect(() => {
    if (question && question.id !== activeQIdRef.current) {
      activeQIdRef.current = question.id;
      setLocalText(question.text || '');
      setLocalOptions(question.options || []);
      setLocalCorrectNat(question.correctNat || '');
    }
  }, [question?.id, questionIndex]);

  // Debounce sync localText -> parent onUpdateQuestion
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && localText !== question.text) {
        onUpdateQuestion({ text: localText });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localText]);

  // Debounce sync localOptions -> parent onUpdateQuestion
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && JSON.stringify(localOptions) !== JSON.stringify(question.options)) {
        onUpdateQuestion({ options: localOptions });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localOptions]);

  // Debounce sync localCorrectNat -> parent onUpdateQuestion
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      if (question.id === activeQIdRef.current && localCorrectNat !== question.correctNat) {
        onUpdateQuestion({ correctNat: localCorrectNat });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localCorrectNat]);

  if (!question) return null;

  const insertMathSnippet = (snippet: string) => {
    const newText = (localText || '') + snippet;
    setLocalText(newText);
    onUpdateQuestion({ text: newText });
  };

  const sLabel = `S${sectionIndex + 1}Q${questionIndex + 1}`;

  // Question Type Cycle: MCQ (SCQ) -> MSQ (MCQ) -> NAT -> MCQ (SCQ)
  const cycleQuestionType = () => {
    if (question.type === 'MCQ') {
      onUpdateQuestion({
        type: 'MSQ',
        options: question.options?.length ? question.options : ['', '', '', ''],
        correct: [0]
      });
    } else if (question.type === 'MSQ') {
      onUpdateQuestion({
        type: 'NAT',
        options: [],
        correctNat: ''
      });
    } else {
      onUpdateQuestion({
        type: 'MCQ',
        options: ['', '', '', ''],
        correct: 0
      });
    }
  };

  const typeDisplayLabel =
    question.type === 'MCQ' ? 'SCQ (Single Correct)' : question.type === 'MSQ' ? 'MCQ (Multiple Correct)' : 'NAT (Numerical)';

  return (
    <div className="max-w-3xl mx-auto w-full space-y-3 pb-16">
      {/* Question Header Bar with S1Q1 Labeling, Merged Single Type Switcher & Compact +[4] -[1] Marks */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Left: S1Q1 Label & Single Merged Type Switcher Button */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900/50">
            {sLabel}
          </span>

          <button
            type="button"
            onClick={cycleQuestionType}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            title="Click to cycle Question Type (SCQ -> MCQ -> NAT)"
          >
            <span>Type: {typeDisplayLabel}</span>
            <RefreshCw size={13} className="text-blue-500" />
          </button>
        </div>

        {/* Right: Compact +[4] -[1] Style Marks with Fraction Support */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold">
          <span className="text-emerald-600 dark:text-emerald-400">+</span>
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
            onBlur={() => setRawMarksStr(null)}
            className="w-14 px-1 py-0.5 text-center font-bold font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none text-xs"
            title="Correct Marks (e.g., 4 or 1/2)"
          />

          <span className="text-red-500 ml-0.5">-</span>
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
            onBlur={() => setRawPenaltyStr(null)}
            className="w-14 px-1 py-0.5 text-center font-bold font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none text-xs"
            title="Incorrect Penalty (e.g., 1 or 1/4)"
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
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Question Statement Box */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 w-full">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>Question Statement ({sLabel})</span>
            <span
              title={mathMode === 'LATEX' ? 'Markdown & LaTeX math ($...$) enabled' : 'HTML tags & Unicode enabled'}
              className="text-slate-400 hover:text-blue-500 cursor-help"
            >
              <Info size={14} />
            </span>
          </label>

          {/* Quick Math Formatters */}
          <div className="flex items-center gap-1 flex-wrap">
            {mathMode === 'LATEX' ? (
              <>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('$x$')}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Inline Math ($x$)"
                >
                  $x$
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('$$\\frac{a}{b}$$')}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Fraction (\frac)"
                >
                  \frac
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('$$\\sqrt{x}$$')}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Square Root (\sqrt)"
                >
                  \sqrt
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('$x^2$')}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Superscript / Power (x²)"
                >
                  x²
                </button>
                <button
                  type="button"
                  onClick={onOpenLaTeXGuide}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-md hover:bg-emerald-100 transition-colors"
                  title="LaTeX Guide"
                >
                  <Info size={13} />
                  <span>Guide</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('<sup>2</sup>')}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Superscript <sup>2</sup>"
                >
                  x²
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('<sub>2</sub>')}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Subscript <sub>2</sub>"
                >
                  x₂
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet('√')}
                  className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Square Root Symbol"
                >
                  √
                </button>
              </>
            )}
          </div>
        </div>

        <AutoExpandingTextarea
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          placeholder="Enter question statement..."
          className="w-full min-h-[90px] p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
          minRows={3}
        />
      </div>

      {/* Auxiliary Tools Row (Diagram Guard & Table Grid) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 w-full">
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

      {/* Options Card */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 w-full">
        {question.type !== 'NAT' ? (
          <div className="space-y-2.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Options ({question.type === 'MSQ' ? 'Select all correct' : 'Select one correct'})
              </label>
              <button
                type="button"
                onClick={() => {
                  const currentOpts = [...(question.options || [])];
                  currentOpts.push('');
                  onUpdateQuestion({ options: currentOpts });
                }}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus size={14} />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2 w-full">
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
                        title="Click to mark correct"
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
                            title="Attach Image"
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
          </div>
        ) : (
          /* NAT Mode Input */
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
              Numerical Answer (NAT Correct Range or Value)
            </label>
            <input
              type="text"
              value={localCorrectNat}
              onChange={e => setLocalCorrectNat(e.target.value)}
              placeholder="e.g. 15 or 14.5-15.5"
              className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Bottom Sticky Question Navigation & Addition Footer */}
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
    </div>
  );
});

export default QuestionEditor;
