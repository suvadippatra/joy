import React, { memo } from 'react';
import { Question, Section } from '../../types/cbtMaker';
import { Trash2, Copy, ArrowUp, ArrowDown, Check, FileText } from 'lucide-react';

interface QuestionItemButtonProps {
  question: Question;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  onDuplicate: (index: number, e: React.MouseEvent) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
  onMove: (index: number, dir: 'up' | 'down', e: React.MouseEvent) => void;
  isFirst: boolean;
  isLast: boolean;
}

const QuestionItemButton = memo(function QuestionItemButton({
  question,
  index,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
  onMove,
  isFirst,
  isLast
}: QuestionItemButtonProps) {
  // Strip tags/markdown for clean short snippet
  const snippet = question.text
    ? question.text.replace(/<[^>]*>?/gm, '').replace(/\$+/g, '').slice(0, 42)
    : 'Empty Question';

  return (
    <div
      onClick={() => onSelect(index)}
      className={`group relative p-3 rounded-xl border transition-all cursor-pointer select-none touch-manipulation ${
        isActive
          ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Q{index + 1}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {question.type || 'MCQ'}
          </span>
          {question.correct !== undefined || question.correctNat ? (
            <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              <Check size={10} className="mr-0.5" /> Set
            </span>
          ) : null}
        </div>

        {/* Action icons on hover or active */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {!isFirst && (
            <button
              type="button"
              onClick={(e) => onMove(index, 'up', e)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              title="Move Up"
            >
              <ArrowUp size={12} />
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={(e) => onMove(index, 'down', e)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              title="Move Down"
            >
              <ArrowDown size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => onDuplicate(index, e)}
            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            title="Duplicate Question"
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(index, e)}
            className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            title="Delete Question"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug font-normal">
        {snippet || 'Empty Question...'}
      </p>
    </div>
  );
});

interface QuestionSidebarListProps {
  questions: Question[];
  activeIndex: number;
  onSelectQuestion: (index: number) => void;
  onDuplicateQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onMoveQuestion: (index: number, dir: 'up' | 'down') => void;
  searchQuery: string;
}

const QuestionSidebarList = memo(function QuestionSidebarList({
  questions,
  activeIndex,
  onSelectQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  searchQuery
}: QuestionSidebarListProps) {
  const filteredIndices = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      if (!searchQuery.trim()) return true;
      const qText = (q.text || '').toLowerCase();
      const qOpt = (q.options || []).join(' ').toLowerCase();
      const query = searchQuery.toLowerCase();
      return qText.includes(query) || qOpt.includes(query);
    });

  if (filteredIndices.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No questions match "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2 sm:p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
      {filteredIndices.map(({ q, idx }) => (
        <QuestionItemButton
          key={q.id || idx}
          question={q}
          index={idx}
          isActive={idx === activeIndex}
          onSelect={onSelectQuestion}
          onDuplicate={(i, e) => {
            e.stopPropagation();
            onDuplicateQuestion(i);
          }}
          onDelete={(i, e) => {
            e.stopPropagation();
            onDeleteQuestion(i);
          }}
          onMove={(i, dir, e) => {
            e.stopPropagation();
            onMoveQuestion(i, dir);
          }}
          isFirst={idx === 0}
          isLast={idx === questions.length - 1}
        />
      ))}
    </div>
  );
});

export default QuestionSidebarList;
