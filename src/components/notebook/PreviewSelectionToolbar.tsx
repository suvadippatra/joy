import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Type, 
  Palette, 
  Highlighter, 
  Sigma, 
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';

export interface SelectionCoords {
  top: number;
  left: number;
  selectedText: string;
  contextBefore?: string;
  contextAfter?: string;
}

interface PreviewSelectionToolbarProps {
  coords: SelectionCoords;
  onApplyFormat: (action: string, value?: string) => void;
  onClose: () => void;
  installedFonts?: string[];
}

const DEFAULT_FONT_OPTIONS = [
  { name: 'LaTeX Computer Modern', value: "'KaTeX_Main', serif" },
  { name: 'LaTeX Sans-Serif', value: "'KaTeX_SansSerif', sans-serif" },
  { name: 'LaTeX Typewriter', value: "'KaTeX_Typewriter', monospace" },
  { name: 'LaTeX Math Italic', value: "'KaTeX_Math', serif" },
  { name: 'Tiro Bangla', value: "'Tiro Bangla', serif" },
  { name: 'Times New Roman', value: "'Times New Roman', serif" },
  { name: 'EB Garamond', value: "'EB Garamond', serif" },
];

const SIZE_OPTIONS = [
  { label: '9pt', value: '9pt' },
  { label: '10pt', value: '10pt' },
  { label: '11pt', value: '11pt' },
  { label: '12pt', value: '12pt' },
  { label: '14pt', value: '14pt' },
  { label: '18pt', value: '18pt' },
  { label: '24pt', value: '24pt' },
];

const COLOR_OPTIONS = [
  { name: 'Default Black', value: '#0f172a', bg: 'bg-slate-900' },
  { name: 'Royal Blue', value: '#1d4ed8', bg: 'bg-blue-700' },
  { name: 'Crimson Red', value: '#dc2626', bg: 'bg-red-600' },
  { name: 'Emerald Green', value: '#059669', bg: 'bg-emerald-600' },
  { name: 'Royal Purple', value: '#7c3aed', bg: 'bg-purple-600' },
  { name: 'Amber Orange', value: '#d97706', bg: 'bg-amber-600' },
  { name: 'Slate Gray', value: '#475569', bg: 'bg-slate-600' },
];

const HIGHLIGHT_OPTIONS = [
  { name: 'Yellow', value: '#fef08a', bg: 'bg-yellow-200' },
  { name: 'Mint Green', value: '#bbf7d0', bg: 'bg-green-200' },
  { name: 'Sky Cyan', value: '#bae6fd', bg: 'bg-sky-200' },
  { name: 'Rose Pink', value: '#fecdd3', bg: 'bg-rose-200' },
  { name: 'Purple Tint', value: '#e9d5ff', bg: 'bg-purple-200' },
  { name: 'None', value: 'transparent', bg: 'bg-slate-100 dark:bg-slate-800' },
];

export default function PreviewSelectionToolbar({
  coords,
  onApplyFormat,
  onClose,
  installedFonts = []
}: PreviewSelectionToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<'font' | 'size' | 'color' | 'highlight' | null>(null);

  const allFonts = [
    ...DEFAULT_FONT_OPTIONS,
    ...installedFonts.map(f => ({ name: f, value: `'${f}', serif` }))
  ];

  // Position toolbar slightly above the selected text with safe screen clamping
  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.max(10, coords.top - 48),
    left: Math.max(12, Math.min(window.innerWidth - 320, coords.left - 150)),
    zIndex: 9999,
  };

  const handleAction = (action: string, value?: string) => {
    onApplyFormat(action, value);
    setOpenDropdown(null);
  };

  return (
    <div
      style={style}
      className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700/80 px-2 py-1.5 flex items-center gap-1 text-xs select-none animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Font Family Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'font' ? null : 'font')}
          className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1"
          title="Change Font Family"
        >
          <span className="font-serif">LaTeX</span>
          <ChevronDown size={12} />
        </button>

        {openDropdown === 'font' && (
          <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto">
            {allFonts.map(font => (
              <button
                key={font.name}
                type="button"
                onClick={() => handleAction('font', font.value)}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white text-slate-200 text-xs truncate"
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
          className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1"
          title="Font Size"
        >
          <span>Size</span>
          <ChevronDown size={12} />
        </button>

        {openDropdown === 'size' && (
          <div className="absolute top-full left-0 mt-1.5 w-24 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
            {SIZE_OPTIONS.map(size => (
              <button
                key={size.label}
                type="button"
                onClick={() => handleAction('fontSize', size.value)}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white text-slate-200 text-xs"
              >
                {size.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

      {/* Formatting buttons */}
      <button
        type="button"
        onClick={() => handleAction('bold')}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
        title="Bold (**text**)"
      >
        <Bold size={14} />
      </button>

      <button
        type="button"
        onClick={() => handleAction('italic')}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
        title="Italic (*text*)"
      >
        <Italic size={14} />
      </button>

      <button
        type="button"
        onClick={() => handleAction('underline')}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
        title="Underline (<u>text</u>)"
      >
        <Underline size={14} />
      </button>

      <button
        type="button"
        onClick={() => handleAction('strike')}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white"
        title="Strikethrough (~~text~~)"
      >
        <Strikethrough size={14} />
      </button>

      <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

      {/* Text Color Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'color' ? null : 'color')}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center"
          title="Text Color"
        >
          <Palette size={14} />
        </button>

        {openDropdown === 'color' && (
          <div className="absolute top-full left-0 mt-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl grid grid-cols-4 gap-1.5 z-50">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleAction('color', c.value)}
                className={`w-6 h-6 rounded-full border border-white/20 ${c.bg} hover:scale-110 transition-transform`}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Highlight Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'highlight' ? null : 'highlight')}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center"
          title="Highlight Color"
        >
          <Highlighter size={14} />
        </button>

        {openDropdown === 'highlight' && (
          <div className="absolute top-full left-0 mt-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl grid grid-cols-3 gap-1.5 z-50">
            {HIGHLIGHT_OPTIONS.map(h => (
              <button
                key={h.name}
                type="button"
                onClick={() => handleAction('highlight', h.value)}
                className={`w-6 h-6 rounded-lg border border-slate-600 ${h.bg} hover:scale-110 transition-transform flex items-center justify-center text-[10px] text-slate-800 font-bold`}
                title={h.name}
              >
                {h.value === 'transparent' ? '✕' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

      {/* LaTeX Math Buttons */}
      <button
        type="button"
        onClick={() => handleAction('math')}
        className="px-2 py-1 rounded-lg hover:bg-blue-600 text-blue-300 hover:text-white font-mono font-bold flex items-center gap-1"
        title="Convert to Inline Math ($...$)"
      >
        <Sigma size={13} />
        <span>Math</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('displayMath')}
        className="px-2 py-1 rounded-lg hover:bg-blue-600 text-blue-300 hover:text-white font-mono font-bold"
        title="Convert to Display Math ($$...$$)"
      >
        <span>$$</span>
      </button>

      <button
        type="button"
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-200 rounded-md ml-1"
        title="Close Toolbar"
      >
        <X size={13} />
      </button>
    </div>
  );
}
