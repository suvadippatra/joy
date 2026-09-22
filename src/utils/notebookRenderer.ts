import katex from 'katex';
import { DocumentAsset } from '../types/notebook';
import { generateQrCodeSvg } from './qrCode';
import { resolveCssColor } from './textFormatter';

export interface RenderOptions {
  fontSizePt?: number;
  lineHeight?: number;
  fontFamily?: string;
  isPrint?: boolean;
}

/**
 * Escapes unsafe HTML characters while preserving intentional entities
 */
function escapeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Renders LaTeX formula with KaTeX in a safe try-catch wrapper
 */
function renderKaTeXFormula(latex: string, displayMode: boolean): string {
  const trimmed = latex.trim();
  if (!trimmed) return '';
  try {
    const rendered = katex.renderToString(trimmed, {
      displayMode,
      throwOnError: false,
      errorColor: '#dc2626',
      output: 'htmlAndMathml'
    });
    if (displayMode) {
      return `<div class="katex-display-wrapper my-3.5 py-1 text-center w-full max-w-full overflow-x-auto" style="width: 100%; max-width: 100%;">${rendered}</div>`;
    } else {
      return `<span class="katex-inline-wrapper px-0.5 inline-block align-baseline">${rendered}</span>`;
    }
  } catch (err) {
    if (displayMode) {
      return `<div class="katex-error text-red-500 font-mono text-xs my-2 p-2 border border-red-200 bg-red-50 rounded">LaTeX Display Error: ${escapeHtmlEntities(trimmed)}</div>`;
    } else {
      return `<span class="text-red-500 font-mono text-xs border border-red-200 bg-red-50 px-1 rounded">[LaTeX: ${escapeHtmlEntities(trimmed)}]</span>`;
    }
  }
}

/**
 * Parses markdown inline text styling and LaTeX commands:
 * Font size: \tiny, \small, \normalsize, \large, \Large, \LARGE, \huge, \Huge, \h, \h1, \h2, \size{...}{...}
 * Color: \textcolor{color}{text}, \color{color}{text}, \colorbox{color}{text}, \highlight{color}{text}
 * Styling: \textbf, \textit, \emph, \underline, \sout, \textsc, \texttt
 * Alignment: \centerline, \leftline, \rightline
 * Markdown: **bold**, *italic*, `code`, ~~strike~~, __underline__
 * Does NOT display the LaTeX command names in preview!
 */
export function parseInlineMarkdown(text: string): string {
  if (!text) return '';
  let res = text;

  // 1. LaTeX Text Color: \textcolor{color}{text} and \color{color}{text}
  res = res.replace(/\\(?:textcolor|color)\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, color, inner) => {
    const cssColor = resolveCssColor(color);
    return `<span style="color: ${cssColor};">${parseInlineMarkdown(inner)}</span>`;
  });

  // 2. LaTeX Highlight: \colorbox{color}{text} and \highlight{color}{text}
  res = res.replace(/\\(?:colorbox|highlight)\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, bg, inner) => {
    const cssBg = resolveCssColor(bg);
    return `<mark style="background-color: ${cssBg}; padding: 0.1em 0.3em; border-radius: 3px;">${parseInlineMarkdown(inner)}</mark>`;
  });

  // 3. LaTeX Font Size Commands
  // \size{20px}{text} or \fontsize{16pt}{text}
  res = res.replace(/\\(?:size|fontsize)\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, size, inner) => {
    const formattedSize = /^\d+$/.test(size.trim()) ? `${size.trim()}pt` : size.trim();
    return `<span style="font-size: ${formattedSize};">${parseInlineMarkdown(inner)}</span>`;
  });

  // \fontfamily{family}{text}
  res = res.replace(/\\fontfamily\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, family, inner) => `<span style="font-family: ${family};">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\size\{([^}]+)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, size, inner) => `<span style="font-size: ${size};">${parseInlineMarkdown(inner)}</span>`);

  // \h or \h1 to \h4
  res = res.replace(/\\h1\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.85em; font-weight: 700; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h2\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.45em; font-weight: 700; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h3\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.25em; font-weight: 600; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h4\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.1em; font-weight: 600; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\h\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.85em; font-weight: 700; display: inline-block;">${parseInlineMarkdown(inner)}</span>`);

  // Standard LaTeX font size scale
  res = res.replace(/\\Huge\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 2.3em; line-height: 1.2;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\huge\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.85em; line-height: 1.25;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\LARGE\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.55em; line-height: 1.3;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\Large\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.35em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\large\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1.18em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\normalsize\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 1em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\small\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.9em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\footnotesize\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.85em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\scriptsize\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.75em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\tiny\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-size: 0.65em;">${parseInlineMarkdown(inner)}</span>`);

  // Scoped bracket forms: {\large ...}, {\Huge ...}, etc.
  res = res.replace(/\{\\Huge\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 2.3em; line-height: 1.2;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\huge\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.85em; line-height: 1.25;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\LARGE\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.55em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\Large\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.35em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\large\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 1.18em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\small\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 0.9em;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\{\\tiny\s+([^}]+)\}/g, (_, inner) => `<span style="font-size: 0.65em;">${parseInlineMarkdown(inner)}</span>`);

  // 4. LaTeX Text Styles
  res = res.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<strong>${parseInlineMarkdown(inner)}</strong>`);
  res = res.replace(/\\(?:textit|emph)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<em>${parseInlineMarkdown(inner)}</em>`);
  res = res.replace(/\\underline\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<u class="underline underline-offset-2">${parseInlineMarkdown(inner)}</u>`);
  res = res.replace(/\\(?:sout|st)\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<del class="line-through text-slate-500">${parseInlineMarkdown(inner)}</del>`);
  res = res.replace(/\\textsc\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span style="font-variant: small-caps;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\texttt\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-[0.88em] border border-slate-200 dark:border-slate-700 break-words">${parseInlineMarkdown(inner)}</code>`);

  // 5. LaTeX Alignment Helpers
  res = res.replace(/\\centerline\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-center w-full my-1" style="text-align: center;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\leftline\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-left w-full my-1" style="text-align: left;">${parseInlineMarkdown(inner)}</span>`);
  res = res.replace(/\\rightline\{((?:[^{}]|\{[^{}]*\})*)\}/g, (_, inner) => `<span class="block text-right w-full my-1" style="text-align: right;">${parseInlineMarkdown(inner)}</span>`);

  // 6. Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-[0.88em] border border-slate-200 dark:border-slate-700 break-words">$1</code>');

  // 7. Bold & Italic: ***text***
  res = res.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

  // 8. Bold: **text**
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 9. Italic: *text* (avoiding escaped asterisks)
  res = res.replace(/(^|[^\\])\*([^*]+)\*/g, '$1<em>$2</em>');

  // 10. Strikethrough: ~~text~~
  res = res.replace(/~~([^~]+)~~/g, '<del class="line-through text-slate-500">$1</del>');

  // 11. Underline: __text__
  res = res.replace(/__([^_]+)__/g, '<u class="underline underline-offset-2">$1</u>');

  return res;
}

