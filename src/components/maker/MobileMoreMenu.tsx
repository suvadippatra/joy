import React, { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  X,
  Sparkles,
  FileText,
  BookOpen,
  Settings,
  Trash2,
  Columns2,
  Edit3,
  Eye,
  RefreshCw
} from 'lucide-react';

interface MobileMoreMenuProps {
  layoutMode: 'split' | 'editor' | 'preview';
  onChangeLayoutMode: (mode: 'split' | 'editor' | 'preview') => void;
  onOpenAIPrompt: () => void;
  onOpenPasteImport: () => void;
  onOpenLaTeXGuide: () => void;
  onOpenExamSettings: () => void;
  onResetDraft: () => void;
  onLoadDemo: () => void;
}

function MobileMoreMenu({
  layoutMode,
  onChangeLayoutMode,
  onOpenAIPrompt,
  onOpenPasteImport,
  onOpenLaTeXGuide,
  onOpenExamSettings,
  onResetDraft,
  onLoadDemo
}: MobileMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  return (
    <>
      {/* Triple Dot Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        title="More Actions & Menu"
      >
        <MoreVertical size={18} />
      </button>

      {/* Mobile Drawer Popup */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/80 flex flex-col justify-end min-[480px]:hidden animate-in fade-in duration-100"
            onClick={e => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-4 space-y-4 max-h-[85vh] overflow-y-auto text-slate-900 dark:text-slate-100 animate-in slide-in-from-bottom duration-200 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Menu & Quick Tools
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Layout Mode Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Screen Layout Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeLayoutMode('split');
                      setIsOpen(false);
                    }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      layoutMode === 'split'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Columns2 size={14} />
                    <span>Split</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeLayoutMode('editor');
                      setIsOpen(false);
                    }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      layoutMode === 'editor'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeLayoutMode('preview');
                      setIsOpen(false);
                    }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      layoutMode === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              </div>

              {/* Main Tools List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAIPrompt();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs">AI Question Generator</div>
                    <div className="text-[10px] text-purple-500 dark:text-purple-400 font-normal">
                      Generate questions from topic prompt using Gemini
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenPasteImport();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs">Bulk Paste Import</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      Import multiple questions from text or HTML
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenLaTeXGuide();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold text-xs border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs">LaTeX & Math Syntax Guide</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                      Formulas, symbols, fractions and vectors
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenExamSettings();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-slate-700 text-white shrink-0">
                    <Settings size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs">Exam Configuration</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      Title, timing, fonts, rules, and audio
                    </div>
                  </div>
                </button>
              </div>

              {/* Reset / Demo actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  {showCleanConfirm ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onResetDraft();
                          setShowCleanConfirm(false);
                          setIsOpen(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCleanConfirm(false)}
                        className="py-2 px-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCleanConfirm(true)}
                      className="w-full py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Clean Draft</span>
                    </button>
                  )}
                </div>

                <div>
                  {showDemoConfirm ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadDemo();
                          setShowDemoConfirm(false);
                          setIsOpen(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDemoConfirm(false)}
                        className="py-2 px-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDemoConfirm(true)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Load Demo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default memo(MobileMoreMenu);
