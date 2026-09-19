import React, { useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, Sparkles, X, Code, FileText, BookOpen, Layers } from 'lucide-react';
import { getAIPrompt } from '../../utils/cbtParser';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  sections?: { name: string; marks: number; negative: number; maxAttempts: number }[];
}

function AIPromptModal({ isOpen, onClose, examTitle, sections }: AIPromptModalProps) {
  const [activeTab, setActiveTab] = useState<'LATEX' | 'HTML'>('LATEX');
  const [subject, setSubject] = useState(examTitle || 'Physics & Chemistry Full Syllabus');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptText = getAIPrompt(activeTab, subject || 'General Science', sections);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl flex flex-col h-[85vh] max-h-[700px] min-h-[520px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                AI Question Prompt Generator
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Copy prompt to ChatGPT, Gemini, or Claude to generate exam questions in direct CBT import format
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Engine / Math Mode Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('LATEX')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'LATEX'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Code size={15} />
              <span>LaTeX Math Mode ($...$)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HTML')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'HTML'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <FileText size={15} />
              <span>Pure HTML & Unicode</span>
            </button>
          </div>

          {/* Subject Input */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="font-bold text-slate-600 dark:text-slate-400">Subject / Title:</span>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject / Chapter"
                className="w-48 sm:w-64 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Prompt Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-purple-500" />
              <span>
                {activeTab === 'LATEX'
                  ? 'Optimized for Physics, Chemistry & Math with KaTeX math delimiters ($...$, $$...$$)'
                  : 'Optimized for Biology, Zoology, Botany & Medical terms using clean HTML tags (<sub>, <sup>, tables)'}
              </span>
            </div>
            <span className="font-mono">{promptText.length} chars</span>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
            {promptText}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Paste the LLM response directly into <strong>Bulk Paste</strong> to load all questions instantly.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 hover:scale-[1.02]'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default memo(AIPromptModal);
