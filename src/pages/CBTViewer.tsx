import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useCBTData } from '../hooks/useCBTData';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import localforage from 'localforage';

export default function CBTViewer() {
  const { id } = useParams<{ id: string }>();
  const { tests, loading } = useCBTData();
  const test = tests.find(t => t.id === id);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();
  const [iframeSrc, setIframeSrc] = useState<string>('');

  // Add to recent tests
  useEffect(() => {
    if (test) {
      const recent = JSON.parse(localStorage.getItem('recentTests') || '[]');
      const updated = [test.id, ...recent.filter((recentId: string) => recentId !== test.id)].slice(0, 3);
      localStorage.setItem('recentTests', JSON.stringify(updated));
      
      const fetchAndInject = async (urlOrHtml: string, isLocal: boolean) => {
        let html = '';
        try {
          if (isLocal) {
            html = (await localforage.getItem(test.id + '_html')) as string;
          } else {
            const res = await fetch(urlOrHtml);
            html = await res.text();
          }
          
          const settings = JSON.parse(localStorage.getItem('cbtSettings') || '{}');
          
          let injectedHead = `
            <!-- Injected Local Math & Fonts -->
            <link rel="stylesheet" href="/libs/katex.min.css">
            <script src="/libs/katex.min.js"></script>
            <script src="/libs/auto-render.min.js"></script>
            <style>
              @font-face {
                  font-family: 'DM Serif Text';
                  src: url('/fonts/DMSerifText.woff2') format('woff2');
              }
              @font-face {
                  font-family: 'Tiro Bangla';
                  src: url('/fonts/TiroBangla.woff2') format('woff2');
              }
          `;

          if (settings.useLatexFont) {
            injectedHead += `
              :root {
                --q-font: 'Tiro Bangla', 'DM Serif Text', serif !important;
              }
              body, .q-text, .q-opt, .q-ans {
                font-family: 'Tiro Bangla', 'DM Serif Text', serif !important;
              }
            `;
          }

          if (settings.keyboardPlacement === 'bottom') {
            injectedHead += `
              #virtual-keyboard, .keyboard-container, .virtual-keyboard {
                 position: fixed !important;
                 bottom: 0 !important;
                 left: 0 !important;
                 right: 0 !important;
                 width: 100% !important;
                 transform: none !important;
                 top: auto !important;
                 margin: 0 !important;
              }
            `;
          }
          
          injectedHead += `</style>`;
          
          html = html.replace('</head>', injectedHead + '</head>');
          
          const blob = new Blob([html], { type: 'text/html' });
          setIframeSrc(URL.createObjectURL(blob));
        } catch (error) {
          console.error("Failed to load or inject test HTML", error);
          setIframeSrc(urlOrHtml); // fallback
        }
      };

      if (test.isLocal) {
        fetchAndInject('', true);
      } else {
        fetchAndInject(test.filename || '', false);
      }
    }
  }, [test]);

  useEffect(() => {
    return () => {
      if (iframeSrc && iframeSrc.startsWith('blob:')) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col font-sans transition-colors">
        <Header title="Loading Test..." showBack />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col font-sans transition-colors">
        <Header title="Test Not Found" showBack />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">The requested test could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent flex flex-col font-sans transition-colors overflow-hidden">
      <Header 
        title={test.title} 
        showBack 
        hideControls 
      />
      
      <main className="flex-1 relative w-full h-full bg-transparent">
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="absolute inset-0 w-full h-full border-0 bg-transparent"
            title={test.title}
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <p className="text-slate-500 dark:text-slate-400 text-lg">Loading viewer...</p>
          </div>
        )}
      </main>
    </div>
  );
}
