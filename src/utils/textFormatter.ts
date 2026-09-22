import { DocumentAsset, NotebookDocument, PageSettings, DEFAULT_PAGE_SETTINGS } from '../types/notebook';

/**
 * Color mapping for standard LaTeX and named colors to CSS hex
 */
export const LATEX_COLOR_MAP: Record<string, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  purple: '#9333ea',
  violet: '#7c3aed',
  yellow: '#ca8a04',
  orange: '#ea580c',
  teal: '#0d9488',
  cyan: '#0891b2',
  pink: '#db2777',
  emerald: '#059669',
  indigo: '#4f46e5',
  rose: '#e11d48',
  amber: '#d97706',
  gray: '#4b5563',
  grey: '#4b5563',
  black: '#0f172a',
  white: '#ffffff',
  brown: '#78350f',
  gold: '#b45309',
  navy: '#1e3a8a',
  sky: '#0284c7',
  lime: '#65a30d',
  fuchsia: '#c026d3'
};

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolves a color string (name or hex) to a valid CSS color
 */
export function resolveCssColor(colorNameOrHex: string): string {
  const trimmed = colorNameOrHex.trim().toLowerCase();
  if (LATEX_COLOR_MAP[trimmed]) {
    return LATEX_COLOR_MAP[trimmed];
  }
  return colorNameOrHex.trim();
}

/**
 * Deep sanitization function for removing legacy cached/injected font tags
 * and font-family inline styles, restoring default clean LaTeX typography
 * without leaving behind empty style attributes or empty span wrappers.
 */
export function sanitizeCachedFonts(raw: string): string {
  if (!raw) return '';

  let sanitized = raw;

  // 1. Remove all <font ...> and </font> tags, preserving inner text
  sanitized = sanitized.replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, '$1');
  sanitized = sanitized.replace(/<\/?font\b[^>]*>/gi, '');

  // 2. Clean font-family declarations inside any style="..." attributes
  sanitized = sanitized.replace(/style="([^"]*)"/gi, (match, styleContent) => {
    // Split declarations
    const declarations = styleContent
      .split(';')
      .map((d: string) => d.trim())
      .filter((d: string) => {
        if (!d) return false;
        const lower = d.toLowerCase();
        // Remove font-family rules
        return !lower.startsWith('font-family');
      });

    if (declarations.length === 0) {
      return ''; // Empty style attribute to be stripped
    }

    return `style="${declarations.join('; ')}"`;
  });

  // 3. Remove empty style="" or style="   "
  sanitized = sanitized.replace(/\s*style="\s*"/gi, '');

  // 4. Unwrap bare <span> tags that have no attributes remaining e.g. <span>text</span>
  sanitized = sanitized.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');

  return sanitized;
}

/**
 * Comprehensive migration and sanitization for any cached document from localStorage or imports.
 * Ensures backward compatibility: converts legacy base64 images to assets, ensures valid schemas,
 * sanitizes legacy broken tags, and ensures all tools (resizing, repositioning, formatting) work immediately.
 */
