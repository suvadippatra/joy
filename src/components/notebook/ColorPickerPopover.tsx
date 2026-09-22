import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

interface ColorPickerPopoverProps {
  onSelectColor: (colorHex: string, isBackground?: boolean) => void;
  onClose: () => void;
  style?: React.CSSProperties;
  isFixed?: boolean;
}

const PRESET_TEXT_COLORS = [
  { name: 'Default Dark', hex: '#0f172a' },
  { name: 'Academic Blue', hex: '#1d4ed8' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Crimson Red', hex: '#b91c1c' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Royal Purple', hex: '#6d28d9' },
  { name: 'Amber Orange', hex: '#b45309' },
  { name: 'Teal', hex: '#0f766e' },
  { name: 'Muted Slate', hex: '#64748b' },
  { name: 'Rose', hex: '#be123c' }
];

const PRESET_HIGHLIGHT_COLORS = [
  { name: 'Yellow Glow', hex: '#fef08a' },
  { name: 'Green Mint', hex: '#bbf7d0' },
  { name: 'Cyan Breeze', hex: '#a5f3fc' },
  { name: 'Lavender', hex: '#e9d5ff' },
  { name: 'Peach', hex: '#fed7aa' },
  { name: 'Rose Tint', hex: '#fecdd3' }
];

export default function ColorPickerPopover({ onSelectColor, onClose, style, isFixed }: ColorPickerPopoverProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'highlight'>('text');
  const [customHex, setCustomHex] = useState('#1d4ed8');

  return (
    <div 
      style={style}
      className={`${isFixed ? 'fixed' : 'absolute top-full mt-1.5 left-0'} z-50 w-64 max-w-[calc(100vw-24px)] p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Palette size={14} className="text-blue-500" />
          <span>Color Selection</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('highlight')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              activeTab === 'highlight'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Highlight
          </button>
        </div>
      </div>

      {/* Preset Swatches */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {(activeTab === 'text' ? PRESET_TEXT_COLORS : PRESET_HIGHLIGHT_COLORS).map(item => (
          <button
            key={item.hex}
            type="button"
            title={item.name}
            onClick={() => {
              onSelectColor(item.hex, activeTab === 'highlight');
              onClose();
            }}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-2xs"
            style={{ backgroundColor: item.hex }}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          type="color"
          value={customHex}
          onChange={e => setCustomHex(e.target.value)}
          className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
        />
        <input
          type="text"
          value={customHex}
          onChange={e => setCustomHex(e.target.value)}
          placeholder="#1d4ed8"
          className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => {
            onSelectColor(customHex, activeTab === 'highlight');
            onClose();
          }}
          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
          title="Apply color"
        >
          <Check size={13} />
        </button>
      </div>
    </div>
  );
}
