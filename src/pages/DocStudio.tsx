import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Sparkles, GripVertical, GripHorizontal, HelpCircle, Printer, BookOpen, Atom, Settings } from 'lucide-react';
import { NotebookDocument, DEFAULT_PAGE_SETTINGS, PageSettings, DocumentAsset } from '../types/notebook';
import { NOTEBOOK_TEMPLATES } from '../data/notebookTemplates';
import { downloadNotebookHtml } from '../utils/notebookExporter';
import { preloadDocumentFonts } from '../utils/fontManager';
import { sanitizeCachedFonts, migrateAndSanitizeCachedDoc } from '../utils/textFormatter';
import NotebookToolbar from '../components/notebook/NotebookToolbar';
import NotebookEditor, { NotebookEditorHandle } from '../components/notebook/NotebookEditor';
import NotebookPreview, { NotebookPreviewRef } from '../components/notebook/NotebookPreview';
import NotebookPageSettingsModal from '../components/notebook/NotebookPageSettingsModal';
import GoogleFontsStoreModal from '../components/notebook/GoogleFontsStoreModal';
import NotebookImageModal from '../components/notebook/NotebookImageModal';
import NotebookHelpModal from '../components/notebook/NotebookHelpModal';
import TableBuilderModal from '../components/notebook/TableBuilderModal';
import SimulationModal from '../components/notebook/SimulationModal';
import FlipbookModal from '../components/notebook/FlipbookModal';

const STORAGE_KEY = 'doc_studio_draft_v1';
const SPLIT_KEY = 'doc_studio_split_ratio';

