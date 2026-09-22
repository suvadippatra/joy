import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Check,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  ChevronDown,
  AlertTriangle,
  Lightbulb,
  Hash,
  Image as ImageIcon,
  Edit3,
  ListFilter,
  Eye
} from 'lucide-react';
import { Question, Section } from '../../types/cbtMaker';
import { formatContent } from '../../utils/cbtCompiler';
import { formatDataUrlSize } from '../../utils/imageOptimizer';

interface QuestionLivePreviewProps {
  question: Question | null;
  questionIndex: number;
  totalQuestions?: number;
  section: Section;
  allSections?: Section[];
  allQuestionsInSection?: Question[];
  questionViewMode?: 'SINGLE' | 'CONTINUOUS';
  onToggleViewMode?: () => void;
  onSelectQuestionIndex?: (idx: number) => void;
  onEditQuestion?: (idx: number) => void;
  onSelectSection?: (sectionName: string) => void;
  onPrevQuestion?: () => void;
  onNextQuestion?: () => void;
  fontName: string;
  previewTableFontSize?: number;
  mathMode: 'LATEX' | 'HTML';
  renderEngine: 'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE';
  layoutMode?: 'split' | 'editor' | 'preview';
}

interface SingleCardProps {
  q: Question;
  idx: number;
  isActive: boolean;
  section: Section;
  fontName: string;
  mathMode: 'LATEX' | 'HTML';
  renderEngine: 'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE';
  mediaMode: 'on-demand' | 'always';
  onSelectQuestion?: () => void;
  onEditQuestion?: () => void;
  onOpenLightbox: (src: string) => void;
}