/**
 * Builds HTML figure for an image with live preview dragging and positioning hooks
 */
function buildFigureHtml(
  src: string, 
  rawSrc: string,
  alt: string, 
  width: string, 
  align: string, 
  customFilter: string, 
  rawSyntax: 'latex' | 'markdown' | 'html'
): string {
  let wrapperClass = 'my-4 clear-both max-w-full';
  const imgStyle = `width: ${width}; max-width: 100%; height: auto; border-radius: 8px; ${customFilter}`;

  if (align === 'float-left') {
    wrapperClass = 'float-left mr-5 mb-3 my-2 max-w-[55%]';
  } else if (align === 'float-right') {
    wrapperClass = 'float-right ml-5 mb-3 my-2 max-w-[55%]';
  } else if (align === 'block-left' || align === 'left') {
    wrapperClass = 'my-3 clear-both max-w-full flex flex-col items-start justify-start';
  } else if (align === 'block-right' || align === 'right') {
    wrapperClass = 'my-3 clear-both max-w-full flex flex-col items-end justify-end';
  } else if (align === 'inline') {
    wrapperClass = 'inline-block align-middle mx-1.5 max-w-full';
  } else {
    wrapperClass = 'my-4 flex flex-col items-center justify-center clear-both max-w-full';
  }

  const captionHtml = alt ? `<figcaption class="text-xs text-center text-slate-500 mt-1.5 italic break-words">${alt}</figcaption>` : '';

  return `
    <figure 
      class="notebook-figure ${wrapperClass} relative group/figure transition-all" 
      data-img-wrapper="true"
      data-asset-src="${rawSrc || src}"
      data-img-syntax="${rawSyntax}"
      data-img-width="${width}"
      data-img-align="${align}"
      data-img-caption="${escapeHtmlEntities(alt)}"
      style="margin-top: 0.5rem; margin-bottom: 0.75rem;"
    >
      <div class="relative inline-block max-w-full image-wrapper-inner">
        <img 
          src="${src}" 
          data-asset-src="${rawSrc || src}" 
          alt="${alt || 'Figure'}" 
          style="${imgStyle}" 
          class="notebook-preview-img block shadow-xs border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-400/50" 
        />
        <!-- In-preview interactive corner resize handle (visible on hover & drag) -->
        <div 
          class="image-resize-handle print:hidden absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white border-2 border-white shadow-md cursor-se-resize flex items-center justify-center opacity-0 group-hover/figure:opacity-100 transition-opacity z-20"
          data-image-resize-handle="se"
          title="Drag to Resize Image"
        >
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
      ${captionHtml}
    </figure>
  `;
}