export function migrateAndSanitizeCachedDoc(rawDoc: any): NotebookDocument {
  const assets: Record<string, DocumentAsset> = { ...(rawDoc.assets || {}) };
  let content = rawDoc.content || '';

  // 1. Sanitize legacy font tags
  content = sanitizeCachedFonts(content);

  // 2. Extract embedded base64 images into structured assets if any
  let imgCounter = Object.keys(assets).length + 1;
  content = content.replace(/(?:!\[([^\]]*)\]\(|<img\b[^>]*src=["'])(data:image\/[a-zA-Z0-9+.-]+;base64,[^"'\s)]+)(?:["'][^>]*>|\)(?:\{[^}]+\})?)/gi, (fullMatch, altOrMatch, dataUrl) => {
    const rawDataUrl = dataUrl || altOrMatch;
    if (!rawDataUrl || !rawDataUrl.startsWith('data:image/')) return fullMatch;

    // Check if dataUrl already exists in assets
    let existingId: string | null = null;
    for (const [id, asset] of Object.entries(assets)) {
      if (asset.dataUrl === rawDataUrl) {
        existingId = id;
        break;
      }
    }

    if (!existingId) {
      const mime = rawDataUrl.substring(rawDataUrl.indexOf(':') + 1, rawDataUrl.indexOf(';')) || 'image/png';
      const newId = `img_cached_${imgCounter++}`;
      const sizeBytes = Math.round((rawDataUrl.length * 3) / 4);
      assets[newId] = {
        id: newId,
        name: `cached_image_${newId}.${mime.split('/')[1] || 'png'}`,
        mimeType: mime,
        sizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
        dataUrl: rawDataUrl
      };
      existingId = newId;
    }

    return `\\includegraphics[width=75%, align=center]{asset://${existingId}}`;
  });

  const pageSettings: PageSettings = {
    ...DEFAULT_PAGE_SETTINGS,
    ...(rawDoc.pageSettings || {}),
    fontFamily: rawDoc.pageSettings?.fontFamily || "'KaTeX_Main', serif"
  };

  return {
    id: rawDoc.id || 'doc-1',
    title: rawDoc.title || 'Untitled Academic Note',
    author: rawDoc.author || 'Student',
    subject: rawDoc.subject || 'General Study',
    content,
    pageSettings,
    customFonts: Array.isArray(rawDoc.customFonts) ? rawDoc.customFonts : [],
    assets,
    createdAt: rawDoc.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Helper to parse and update or merge inline style properties on a HTML snippet.
 */
export function applyInlineStyleToSelection(
  snippet: string,
  property: string,
  value: string
): string {
  const trimmed = snippet.trim();
  if (!trimmed) return snippet;

  // Check if snippet is already wrapped in a single <span style="...">inner</span>
  const spanRegex = /^<span\s+style="([^"]*)"\s*>([\s\S]*?)<\/span>$/i;
  const match = trimmed.match(spanRegex);

  if (match) {
    const existingStyleStr = match[1];
    const innerContent = match[2];

    const styles: Record<string, string> = {};
    existingStyleStr.split(';').forEach(item => {
      const colIdx = item.indexOf(':');
      if (colIdx !== -1) {
        const key = item.slice(0, colIdx).trim().toLowerCase();
        const val = item.slice(colIdx + 1).trim();
        if (key && val) styles[key] = val;
      }
    });

    const propKey = property.toLowerCase();
    if (value === 'transparent' || !value) {
      delete styles[propKey];
    } else {
      styles[propKey] = value;
    }

    const styleEntries = Object.entries(styles);
    if (styleEntries.length === 0) {
      return innerContent;
    }

    const mergedStyles = styleEntries
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');

    return `<span style="${mergedStyles}">${innerContent}</span>`;
  }

  // Otherwise, wrap cleanly in a new span
  if (value === 'transparent' || !value) {
    return trimmed;
  }
  return `<span style="${property}: ${value}">${trimmed}</span>`;
}

/**
 * Checks if two image sources match, accounting for asset:// IDs, data URLs,
 * and relative / absolute URLs.
 */
function isImageSourceMatch(src: string, targetSrc: string, assets?: Record<string, DocumentAsset>): boolean {
  if (!src || !targetSrc) return false;
  const cleanSrc = src.replace('asset://', '').trim();
  const cleanTarget = targetSrc.replace('asset://', '').trim();

  if (cleanSrc === cleanTarget || src === targetSrc) return true;
  if (src.includes(cleanTarget) || targetSrc.includes(cleanSrc)) return true;

  // Check asset data URLs
  if (assets) {
    // If targetSrc is a data URL and src is an asset ID
    if (assets[cleanSrc]?.dataUrl && (assets[cleanSrc].dataUrl === targetSrc || targetSrc.startsWith(assets[cleanSrc].dataUrl.slice(0, 50)))) {
      return true;
    }
    // If src is a data URL and targetSrc is an asset ID
    if (assets[cleanTarget]?.dataUrl && (assets[cleanTarget].dataUrl === src || src.startsWith(assets[cleanTarget].dataUrl.slice(0, 50)))) {
      return true;
    }
  }

  return false;
}

/**
 * Updates an image (Markdown ![alt](src){width=... align=...},
 * LaTeX \\includegraphics[width=..., align=...]{src}, or HTML <img ...>) in document content.
 */
