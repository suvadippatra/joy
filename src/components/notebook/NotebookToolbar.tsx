import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Printer,
  Download,
  Settings,
  Type,
  Palette,
  BookOpen,
  LayoutTemplate,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Columns,
  Edit3,
  Eye,
  Plus,
  Heading,
  Sliders,
  Atom,
  Undo2,
  Redo2
} from 'lucide-react';
import ColorPickerPopover from './ColorPickerPopover';
import { LOCAL_FONTS } from '../../utils/fontManager';
import { PageSettings } from '../../types/notebook';

interface NotebookToolbarProps {
  viewMode: 'split' | 'edit' | 'preview';
  onChangeViewMode: (mode: 'split' | 'edit' | 'preview') => void;
  onFormatText: (type: string, param?: string) => void;
  onInsertCustom: (text: string) => void;
  onOpenImageModal: () => void;
  onOpenTableBuilder?: () => void;
  onOpenSimulationModal?: () => void;
  onOpenFlipbookModal?: () => void;
  onOpenSettingsModal: () => void;
  onOpenFontsStoreModal: () => void;
  onOpenHelpModal: () => void;
  onPrint?: () => void;
  onExportHtml: () => void;
  onLoadTemplate: (templateName: string) => void;
  onNewDoc: () => void;
  installedFonts: string[];
  pageSettings: PageSettings;
  onChangePageSettings: (settings: PageSettings) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

type DropdownId = 'none' | 'latex' | 'headings' | 'inserts' | 'actions' | 'templates';

export default function NotebookToolbar({
  viewMode,
  onChangeViewMode,
  onFormatText,
  onInsertCustom,
  onOpenImageModal,
  onOpenTableBuilder,
  onOpenSimulationModal,
  onOpenFlipbookModal,
  onOpenSettingsModal,
  onOpenFontsStoreModal,
  onOpenHelpModal,
  onPrint,
  onExportHtml,
  onLoadTemplate,
  onNewDoc,
  installedFonts,
  pageSettings,
  onChangePageSettings,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}: NotebookToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownId>('none');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or resizing viewport
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown('none');
        setDropdownPos(null);
        setIsColorPickerOpen(false);
        setColorPickerPos(null);
      }
    };
    const handleResize = () => {
      setActiveDropdown('none');
      setDropdownPos(null);
      setIsColorPickerOpen(false);
      setColorPickerPos(null);
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleDropdown = (id: DropdownId, e?: React.MouseEvent<HTMLElement>) => {
    if (activeDropdown === id) {
      setActiveDropdown('none');
      setDropdownPos(null);
      return;
    }

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = id === 'headings' ? 160 : id === 'inserts' ? 220 : 240;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Safe viewport boundary clamping:
      // If rect.left + menuWidth exceeds viewport right edge minus 12px margin, clamp inward
      let left = rect.left;
      if (left + menuWidth > viewportWidth - 12) {
        left = Math.max(12, rect.right - menuWidth);
      }
      if (left + menuWidth > viewportWidth - 12) {
        left = Math.max(12, viewportWidth - menuWidth - 12);
      }

      let top = rect.bottom + 4;
      if (top + 280 > viewportHeight && rect.top > 280) {
        top = Math.max(12, rect.top - 280);
      }

      setDropdownPos({ top, left });
    } else {
      setDropdownPos(null);
    }

    setActiveDropdown(id);
    setIsColorPickerOpen(false);
  };

  const handleApplyLatexFont = (fontFamily: string) => {
    onFormatText('latex-font', fontFamily);
    setActiveDropdown('none');
    setDropdownPos(null);
  };

  return (
    <div
      ref={toolbarRef}
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 sm:px-3 py-1.5 select-none shrink-0 z-40 shadow-2xs relative"
    >
      {/* Primary Responsive Ribbon: No horizontal scroll needed!
          Items adapt from compact grouped dropdowns on mobile/portrait
          to completely ungrouped single-click buttons on wider viewports.
      */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
        {/* Left Section: View Switcher, Font Dropdown, LaTeX Font, Formatting */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {/* View Mode Segmented Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onChangeViewMode('split')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View (Side-by-side or Top-Bottom in portrait)"
            >
              <Columns size={13} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('edit')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Editor Only"
            >
              <Edit3 size={13} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('preview')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Paginated Sheet Preview"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Undo / Redo History Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${
                canUndo
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95'
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors ${
                canRedo
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95'
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={13} />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

          {/* Unified Font Family Selector: Formats highlighted text with chosen font (Default: LaTeX) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <select
              value=""
              onChange={e => {
                const val = e.target.value;
                e.target.value = '';
                if (val === '__OPEN_STORE__') {
                  onOpenFontsStoreModal();
                } else if (val) {
                  onFormatText('font-family', val);
                }
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 max-w-[135px] sm:max-w-[165px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              title="Apply font family to selected text (Default is LaTeX Computer Modern)"
            >
              <option value="" disabled hidden>
                🔤 Font (LaTeX default)...
              </option>
              <optgroup label="Default LaTeX Typography">
                <option value="'KaTeX_Main', serif">LaTeX Main (Computer Modern)</option>
                <option value="'KaTeX_Math', serif">LaTeX Math Italic</option>
                <option value="'KaTeX_SansSerif', sans-serif">LaTeX Sans-Serif</option>
                <option value="'KaTeX_Typewriter', monospace">LaTeX Typewriter (Mono)</option>
              </optgroup>
              <optgroup label="Academic & Classic Fonts">
                {LOCAL_FONTS.filter(f => !f.family.includes('KaTeX')).map(f => (
                  <option key={f.id} value={f.family}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              {installedFonts.length > 0 && (
                <optgroup label="Installed Google Fonts">
                  {installedFonts.map(f => (
                    <option key={f} value={`'${f}', serif`}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__OPEN_STORE__">✨ + Google Fonts Store...</option>
            </select>

            <button
              type="button"
              onClick={onOpenFontsStoreModal}
              className="p-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100 transition-colors shrink-0"
              title="Browse Google Fonts Academic Store"
            >
              <Type size={13} />
            </button>
          </div>

          {/* Dedicated Font Size Selector: Formats highlighted text with chosen font size */}
          <div className="flex items-center gap-0.5 shrink-0">
            <select
              value=""
              onChange={e => {
                const val = e.target.value;
                e.target.value = '';
                if (val) {
                  onFormatText('fontSize', val);
                }
              }}
              className="px-2 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 max-w-[96px] truncate focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              title="Apply chosen font size to selected text"
            >
              <option value="" disabled hidden>
                📏 Size...
              </option>
              <option value="9pt">9 pt (Small)</option>
              <option value="10pt">10 pt</option>
              <option value="11pt">11 pt (Normal)</option>
              <option value="12pt">12 pt (Medium)</option>
              <option value="14pt">14 pt (Large)</option>
              <option value="16pt">16 pt (Subheading)</option>
              <option value="18pt">18 pt (Heading)</option>
              <option value="22pt">22 pt (Title)</option>
              <option value="28pt">28 pt (Banner)</option>
            </select>
          </div>

          {/* Text Styling: Bold, Italic, Underline, Strikethrough, Color */}
          <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onFormatText('bold')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('italic')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('underline')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('strikethrough')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors hidden sm:block"
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>

            {/* Color / Highlight Popover */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={e => {
                  if (isColorPickerOpen) {
                    setIsColorPickerOpen(false);
                    setColorPickerPos(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const menuWidth = 264;
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    let left = rect.left;
                    if (left + menuWidth > viewportWidth - 12) {
                      left = Math.max(12, rect.right - menuWidth);
                    }
                    if (left + menuWidth > viewportWidth - 12) {
                      left = Math.max(12, viewportWidth - menuWidth - 12);
                    }

                    let top = rect.bottom + 4;
                    if (top + 280 > viewportHeight && rect.top > 280) {
                      top = Math.max(12, rect.top - 280);
                    }

                    setColorPickerPos({ top, left });
                    setIsColorPickerOpen(true);
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }
                }}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center"
                title="Text Color & Highlight"
              >
                <Palette size={13} />
              </button>
              {isColorPickerOpen && (
                <ColorPickerPopover
                  isFixed={!!colorPickerPos}
                  style={colorPickerPos ? { top: colorPickerPos.top, left: colorPickerPos.left } : undefined}
                  onClose={() => {
                    setIsColorPickerOpen(false);
                    setColorPickerPos(null);
                  }}
                  onSelectColor={(hex, isBg) => {
                    if (isBg) {
                      onFormatText('highlight', hex);
                    } else {
                      onFormatText('color', hex);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* HEADINGS:
              - On small/portrait: Grouped into a single [H ▼] dropdown
              - On medium+: Ungrouped into H1, H2, H3 buttons
          */}
          <div className="sm:hidden relative">
            <button
              type="button"
              onClick={e => toggleDropdown('headings', e)}
              className={`p-1.5 rounded-xl border flex items-center gap-0.5 text-xs font-bold transition-all ${
                activeDropdown === 'headings'
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Headings (H1, H2, H3)"
            >
              <Heading size={13} />
              <ChevronDown size={10} />
            </button>
            {activeDropdown === 'headings' && (
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className={`${dropdownPos ? 'fixed' : 'absolute left-0 top-full mt-1'} w-40 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('h1');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold truncate"
                >
                  H1 Main Title
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('h2');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold truncate"
                >
                  H2 Section
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('h3');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium truncate"
                >
                  H3 Sub-section
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onFormatText('h1')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors font-bold text-xs"
              title="Main Heading (H1)"
            >
              <Heading1 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('h2')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors font-bold text-xs"
              title="Section Heading (H2)"
            >
              <Heading2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('h3')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors font-bold text-xs"
              title="Sub-section Heading (H3)"
            >
              <Heading3 size={13} />
            </button>
          </div>

          {/* INSERTS:
              - On screens < 1024px: Grouped into a compact [+ Insert ▼] dropdown
              - On screens >= 1024px (desktop wide): Ungrouped into direct buttons
          */}
          <div className="lg:hidden relative">
            <button
              type="button"
              onClick={e => toggleDropdown('inserts', e)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-xl border transition-all ${
                activeDropdown === 'inserts'
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
              title="Insert Elements"
            >
              <Plus size={12} className="text-blue-500" />
              <span>Insert</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
            {activeDropdown === 'inserts' && (
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className={`${dropdownPos ? 'fixed' : 'absolute left-0 top-full mt-1'} w-52 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('ul');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <List size={14} className="shrink-0 text-slate-500" />
                  <span className="truncate">Bullet List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('ol');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <ListOrdered size={14} className="shrink-0 text-slate-500" />
                  <span className="truncate">Numbered List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('quote');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Quote size={14} className="shrink-0 text-slate-500" />
                  <span className="truncate">Blockquote</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormatText('theorem');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold"
                >
                  <span className="shrink-0 text-xs">[Thm]</span>
                  <span className="truncate">Theorem Box</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenTableBuilder) {
                      onOpenTableBuilder();
                    } else {
                      onFormatText('table');
                    }
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <TableIcon size={14} className="shrink-0 text-slate-500" />
                  <span className="truncate">Visual Table Builder</span>
                </button>
                {onOpenSimulationModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSimulationModal();
                      setActiveDropdown('none');
                      setDropdownPos(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    <Atom size={14} className="shrink-0" />
                    <span className="truncate">PhET / Math Simulation</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onOpenImageModal();
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold"
                >
                  <ImageIcon size={14} className="shrink-0" />
                  <span className="truncate">Attach Image with Crop</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInsertCustom('\n\n---pagebreak---\n\n');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5 font-bold"
                >
                  <span className="shrink-0">📄</span>
                  <span className="truncate">Force Page Break</span>
                </button>
              </div>
            )}
          </div>

          {/* Wide Screen Ungrouped Inserts */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onFormatText('ul')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Bullet List"
            >
              <List size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('ol')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('quote')}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Blockquote"
            >
              <Quote size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFormatText('theorem')}
              className="px-1.5 py-1 text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors font-extrabold text-[10px]"
              title="Insert Theorem / Definition Callout"
            >
              [Thm]
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenTableBuilder) {
                  onOpenTableBuilder();
                } else {
                  onFormatText('table');
                }
              }}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Visual Table Builder (Grid Picker & Presets)"
            >
              <TableIcon size={13} />
            </button>
            {onOpenSimulationModal && (
              <button
                type="button"
                onClick={onOpenSimulationModal}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                title="Insert PhET / Math Simulation (:::iframe)"
              >
                <Atom size={13} />
                <span className="hidden xl:inline text-[10px] font-bold">Sim</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenImageModal()}
              className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Attach Picture / Diagram with Precision Crop"
            >
              <ImageIcon size={13} />
            </button>
            <button
              type="button"
              onClick={() => onInsertCustom('\n\n---pagebreak---\n\n')}
              className="px-2 py-1 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap"
              title="Force New Page Break"
            >
              📄 Break
            </button>
          </div>
        </div>

        {/* Right Section: Templates, Page Setup, Help, Export HTML, Print
            - On small/portrait: Grouped into an [⚡ Actions ▼] dropdown + quick Print
            - On wider viewports: Ungrouped into direct dedicated action buttons
        */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Small Screen Actions Dropdown */}
          <div className="md:hidden relative">
            <button
              type="button"
              onClick={e => toggleDropdown('actions', e)}
              className={`p-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                activeDropdown === 'actions'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
              }`}
              title="Document Options & Templates"
            >
              <Sliders size={13} className="text-indigo-600 dark:text-indigo-400" />
              <ChevronDown size={10} />
            </button>
            {activeDropdown === 'actions' && (
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className={`${dropdownPos ? 'fixed' : 'absolute right-0 top-full mt-1'} w-56 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95`}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Subject Templates
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('physics');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold truncate"
                >
                  ⚡ Physics Mechanics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('calculus');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold truncate"
                >
                  ∫ Calculus &amp; Equations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('biology');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold truncate"
                >
                  🧬 Biology Genetics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('exam');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold truncate"
                >
                  📝 Official Exam Paper (2-Col)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNewDoc();
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 font-semibold border-t border-slate-100 dark:border-slate-800 pt-1.5 truncate"
                >
                  ✨ New Blank Document
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettingsModal();
                      setActiveDropdown('none');
                      setDropdownPos(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <Settings size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate">Page Setup &amp; Dimensions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenHelpModal();
                      setActiveDropdown('none');
                      setDropdownPos(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium"
                  >
                    <HelpCircle size={13} className="text-amber-600 shrink-0" />
                    <span className="truncate">Studio User Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportHtml();
                      setActiveDropdown('none');
                      setDropdownPos(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-bold"
                  >
                    <Download size={13} className="shrink-0" />
                    <span className="truncate">Export Standalone HTML</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Medium/Wide Screens: Ungrouped Templates Dropdown */}
          <div className="hidden md:block relative">
            <button
              type="button"
              onClick={e => toggleDropdown('templates', e)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              title="Choose Subject Template"
            >
              <LayoutTemplate size={13} className="text-indigo-500" />
              <span>Templates</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>
            {activeDropdown === 'templates' && (
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className={`${dropdownPos ? 'fixed' : 'absolute right-0 top-full mt-1'} w-56 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('physics');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold truncate"
                >
                  ⚡ Physics Mechanics &amp; Formulas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('calculus');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold truncate"
                >
                  ∫ Calculus &amp; Differential Equations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('biology');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold truncate"
                >
                  🧬 Biology Molecular Genetics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('exam');
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold truncate"
                >
                  📝 Official Exam Paper (2-Col)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNewDoc();
                    setActiveDropdown('none');
                    setDropdownPos(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 font-semibold border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5 truncate"
                >
                  ✨ Blank Document
                </button>
              </div>
            )}
          </div>

          {/* Medium/Wide Screens: Page Dimensions & Margins Settings */}
          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            title="Configure Paper Dimensions, Margins, Header &amp; Footer"
          >
            <Settings size={13} className="text-slate-500" />
            <span className="hidden lg:inline">Page Setup</span>
          </button>

          {/* Medium/Wide Screens: Help Guide */}
          <button
            type="button"
            onClick={onOpenHelpModal}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            title="Open Document Studio User Guide &amp; Help"
          >
            <HelpCircle size={13} className="text-amber-600 dark:text-amber-400" />
            <span>Guide</span>
          </button>

          {/* Medium/Wide Screens: Export Standalone HTML */}
          <button
            type="button"
            onClick={onExportHtml}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all shrink-0"
            title="Export single-file HTML"
          >
            <Download size={13} />
            <span className="hidden md:inline">Export HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
}
