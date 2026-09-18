import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Plus, Trash2, Volume2, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { AppState, Constant } from '../../types/cbtMaker';

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
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'CONSTANTS' | 'RULES' | 'AUDIO'>('GENERAL');
  const [showResetWarning, setShowResetWarning] = useState(false);

  const [agencyName, setAgencyName] = useState(appState.agencyName || '');
  const [examTitle, setExamTitle] = useState(appState.examTitle || '');
  const [examSubtitle, setExamSubtitle] = useState(appState.examSubtitle || '');
  const [duration, setDuration] = useState(appState.duration || 90);
  const [timerMode, setTimerMode] = useState<'COUNTDOWN' | 'STOPWATCH'>(appState.timerMode || 'COUNTDOWN');
  const [fontName, setFontName] = useState(appState.fontName || "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif");
  const [mathMode, setMathMode] = useState<'LATEX' | 'HTML'>(appState.mathMode || 'LATEX');
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
      {/* Fixed Vertical Height Modal to eliminate jumpy layout and provide comfortable mouse navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl flex flex-col h-[85vh] max-h-[640px] min-h-[500px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">Exam Global Settings</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure parameters, timing, fonts, rules, and constants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-2.5 border-b border-slate-200 dark:border-slate-800 flex gap-4 overflow-x-auto text-xs shrink-0 bg-white dark:bg-slate-900">
          {[
            { id: 'GENERAL', label: 'General & Timings' },
            { id: 'CONSTANTS', label: `Constants (${constants.length})` },
            { id: 'RULES', label: `Exam Instructions (${rules.length})` },
            { id: 'AUDIO', label: 'Audio & Chimes' }
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

        {/* Fixed Scrollable Content Area with 2-Column Responsive Layout */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'GENERAL' && (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Row 1: Agency & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Agency / Organization
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={e => setAgencyName(e.target.value)}
                    placeholder="e.g. National Testing Agency (NTA)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    placeholder="e.g. NEET UG Full Mock Test"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Subtitle & Font Family */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subtitle / Topics Covered
                  </label>
                  <input
                    type="text"
                    value={examSubtitle}
                    onChange={e => setExamSubtitle(e.target.value)}
                    placeholder="e.g. Physics, Chemistry, Botany & Zoology"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Font Family
                  </label>
                  <select
                    value={fontName}
                    onChange={e => setFontName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    min="1"
                    placeholder="180"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Timer Mode
                  </label>
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTimerMode('COUNTDOWN')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
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
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
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

              {/* Row 4: Math Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Math Engine Parser
                  </label>
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMathMode('LATEX')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        mathMode === 'LATEX'
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      LaTeX ($...$)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMathMode('HTML')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        mathMode === 'HTML'
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Standard HTML
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset Draft & Demo loader */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onResetDraft && (
                  <div className="p-3 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Clear Current Test</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">1 Section & 1 Blank Question</p>
                    </div>
                    {showResetWarning ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onResetDraft();
                            setShowResetWarning(false);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetWarning(false)}
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetWarning(true)}
                        className="px-2.5 py-1.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors shrink-0"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                )}

                {onLoadDemo && (
                  <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">Load Demo CBT</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Multi-Section Sample Test</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadDemo();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs shrink-0"
                    >
                      Load Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'CONSTANTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide physical and mathematical constants accessible from the exam header gateway.
                </p>
                <button
                  type="button"
                  onClick={handleAddConstant}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  <Plus size={14} />
                  <span>Add Constant</span>
                </button>
              </div>

              <div className="space-y-2">
                {constants.map((c, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50/50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Name (e.g. Planck's constant h)"
                        value={c.name}
                        onChange={e => {
                          const updated = [...constants];
                          updated[i].name = e.target.value;
                          setConstants(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Value (e.g. 6.626 × 10⁻³⁴ J·s)"
                        value={c.value}
                        onChange={e => {
                          const updated = [...constants];
                          updated[i].value = e.target.value;
                          setConstants(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveConstant(i)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'RULES' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instructions displayed in the exam portal before candidates start.
                </p>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  <Plus size={14} />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-2">
                {rules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}.</span>
                    <input
                      type="text"
                      value={r}
                      onChange={e => {
                        const updated = [...rules];
                        updated[i] = e.target.value;
                        setRules(updated);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(i)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'AUDIO' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Volume2 size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs">Audio tracks can be direct HTTP audio links or base64 data URIs. Leave blank to disable.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Exam Chime
                  </label>
                  <input
                    type="text"
                    value={audio.start}
                    onChange={e => setAudio({ ...audio, start: e.target.value })}
                    placeholder="data:audio/mp3;base64,... or URL"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Submit Exam Audio
                  </label>
                  <input
                    type="text"
                    value={audio.submit}
                    onChange={e => setAudio({ ...audio, submit: e.target.value })}
                    placeholder="data:audio/mp3;base64,... or URL"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Background Ambient Audio (Optional)
                </label>
                <input
                  type="text"
                  value={audio.bg}
                  onChange={e => setAudio({ ...audio, bg: e.target.value })}
                  placeholder="data:audio/mp3;base64,... or URL"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Check size={15} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