export function updateImageInMarkdown(
  content: string,
  targetSrc: string,
  newWidth?: string,
  newAlign?: string,
  newCaption?: string,
  assets?: Record<string, DocumentAsset>
): string {
  if (!content || !targetSrc) return content;

  let replaced = false;

  // 1. Check LaTeX \includegraphics[options]{src} or \includegraphics{src}
  let result = content.replace(
    /\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/g,
    (match, optStr, src) => {
      if (!isImageSourceMatch(src, targetSrc, assets)) return match;
      replaced = true;

      let width = newWidth || '75%';
      let align = newAlign || 'center';
      let caption = newCaption;

      if (optStr) {
        if (!newWidth) {
          const wMatch = optStr.match(/width=([^\s,}]+)/);
          if (wMatch) width = wMatch[1];
        }
        if (!newAlign) {
          const aMatch = optStr.match(/align=([^\s,}]+)/);
          if (aMatch) align = aMatch[1];
        }
        if (caption === undefined) {
          const cMatch = optStr.match(/caption=([^\s,}]+)/);
          if (cMatch) caption = cMatch[1];
        }
      }

      const opts: string[] = [`width=${width}`, `align=${align}`];
      if (caption) opts.push(`caption=${caption}`);
      return `\\includegraphics[${opts.join(', ')}]{${src}}`;
    }
  );

  // 2. Check Markdown ![alt](src){params} or ![alt](src)
  if (!replaced) {
    result = result.replace(
      /!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g,
      (match, alt, src, paramsStr) => {
        if (!isImageSourceMatch(src, targetSrc, assets)) return match;
        replaced = true;

        let width = newWidth || '75%';
        let align = newAlign || 'block-center';
        let caption = newCaption !== undefined ? newCaption : alt;

        if (paramsStr) {
          if (!newWidth) {
            const wMatch = paramsStr.match(/width=([^\s,}]+)/);
            if (wMatch) width = wMatch[1];
          }
          if (!newAlign) {
            const aMatch = paramsStr.match(/align=([^\s,}]+)/);
            if (aMatch) align = aMatch[1];
          }
        }

        return `![${caption || ''}](${src}){width=${width} align=${align}}`;
      }
    );
  }

  // 3. Check HTML <figure><img src="...">...</figure> or <img src="..."> in existing text
  if (!replaced) {
    result = result.replace(
      /<figure\b[^>]*>[\s\S]*?<img\b([^>]*)>[\s\S]*?(?:<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>|<img\b([^>]*)\/?>/gi,
      (match, imgAttrs1, figCaption, imgAttrs2) => {
        const attrs = imgAttrs1 || imgAttrs2 || '';
        const srcMatch = attrs.match(/src=["']([^"']+)["']/);
        const src = srcMatch ? srcMatch[1] : '';
        if (!src || !isImageSourceMatch(src, targetSrc, assets)) return match;
        replaced = true;

        let width = newWidth || '75%';
        let align = newAlign || 'center';
        let caption = newCaption !== undefined ? newCaption : (figCaption || '');

        return `\\includegraphics[width=${width}, align=${align}${caption ? `, caption=${caption}` : ''}]{${src}}`;
      }
    );
  }

  return result;
}

/**
 * Deletes an image token from the document content.
 */
export function deleteImageInMarkdown(
  content: string, 
  targetSrc: string,
  assets?: Record<string, DocumentAsset>
): string {
  if (!content || !targetSrc) return content;

  // 1. Remove LaTeX \includegraphics
  let res = content.replace(/[ \t]*\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}[ \t]*\n?/g, (match, src) => {
    if (isImageSourceMatch(src, targetSrc, assets)) {
      return '';
    }
    return match;
  });

  // 2. Remove Markdown image
  res = res.replace(/[ \t]*!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]+\})?[ \t]*\n?/g, (match, alt, src) => {
    if (isImageSourceMatch(src, targetSrc, assets)) {
      return '';
    }
    return match;
  });

  // 3. Remove HTML figure and img
  res = res.replace(/[ \t]*(?:<figure\b[^>]*>[\s\S]*?<img\b([^>]*)>[\s\S]*?<\/figure>|<img\b([^>]*)\/?>)[ \t]*\n?/gi, (match, attrs1, attrs2) => {
    const attrs = attrs1 || attrs2 || '';
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';
    if (src && isImageSourceMatch(src, targetSrc, assets)) {
      return '';
    }
    return match;
  });

  return res.replace(/\n{3,}/g, '\n\n');
}

/**
 * Formats a specific selected substring inside markdown document content.
 * Uses LaTeX-native commands (\large, \textcolor, \colorbox, \textbf, \textit, \newpage)
 * and markdown inline syntax synchronized with the editor code.
 */
