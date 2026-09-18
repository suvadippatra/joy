import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCBTData } from '../hooks/useCBTData';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../components/ThemeProvider';
import localforage from 'localforage';
import { useReports } from '../hooks/useReports';
import { AlertTriangle, FileCode, Sparkles, CheckCircle, BarChart2 } from 'lucide-react';
import { staticCbtTests } from '../data/cbtData';

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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isExamSaved, setIsExamSaved] = useState(false);
  const hasSavedReportRef = useRef<boolean>(false);

  // Original vs Enhanced Mode State (Defaults to true for 100% native stability)
  const [useOriginalFile, setUseOriginalFile] = useState<boolean>(() => {
    const saved = localStorage.getItem('cbt_use_original_file');
    return saved === null ? true : saved === 'true';
  });

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

        // 1. Check memory cache first (instant 0ms)
        if (htmlMemoryCache.has(test.id)) {
          html = htmlMemoryCache.get(test.id)!;
        } else if (test.isLocal) {
          // 2. Fetch imported test directly from localforage
          const cachedHtml = await localforage.getItem(test.id + '_html');
          html = (cachedHtml as string) || '';
          if (!html) {
            console.error('Local test HTML not found in storage for id:', test.id);
          }
        } else {
          // 3. Fetch static demo file from bundle
          const basePath = import.meta.env.BASE_URL;
          const normalizedPath = test.filename?.startsWith('/') ? test.filename.slice(1) : (test.filename || '');
          const res = await fetch(basePath + normalizedPath);
          if (!res.ok) {
            throw new Error(`Failed to fetch test file: ${res.statusText}`);
          }
          html = await res.text();
        }

        if (html) {
          htmlMemoryCache.set(test.id, html);
        }

        // Mode A: Original File Mode (clean, un-tampered raw execution)
        if (useOriginalFile) {
          const rawBlob = new Blob([html], { type: 'text/html' });
          setIframeSrc(URL.createObjectURL(rawBlob));
          return;
        }
        
        // Mode B: Enhanced Mode (local offline math & typography fonts)
        const settings = JSON.parse(localStorage.getItem('cbtSettings') || '{}');
        const assetBase = window.location.origin + (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/');

        // Clean up remote CDN links and point to local offline assets safely
        html = html.replace(/<link[^>]*href=["'][^"']*(?:katex|cdn\.jsdelivr|cdnjs\.cloudflare)[^"']*["'][^>]*>/gi, '');
        html = html.replace(/<script[^>]*src=["'][^"']*(?:katex|auto-render|cdn\.jsdelivr|cdnjs\.cloudflare)[^"']*["'][^>]*>\s*<\/script>/gi, '');

        if (settings.useLatexFont) {
          html = html.replace(/(?:const|let|var)\s+Q_FONT_FAMILY\s*=\s*["'][^"']*["'];/g, 'const Q_FONT_FAMILY = "\'KaTeX_Main\', \'Tiro Bangla\', \'DM Serif Text\', serif";');
        }

        const injectedHead = `
          <!-- Local KaTeX Math & Fonts Engine -->
          <link rel="stylesheet" href="${assetBase}libs/katex.min.css">
          <script src="${assetBase}libs/katex.min.js"></script>
          <script src="${assetBase}libs/auto-render.min.js"></script>
          <style>
            @font-face {
              font-family: 'KaTeX_Main';
              src: url('${assetBase}libs/fonts/KaTeX_Main-Regular.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'KaTeX_Main';
              src: url('${assetBase}libs/fonts/KaTeX_Main-Bold.woff2') format('woff2');
              font-weight: bold;
              font-style: normal;
            }
            @font-face {
              font-family: 'KaTeX_Math';
              src: url('${assetBase}libs/fonts/KaTeX_Math-Italic.woff2') format('woff2');
              font-weight: normal;
              font-style: italic;
            }
            @font-face {
              font-family: 'DM Serif Text';
              src: url('${assetBase}fonts/DMSerifText.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'Tiro Bangla';
              src: url('${assetBase}fonts/TiroBangla.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
            math, mrow, mfrac, mi, mo, mn, msub, msup, msubsup {
              font-family: 'KaTeX_Math', 'KaTeX_Main', serif;
            }
          </style>
        `;

        html = html.replace('</head>', injectedHead + '</head>');
        
        const blob = new Blob([html], { type: 'text/html' });
        setIframeSrc(URL.createObjectURL(blob));
      } catch (error) {
        console.error("Failed to load test HTML", error);
      }
    };

    loadTestContent();
  }, [test, useOriginalFile]);

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
              type="button"
              onClick={() => {
                const nextVal = !useOriginalFile;
                setUseOriginalFile(nextVal);
                localStorage.setItem('cbt_use_original_file', String(nextVal));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
                useOriginalFile
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20'
              }`}
              title={useOriginalFile ? 'Currently using 100% Original Untouched HTML.' : 'Using Enhanced Offline Math & Fonts Mode.'}
            >
              {useOriginalFile ? <Sparkles size={14} /> : <FileCode size={14} />}
              <span>{useOriginalFile ? 'Original Active' : 'Use Original File'}</span>
            </button>

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
          {iframeSrc ? (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="absolute inset-0 w-full h-full border-0 bg-transparent"
              title={test.title}
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
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