export default function DocStudio() {
  const editorRef = useRef<NotebookEditorHandle>(null);
  const previewRef = useRef<NotebookPreviewRef>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Initialize document state from localStorage or default physics template
  const [doc, setDoc] = useState<NotebookDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return migrateAndSanitizeCachedDoc(parsed);
      }
    } catch (e) {
      console.error('Error loading saved notebook:', e);
    }

    // Default starting document
    const initialTemplate = NOTEBOOK_TEMPLATES.physics;
    return {
      id: 'doc-initial',
      title: initialTemplate.title,
      author: 'Student',
      subject: initialTemplate.subject,
      content: initialTemplate.content,
      pageSettings: { 
        ...DEFAULT_PAGE_SETTINGS,
        fontFamily: "'KaTeX_Main', serif"
      },
      customFonts: [],
      assets: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFontsStoreModalOpen, setIsFontsStoreModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTableBuilderOpen, setIsTableBuilderOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isFlipbookModalOpen, setIsFlipbookModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedAssetIdForEdit, setSelectedAssetIdForEdit] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<'saved' | 'saving'>('saved');

  // Undo / Redo History Stack
  const [history, setHistory] = useState<{ past: string[]; future: string[] }>({
    past: [],
    future: []
  });

  // Screen aspect ratio state: true if window is portrait (height > width)
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < window.innerHeight;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draggable split ratio (20% to 80%)
  const [splitPercent, setSplitPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SPLIT_KEY);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 20 && val <= 80) return val;
      }
    } catch {}
    return 50;
  });
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);

  // Preload any custom Google fonts on load
  useEffect(() => {
    preloadDocumentFonts(doc.customFonts);
  }, [doc.customFonts]);

  // Autosave to localStorage on changes
  useEffect(() => {
    setSavedStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
        setSavedStatus('saved');
      } catch (err) {
        console.error('Failed to autosave notebook:', err);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [doc]);

  // Draggable Split divider pointer move & up handlers (supports both horizontal and vertical)
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isPortrait) {
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const relativeY = clientY - rect.top;
        const rawPercent = (relativeY / rect.height) * 100;
        const clamped = Math.min(Math.max(rawPercent, 20), 80);
        setSplitPercent(clamped);
      } else {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const relativeX = clientX - rect.left;
        const rawPercent = (relativeX / rect.width) * 100;
        const clamped = Math.min(Math.max(rawPercent, 20), 80);
        setSplitPercent(clamped);
      }
    };

    const handlePointerUp = () => {
      setIsDraggingSplitter(false);
      try {
        localStorage.setItem(SPLIT_KEY, splitPercent.toString());
      } catch {}
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDraggingSplitter, splitPercent, isPortrait]);

  // Content update helper with undo history tracking
  const handleUpdateContent = (newContent: string, pushHistory = true) => {
    setDoc(prev => {
      if (prev.content === newContent) return prev;
      if (pushHistory) {
        setHistory(h => ({
          past: [...h.past.slice(-35), prev.content],
          future: []
        }));
      }
      return {
        ...prev,
        content: newContent,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleUndo = () => {
    if (history.past.length === 0) return;
    const prevSnapshot = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    setHistory(h => ({
      past: newPast,
      future: [doc.content, ...h.future.slice(0, 35)]
    }));
    setDoc(prev => ({
      ...prev,
      content: prevSnapshot,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const nextSnapshot = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory(h => ({
      past: [...h.past.slice(-35), doc.content],
      future: newFuture
    }));
    setDoc(prev => ({
      ...prev,
      content: nextSnapshot,
      updatedAt: new Date().toISOString()
    }));
  };

  // Keyboard shortcut for Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return; // Let native input handle undo inside raw textarea
      }
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') ||
        (cmdOrCtrl && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, doc.content]);

  // Image Asset insertion and update handlers
  const handleOpenImageStudio = (assetId?: string) => {
    setSelectedAssetIdForEdit(assetId || null);
    setIsImageModalOpen(true);
  };

  const handleInsertAsset = (asset: DocumentAsset, markdownToken: string) => {
    setDoc(prev => ({
      ...prev,
      assets: {
        ...(prev.assets || {}),
        [asset.id]: asset
      },
      updatedAt: new Date().toISOString()
    }));
    handleInsertCustom(markdownToken);
  };

  const handleUpdateAsset = (asset: DocumentAsset) => {
    setDoc(prev => ({
      ...prev,
      assets: {
        ...(prev.assets || {}),
        [asset.id]: asset
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDeleteAsset = (assetId: string) => {
    setDoc(prev => {
      const newAssets = { ...(prev.assets || {}) };
      delete newAssets[assetId];
      return {
        ...prev,
        assets: newAssets,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleUpdateAssets = (newAssets: Record<string, DocumentAsset>) => {
    setDoc(prev => ({
      ...prev,
      assets: newAssets,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleInsertTable = (markdown: string) => {
    handleInsertCustom(markdown);
  };

  const handleInsertSimulation = (markdown: string) => {
    handleInsertCustom(markdown);
  };

  // Page Settings update helper
  const handleUpdatePageSettings = (newSettings: PageSettings) => {
    setDoc(prev => ({
      ...prev,
      pageSettings: newSettings,
      updatedAt: new Date().toISOString()
    }));
  };

  // Add Google Font to installed custom fonts list
  const handleAddGoogleFont = (fontFamily: string) => {
    if (!doc.customFonts.includes(fontFamily)) {
      setDoc(prev => ({
        ...prev,
        customFonts: [...prev.customFonts, fontFamily]
      }));
    }
  };

  // Formatting delegator: routes formatting to preview when active or in preview mode, or editor
  const handleFormatText = (type: string, param?: string) => {
    if (viewMode === 'preview' || previewRef.current?.hasSelection()) {
      const handled = previewRef.current?.formatSelection(type, param);
      if (handled) return;
    }

    if (editorRef.current) {
      editorRef.current.formatSelection(type, param);
    } else if (previewRef.current) {
      previewRef.current.formatSelection(type, param);
    }
  };

  // Insert Custom snippet (works in both code editor and Word-preview mode)
  const handleInsertCustom = (text: string) => {
    if (editorRef.current) {
      editorRef.current.insertAtCursor(text);
    } else {
      setDoc(prev => ({
        ...prev,
        content: `${prev.content.trimEnd()}\n\n${text}\n`,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // HTML Export handler
  const handleExportHtml = () => {
    downloadNotebookHtml(doc);
  };

  // Load Template
  const handleLoadTemplate = (key: string) => {
    const tmpl = NOTEBOOK_TEMPLATES[key];
    if (!tmpl) return;
    setDoc(prev => ({
      ...prev,
      title: tmpl.title,
      subject: tmpl.subject,
      content: tmpl.content,
      updatedAt: new Date().toISOString()
    }));
  };

  // Blank New Document
  const handleNewDoc = () => {
    if (window.confirm('Start a new blank document? Your current draft is autosaved.')) {
      setDoc({
        id: `doc-${Date.now()}`,
        title: 'Untitled Academic Note',
        author: 'Student',
        subject: '',
        content: '# Untitled Note\n\nStart typing here...\n',
        pageSettings: { 
          ...DEFAULT_PAGE_SETTINGS,
          fontFamily: "'KaTeX_Main', serif"
        },
        customFonts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 dark:bg-slate-950 overflow-hidden print:overflow-visible print:h-auto">
      {/* Top Application Navbar */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 z-40 select-none print:hidden shadow-xs">
        {/* Left: Back Link & Document Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Return to CBT Platform"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Editable Document Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-md sm:max-w-lg">
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={doc.title}
                onChange={e => setDoc(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document Title..."
                className="w-full text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors truncate"
              />
            </div>
          </div>
        </div>

        {/* Right: Settings Button, Flipbook Button, Print Button, Help Button, Autosave Status, & Studio Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Settings & Templates Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0 border border-slate-200/80 dark:border-slate-700/80"
            title="Page Dimensions, Layout, and Academic Templates"
          >
            <Settings size={14} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Flipbook 3D Reading Mode Button (Positioned before print button) */}
          <button
            type="button"
            onClick={() => setIsFlipbookModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-500/25 active:scale-95 shrink-0"
            title="Read as Flipbook (Interactive 3D page turning)"
          >
            <BookOpen size={14} className="shrink-0" />
            <span className="hidden sm:inline">Flipbook</span>
          </button>

          {/* Prominent High-Contrast Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shadow-blue-500/25 active:scale-95 shrink-0"
            title="Print or Save as PDF (1:1 paper dimensions)"
          >
            <Printer size={14} className="shrink-0" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors"
            title="Open Document Studio User Guide & Help"
          >
            <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Guide &amp; Help</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            {savedStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden md:inline">Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={13} />
                <span className="hidden md:inline">Autosaved</span>
              </span>
            )}
          </div>

          <div className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800/60 hidden lg:flex">
            <Sparkles size={11} />
            <span>Document Studio</span>
          </div>
        </div>
      </header>

      {/* Word-like Ribbon Toolbar */}
      <div className="print:hidden">
        <NotebookToolbar
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onFormatText={handleFormatText}
          onInsertCustom={handleInsertCustom}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenTableBuilder={() => setIsTableBuilderOpen(true)}
          onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
          onOpenFlipbookModal={() => setIsFlipbookModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenFontsStoreModal={() => setIsFontsStoreModalOpen(true)}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onPrint={handlePrint}
          onExportHtml={handleExportHtml}
          onLoadTemplate={handleLoadTemplate}
          onNewDoc={handleNewDoc}
          installedFonts={doc.customFonts}
          pageSettings={doc.pageSettings}
          onChangePageSettings={handleUpdatePageSettings}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      {/* Main Workspace Stage */}
      <main
        ref={containerRef}
        className={`flex-1 flex overflow-hidden relative print:overflow-visible print:h-auto ${
          isPortrait ? 'flex-col' : 'flex-row'
        } ${
          isDraggingSplitter
            ? (isPortrait ? 'select-none cursor-row-resize pointer-events-auto' : 'select-none cursor-col-resize pointer-events-auto')
            : ''
        }`}
      >
        {/* IN PORTRAIT MODE: Top is Live Paginated Preview, Bottom is Editor */}
        {isPortrait ? (
          <>
            {/* Top: Paginated Preview Pane */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div
                className="w-full flex min-h-0 print:block print:w-full"
                style={{
                  height: viewMode === 'split' ? `${splitPercent}%` : '100%',
                  pointerEvents: isDraggingSplitter ? 'none' : 'auto'
                }}
              >
                <NotebookPreview
                  ref={previewRef}
                  document={doc}
                  onUpdateContent={handleUpdateContent}
                  onChangePageSettings={handleUpdatePageSettings}
                  onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
                  onOpenTableModal={() => setIsTableBuilderOpen(true)}
                  onOpenFlipbookModal={() => setIsFlipbookModalOpen(true)}
                  onOpenImageStudio={handleOpenImageStudio}
                  onInsertPageBreak={() => handleInsertCustom('\n\n---pagebreak---\n\n')}
                  isPortrait={true}
                />
              </div>
            )}

            {/* Draggable Divider for Portrait Split (Vertical Drag) */}
            {viewMode === 'split' && (
              <div
                role="separator"
                aria-orientation="horizontal"
                tabIndex={0}
                onMouseDown={e => {
                  e.preventDefault();
                  setIsDraggingSplitter(true);
                }}
                onTouchStart={() => {
                  setIsDraggingSplitter(true);
                }}
                className="h-3 w-full relative shrink-0 z-30 cursor-row-resize group flex items-center justify-center print:hidden bg-slate-200/90 dark:bg-slate-800/90 hover:bg-blue-500 active:bg-blue-600 transition-colors border-y border-slate-300 dark:border-slate-700"
                title="Drag vertically to resize Top Preview and Bottom Editor"
              >
                <div className="w-12 h-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-400 group-active:text-blue-600 transition-all pointer-events-none">
                  <GripHorizontal size={14} />
                </div>
              </div>
            )}

            {/* Bottom: Editor Pane */}
            {(viewMode === 'split' || viewMode === 'edit') && (
              <div
                className="w-full print:hidden flex flex-col min-h-0 flex-1"
                style={{
                  height: viewMode === 'split' ? `${100 - splitPercent}%` : '100%',
                  pointerEvents: isDraggingSplitter ? 'none' : 'auto'
                }}
              >
                <NotebookEditor
                  ref={editorRef}
                  content={doc.content}
                  onChangeContent={handleUpdateContent}
                  fontFamily={doc.pageSettings.fontFamily}
                  assets={doc.assets}
                  onUpdateAssets={handleUpdateAssets}
                  onOpenTableBuilder={() => setIsTableBuilderOpen(true)}
                  onOpenImageModal={() => setIsImageModalOpen(true)}
                  onPrint={handlePrint}
                />
              </div>
            )}
          </>
        ) : (
          /* IN LANDSCAPE MODE: Left is Editor, Right is Paginated Preview */
          <>
            {/* Left: Editor Pane */}
            {(viewMode === 'split' || viewMode === 'edit') && (
              <div
                className="h-full print:hidden flex flex-col min-w-0"
                style={{
                  width: viewMode === 'split' ? `${splitPercent}%` : '100%',
                  pointerEvents: isDraggingSplitter ? 'none' : 'auto'
                }}
              >
                <NotebookEditor
                  ref={editorRef}
                  content={doc.content}
                  onChangeContent={handleUpdateContent}
                  fontFamily={doc.pageSettings.fontFamily}
                  assets={doc.assets}
                  onUpdateAssets={handleUpdateAssets}
                  onOpenTableBuilder={() => setIsTableBuilderOpen(true)}
                  onOpenImageModal={() => setIsImageModalOpen(true)}
                  onPrint={handlePrint}
                />
              </div>
            )}

            {/* Draggable Divider for Landscape Split (Horizontal Drag) */}
            {viewMode === 'split' && (
              <div
                role="separator"
                aria-orientation="vertical"
                tabIndex={0}
                onMouseDown={e => {
                  e.preventDefault();
                  setIsDraggingSplitter(true);
                }}
                onTouchStart={() => {
                  setIsDraggingSplitter(true);
                }}
                className="w-3 h-full relative shrink-0 z-30 cursor-col-resize group flex items-center justify-center print:hidden bg-slate-200/90 dark:bg-slate-800/90 hover:bg-blue-500 active:bg-blue-600 transition-colors border-x border-slate-300 dark:border-slate-700"
                title="Drag horizontally to resize Editor and Preview"
              >
                <div className="w-4 h-9 -ml-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-400 group-active:text-blue-600 transition-all pointer-events-none">
                  <GripVertical size={12} />
                </div>
              </div>
            )}

            {/* Right: Live Paginated Preview Pane */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div
                className="h-full flex min-w-0 print:block print:w-full flex-1"
                style={{
                  width: viewMode === 'split' ? `${100 - splitPercent}%` : '100%',
                  pointerEvents: isDraggingSplitter ? 'none' : 'auto'
                }}
              >
                <NotebookPreview
                  ref={previewRef}
                  document={doc}
                  onUpdateContent={handleUpdateContent}
                  onChangePageSettings={handleUpdatePageSettings}
                  onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
                  onOpenTableModal={() => setIsTableBuilderOpen(true)}
                  onOpenFlipbookModal={() => setIsFlipbookModalOpen(true)}
                  onOpenImageStudio={handleOpenImageStudio}
                  onInsertPageBreak={() => handleInsertCustom('\n\n---pagebreak---\n\n')}
                  isPortrait={false}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <NotebookPageSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={doc.pageSettings}
        onUpdateSettings={handleUpdatePageSettings}
        onLoadTemplate={handleLoadTemplate}
      />

      <GoogleFontsStoreModal
        isOpen={isFontsStoreModalOpen}
        onClose={() => setIsFontsStoreModalOpen(false)}
        installedFonts={doc.customFonts}
        onAddFont={handleAddGoogleFont}
      />

      <NotebookImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedAssetIdForEdit(null);
        }}
        onInsertImage={handleInsertCustom}
        onInsertAsset={handleInsertAsset}
        onUpdateAsset={handleUpdateAsset}
        onDeleteAsset={handleDeleteAsset}
        assets={doc.assets}
        initialEditAssetId={selectedAssetIdForEdit}
      />

      <TableBuilderModal
        isOpen={isTableBuilderOpen}
        onClose={() => setIsTableBuilderOpen(false)}
        onInsertTable={handleInsertTable}
      />

      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onInsertSimulation={handleInsertSimulation}
      />

      <FlipbookModal
        isOpen={isFlipbookModalOpen}
        onClose={() => setIsFlipbookModalOpen(false)}
        document={doc}
      />

      <NotebookHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
