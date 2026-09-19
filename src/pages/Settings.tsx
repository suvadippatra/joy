import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Settings as SettingsIcon, Type, HardDrive, Trash2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import localforage from 'localforage';

export default function Settings() {
  const [settings, setSettings] = useState({
    useLatexFont: false
  });
  
  const [memoryUsage, setMemoryUsage] = useState<string>('Calculating...');
  const [percentUsed, setPercentUsed] = useState<number>(0);
  const [cachedTestCount, setCachedTestCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);

  const refreshStorageMetrics = async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const quotaMb = ((estimate.quota || 0) / 1024 / 1024).toFixed(2);
        const usageMb = ((estimate.usage || 0) / 1024 / 1024).toFixed(2);
        const pct = estimate.quota ? Math.min(100, Math.round(((estimate.usage || 0) / estimate.quota) * 100)) : 0;
        setMemoryUsage(`${usageMb} MB used of ${quotaMb} MB limit`);
        setPercentUsed(pct);
      } else {
        setMemoryUsage('Storage API available');
      }

      // Count localforage keys
      const keys = await localforage.keys();
      const testKeys = keys.filter(k => k.endsWith('_html'));
      setCachedTestCount(testKeys.length);

      const reports: any[] = (await localforage.getItem('cbt_reports')) || [];
      setReportCount(reports.length);
    } catch {
      setMemoryUsage('Unable to calculate storage');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('cbtSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      const initial = { useLatexFont: true };
      setSettings(initial);
      localStorage.setItem('cbtSettings', JSON.stringify(initial));
    }
    refreshStorageMetrics();
  }, []);

  const updateSetting = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('cbtSettings', JSON.stringify(updated));
  };

  const handleClearCachedTests = async () => {
    setIsCleaning(true);
    setCleanFeedback(null);
    try {
      const keys = await localforage.keys();
      const testKeys = keys.filter(k => k.endsWith('_html'));
      for (const k of testKeys) {
        await localforage.removeItem(k);
      }
      await refreshStorageMetrics();
      setCleanFeedback(`Successfully removed ${testKeys.length} cached test files from local memory.`);
    } catch {
      setCleanFeedback('Failed to clean cached tests.');
    } finally {
      setIsCleaning(false);
      setTimeout(() => setCleanFeedback(null), 4000);
    }
  };

  const handleClearAllStorage = async () => {
    if (!window.confirm("Are you sure you want to perform a full memory cleanup? This will remove all offline cached tests, test reports, and reset preferences.")) {
      return;
    }
    setIsCleaning(true);
    setCleanFeedback(null);
    try {
      await localforage.clear();
      localStorage.removeItem('recent_tests');
      localStorage.removeItem('cbtSettings');
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      await refreshStorageMetrics();
      setCleanFeedback('All local application cache and IndexedDB memory cleared successfully.');
    } catch {
      setCleanFeedback('Failed to perform full memory wipe.');
    } finally {
      setIsCleaning(false);
      setTimeout(() => setCleanFeedback(null), 4000);
    }
  };

  return (
    <div className="flex-1 bg-transparent transition-colors">
      <Header title="Settings" showBack />
      
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-indigo-500" />
              Test Engine Tuning
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize how Computer Based Tests are rendered and interacted with.
            </p>
          </div>
          
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Storage & Memory Cleanup Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0 h-min">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">Local Memory & Storage</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {memoryUsage}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {cachedTestCount} cached tests
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {reportCount} exam reports
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshStorageMetrics}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Recalculate Storage"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, percentUsed)}%` }}
                />
              </div>

              {cleanFeedback && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{cleanFeedback}</span>
                </div>
              )}

              {/* Cleanup Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClearCachedTests}
                  disabled={isCleaning || cachedTestCount === 0}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clean Cached Test Files</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllStorage}
                  disabled={isCleaning}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Full Memory Reset</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            {/* Font Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 h-min">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Use LaTeX Fonts</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Applies genuine LaTeX typography (KaTeX Computer Modern, Tiro Bangla, DM Serif Text) across all exam questions, options, and interfaces.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.useLatexFont}
                  onChange={(e) => updateSetting('useLatexFont', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

          </div>
        </div>
        
      </main>
    </div>
  );
}
