/**
 * CBT HTML Corrector & KaTeX Math Rendering Engine
 * Transforms any imported or generated CBT test HTML instantly to guarantee:
 * 1. KaTeX path & font face correction using absolute origin URLs
 * 2. Ultra-precise LaTeX math rendering ($$, \[, $, \() for fractions, sub/superscripts, braces & limits
 * 3. Prevention of line breaks inside inline math via .katex { white-space: nowrap !important; }
 * 4. Zero-lag, single-pass math rendering via requestAnimationFrame & DOM dataset guards
 * 5. Preservation of plain text instructions and original formatting
 * 6. Replace legacy logo "PW" with "CBT"
 */

export interface CbtCorrectorOptions {
  useLatexFont?: boolean;
}

import katexCssText from 'katex/dist/katex.min.css?inline';

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

  // 6. Font Preference Setting
  const useLatexFont = options?.useLatexFont ?? true;
  const defaultBodyFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const latexBodyFont = "'KaTeX_Main', serif";
  const fontStr = useLatexFont ? latexBodyFont : defaultBodyFont;
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

      /* --- Question Body & Math Precision Styling --- */
      :root {
        --q-font: ${fontStr} !important;
        --q-font-family: ${fontStr} !important;
      }
      
      html, body, div, span, p, label, button, input, textarea, select, table, tr, td, th, .question-content, .q-text, .opt-text, .question-container, .option-item, .q-num-inline, .nat-container, .q-block-item, .nat-input {
        font-family: ${fontStr} !important;
        font-variant-numeric: lining-nums tabular-nums !important;
        font-feature-settings: "lnum" 1, "tnum" 1 !important;
      }

      /* Preserve Assertion-Reason & multiline question formatting */
      .q-text, .opt-text, .question-content p, .question-content div {
        white-space: pre-wrap !important;
        line-height: 1.6 !important;
      }

      /* Mandatory KaTeX Box-Sizing, Font & Layout Precision */
      .katex, .katex *, .katex *:before, .katex *:after {
        box-sizing: content-box !important;
      }

      .katex {
        font-family: 'KaTeX_Main', 'KaTeX_Math', 'KaTeX_AMS', serif !important;
        font-size: 1.08em;
        text-indent: 0;
        font-variant-numeric: lining-nums tabular-nums !important;
        font-feature-settings: "lnum" 1, "tnum" 1 !important;
      }

      /* Vector arrows & fraction line clarity */
      .katex .svg-align, .katex svg {
        vertical-align: top !important;
      }

      .katex .mfrac .frac-line {
        border-bottom-width: 1.2px !important;
      }

      .katex-display {
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

  // 8. Inlined Core KaTeX CSS with Absolute Font Paths (100% Offline Guaranteed)
  const processedKatexCss = katexCssText.replace(/url\(["']?fonts\/([^"')]+)["']?\)/g, `url("${assetBase}libs/fonts/$1")`);

  // 9. Blazing Fast, Single-Pass Math Render Engine with Zero-Network Parent Recovery
  const katexHeadScripts = `
    <!-- Inlined KaTeX Core CSS (Never requires network or service worker) -->
    <style id="cbt-katex-bundled-css">
      ${processedKatexCss}
    </style>

    <!-- Optional external link fallback -->
    <link rel="stylesheet" href="${assetBase}libs/katex.min.css">
    <script src="${assetBase}libs/katex.min.js"></script>
    <script src="${assetBase}libs/auto-render.min.js"></script>

    ${fontCssInject}

    <script id="cbt-katex-auto-render">
    (function() {
      // Direct offline bridge: inherit KaTeX & renderMathInElement from parent window if offline network request failed
      function ensureMathEngine() {
        if (typeof window.katex === 'undefined' && window.parent && window.parent.katex) {
          window.katex = window.parent.katex;
        }
        if (typeof window.renderMathInElement === 'undefined' && window.parent && window.parent.renderMathInElement) {
          window.renderMathInElement = window.parent.renderMathInElement;
        }
      }
      ensureMathEngine();

      var renderScheduled = false;

      function safelyRenderMathInContainer(container) {
        if (!container) return;
        ensureMathEngine();

        var renderFn = window.renderMathInElement || (window.parent && window.parent.renderMathInElement);
        if (typeof renderFn !== 'function') {
          if (!window._katexRetryCount) window._katexRetryCount = 0;
          if (window._katexRetryCount < 60) {
            window._katexRetryCount++;
            setTimeout(function() { safelyRenderMathInContainer(container); }, 75);
          }
          return;
        }
        if (container.dataset.mathRendered === 'true') return;

        try {
          renderFn(container, {
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
          container.dataset.mathRendered = 'true';
        } catch (e) {
          console.warn("KaTeX render error:", e);
        }
      }

      window.triggerMathRender = function(el, force) {
        var target = el || document.getElementById('q-render-area') || document.getElementById('question-container') || document.querySelector('.question-container') || document.getElementById('question-report-list') || document.body;
        if (!target) return;
        if (force) {
          delete target.dataset.mathRendered;
          var renderedKids = target.querySelectorAll('[data-math-rendered="true"]');
          for (var k = 0; k < renderedKids.length; k++) {
            delete renderedKids[k].dataset.mathRendered;
          }
        } else if (target.dataset.mathRendered === 'true') {
          return;
        }

        if (renderScheduled) return;
        renderScheduled = true;

        requestAnimationFrame(function() {
          renderScheduled = false;
          var currentTarget = el || document.getElementById('q-render-area') || document.getElementById('question-container') || document.querySelector('.question-container') || document.getElementById('question-report-list') || document.body;
          safelyRenderMathInContainer(currentTarget);
        });
      };

      function hookQuestionNavigation() {
        if (window.loadQuestion && !window._origLoadQuestion) {
          window._origLoadQuestion = window.loadQuestion;
          window.loadQuestion = function(idx) {
            var res = window._origLoadQuestion.apply(this, arguments);
            setTimeout(function() { window.triggerMathRender(null, true); }, 10);
            return res;
          };
        }
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

      // Periodic check to ensure late-initialized scripts or question renderers are hooked and rendered
      var checkAttempts = 0;
      var pollInterval = setInterval(function() {
        checkAttempts++;
        hookQuestionNavigation();
        if (window.loadQuestion) {
          window.triggerMathRender(null, false);
        }
        if (checkAttempts > 25) {
          clearInterval(pollInterval);
        }
      }, 200);
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
