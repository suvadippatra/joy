import React, { useState, useMemo, useDeferredValue, memo } from 'react';
import { Monitor, Tablet, Smartphone, ZoomIn, X, Hash, Lightbulb } from 'lucide-react';
import { Question, Section } from '../../types/cbtMaker';
import { formatContent } from '../../utils/cbtCompiler';

interface QuestionLivePreviewProps {
  question: Question | null;
  questionIndex: number;
  section: Section;
  fontName: string;
  mathMode: 'LATEX' | 'HTML';
  renderEngine: 'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE';
}

function QuestionLivePreview({
  question,
  questionIndex,
  section,
  fontName,
  mathMode,
  renderEngine
}: QuestionLivePreviewProps) {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedMsq, setSelectedMsq] = useState<number[]>([]);
  const [natAnswer, setNatAnswer] = useState<string>('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Defer expensive math formatting so typing remains instant at 60 FPS
  const deferredQuestion = useDeferredValue(question);

  const processedText = useMemo(() => {
    return deferredQuestion ? formatContent(deferredQuestion.text, renderEngine, mathMode, true) : '';
  }, [deferredQuestion?.text, renderEngine, mathMode]);

  const processedTable = useMemo(() => {
    return deferredQuestion?.table ? formatContent(deferredQuestion.table, renderEngine, mathMode, true) : '';
  }, [deferredQuestion?.table, renderEngine, mathMode]);

  const processedExp = useMemo(() => {
    return deferredQuestion?.explanation ? formatContent(deferredQuestion.explanation, renderEngine, mathMode, true) : '';
  }, [deferredQuestion?.explanation, renderEngine, mathMode]);

  const processedOptions = useMemo(() => {
    if (!deferredQuestion?.options) return [];
    return deferredQuestion.options.map((opt) => {
      let optText = opt || '';
      let optImgSrc = '';
      const imgMatch = optText.match(/\|\|IMG:([\s\S]+?)\|\|/);
      if (imgMatch) {
        optImgSrc = imgMatch[1].trim();
        optText = optText.replace(/\|\|IMG:([\s\S]+?)\|\|/g, '').trim();
      }
      const safeOpt = formatContent(optText, renderEngine, mathMode, true);
      return { html: safeOpt, imgSrc: optImgSrc };
    });
  }, [deferredQuestion?.options, renderEngine, mathMode]);

  if (!question) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 text-slate-400 text-sm">
        Select or add a question to preview.
      </div>
    );
  }

  const qMarks = (typeof question.marksCorrect === 'number' && !isNaN(question.marksCorrect)) ? question.marksCorrect : section.marks;
  const qNeg = (typeof question.marksWrong === 'number' && !isNaN(question.marksWrong)) ? question.marksWrong : (question.type === 'NAT' ? 0 : section.negative);

  const viewportWidthClass =
    viewportMode === 'mobile'
      ? 'w-full max-w-[375px] mx-auto'
      : viewportMode === 'tablet'
      ? 'w-full max-w-[640px] mx-auto'
      : 'w-full max-w-3xl mx-auto';

  const typeBadgeLabel = question.type === 'MCQ' ? 'SCQ' : question.type === 'MSQ' ? 'MCQ' : 'NAT';

  return (
    <div className="flex flex-col h-full w-full bg-slate-100/70 dark:bg-slate-950/60 overflow-hidden border-l border-slate-200/80 dark:border-slate-800">
      {/* Viewport Toolbar */}
      <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/50 dark:border-blue-900/40">
            {section.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Question {questionIndex + 1}
          </span>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            title="Desktop View (Full Width)"
            className={`p-1.5 rounded-lg transition-colors touch-manipulation ${
              viewportMode === 'desktop'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Monitor size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            title="Tablet View (640px)"
            className={`p-1.5 rounded-lg transition-colors touch-manipulation ${
              viewportMode === 'tablet'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tablet size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            title="Mobile View (375px)"
            className={`p-1.5 rounded-lg transition-colors touch-manipulation ${
              viewportMode === 'mobile'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone size={15} />
          </button>
        </div>
      </div>

      {/* Preview Stage Container - Always Centered */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-start w-full">
        <div
          style={{ fontFamily: fontName }}
          className={`${viewportWidthClass} transition-all duration-200 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 w-full`}
        >
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Question {questionIndex + 1}
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/40">
                {typeBadgeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">+{qMarks}</span>
              <span className="text-red-500 dark:text-red-400">-{qNeg}</span>
            </div>
          </div>

          {/* Question Text */}
          <div
            className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line select-text mb-4"
            dangerouslySetInnerHTML={{
              __html: processedText || '<span class="text-slate-400 italic">No question statement entered yet...</span>'
            }}
          />

          {/* Attached Image if any */}
          {question.image && (
            <div className="my-4">
              {question.image === 'PLACEHOLDER' ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-center text-xs font-semibold text-red-600 dark:text-red-400">
                  Missing Image
                </div>
              ) : (
                <div className="relative inline-block max-w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                  <img
                    src={question.image}
                    alt="Question Diagram"
                    className="max-h-[300px] w-auto object-contain cursor-pointer transition-transform hover:scale-[1.01]"
                    onClick={() => setLightboxSrc(question.image || '')}
                  />
                  <div
                    onClick={() => setLightboxSrc(question.image || '')}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs flex items-center gap-1"
                  >
                    <ZoomIn size={14} />
                    <span>Zoom</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table if any */}
          {processedTable && (
            <div
              className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-xs"
              dangerouslySetInnerHTML={{ __html: processedTable }}
            />
          )}

          {/* Options for MCQ / MSQ */}
          {question.type !== 'NAT' ? (
            <div className="space-y-2.5 mt-5">
              {processedOptions.map((optItem, oi) => {
                const isSelected =
                  question.type === 'MSQ' ? selectedMsq.includes(oi) : selectedOption === oi;

                return (
                  <div
                    key={oi}
                    onClick={() => {
                      if (question.type === 'MSQ') {
                        setSelectedMsq(prev =>
                          prev.includes(oi) ? prev.filter(x => x !== oi) : [...prev, oi]
                        );
                      } else {
                        setSelectedOption(oi);
                      }
                    }}
                    className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer touch-manipulation ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </div>

                    <div className="flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed min-w-0">
                      <div dangerouslySetInnerHTML={{ __html: optItem.html || '...' }} />
                      {optItem.imgSrc && (
                        <div className="mt-2">
                          <img
                            src={optItem.imgSrc}
                            alt={`Option ${String.fromCharCode(65 + oi)}`}
                            className="max-h-[160px] object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* NAT Numerical Answer Simulation */
            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Hash size={16} className="text-blue-500" />
                <span>Candidate Virtual Numpad Simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={natAnswer}
                  onChange={e => setNatAnswer(e.target.value)}
                  placeholder="Enter numerical answer..."
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setNatAnswer('')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Explanation if any */}
          {processedExp && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <Lightbulb size={15} />
                <span>Solution / Explanation Note:</span>
              </div>
              <div
                className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30"
                dangerouslySetInnerHTML={{ __html: processedExp }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxSrc}
              alt="Enlarged Diagram"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(QuestionLivePreview);