export function applyFormattingToMarkdown({
  content,
  selectedText,
  action,
  value,
  contextBefore = '',
  contextAfter = ''
}: {
  content: string;
  selectedText: string;
  action: string;
  value?: string;
  contextBefore?: string;
  contextAfter?: string;
}): string {
  const trimmed = selectedText.trim();
  if (!trimmed) return content;

  // Build replacement string based on action
  let replacement = trimmed;
  switch (action) {
    case 'bold':
      replacement = `**${trimmed}**`;
      break;
    case 'italic':
      replacement = `*${trimmed}*`;
      break;
    case 'underline':
      replacement = `\\underline{${trimmed}}`;
      break;
    case 'strike':
    case 'strikethrough':
      replacement = `~~${trimmed}~~`;
      break;
    case 'subscript':
      replacement = `<sub>${trimmed}</sub>`;
      break;
    case 'superscript':
      replacement = `<sup>${trimmed}</sup>`;
      break;
    case 'math':
    case 'latex-inline':
      replacement = `$${trimmed}$`;
      break;
    case 'displayMath':
    case 'latex-block':
      replacement = `\n$$\n${trimmed}\n$$\n`;
      break;
    case 'font':
    case 'font-family':
    case 'latex-font':
      replacement = `<span style="font-family: ${value || "'KaTeX_Main', serif"}">${trimmed}</span>`;
      break;
    case 'fontSize':
    case 'font-size':
      if (value === 'tiny' || value === '8pt') replacement = `\\tiny{${trimmed}}`;
      else if (value === 'scriptsize' || value === '9pt') replacement = `\\scriptsize{${trimmed}}`;
      else if (value === 'small' || value === '10pt') replacement = `\\small{${trimmed}}`;
      else if (value === 'normalsize' || value === '12pt') replacement = `\\normalsize{${trimmed}}`;
      else if (value === 'large' || value === '14pt') replacement = `\\large{${trimmed}}`;
      else if (value === 'Large' || value === '18pt') replacement = `\\Large{${trimmed}}`;
      else if (value === 'LARGE' || value === '22pt') replacement = `\\LARGE{${trimmed}}`;
      else if (value === 'huge' || value === '26pt') replacement = `\\huge{${trimmed}}`;
      else if (value === 'Huge' || value === '32pt') replacement = `\\Huge{${trimmed}}`;
      else if (value === 'h' || value === 'h1') replacement = `\\h1{${trimmed}}`;
      else if (value === 'h2') replacement = `\\h2{${trimmed}}`;
      else if (value === 'h3') replacement = `\\h3{${trimmed}}`;
      else if (value) replacement = `\\size{${value}}{${trimmed}}`;
      else replacement = `\\large{${trimmed}}`;
      break;
    case 'color':
      replacement = `\\textcolor{${value || '#2563eb'}}{${trimmed}}`;
      break;
    case 'highlight':
      if (value === 'transparent') {
        replacement = trimmed;
      } else {
        replacement = `\\colorbox{${value || '#fef08a'}}{${trimmed}}`;
      }
      break;
    case 'heading':
      if (value === 'h1') replacement = `\n# ${trimmed}\n`;
      else if (value === 'h2') replacement = `\n## ${trimmed}\n`;
      else if (value === 'h3') replacement = `\n### ${trimmed}\n`;
      else replacement = `\n${trimmed}\n`;
      break;
    case 'h1':
      replacement = `\n# ${trimmed}\n`;
      break;
    case 'h2':
      replacement = `\n## ${trimmed}\n`;
      break;
    case 'h3':
      replacement = `\n### ${trimmed}\n`;
      break;
    case 'code':
      replacement = `\`${trimmed}\``;
      break;
    case 'quote':
      replacement = `\n> ${trimmed}\n`;
      break;
    case 'callout-info':
      replacement = `\n> [!NOTE]\n> ${trimmed}\n`;
      break;
    case 'callout-tip':
      replacement = `\n> [!TIP]\n> ${trimmed}\n`;
      break;
    case 'callout-warning':
      replacement = `\n> [!WARNING]\n> ${trimmed}\n`;
      break;
    case 'callout-danger':
      replacement = `\n> [!DANGER]\n> ${trimmed}\n`;
      break;
    case 'align':
      if (value === 'center') replacement = `\n\\centerline{${trimmed}}\n`;
      else if (value === 'right') replacement = `\n\\rightline{${trimmed}}\n`;
      else if (value === 'left') replacement = `\n\\leftline{${trimmed}}\n`;
      else replacement = `\n<div align="${value || 'center'}">\n\n${trimmed}\n\n</div>\n`;
      break;
    case 'newpage':
    case 'pagebreak':
      replacement = `\n\\newpage\n`;
      break;
    default:
      return content;
  }

  // Preserve leading/trailing spaces from original selection if any
  const leadingSpaces = selectedText.match(/^\s*/)?.[0] || '';
  const trailingSpaces = selectedText.match(/\s*$/)?.[0] || '';
  const finalReplacement = `${leadingSpaces}${replacement}${trailingSpaces}`;

  // 1. If selectedText itself is a full <span style="...">inner</span> tag
  const isFullSpan = /^<span\s+style="[^"]*"\s*>[\s\S]*?<\/span>$/i.test(trimmed);
  if (isFullSpan) {
    if (['font', 'fontSize', 'font-size', 'color', 'latex-font', 'font-family', 'highlight'].includes(action)) {
      const prop = ['font', 'latex-font', 'font-family'].includes(action)
        ? 'font-family'
        : action === 'color'
        ? 'color'
        : action === 'highlight'
        ? 'background-color'
        : 'font-size';
      const val = ['font', 'latex-font', 'font-family'].includes(action)
        ? (value || "'KaTeX_Main', serif")
        : action === 'color'
        ? (value || '#2563eb')
        : action === 'highlight'
        ? (value || '#fef08a')
        : (value || '14pt');

      const updatedSpan = applyInlineStyleToSelection(trimmed, prop, val);
      return content.replace(trimmed, updatedSpan);
    }
  }

  // 2. Check if selectedText is inside an existing <span style="..."> in markdown
  const spanSearch = /(<span\s+style="([^"]*)"\s*>)([\s\S]*?)(<\/span>)/gi;
  let spanMatch: RegExpExecArray | null;
  while ((spanMatch = spanSearch.exec(content)) !== null) {
    const fullSpan = spanMatch[0];
    const styleAttr = spanMatch[2];
    const spanInner = spanMatch[3];
    const spanIndex = spanMatch.index;

    // Check if inner content contains or equals selected trimmed text
    if (spanInner === trimmed || spanInner.includes(trimmed)) {
      if (['font', 'fontSize', 'font-size', 'color', 'latex-font', 'font-family', 'highlight'].includes(action)) {
        const prop = ['font', 'latex-font', 'font-family'].includes(action)
          ? 'font-family'
          : action === 'color'
          ? 'color'
          : action === 'highlight'
          ? 'background-color'
          : 'font-size';
        const val = ['font', 'latex-font', 'font-family'].includes(action)
          ? (value || "'KaTeX_Main', serif")
          : action === 'color'
          ? (value || '#2563eb')
          : action === 'highlight'
          ? (value || '#fef08a')
          : (value || '14pt');

        const updatedSpan = applyInlineStyleToSelection(fullSpan, prop, val);
        return (
          content.slice(0, spanIndex) +
          updatedSpan +
          content.slice(spanIndex + fullSpan.length)
        );
      }

      // If applying bold/italic/underline to text inside existing span
      if (action === 'bold') {
        let updatedInner = spanInner;
        if (updatedInner.includes(`**${trimmed}**`)) {
          updatedInner = updatedInner.replace(`**${trimmed}**`, trimmed);
        } else {
          updatedInner = updatedInner.replace(trimmed, `**${trimmed}**`);
        }
        const updatedSpan = `<span style="${styleAttr}">${updatedInner}</span>`;
        return content.slice(0, spanIndex) + updatedSpan + content.slice(spanIndex + fullSpan.length);
      }

      if (action === 'italic') {
        let updatedInner = spanInner;
        if (updatedInner.includes(`*${trimmed}*`)) {
          updatedInner = updatedInner.replace(`*${trimmed}*`, trimmed);
        } else {
          updatedInner = updatedInner.replace(trimmed, `*${trimmed}*`);
        }
        const updatedSpan = `<span style="${styleAttr}">${updatedInner}</span>`;
        return content.slice(0, spanIndex) + updatedSpan + content.slice(spanIndex + fullSpan.length);
      }

      if (action === 'underline') {
        let updatedInner = spanInner;
        if (updatedInner.includes(`\\underline{${trimmed}}`)) {
          updatedInner = updatedInner.replace(`\\underline{${trimmed}}`, trimmed);
        } else {
          updatedInner = updatedInner.replace(trimmed, `\\underline{${trimmed}}`);
        }
        const updatedSpan = `<span style="${styleAttr}">${updatedInner}</span>`;
        return content.slice(0, spanIndex) + updatedSpan + content.slice(spanIndex + fullSpan.length);
      }
    }
  }

  // 3. Check if selectedText is inside an existing \textcolor{...}{...}, \colorbox{...}{...}, or \size{...}{...}
  const latexCommandSearch = /(\\(?:textcolor|color|colorbox|highlight|large|Large|LARGE|huge|Huge|small|tiny|scriptsize|size|fontsize|fontfamily)\{[^}]*\})\{([^{}]*)\}/g;
  let cmdMatch: RegExpExecArray | null;
  while ((cmdMatch = latexCommandSearch.exec(content)) !== null) {
    const fullCmd = cmdMatch[0];
    const cmdInner = cmdMatch[2];
    if (cmdInner === trimmed || cmdInner.includes(trimmed)) {
      if (action === 'color') {
        const updated = `\\textcolor{${value || '#2563eb'}}{${cmdInner}}`;
        return content.slice(0, cmdMatch.index) + updated + content.slice(cmdMatch.index + fullCmd.length);
      }
      if (action === 'highlight') {
        if (value === 'transparent') {
          return content.slice(0, cmdMatch.index) + cmdInner + content.slice(cmdMatch.index + fullCmd.length);
        }
        const updated = `\\colorbox{${value || '#fef08a'}}{${cmdInner}}`;
        return content.slice(0, cmdMatch.index) + updated + content.slice(cmdMatch.index + fullCmd.length);
      }
      if (action === 'fontSize' || action === 'font-size') {
        const updated = `\\size{${value || '14pt'}}{${cmdInner}}`;
        return content.slice(0, cmdMatch.index) + updated + content.slice(cmdMatch.index + fullCmd.length);
      }
      if (action === 'font' || action === 'font-family' || action === 'latex-font') {
        const updated = `\\fontfamily{${value || "'KaTeX_Main', serif"}}{${cmdInner}}`;
        return content.slice(0, cmdMatch.index) + updated + content.slice(cmdMatch.index + fullCmd.length);
      }
    }
  }

  // 4. Check if already wrapped in bold/italic/underline and toggle cleanly
  if (action === 'bold') {
    const boldRegex = new RegExp(`(\\*\\*|__)\\{?${escapeRegex(trimmed)}\\}?(\\*\\*|__)`, 'g');
    if (boldRegex.test(content)) {
      return content.replace(boldRegex, trimmed);
    }
    const texBoldRegex = new RegExp(`\\\\textbf\\{${escapeRegex(trimmed)}\\}`, 'g');
    if (texBoldRegex.test(content)) {
      return content.replace(texBoldRegex, trimmed);
    }
  }

  if (action === 'italic') {
    const italicRegex = new RegExp(`(\\*|_)\\{?${escapeRegex(trimmed)}\\}?(\\*|_)`, 'g');
    if (italicRegex.test(content)) {
      return content.replace(italicRegex, trimmed);
    }
    const texItalicRegex = new RegExp(`\\\\(?:textit|emph)\\{${escapeRegex(trimmed)}\\}`, 'g');
    if (texItalicRegex.test(content)) {
      return content.replace(texItalicRegex, trimmed);
    }
  }

  if (action === 'underline') {
    const texUnderlineRegex = new RegExp(`\\\\underline\\{${escapeRegex(trimmed)}\\}|<u>${escapeRegex(trimmed)}<\\/u>`, 'g');
    if (texUnderlineRegex.test(content)) {
      return content.replace(texUnderlineRegex, trimmed);
    }
  }

  // 5. Try contextual search with HTML/LaTeX tag stripped tolerance
  const cleanContext = (str: string) => str.replace(/<[^>]*>/g, '').replace(/\\[a-zA-Z]+/g, '').replace(/[#*>`_~$\s]/g, '');
  const cleanBefore = cleanContext(contextBefore || '').slice(-15);
  const cleanAfter = cleanContext(contextAfter || '').slice(0, 15);

  let bestMatchIdx = -1;
  let bestScore = -1;

  let searchIdx = -1;
  let fromIndex = 0;
  while ((searchIdx = content.indexOf(trimmed, fromIndex)) !== -1) {
    let score = 0;
    const rawBefore = content.slice(Math.max(0, searchIdx - 60), searchIdx);
    const rawAfter = content.slice(searchIdx + trimmed.length, searchIdx + trimmed.length + 60);

    const strippedBefore = cleanContext(rawBefore);
    const strippedAfter = cleanContext(rawAfter);

    if (cleanBefore && (strippedBefore.includes(cleanBefore) || cleanBefore.includes(strippedBefore.slice(-10)))) {
      score += 5;
    }
    if (cleanAfter && (strippedAfter.includes(cleanAfter) || cleanAfter.includes(strippedAfter.slice(0, 10)))) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatchIdx = searchIdx;
    }

    fromIndex = searchIdx + 1;
  }

  if (bestMatchIdx !== -1 && (bestScore > 0 || content.indexOf(trimmed) === content.lastIndexOf(trimmed))) {
    return (
      content.slice(0, bestMatchIdx) +
      finalReplacement +
      content.slice(bestMatchIdx + trimmed.length)
    );
  }

  // 6. Direct single replacement fallback
  const firstIdx = content.indexOf(trimmed);
  if (firstIdx !== -1) {
    return (
      content.slice(0, firstIdx) +
      finalReplacement +
      content.slice(firstIdx + trimmed.length)
    );
  }

  // Fallback: return content
  return content;
}

