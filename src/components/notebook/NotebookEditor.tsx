import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import MathFormulaBar from './MathFormulaBar';
import { DocumentAsset } from '../../types/notebook';
import { applyInlineStyleToSelection, applyFormattingToMarkdown } from '../../utils/textFormatter';
import {
  Image as ImageIcon,
  Table as TableIcon,
  Sparkles,
  Trash2,
  Zap,
  CheckCircle2,
  FileImage,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';

export interface NotebookEditorHandle {
  formatSelection: (type: string, param?: string) => void;
  insertAtCursor: (text: string) => void;
  getTextarea: () => HTMLTextAreaElement | null;
}

interface NotebookEditorProps {
  content: string;
  onChangeContent: (val: string) => void;
  fontFamily: string;
  assets?: Record<string, DocumentAsset>;
  onUpdateAssets?: (assets: Record<string, DocumentAsset>) => void;
  onOpenTableBuilder?: () => void;
  onOpenImageModal?: () => void;
  onPrint?: () => void;
}

interface ExtractedAssetToken {
  fullMatch: string;
  alt: string;
  assetId: string;
  width: string;
  align: string;
  startIndex: number;
}

const NotebookEditor = forwardRef<NotebookEditorHandle, NotebookEditorProps>(({
  content,
  onChangeContent,
  fontFamily,
  assets = {},
  onUpdateAssets,
  onOpenTableBuilder,
  onOpenImageModal,
  onPrint
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAssetsBarExpanded, setIsAssetsBarExpanded] = useState<boolean>(true);
  const [copiedMigrationSuccess, setCopiedMigrationSuccess] = useState<boolean>(false);

  // Helper to wrap or insert formatting around user's selection
  const formatSelection = (type: string, param?: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);

    if (selected) {
      const updated = applyFormattingToMarkdown({
        content,
        selectedText: selected,
        action: type,
        value: param,
        contextBefore: content.slice(Math.max(0, start - 30), start),
        contextAfter: content.slice(end, end + 30)
      });

      if (updated !== content) {
        onChangeContent(updated);
        return;
      }
    }

    let replacement = selected;
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        newCursorPos = start + (selected ? replacement.length : 2);
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        newCursorPos = start + (selected ? replacement.length : 1);
        break;
      case 'underline':
        replacement = `\\underline{${selected || 'underlined text'}}`;
        newCursorPos = start + (selected ? replacement.length : 12);
        break;
      case 'strikethrough':
        replacement = `~~${selected || 'strikethrough text'}~~`;
        newCursorPos = start + (selected ? replacement.length : 2);
        break;
      case 'color': {
        const colorVal = param || '#1d4ed8';
        replacement = `\\textcolor{${colorVal}}{${selected || 'colored text'}}`;
        newCursorPos = start + replacement.length;
        break;
      }
      case 'fontSize':
      case 'font-size': {
        const sizeVal = param || '14pt';
        let cmd = '\\large';
        if (sizeVal === '8pt' || sizeVal === 'tiny') cmd = '\\tiny';
        else if (sizeVal === '9pt' || sizeVal === 'scriptsize') cmd = '\\scriptsize';
        else if (sizeVal === '10pt' || sizeVal === 'small') cmd = '\\small';
        else if (sizeVal === '12pt' || sizeVal === 'normalsize') cmd = '\\normalsize';
        else if (sizeVal === '14pt' || sizeVal === 'large') cmd = '\\large';
        else if (sizeVal === '18pt' || sizeVal === 'Large') cmd = '\\Large';
        else if (sizeVal === '22pt' || sizeVal === 'LARGE') cmd = '\\LARGE';
        else if (sizeVal === '26pt' || sizeVal === 'huge') cmd = '\\huge';
        else if (sizeVal === '32pt' || sizeVal === 'Huge') cmd = '\\Huge';
        else if (sizeVal === 'h' || sizeVal === 'h1') cmd = '\\h1';
        else if (sizeVal === 'h2') cmd = '\\h2';
        else if (sizeVal === 'h3') cmd = '\\h3';
        else cmd = `\\size{${sizeVal}}`;

        replacement = `${cmd}{${selected || 'styled text'}}`;
        newCursorPos = start + replacement.length;
        break;
      }
      case 'highlight':
        if (param === 'transparent') {
          replacement = selected;
        } else {
          replacement = `\\colorbox{${param || '#fef08a'}}{${selected || 'highlighted text'}}`;
        }
        newCursorPos = start + (selected ? replacement.length : 20);
        break;
      case 'font-family':
      case 'latex-font': {
        let fontVal = param || "'KaTeX_Main', serif";
        if (fontVal === 'katex-main' || fontVal === 'latex-main') fontVal = "'KaTeX_Main', serif";
        if (fontVal === 'katex-sans' || fontVal === 'latex-sans') fontVal = "'KaTeX_SansSerif', sans-serif";
        if (fontVal === 'katex-math' || fontVal === 'latex-math') fontVal = "'KaTeX_Math', serif";
        if (fontVal === 'katex-mono' || fontVal === 'latex-mono') fontVal = "'KaTeX_Typewriter', monospace";

        replacement = `\\fontfamily{${fontVal}}{${selected || 'Sample styled text'}}`;
        newCursorPos = start + replacement.length;
        break;
      }
      case 'h1':
        replacement = `\n# ${selected || 'Section Title'}\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Subsection Heading'}\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'h3':
        replacement = `\n### ${selected || 'Topic Subheading'}\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'ul':
        replacement = `\n- ${selected || 'List item 1'}\n- List item 2\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'ol':
        replacement = `\n1. ${selected || 'Step 1'}\n2. Step 2\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Important theorem, note, or reference.'}\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'theorem':
        replacement = `\n> [!THEOREM]\n> **Theorem (Fundamental Property):**\n> Let $f(x)$ be continuous on $[a, b]$...\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'definition':
        replacement = `\n> [!DEFINITION]\n> **Definition (Formal):**\n> A set $S$ is termed bounded if there exists $M > 0$ such that $|x| \\le M$ for all $x \\in S$.\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'lemma':
        replacement = `\n> [!LEMMA]\n> **Lemma 1.1:**\n> Under the hypotheses of continuity on $[a, b]$, there exists $c \\in (a, b)$ such that $f'(c) = 0$.\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'proof':
        replacement = `\n> [!PROOF]\n> *Proof:* Direct derivation from first principles. Hence proved $\\blacksquare$\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'exam_header':
        replacement = `\n# APEX ACADEMY OF SCIENCES\n### ANNUAL EXAMINATION - 2026\n**Subject:** Physical Sciences | **Time:** 3 Hours | **Max Marks:** 100\n---\n*General Instructions: All questions are compulsory.*\n\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'table':
        if (onOpenTableBuilder) {
          onOpenTableBuilder();
          return;
        }
        replacement = `\n| Parameter | Formula | Measured | Unit |\n| :--- | :---: | :---: | :--- |\n| Velocity | $v = \\frac{dx}{dt}$ | 24.5 | m/s |\n| Acceleration | $a = \\frac{dv}{dt}$ | 9.8 | m/s² |\n\n`;
        newCursorPos = start + replacement.length;
        break;
      default:
        break;
    }

    const nextVal = content.substring(0, start) + replacement + content.substring(end);
    onChangeContent(nextVal);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChangeContent(content + text);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextVal = content.substring(0, start) + text + content.substring(end);
    onChangeContent(nextVal);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = start + text.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 0);
  };

  useImperativeHandle(ref, () => ({
    formatSelection,
    insertAtCursor,
    getTextarea: () => textareaRef.current
  }));

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      formatSelection('bold');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      formatSelection('italic');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      if (onPrint) onPrint();
    }
  };

  // Extract all asset tokens in content (both Markdown and LaTeX \includegraphics)
  const assetTokens: ExtractedAssetToken[] = [];
  const tokenRegex = /!\[([^\]]*)\]\((asset:\/\/[^)]+)\)(?:\{([^}]+)\})?/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const alt = match[1];
    const assetId = match[2].replace('asset://', '').trim();
    let width = '75%';
    let align = 'center';
    if (match[3]) {
      const w = match[3].match(/width=([^\s,}]+)/);
      if (w) width = w[1];
      const a = match[3].match(/align=([^\s,}]+)/);
      if (a) align = a[1];
    }
    assetTokens.push({
      fullMatch,
      alt,
      assetId,
      width,
      align,
      startIndex: match.index
    });
  }

  // Also extract LaTeX \includegraphics[...]{asset://...}
  const latexImgRegex = /\\includegraphics(?:\[([^\]]*)\])?\{(asset:\/\/[^}]+)\}/g;
  while ((match = latexImgRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const params = match[1] || '';
    const assetId = match[2].replace('asset://', '').trim();
    let width = '75%';
    let align = 'center';
    const w = params.match(/width=([^\s,}]+)/);
    if (w) width = w[1];
    const a = params.match(/align=([^\s,}]+)/);
    if (a) align = a[1];
    assetTokens.push({
      fullMatch,
      alt: assetId,
      assetId,
      width,
      align,
      startIndex: match.index
    });
  }

  // Detect legacy base64 image strings embedded directly in content
  const base64Matches = content.match(/!\[[^\]]*\]\(data:image\/[^)]+\)/g) || [];
  const hasBase64Blobs = base64Matches.length > 0;

  // 1-Click Migration of base64 blobs into clean DocumentAssets
  const handleMigrateBase64ToAssets = () => {
    let nextContent = content;
    const newAssets: Record<string, DocumentAsset> = { ...(assets || {}) };
    let counter = Object.keys(newAssets).length + 1;

    nextContent = nextContent.replace(
      /!\[([^\]]*)\]\((data:image\/[^)]+)\)(?:\{([^}]+)\})?/g,
      (fullMatch, alt, dataUrl, params) => {
        const assetId = `img_${counter++}_` + Math.random().toString(36).substring(2, 6);
        const mimeMatch = dataUrl.match(/^data:(image\/[^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const isGif = mimeType === 'image/gif';

        const stringLength = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const sizeInBytes = Math.round(stringLength * 0.75);
        const sizeFormatted =
          sizeInBytes < 1024 * 1024
            ? `${Math.round(sizeInBytes / 1024)} KB`
            : `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

        newAssets[assetId] = {
          id: assetId,
          name: (alt || `migrated_image_${assetId}`).replace(/\s+/g, '_'),
          mimeType,
          sizeFormatted,
          dataUrl,
          isAnimatedGif: isGif
        };

        const paramStr = params ? `{${params}}` : '{width=80% align=block-center}';
        return `![${alt || 'Diagram'}](asset://${assetId})${paramStr}`;
      }
    );

    if (onUpdateAssets) {
      onUpdateAssets(newAssets);
    }
    onChangeContent(nextContent);
    setCopiedMigrationSuccess(true);
    setTimeout(() => setCopiedMigrationSuccess(false), 3000);
  };

  const handleJumpToToken = (startIndex: number, length: number) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(startIndex, startIndex + length);
    }
  };

  const handleDeleteAssetToken = (assetId: string, fullMatch: string) => {
    const nextContent = content.replace(fullMatch, '');
    onChangeContent(nextContent);
    if (assets && assets[assetId] && onUpdateAssets) {
      const nextAssets = { ...assets };
      delete nextAssets[assetId];
      onUpdateAssets(nextAssets);
    }
  };

  // Word count & stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const pageBreakCount = (content.match(/(?:\\newpage|\\pagebreak|\\clearpage|---pagebreak---)/g) || []).length + 1;
  const tablesCount = (content.match(/(?:^|\n)\|[^\n]+\|(?:\n\|[^\n]+\|)+/g) || []).length;

  // Direct paste image handler on textarea
  const handleTextareaPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target?.result as string;
          if (!dataUrl) return;

          const assetId = 'img_' + Math.random().toString(36).substring(2, 9);
          const cleanName = (file.name || 'pasted_image').replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
          const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);

          const newAsset: DocumentAsset = {
            id: assetId,
            name: cleanName,
            mimeType: file.type || 'image/png',
            sizeFormatted: `${sizeKb} KB`,
            dataUrl,
            widthPercent: 75,
            alignment: 'block-center'
          };

          if (onUpdateAssets) {
            onUpdateAssets({
              ...(assets || {}),
              [assetId]: newAsset
            });
          }

          insertAtCursor(`\n\n\\includegraphics[width=75%, align=center]{asset://${assetId}}\n\n`);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  // Direct drop image handler on textarea
  const handleTextareaDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        if (!dataUrl) return;

        const assetId = 'img_' + Math.random().toString(36).substring(2, 9);
        const cleanName = (file.name || 'dropped_image').replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
        const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);

        const newAsset: DocumentAsset = {
          id: assetId,
          name: cleanName,
          mimeType: file.type || 'image/png',
          sizeFormatted: `${sizeKb} KB`,
          dataUrl,
          widthPercent: 75,
          alignment: 'block-center'
        };

        if (onUpdateAssets) {
          onUpdateAssets({
            ...(assets || {}),
            [assetId]: newAsset
          });
        }

        insertAtCursor(`\n\n\\includegraphics[width=75%, align=center]{asset://${assetId}}\n\n`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Quick LaTeX Math Bar */}
      <MathFormulaBar
        onInsertMath={(latex, isBlock) => {
          if (isBlock) {
            insertAtCursor(`\n\n$$\n${latex}\n$$\n\n`);
          } else {
            insertAtCursor(`$${latex}$`);
          }
        }}
      />

      {/* Editor Main Textarea */}
      <div className="flex-1 relative flex overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handleTextareaPaste}
          onDrop={handleTextareaDrop}
          placeholder="Type notes, formulas ($E=mc^2$), theorems, \\newpage, or paste images directly... Use toolbar above for styling!"
          className="flex-1 h-full w-full p-4 sm:p-6 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none scrollbar-thin selection:bg-blue-200 dark:selection:bg-blue-900"
          spellCheck="false"
        />
      </div>

      {/* Bottom Status Bar with Table Assistant and Statistics */}
      <div className="h-7 px-3 sm:px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
          <span>•</span>
          <span>{pageBreakCount} {pageBreakCount === 1 ? 'page' : 'pages'}</span>
          {tablesCount > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <button
                type="button"
                onClick={onOpenTableBuilder}
                className="hidden sm:inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                <TableIcon size={11} />
                <span>{tablesCount} {tablesCount === 1 ? 'Table' : 'Tables'}</span>
              </button>
            </>
          )}
          {assetTokens.length > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <button
                type="button"
                onClick={onOpenImageModal}
                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline"
                title="Manage Document Image Assets"
              >
                <span>🖼️</span>
                <span>{assetTokens.length} {assetTokens.length === 1 ? 'Image' : 'Images'}</span>
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] text-slate-400">
            Ctrl+B (Bold) • Ctrl+I (Italic) • Ctrl+P (Print)
          </span>
          <span className="font-mono text-indigo-500 font-bold">KaTeX Engine</span>
        </div>
      </div>
    </div>
  );
});

export default NotebookEditor;