/**
 * Parses LaTeX \\includegraphics, Markdown images, and legacy HTML <img /> / <figure> tags
 * with alignment and width, resolving asset:// URIs and standardizing for interactive preview.
 */
function parseCustomImages(text: string, assets?: Record<string, DocumentAsset>): string {
  let res = text;

  // Helper to resolve asset:// URI
  const resolveSrc = (src: string): { resolvedSrc: string; customFilter: string } => {
    let resolvedSrc = src;
    let customFilter = '';
    if (src.startsWith('asset://')) {
      const assetId = src.replace('asset://', '').trim();
      const asset = assets ? assets[assetId] : undefined;
      if (asset?.dataUrl) {
        resolvedSrc = asset.dataUrl;
        if (asset.filter === 'grayscale') customFilter = 'filter: grayscale(100%);';
        else if (asset.filter === 'bw_diagram') customFilter = 'filter: contrast(220%) grayscale(100%) brightness(105%);';
        else if (asset.filter === 'invert') customFilter = 'filter: invert(100%);';
      } else {
        // Fallback placeholder so cached/broken asset IDs remain visible and resizable
        resolvedSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320" fill="%23f8fafc"><rect width="600" height="320" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="2" rx="8"/><path d="M220 200l50-60 50 60 60-80 60 90H200z" fill="%2394a3b8"/><circle cx="240" cy="110" r="22" fill="%2394a3b8"/><text x="300" y="245" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle" fill="%23475569">${assetId || 'Document Figure'}</text><text x="300" y="270" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%2394a3b8">Click or drag handle to resize &amp; position</text></svg>`;
      }
    }
    return { resolvedSrc, customFilter };
  };

  // 1. Process LaTeX \\includegraphics[options]{src}
  res = res.replace(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/g, (_, optStr, src) => {
    const { resolvedSrc, customFilter } = resolveSrc(src);
    let width = '100%';
    let align = 'center';
    let caption = '';

    if (optStr) {
      const wMatch = optStr.match(/width=([^\s,}]+)/);
      if (wMatch) width = wMatch[1];
      const aMatch = optStr.match(/align=([^\s,}]+)/);
      if (aMatch) align = aMatch[1];
      const cMatch = optStr.match(/caption=([^\s,}]+)/);
      if (cMatch) caption = cMatch[1];
    }

    return buildFigureHtml(resolvedSrc, src, caption, width, align, customFilter, 'latex');
  });

  // 2. Process Markdown ![alt](src){options}
  res = res.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g, (_, alt, src, paramsStr) => {
    const { resolvedSrc, customFilter } = resolveSrc(src);
    let width = '100%';
    let align = 'block-center';

    if (paramsStr) {
      const wMatch = paramsStr.match(/width=([^\s,}]+)/);
      if (wMatch) width = wMatch[1];
      const aMatch = paramsStr.match(/align=([^\s,}]+)/);
      if (aMatch) align = aMatch[1];
    }

    return buildFigureHtml(resolvedSrc, src, alt, width, align, customFilter, 'markdown');
  });

  // 3. Process existing HTML <figure>...<img ...>...</figure>
  res = res.replace(/<figure\b[^>]*>[\s\S]*?<img\b([^>]*)>[\s\S]*?(?:<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi, (_, imgAttrs, figCaption) => {
    const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';
    if (!src) return '';
    const { resolvedSrc, customFilter } = resolveSrc(src);

    let width = '75%';
    let align = 'center';
    const styleMatch = imgAttrs.match(/style=["']([^"']*)["']/);
    if (styleMatch) {
      const wMatch = styleMatch[1].match(/width:\s*([^;]+)/);
      if (wMatch) width = wMatch[1].trim();
      const fMatch = styleMatch[1].match(/float:\s*([^;]+)/);
      if (fMatch) align = fMatch[1].trim() === 'left' ? 'float-left' : fMatch[1].trim() === 'right' ? 'float-right' : 'center';
    }

    return buildFigureHtml(resolvedSrc, src, figCaption || '', width, align, customFilter, 'html');
  });

  // 4. Process standalone HTML <img ...> in legacy texts
  res = res.replace(/<img\b([^>]*)\/?>/gi, (match, imgAttrs) => {
    if (imgAttrs.includes('notebook-preview-img') || imgAttrs.includes('data-asset-src')) return match;
    const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';
    if (!src) return match;
    const { resolvedSrc, customFilter } = resolveSrc(src);

    let width = '75%';
    let align = 'center';
    const altMatch = imgAttrs.match(/alt=["']([^"']*)["']/);
    const alt = altMatch ? altMatch[1] : '';
    const styleMatch = imgAttrs.match(/style=["']([^"']*)["']/);
    if (styleMatch) {
      const wMatch = styleMatch[1].match(/width:\s*([^;]+)/);
      if (wMatch) width = wMatch[1].trim();
      const fMatch = styleMatch[1].match(/float:\s*([^;]+)/);
      if (fMatch) align = fMatch[1].trim() === 'left' ? 'float-left' : fMatch[1].trim() === 'right' ? 'float-right' : 'center';
    }

    return buildFigureHtml(resolvedSrc, src, alt, width, align, customFilter, 'html');
  });

  return res;
}