/**
 * Updates a text block (paragraph or heading) in Markdown after direct in-sheet editing,
 * utilizing context matching (contextBefore, contextAfter) and block-type awareness to prevent
 * accidental replacement of identical text phrases in other parts of the document.
 */
export function updateMarkdownTextBlock(
  content: string,
  oldText: string,
  newText: string,
  blockType?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li',
  contextBefore?: string,
  contextAfter?: string
): string {
  const trimmedOld = oldText.trim();
  const trimmedNew = newText.trim();
  if (trimmedOld === trimmedNew) return content;

  // 1. Context-based disambiguation if multiple occurrences exist
  const occurrences: number[] = [];
  let pos = content.indexOf(trimmedOld);
  while (pos !== -1) {
    occurrences.push(pos);
    pos = content.indexOf(trimmedOld, pos + 1);
  }

  if (occurrences.length === 1) {
    const idx = occurrences[0];
    return content.slice(0, idx) + trimmedNew + content.slice(idx + trimmedOld.length);
  }

  if (occurrences.length > 1 && (contextBefore || contextAfter || blockType)) {
    let bestIdx = occurrences[0];
    let maxScore = -1;

    for (const idx of occurrences) {
      let score = 0;
      if (contextBefore) {
        const textBeforeInDoc = content.slice(Math.max(0, idx - contextBefore.length - 20), idx);
        if (textBeforeInDoc.includes(contextBefore.trim())) score += 10;
      }
      if (contextAfter) {
        const textAfterInDoc = content.slice(idx + trimmedOld.length, idx + trimmedOld.length + contextAfter.length + 20);
        if (textAfterInDoc.includes(contextAfter.trim())) score += 10;
      }
      if (blockType) {
        // Check prefix before the occurrence on the same line
        const lineStart = content.lastIndexOf('\n', idx) + 1;
        const prefixOnLine = content.slice(lineStart, idx).trim();
        if (blockType === 'h1' && prefixOnLine.startsWith('#')) score += 5;
        if (blockType === 'h2' && prefixOnLine.startsWith('##')) score += 5;
        if (blockType === 'h3' && prefixOnLine.startsWith('###')) score += 5;
        if (blockType === 'h4' && prefixOnLine.startsWith('####')) score += 5;
        if (blockType === 'li' && /^[-*+]|\d+\./.test(prefixOnLine)) score += 5;
      }

      if (score > maxScore) {
        maxScore = score;
        bestIdx = idx;
      }
    }

    return content.slice(0, bestIdx) + trimmedNew + content.slice(bestIdx + trimmedOld.length);
  }

  // 2. Line-by-line fallback with blockType checking
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(trimmedOld)) {
      if (blockType) {
        if (blockType === 'h1' && !line.trim().startsWith('# ')) continue;
        if (blockType === 'h2' && !line.trim().startsWith('## ')) continue;
        if (blockType === 'h3' && !line.trim().startsWith('### ')) continue;
        if (blockType === 'h4' && !line.trim().startsWith('#### ')) continue;
        if (blockType === 'li' && !/^[-*+]|\d+\./.test(line.trim())) continue;
      }
      lines[i] = line.replace(trimmedOld, trimmedNew);
      return lines.join('\n');
    }
  }

  return content;
}

