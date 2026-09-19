/**
 * CBT HTML Corrector & KaTeX Math Rendering Engine
 * Transforms any imported or generated CBT test HTML instantly to guarantee:
 * 1. KaTeX path & font face correction using absolute origin URLs
 * 2. Ultra-precise LaTeX math rendering ($$, \[, $, \() for fractions, sub/superscripts, braces & limits
 * 3. Prevention of line breaks inside inline math via .katex { white-space: nowrap !important; }
 * 4. Zero-memory-leak, loop-free execution (no heavy MutationObserver polling)
 * 5. Preservation of plain text instructions and original formatting
 * 6. Replace legacy logo "PW" with "CBT"
 */

export interface CbtCorrectorOptions {
  useLatexFont?: boolean;
}

export function prepareTestHtmlForViewer(rawHtml: string, options?: CbtCorrectorOptions): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  const origin = window.location.origin;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const assetBase = origin + (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');

  let html = rawHtml;

  // 1. Inject <base> tag at top of <head> so all relative resources in Blob URL resolve to origin
  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n    <base href="${assetBase}">`);
  } else {
    html = `<head><base href="${assetBase}"></head>` + html;
  }

  // 2. Logo Replacement: PW -> CBT
  html = html.replace(/<div class="logo-circle">\s*PW\s*<\/div>/gi, '<div class="logo-circle">CBT</div>');

  // 3. Clean broken / slow remote CDN links to ensure 100% offline execution
  html = html.replace(/<link[^>]*href=["'][^"']*(?:cdnjs\.cloudflare|cdn\.jsdelivr)[^"']*["'][^>]*>/gi, '');
  html = html.replace(/<script[^>]*src=["'][^"']*(?:cdnjs\.cloudflare|cdn\.jsdelivr)[^"']*["'][^>]*>\s*<\/script>/gi, '');

  // 4. Rewrite relative asset paths (./libs/ -> ${assetBase}libs/, ./fonts/ -> ${assetBase}fonts/)
  html = html.replace(/(href|src)=["'](?:\.\/)?libs\//gi, `$1="${assetBase}libs/`);
  html = html.replace(/(href|src)=["'](?:\.\/)?fonts\//gi, `$1="${assetBase}fonts/`);
  html = html.replace(/url\(["']?(?:\.\/)?libs\//gi, `url("${assetBase}libs/`);
  html = html.replace(/url\(["']?(?:\.\/)?fonts\//gi, `url("${assetBase}fonts/`);

  // 5. Force window.mathRenderEngine = 'katex_local'
  html = html.replace(/window\.mathRenderEngine\s*=\s*['"][^'"]*['"]/g, "window.mathRenderEngine = 'katex_local'");

  // 6. Font Preference Setting (Default to KaTeX Main + Tiro Bangla + DM Serif)
  const useLatexFont = options?.useLatexFont ?? true;
  const fontStr = useLatexFont ? "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif" : "sans-serif";
  html = html.replace(/(?:const|let|var)\s+Q_FONT_FAMILY\s*=\s*["'][^"']*["'];/g, `const Q_FONT_FAMILY = "${fontStr}";`);

  // 7. Inject Absolute @font-face Definitions & Critical KaTeX Styling
  const fontCssInject = `
    <style id="cbt-katex-font-engine">
      /* --- KaTeX Absolute Font Face Registrations --- */
      @font-face {
        font-family: 'KaTeX_Main';
        src: url('${assetBase}libs/fonts/KaTeX_Main-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Main';
        src: url('${assetBase}libs/fonts/KaTeX_Main-Bold.woff2') format('woff2');
        font-weight: bold; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Main';
        src: url('${assetBase}libs/fonts/KaTeX_Main-Italic.woff2') format('woff2');
        font-weight: normal; font-style: italic;
      }
      @font-face {
        font-family: 'KaTeX_Math';
        src: url('${assetBase}libs/fonts/KaTeX_Math-Italic.woff2') format('woff2');
        font-weight: normal; font-style: italic;
      }
      @font-face {
        font-family: 'KaTeX_Math';
        src: url('${assetBase}libs/fonts/KaTeX_Math-BoldItalic.woff2') format('woff2');
        font-weight: bold; font-style: italic;
      }
      @font-face {
        font-family: 'KaTeX_AMS';
        src: url('${assetBase}libs/fonts/KaTeX_AMS-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Size1';
        src: url('${assetBase}libs/fonts/KaTeX_Size1-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Size2';
        src: url('${assetBase}libs/fonts/KaTeX_Size2-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Size3';
        src: url('${assetBase}libs/fonts/KaTeX_Size3-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Size4';
        src: url('${assetBase}libs/fonts/KaTeX_Size4-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Typewriter';
        src: url('${assetBase}libs/fonts/KaTeX_Typewriter-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_SansSerif';
        src: url('${assetBase}libs/fonts/KaTeX_SansSerif-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Caligraphic';
        src: url('${assetBase}libs/fonts/KaTeX_Caligraphic-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Fraktur';
        src: url('${assetBase}libs/fonts/KaTeX_Fraktur-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'KaTeX_Script';
        src: url('${assetBase}libs/fonts/KaTeX_Script-Regular.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'DM Serif Text';
        src: url('${assetBase}fonts/DMSerifText.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }
      @font-face {
        font-family: 'Tiro Bangla';
        src: url('${assetBase}fonts/TiroBangla.woff2') format('woff2');
        font-weight: normal; font-style: normal;
      }

      /* --- Question Body & Math Precision Styling --- */
      :root {
        --q-font: ${fontStr};
      }
      
      body, .question-content, .q-text, .opt-text, table, td, th {
        font-family: var(--q-font);
        white-space: normal;
      }
      
      /* Protect Inline Math from Line Breaks & Fraction Distortions */
      .katex {
        font-size: 1.08em;
        white-space: nowrap !important;
        line-height: 1.2;
        text-indent: 0;
      }
      
      .katex-display {
        white-space: normal !important;
        margin: 0.6em 0;
        overflow-x: auto;
        overflow-y: hidden;
      }
      
      .katex .base {
        white-space: nowrap !important;
      }

      .inst-section p, .inst-section li {
        word-spacing: normal !important;
        letter-spacing: normal !important;
        white-space: normal !important;
      }
    </style>
  `;

  // 8. Non-Blocking, Event-Driven KaTeX Auto-Render Engine
  const katexHeadScripts = `
    <!-- Offline KaTeX Assets & Fast Render Engine -->
    <link rel="stylesheet" href="${assetBase}libs/katex.min.css">
    <script src="${assetBase}libs/katex.min.js"></script>
    <script src="${assetBase}libs/auto-render.min.js"></script>

    ${fontCssInject}

    <script id="cbt-katex-auto-render">
    (function() {
      var isRendering = false;

      function safelyRenderMathInContainer(container) {
        if (!container || isRendering) return;
        if (typeof renderMathInElement !== 'function') return;

        isRendering = true;
        try {
          renderMathInElement(container, {
            delimiters: [
              {left: "$$", right: "$$", display: true},
              {left: "\\[", right: "\\]", display: true},
              {left: "\\(", right: "\\)", display: false},
              {left: "$", right: "$", display: false}
            ],
            throwOnError: false,
            ignoredClasses: ["no-math", "inst-section", "exam-title", "header-left"],
            ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"]
          });
        } catch (e) {
          console.warn("KaTeX render error:", e);
        } finally {
          setTimeout(function() { isRendering = false; }, 20);
        }
      }

      window.triggerMathRender = function(el) {
        var qArea = el || document.getElementById('q-render-area');
        if (qArea) {
          safelyRenderMathInContainer(qArea);
        }
        var repList = document.getElementById('question-report-list');
        if (repList) {
          safelyRenderMathInContainer(repList);
        }
      };

      function hookQuestionNavigation() {
        if (window.loadQuestion && !window._origLoadQuestion) {
          window._origLoadQuestion = window.loadQuestion;
          window.loadQuestion = function(idx) {
            var res = window._origLoadQuestion.apply(this, arguments);
            setTimeout(function() {
              window.triggerMathRender();
            }, 10);
            return res;
          };
        }

        document.addEventListener('click', function(e) {
          var target = e.target;
          if (target && (target.classList.contains('p-btn') || target.classList.contains('btn-nav') || target.closest('.p-btn') || target.closest('.btn-nav') || target.classList.contains('sec-btn') || target.closest('.sec-btn'))) {
            setTimeout(function() {
              window.triggerMathRender();
            }, 15);
          }
        }, true);
      }

      function initMath() {
        hookQuestionNavigation();
        window.triggerMathRender();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMath);
      } else {
        initMath();
      }
      window.addEventListener('load', initMath);
    })();
    </script>
  `;

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${katexHeadScripts}\n</head>`);
  } else {
    html = katexHeadScripts + html;
  }

  return html;
}
