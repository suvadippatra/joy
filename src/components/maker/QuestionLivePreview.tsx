import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, X, Hash, Lightbulb, Image as ImageIcon, Eye, EyeOff, Clock, Code, FileText } from 'lucide-react';
import { Question, Section } from '../../types/cbtMaker';
import { formatContent } from '../../utils/cbtCompiler';
import { formatDataUrlSize } from '../../utils/imageOptimizer';

interface QuestionLivePreviewProps {
  question: Question | null;
  questionIndex: number;
  section: Section;
  fontName: string;
  mathMode: 'LATEX' | 'HTML';
  renderEngine: 'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE';
}

const QuestionLivePreview = memo(function QuestionLivePreview({
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
  const [fontScale, setFontScale] = useState<number>(1.15); // Default 115% high-readability scale

  // Global Media Mode: 'on-demand' (auto-hides after 10s to save memory) or 'always'
  const [mediaMode, setMediaMode] = useState<'on-demand' | 'always'>('on-demand');

  // Question Diagram 10s timer state
  const [showQuestionImage, setShowQuestionImage] = useState<boolean>(false);
  const [qImageSecondsLeft, setQImageSecondsLeft] = useState<number>(10);
  const qImageTimerRef = useRef<any>(null);

  // Option Images 10s timer state map
  const [activeOptionImagePreviews, setActiveOptionImagePreviews] = useState<Record<number, number>>({});
  const optImageIntervalRef = useRef<any>(null);

  // Debounced question state for ultra-smooth typing without KaTeX blocking
  const [debouncedQuestion, setDebouncedQuestion] = useState(question);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuestion(question);
    }, 80);
    return () => clearTimeout(handler);
  }, [question]);

  // Reset local selection when question changes
  useEffect(() => {
    setSelectedOption(null);
    setSelectedMsq([]);
    setNatAnswer('');
  }, [questionIndex, section.name]);

  // Question image countdown
  useEffect(() => {
    if (mediaMode === 'always') {
      setShowQuestionImage(true);
      return;
    }

    if (showQuestionImage) {
      setQImageSecondsLeft(10);
      qImageTimerRef.current = setInterval(() => {
        setQImageSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(qImageTimerRef.current);
            setShowQuestionImage(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (qImageTimerRef.current) clearInterval(qImageTimerRef.current);
    }

    return () => {
      if (qImageTimerRef.current) clearInterval(qImageTimerRef.current);
    };
  }, [showQuestionImage, mediaMode]);

  // Option images countdown interval
  useEffect(() => {
    if (mediaMode === 'always') return;

    const hasActivePreviews = Object.keys(activeOptionImagePreviews).length > 0;
    if (hasActivePreviews) {
      optImageIntervalRef.current = setInterval(() => {
        setActiveOptionImagePreviews((prev) => {
          const next: Record<number, number> = {};
          for (const [key, val] of Object.entries(prev)) {
            const numKey = Number(key);
            const seconds = Number(val);
            if (seconds > 1) {
              next[numKey] = seconds - 1;
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (optImageIntervalRef.current) clearInterval(optImageIntervalRef.current);
    }

    return () => {
      if (optImageIntervalRef.current) clearInterval(optImageIntervalRef.current);
    };
  }, [activeOptionImagePreviews, mediaMode]);

  const toggleOptionImagePreview = (oi: number) => {
    setActiveOptionImagePreviews((prev) => {
      if (prev[oi] !== undefined) {
        const copy = { ...prev };
        delete copy[oi];
        return copy;
      } else {
        return { ...prev, [oi]: 10 };
      }
    });
  };

  // Memoized LaTeX & Markdown parsing
  const processedText = useMemo(() => {
    return debouncedQuestion ? formatContent(debouncedQuestion.text, renderEngine, mathMode, true) : '';
  }, [debouncedQuestion?.text, renderEngine, mathMode]);

  const processedTable = useMemo(() => {
    return debouncedQuestion?.table ? formatContent(debouncedQuestion.table, renderEngine, mathMode, true) : '';
  }, [debouncedQuestion?.table, renderEngine, mathMode]);

  const processedExp = useMemo(() => {
    return debouncedQuestion?.explanation ? formatContent(debouncedQuestion.explanation, renderEngine, mathMode, true) : '';
  }, [debouncedQuestion?.explanation, renderEngine, mathMode]);

  const processedOptions = useMemo(() => {
    if (!debouncedQuestion?.options) return [];
    return debouncedQuestion.options.map((opt) => {
      let optText = opt || '';
      let optImgSrc = '';
      const imgMatch = optText.match(/\|\|IMG:([\s\S]+?)\|\|/);
      if (imgMatch) {
        optImgSrc = imgMatch[1].trim();
        optText = optText.replace(/\|\|IMG:([\s\S]+?)\|\|/g, '').trim();
      }
      const safeOpt = formatContent(optText, renderEngine, mathMode, true);
      const imgSize = optImgSrc ? formatDataUrlSize(optImgSrc) : '';
      return { html: safeOpt, imgSrc: optImgSrc, imgSize };
    });
  }, [debouncedQuestion?.options, renderEngine, mathMode]);

  if (!question) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 text-slate-400 text-base font-medium">
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
  const qImageSize = question.image ? formatDataUrlSize(question.image) : '';

  return (
    <div className="flex flex-col h-full w-full bg-slate-100/70 dark:bg-slate-950/60 overflow-hidden border-l border-slate-200/80 dark:border-slate-800">
      {/* Viewport & Media Toolbar */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/50 dark:border-blue-900/40">
            {section.name}
          </span>
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold">
            Q{questionIndex + 1}
          </span>
        </div>

        {/* Media Mode & Viewport Switcher */}
        <div className="flex items-center gap-2">
          {/* Font Size Zoom Controller */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setFontScale(prev => Math.max(0.9, prev - 0.15))}
              title="Decrease Preview Font Size"
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-1.5 select-none text-[11px] font-mono">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setFontScale(prev => Math.min(1.8, prev + 0.15))}
              title="Increase Preview Font Size"
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Engine Archetype Visual Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all">
            {mathMode === 'LATEX' ? (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                <Code size={13} />
                <span>LaTeX Engine (KaTeX)</span>
              </span>
            ) : renderEngine === 'MATHML' ? (
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                <Code size={13} />
                <span>MathML Engine</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <FileText size={13} />
                <span>Pure HTML Engine</span>
              </span>
            )}
          </div>

          {/* Media Load Saver Toggle */}
          <button
            type="button"
            onClick={() => setMediaMode(mediaMode === 'on-demand' ? 'always' : 'on-demand')}
            title="Switch between On-Demand 10s media view (Memory Saver) and Always Render"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
          >
            <Clock size={12} className={mediaMode === 'on-demand' ? 'text-amber-500' : 'text-slate-400'} />
            <span className="hidden sm:inline">{mediaMode === 'on-demand' ? '10s Auto-Hide' : 'Always Render'}</span>
          </button>

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
      </div>

      {/* Preview Stage Container - Always Centered */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-start w-full">
        <div
          style={{ fontFamily: fontName, fontSize: `${fontScale * 100}%` }}
          className={`${viewportWidthClass} transition-all duration-200 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-7 w-full`}
        >
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                Question {questionIndex + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/40">
                {typeBadgeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
              <span className="text-emerald-600 dark:text-emerald-400">+{qMarks}</span>
              <span className="text-red-500 dark:text-red-400">-{qNeg}</span>
            </div>
          </div>

          {/* Question Text */}
          <div
            className="cbt-rendered-content text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line select-text mb-5 font-medium"
            dangerouslySetInnerHTML={{
              __html: processedText || '<span class="text-slate-400 italic">No question statement entered yet...</span>'
            }}
          />

          {/* Attached Diagram with Extreme Memory Efficiency (10-second auto-hide) */}
          {question.image && (
            <div className="my-4">
              {question.image === 'PLACEHOLDER' ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-center text-xs font-semibold text-red-600 dark:text-red-400">
                  Missing Image
                </div>
              ) : mediaMode === 'always' || showQuestionImage ? (
                <div className="relative inline-flex flex-col items-start gap-1 max-w-full rounded-xl p-2 bg-slate-950 border border-slate-800 group">
                  <div className="relative">
                    <img
                      src={question.image}
                      alt="Question Diagram"
                      className="max-h-[300px] w-auto object-contain cursor-pointer rounded-lg"
                      onClick={() => setLightboxSrc(question.image || '')}
                    />
                    <div
                      onClick={() => setLightboxSrc(question.image || '')}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold flex items-center gap-1"
                    >
                      <ZoomIn size={14} />
                      <span>Zoom</span>
                    </div>
                  </div>

                  {mediaMode === 'on-demand' && (
                    <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock size={11} /> Auto-hiding in {qImageSecondsLeft}s
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuestionImage(false)}
                        className="text-slate-400 hover:text-white underline"
                      >
                        Hide Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Unmounted Base64 state to prevent memory lag */
                <button
                  type="button"
                  onClick={() => setShowQuestionImage(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all touch-manipulation"
                >
                  <ImageIcon size={16} className="text-blue-500" />
                  <span>View Attached Diagram ({qImageSize})</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md font-semibold">
                    10s View
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Table if any - Styled matching cbt_demo.html simplicity */}
          {processedTable && (
            <div
              className="cbt-rendered-content my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950/40"
              dangerouslySetInnerHTML={{ __html: processedTable }}
            />
          )}

          {/* Options for MCQ / MSQ */}
          {question.type !== 'NAT' ? (
            <div className="space-y-3 mt-5">
              {processedOptions.map((optItem, oi) => {
                const isSelected =
                  question.type === 'MSQ' ? selectedMsq.includes(oi) : selectedOption === oi;

                const isOptImageVisible =
                  mediaMode === 'always' || activeOptionImagePreviews[oi] !== undefined;
                const optSecondsLeft = activeOptionImagePreviews[oi] || 10;

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
                    className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer touch-manipulation ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </div>

                    <div className="flex-1 text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed min-w-0 font-normal break-words">
                      <div className="cbt-rendered-content" dangerouslySetInnerHTML={{ __html: optItem.html || '...' }} />
                      
                      {/* Attached Option Image with 10s on-demand render */}
                      {optItem.imgSrc && (
                        <div className="mt-2.5" onClick={e => e.stopPropagation()}>
                          {isOptImageVisible ? (
                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 inline-flex flex-col items-start gap-1 max-w-full">
                              <img
                                src={optItem.imgSrc}
                                alt={`Option ${String.fromCharCode(65 + oi)}`}
                                className="max-h-[160px] object-contain rounded-lg"
                              />
                              {mediaMode === 'on-demand' && (
                                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                                  <span className="text-amber-400 font-bold flex items-center gap-1">
                                    <Clock size={11} /> {optSecondsLeft}s
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleOptionImagePreview(oi)}
                                    className="text-slate-400 hover:text-white underline"
                                  >
                                    Hide
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleOptionImagePreview(oi)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600"
                            >
                              <ImageIcon size={13} className="text-blue-500" />
                              <span>View Option Image ({optItem.imgSize}) &bull; 10s</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* NAT Numerical Answer Simulation */
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
                <Hash size={18} className="text-blue-500" />
                <span>Candidate Virtual Numpad Simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={natAnswer}
                  onChange={e => setNatAnswer(e.target.value)}
                  placeholder="Enter candidate value..."
                  className="px-4 py-2.5 text-base sm:text-lg font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none w-full max-w-xs"
                />
                {question.correctNat && (
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Key: {question.correctNat}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Explanation if any */}
          {processedExp && (
            <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-amber-600 dark:text-amber-400">
                <Lightbulb size={18} />
                <span>Solution / Explanation</span>
              </div>
              <div
                className="cbt-rendered-content text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50"
                dangerouslySetInnerHTML={{ __html: processedExp }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={lightboxSrc}
              alt="Enlarged View"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-slate-800"
            />
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default QuestionLivePreview;