/**
 * Splits document text into individual pages by `\newpage`, `\pagebreak`, `\clearpage`, or `---pagebreak---`.
 */
export function parseDocumentToPages(rawContent: string, assets?: Record<string, DocumentAsset>): string[] {
  if (!rawContent) return [''];

  const normalized = rawContent.replace(/\r\n/g, '\n');

  // Split on \newpage, \pagebreak, \clearpage, or ---pagebreak--- with any surrounding whitespace/newlines
  const rawPages = normalized.split(/(?:^|\n)[ \t]*(?:\\newpage|\\pagebreak|\\clearpage|---pagebreak---|\\break)[ \t]*(?:\n|$)/gi);
  let globalTableCount = 0;
  let globalIframeOffset = 0;
  return rawPages.map(pageText => {
    // Strip any accidental remaining pagebreak commands inside page text
    const cleanText = pageText.replace(/(?:\\newpage|\\pagebreak|\\clearpage|---pagebreak---|\\break)/gi, '');
    const rendered = renderPageContent(cleanText, assets, globalTableCount, globalIframeOffset);
    const tableMatches = cleanText.match(/(?:^|\n)\|[^\n]+\|(?:\n\|[^\n]+\|)+/g);
    if (tableMatches) {
      globalTableCount += tableMatches.length;
    }
    const iframeMatches = cleanText.match(/:::iframe[\s\S]*?:::|<iframe[\s\S]*?<\/iframe>|<iframe[^>]*\/>/g);
    if (iframeMatches) {
      globalIframeOffset += iframeMatches.length;
    }
    return rendered;
  });
}

/**
 * Renders an interactive simulation or iframe block with a live screen sandbox and print-ready QR poster.
 */
