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
  Download,
  Settings,
  Type,
  Palette,
  LayoutTemplate,
  HelpCircle,
  ChevronDown,
  Columns,
  Edit3,
  Eye,
  Plus,
  Heading,
  Sliders,
  Atom,
  Undo2,
  Redo2,
  Layout,
  PanelLeft,
  Columns2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
  Hash,
  Home
} from 'lucide-react';
import ColorPickerPopover from './ColorPickerPopover';
import { LOCAL_FONTS } from '../../utils/fontManager';
import { PageSettings, PaperSize } from '../../types/notebook';
import { useButtonDisplayMode } from '../../hooks/useButtonDisplayMode';

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

type DropdownId = 'none' | 'headings' | 'inserts' | 'actions' | 'templates' | 'layout';
type RibbonTab = 'home' | 'layout';

const MARGIN_PRESETS = [
  { id: 'normal', label: 'Normal (20mm)', margins: { top: 20, bottom: 20, left: 20, right: 20 } },
  { id: 'narrow', label: 'Narrow (12.7mm)', margins: { top: 13, bottom: 13, left: 13, right: 13 } },
  { id: 'moderate', label: 'Moderate (16mm)', margins: { top: 18, bottom: 18, left: 15, right: 15 } },
  { id: 'wide', label: 'Wide (25.4mm)', margins: { top: 25, bottom: 25, left: 25, right: 25 } }
];