/**
 * Updates an individual cell inside a markdown table matching tableTargetIdx.
 */
export function updateMarkdownTableCell(
  content: string,
  tableTargetIdx: number,
  targetRowIdx: number,
  targetColIdx: number,
  newText: string
): string {
  const lines = content.split('\n');
  let currentTableIdx = 0;
  let inTable = false;
  let tableStartLine = -1;
  let tableLines: string[] = [];

  const updateTableCluster = (start: number, count: number): boolean => {
    if (currentTableIdx === tableTargetIdx) {
      const hasSep = count > 1 && /^\|(?:\s*:?-+:?\s*\|)+$/.test(tableLines[1].trim());
      const dataLineOffset = targetRowIdx === 0 ? 0 : (hasSep ? targetRowIdx + 1 : targetRowIdx);

      if (dataLineOffset < tableLines.length) {
        const rowCells = tableLines[dataLineOffset].split('|').slice(1, -1);
        if (targetColIdx < rowCells.length) {
          rowCells[targetColIdx] = ` ${newText} `;
          tableLines[dataLineOffset] = `|${rowCells.join('|')}|`;
          lines.splice(start, count, ...tableLines);
          return true;
        }
      }
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableStartLine = i;
        tableLines = [lines[i]];
      } else {
        tableLines.push(lines[i]);
      }
    } else {
      if (inTable) {
        if (updateTableCluster(tableStartLine, tableLines.length)) {
          return lines.join('\n');
        }
        currentTableIdx++;
        inTable = false;
        tableLines = [];
      }
    }
  }

  if (inTable) {
    updateTableCluster(tableStartLine, tableLines.length);
  }

  return lines.join('\n');
}

