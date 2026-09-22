import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Sigma,
  Atom,
  Table,
  Image as ImageIcon,
  BookOpen,
  SplitSquareVertical,
  Type,
  Palette,
  Highlighter,
  ArrowDownUp,
  ArrowLeftRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Edit3,
  Sliders
} from 'lucide-react';
import { NotebookDocument, PageSettings, PAPER_DIMENSIONS, DocumentAsset } from '../../types/notebook';
import { parseDocumentToPages } from '../../utils/notebookRenderer';
import PreviewSelectionToolbar, { SelectionCoords } from './PreviewSelectionToolbar';
import { 
  applyFormattingToMarkdown, 
  updateMarkdownTextBlock,
  updateMarkdownTableCell, 
  updateSimulationHeightInMarkdown, 
  modifyMarkdownTableStructure,
  updateImageInMarkdown,
  deleteImageInMarkdown
} from '../../utils/textFormatter';

export interface NotebookPreviewRef {
  formatSelection: (action: string, value?: string) => boolean;
  hasSelection: () => boolean;
}

interface NotebookPreviewProps {
  document: NotebookDocument;
  onUpdateContent?: (newContent: string) => void;
  onChangePageSettings?: (newSettings: PageSettings) => void;
  onOpenSimulationModal?: () => void;
  onOpenTableModal?: () => void;
  onOpenFlipbookModal?: () => void;
  onOpenImageStudio?: (assetId?: string) => void;
  onInsertPageBreak?: () => void;
  isPortrait?: boolean;
}

