import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';
import 'katex/dist/katex.min.css';
import './index.css';

// Expose KaTeX & auto-render globally so that any offline iframes or tests can access them directly from RAM
(window as any).katex = katex;
(window as any).renderMathInElement = renderMathInElement;

// Register Service Worker safely for 100% offline KaTeX font and test asset caching
try {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {
    // Ignore SW registration errors in sandboxed iframes
  });
} catch (e) {
  // Safe fallback
}

// Clean up any malformed GitHub Pages 404 redirect paths without breaking HashRouter
try {
  const path = window.location.pathname;
  const match = path.match(/(\/subject\/.*|\/test\/.*|\/reports|\/recent|\/settings|\/doc-studio|\/maker)$/);
  if (match) {
    const base = path.slice(0, path.length - match[1].length);
    if (base !== path) {
      window.history.replaceState(null, '', base + window.location.search + window.location.hash);
    }
  }

  // Ensure initial cold launch opens the main dashboard (#/) instead of a stale subject route like #/subject/Botany
  if (!sessionStorage.getItem('cbt_session_booted')) {
    sessionStorage.setItem('cbt_session_booted', '1');
    if (window.location.hash.startsWith('#/subject/')) {
      window.location.hash = '#/';
    }
  }
} catch (e) {
  // Ignore URL rewrite errors
}

// Pre-warm offline KaTeX font data URIs so HTML exam iframes render math & text in 0ms
import('./utils/katexFontBridge').then(({ warmUpKatexFontCache }) => {
  warmUpKatexFontCache().catch(() => {});
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
