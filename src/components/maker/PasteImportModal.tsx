import React, { useState, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { Upload, FileText, Check, AlertCircle, X, Sparkles } from 'lucide-react';
import { AppState } from '../../types/cbtMaker';
import { parseCBTFormat } from '../../utils/cbtParser';

interface PasteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onImportSuccess: (newState: Partial<AppState>, count: number, missingImagesCount?: number) => void;
  onOpenAIPrompt: () => void;
}

function PasteImportModal({
  isOpen,
  onClose,
  currentState,
  onImportSuccess,
  onOpenAIPrompt
}: PasteImportModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    setError(null);
    setSuccessInfo(null);

    if (!text.trim()) {
      setError('Please paste text or load a file first.');
      return;
    }

    const result = parseCBTFormat(text, currentState);
    if (!result.success || !result.state) {
      setError(result.error || 'Failed to parse format.');
      return;
    }

    onImportSuccess(result.state, result.count || 0, result.missingImagesCount || 0);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      setText(content);
      setError(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl flex flex-col max-h-[92vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">Paste or Upload CBT Text</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Paste your generated test questions in CBT syntax, or upload a .txt file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action bar above textarea */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.cbt,.text"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Upload size={14} />
              <span>Load from .txt file</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setText(`[EXAM_INFO]
Title: Chapter 1: Physics Basics
Subtitle: High Yield Practice
Duration: 60
Timer: COUNTDOWN

[SECTION:Section A|Marks:4|Neg:1|MaxAtt:0]
QType: MCQ
Q: An electron is accelerated through a potential difference of 100 V. What is its de Broglie wavelength?
O: $1.227 \\text{ \\AA}$
O: $0.123 \\text{ \\AA}$
O: $12.27 \\text{ \\AA}$
O: $0.012 \\text{ \\AA}$
A: A

QType: NAT
Q: What is the escape velocity from earth's surface in km/s (approx)?
A: 11.2`);
                setError(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Load Example Format
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAIPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Sparkles size={14} />
            <span>Get AI Generation Prompt</span>
          </button>
        </div>

        {/* Text Area */}
        <div className="p-5 flex-1 flex flex-col min-h-[300px]">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Paste CBT format here...\n\nExample:\n[SECTION:Section 1|Marks:4|Neg:1|MaxAtt:0]\nQType: MCQ\nQ: Question text here...\nO: Option A\nO: Option B\nO: Option C\nO: Option D\nA: A`}
            className="w-full flex-1 min-h-[280px] p-4 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
          />

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check size={16} />
              <span>{successInfo}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Supports both LaTeX ($...$) and Unicode/HTML formats
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleParse}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Check size={16} />
              <span>Parse & Load Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default memo(PasteImportModal);