function renderSimulationBlock(info: { title: string; url: string; width: string; height: string; idx: number }): string {
  const qrSvg = generateQrCodeSvg(info.url, 84);
  const escTitle = escapeHtmlEntities(info.title);
  const escUrl = escapeHtmlEntities(info.url);

  return `
    <div class="notebook-simulation-wrapper my-4 clear-both w-full max-w-full relative group/sim" data-simulation-idx="${info.idx}" data-simulation-url="${escUrl}" style="column-span: all; -webkit-column-span: all; width: ${info.width}; max-width: 100%;">
      <!-- Live Screen Container -->
      <div class="simulation-live-container border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-sm print:hidden">
        <!-- Header bar -->
        <div class="flex items-center justify-between px-3.5 py-2 bg-slate-850 text-slate-200 border-b border-slate-700 text-xs select-none">
          <div class="flex items-center gap-2 font-medium truncate max-w-[70%]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span class="font-bold text-slate-100 truncate">${escTitle}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-400">
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Interactive Lab
            </span>
            <a href="${escUrl}" target="_blank" rel="noopener noreferrer" class="p-1 hover:text-white rounded hover:bg-slate-700 transition-colors" title="Open Simulation in New Tab">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
        <!-- Interactive iframe -->
        <div class="relative w-full overflow-hidden bg-white simulation-iframe-box" style="height: ${info.height};">
          <iframe
            src="${escUrl}"
            title="${escTitle}"
            class="w-full h-full border-0 block"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
        <!-- Interactive resize handle -->
        <div 
          class="simulation-resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 z-20 text-slate-400 hover:text-blue-500 transition-colors"
          data-sim-resize="${info.idx}"
          title="Drag to resize simulation height"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M22 22h-4v-2h2v-2h2v4zm0-8h-2v2h2v-2zm-8 8h2v-2h-2v2zm-4 0h2v-2h-2v2zm12-16h-2v2h2v-2z"/></svg>
        </div>
      </div>

      <!-- Print Poster Placeholder (visible ONLY in print mode / PDF export) -->
      <div class="simulation-print-poster hidden p-4 border-2 border-slate-300 rounded-xl bg-slate-50 items-center justify-between gap-4 break-inside-avoid print:flex" style="page-break-inside: avoid;">
        <div class="flex-1">
          <div class="text-[9.5pt] font-bold uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1.5">
            <span>🔬</span>
            <span>Interactive Virtual Lab & Simulation</span>
          </div>
          <div class="text-[12pt] font-bold text-slate-900 mb-1">${escTitle}</div>
          <div class="text-[8.5pt] text-slate-600 font-mono mb-2 break-all">${escUrl}</div>
          <div class="text-[8pt] text-slate-500 italic">Scan QR code or use the link above to run this simulation live on your smartphone or desktop.</div>
        </div>
        <div class="shrink-0 flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
          ${qrSvg}
          <span class="text-[7.5pt] font-mono text-slate-500 mt-1 uppercase tracking-tight">Scan to Launch</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Parses LaTeX environments: \\begin{center}, \\begin{flushleft}, \\begin{theorem}, etc.
 */
function parseLatexEnvironments(content: string): string {
  let res = content;

  // \begin{center} ... \end{center}
  res = res.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (_, inner) => {
    return `<div class="my-3 text-center w-full clear-both" style="text-align: center;">\n${inner.trim()}\n</div>`;
  });

  // \begin{flushleft} ... \end{flushleft}
  res = res.replace(/\\begin\{flushleft\}([\s\S]*?)\\end\{flushleft\}/g, (_, inner) => {
    return `<div class="my-3 text-left w-full clear-both" style="text-align: left;">\n${inner.trim()}\n</div>`;
  });

  // \begin{flushright} ... \end{flushright}
  res = res.replace(/\\begin\{flushright\}([\s\S]*?)\\end\{flushright\}/g, (_, inner) => {
    return `<div class="my-3 text-right w-full clear-both" style="text-align: right;">\n${inner.trim()}\n</div>`;
  });

  // \begin{theorem} ... \end{theorem}
  res = res.replace(/\\begin\{theorem\}([\s\S]*?)\\end\{theorem\}/g, (_, inner) => {
    return `> [!THEOREM]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{definition} ... \end{definition}
  res = res.replace(/\\begin\{definition\}([\s\S]*?)\\end\{definition\}/g, (_, inner) => {
    return `> [!DEFINITION]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{lemma} ... \end{lemma}
  res = res.replace(/\\begin\{lemma\}([\s\S]*?)\\end\{lemma\}/g, (_, inner) => {
    return `> [!LEMMA]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  // \begin{proof} ... \end{proof}
  res = res.replace(/\\begin\{proof\}([\s\S]*?)\\end\{proof\}/g, (_, inner) => {
    return `> [!PROOF]\n> ${inner.trim().replace(/\n/g, '\n> ')}`;
  });

  return res;
}

/**
 * Renders the markdown content of a single page into pristine HTML.
 */
export function renderPageContent(
  pageMarkdown: string,
  assets?: Record<string, DocumentAsset>,
  pageTableOffset: number = 0,
  pageIframeOffset: number = 0
): string {
  if (!pageMarkdown || !pageMarkdown.trim()) {
    return '<p class="text-slate-400 italic py-8 text-center text-sm">Empty page content. Type or insert elements in the editor.</p>';
  }

  // Token storage arrays
  const mathDisplayTokens: string[] = [];
  const mathInlineTokens: string[] = [];
  const rawHtmlTokens: string[] = [];
  const iframeTokens: { title: string; url: string; width: string; height: string; idx: number }[] = [];

  // Parse LaTeX block environments first
  let content = parseLatexEnvironments(pageMarkdown);

  // Pre-process images (both \includegraphics and ![alt](src))
  content = parseCustomImages(content, assets);

  // Extract interactive simulations
  content = content.replace(/:::iframe\s*\n([\s\S]*?)\n:::/g, (_, block) => {
    const lines = block.split('\n');
    let title = 'Interactive Simulation';
    let url = '';
    let width = '100%';
    let height = '380px';

    lines.forEach((l: string) => {
      const [k, ...vParts] = l.split(':');
      const val = vParts.join(':').trim();
      if (!k) return;
      const key = k.trim().toLowerCase();
      if (key === 'title') title = val;
      if (key === 'url' || key === 'src') url = val;
      if (key === 'width') width = val;
      if (key === 'height') height = val;
    });

    if (!url) return '';
    const idx = pageIframeOffset + iframeTokens.length;
    const token = `%%IFRAME_TOKEN_${iframeTokens.length}%%`;
    iframeTokens.push({ title, url, width, height, idx });
    return `\n\n${token}\n\n`;
  });

  // Extract raw HTML iframes
  content = content.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>|<iframe\b([^>]*)\/>/gi, (_, attrs1, attrs2) => {
    const attrs = attrs1 || attrs2 || '';
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    const url = srcMatch ? srcMatch[1] : '';
    if (!url) return '';

    const titleMatch = attrs.match(/title=["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : 'Embedded Simulation';

    const widthMatch = attrs.match(/width=["']?([^\s"'>]+)["']?/);
    const width = widthMatch ? (widthMatch[1].endsWith('%') || widthMatch[1].endsWith('px') ? widthMatch[1] : `${widthMatch[1]}px`) : '100%';

    const heightMatch = attrs.match(/height=["']?([^\s"'>]+)["']?/);
    const height = heightMatch ? (heightMatch[1].endsWith('%') || heightMatch[1].endsWith('px') ? heightMatch[1] : `${heightMatch[1]}px`) : '380px';

    const idx = pageIframeOffset + iframeTokens.length;
    const token = `%%IFRAME_TOKEN_${iframeTokens.length}%%`;
    iframeTokens.push({ title, url, width, height, idx });
    return `\n\n${token}\n\n`;
  });

  // 1. Extract Display Math: $$ ... $$ or \[ ... \]
  content = content.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g, (_, p1, p2) => {
    const formula = (p1 || p2 || '').trim();
    const token = `%%MATH_DISP_${mathDisplayTokens.length}%%`;
    mathDisplayTokens.push(formula);
    return `\n\n${token}\n\n`;
  });

  // 2. Extract Inline Math: $ ... $ or \( ... \)
  content = content.replace(/(^|[^\\])\$([^\$\n]+?)\$|\\\(([\s\S]*?)\\\)/g, (match, prefix, p1, p2) => {
    const formula = (p1 || p2 || '').trim();
    const lead = prefix || '';
    const token = `%%MATH_INL_${mathInlineTokens.length}%%`;
    mathInlineTokens.push(formula);
    return `${lead}${token}`;
  });

  // 3. Extract intentional HTML tags (like <span style="...">, <u>, <mark>, <del>, <figure>, <img>)
  content = content.replace(/<(span|mark|del|u|b|i|figure|img|figcaption|font|div)[^>]*>[\s\S]*?<\/\1>|<(img|hr|br)[^>]*\/?>/gi, (match) => {
    const token = `%%RAW_HTML_${rawHtmlTokens.length}%%`;
    rawHtmlTokens.push(match);
    return token;
  });

  // Line-by-line block parser
  const lines = content.split('\n');
  const outHtml: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let inBlockquote = false;
  let blockquoteType = 'normal';
  let blockquoteBuffer: string[] = [];
  let inTable = false;
  let tableBuffer: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  const flushList = () => {
    if (inList) {
      outHtml.push(`</${listType}>`);
      inList = false;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      const inner = blockquoteBuffer.map(l => parseInlineMarkdown(l)).join('<br/>');
      let borderClass = 'border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200';
      let titleBadge = '';

      if (blockquoteType === 'THEOREM') {
        borderClass = 'border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100';
        titleBadge = '<div class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Theorem</div>';
      } else if (blockquoteType === 'DEFINITION') {
        borderClass = 'border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100';
        titleBadge = '<div class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Definition</div>';
      } else if (blockquoteType === 'LEMMA') {
        borderClass = 'border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100';
        titleBadge = '<div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Lemma</div>';
      } else if (blockquoteType === 'PROOF') {
        borderClass = 'border-l-4 border-slate-400 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 italic';
        titleBadge = '<div class="text-xs font-bold not-italic tracking-wider text-slate-600 dark:text-slate-400 mb-1">Proof</div>';
      } else if (blockquoteType === 'EXAM_QUESTION') {
        borderClass = 'border-l-4 border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100';
        titleBadge = '<div class="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">Examination Question</div>';
      } else if (blockquoteType === 'NOTE') {
        borderClass = 'border-l-4 border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 text-sky-950 dark:text-sky-100';
        titleBadge = '<div class="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">Note</div>';
      } else if (blockquoteType === 'FORMULA' || blockquoteType === 'KEY') {
        borderClass = 'border-l-4 border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 text-purple-950 dark:text-purple-100';
        titleBadge = '<div class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Important Formula</div>';
      }

      outHtml.push(`<blockquote class="my-3 px-4 py-2.5 rounded-r-xl ${borderClass} break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${titleBadge}${inner}</blockquote>`);
      inBlockquote = false;
      blockquoteBuffer = [];
      blockquoteType = 'normal';
    }
  };

  let currentTableIndex = pageTableOffset;
  const flushTable = () => {
    if (inTable && tableBuffer.length > 0) {
      outHtml.push(renderMarkdownTable(tableBuffer, currentTableIndex++));
      inTable = false;
      tableBuffer = [];
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      const codeContent = codeBuffer.map(l => escapeHtmlEntities(l)).join('\n');
      outHtml.push(`
        <pre class="my-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto w-full max-w-full border border-slate-800" style="width: 100%; max-width: 100%;">
          <code>${codeContent}</code>
        </pre>
      `);
      inCodeBlock = false;
      codeBuffer = [];
      codeLang = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for display math token standing alone
    const dispMatch = trimmed.match(/^%%MATH_DISP_(\d+)%%$/);
    if (dispMatch) {
      flushList();
      flushBlockquote();
      flushTable();
      flushCodeBlock();
      const tokenIdx = parseInt(dispMatch[1], 10);
      const formula = mathDisplayTokens[tokenIdx] || '';
      outHtml.push(renderKaTeXFormula(formula, true));
      continue;
    }

    // Check for iframe / simulation token standing alone
    const iframeMatch = trimmed.match(/^%%IFRAME_TOKEN_(\d+)%%$/);
    if (iframeMatch) {
      flushList();
      flushBlockquote();
      flushTable();
      flushCodeBlock();
      const tokenIdx = parseInt(iframeMatch[1], 10);
      const info = iframeTokens[tokenIdx];
      if (info) {
        outHtml.push(renderSimulationBlock(info));
      }
      continue;
    }

    // Code block check
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        flushBlockquote();
        flushTable();
        inCodeBlock = true;
        codeLang = trimmed.replace(/^```/, '').trim();
      } else {
        flushCodeBlock();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table line check
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      flushBlockquote();
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Horizontal divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      flushBlockquote();
      outHtml.push('<hr class="my-5 border-t border-slate-200 dark:border-slate-800" />');
      continue;
    }

    // Callout / Blockquote
    if (trimmed.startsWith('>')) {
      flushList();
      flushTable();
      inBlockquote = true;
      const quoteText = trimmed.replace(/^>\s?/, '');
      if (quoteText.startsWith('[!THEOREM]')) {
        blockquoteType = 'THEOREM';
      } else if (quoteText.startsWith('[!DEFINITION]')) {
        blockquoteType = 'DEFINITION';
      } else if (quoteText.startsWith('[!LEMMA]')) {
        blockquoteType = 'LEMMA';
      } else if (quoteText.startsWith('[!PROOF]')) {
        blockquoteType = 'PROOF';
      } else if (quoteText.startsWith('[!EXAM_QUESTION]')) {
        blockquoteType = 'EXAM_QUESTION';
      } else if (quoteText.startsWith('[!NOTE]')) {
        blockquoteType = 'NOTE';
      } else if (quoteText.startsWith('[!FORMULA]') || quoteText.startsWith('[!KEY]')) {
        blockquoteType = 'FORMULA';
      } else {
        blockquoteBuffer.push(quoteText);
      }
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Headings
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      flushList();
      flushBlockquote();
      flushTable();

      if (trimmed.startsWith('# ')) {
        const raw = trimmed.substring(2);
        const text = parseInlineMarkdown(raw);
        outHtml.push(`<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-6 mb-3 text-slate-900 dark:text-slate-50 border-b border-slate-200/80 dark:border-slate-800 pb-1.5 break-words w-full max-w-full" style="column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%;">${text}</h1>`);
      } else if (trimmed.startsWith('## ')) {
        const raw = trimmed.substring(3);
        const text = parseInlineMarkdown(raw);
        outHtml.push(`<h2 class="text-xl sm:text-2xl font-bold tracking-tight mt-5 mb-2.5 text-slate-800 dark:text-slate-100 break-words w-full max-w-full" style="column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%;">${text}</h2>`);
      } else if (trimmed.startsWith('### ')) {
        const raw = trimmed.substring(4);
        const text = parseInlineMarkdown(raw);
        outHtml.push(`<h3 class="text-lg sm:text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${text}</h3>`);
      } else if (trimmed.startsWith('#### ')) {
        const raw = trimmed.substring(5);
        const text = parseInlineMarkdown(raw);
        outHtml.push(`<h4 class="text-base sm:text-lg font-semibold mt-3 mb-1.5 text-slate-700 dark:text-slate-300 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${text}</h4>`);
      }
      continue;
    }

    // Lists: Unordered
    if (/^[-*+]\s+/.test(trimmed)) {
      flushBlockquote();
      flushTable();
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
        outHtml.push('<ul class="list-disc list-outside pl-6 my-2 space-y-1 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">');
      }
      const raw = trimmed.replace(/^[-*+]\s+/, '');
      const itemText = parseInlineMarkdown(raw);
      outHtml.push(`<li class="break-words w-full max-w-full">${itemText}</li>`);
      continue;
    }

    // Lists: Ordered
    if (/^\d+\.\s+/.test(trimmed)) {
      flushBlockquote();
      flushTable();
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
        outHtml.push('<ol class="list-decimal list-outside pl-6 my-2 space-y-1 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">');
      }
      const raw = trimmed.replace(/^\d+\.\s+/, '');
      const itemText = parseInlineMarkdown(raw);
      outHtml.push(`<li class="break-words w-full max-w-full">${itemText}</li>`);
      continue;
    }

    // If we reach here and list was active, close it
    flushList();

    // Empty line / paragraph break
    if (trimmed === '') {
      continue;
    }

    // Regular paragraph
    const pText = parseInlineMarkdown(line);
    outHtml.push(`<p class="my-2 leading-relaxed text-slate-800 dark:text-slate-200 break-words w-full max-w-full" style="width: 100%; max-width: 100%;">${pText}</p>`);
  }

  // Final flushes
  flushList();
  flushBlockquote();
  flushTable();
  flushCodeBlock();

  let renderedDocument = outHtml.join('\n');

  // 4. Restore Raw HTML Tokens first so math or inline tokens inside them are expanded
  renderedDocument = renderedDocument.replace(/%%RAW_HTML_(\d+)%%/g, (_, id) => {
    const idx = parseInt(id, 10);
    return rawHtmlTokens[idx] || '';
  });

  // 5. Restore Display Math Tokens
  renderedDocument = renderedDocument.replace(/%%MATH_DISP_(\d+)%%/g, (_, id) => {
    const idx = parseInt(id, 10);
    const formula = mathDisplayTokens[idx] || '';
    return renderKaTeXFormula(formula, true);
  });

  // 6. Restore Inline Math Tokens
  renderedDocument = renderedDocument.replace(/%%MATH_INL_(\d+)%%/g, (_, id) => {
    const idx = parseInt(id, 10);
    const formula = mathInlineTokens[idx] || '';
    return renderKaTeXFormula(formula, false);
  });

  // 7. Restore any remaining simulation iframe tokens
  renderedDocument = renderedDocument.replace(/%%IFRAME_TOKEN_(\d+)%%/g, (_, id) => {
    const idx = parseInt(id, 10);
    const info = iframeTokens[idx];
    return info ? renderSimulationBlock(info) : '';
  });

  return renderedDocument;
}

