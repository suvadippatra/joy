import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Clock, Award, HelpCircle, CheckCircle2, Play } from 'lucide-react';
import { CBTTest } from '../data/cbtData';

interface StartExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  test: CBTTest | null;
}

export function StartExamModal({ isOpen, onClose, onConfirm, test }: StartExamModalProps) {
  if (!isOpen || !test) return null;

  // Use exact CBT parameters from the test files
  const totalQuestions = test.totalQuestions || 50;
  const marksCorrect = test.marksCorrect ?? 4;
  const marksWrong = test.marksWrong ?? 1;
  const totalMarks = test.totalMarks || (totalQuestions * marksCorrect);
  const durationText = test.duration || '60 Mins';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Exam Confirmation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review test parameters before beginning
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Exam Title & Subject / Category */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 whitespace-nowrap">
              <span>{test.subject}</span>
              <span>•</span>
              <span>{test.category}</span>
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
              {test.title}
            </h4>
          </div>

          {/* Prominent Center Warning Notice */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
              <strong className="font-bold block mb-0.5 text-amber-800 dark:text-amber-300">
                ⚠️ Warning: Progress Not Saved on Exit
              </strong>
              If you leave the exam by pressing the <strong>Back key</strong>, reloading the page, or closing the tab, your progress will <strong>not be saved</strong>. Your responses and scores will only be saved when you complete and <strong>Submit</strong> the exam.
            </div>
          </div>

          {/* Test Parameters Grid - Single line items, no text cutting */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
                <Award size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Full Marks</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{totalMarks} Marks</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Duration</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{durationText}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 shrink-0">
                <HelpCircle size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Questions</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{totalQuestions} Questions</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Marking</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">+{marksCorrect} / -{marksWrong}</p>
              </div>
            </div>
          </div>

          {/* Exam Structure & Rules - Accurate single section format */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Exam Structure & Guidelines:</p>
            <div className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>All <strong>{totalQuestions} questions</strong> are available to attempt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span><strong>+{marksCorrect}</strong> for correct answer, <strong>-{marksWrong}</strong> for incorrect, <strong>0</strong> if unattempted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Includes countdown timer with automatic test submission</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            <Play size={16} fill="currentColor" />
            <span>Start Exam</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
