import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCBTData } from '../hooks/useCBTData';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../components/ThemeProvider';
import localforage from 'localforage';
import { useReports } from '../hooks/useReports';
import { AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { staticCbtTests } from '../data/cbtData';
import { prepareTestHtmlForViewer } from '../utils/cbtHtmlCorrector';

// In-memory cache for test HTMLs to provide instantaneous 0ms page loads
const htmlMemoryCache = new Map<string, string>();

export default function CBTViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tests, loading } = useCBTData();
  const { addReport } = useReports();
  const initialTest = staticCbtTests.find(t => t.id === id);
  const test = tests.find(t => t.id === id) || initialTest;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isExamSaved, setIsExamSaved] = useState(false);
  const hasSavedReportRef = useRef<boolean>(false);

  // Warn user if attempting to leave or reload while test is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSavedReportRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Save report helper with duplicate protection
  const recordReport = useCallback((data: {
    score: number | string;
    correct: number | string;
    wrong: number | string;
    accuracy: number | string;
    attempt: number | string;
    time: string;
  }) => {
    if (!test || hasSavedReportRef.current) return;
    
    const parsedScore = typeof data.score === 'number' ? data.score : (parseFloat(String(data.score)) || 0);
    const parsedCorrect = typeof data.correct === 'number' ? data.correct : (parseInt(String(data.correct), 10) || 0);
    const parsedWrong = typeof data.wrong === 'number' ? data.wrong : (parseInt(String(data.wrong), 10) || 0);
    const parsedAttempt = typeof data.attempt === 'number' ? data.attempt : (parseInt(String(data.attempt), 10) || 0);
    const accuracyStr = String(data.accuracy || '').replace('%', '').trim();
    const parsedAccuracy = parseFloat(accuracyStr) || (parsedAttempt > 0 ? Math.round((parsedCorrect / parsedAttempt) * 100) : 0);

    hasSavedReportRef.current = true;
    setIsExamSaved(true);

    addReport({
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      score: parsedScore,
      correct: parsedCorrect,
      wrong: parsedWrong,
      accuracy: parsedAccuracy,
      attempt: parsedAttempt,
      time: String(data.time || '0s')
    });
  }, [test, addReport]);

  // Load test HTML content (with instant cache & local storage support)
  useEffect(() => {
    if (!test) return;

    // Reset saved state on test load
    hasSavedReportRef.current = false;
    setIsExamSaved(false);

    try {
      const recent = JSON.parse(localStorage.getItem('recentTests') || '[]');
      const updated = [test.id, ...recent.filter((id: string) => id !== test.id)].slice(0, 10);
      localStorage.setItem('recentTests', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update recent tests", e);
    }

    const loadTestContent = async () => {
      try {
        let html = '';

        // 1. Check memory cache first
        if (htmlMemoryCache.has(test.id)) {
          html = htmlMemoryCache.get(test.id)!;
        }

        // 2. Try fetching imported/local test directly from localforage storage
        if (!html) {
          const cachedHtml = (await localforage.getItem(test.id + '_html')) || (await localforage.getItem(test.id));
          if (cachedHtml && typeof cachedHtml === 'string' && cachedHtml.trim()) {
            html = cachedHtml;
          }
        }

        // 3. Fallback to static bundled demo files if not in localforage
        if (!html && test.filename) {
          try {
            const basePath = import.meta.env.BASE_URL;
            const normalizedPath = test.filename.startsWith('/') ? test.filename.slice(1) : test.filename;
            const res = await fetch(basePath + normalizedPath);
            if (res.ok) {
              html = await res.text();
            }
          } catch (e) {
            console.warn("Could not fetch static test file:", e);
          }
        }

        // 4. Handle blank or missing HTML gracefully with an informative status view
        if (!html || !html.trim()) {
          html = `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Test Content Not Found</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; padding: 24px; }
              .card { background: white; padding: 36px 28px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); max-width: 440px; width: 100%; border: 1px solid #e2e8f0; }
              .icon { font-size: 40px; margin-bottom: 12px; }
              h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
              p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; }
              button { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.15s ease; }
              button:hover { background: #1d4ed8; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">📄</div>
              <h2>Test File Content Unavailable</h2>
              <p>The stored HTML content for "<strong>${test.title || 'Selected Test'}</strong>" could not be retrieved from local storage or network.</p>
              <button onclick="window.parent.location.hash='#/'">Return to Dashboard</button>
            </div>
          </body>
          </html>`;
        } else {
          htmlMemoryCache.set(test.id, html);
        }

        const settings = JSON.parse(localStorage.getItem('cbtSettings') || '{}');
        const useLatexFont = settings.useLatexFont ?? true;

        // Process HTML using instant corrector engine
        const processedHtml = prepareTestHtmlForViewer(html, {
          useLatexFont: useLatexFont
        });
        
        setIframeSrcDoc(processedHtml);
        const blob = new Blob([processedHtml], { type: 'text/html' });
        setIframeSrc(URL.createObjectURL(blob));
      } catch (error) {
        console.error("Failed to load test HTML", error);
      }
    };

    loadTestContent();
  }, [test]);

  // Revoke Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (iframeSrc && iframeSrc.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(iframeSrc), 1000);
      }
    };
  }, [iframeSrc]);

  // Listen to postMessage from the test iframe (both EXAM_SUBMITTED and CBT_SUBMIT)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      const type = event.data.type;
      if (type === 'EXAM_SUBMITTED' || type === 'CBT_SUBMIT' || type === 'ON_EXAM_SUBMIT') {
        const payload = event.data.payload || event.data.detail || {};
        recordReport({
          score: payload.score ?? 0,
          correct: payload.correct ?? 0,
          wrong: payload.wrong ?? 0,
          accuracy: payload.accuracy ?? '0%',
          attempt: payload.attempted ?? payload.attempt ?? 0,
          time: payload.avgTimeSeconds ? `${payload.avgTimeSeconds}s` : (payload.time || '0s')
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [recordReport]);

  // Proactive DOM Auto-Catch: Same-origin inspection for Result Gateway
  useEffect(() => {
    if (!iframeSrc) return;

    const interval = setInterval(() => {
      if (hasSavedReportRef.current) return;
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return;

        const gateway = doc.getElementById('result-gateway');
        const scoreElem = doc.getElementById('gt-score');
        
        const isGatewayVisible = gateway && 
          (!gateway.classList.contains('hidden') || gateway.style.display === 'flex' || gateway.style.display === 'block');

        if (isGatewayVisible && scoreElem && scoreElem.innerText.trim() !== '') {
          const score = scoreElem.innerText.trim();
          const correct = doc.getElementById('gt-correct')?.innerText.trim() || '0';
          const wrong = doc.getElementById('gt-wrong')?.innerText.trim() || '0';
          const accuracy = doc.getElementById('gt-accuracy')?.innerText.trim() || '0%';
          const attempt = doc.getElementById('gt-attempt')?.innerText.trim() || '0';
          const time = doc.getElementById('gt-time')?.innerText.trim() || '0s';

          recordReport({ score, correct, wrong, accuracy, attempt, time });
        }
      } catch (err) {
        // Cross-origin fallback (handled by postMessage)
      }
    }, 800);

    return () => clearInterval(interval);
  }, [iframeSrc, recordReport]);

  const handleLeaveExam = () => {
    setShowExitConfirm(false);
    if (test?.subject) {
      navigate(`/subject/${encodeURIComponent(test.subject)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const triggerManualSave = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const score = doc.getElementById('gt-score')?.innerText.trim() || '0';
        const correct = doc.getElementById('gt-correct')?.innerText.trim() || '0';
        const wrong = doc.getElementById('gt-wrong')?.innerText.trim() || '0';
        const accuracy = doc.getElementById('gt-accuracy')?.innerText.trim() || '0%';
        const attempt = doc.getElementById('gt-attempt')?.innerText.trim() || '0';
        const time = doc.getElementById('gt-time')?.innerText.trim() || '0s';

        recordReport({ score, correct, wrong, accuracy, attempt, time });
      }
    } catch {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'FORCE_CAPTURE' }, '*');
      }
    }
  };

  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const cw = iframe.contentWindow as any;
      const cd = iframe.contentDocument;
      if (!cw) return;

      // 1. Recover KaTeX & renderMathInElement directly from parent window's in-memory bundle
      if (!cw.katex && (window as any).katex) {
        cw.katex = (window as any).katex;
      }
      if (!cw.renderMathInElement && (window as any).renderMathInElement) {
        cw.renderMathInElement = (window as any).renderMathInElement;
      }

      // 2. Share all loaded fonts from parent React app into iframe document (zero network needed!)
      if (document.fonts && cd && cd.fonts) {
        document.fonts.forEach((font) => {
          try {
            cd.fonts.add(font);
          } catch (_) {}
        });
      }

      // 3. Trigger immediate math render
      if (typeof cw.triggerMathRender === 'function') {
        cw.triggerMathRender(null, true);
      } else if (typeof cw.renderMathInElement === 'function' && cd) {
        cw.renderMathInElement(cd.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    } catch (err) {
      console.warn('Iframe KaTeX bridge error:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-transparent flex flex-col font-sans transition-colors">
        <Header title="Loading Test..." showBack onBack={handleLeaveExam} />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col font-sans transition-colors">
        <Header title="Test Not Found" showBack onBack={() => navigate('/', { replace: true })} />
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
        onBack={() => {
          if (isExamSaved) {
            handleLeaveExam();
          } else {
            setShowExitConfirm(true);
          }
        }}
        actions={
          <div className="flex items-center gap-2">
            {isExamSaved && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs sm:text-sm font-semibold border border-emerald-500/20">
                <CheckCircle size={15} className="text-emerald-500" />
                <span>Result Saved</span>
                <Link to="/reports" className="ml-1 underline hover:text-emerald-700 dark:hover:text-emerald-300">
                  Reports
                </Link>
              </div>
            )}

            <button 
              onClick={triggerManualSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold transition-colors border border-emerald-500/20"
              title="Manually save or verify result capture into your Reports"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline">Save Result</span>
            </button>
          </div>
        }
      />
      
      <main className="flex-1 relative w-full h-full bg-transparent flex">
        <div className="flex-1 relative h-full">
          {iframeSrcDoc || iframeSrc ? (
            <iframe
              ref={iframeRef}
              srcDoc={iframeSrcDoc || undefined}
              src={!iframeSrcDoc ? iframeSrc : undefined}
              className="absolute inset-0 w-full h-full border-0 bg-transparent"
              title={test.title}
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
               <p className="text-slate-500 dark:text-slate-400 text-lg">Loading viewer...</p>
            </div>
          )}
        </div>
      </main>

      {/* Exit Exam Warning Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-start gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle size={24} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Leave Exam?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You are currently in an active examination session.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs sm:text-sm text-rose-800 dark:text-rose-300 leading-relaxed mb-5">
              <strong>Warning:</strong> If you leave the exam without submitting, your current answers will not be recorded in your performance history.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={handleLeaveExam}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
