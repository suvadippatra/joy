import React, { memo } from 'react';
import { Section } from '../../types/cbtMaker';
import { Plus, Trash2 } from 'lucide-react';

interface SectionTabSelectorProps {
  sections: Section[];
  activeSectionName: string;
  questionsBySection: Record<string, any[]>;
  onSelectSection: (sectionName: string) => void;
  onAddSection: () => void;
  onRenameSection: (oldName: string) => void;
  onDeleteSection: (sectionName: string) => void;
}

const SectionTabSelector = memo(function SectionTabSelector({
  sections,
  activeSectionName,
  questionsBySection,
  onSelectSection,
  onAddSection,
  onRenameSection,
  onDeleteSection
}: SectionTabSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
      {sections.map((sec) => {
        const isActive = sec.name === activeSectionName;
        const qCount = questionsBySection[sec.name]?.length || 0;

        return (
          <div
            key={sec.name}
            onClick={() => onSelectSection(sec.name)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onRenameSection(sec.name);
            }}
            title="Double-click or double-tap to rename section"
            className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap select-none touch-manipulation border ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{sec.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {qCount}
            </span>

            {/* Quick action: Delete button on active section */}
            {isActive && sections.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSection(sec.name);
                }}
                className="p-1 hover:bg-white/20 rounded text-white ml-0.5"
                title="Delete Section"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}

      {/* Add New Section Button */}
      <button
        type="button"
        onClick={onAddSection}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap touch-manipulation border border-dashed border-slate-300 dark:border-slate-700"
        title="Add New Subject / Section"
      >
        <Plus size={15} />
        <span>+ Section</span>
      </button>
    </div>
  );
});

export default SectionTabSelector;
