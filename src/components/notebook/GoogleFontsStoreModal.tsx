import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Check, X, Sparkles, ExternalLink, Type } from 'lucide-react';
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from '../../utils/fontManager';
import { GoogleFontMeta } from '../../types/notebook';

interface GoogleFontsStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedFonts: string[];
  onAddFont: (fontFamily: string) => void;
}

export default function GoogleFontsStoreModal({
  isOpen,
  onClose,
  installedFonts,
  onAddFont
}: GoogleFontsStoreModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customFontInput, setCustomFontInput] = useState('');
  const [previewPhrase, setPreviewPhrase] = useState('E = mc² • The quick brown fox jumps over the lazy dog');

  if (!isOpen) return null;

  const filteredFonts = POPULAR_GOOGLE_FONTS.filter(f => {
    const matchesSearch = f.family.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddFont = (fontFamily: string) => {
    loadGoogleFont(fontFamily);
    onAddFont(fontFamily);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFontInput.trim()) return;
    const clean = customFontInput.trim();
    handleAddFont(clean);
    setCustomFontInput('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Type size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Google Fonts Academic Store</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Online Store
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse academic typography or import any font from Google Fonts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Custom Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search academic fonts (e.g. Garamond, Fira, Spectral)..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <form onSubmit={handleAddCustom} className="flex gap-1.5 shrink-0">
              <input
                type="text"
                value={customFontInput}
                onChange={e => setCustomFontInput(e.target.value)}
                placeholder="Custom font name..."
                className="w-36 sm:w-44 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus size={15} />
                <span>Import</span>
              </button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {['all', 'serif', 'sans-serif', 'monospace', 'display', 'handwriting'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Font List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredFonts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No matching fonts found.</p>
              <p className="text-xs text-slate-400 mt-1">
                You can import ANY font directly by typing its name in the "Custom font name" box above!
              </p>
            </div>
          ) : (
            filteredFonts.map(font => {
              const isInstalled = installedFonts.includes(font.family);
              // Preload preview font
              loadGoogleFont(font.family);

              return (
                <div
                  key={font.family}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {font.family}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {font.category}
                      </span>
                    </div>
                    {font.description && (
                      <p className="text-xs text-slate-400">{font.description}</p>
                    )}
                    {/* Live Preview Sample */}
                    <div
                      className="text-base sm:text-lg text-slate-800 dark:text-slate-200 pt-1 truncate"
                      style={{ fontFamily: `'${font.family}', serif` }}
                    >
                      {previewPhrase}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={`https://fonts.google.com/specimen/${encodeURIComponent(font.family)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View on Google Fonts"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleAddFont(font.family)}
                      disabled={isInstalled}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isInstalled
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add to Doc</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <span>Google Fonts are freely licensed under SIL Open Font License.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
