import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useCBTData } from '../hooks/useCBTData';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import localforage from 'localforage';
import { useReports } from '../hooks/useReports';

export default function CBTViewer() {
  const { id } = useParams<{ id: string }>();
  const { tests, loading } = useCBTData();
  const { addReport } = useReports();
  const test = tests.find(t => t.id === id);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();
  const [iframeSrc, setIframeSrc] = useState<string>('');

  // Add to recent tests
  useEffect(() => {
    if (test) {
      try {
        const stored = localStorage.getItem('recentTests');
        const recent = stored ? JSON.parse(stored) : [];
        if (Array.isArray(recent)) {
          const updated = [test.id, ...recent.filter((recentId: string) => recentId !== test.id)].slice(0, 3);
          localStorage.setItem('recentTests', JSON.stringify(updated));
        }
      } catch (e) {
        console.error("Failed to update recent tests", e);
        localStorage.setItem('recentTests', JSON.stringify([test.id]));
      }
      
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
            <link rel="stylesheet" href="${import.meta.env.BASE_URL}libs/katex.min.css">
            <script src="${import.meta.env.BASE_URL}libs/katex.min.js"></script>
            <script src="${import.meta.env.BASE_URL}libs/auto-render.min.js"></script>
            <style>
              @font-face {
                  font-family: 'DM Serif Text';
                  src: url('${import.meta.env.BASE_URL}fonts/DMSerifText.woff2') format('woff2');
              }
              @font-face {
                  font-family: 'Tiro Bangla';
                  src: url('${import.meta.env.BASE_URL}fonts/TiroBangla.woff2') format('woff2');
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
          
          let injectedBodyScript = `
                              <script>
            (function() {
              let reportSent = false;
              const checkResults = (force = false) => {
                 if (reportSent) return;
                 
                 const pageText = document.body.innerText || '';
                 const pageTextLower = pageText.toLowerCase();
                 const gateway = document.getElementById('result-gateway') || 
                                 document.querySelector('.result-panel, .score-card, #score-card, #result, .result, #score, .score');
                                 
                 // Broaden result page detection
                 const isResultPage = force || 
                                      (gateway && !gateway.classList.contains('hidden')) || 
                                      pageTextLower.includes('total score') || 
                                      pageTextLower.includes('test summary') ||
                                      pageTextLower.includes('test result');
                                      
                 if (isResultPage) {
                     reportSent = true;
                     
                     // 1. Try standard NTA clone IDs first
                     let score = document.getElementById('gt-score')?.innerText || document.getElementById('score')?.innerText || document.getElementById('lblScore')?.innerText;
                     let correct = document.getElementById('gt-correct')?.innerText || document.getElementById('correct-ans')?.innerText || document.getElementById('correct')?.innerText || document.getElementById('lblCorrect')?.innerText;
                     let wrong = document.getElementById('gt-wrong')?.innerText || document.getElementById('incorrect-ans')?.innerText || document.getElementById('wrong')?.innerText || document.getElementById('lblWrong')?.innerText;
                     let attempt = document.getElementById('gt-attempt')?.innerText || document.getElementById('attempted-ques')?.innerText || document.getElementById('attempted')?.innerText || document.getElementById('lblAttempted')?.innerText;
                     let time = document.getElementById('gt-time')?.innerText || document.getElementById('time-taken')?.innerText;
                     let accuracy = document.getElementById('gt-accuracy')?.innerText || document.getElementById('accuracy')?.innerText || document.getElementById('lblAccuracy')?.innerText;
                     
                     // 2. Fallback to Regex parsing if IDs are missing
                     function extractNumberNear(keyword) {
                         const regex = new RegExp(keyword + '\\s*[:\\-=\\n]*\\s*([\\d\\.]+)', 'i');
                         const match = pageText.match(regex);
                         return match ? match[1] : null;
                     }
                     
                     if (!score) score = extractNumberNear('(?:Score|Marks|Total Score|Marks Obtained|Total Marks)');
                     if (!correct) correct = extractNumberNear('(?:Correct|Correct Answers?|Right)');
                     if (!wrong) wrong = extractNumberNear('(?:Wrong|Incorrect|Incorrect Answers?)');
                     if (!attempt) attempt = extractNumberNear('(?:Attempted|Attempted Questions?|Answered)');
                     if (!time) {
                         const m = pageText.match(/(?:Time|Time Taken)\s*[:\-]?\s*([\d\w\s:]+)/i);
                         time = m ? m[1].trim() : '0s';
                     }
                     
                     // Calculate accuracy if missing
                     if (!accuracy) {
                         const m = pageText.match(/Accuracy\s*[:\-]?\s*(\d+\.?\d*)/i);
                         if (m) {
                             accuracy = m[1] + '%';
                         } else {
                             const c = parseInt(correct || '0');
                             const a = parseInt(attempt || '0');
                             accuracy = (a > 0) ? ((c / a) * 100).toFixed(1) + '%' : '0%';
                         }
                     }
                     
                     window.parent.postMessage({
                         type: 'CBT_SUBMIT',
                         payload: { testId: '${test.id}', score: score || '0', correct: correct || '0', wrong: wrong || '0', accuracy: accuracy || '0%', attempt: attempt || '0', time }
                     }, '*');
                 }
              };
              
              window.addEventListener('message', (event) => {
                  if (event.data?.type === 'FORCE_CAPTURE') {
                      reportSent = false;
                      checkResults(true);
                  }
              });
              
              const observer = new MutationObserver(() => checkResults(false));
              window.addEventListener('DOMContentLoaded', () => {
                  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
                  setInterval(() => checkResults(false), 1000);
              });
            })();
          </script>
          `;
          
          html = html.replace('</head>', injectedHead + '</head>');
          if (html.includes('</body>')) {
             html = html.replace('</body>', injectedBodyScript + '</body>');
          } else {
             html += injectedBodyScript;
          }
          
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
        const basePath = import.meta.env.BASE_URL;
        const normalizedPath = test.filename?.startsWith('/') ? test.filename.slice(1) : (test.filename || '');
        fetchAndInject(basePath + normalizedPath, false);
      }
    }
  }, [test]);

  useEffect(() => {
    return () => {
      if (iframeSrc && iframeSrc.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(iframeSrc), 1000);
      }
    };
  }, [iframeSrc]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CBT_SUBMIT' && test) {
        const payload = event.data.payload;
        addReport({
          testId: test.id,
          testTitle: test.title,
          subject: test.subject,
          score: parseFloat(payload.score) || 0,
          correct: parseInt(payload.correct, 10) || 0,
          wrong: parseInt(payload.wrong, 10) || 0,
          accuracy: parseFloat(payload.accuracy?.replace('%', '')) || 0,
          attempt: parseInt(payload.attempt, 10) || 0,
          time: payload.time || '0s'
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [test, addReport]);

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
        actions={
          <button 
            onClick={() => {
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'FORCE_CAPTURE' }, '*');
                alert('Capture signal sent! If results are on screen, they will be saved to your Reports.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold transition-colors border border-emerald-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Save Result
          </button>
        }
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
