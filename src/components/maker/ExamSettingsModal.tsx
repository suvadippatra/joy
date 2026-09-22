import React, { useState, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Settings,
  Clock,
  Type,
  Code,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
  BookOpen,
  Volume2,
  Upload,
  Play,
  Pause
} from 'lucide-react';
import { AppState, Constant, ExamAudio, defaultRules, defaultConstants } from '../../types/cbtMaker';

interface ExamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onSave: (updated: Partial<AppState>) => void;
  onResetDraft?: () => void;
  onLoadDemo?: () => void;
}

type TabType = 'EXAM_INFO' | 'RULES_DATA_AUDIO';

function AudioPickerField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isBase64 = value.startsWith('data:audio');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePlay = () => {
    if (!value) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(value);
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = value;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error('Audio play error:', e);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {value && (
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
              isBase64
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
            }`}
          >
            {isBase64 ? 'Base64 Audio' : 'Web URL'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste URL or select audio file..."
          className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none truncate"
        />

        <label className="cursor-pointer px-2 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0 flex items-center gap-1 border border-slate-200 dark:border-slate-700">
          <Upload size={13} className="text-blue-500" />
          <span>Pick File</span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {value && (
          <>
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shrink-0"
              title={isPlaying ? 'Pause' : 'Test Play Sound'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setIsPlaying(false);
                onChange('');
              }}
              className="p-1 rounded-xl text-slate-400 hover:text-red-500 shrink-0"
              title="Clear Audio"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ExamSettingsModal({
  isOpen,
  onClose,
  appState,
  onSave,
  onResetDraft,
  onLoadDemo
}: ExamSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('EXAM_INFO');

  // Form State
  const [agencyName, setAgencyName] = useState(appState.agencyName || '');
  const [examTitle, setExamTitle] = useState(appState.examTitle || '');
  const [examSubtitle, setExamSubtitle] = useState(appState.examSubtitle || '');
  const [duration, setDuration] = useState(appState.duration || 90);
  const [timerMode, setTimerMode] = useState<'COUNTDOWN' | 'STOPWATCH'>(appState.timerMode || 'COUNTDOWN');
  const [fontName, setFontName] = useState(appState.fontName || "'KaTeX_Main', serif");
  const [previewTableFontSize, setPreviewTableFontSize] = useState<number>(appState.previewTableFontSize || 100);
  const [questionViewMode, setQuestionViewMode] = useState<'SINGLE' | 'CONTINUOUS'>(appState.questionViewMode || 'SINGLE');
  const [mathMode, setMathMode] = useState<'LATEX' | 'HTML'>(appState.mathMode || 'LATEX');
  const [renderEngine, setRenderEngine] = useState<'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE'>(
    appState.renderEngine || 'KATEX_LOCAL'
  );
  const [rules, setRules] = useState<string[]>(appState.rules || [...defaultRules]);
  const [constants, setConstants] = useState<Constant[]>(appState.constants || [...defaultConstants]);
  const [audio, setAudio] = useState<ExamAudio>(appState.audio || { bg: '', start: '', submit: '' });

  // Confirmation states for quick clean / demo
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      agencyName,
      examTitle: examTitle.trim() || 'New CBT Test',
      examSubtitle,
      duration: Math.max(1, Number(duration) || 90),
      timerMode,
      fontName,
      previewTableFontSize,
      questionViewMode,
      mathMode,
      renderEngine,
      rules: rules.filter(r => r.trim() !== ''),
      constants: constants.filter(c => c.name.trim() !== ''),
      audio
    });
    onClose();
  };

  const handleAddConstant = () => {
    setConstants(prev => [{ name: '', value: '' }, ...prev]);
  };

  const handleRemoveConstant = (index: number) => {
    setConstants(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    setRules(prev => [...prev, '']);
  };

  const handleRemoveRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 animate-in fade-in duration-100"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-[96vw] sm:w-full max-w-2xl max-h-[88vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
              <Settings size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                Exam Configuration
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Configure timing, engines, candidate instructions, and audio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Equal Length Top Segmented Tab Control */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('EXAM_INFO')}
              className={`py-2 px-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
                activeTab === 'EXAM_INFO'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sliders size={14} className="shrink-0" />
              <span>Info & Math</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RULES_DATA_AUDIO')}
              className={`py-2 px-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
                activeTab === 'RULES_DATA_AUDIO'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} className="shrink-0" />
              <span>Rules, Data & Audio</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
          {/* TAB 1: INFO & MATH */}
          {activeTab === 'EXAM_INFO' && (
            <div className="space-y-4">
              {/* Exam Header Details */}
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Exam Header Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={e => setExamTitle(e.target.value)}
                      placeholder="e.g. NEET UG Full Mock Test 2026"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Agency / Organization
                    </label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={e => setAgencyName(e.target.value)}
                      placeholder="e.g. National Testing Agency"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subtitle / Disciplines
                    </label>
                    <input
                      type="text"
                      value={examSubtitle}
                      onChange={e => setExamSubtitle(e.target.value)}
                      placeholder="e.g. Physics, Chemistry, Botany & Zoology"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Compact Duration & Timer Row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Timer & Duration
                </h3>

                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Duration:
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-mono font-bold text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">mins</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTimerMode('COUNTDOWN')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        timerMode === 'COUNTDOWN'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                          : 'text-slate-500'
                      }`}
                    >
                      Countdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerMode('STOPWATCH')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        timerMode === 'STOPWATCH'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                          : 'text-slate-500'
                      }`}
                    >
                      Stopwatch
                    </button>
                  </div>
                </div>
              </div>

              {/* Both Engines Side-by-Side Grid (No Vertical Stacking on Mobile Landscape / Tablet) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Math Rendering Engine
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => {
                      setMathMode('LATEX');
                      setRenderEngine('KATEX_LOCAL');
                      setFontName("'KaTeX_Main', serif");
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-full ${
                      mathMode === 'LATEX'
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          <Code size={15} />
                          <span>LaTeX KaTeX</span>
                        </div>
                        {mathMode === 'LATEX' && <CheckCircle2 size={15} className="text-blue-600" />}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug">
                        Fractions ($\frac&#123;a&#125;&#123;b&#125;$), radicals, vectors.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setMathMode('HTML');
                      setRenderEngine('HTML_FALLBACK');
                      setFontName('system-ui, -apple-system, sans-serif');
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-full ${
                      mathMode === 'HTML'
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <FileText size={15} />
                          <span>Pure HTML</span>
                        </div>
                        {mathMode === 'HTML' && <CheckCircle2 size={15} className="text-emerald-600" />}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug">
                        Standard HTML tags (&lt;sub&gt;, &lt;sup&gt;). Fast & light.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Question Typography Font
                    </label>
                    <select
                      value={fontName}
                      onChange={e => setFontName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="'KaTeX_Main', serif">
                        KaTeX Computer Modern Serif (JEE/NEET Standard)
                      </option>
                      <option value="'KaTeX_Math', 'KaTeX_Main', serif">
                        KaTeX Math Italic / Academic Serif
                      </option>
                      <option value="system-ui, -apple-system, sans-serif">
                        Clean System Sans-Serif (Modern High-Readability)
                      </option>
                      <option value="'Times New Roman', serif">
                        Classic Times Serif (Traditional Academic)
                      </option>
                      <option value="'Courier New', monospace">
                        Monospace / Code Style
                      </option>
                    </select>
                  </div>

                  {/* Question Layout View (Portrait & Mobile Mode) */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Portrait & Mobile Question View
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {questionViewMode === 'CONTINUOUS' ? 'Continuous Stream' : 'Single Question'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuestionViewMode('SINGLE')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left ${
                          questionViewMode === 'SINGLE'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>1-at-a-time Focus</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 ${questionViewMode === 'SINGLE' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Traditional CBT pagination with Next/Prev
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuestionViewMode('CONTINUOUS')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left ${
                          questionViewMode === 'CONTINUOUS'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>Continuous Stream</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 ${questionViewMode === 'CONTINUOUS' ? 'text-blue-100' : 'text-slate-500'}`}>
                          All questions in section stacked top-to-bottom
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Preview Content Font Zoom */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Preview Font & Content Zoom (Text, Math & Tables)
                      </label>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {previewTableFontSize}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={160}
                      step={5}
                      value={previewTableFontSize}
                      onChange={e => setPreviewTableFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Scales whole questions, inline KaTeX math formulas, options, and tables proportionally in the live preview.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cleaning & Demo Action Buttons included directly inside Info & Math */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Quick Reset & Sample Data
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {onResetDraft && (
                    <div>
                      {showCleanConfirm ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onResetDraft();
                              setShowCleanConfirm(false);
                              onClose();
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                          >
                            Confirm Clean
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCleanConfirm(false)}
                            className="py-1.5 px-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCleanConfirm(true)}
                          className="w-full py-1.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={13} />
                          <span>Clean Draft Test</span>
                        </button>
                      )}
                    </div>
                  )}

                  {onLoadDemo && (
                    <div>
                      {showDemoConfirm ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadDemo();
                              setShowDemoConfirm(false);
                              onClose();
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                          >
                            Confirm Load
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDemoConfirm(false)}
                            className="py-1.5 px-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDemoConfirm(true)}
                          className="w-full py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles size={13} />
                          <span>Load Sample CBT Demo</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RULES, CONSTANTS & AUDIO */}
          {activeTab === 'RULES_DATA_AUDIO' && (
            <div className="space-y-4">
              {/* Rules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Candidate Instructions ({rules.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold"
                  >
                    <Plus size={12} />
                    <span>Add Rule</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {rules.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4 text-right">{i + 1}.</span>
                      <input
                        type="text"
                        value={r}
                        onChange={e => {
                          const updated = [...rules];
                          updated[i] = e.target.value;
                          setRules(updated);
                        }}
                        className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(i)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Constants */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Physical Constants Sheet ({constants.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddConstant}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold"
                  >
                    <Plus size={12} />
                    <span>Add Constant</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {constants.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={e => {
                          const updated = [...constants];
                          updated[i].name = e.target.value;
                          setConstants(updated);
                        }}
                        placeholder="Name"
                        className="w-1/2 px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={c.value}
                        onChange={e => {
                          const updated = [...constants];
                          updated[i].value = e.target.value;
                          setConstants(updated);
                        }}
                        placeholder="Value"
                        className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveConstant(i)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Settings with Base64 File Upload & Test Play */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Volume2 size={13} className="text-blue-500" />
                  <span>Exam Audio & Base64 Sound Chimes</span>
                </h3>

                <div className="space-y-3">
                  <AudioPickerField
                    label="Background Ambient Audio (Optional)"
                    value={audio.bg || ''}
                    onChange={val => setAudio(prev => ({ ...prev, bg: val }))}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AudioPickerField
                      label="Start Exam Chime"
                      value={audio.start || ''}
                      onChange={val => setAudio(prev => ({ ...prev, start: val }))}
                    />
                    <AudioPickerField
                      label="Submit Exam Chime"
                      value={audio.submit || ''}
                      onChange={val => setAudio(prev => ({ ...prev, submit: val }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default memo(ExamSettingsModal);
