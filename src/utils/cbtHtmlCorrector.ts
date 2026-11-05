/**
 * CBT HTML Corrector & Offline KaTeX Math Rendering Engine
 * Transforms any imported or generated CBT test HTML instantly to guarantee:
 * 1. Offline-safe KaTeX @font-face declarations with embedded Base64 data URIs & `font-display: swap` (zero FOIT / invisible text in sandboxed srcDoc iframes)
 * 2. Stripping of blocking @font-face rules from bundled katex.min.css that lack font-display: swap
 * 3. Ultra-precise LaTeX math rendering ($$, \[, $, \() for fractions, sub/superscripts, braces & limits
 * 4. Prevention of line breaks inside inline math via .katex { white-space: nowrap !important; }
 * 5. Zero-lag, single-pass math rendering via requestAnimationFrame & DOM dataset guards
 * 6. Preservation of plain text instructions and original formatting
 * 7. Replace legacy logo "PW" with "CBT"
 */

import katexCssText from 'katex/dist/katex.min.css?inline';
import { getOfflineKatexFontCss } from './katexFontBridge';

export interface CbtCorrectorOptions {
  useLatexFont?: boolean;
}

// Strip all @font-face rules from katex.min.css once at module load time!
// Why: katex.min.css contains 20 @font-face rules WITHOUT `font-display: swap` and with Vite-rewritten paths
// that fail inside sandboxed `about:srcdoc` iframes or offline mode, causing Flash of Invisible Text (FOIT)
// where all exam text using KaTeX_Main disappears. We replace them with our non-blocking `font-display: swap` rules.
const strippedKatexCoreCss = katexCssText.replace(/@font-face\s*\{[\s\S]*?\}/g, '');