/**
 * Modifies table structure (add row, add col, remove row) in markdown
 */
export function modifyMarkdownTableStructure(
  content: string,
  tableTargetIdx: number,
  action: 'add-row' | 'add-col' | 'remove-row'
): string {
  const lines = content.split('\n');
  let currentTableIdx = 0;
  let inTable = false;
  let tableStartLine = -1;
  let tableLines: string[] = [];

  const processCluster = (start: number, count: number): boolean => {
    if (currentTableIdx === tableTargetIdx) {
      const rows = tableLines.map(l => l.split('|').slice(1, -1));
      const colCount = rows[0]?.length || 2;

      if (action === 'add-row') {
        const newRowCells = Array(colCount).fill(' ... ');
        tableLines.push(`|${newRowCells.join('|')}|`);
      } else if (action === 'remove-row') {
        if (tableLines.length > 2) {
          tableLines.pop();
        }
      } else if (action === 'add-col') {
        const newHeader = `${tableLines[0].slice(0, -1)} Col ${colCount + 1} |`;
        const hasSep = count > 1 && /^\|(?:\s*:?-+:?\s*\|)+$/.test(tableLines[1].trim());
        const newSep = hasSep ? `${tableLines[1].slice(0, -1)} --- |` : '';

        const newLines = [newHeader];
        if (hasSep) newLines.push(newSep);

        for (let r = hasSep ? 2 : 1; r < tableLines.length; r++) {
          newLines.push(`${tableLines[r].slice(0, -1)} ... |`);
        }
        tableLines = newLines;
      }

      lines.splice(start, count, ...tableLines);
      return true;
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableStartLine = i;
        tableLines = [lines[i]];
      } else {
        tableLines.push(lines[i]);
      }
    } else {
      if (inTable) {
        if (processCluster(tableStartLine, tableLines.length)) {
          return lines.join('\n');
        }
        currentTableIdx++;
        inTable = false;
        tableLines = [];
      }
    }
  }

  if (inTable) {
    processCluster(tableStartLine, tableLines.length);
  }

  return lines.join('\n');
}

/**
 * Updates simulation height in markdown matching simTargetIdx.
 */
export function updateSimulationHeightInMarkdown(
  content: string,
  targetIdx: number,
  newHeightPx: number
): string {
  let simCount = 0;
  return content.replace(/:::iframe(?:\{([^}]+)\})?\s*\n([\s\S]*?)\n:::/g, (match, paramsStr, innerBody) => {
    if (simCount === targetIdx) {
      simCount++;
      let title = 'Interactive Simulation';
      let width = '100%';
      if (paramsStr) {
        const tMatch = paramsStr.match(/title="([^"]+)"|title='([^']+)'/);
        if (tMatch) title = tMatch[1] || tMatch[2];
        const wMatch = paramsStr.match(/width=([^\s,}]+)/);
        if (wMatch) width = wMatch[1];
      }
      return `:::iframe {title="${title}" width=${width} height=${newHeightPx}px}\n${innerBody.trim()}\n:::`;
    }
    simCount++;
    return match;
  });
}

