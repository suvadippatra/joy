import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Copy,
  Trash2,
  Check,
  Edit2,
  Layers,
  Search,
  LayoutGrid,
  AlertTriangle
} from 'lucide-react';
import { Question, Section } from '../../types/cbtMaker';

interface QuestionPaletteTrayProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  activeSectionName: string;
  questionsBySection: Record<string, Question[]>;
  activeQuestionIndex: number;
  onSelectSection: (sectionName: string) => void;
  onSelectQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onAddSection: () => void;
  onRenameSection: (oldName: string, newName: string) => void;
  onDeleteSection: (sectionName: string) => void;
  onMoveQuestion: (index: number, dir: 'up' | 'down' | 'left' | 'right') => void;
  onDuplicateQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onUpdateSectionMarks?: (sectionName: string, marks: number, negative: number) => void;
}

export default function QuestionPaletteTray({
  isOpen,
  onClose,
  sections,
  activeSectionName,
  questionsBySection,
  activeQuestionIndex,
  onSelectSection,
  onSelectQuestion,
  onAddQuestion,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onMoveQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onUpdateSectionMarks
}: QuestionPaletteTrayProps) {
  const [jumpQVal, setJumpQVal] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Section inline editing state
  const [editingSecName, setEditingSecName] = useState<string | null>(null);
  const [editingSecVal, setEditingSecVal] = useState('');

  const currentQuestions = questionsBySection[activeSectionName] || [];
  const activeSection = sections.find(s => s.name === activeSectionName);
  const activeSectionIdx = sections.findIndex(s => s.name === activeSectionName);

  if (!isOpen) return null;

  const handleStartRename = (secName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSecName(secName);
    setEditingSecVal(secName);
  };

  const handleCommitRename = (secName: string) => {
    const trimmed = editingSecVal.trim();
    if (trimmed && trimmed !== secName) {
      onRenameSection(secName, trimmed);
    }
    setEditingSecName(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Tray Popup Header */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Question Palette & Section Manager
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sections.length} Sections &bull; {currentQuestions.length} Questions in {activeSectionName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close Palette"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Management Header (Fully Editable Section Names) */}
        <div className="p-3 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers size={13} className="text-blue-500" />
              <span>Sections / Subjects</span>
            </label>
            <button
              type="button"
              onClick={onAddSection}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus size={13} />
              <span>Add Section</span>
            </button>
          </div>

          {/* Section Pills with Inline Edit Mode */}
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {sections.map(sec => {
              const count = (questionsBySection[sec.name] || []).length;
              const isSelected = sec.name === activeSectionName;
              const isEditing = editingSecName === sec.name;

              if (isEditing) {
                return (
                  <div key={sec.name} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingSecVal}
                      onChange={e => setEditingSecVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCommitRename(sec.name);
                        if (e.key === 'Escape') setEditingSecName(null);
                      }}
                      onBlur={() => handleCommitRename(sec.name)}
                      autoFocus
                      className="px-2 py-0.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-950 border border-blue-500 text-slate-900 dark:text-slate-100 focus:outline-none w-28"
                    />
                    <button
                      type="button"
                      onClick={() => handleCommitRename(sec.name)}
                      className="p-1 rounded-md bg-blue-600 text-white"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={sec.name}
                  onClick={() => onSelectSection(sec.name)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all border select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                  title="Click to select section • Double click or click pencil to edit name"
                >
                  <span onDoubleClick={() => handleStartRename(sec.name)}>{sec.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>

                  <button
                    type="button"
                    onClick={e => handleStartRename(sec.name, e)}
                    className={`p-0.5 rounded transition-colors ${
                      isSelected ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Rename Section"
                  >
                    <Edit2 size={11} />
                  </button>

                  {sections.length > 1 && isSelected && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteSection(sec.name);
                      }}
                      className="p-0.5 rounded text-white/70 hover:text-red-200 hover:bg-white/20 transition-colors ml-0.5"
                      title="Delete Section"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section Default Marks Override Config */}
          {activeSection && onUpdateSectionMarks && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Default Marks for {activeSectionName}:</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">+</span>
                <input
                  type="number"
                  step="any"
                  value={activeSection.marks}
                  onChange={e =>
                    onUpdateSectionMarks(
                      activeSection.name,
                      parseFloat(e.target.value) || 0,
                      activeSection.negative
                    )
                  }
                  className="w-10 px-1 py-0.5 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-800 dark:text-slate-100"
                  title="Positive Marks"
                />
                <span className="text-red-500">-</span>
                <input
                  type="number"
                  step="any"
                  value={activeSection.negative}
                  onChange={e =>
                    onUpdateSectionMarks(
                      activeSection.name,
                      activeSection.marks,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-10 px-1 py-0.5 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-800 dark:text-slate-100"
                  title="Negative Penalty"
                />
              </div>
            </div>
          )}
        </div>

        {/* Question Matrix Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Search & Quick Jump */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search in questions..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shrink-0">
              <span className="font-bold text-slate-500">Go Q:</span>
              <input
                type="number"
                min={1}
                max={currentQuestions.length}
                value={jumpQVal}
                onChange={e => {
                  const val = e.target.value;
                  setJumpQVal(val);
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && num >= 1 && num <= currentQuestions.length) {
                    onSelectQuestion(num - 1);
                  }
                }}
                placeholder="#"
                className="w-8 text-center font-bold text-blue-600 dark:text-blue-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Question Matrix Grid with S1Q1 Style Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Question Matrix ({currentQuestions.length})</span>
              <button
                type="button"
                onClick={onAddQuestion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <Plus size={13} />
                <span>Add Question</span>
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 pt-1">
              {currentQuestions.map((q, idx) => {
                const isActive = idx === activeQuestionIndex;
                const hasAnswer = q.correct !== undefined || Boolean(q.correctNat);
                const hasMissingImage = q.image === 'PLACEHOLDER' || (q.options || []).some(o => o.includes('||IMG:PLACEHOLDER||') || o.includes('PLACEHOLDER'));
                const sLabel = `S${activeSectionIdx + 1}Q${idx + 1}`;

                const matchesSearch =
                  !searchFilter.trim() ||
                  (q.text || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                  (q.options || []).join(' ').toLowerCase().includes(searchFilter.toLowerCase());

                if (!matchesSearch) return null;

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => onSelectQuestion(idx)}
                    className={`relative h-10 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center transition-all touch-manipulation border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30 scale-105 z-10'
                        : hasMissingImage
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                        : hasAnswer
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                    title={`Question ${sLabel} (${q.type})${hasMissingImage ? ' - Needs Image Upload' : ''}`}
                  >
                    <span>{sLabel}</span>
                    <span
                      className={`text-[9px] font-sans font-normal opacity-80 ${
                        isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {q.type}
                    </span>

                    {hasMissingImage ? (
                      <span className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-white text-[8px]">
                        <AlertTriangle size={8} />
                      </span>
                    ) : (
                      hasAnswer && !isActive && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Bar with All 4 Movement Buttons (← ↑ ↓ →) */}
          {currentQuestions[activeQuestionIndex] && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Active Question S{activeSectionIdx + 1}Q{activeQuestionIndex + 1} Controls</span>
                <span className="text-[11px] font-mono font-normal text-slate-500">
                  Type: {currentQuestions[activeQuestionIndex].type}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                {/* 4 Movement Directional Buttons (← ↑ ↓ →) */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 px-1">Move:</span>
                  <button
                    type="button"
                    onClick={() => onMoveQuestion(activeQuestionIndex, 'left')}
                    disabled={activeQuestionIndex <= 0}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 hover:bg-slate-200"
                    title="Move Left (Previous)"
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveQuestion(activeQuestionIndex, 'up')}
                    disabled={activeQuestionIndex <= 0}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 hover:bg-slate-200"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveQuestion(activeQuestionIndex, 'down')}
                    disabled={activeQuestionIndex >= currentQuestions.length - 1}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 hover:bg-slate-200"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveQuestion(activeQuestionIndex, 'right')}
                    disabled={activeQuestionIndex >= currentQuestions.length - 1}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 hover:bg-slate-200"
                    title="Move Right (Next)"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDuplicateQuestion(activeQuestionIndex)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-blue-50 hover:text-blue-600"
                    title="Duplicate Question"
                  >
                    <Copy size={13} />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(activeQuestionIndex)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 text-xs font-bold hover:bg-red-50"
                    title="Delete Question"
                  >
                    <Trash2 size={13} />
                    <span>Del</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Total: {currentQuestions.length} Questions</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