export function prepareTestHtmlForViewer(rawHtml: string, options?: CbtCorrectorOptions): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  const origin = window.location.origin;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const assetBase = origin + (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');

  let html = rawHtml;

  // 1. Inject <base> tag at top of <head> so all relative resources in srcDoc resolve to origin
  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n    <base href="${assetBase}">`);
  } else {
    html = `<head><base href="${assetBase}"></head>` + html;
  }

  // 2. Logo Replacement: PW -> CBT
  html = html.replace(/<div class="logo-circle">\s*PW\s*<\/div>/gi, '<div class="logo-circle">CBT</div>');

  // 3. Clean any remote CDN links/scripts (jsdelivr, cloudflare, unpkg, googleapis, gstatic) and local duplicate katex.min.css links to guarantee 0ms offline execution
  html = html.replace(
    /<link[^>]*href=["'](?:https?:\/\/[^"']*(?:cdnjs\.cloudflare|cdn\.jsdelivr|unpkg\.com|fonts\.googleapis|fonts\.gstatic)[^"']*|(?:https?:\/\/[^"']*|\.?\/)?libs\/katex\.min\.css)["'][^>]*>/gi,
    ''
  );
  html = html.replace(
    /<script[^>]*src=["']https?:\/\/[^"']*(?:cdnjs\.cloudflare|cdn\.jsdelivr|unpkg\.com)[^"']*["'][^>]*>\s*<\/script>/gi,
    ''
  );

  // 4. Rewrite relative asset paths (./libs/ -> ${assetBase}libs/, ./fonts/ -> ${assetBase}fonts/)
  html = html.replace(/(href|src)=["'](?:\.\/)?libs\//gi, `$1="${assetBase}libs/`);
  html = html.replace(/(href|src)=["'](?:\.\/)?fonts\//gi, `$1="${assetBase}fonts/`);
  html = html.replace(/url\(["']?(?:\.\/)?libs\//gi, `url("${assetBase}libs/`);
  html = html.replace(/url\(["']?(?:\.\/)?fonts\//gi, `url("${assetBase}fonts/`);

  // 5. Force window.mathRenderEngine = 'katex_local'
  html = html.replace(/window\.mathRenderEngine\s*=\s*['"][^'"]*['"]/g, "window.mathRenderEngine = 'katex_local'");

  // 6. Font Preference Setting (Immediate fallback stack prevents FOIT whether useLatexFont is true or false)
  const useLatexFont = options?.useLatexFont ?? true;
  const defaultBodyFont =
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const latexBodyFont = "'KaTeX_Main', Georgia, 'Times New Roman', Times, serif";
  const fontStr = useLatexFont ? latexBodyFont : defaultBodyFont;
  html = html.replace(
    /(?:const|let|var)\s+Q_FONT_FAMILY\s*=\s*["'][^"']*["'];/g,
    `const Q_FONT_FAMILY = "${fontStr}";`
  );

  // 7. Inject Offline Base64 + Absolute @font-face Definitions with `font-display: swap` & Critical KaTeX Styling
  const offlineFontFaces = getOfflineKatexFontCss(assetBase);

  const fontCssInject = `
    <style id="cbt-katex-font-engine">
      /* --- Offline-Ready KaTeX Font Faces (font-display: swap guarantees 0ms instant text visibility) --- */
      ${offlineFontFaces}

      /* --- Question Body & Math Precision Styling --- */
      :root {
        --q-font: ${fontStr} !important;
        --q-font-family: ${fontStr} !important;
      }

      html, body, div, span, p, li, ul, ol, h1, h2, h3, h4, label, button, input, textarea, select, table, tr, td, th,
      .question-content, .q-text, .opt-text, .question-container, .option-item, .q-num-inline, .nat-container, .q-block-item, .nat-input, .inst-container, .inst-section {
        font-family: ${fontStr} !important;
        font-variant-numeric: lining-nums tabular-nums !important;
        font-feature-settings: "lnum" 1, "tnum" 1 !important;
        visibility: visible !important;
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
        font-family: 'KaTeX_Main', 'KaTeX_Math', 'KaTeX_AMS', Georgia, 'Times New Roman', serif !important;
        font-size: 1.06em;
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

  // 8. Blazing Fast, Zero-Blocking Math Render Engine with Instant Parent Window Inheritance
  const katexHeadScripts = `
    <!-- Inlined KaTeX Core CSS without blocking @font-face rules -->
    <style id="cbt-katex-bundled-css">
      ${strippedKatexCoreCss}
    </style>

    ${fontCssInject}

    <script id="cbt-katex-auto-render">
    (function() {
      // Direct 0ms offline bridge: inherit KaTeX & renderMathInElement from parent window synchronously
      function ensureMathEngine() {
        try {
          if (typeof window.katex === 'undefined' && window.parent && window.parent.katex) {
            window.katex = window.parent.katex;
          }
          if (typeof window.renderMathInElement === 'undefined' && window.parent && window.parent.renderMathInElement) {
            window.renderMathInElement = window.parent.renderMathInElement;
          }
        } catch (_) {}
      }
      ensureMathEngine();

      // Only load local script files asynchronously if opened standalone outside parent app
      if (typeof window.katex === 'undefined') {
        var s1 = document.createElement('script');
        s1.src = "${assetBase}libs/katex.min.js";
        s1.async = true;
        document.head.appendChild(s1);
        var s2 = document.createElement('script');
        s2.src = "${assetBase}libs/auto-render.min.js";
        s2.async = true;
        document.head.appendChild(s2);
      }

      var renderScheduled = false;

      function safelyRenderMathInContainer(container) {
        if (!container) return;
        ensureMathEngine();

        var renderFn = window.renderMathInElement || (window.parent && window.parent.renderMathInElement);
        if (typeof renderFn !== 'function') {
          if (!window._katexRetryCount) window._katexRetryCount = 0;
          if (window._katexRetryCount < 40) {
            window._katexRetryCount++;
            setTimeout(function() { safelyRenderMathInContainer(container); }, 60);
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
            setTimeout(function() { window.triggerMathRender(null, true); }, 5);
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