export default function NotebookToolbar({
  viewMode,
  onChangeViewMode,
  onFormatText,
  onInsertCustom,
  onOpenImageModal,
  onOpenTableBuilder,
  onOpenSimulationModal,
  onOpenSettingsModal,
  onOpenFontsStoreModal,
  onOpenHelpModal,
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
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [activeDropdown, setActiveDropdown] = useState<DropdownId>('none');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { shouldShowLabel } = useButtonDisplayMode();

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
      const menuWidth = id === 'headings' ? 160 : id === 'inserts' ? 220 : id === 'layout' ? 230 : 240;
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

      setDropdownPos({ top, left });
    } else {
      setDropdownPos(null);
    }

    setActiveDropdown(id);
    setIsColorPickerOpen(false);
  };

  const updateMarginSide = (side: 'top' | 'bottom' | 'left' | 'right', val: number) => {
    const clamped = Math.max(5, Math.min(60, Math.round(val || 0)));
    onChangePageSettings({
      ...pageSettings,
      margins: {
        ...pageSettings.margins,
        [side]: clamped
      }
    });
  };

  return (
    <div
      ref={toolbarRef}
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 sm:px-3 py-1 select-none shrink-0 z-40 shadow-2xs relative"
    >
      {(activeDropdown !== 'none' || isColorPickerOpen) && (
        <div
          className="fixed inset-0 z-[9980] bg-transparent cursor-default"
          onClick={() => {
            setActiveDropdown('none');
            setDropdownPos(null);
            setIsColorPickerOpen(false);
            setColorPickerPos(null);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5 w-full">
        {/* Left: View Switcher + 2-Tab Ribbon Switcher + Active Ribbon Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Mode Segmented Control (Smart Active-Label by default) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onChangeViewMode('split')}
              className={`text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                  : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View"
            >
              <Columns size={13} />
              {shouldShowLabel(viewMode === 'split', true) && <span>Split</span>}
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('edit')}
              className={`text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'edit'
                  ? 'px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                  : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Editor Only"
            >
              <Edit3 size={13} />
              {shouldShowLabel(viewMode === 'edit', true) && <span>Edit</span>}
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('preview')}
              className={`text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                  : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Page Preview Only"
            >
              <Eye size={13} />
              {shouldShowLabel(viewMode === 'preview', true) && <span>Preview</span>}
            </button>
          </div>

          {/* 2-Tab Ribbon Switcher: Home Formatting vs Page Layout (Smart Active-Label by default) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'home'
                  ? 'px-2.5 py-1 bg-blue-600 text-white shadow-2xs scale-[1.02]'
                  : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Home Formatting Ribbon"
            >
              <Home size={13} />
              {shouldShowLabel(activeTab === 'home', true) && <span>Home</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'layout'
                  ? 'px-2.5 py-1 bg-blue-600 text-white shadow-2xs scale-[1.02]'
                  : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Page Margins, Size, Columns, Running Header, Footer & Page Numbers"
            >
              <Sliders size={13} />
              {shouldShowLabel(activeTab === 'layout', true) && <span>Page Layout</span>}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

          {activeTab === 'home' ? (
            <>
              {/* Undo / Redo */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={`p-1.5 rounded-md transition-colors ${
                    canUndo
                      ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600'
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
                  className={`p-1.5 rounded-md transition-colors ${
                    canRedo
                      ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600'
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={13} />
                </button>
              </div>

              {/* Font Family Selector */}
              <div className="flex items-center gap-0.5 shrink-0">
                <select
                  value=""
                  onChange={e => {
                    const val = e.target.value;
                    e.target.value = '';
                    if (val === '__OPEN_STORE__') {
                      onOpenFontsStoreModal();
                    } else if (val.startsWith('DOC_FONT:')) {
                      onChangePageSettings({
                        ...pageSettings,
                        fontFamily: val.replace('DOC_FONT:', '')
                      });
                    } else if (val) {
                      onFormatText('font-family', val);
                    }
                  }}
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 max-w-[135px] sm:max-w-[155px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  title="Document or Selection Font Family"
                >
                  <option value="" disabled hidden>
                    Font (LaTeX)...
                  </option>
                  <optgroup label="Whole Document Font">
                    <option value="DOC_FONT:'KaTeX_Main', serif">Doc: LaTeX Main (Default)</option>
                    <option value="DOC_FONT:'KaTeX_SansSerif', sans-serif">Doc: LaTeX Sans-Serif</option>
                    <option value="DOC_FONT:'DM Serif Text', Georgia, serif">Doc: Academic Serif</option>
                  </optgroup>
                  <optgroup label="Selected Text Font">
                    <option value="'KaTeX_Main', serif">LaTeX Main (Computer Modern)</option>
                    <option value="'KaTeX_Math', serif">LaTeX Math Italic</option>
                    <option value="'KaTeX_SansSerif', sans-serif">LaTeX Sans-Serif</option>
                    <option value="'KaTeX_Typewriter', monospace">LaTeX Typewriter (Mono)</option>
                    {LOCAL_FONTS.filter(f => !f.family.includes('KaTeX')).map(f => (
                      <option key={f.id} value={f.family}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  {installedFonts.length > 0 && (
                    <optgroup label="Installed Fonts">
                      {installedFonts.map(f => (
                        <option key={f} value={`'${f}', serif`}>
                          {f}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__OPEN_STORE__">+ Google Fonts Store...</option>
                </select>

                <button
                  type="button"
                  onClick={onOpenFontsStoreModal}
                  className="p-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                  title="Google Fonts Store"
                >
                  <Type size={13} />
                </button>
              </div>

              {/* Font Size Selector */}
              <select
                value=""
                onChange={e => {
                  const val = e.target.value;
                  e.target.value = '';
                  if (val.startsWith('BASE:')) {
                    onChangePageSettings({
                      ...pageSettings,
                      fontSizePt: parseFloat(val.replace('BASE:', ''))
                    });
                  } else if (val) {
                    onFormatText('fontSize', val);
                  }
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 max-w-[82px] truncate focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shrink-0"
                title="Font Size"
              >
                <option value="" disabled hidden>
                  {pageSettings.fontSizePt}pt
                </option>
                <optgroup label="Selection Size">
                  <option value="9pt">9 pt</option>
                  <option value="10pt">10 pt</option>
                  <option value="11pt">11 pt</option>
                  <option value="12pt">12 pt</option>
                  <option value="14pt">14 pt</option>
                  <option value="16pt">16 pt</option>
                  <option value="18pt">18 pt</option>
                  <option value="22pt">22 pt</option>
                  <option value="28pt">28 pt</option>
                </optgroup>
                <optgroup label="Document Base Size">
                  <option value="BASE:10">Doc Base: 10pt</option>
                  <option value="BASE:11">Doc Base: 11pt</option>
                  <option value="BASE:12">Doc Base: 12pt</option>
                  <option value="BASE:14">Doc Base: 14pt</option>
                </optgroup>
              </select>

              {/* Text Styling: Bold, Italic, Underline, Strikethrough, Color */}
              <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('bold')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('italic')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('underline')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('strikethrough')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors hidden sm:block"
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
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors flex items-center"
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

              {/* Paragraph Alignment: Left, Center, Right, Justify */}
              <div className="hidden md:flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('align-left')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Align Left"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('align-center')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Align Center"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('align-right')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Align Right"
                >
                  <AlignRight size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('align-justify')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Justify Paragraph"
                >
                  <AlignJustify size={13} />
                </button>
              </div>

              {/* Line Spacing Selector */}
              <select
                value={pageSettings.lineHeight}
                onChange={e =>
                  onChangePageSettings({
                    ...pageSettings,
                    lineHeight: parseFloat(e.target.value)
                  })
                }
                className="hidden xl:block px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer shrink-0"
                title="Line Spacing"
              >
                <option value={1.15}>1.15x</option>
                <option value={1.4}>1.4x</option>
                <option value={1.6}>1.6x</option>
                <option value={2.0}>2.0x</option>
              </select>

              {/* Headings */}
              <div className="sm:hidden relative">
                <button
                  type="button"
                  onClick={e => toggleDropdown('headings', e)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-0.5 text-xs font-bold"
                  title="Headings"
                >
                  <Heading size={13} />
                  <ChevronDown size={10} />
                </button>
                {activeDropdown === 'headings' && (
                  <div
                    style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                    className={`${dropdownPos ? 'fixed' : 'absolute left-0 top-full mt-1'} w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 text-xs space-y-0.5`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onFormatText('h1');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      H1 Title
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFormatText('h2');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                    >
                      H2 Section
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFormatText('h3');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      H3 Sub-section
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('h1')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors font-bold text-xs"
                  title="Heading 1"
                >
                  <Heading1 size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('h2')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors font-bold text-xs"
                  title="Heading 2"
                >
                  <Heading2 size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onFormatText('h3')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors font-bold text-xs"
                  title="Heading 3"
                >
                  <Heading3 size={13} />
                </button>
              </div>

              {/* Inserts */}
              <div className="lg:hidden relative">
                <button
                  type="button"
                  onClick={e => toggleDropdown('inserts', e)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Plus size={12} className="text-blue-500" />
                  <span>Insert</span>
                  <ChevronDown size={10} className="text-slate-400" />
                </button>
                {activeDropdown === 'inserts' && (
                  <div
                    style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                    className={`${dropdownPos ? 'fixed' : 'absolute left-0 top-full mt-1'} w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-0.5`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onFormatText('ul');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <List size={14} className="text-slate-500" />
                      <span>Bullet List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFormatText('ol');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <ListOrdered size={14} className="text-slate-500" />
                      <span>Numbered List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFormatText('theorem');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold"
                    >
                      <span>[Thm]</span>
                      <span>Theorem Box</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenTableBuilder) onOpenTableBuilder();
                        else onFormatText('table');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <TableIcon size={14} className="text-slate-500" />
                      <span>Table Builder</span>
                    </button>
                    {onOpenSimulationModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenSimulationModal();
                          setActiveDropdown('none');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold"
                      >
                        <Atom size={14} />
                        <span>Simulation</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenImageModal();
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold"
                    >
                      <ImageIcon size={14} />
                      <span>Image / Figure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onInsertCustom('\n\n---pagebreak---\n\n');
                        setActiveDropdown('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5 font-bold"
                    >
                      <FileText size={14} />
                      <span>Page Break</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => onFormatText('ul')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Bullet List"
                >
                  <List size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onFormatText('ol')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onFormatText('quote')}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Callout / Quote"
                >
                  <Quote size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onFormatText('theorem')}
                  className="px-1.5 py-1 text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors font-extrabold text-[10px]"
                  title="Insert Theorem Box"
                >
                  [Thm]
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenTableBuilder) onOpenTableBuilder();
                    else onFormatText('table');
                  }}
                  className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Table Builder"
                >
                  <TableIcon size={13} />
                </button>
                {onOpenSimulationModal && (
                  <button
                    type="button"
                    onClick={onOpenSimulationModal}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                    title="Interactive Simulation"
                  >
                    <Atom size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenImageModal()}
                  className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Insert Figure / Image"
                >
                  <ImageIcon size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onInsertCustom('\n\n---pagebreak---\n\n')}
                  className="px-2 py-1 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap"
                  title="Insert Page Break"
                >
                  Break
                </button>
              </div>
            </>
          ) : (
            /* TAB 2: PAGE LAYOUT (Paper Size, Orientation, Margins, Columns, Running Header, Footer & Page Numbers) */
            <div className="flex items-center gap-2 shrink-0">
              {/* Paper Size & Orientation */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <select
                  value={pageSettings.paperSize}
                  onChange={e =>
                    onChangePageSettings({
                      ...pageSettings,
                      paperSize: e.target.value as PaperSize
                    })
                  }
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer py-0.5"
                  title="Paper Size"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                  <option value="B5">B5</option>
                </select>
                <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() =>
                    onChangePageSettings({
                      ...pageSettings,
                      orientation: pageSettings.orientation === 'portrait' ? 'landscape' : 'portrait'
                    })
                  }
                  className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                  title="Toggle Portrait / Landscape"
                >
                  {pageSettings.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                </button>
              </div>

              {/* Page Margins Presets + Direct mm Steppers */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Margins:</span>
                <select
                  value=""
                  onChange={e => {
                    const preset = MARGIN_PRESETS.find(p => p.id === e.target.value);
                    e.target.value = '';
                    if (preset) {
                      onChangePageSettings({
                        ...pageSettings,
                        margins: { ...preset.margins }
                      });
                    }
                  }}
                  className="bg-white dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 focus:outline-none cursor-pointer"
                  title="Margin Presets"
                >
                  <option value="" disabled hidden>
                    Preset...
                  </option>
                  {MARGIN_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <div className="hidden md:flex items-center gap-1 text-[10px] font-mono">
                  <label className="flex items-center gap-0.5 text-slate-500" title="Top Margin (mm)">
                    T
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={pageSettings.margins.top}
                      onChange={e => updateMarginSide('top', parseInt(e.target.value, 10))}
                      className="w-10 px-1 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-center font-bold text-slate-800 dark:text-slate-100"
                    />
                  </label>
                  <label className="flex items-center gap-0.5 text-slate-500" title="Bottom Margin (mm)">
                    B
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={pageSettings.margins.bottom}
                      onChange={e => updateMarginSide('bottom', parseInt(e.target.value, 10))}
                      className="w-10 px-1 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-center font-bold text-slate-800 dark:text-slate-100"
                    />
                  </label>
                  <label className="flex items-center gap-0.5 text-slate-500" title="Left Margin (mm)">
                    L
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={pageSettings.margins.left}
                      onChange={e => updateMarginSide('left', parseInt(e.target.value, 10))}
                      className="w-10 px-1 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-center font-bold text-slate-800 dark:text-slate-100"
                    />
                  </label>
                  <label className="flex items-center gap-0.5 text-slate-500" title="Right Margin (mm)">
                    R
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={pageSettings.margins.right}
                      onChange={e => updateMarginSide('right', parseInt(e.target.value, 10))}
                      className="w-10 px-1 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-center font-bold text-slate-800 dark:text-slate-100"
                    />
                  </label>
                </div>
              </div>

              {/* Columns Selector (Smart Active-Label by default) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onChangePageSettings({
                      ...pageSettings,
                      layoutMode: 'single',
                      columns: 1
                    })
                  }
                  className={`text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                    (!pageSettings.layoutMode || pageSettings.layoutMode === 'single') && pageSettings.columns !== 2
                      ? 'px-2.5 py-0.5 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                      : 'px-1.5 py-0.5 text-slate-600 dark:text-slate-400'
                  }`}
                  title="Single Column"
                >
                  <Layout size={12} />
                  {shouldShowLabel((!pageSettings.layoutMode || pageSettings.layoutMode === 'single') && pageSettings.columns !== 2, true) && <span>1-Col</span>}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChangePageSettings({
                      ...pageSettings,
                      layoutMode: 'two-column',
                      columns: 2
                    })
                  }
                  className={`text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                    pageSettings.layoutMode === 'two-column' || pageSettings.columns === 2
                      ? 'px-2.5 py-0.5 bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs scale-[1.02]'
                      : 'px-1.5 py-0.5 text-slate-600 dark:text-slate-400'
                  }`}
                  title="Two-Column Research Paper Layout"
                >
                  <Columns2 size={12} />
                  {shouldShowLabel(pageSettings.layoutMode === 'two-column' || pageSettings.columns === 2, true) && <span>2-Col</span>}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChangePageSettings({
                      ...pageSettings,
                      layoutMode: 'margin-rail',
                      columns: 1
                    })
                  }
                  className={`text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                    pageSettings.layoutMode === 'margin-rail'
                      ? 'px-2.5 py-0.5 bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs scale-[1.02]'
                      : 'px-1.5 py-0.5 text-slate-600 dark:text-slate-400'
                  }`}
                  title="Textbook Margin Rail"
                >
                  <PanelLeft size={12} />
                  {shouldShowLabel(pageSettings.layoutMode === 'margin-rail', true) && <span>Rail</span>}
                </button>
              </div>

              {/* Running Header Inline Control */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onChangePageSettings({
                      ...pageSettings,
                      runningHeader: {
                        ...pageSettings.runningHeader,
                        enabled: !pageSettings.runningHeader.enabled
                      }
                    })
                  }
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    pageSettings.runningHeader.enabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                  title="Toggle Running Header"
                >
                  Header {pageSettings.runningHeader.enabled ? 'ON' : 'OFF'}
                </button>
                {pageSettings.runningHeader.enabled && (
                  <>
                    <input
                      type="text"
                      value={pageSettings.runningHeader.title}
                      onChange={e =>
                        onChangePageSettings({
                          ...pageSettings,
                          runningHeader: {
                            ...pageSettings.runningHeader,
                            title: e.target.value
                          }
                        })
                      }
                      placeholder="Header Left Title..."
                      className="w-28 sm:w-32 px-1.5 py-0.5 text-[11px] rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={pageSettings.runningHeader.subtitle}
                      onChange={e =>
                        onChangePageSettings({
                          ...pageSettings,
                          runningHeader: {
                            ...pageSettings.runningHeader,
                            subtitle: e.target.value
                          }
                        })
                      }
                      placeholder="Right Subtitle..."
                      className="w-24 sm:w-28 px-1.5 py-0.5 text-[11px] rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </>
                )}
              </div>

              {/* Footer & Page Numbers Inline Control */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onChangePageSettings({
                      ...pageSettings,
                      pageNumbering: {
                        ...pageSettings.pageNumbering,
                        enabled: !pageSettings.pageNumbering.enabled
                      }
                    })
                  }
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-0.5 transition-colors ${
                    pageSettings.pageNumbering.enabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                  title="Toggle Footer Page Numbers"
                >
                  <Hash size={10} />
                  <span>Page # {pageSettings.pageNumbering.enabled ? 'ON' : 'OFF'}</span>
                </button>
                {pageSettings.pageNumbering.enabled && (
                  <>
                    <select
                      value={pageSettings.pageNumbering.format}
                      onChange={e =>
                        onChangePageSettings({
                          ...pageSettings,
                          pageNumbering: {
                            ...pageSettings.pageNumbering,
                            format: e.target.value as PageSettings['pageNumbering']['format']
                          }
                        })
                      }
                      className="bg-white dark:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 focus:outline-none cursor-pointer"
                      title="Page Number Format"
                    >
                      <option value="Page X of Y">Page 1 of N</option>
                      <option value="Page X">Page 1</option>
                      <option value="- X -">- 1 -</option>
                      <option value="X">1, 2, 3</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        onChangePageSettings({
                          ...pageSettings,
                          pageNumbering: {
                            ...pageSettings.pageNumbering,
                            position:
                              pageSettings.pageNumbering.position === 'bottom-center'
                                ? 'bottom-right'
                                : 'bottom-center'
                          }
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                      title="Toggle Page Number Alignment (Center / Right)"
                    >
                      {pageSettings.pageNumbering.position === 'bottom-center' ? 'Center' : 'Right'}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenSettingsModal}
                className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 shrink-0"
                title="All Page Setup Options"
              >
                <Settings size={12} />
                <span>More</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Section: Templates, Export HTML, Guide */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="md:hidden relative">
            <button
              type="button"
              onClick={e => toggleDropdown('actions', e)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-xs font-bold"
              title="Templates & Export"
            >
              <Sliders size={13} className="text-indigo-600 dark:text-indigo-400" />
              <ChevronDown size={10} />
            </button>
            {activeDropdown === 'actions' && (
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className={`${dropdownPos ? 'fixed' : 'absolute right-0 top-full mt-1'} w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-1`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('physics');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold"
                >
                  Physics Mechanics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('calculus');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold"
                >
                  Calculus &amp; Equations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('exam');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 font-bold"
                >
                  2-Column Research / Exam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNewDoc();
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 font-semibold border-t border-slate-100 dark:border-slate-800"
                >
                  Blank Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportHtml();
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 font-bold flex items-center gap-2"
                >
                  <Download size={13} />
                  <span>Export HTML</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:block relative">
            <button
              type="button"
              onClick={e => toggleDropdown('templates', e)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
              title="Academic Templates"
            >
              <LayoutTemplate size={13} className="text-indigo-500" />
              <span>Templates</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>
            {activeDropdown === 'templates' && (
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className={`${dropdownPos ? 'fixed' : 'absolute right-0 top-full mt-1'} w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-0.5`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('showcase');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200/60 dark:border-indigo-800/60 mb-1"
                >
                  ✨ Full Showcase Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('physics');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Physics Mechanics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('calculus');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Calculus &amp; Differential Eqs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('biology');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Biology Genetics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('textbook_vectors');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold"
                >
                  Vectors (Margin Rail)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate('exam');
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold"
                >
                  2-Column Research / Exam Paper
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNewDoc();
                    setActiveDropdown('none');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 font-semibold border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                >
                  New Blank Document
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenHelpModal}
            className="hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            title="User Guide"
          >
            <HelpCircle size={13} className="text-amber-600 dark:text-amber-400" />
            <span>Guide</span>
          </button>

          <button
            type="button"
            onClick={onExportHtml}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all shrink-0"
            title="Export Standalone HTML"
          >
            <Download size={13} />
            <span className="hidden md:inline">HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
}
