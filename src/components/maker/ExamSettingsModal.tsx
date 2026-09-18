import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Plus, Trash2, Volume2, Check, RotateCcw, AlertTriangle, RefreshCw, Code, FileText, Sparkles, Layers } from 'lucide-react';
import { AppState, Constant, defaultAppState } from '../../types/cbtMaker';

interface ExamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onUpdateState: (newState: Partial<AppState>) => void;
  onResetDraft?: () => void;
  onLoadDemo?: () => void;
}

export default function ExamSettingsModal({
  isOpen,
  onClose,
  appState,
  onUpdateState,
  onResetDraft,
  onLoadDemo
}: ExamSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ENGINES' | 'CONSTANTS' | 'RULES' | 'AUDIO' | 'MANAGEMENT'>('GENERAL');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  const [agencyName, setAgencyName] = useState(appState.agencyName || '');
  const [examTitle, setExamTitle] = useState(appState.examTitle || '');
  const [examSubtitle, setExamSubtitle] = useState(appState.examSubtitle || '');
  const [duration, setDuration] = useState(appState.duration || 90);
  const [timerMode, setTimerMode] = useState<'COUNTDOWN' | 'STOPWATCH'>(appState.timerMode || 'COUNTDOWN');
  const [fontName, setFontName] = useState(appState.fontName || "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif");
  const [mathMode, setMathMode] = useState<'LATEX' | 'HTML'>(appState.mathMode || 'LATEX');
  const [renderEngine, setRenderEngine] = useState<'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE'>(appState.renderEngine || 'KATEX_LOCAL');
  const [constants, setConstants] = useState<Constant[]>(appState.constants || []);
  const [rules, setRules] = useState<string[]>(appState.rules || []);
  const [audio, setAudio] = useState(appState.audio || { bg: '', start: '', submit: '' });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateState({
      agencyName,
      examTitle,
      examSubtitle,
      duration: Number(duration) || 90,
      timerMode,
      fontName,
      mathMode,
      renderEngine,
      constants,
      rules,
      audio
    });
    onClose();
  };

  const handleAddConstant = () => {
    setConstants([...constants, { name: '', value: '' }]);
  };

  const handleRemoveConstant = (index: number) => {
    setConstants(constants.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    setRules([...rules, '']);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Fixed Height Modal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl flex flex-col h-[85vh] max-h-[660px] min-h-[500px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">Exam Global Settings</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure parameters, dual rendering engines, fonts, rules, and reset options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-3 sm:gap-4 overflow-x-auto text-xs sm:text-sm shrink-0 bg-white dark:bg-slate-900">
          {[
            { id: 'GENERAL', label: 'General & Timings' },
            { id: 'ENGINES', label: 'Engine Archetypes' },
            { id: 'CONSTANTS', label: `Constants (${constants.length})` },
            { id: 'RULES', label: `Instructions (${rules.length})` },
            { id: 'AUDIO', label: 'Audio & Chimes' },
            { id: 'MANAGEMENT', label: 'Clean / Reset' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-2.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'GENERAL' && (
            <div className="space-y-4 text-sm">
              {/* Row 1: Agency & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Exam Agency / Organization
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={e => setAgencyName(e.target.value)}
                    placeholder="e.g. National Testing Agency (NTA)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    placeholder="e.g. NEET UG Full Mock Test"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Subtitle & Font Family */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subtitle / Topics Covered
                  </label>
                  <input
                    type="text"
                    value={examSubtitle}
                    onChange={e => setExamSubtitle(e.target.value)}
                    placeholder="e.g. Physics, Chemistry, Botany & Zoology"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Font Family
                  </label>
                  <select
                    value={fontName}
                    onChange={e => setFontName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif">KaTeX Computer Modern Serif (Default Standard)</option>
                    <option value="system-ui, -apple-system, sans-serif">Clean System Sans-Serif</option>
                    <option value="'Times New Roman', serif">Classic Times Serif</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Duration & Timer Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Exam Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    min="1"
                    placeholder="180"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Timer Mode
                  </label>
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTimerMode('COUNTDOWN')}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        timerMode === 'COUNTDOWN'
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Countdown Clock
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerMode('STOPWATCH')}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        timerMode === 'STOPWATCH'
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Stopwatch Count-Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DUAL ENGINE ARCHETYPES (Planned Visual & Behavioral Differences) */}
          {activeTab === 'ENGINES' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Select Engine UI & Parsing Mode
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each engine provides a dedicated layout, font rendering profile, and syntax handling tailored for different subject disciplines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Engine 1: LaTeX / KaTeX Academic Engine */}
                <div
                  onClick={() => {
                    setMathMode('LATEX');
                    setRenderEngine('KATEX_LOCAL');
                    setFontName("'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif");
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    mathMode === 'LATEX'
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Code size={18} />
                      <span className="font-bold text-sm">LaTeX KaTeX Engine</span>
                    </div>
                    {mathMode === 'LATEX' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Academic / JEE / NEET Math Typography
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                      <li>Renders true vertical vinculum fractions ($\frac&#123;a&#125;&#123;b&#125;$) and radicals ($\sqrt&#123;x&#125;$)</li>
                      <li>Uses KaTeX Computer Modern serif fonts</li>
                      <li>Best for Physics, Chemistry & Mathematics</li>
                      <li>Standard $...$ inline and $$...$$ display math</li>
                    </ul>
                  </div>
                </div>

                {/* Engine 2: Pure HTML / MathML Engine */}
                <div
                  onClick={() => {
                    setMathMode('HTML');
                    setRenderEngine('HTML_FALLBACK');
                    setFontName("system-ui, -apple-system, sans-serif");
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    mathMode === 'HTML'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <FileText size={18} />
                      <span className="font-bold text-sm">Pure HTML & Unicode Engine</span>
                    </div>
                    {mathMode === 'HTML' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Modern Accessible & High-Legibility Reader
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                      <li>Native HTML tags (&lt;sub&gt;, &lt;sup&gt;, &lt;b&gt;, &lt;table&gt;)</li>
                      <li>Zero KaTeX script overhead; instant 100% offline rendering</li>
                      <li>Best for Biology, Botany, Zoology & Medical theory</li>
                      <li>High contrast, clean system sans-serif typography</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CONSTANTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Physical & Chemical Constants</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Available to test takers via on-screen Constants sheet</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddConstant}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Constant</span>
                </button>
              </div>

              {constants.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                  No constants defined. Click "+ Add Constant" to add values like Speed of Light, Planck's constant, etc.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                        placeholder="Name (e.g. c)"
                        className="w-1/3 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={c.value}
                        onChange={e => {
                          const updated = [...constants];
                          updated[i].value = e.target.value;
                          setConstants(updated);
                        }}
                        placeholder="Value (e.g. 3.00 × 10^8 m/s)"
                        className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveConstant(i)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'RULES' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Exam Instructions & Guidelines</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Displayed in the pre-exam candidate briefing page</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Rule</span>
                </button>
              </div>

              {rules.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                  No custom rules set.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {rules.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}.</span>
                      <input
                        type="text"
                        value={r}
                        onChange={e => {
                          const updated = [...rules];
                          updated[i] = e.target.value;
                          setRules(updated);
                        }}
                        placeholder={`Rule ${i + 1}`}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(i)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'AUDIO' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                Optional ambient soundtrack and sound effects embedded directly into the standalone CBT.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ambient Background Music (Base64 audio string or URL)
                  </label>
                  <input
                    type="text"
                    value={audio.bg}
                    onChange={e => setAudio({ ...audio, bg: e.target.value })}
                    placeholder="data:audio/mp3;base64,... or https://example.com/ambient.mp3"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Start Chime
                  </label>
                  <input
                    type="text"
                    value={audio.start}
                    onChange={e => setAudio({ ...audio, start: e.target.value })}
                    placeholder="data:audio/mp3;base64,... (Optional)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Submission Chime
                  </label>
                  <input
                    type="text"
                    value={audio.submit}
                    onChange={e => setAudio({ ...audio, submit: e.target.value })}
                    placeholder="data:audio/mp3;base64,... (Optional)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED CLEAN & RESET MANAGEMENT TAB INSIDE SETTINGS POPUP */}
          {activeTab === 'MANAGEMENT' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Draft & Test Management
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clean current test content, reset your workspace, or load sample demo test papers.
                </p>
              </div>

              {/* Clean Current Test Card */}
              {onResetDraft && (
                <div className="p-4 sm:p-5 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/60 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-red-700 dark:text-red-300">
                        Clean Current Test
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Removes everything from the CBT editor, leaving 1 default section with 1 blank question box. This cannot be undone.
                      </p>
                    </div>
                  </div>

                  {showResetConfirm ? (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onResetDraft();
                          setShowResetConfirm(false);
                          onClose();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                      >
                        Yes, Clean Current Test
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      <span>Clean Current Test</span>
                    </button>
                  )}
                </div>
              )}

              {/* Load Demo Showcase Test */}
              {onLoadDemo && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-blue-700 dark:text-blue-300">
                        Load Sample Demo CBT
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Replaces current draft with a full 3-section demonstration exam containing math formulas, biology diagrams, chemistry equations, and questions.
                      </p>
                    </div>
                  </div>

                  {showDemoConfirm ? (
                    <div className="flex items-center gap-3 pt-2">
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
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} />
                      <span>Load Sample Demo CBT</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
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