/**
 * Helper to render markdown table lines into a clean, interactive, responsive HTML table
 */
export function renderMarkdownTable(lines: string[], tableIndex: number = 0): string {
  if (lines.length < 2) return '';
  const rows = lines.map(line => 
    line.split('|')
      .slice(1, -1)
      .map(cell => cell.trim())
  );

  const headerRow = rows[0];
  const isSeparator = (r: string[]) => r.every(cell => /^[-:]+$/.test(cell));
  const bodyRows = rows.slice(1).filter(r => !isSeparator(r));

  // Determine alignments from separator if present
  const sepRow = rows.slice(1).find(isSeparator);
  const alignments = headerRow.map((_, i) => {
    if (!sepRow || !sepRow[i]) return 'left';
    const s = sepRow[i].trim();
    if (s.startsWith(':') && s.endsWith(':')) return 'center';
    if (s.endsWith(':')) return 'right';
    return 'left';
  });

  const thead = `
    <thead>
      <tr class="bg-slate-100 dark:bg-slate-800/80 font-bold border-b border-slate-300 dark:border-slate-700">
        ${headerRow.map((h, colIdx) => `
          <th 
            contenteditable="true" 
            data-table-cell="true" 
            data-table-idx="${tableIndex}" 
            data-row-idx="0" 
            data-col-idx="${colIdx}" 
            style="text-align: ${alignments[colIdx] || 'left'}; position: relative;"
            class="notebook-table-cell px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold break-words transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/30 focus:outline-none focus:bg-blue-50/80 dark:focus:bg-blue-900/40 focus:ring-1 focus:ring-blue-500"
          >
            ${parseInlineMarkdown(h)}
            <div class="table-col-resizer print:hidden absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/70 active:bg-blue-600 transition-colors z-10" data-col-resizer="${colIdx}"></div>
          </th>`).join('')}
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody>
      ${bodyRows.map((row, rowIdx) => `
        <tr class="${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/40'} border-b border-slate-200 dark:border-slate-800">
          ${row.map((cell, colIdx) => `
            <td 
              contenteditable="true" 
              data-table-cell="true" 
              data-table-idx="${tableIndex}" 
              data-row-idx="${rowIdx + 1}" 
              data-col-idx="${colIdx}" 
              style="text-align: ${alignments[colIdx] || 'left'};"
              class="notebook-table-cell px-3 py-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm break-words transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/30 focus:outline-none focus:bg-blue-50/80 dark:focus:bg-blue-900/40 focus:ring-1 focus:ring-blue-500"
            >
              ${parseInlineMarkdown(cell)}
            </td>
          `).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;

  return `
    <div class="my-4 overflow-x-auto w-full max-w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs relative group/table" data-table-wrapper="${tableIndex}" style="column-span: all; -webkit-column-span: all; width: 100%; max-width: 100%;">
      <table class="notebook-table w-full border-collapse break-words max-w-full" data-table-idx="${tableIndex}" style="width: 100%; max-width: 100%;">
        ${thead}
        ${tbody}
      </table>
    </div>
  `;
}
