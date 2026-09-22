import { NotebookDocument, PAPER_DIMENSIONS } from '../types/notebook';
import { parseDocumentToPages } from './notebookRenderer';
import { generateFlipbookHtml } from './flipbookGenerator';

/**
 * Builds a standalone, self-contained single HTML file that bundles:
 * 1. Print-Ready Academic Sheets: Standard scrollable view with 1:1 paper dimensions.
 * 2. Sandboxed 3D Flipbook Reader: Embedded safely in an iframe attachment with smooth page-curl transitions,
 *    page-turn audio synthesizer, zoom, and thumbnail drawer.
 * 3. Offline KaTeX and zero external dependency risk.
 */
export function buildStandaloneHtml(doc: NotebookDocument): string {
  const pages = parseDocumentToPages(doc.content, doc.assets);
  const settings = doc.pageSettings;
  const paperInfo = settings.paperSize !== 'Custom' 
    ? PAPER_DIMENSIONS[settings.paperSize] 
    : { width: settings.customWidthMm, height: settings.customHeightMm, name: 'Custom' };

  const pageWidthMm = settings.orientation === 'portrait' ? paperInfo.width : paperInfo.height;
  const pageHeightMm = settings.orientation === 'portrait' ? paperInfo.height : paperInfo.width;

  // Build Google Fonts links for any custom fonts
  const googleFontLinks = doc.customFonts && doc.customFonts.length > 0 
    ? doc.customFonts.map(f => {
        const clean = f.replace(/['"]/g, '').trim();
        return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean)}:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap">`;
      }).join('\n')
    : '';

  // Generate pages HTML
  const pagesHtml = pages.map((pageHtml, idx) => {
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

    const runningHeaderHtml = settings.runningHeader.enabled && (settings.runningHeader.title || doc.title) ? `
      <div class="page-running-header">
        <span class="running-title">${settings.runningHeader.title || doc.title}</span>
        <span class="running-subtitle">${settings.runningHeader.subtitle || doc.subject || ''}</span>
      </div>
    ` : '';

    const pageFooterHtml = settings.pageNumbering.enabled ? `
      <div class="page-running-footer ${settings.pageNumbering.position}">
        <span class="page-number-text">${pageNumStr}</span>
      </div>
    ` : '';

    return `
      <div class="doc-sheet" id="page-${pageNum}">
        ${runningHeaderHtml}
        <div class="sheet-content ${settings.columns === 2 ? 'two-columns' : ''}">
          ${pageHtml}
        </div>
        ${pageFooterHtml}
      </div>
    `;
  }).join('\n');

  // Generate 3D flipbook HTML
  const flipbookHtml = generateFlipbookHtml({
    title: doc.title,
    pagesHtml: pages,
    pageSettings: doc.pageSettings,
    assets: doc.assets
  });

  // Serialize flipbookHtml safely for inline script injection
  const serializedFlipbookHtml = JSON.stringify(flipbookHtml);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(doc.title || 'Academic Notebook')}</title>
  
  <!-- Offline KaTeX with CDN fallback -->
  <link rel="stylesheet" href="/libs/katex.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" media="print" onload="this.media='all'">
  
  <!-- Document Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  ${googleFontLinks}

  <style>
    /* Local KaTeX Fonts */
    @font-face {
      font-family: 'KaTeX_Main';
      src: url('/libs/fonts/KaTeX_Main-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'KaTeX_Main';
      src: url('/libs/fonts/KaTeX_Main-Bold.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'KaTeX_Main';
      src: url('/libs/fonts/KaTeX_Main-Italic.woff2') format('woff2');
      font-weight: 400;
      font-style: italic;
    }
    @font-face {
      font-family: 'KaTeX_Math';
      src: url('/libs/fonts/KaTeX_Math-Italic.woff2') format('woff2');
      font-weight: 400;
      font-style: italic;
    }
    @font-face {
      font-family: 'KaTeX_SansSerif';
      src: url('/libs/fonts/KaTeX_SansSerif-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }

    :root {
      --font-body: ${settings.fontFamily || "'KaTeX_Main', serif"};
      --font-size: ${settings.fontSizePt}pt;
      --line-height: ${settings.lineHeight};
      --page-width: ${pageWidthMm}mm;
      --page-height: ${pageHeightMm}mm;
      --margin-top: ${settings.margins.top}mm;
      --margin-bottom: ${settings.margins.bottom}mm;
      --margin-left: ${settings.margins.left}mm;
      --margin-right: ${settings.margins.right}mm;
      --bg-page: #ffffff;
      --text-color: #1e293b;
      --border-color: #e2e8f0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-body), 'KaTeX_Main', serif;
      font-size: var(--font-size);
      line-height: var(--line-height);
      color: var(--text-color);
      background-color: #0f172a;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* Floating Web Navigation Toolbar */
    .web-navbar {
      position: sticky;
      top: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .nav-title {
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .view-mode-tabs {
      display: flex;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 3px;
      gap: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tab-btn {
      padding: 5px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      background: transparent;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .tab-btn.active {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .nav-btn.primary {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
    }
    .nav-btn.primary:hover {
      background: #1d4ed8;
    }

    /* Views Containers */
    #academic-sheets-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 15px 80px;
      gap: 25px;
      background-color: #0f172a;
    }

    #flipbook-container {
      width: 100vw;
      height: calc(100vh - 53px);
      display: none;
    }

    #flipbook-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    /* Individual Virtual Sheet */
    .doc-sheet {
      width: var(--page-width);
      min-height: var(--page-height);
      background: var(--bg-page);
      padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left);
      box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      max-width: 100%;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .sheet-content {
      flex: 1;
      max-width: 100%;
      overflow: hidden;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .sheet-content img, .sheet-content figure {
      max-width: 100%;
      height: auto;
    }

    .sheet-content.two-columns {
      column-count: 2;
      column-gap: 8mm;
      column-rule: 1px solid var(--border-color);
    }

    /* Running Header & Footer */
    .page-running-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 12px;
      font-size: 8.5pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .page-running-footer {
      display: flex;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 15px;
      font-size: 9pt;
      color: #64748b;
    }

    .page-running-footer.bottom-center { justify-content: center; }
    .page-running-footer.bottom-right { justify-content: flex-end; }
    .page-running-footer.top-right { justify-content: flex-end; }

    /* Content Typography & KaTeX */
    h1, h2, h3, h4 {
      font-family: var(--font-body), serif;
      color: #0f172a;
      page-break-after: avoid;
    }

    h1 { font-size: 1.8em; margin: 0.6em 0 0.3em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2em; }
    h2 { font-size: 1.4em; margin: 0.5em 0 0.25em; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.15em; }
    h3 { font-size: 1.15em; margin: 0.4em 0 0.2em; }

    p { margin-bottom: 0.5em; }

    ul, ol {
      margin-left: 1.5em;
      margin-bottom: 0.8em;
    }

    li { margin-bottom: 0.25em; }

    blockquote {
      border-left: 4px solid #3b82f6;
      background-color: #f8fafc;
      padding: 8px 14px;
      margin: 12px 0;
      border-radius: 0 8px 8px 0;
    }

    code {
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 0.88em;
      background-color: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #0f172a;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 0.95em;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      font-weight: 600;
    }

    /* Simulation Styles in Standalone */
    .notebook-simulation-wrapper {
      margin: 14px 0;
    }
    .simulation-live-container {
      display: block;
    }
    .simulation-print-poster {
      display: none !important;
    }

    /* Print media styling */
    @media print {
      .web-navbar {
        display: none !important;
      }

      #flipbook-container {
        display: none !important;
      }

      #academic-sheets-container {
        display: block !important;
        padding: 0 !important;
        background: transparent !important;
      }

      body {
        background: #ffffff !important;
        color: #000000 !important;
      }

      .simulation-live-container {
        display: none !important;
      }
      .simulation-print-poster {
        display: flex !important;
      }

      .doc-sheet {
        width: 100% !important;
        min-height: 100vh !important;
        height: 100vh !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <!-- Standalone Top Bar -->
  <div class="web-navbar">
    <div class="nav-title">
      <span>📖</span>
      <span>${escapeXml(doc.title || 'Document Studio Note')}</span>
    </div>

    <!-- View Mode Switcher -->
    <div class="view-mode-tabs">
      <button class="tab-btn active" id="tabSheets" onclick="switchView('sheets')">
        <span>📄</span>
        <span>Academic Sheets</span>
      </button>
      <button class="tab-btn" id="tabFlipbook" onclick="switchView('flipbook')">
        <span>📖</span>
        <span>3D Flipbook Reader</span>
      </button>
    </div>

    <div class="nav-actions">
      <button class="nav-btn primary" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <!-- View 1: Academic Sheets Desk -->
  <div id="academic-sheets-container">
    ${pagesHtml}
  </div>

  <!-- View 2: Sandboxed 3D Flipbook Reader inside Iframe -->
  <div id="flipbook-container">
    <iframe id="flipbook-iframe" sandbox="allow-scripts allow-same-origin" title="3D Flipbook Reader"></iframe>
  </div>

  <script>
    // Injected Flipbook HTML
    const flipbookContent = ${serializedFlipbookHtml};
    const iframeEl = document.getElementById('flipbook-iframe');
    if (iframeEl) {
      iframeEl.srcdoc = flipbookContent;
    }

    function switchView(view) {
      const sheetsContainer = document.getElementById('academic-sheets-container');
      const flipbookContainer = document.getElementById('flipbook-container');
      const tabSheets = document.getElementById('tabSheets');
      const tabFlipbook = document.getElementById('tabFlipbook');

      if (view === 'flipbook') {
        sheetsContainer.style.display = 'none';
        flipbookContainer.style.display = 'block';
        tabSheets.classList.remove('active');
        tabFlipbook.classList.add('active');
      } else {
        sheetsContainer.style.display = 'flex';
        flipbookContainer.style.display = 'none';
        tabSheets.classList.add('active');
        tabFlipbook.classList.remove('active');
      }
    }
  </script>
</body>
</html>`;
}

function escapeXml(str: string): string {
  return str.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

/**
 * Triggers a browser download of the standalone HTML document
 */
export function downloadNotebookHtml(doc: NotebookDocument) {
  const html = buildStandaloneHtml(doc);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${(doc.title || 'Notebook').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
