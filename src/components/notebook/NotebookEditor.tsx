import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import MathFormulaBar from './MathFormulaBar';
import { DocumentAsset } from '../../types/notebook';
import { applyInlineStyleToSelection, applyFormattingToMarkdown } from '../../utils/textFormatter';
import { parseDocumentToPages } from '../../utils/notebookRenderer';
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
  onActiveLineChange?: (lineText: string) => void;
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
  fontFamily: _fontFamily,
  assets = {},
  onUpdateAssets,
  onOpenTableBuilder,
  onOpenImageModal,
  onPrint,
  onActiveLineChange
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const reportActiveLine = (textVal: string, cursorPos: number) => {
    if (!onActiveLineChange) return;
    const before = textVal.slice(0, cursorPos);
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEndIdx = textVal.indexOf('\n', cursorPos);
    const lineEnd = lineEndIdx === -1 ? textVal.length : lineEndIdx;
    const currentLine = textVal.slice(lineStart, lineEnd).trim();
    if (currentLine) {
      onActiveLineChange(currentLine);
    }
  };

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
      case 'align-left':
        replacement = `\\alignleft{${selected || 'Left-aligned text'}}`;
        newCursorPos = start + replacement.length;
        break;
      case 'align-center':
        replacement = `\\aligncenter{${selected || 'Centered text'}}`;
        newCursorPos = start + replacement.length;
        break;
      case 'align-right':
        replacement = `\\alignright{${selected || 'Right-aligned text'}}`;
        newCursorPos = start + replacement.length;
        break;
      case 'align-justify':
        replacement = `\\alignjustify{${selected || 'Justified paragraph text'}}`;
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
        replacement = `\n> [!THEOREM: ${selected || 'Fundamental Theorem'}]\n> Let $f(x)$ be continuous on $[a, b]$...\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'definition':
        replacement = `\n> [!DEFINITION: ${selected || 'Formal Definition'}]\n> A set $S$ is termed bounded if there exists $M > 0$ such that $|x| \\le M$ for all $x \\in S$.\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'lemma':
        replacement = `\n> [!LEMMA: ${selected || 'Lemma 1.1'}]\n> Under the hypotheses of continuity on $[a, b]$, there exists $c \\in (a, b)$ such that $f'(c) = 0$.\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'formula_box':
      case 'formula':
        replacement = `\n> [!FORMULA: ${selected || 'Important Formula'}]\n> $E = mc^2$\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'custom_box':
      case 'callout_box':
        replacement = `\n> [!BOX: ${selected || 'Key Concept'}]\n> Enter key concept details here...\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'twocolumn':
        replacement = `\n\\begin{twocolumn}\n${selected || 'Two-column scientific section text goes here...'}\n\\end{twocolumn}\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'onecolumn':
        replacement = `\n\\begin{onecolumn}\n${selected || 'Single-column full width text goes here...'}\n\\end{onecolumn}\n`;
        newCursorPos = start + replacement.length;
        break;
      case 'marginlayout':
        replacement = `\n\\begin{marginlayout}\n\\begin{margincol}\n${selected || 'Margin rail diagram or note...'}\n\\end{margincol}\n\\begin{maincol}\nMain textbook section text...\n\\end{maincol}\n\\end{marginlayout}\n`;
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

  // Memoized asset tokens & document statistics (Zero heavy pagination on keystrokes)
  const { assetTokens, wordCount, charCount, estimatedPages, tablesCount } = React.useMemo(() => {
    const tokens: ExtractedAssetToken[] = [];
    const tokenRegex = /!\[([^\]]*)\]\((asset:\/\/[^)]+)\)(?:\{([^}]+)\})?/g;
    let m: RegExpExecArray | null;
    while ((m = tokenRegex.exec(content)) !== null) {
      const fullMatch = m[0];
      const alt = m[1];
      const assetId = m[2].replace('asset://', '').trim();
      let width = '75%';
      let align = 'center';
      if (m[3]) {
        const w = m[3].match(/width=([^\s,}]+)/);
        if (w) width = w[1];
        const a = m[3].match(/align=([^\s,}]+)/);
        if (a) align = a[1];
      }
      tokens.push({
        fullMatch,
        alt,
        assetId,
        width,
        align,
        startIndex: m.index
      });
    }

    const latexImgRegex = /\\includegraphics(?:\[([^\]]*)\])?\{(asset:\/\/[^}]+)\}/g;
    while ((m = latexImgRegex.exec(content)) !== null) {
      const fullMatch = m[0];
      const params = m[1] || '';
      const assetId = m[2].replace('asset://', '').trim();
      let width = '75%';
      let align = 'center';
      const w = params.match(/width=([^\s,}]+)/);
      if (w) width = w[1];
      const a = params.match(/align=([^\s,}]+)/);
      if (a) align = a[1];
      tokens.push({
        fullMatch,
        alt: assetId,
        assetId,
        width,
        align,
        startIndex: m.index
      });
    }

    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = content.length;
    const manualBreaks = (content.match(/(?:\\newpage|\\pagebreak|\\clearpage|---pagebreak---)/gi) || []).length;
    const tCount = (content.match(/(?:^|\n)\|[^\n]+\|(?:\n\|[^\n]+\|)+/g) || []).length;
    const estPages = Math.max(1, Math.ceil((words + tokens.length * 60 + tCount * 45) / 320) + manualBreaks);

    return {
      assetTokens: tokens,
      wordCount: words,
      charCount: chars,
      estimatedPages: estPages,
      tablesCount: tCount
    };
  }, [content]);

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
          onChange={e => {
            const val = e.target.value;
            onChangeContent(val);
            reportActiveLine(val, e.target.selectionStart || 0);
          }}
          onClick={e => reportActiveLine(content, e.currentTarget.selectionStart || 0)}
          onKeyUp={e => reportActiveLine(content, e.currentTarget.selectionStart || 0)}
          onKeyDown={handleKeyDown}
          onPaste={handleTextareaPaste}
          onDrop={handleTextareaDrop}
          placeholder="Write research paper sections, inline math ($E=mc^2$), display equations ($$...$$), theorems, tables, or paste figures..."
          className="flex-1 h-full w-full p-4 sm:p-6 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none scrollbar-thin selection:bg-blue-200 dark:selection:bg-blue-900"
          spellCheck="false"
        />
      </div>

      {/* Bottom Status Bar with Table Assistant and Statistics */}
      <div 
        className="h-7 px-3 sm:px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0 select-none whitespace-nowrap overflow-x-auto gap-3 scrollbar-none min-w-0 w-full"
        style={{ whiteSpace: 'nowrap' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap min-w-0" style={{ whiteSpace: 'nowrap' }}>
          <span className="inline-flex items-center whitespace-nowrap shrink-0 font-medium tracking-tight">
            {wordCount}&nbsp;words
          </span>
          <span className="shrink-0 text-slate-300 dark:text-slate-700">•</span>
          <span className="inline-flex items-center whitespace-nowrap shrink-0 font-medium tracking-tight">
            {charCount}&nbsp;chars
          </span>
          <span className="shrink-0 text-slate-300 dark:text-slate-700">•</span>
          <span className="inline-flex items-center whitespace-nowrap shrink-0 font-medium tracking-tight">
            {estimatedPages}&nbsp;{estimatedPages === 1 ? 'page' : 'pages'}
          </span>
          {tablesCount > 0 && (
            <>
              <span className="hidden sm:inline shrink-0 text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={onOpenTableBuilder}
                className="hidden sm:inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 whitespace-nowrap"
              >
                <TableIcon size={11} />
                <span>{tablesCount}&nbsp;{tablesCount === 1 ? 'Table' : 'Tables'}</span>
              </button>
            </>
          )}
          {assetTokens.length > 0 && (
            <>
              <span className="hidden sm:inline shrink-0 text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={onOpenImageModal}
                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline shrink-0 whitespace-nowrap"
                title="Manage Document Image Assets"
              >
                <span>🖼️</span>
                <span>{assetTokens.length}&nbsp;{assetTokens.length === 1 ? 'Image' : 'Images'}</span>
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap ml-auto" style={{ whiteSpace: 'nowrap' }}>
          <span className="hidden md:inline text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
            Ctrl+B (Bold) • Ctrl+I (Italic) • Ctrl+P (Print)
          </span>
          <span className="font-mono text-indigo-500 font-bold shrink-0 whitespace-nowrap">KaTeX Engine</span>
        </div>
      </div>
    </div>
  );
});

export default NotebookEditor;