const MemoizedQuestionCard = memo(function MemoizedQuestionCard({
  q,
  idx,
  isActive,
  section,
  fontName,
  mathMode,
  renderEngine,
  mediaMode,
  onSelectQuestion,
  onEditQuestion,
  onOpenLightbox
}: SingleCardProps) {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [selectedMsq, setSelectedMsq] = useState<number[]>([]);
  const [natVal, setNatVal] = useState<string>('');
  const [showImg, setShowImg] = useState<boolean>(mediaMode === 'always');
  const [imgSecondsLeft, setImgSecondsLeft] = useState<number>(10);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (mediaMode === 'always') {
      setShowImg(true);
      return;
    }
    if (showImg) {
      setImgSecondsLeft(10);
      timerRef.current = setInterval(() => {
        setImgSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setShowImg(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showImg, mediaMode]);

  const processedText = useMemo(() => {
    return q.text ? formatContent(q.text, renderEngine, mathMode, true) : '';
  }, [q.text, renderEngine, mathMode]);

  const processedTable = useMemo(() => {
    return q.table ? formatContent(q.table, renderEngine, mathMode, true) : '';
  }, [q.table, renderEngine, mathMode]);

  const processedExp = useMemo(() => {
    return q.explanation ? formatContent(q.explanation, renderEngine, mathMode, true) : '';
  }, [q.explanation, renderEngine, mathMode]);

  const processedOptions = useMemo(() => {
    if (!q.options) return [];
    return q.options.map(opt => {
      let optText = opt || '';
      let optImgSrc = '';
      const imgMatch = optText.match(/\|\|IMG:([\s\S]+?)\|\|/);
      if (imgMatch) {
        optImgSrc = imgMatch[1].trim();
        optText = optText.replace(/\|\|IMG:([\s\S]+?)\|\|/g, '').trim();
      }
      return {
        html: formatContent(optText, renderEngine, mathMode, true),
        imgSrc: optImgSrc,
        imgSize: optImgSrc ? formatDataUrlSize(optImgSrc) : ''
      };
    });
  }, [q.options, renderEngine, mathMode]);

  const qMarks = typeof q.marksCorrect === 'number' && !isNaN(q.marksCorrect) ? q.marksCorrect : section.marks;
  const qNeg = typeof q.marksWrong === 'number' && !isNaN(q.marksWrong) ? q.marksWrong : (q.type === 'NAT' ? 0 : section.negative);
  const typeBadgeLabel = q.type === 'MCQ' ? 'SCQ' : q.type === 'MSQ' ? 'MCQ' : 'NAT';

  return (
    <div
      id={`preview-question-${idx}`}
      onClick={onSelectQuestion}
      className={`transition-all duration-200 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border p-5 sm:p-7 w-full scroll-mt-14 ${
        isActive
          ? 'border-blue-500/80 ring-2 ring-blue-500/20 shadow-md dark:border-blue-500/80'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100">
            Question {idx + 1}
          </span>
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/40">
            {typeBadgeLabel}
          </span>
          {isActive && (
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-600 text-white">
              Current
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <span className="text-emerald-600 dark:text-emerald-400">+{qMarks}</span>
            <span className="text-red-500 dark:text-red-400">-{qNeg}</span>
          </div>
          {onEditQuestion && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onEditQuestion();
              }}
              title="Edit this question"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <Edit3 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Question Statement Text */}
      <div
        className="cbt-rendered-content text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-text mb-4 font-medium"
        dangerouslySetInnerHTML={{
          __html: processedText || '<span class="text-slate-400 italic">No question statement entered yet...</span>'
        }}
      />

      {/* Question Diagram */}
      {q.image && (
        <div className="my-4">
          {q.image === 'PLACEHOLDER' ? (
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex items-center gap-3 text-amber-800 dark:text-amber-200">
              <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-extrabold block">Diagram Image Required</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-normal">
                  Contains an <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">[IMAGE]</code> placeholder.
                </span>
              </div>
            </div>
          ) : mediaMode === 'always' || showImg ? (
            <div className="relative inline-flex flex-col items-start gap-1 max-w-full rounded-xl p-2 bg-slate-950 border border-slate-800 group">
              <div className="relative">
                <img
                  src={q.image}
                  alt="Question Diagram"
                  className="max-h-[300px] w-auto object-contain cursor-pointer rounded-lg"
                  onClick={() => onOpenLightbox(q.image || '')}
                />
                <div
                  onClick={() => onOpenLightbox(q.image || '')}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold flex items-center gap-1"
                >
                  <ZoomIn size={14} />
                  <span>Zoom</span>
                </div>
              </div>
              {mediaMode === 'on-demand' && (
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock size={11} /> Auto-hiding in {imgSecondsLeft}s
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImg(false)}
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
              onClick={() => setShowImg(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700"
            >
              <ImageIcon size={16} className="text-blue-500" />
              <span>Click to view Question Diagram &bull; 10s Memory Saver</span>
            </button>
          )}
        </div>
      )}

      {/* Table if any */}
      {processedTable && (
        <div
          className="cbt-rendered-content my-4 overflow-x-auto max-w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-950/40 scrollbar-thin"
          dangerouslySetInnerHTML={{ __html: processedTable }}
        />
      )}

      {/* Options for MCQ / MSQ */}
      {q.type !== 'NAT' ? (
        <div className="space-y-3 mt-5">
          {processedOptions.map((optItem, oi) => {
            const isCorrectAnswerKey =
              q.type === 'MCQ'
                ? q.correct === oi
                : Array.isArray(q.correct)
                ? q.correct.includes(oi)
                : q.correct === oi;

            const isUserSelected =
              q.type === 'MCQ'
                ? selectedOpt === oi
                : selectedMsq.includes(oi);

            return (
              <div
                key={oi}
                onClick={() => {
                  if (q.type === 'MCQ') {
                    setSelectedOpt(selectedOpt === oi ? null : oi);
                  } else {
                    setSelectedMsq(prev =>
                      prev.includes(oi) ? prev.filter(x => x !== oi) : [...prev, oi]
                    );
                  }
                }}
                className={`flex items-start gap-3.5 p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                  isUserSelected
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5 border transition-colors ${
                    isUserSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isUserSelected ? <Check size={14} /> : String.fromCharCode(65 + oi)}
                </div>

                <div className="flex-1 text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed min-w-0 font-normal break-words">
                  <div
                    className="cbt-rendered-content whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: optItem.html || '...' }}
                  />

                  {optItem.imgSrc && (
                    <div className="mt-2" onClick={e => e.stopPropagation()}>
                      <img
                        src={optItem.imgSrc}
                        alt={`Option ${String.fromCharCode(65 + oi)}`}
                        className="max-h-[140px] object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  )}
                </div>

                {isCorrectAnswerKey && (
                  <span className="shrink-0 text-[10px] sm:text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                    Key
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* NAT Virtual Input */
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
            <Hash size={18} className="text-blue-500" />
            <span>Virtual Numpad Answer Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={natVal}
              onChange={e => setNatVal(e.target.value)}
              placeholder="Candidate numeric answer..."
              className="px-4 py-2.5 text-base sm:text-lg font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none w-full max-w-xs"
            />
            {q.correctNat && (
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                Key: {q.correctNat}
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
  );
});

const QuestionLivePreview = memo(function QuestionLivePreview({
  question,
  questionIndex,
  totalQuestions = 1,
  section,
  allSections = [],
  allQuestionsInSection = [],
  questionViewMode = 'SINGLE',
  onToggleViewMode,
  onSelectQuestionIndex,
  onEditQuestion,
  onSelectSection,
  onPrevQuestion,
  onNextQuestion,
  fontName,
  previewTableFontSize = 100,
  mathMode,
  renderEngine,
  layoutMode = 'preview'
}: QuestionLivePreviewProps) {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [localZoomFactor, setLocalZoomFactor] = useState<number>(1.0);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState<boolean>(false);
  const [mediaMode, setMediaMode] = useState<'on-demand' | 'always'>('on-demand');

  // Unified font zoom scale: combines base preview font setting and local fine-tuner
  const effectiveZoomPercentage = Math.round(
    ((previewTableFontSize || 100) / 100) * localZoomFactor * 100
  );

  const viewportWidthClass =
    viewportMode === 'mobile'
      ? 'w-full max-w-[375px] mx-auto'
      : viewportMode === 'tablet'
      ? 'w-full max-w-[640px] mx-auto'
      : 'w-full max-w-3xl mx-auto';

  // Scroll active question into view when activeQuestionIndex changes in continuous mode
  useEffect(() => {
    if (questionViewMode === 'CONTINUOUS') {
      const el = document.getElementById(`preview-question-${questionIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [questionIndex, questionViewMode]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-100/70 dark:bg-slate-950/60 overflow-hidden border-l border-slate-200/80 dark:border-slate-800">
      
      {/* Top Controls Toolbar (Sleek Single-Line) */}
      <div className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        
        {/* Left: Section Selector & Question Indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          {allSections && allSections.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 transition-colors"
                title="Click to switch Section"
              >
                <Layers size={12} />
                <span>{section.name}</span>
                <ChevronDown size={11} />
              </button>

              {isSectionMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-48 py-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Switch Section
                  </div>
                  {allSections.map(sec => (
                    <button
                      key={sec.name}
                      type="button"
                      onClick={() => {
                        if (onSelectSection) onSelectSection(sec.name);
                        setIsSectionMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors ${
                        sec.name === section.name ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-slate-800/50' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{sec.name}</span>
                      {sec.name === section.name && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/50 dark:border-blue-900/40">
              {section.name}
            </span>
          )}

          {/* Question Index Badge */}
          <span className="text-xs text-slate-600 dark:text-slate-400 font-extrabold font-mono">
            Q{questionIndex + 1}{totalQuestions ? `/${totalQuestions}` : ''}
          </span>

          {/* Prev/Next buttons in single view mode */}
          {questionViewMode === 'SINGLE' && layoutMode === 'preview' && (
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onPrevQuestion}
                disabled={questionIndex <= 0}
                className="p-1 rounded text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                title="Previous Question"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={onNextQuestion}
                disabled={questionIndex >= (totalQuestions || 1) - 1}
                className="p-1 rounded text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                title="Next Question"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Layout Switcher, Zoom Controller, Viewport Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Continuous Stream vs Single Question Toggle Button */}
          {onToggleViewMode && (
            <button
              type="button"
              onClick={onToggleViewMode}
              title={questionViewMode === 'CONTINUOUS' ? 'Switch to Single Question Focus View' : 'Switch to Continuous Top-to-Bottom Stream View'}
              className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-lg border transition-all ${
                questionViewMode === 'CONTINUOUS'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <ListFilter size={12} />
              <span>
                {questionViewMode === 'CONTINUOUS' ? 'Stream' : 'Single'}
              </span>
            </button>
          )}

          {/* Unified Content & Font Zoom Controller */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setLocalZoomFactor(prev => Math.max(0.7, prev - 0.1))}
              title="Decrease Preview Content & Font Size"
              className="p-0.5 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomOut size={12} />
            </button>
            <span
              title="Scales question text, formulas, options & tables"
              className="px-1 select-none text-[11px] font-mono"
            >
              {effectiveZoomPercentage}%
            </span>
            <button
              type="button"
              onClick={() => setLocalZoomFactor(prev => Math.min(1.6, prev + 0.1))}
              title="Increase Preview Content & Font Size"
              className="p-0.5 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          {/* Media Load Saver Toggle */}
          <button
            type="button"
            onClick={() => setMediaMode(mediaMode === 'on-demand' ? 'always' : 'on-demand')}
            title="Switch between 10s On-Demand Diagram Render and Always Visible"
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center"
          >
            <Clock size={12} className={mediaMode === 'on-demand' ? 'text-amber-500' : 'text-slate-400'} />
          </button>

          {/* Viewport switcher */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              title="Desktop View (Full Width)"
              className={`p-1 rounded transition-colors touch-manipulation ${
                viewportMode === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Monitor size={12} />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              title="Tablet View (640px)"
              className={`p-1 rounded transition-colors touch-manipulation ${
                viewportMode === 'tablet'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Tablet size={12} />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              title="Mobile Portrait View (375px)"
              className={`p-1 rounded transition-colors touch-manipulation ${
                viewportMode === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTINUOUS STREAM MODE: Main scroll container */}

      {/* PREVIEW STAGE CONTAINER */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-start w-full">
        <div
          style={{
            fontFamily: fontName,
            fontSize: `${effectiveZoomPercentage}%`
          }}
          className={`${viewportWidthClass} transition-all duration-200 w-full flex flex-col gap-6`}
        >
          {questionViewMode === 'CONTINUOUS' && allQuestionsInSection && allQuestionsInSection.length > 0 ? (
            /* Continuous Top-to-Bottom Question Stream */
            allQuestionsInSection.map((qItem, idx) => (
              <MemoizedQuestionCard
                key={qItem.id || idx}
                q={qItem}
                idx={idx}
                isActive={idx === questionIndex}
                section={section}
                fontName={fontName}
                mathMode={mathMode}
                renderEngine={renderEngine}
                mediaMode={mediaMode}
                onSelectQuestion={() => onSelectQuestionIndex?.(idx)}
                onEditQuestion={() => onEditQuestion?.(idx)}
                onOpenLightbox={src => setLightboxSrc(src)}
              />
            ))
          ) : question ? (
            /* Single Question Focus View */
            <MemoizedQuestionCard
              q={question}
              idx={questionIndex}
              isActive={true}
              section={section}
              fontName={fontName}
              mathMode={mathMode}
              renderEngine={renderEngine}
              mediaMode={mediaMode}
              onEditQuestion={() => onEditQuestion?.(questionIndex)}
              onOpenLightbox={src => setLightboxSrc(src)}
            />
          ) : (
            <div className="h-48 w-full flex items-center justify-center p-8 text-slate-400 text-base font-medium">
              Select or add a question to preview.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Fullscreen Diagram Inspection */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setLightboxSrc(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <img
            src={lightboxSrc}
            alt="Enlarged diagram"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
});

export default QuestionLivePreview;
