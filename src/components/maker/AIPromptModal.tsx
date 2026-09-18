import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, Sparkles, X, Code, FileText } from 'lucide-react';
import { getAIPrompt } from '../../utils/cbtParser';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
}

export default function AIPromptModal({ isOpen, onClose, examTitle }: AIPromptModalProps) {
  const [activeTab, setActiveTab] = useState<'LATEX' | 'HTML'>('LATEX');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptText = getAIPrompt(activeTab, examTitle || 'General Science');

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">AI Prompt Generator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Copy this prompt to ChatGPT, Claude, or Gemini to get questions in direct CBT format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('LATEX')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'LATEX'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code size={16} />
            <span>LaTeX Math Mode ($...$)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HTML')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'HTML'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText size={16} />
            <span>Pure HTML / Unicode Mode</span>
          </button>
        </div>

        {/* Prompt Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="relative">
            <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
              {promptText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste the response into the <strong>Bulk Paste</strong> dialog to load all questions instantly.
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 hover:scale-[1.02]'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy AI Prompt'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