const NotebookPreview = forwardRef<NotebookPreviewRef, NotebookPreviewProps>(({
  document: doc,
  onUpdateContent,
  onChangePageSettings,
  onOpenSimulationModal,
  onOpenTableModal,
  onOpenFlipbookModal,
  onOpenImageStudio,
  onInsertPageBreak,
  isPortrait = false
}, ref) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [scrollDirection, setScrollDirection] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectionCoords, setSelectionCoords] = useState<SelectionCoords | null>(null);
  const [selectedFigure, setSelectedFigure] = useState<{
    src: string;
    assetSrc: string;
    assetId?: string;
    align: string;
    widthPercent: number;
    top: number;
    left: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialFitDone = useRef(false);

  const pages = parseDocumentToPages(doc.content, doc.assets);
  const settings = doc.pageSettings;
  const paperDim = settings.paperSize !== 'Custom'
    ? PAPER_DIMENSIONS[settings.paperSize]
    : { width: settings.customWidthMm, height: settings.customHeightMm, name: 'Custom' };

  const pageWidthMm = settings.orientation === 'portrait' ? paperDim.width : paperDim.height;
  const pageHeightMm = settings.orientation === 'portrait' ? paperDim.height : paperDim.width;

  // 1mm = 3.7795275591 pixels at 96 DPI
  const baseWidthPx = Math.round(pageWidthMm * 3.7795);
  const baseHeightPx = Math.round(pageHeightMm * 3.7795);

  // Scaled dimensions that the outer page wrapper occupies in layout
  const scaledWidthPx = Math.round(baseWidthPx * zoomLevel);
  const scaledHeightPx = Math.round(baseHeightPx * zoomLevel);

  // Zoom Controls: Keeps font sizes relative to the paper dimensions intact by scaling the paper canvas
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(2.5, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.25, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  const fitWidth = useCallback(() => {
    if (!containerRef.current || baseWidthPx <= 0) return;
    const availableWidth = containerRef.current.clientWidth - 48; // padding
    if (availableWidth > 60) {
      const calculated = Math.min(2.0, Math.max(0.25, availableWidth / baseWidthPx));
      setZoomLevel(Number(calculated.toFixed(2)));
    }
  }, [baseWidthPx]);

  const fitPage = useCallback(() => {
    if (!containerRef.current || baseWidthPx <= 0 || baseHeightPx <= 0) return;
    const availableWidth = containerRef.current.clientWidth - 48;
    const availableHeight = containerRef.current.clientHeight - 48;
    if (availableWidth > 60 && availableHeight > 60) {
      const scaleX = availableWidth / baseWidthPx;
      const scaleY = availableHeight / baseHeightPx;
      const calculated = Math.min(1.5, Math.max(0.25, Math.min(scaleX, scaleY)));
      setZoomLevel(Number(calculated.toFixed(2)));
    }
  }, [baseWidthPx, baseHeightPx]);

  // Initial fit & auto-fit on orientation change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPortrait) {
        fitWidth();
      } else {
        fitPage();
      }
      isInitialFitDone.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, [isPortrait, fitWidth, fitPage, settings.paperSize, settings.orientation]);

  // Listen to container resizing for responsive fit if not manually adjusted
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!isInitialFitDone.current) {
        if (isPortrait) {
          fitWidth();
        } else {
          fitPage();
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isPortrait, fitWidth, fitPage]);

  // Scroll to a specific page
  const scrollToPage = (index: number) => {
    if (!containerRef.current) return;
    const pageEls = containerRef.current.querySelectorAll('.page-frame-wrapper');
    if (pageEls[index]) {
      pageEls[index].scrollIntoView({
        behavior: 'smooth',
        block: scrollDirection === 'vertical' ? 'center' : 'nearest',
        inline: scrollDirection === 'horizontal' ? 'center' : 'nearest'
      });
      setActivePageIndex(index);
    }
  };

  // Track active page on scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const pageEls = containerRef.current.querySelectorAll('.page-frame-wrapper');
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    pageEls.forEach((el, idx) => {
      const elRect = el.getBoundingClientRect();
      const elCenterX = elRect.left + elRect.width / 2;
      const elCenterY = elRect.top + elRect.height / 2;
      const dist = scrollDirection === 'horizontal'
        ? Math.abs(elCenterX - centerX)
        : Math.abs(elCenterY - centerY);

      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activePageIndex) {
      setActivePageIndex(closestIdx);
    }
  };

  // ----------------------------------------------------
  // Interactive Simulation Resizing
  // ----------------------------------------------------
  const [resizingSim, setResizingSim] = useState<{
    simIdx: number;
    startY: number;
    startHeightPx: number;
    iframeBox: HTMLElement;
  } | null>(null);

  useEffect(() => {
    if (!resizingSim) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = (e.clientY - resizingSim.startY) / zoomLevel;
      const newHeight = Math.max(180, Math.min(950, Math.round(resizingSim.startHeightPx + deltaY)));
      resizingSim.iframeBox.style.height = `${newHeight}px`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      const deltaY = (e.clientY - resizingSim.startY) / zoomLevel;
      const finalHeight = Math.max(180, Math.min(950, Math.round(resizingSim.startHeightPx + deltaY)));
      
      if (onUpdateContent) {
        const updated = updateSimulationHeightInMarkdown(doc.content, resizingSim.simIdx, finalHeight);
        if (updated !== doc.content) {
          onUpdateContent(updated);
        }
      }
      setResizingSim(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingSim, zoomLevel, doc.content, onUpdateContent]);

  // ----------------------------------------------------
  // Image resize via mouse interaction on preview
  // ----------------------------------------------------
  const [resizingImg, setResizingImg] = useState<{
    src: string;
    assetSrc: string;
    startX: number;
    startWidthPx: number;
    parentWidthPx: number;
  } | null>(null);

  // Column resize via dragging column border
  const [resizingCol, setResizingCol] = useState<{
    thElement: HTMLElement;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDownOnImageResize = (
    e: React.MouseEvent | MouseEvent,
    imgElement: HTMLImageElement
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const figure = (imgElement.closest('.notebook-figure') || imgElement.parentElement) as HTMLElement;
    const pageSheet = (imgElement.closest('.page-sheet-content') || figure?.parentElement) as HTMLElement | null;
    const parentWidthPx = pageSheet ? Math.max(300, pageSheet.clientWidth - 80) : baseWidthPx;
    const currentWidthPx = imgElement.clientWidth;
    const assetSrc = imgElement.getAttribute('data-asset-src') || imgElement.src;

    setResizingImg({
      src: imgElement.src,
      assetSrc,
      startX: e.clientX,
      startWidthPx: currentWidthPx,
      parentWidthPx
    });
  };

  useEffect(() => {
    if (!resizingImg) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizingImg.startX) / zoomLevel;
      const newWidthPx = Math.max(80, resizingImg.startWidthPx + deltaX);
      const newPercent = Math.min(100, Math.max(15, Math.round((newWidthPx / resizingImg.parentWidthPx) * 100)));

      if (onUpdateContent) {
        const targetSrc = resizingImg.assetSrc || resizingImg.src;
        const updated = updateImageInMarkdown(doc.content, targetSrc, `${newPercent}%`, undefined, undefined, doc.assets);
        if (updated !== doc.content) {
          onUpdateContent(updated);
        }
      }
    };

    const handleMouseUp = () => {
      setResizingImg(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingImg, zoomLevel, doc.content, onUpdateContent]);

  // Handle column width dragging
  useEffect(() => {
    if (!resizingCol) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizingCol.startX) / zoomLevel;
      const newWidth = Math.max(45, resizingCol.startWidth + deltaX);
      resizingCol.thElement.style.width = `${newWidth}px`;
      resizingCol.thElement.style.minWidth = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, zoomLevel]);

  // Listen for mousedown on column, simulation, or image resizers inside preview
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDownCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check image resize handle
      const imgHandle = target.closest('[data-image-resize-handle]') as HTMLElement | null;
      if (imgHandle) {
        e.preventDefault();
        e.stopPropagation();
        const figure = imgHandle.closest('.notebook-figure');
        const img = figure?.querySelector('img') as HTMLImageElement | null;
        if (img) {
          handleMouseDownOnImageResize(e, img);
        }
        return;
      }

      // Check simulation resize handle
      const simHandle = target.closest('[data-sim-resize]') as HTMLElement | null;
      if (simHandle) {
        e.preventDefault();
        e.stopPropagation();
        const simIdx = parseInt(simHandle.getAttribute('data-sim-resize') || '0', 10);
        const wrapper = simHandle.closest('.notebook-simulation-wrapper');
        const iframeBox = wrapper?.querySelector('.simulation-iframe-box') as HTMLElement | null;
        if (iframeBox) {
          setResizingSim({
            simIdx,
            startY: e.clientY,
            startHeightPx: iframeBox.clientHeight,
            iframeBox
          });
        }
        return;
      }

      // Check table column resizer
      if (target.getAttribute('data-col-resizer') !== null) {
        e.preventDefault();
        e.stopPropagation();
        const th = target.closest('th');
        if (th) {
          setResizingCol({
            thElement: th,
            startX: e.clientX,
            startWidth: th.offsetWidth
          });
        }
      }
    };

    container.addEventListener('mousedown', handleMouseDownCapture, true);
    return () => {
      container.removeEventListener('mousedown', handleMouseDownCapture, true);
    };
  }, []);

  // Listen for table cell & text block blur to update markdown content
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleBlurCapture = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 1. Table cell edit
      if (target.getAttribute('data-table-cell') === 'true') {
        const tableIdx = parseInt(target.getAttribute('data-table-idx') || '0', 10);
        const rowIdx = parseInt(target.getAttribute('data-row-idx') || '0', 10);
        const colIdx = parseInt(target.getAttribute('data-col-idx') || '0', 10);
        const newText = target.innerText.trim();

        if (onUpdateContent) {
          const nextContent = updateMarkdownTableCell(doc.content, tableIdx, rowIdx, colIdx, newText);
          if (nextContent !== doc.content) {
            onUpdateContent(nextContent);
          }
        }
      }

      // 2. Direct In-Sheet Text Block edit (Headings, Paragraphs, List Items)
      if (target.getAttribute('data-sheet-block')) {
        const rawOld = target.getAttribute('data-raw-text');
        const newText = target.innerText.trim();
        const blockType = target.getAttribute('data-sheet-block') as any;

        if (rawOld && newText && rawOld.trim() !== newText) {
          if (onUpdateContent) {
            const nextContent = updateMarkdownTextBlock(doc.content, rawOld, newText, blockType);
            if (nextContent !== doc.content) {
              onUpdateContent(nextContent);
            }
          }
        }
      }
    };

    container.addEventListener('blur', handleBlurCapture, true);
    return () => {
      container.removeEventListener('blur', handleBlurCapture, true);
    };
  }, [doc.content, onUpdateContent]);

  // Expose imperative handle for top ribbon toolbar formatting
  useImperativeHandle(ref, () => ({
    formatSelection: (action: string, value?: string) => {
      if (selectionCoords) {
        handleApplySelectionFormat(action, value);
        return true;
      }
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const text = sel.toString().trim();
        if (text) {
          const range = sel.getRangeAt(0);
          const containerText = range.commonAncestorContainer.textContent || '';
          const startOffset = range.startOffset;
          const endOffset = range.endOffset;
          const contextBefore = containerText.slice(Math.max(0, startOffset - 25), startOffset);
          const contextAfter = containerText.slice(endOffset, endOffset + 25);
          const updated = applyFormattingToMarkdown({
            content: doc.content,
            selectedText: text,
            action,
            value,
            contextBefore,
            contextAfter
          });
          if (updated !== doc.content && onUpdateContent) {
            onUpdateContent(updated);
          }
          sel.removeAllRanges();
          return true;
        }
      }
      return false;
    },
    hasSelection: () => {
      if (selectionCoords) return true;
      const sel = window.getSelection();
      return !!(sel && !sel.isCollapsed && sel.toString().trim().length > 0);
    }
  }));

  // ----------------------------------------------------
  // Word-Editor: Text Selection Detection on the Live Preview
  // ----------------------------------------------------
  const handleSheetMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.simulation-resize-handle') || target.closest('[data-col-resizer]')) {
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelectionCoords(null);
      return;
    }

    const text = sel.toString().trim();
    if (!text || text.length < 1) {
      setSelectionCoords(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setSelectionCoords(null);
      return;
    }

    // Extract surrounding context
    const containerText = range.commonAncestorContainer.textContent || '';
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const contextBefore = containerText.slice(Math.max(0, startOffset - 25), startOffset);
    const contextAfter = containerText.slice(endOffset, endOffset + 25);

    setSelectionCoords({
      top: rect.top,
      left: rect.left + rect.width / 2,
      selectedText: text,
      contextBefore,
      contextAfter
    });
  };

  const handleApplySelectionFormat = (action: string, value?: string) => {
    if (!selectionCoords || !onUpdateContent) return;

    const updated = applyFormattingToMarkdown({
      content: doc.content,
      selectedText: selectionCoords.selectedText,
      action,
      value,
      contextBefore: selectionCoords.contextBefore,
      contextAfter: selectionCoords.contextAfter
    });

    if (updated !== doc.content) {
      onUpdateContent(updated);
    }
    setSelectionCoords(null);
    window.getSelection()?.removeAllRanges();
  };

  // Quick insertion helpers from the Word processor ribbon
  const handleQuickInsert = (snippet: string) => {
    if (!onUpdateContent) return;
    const nextContent = `${doc.content.trimEnd()}\n\n${snippet}\n`;
    onUpdateContent(nextContent);
  };

  // Click handler on sheet images and table actions
  const handleSheetClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check table floating action buttons (+ Row, + Col, - Row)
    const actionBtn = target.closest('[data-table-action]') as HTMLElement | null;
    if (actionBtn) {
      e.preventDefault();
      e.stopPropagation();
      const action = actionBtn.getAttribute('data-table-action') as 'add-row' | 'add-col' | 'remove-row';
      const tableIdx = parseInt(actionBtn.getAttribute('data-table-idx') || '0', 10);
      if (onUpdateContent) {
        const nextContent = modifyMarkdownTableStructure(doc.content, tableIdx, action);
        onUpdateContent(nextContent);
      }
      return;
    }

    const figureEl = target.closest('.notebook-figure') as HTMLElement | null;
    const imgEl = target.tagName === 'IMG' ? (target as HTMLImageElement) : figureEl?.querySelector('img') as HTMLImageElement | null;

    if (imgEl && figureEl) {
      const img = imgEl;
      const figure = figureEl;
      containerRef.current?.querySelectorAll('.img-resize-handle').forEach(el => el.remove());

      const handle = window.document.createElement('div');
      handle.className = 'img-resize-handle absolute -right-2 -bottom-2 w-4 h-4 bg-blue-600 rounded-full cursor-se-resize border-2 border-white shadow-md z-20';
      figure.style.position = 'relative';
      figure.appendChild(handle);

      handle.addEventListener('mousedown', (evt) => {
        handleMouseDownOnImageResize(evt as any, img);
      });

      const assetSrc = img.getAttribute('data-asset-src') || img.src;
      let assetIdMatch = assetSrc.match(/asset:\/\/([a-zA-Z0-9_-]+)/);
      let assetId = assetIdMatch ? assetIdMatch[1] : undefined;

      // Look up asset id by dataUrl in doc.assets if not an asset:// URL
      if (!assetId && doc.assets) {
        for (const [id, asset] of Object.entries(doc.assets)) {
          const assetObj = asset as DocumentAsset;
          if (assetObj && (assetObj.dataUrl === assetSrc || assetObj.dataUrl === img.src)) {
            assetId = id;
            break;
          }
        }
      }

      const rect = (figure || img).getBoundingClientRect();
      const rawAlign = figure.getAttribute('data-img-align') || '';
      const isFloatLeft = figure.classList.contains('float-left') || rawAlign === 'float-left';
      const isFloatRight = figure.classList.contains('float-right') || rawAlign === 'float-right';
      const isBlockLeft = rawAlign === 'block-left' || rawAlign === 'left';
      const isBlockRight = rawAlign === 'block-right' || rawAlign === 'right';
      const align = isFloatLeft ? 'float-left' : isFloatRight ? 'float-right' : isBlockLeft ? 'block-left' : isBlockRight ? 'block-right' : 'center';

      setSelectedFigure({
        src: img.src,
        assetSrc,
        assetId,
        align,
        widthPercent: parseInt(img.style.width || figure.getAttribute('data-img-width') || '75', 10) || 75,
        top: Math.max(10, rect.top - 50),
        left: rect.left + rect.width / 2
      });
    } else {
      containerRef.current?.querySelectorAll('.img-resize-handle').forEach(el => el.remove());
      if (!target.closest('.notebook-image-toolbar')) {
        setSelectedFigure(null);
      }
    }
  };

  const handleUpdateImageAlignment = (newAlign: string) => {
    if (!selectedFigure || !onUpdateContent) return;
    const targetSrc = selectedFigure.assetSrc || selectedFigure.src;
    const updated = updateImageInMarkdown(doc.content, targetSrc, undefined, newAlign, undefined, doc.assets);
    if (updated !== doc.content) {
      onUpdateContent(updated);
    }
    setSelectedFigure(prev => prev ? { ...prev, align: newAlign } : null);
  };

  const handleUpdateImageWidth = (newWidthPct: number) => {
    if (!selectedFigure || !onUpdateContent) return;
    const targetSrc = selectedFigure.assetSrc || selectedFigure.src;
    const updated = updateImageInMarkdown(doc.content, targetSrc, `${newWidthPct}%`, undefined, undefined, doc.assets);
    if (updated !== doc.content) {
      onUpdateContent(updated);
    }
    setSelectedFigure(prev => prev ? { ...prev, widthPercent: newWidthPct } : null);
  };

  const handleDeleteImage = () => {
    if (!selectedFigure || !onUpdateContent) return;
    const targetSrc = selectedFigure.assetSrc || selectedFigure.src;
    const updated = deleteImageInMarkdown(doc.content, targetSrc, doc.assets);
    if (updated !== doc.content) {
      onUpdateContent(updated);
    }
    setSelectedFigure(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-150 dark:bg-slate-950 overflow-hidden relative select-none">
      {/* Word-Processor Top Ribbon */}
      <div className="h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between z-20 shrink-0 text-xs shadow-2xs gap-2">
        {/* Left: Document Status & Page Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200/50 dark:border-blue-800/50">
            <span>📄</span>
            <span>Document Preview</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'} · LaTeX Typography
          </span>
        </div>

        {/* Right: Scroll Direction (Vertical vs Horizontal), Page Navigation & Canvas Zoom */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Scroll Direction Switcher: Vertical (down) vs Horizontal (side-by-side) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setScrollDirection('vertical')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                scrollDirection === 'vertical'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Vertical Page Scrolling (Scroll top-to-bottom through pages)"
            >
              <ArrowDownUp size={12} />
              <span className="hidden sm:inline">Vertical</span>
            </button>
            <button
              type="button"
              onClick={() => setScrollDirection('horizontal')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                scrollDirection === 'horizontal'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Horizontal Page Scrolling (Side-by-side reading stream)"
            >
              <ArrowLeftRight size={12} />
              <span className="hidden sm:inline">Horizontal</span>
            </button>
          </div>

          {/* Page-by-page jump controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              disabled={activePageIndex <= 0}
              onClick={() => scrollToPage(activePageIndex - 1)}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1 font-mono whitespace-nowrap">
              {activePageIndex + 1} / {pages.length}
            </span>
            <button
              type="button"
              disabled={activePageIndex >= pages.length - 1}
              onClick={() => scrollToPage(activePageIndex + 1)}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Page"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Canvas Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Zoom out (-10%)"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Reset to 100% (Actual Print Size)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Zoom in (+10%)"
            >
              <ZoomIn size={13} />
            </button>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={fitPage}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Fit to Window"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Floating Word Selection Toolbar on selected text */}
      {selectionCoords && (
        <PreviewSelectionToolbar
          coords={selectionCoords}
          onApplyFormat={handleApplySelectionFormat}
          onClose={() => setSelectionCoords(null)}
          installedFonts={doc.customFonts}
        />
      )}

      {/* Floating Image Action Toolbar on selected figure */}
      {selectedFigure && (
        <div
          className="notebook-image-toolbar fixed z-[999] -translate-x-1/2 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-1.5 shadow-2xl border border-slate-700/80 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: `${selectedFigure.top}px`,
            left: `${selectedFigure.left}px`
          }}
        >
          {/* Flow Alignment: Float Left (Wrap text right), Center, Float Right (Wrap text left) */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => handleUpdateImageAlignment('float-left')}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                selectedFigure.align === 'float-left' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Float Left (Text flows around to the right - saves space)"
            >
              <AlignLeft size={13} />
              <span>Left</span>
            </button>
            <button
              type="button"
              onClick={() => handleUpdateImageAlignment('center')}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                selectedFigure.align === 'center' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Centered Block"
            >
              <AlignCenter size={13} />
              <span>Center</span>
            </button>
            <button
              type="button"
              onClick={() => handleUpdateImageAlignment('float-right')}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                selectedFigure.align === 'float-right' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Float Right (Text flows around to the left - saves space)"
            >
              <AlignRight size={13} />
              <span>Right</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Width Presets */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/50">
            {[25, 33, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleUpdateImageWidth(pct)}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                  Math.abs(selectedFigure.widthPercent - pct) <= 5
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                title={`Set width to ${pct}%`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Studio Edit Button */}
          {onOpenImageStudio && (
            <button
              type="button"
              onClick={() => {
                onOpenImageStudio(selectedFigure.assetId);
                setSelectedFigure(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Open Image Studio (Crop, Filters, Compression)"
            >
              <Edit3 size={13} />
              <span>Studio</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDeleteImage}
            className="p-1 rounded-xl text-rose-400 hover:bg-rose-950/80 hover:text-rose-300 transition-colors"
            title="Remove image from document"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Sheet Canvas Scroll Area (Stacked vertically or horizontally as per user's choice) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onClick={handleSheetClick}
        onMouseUp={handleSheetMouseUp}
        className={`flex-1 p-4 sm:p-8 relative select-text transition-all ${
          scrollDirection === 'horizontal'
            ? 'overflow-x-auto overflow-y-hidden flex flex-row items-center justify-start gap-8'
            : 'overflow-y-auto overflow-x-auto flex flex-col items-center gap-8'
        }`}
      >
        {pages.map((pageHtml, idx) => {
          const pageNum = idx + 1;
          const totalPages = pages.length;
          let pageNumStr = `${pageNum}`;
          if (settings.pageNumbering.format === 'Page X of Y') {
            pageNumStr = `Page ${pageNum} of ${totalPages}`;
          } else if (settings.pageNumbering.format === '- X -') {
            pageNumStr = `- ${pageNum} -`;
          } else if (settings.pageNumbering.format === 'Page X') {
            pageNumStr = `Page ${pageNum}`;
          }

          return (
            <div
              key={idx}
              data-page-index={idx}
              className="page-frame-wrapper shrink-0 relative shadow-lg hover:shadow-2xl dark:shadow-black/60 rounded-xs bg-white border border-slate-300/80 dark:border-slate-700/80 print:border-0 print:shadow-none"
              style={{
                width: `${scaledWidthPx}px`,
                height: `${scaledHeightPx}px`
              }}
            >
              {/* Inner Sheet content scaled purely for canvas view while keeping text size constant relative to page */}
              <div
                className="page-sheet-content origin-top-left absolute top-0 left-0 bg-white text-slate-900 select-text flex flex-col justify-between overflow-hidden"
                style={{
                  width: `${baseWidthPx}px`,
                  minWidth: `${baseWidthPx}px`,
                  maxWidth: `${baseWidthPx}px`,
                  height: `${baseHeightPx}px`,
                  minHeight: `${baseHeightPx}px`,
                  maxHeight: `${baseHeightPx}px`,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  paddingTop: `${settings.margins.top}mm`,
                  paddingRight: `${settings.margins.right}mm`,
                  paddingBottom: `${settings.margins.bottom}mm`,
                  paddingLeft: `${settings.margins.left}mm`,
                  fontFamily: settings.fontFamily || "'KaTeX_Main', serif",
                  fontSize: `${settings.fontSizePt}pt`,
                  lineHeight: settings.lineHeight,
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {/* Running Header */}
                {settings.runningHeader.enabled && (settings.runningHeader.title || doc.title) && (
                  <div className="flex justify-between border-b border-slate-300 pb-1.5 mb-4 text-[8.5pt] text-slate-500 uppercase tracking-wider select-none shrink-0 w-full overflow-hidden">
                    <span className="font-bold truncate max-w-[60%]">
                      {settings.runningHeader.title || doc.title}
                    </span>
                    <span className="truncate max-w-[35%] text-right">
                      {settings.runningHeader.subtitle || doc.subject || ''}
                    </span>
                  </div>
                )}

                {/* Page Body Content (Full width after margins in 1-Col mode, and balanced 2-Col layout in 2-Col mode) */}
                <div
                  className="page-body-content flex-1 w-full overflow-hidden break-words"
                  data-columns={settings.columns === 2 ? '2' : '1'}
                  style={
                    settings.columns === 2
                      ? {
                          columnCount: 2,
                          columnGap: '8mm',
                          columnFill: 'auto',
                          columnRule: '1px solid #e2e8f0',
                          width: '100%'
                        }
                      : {
                          columnCount: 1,
                          width: '100%',
                          display: 'block'
                        }
                  }
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />

                {/* Running Footer / Page Number */}
                {settings.pageNumbering.enabled && (
                  <div
                    className={`border-t border-slate-300 pt-2 mt-4 text-[9pt] text-slate-500 select-none shrink-0 flex ${
                      settings.pageNumbering.position === 'bottom-center'
                        ? 'justify-center'
                        : 'justify-end'
                    }`}
                  >
                    <span>{pageNumStr}</span>
                  </div>
                )}
              </div>

              {/* Page Number Badge floating on outer desk */}
              <div className="absolute -top-3 left-2 px-1.5 py-0.5 rounded-md bg-slate-800 text-white text-[9px] font-mono font-bold shadow-xs select-none pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                Page {pageNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Mini-Toolbar for in-sheet text selections */}
      {selectionCoords && (
        <PreviewSelectionToolbar
          coords={selectionCoords}
          onApplyFormat={handleApplySelectionFormat}
          onClose={() => setSelectionCoords(null)}
          installedFonts={doc.customFonts}
        />
      )}
    </div>
  );
});

NotebookPreview.displayName = 'NotebookPreview';

export default NotebookPreview;

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

