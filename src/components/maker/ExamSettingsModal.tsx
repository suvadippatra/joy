import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Settings,
  Clock,
  Type,
  Code,
  FileText,
  Music,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
  BookOpen,
  AlertTriangle
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

type TabType = 'GENERAL' | 'ENGINES' | 'CONSTANTS' | 'RULES' | 'AUDIO' | 'RESET';

export default function ExamSettingsModal({
  isOpen,
  onClose,
  appState,
  onSave,
  onResetDraft,
  onLoadDemo
}: ExamSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');

  // Form State
  const [agencyName, setAgencyName] = useState(appState.agencyName || '');
  const [examTitle, setExamTitle] = useState(appState.examTitle || '');
  const [examSubtitle, setExamSubtitle] = useState(appState.examSubtitle || '');
  const [duration, setDuration] = useState(appState.duration || 90);
  const [timerMode, setTimerMode] = useState<'COUNTDOWN' | 'STOPWATCH'>(appState.timerMode || 'COUNTDOWN');
  const [fontName, setFontName] = useState(appState.fontName || "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif");
  const [mathMode, setMathMode] = useState<'LATEX' | 'HTML'>(appState.mathMode || 'LATEX');
  const [renderEngine, setRenderEngine] = useState<'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE'>(
    appState.renderEngine || 'KATEX_LOCAL'
  );
  const [rules, setRules] = useState<string[]>(appState.rules || [...defaultRules]);
  const [constants, setConstants] = useState<Constant[]>(appState.constants || [...defaultConstants]);
  const [audio, setAudio] = useState<ExamAudio>(appState.audio || { bg: '', start: '', submit: '' });

  // Confirmation states
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [constantsFilter, setConstantsFilter] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      agencyName,
      examTitle: examTitle.trim() || 'New CBT Test',
      examSubtitle,
      duration: Math.max(1, Number(duration) || 90),
      timerMode,
      fontName,
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

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'GENERAL', label: 'Exam Info & Time', icon: <Sliders size={17} /> },
    { id: 'ENGINES', label: 'Math Engine & Fonts', icon: <Code size={17} /> },
    { id: 'CONSTANTS', label: 'Constants Sheet', icon: <Type size={17} />, badge: `${constants.length}` },
    { id: 'RULES', label: 'Instructions & Rules', icon: <BookOpen size={17} />, badge: `${rules.length}` },
    { id: 'AUDIO', label: 'Audio & Chimes', icon: <Music size={17} /> },
    { id: 'RESET', label: 'Clean / Load Demo', icon: <RefreshCw size={17} /> }
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl h-[90vh] max-h-[640px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Exam Configuration & Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure exam timing, typography, math engines, and constants.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Sidebar + Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-2 sm:p-3 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 md:w-full text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900 space-y-5">
            {/* TAB 1: GENERAL & TIMING */}
            {activeTab === 'GENERAL' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Exam Identity & Header Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    These appear on the title bar, briefing screen, and candidate answer sheets.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={e => setExamTitle(e.target.value)}
                      placeholder="e.g. NEET UG Full Mock Test 2026"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Agency / Organization
                    </label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={e => setAgencyName(e.target.value)}
                      placeholder="e.g. National Testing Agency"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Timing & Clock Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Duration (Minutes)
                      </label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="number"
                          min={1}
                          value={duration}
                          onChange={e => setDuration(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Timer Display Mode
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setTimerMode('COUNTDOWN')}
                          className={`py-1.5 rounded-lg transition-all ${
                            timerMode === 'COUNTDOWN'
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Countdown
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimerMode('STOPWATCH')}
                          className={`py-1.5 rounded-lg transition-all ${
                            timerMode === 'STOPWATCH'
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Stopwatch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MATH ENGINES & FONTS */}
            {activeTab === 'ENGINES' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Dual Rendering Engine
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the rendering architecture suited for your test material.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: LaTeX KaTeX Engine */}
                  <div
                    onClick={() => {
                      setMathMode('LATEX');
                      setRenderEngine('KATEX_LOCAL');
                      setFontName("'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif");
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      mathMode === 'LATEX'
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Code size={18} />
                        <span className="font-extrabold text-sm">LaTeX KaTeX Engine</span>
                      </div>
                      {mathMode === 'LATEX' && (
                        <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      True vertical vinculum fractions ($\frac&#123;a&#125;&#123;b&#125;$), integral signs, square roots, and serif typography.
                    </p>
                    <div className="mt-2.5 inline-block px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                      Recommended for JEE & Physics / Chemistry
                    </div>
                  </div>

                  {/* Option 2: Pure HTML Engine */}
                  <div
                    onClick={() => {
                      setMathMode('HTML');
                      setRenderEngine('HTML_FALLBACK');
                      setFontName("system-ui, -apple-system, sans-serif");
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      mathMode === 'HTML'
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <FileText size={18} />
                        <span className="font-extrabold text-sm">Pure HTML & Unicode</span>
                      </div>
                      {mathMode === 'HTML' && (
                        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Fast, lightweight rendering with standard HTML tags (&lt;sub&gt;, &lt;sup&gt;, tables) and clean sans-serif typography.
                    </p>
                    <div className="mt-2.5 inline-block px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                      Recommended for NEET & Biology / Medical
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Font Family
                  </label>
                  <select
                    value={fontName}
                    onChange={e => setFontName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif">
                      KaTeX Computer Modern Serif (JEE/NEET Standard)
                    </option>
                    <option value="system-ui, -apple-system, sans-serif">
                      Clean System Sans-Serif (Modern High-Readability)
                    </option>
                    <option value="'Times New Roman', serif">
                      Classic Times Serif (Traditional Academic)
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 3: CONSTANTS SHEET */}
            {activeTab === 'CONSTANTS' && (
              <div className="space-y-3.5 max-w-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Physical & Chemical Constants Sheet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Displayed on-screen in the candidate's exam reference toolbar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddConstant}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add Constant</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {constants.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No constants defined. Click "+ Add Constant" to create one.
                    </div>
                  ) : (
                    constants.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={c.name}
                          onChange={e => {
                            const updated = [...constants];
                            updated[i].name = e.target.value;
                            setConstants(updated);
                          }}
                          placeholder="Name (e.g. Planck's constant)"
                          className="w-1/2 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={c.value}
                          onChange={e => {
                            const updated = [...constants];
                            updated[i].value = e.target.value;
                            setConstants(updated);
                          }}
                          placeholder="Value (e.g. 6.626 × 10⁻³⁴ J·s)"
                          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveConstant(i)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: RULES & INSTRUCTIONS */}
            {activeTab === 'RULES' && (
              <div className="space-y-3.5 max-w-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Exam Instructions & Rules
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Shown to candidates on the pre-exam briefing screen.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add Rule</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {rules.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No custom rules added.
                    </div>
                  ) : (
                    rules.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={r}
                          onChange={e => {
                            const updated = [...rules];
                            updated[i] = e.target.value;
                            setRules(updated);
                          }}
                          placeholder={`Instruction rule #${i + 1}`}
                          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(i)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: AUDIO */}
            {activeTab === 'AUDIO' && (
              <div className="space-y-4 max-w-2xl text-xs sm:text-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Audio & Sound Effects (Optional)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional background ambiance or sound notifications embedded in the standalone CBT.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ambient Background Music URL or Base64
                    </label>
                    <input
                      type="text"
                      value={audio.bg}
                      onChange={e => setAudio({ ...audio, bg: e.target.value })}
                      placeholder="data:audio/mp3;base64,... or https://example.com/ambient.mp3"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Start Sound
                    </label>
                    <input
                      type="text"
                      value={audio.start}
                      onChange={e => setAudio({ ...audio, start: e.target.value })}
                      placeholder="data:audio/mp3;base64,... (Optional)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Submit Sound
                    </label>
                    <input
                      type="text"
                      value={audio.submit}
                      onChange={e => setAudio({ ...audio, submit: e.target.value })}
                      placeholder="data:audio/mp3;base64,... (Optional)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: DEDICATED CLEAN & RESET TAB (INSIDE SETTINGS POPUP) */}
            {activeTab === 'RESET' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Workspace Actions & Reset
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clean your workspace for a brand new test, or load a sample demo showcase.
                  </p>
                </div>

                {/* Clean Current Test Card */}
                {onResetDraft && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 shrink-0">
                        <Trash2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-red-700 dark:text-red-300">
                          Clean Form (Start Blank Test)
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          Removes all questions and resets to 1 clean default section with 1 blank question ready for editing.
                        </p>
                      </div>
                    </div>

                    {showCleanConfirm ? (
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onResetDraft();
                            setShowCleanConfirm(false);
                            onClose();
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                        >
                          Yes, Clean & Start Fresh
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCleanConfirm(false)}
                          className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCleanConfirm(true)}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        <span>Clean Current Test</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Load Demo Showcase Card */}
                {onLoadDemo && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-blue-700 dark:text-blue-300">
                          Load Sample Demo CBT
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          Loads a rich sample demonstration exam featuring Physics, Chemistry, and Biology questions with LaTeX formulas and tables.
                        </p>
                      </div>
                    </div>

                    {showDemoConfirm ? (
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadDemo();
                            setShowDemoConfirm(false);
                            onClose();
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                        >
                          Confirm & Load Demo
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDemoConfirm(false)}
                          className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDemoConfirm(true)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles size={16} />
                        <span>Load Sample Demo CBT</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
