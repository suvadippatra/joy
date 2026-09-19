import React, { useState, useEffect, FormEvent } from 'react';
import Header from '../components/Header';
import { Settings as SettingsIcon, Type, HardDrive, Trash2, RefreshCw, CheckCircle2, AlertTriangle, FolderTree, Plus, X, ChevronDown, ChevronRight, RotateCcw, Layers } from 'lucide-react';
import localforage from 'localforage';
import { useSubjectCategories, DEFAULT_SUBJECTS_MAP } from '../hooks/useSubjectCategories';

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

  // Subject & Category Management State
  const {
    subjects,
    subjectMap,
    addSubject,
    deleteSubject,
    addCategory,
    deleteCategory,
    resetToDefault
  } = useSubjectCategories();

  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newCategoryInputs, setNewCategoryInputs] = useState<Record<string, string>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    'Botany': true
  });
  const [subjectFeedback, setSubjectFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const toggleExpandSubject = (subj: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subj]: !prev[subj] }));
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;

    const success = addSubject(newSubjectInput.trim());
    if (success) {
      setSubjectFeedback({ type: 'success', message: `Subject "${newSubjectInput.trim()}" added successfully!` });
      setExpandedSubjects(prev => ({ ...prev, [newSubjectInput.trim()]: true }));
      setNewSubjectInput('');
    } else {
      setSubjectFeedback({ type: 'error', message: `Subject "${newSubjectInput.trim()}" already exists!` });
    }
    setTimeout(() => setSubjectFeedback(null), 3500);
  };

  const handleDeleteSubjectClick = (subj: string) => {
    if (!window.confirm(`Are you sure you want to delete the subject "${subj}" and all its category configurations?`)) {
      return;
    }
    const success = deleteSubject(subj);
    if (success) {
      setSubjectFeedback({ type: 'success', message: `Subject "${subj}" removed.` });
    } else {
      setSubjectFeedback({ type: 'error', message: `Cannot delete the last remaining subject.` });
    }
    setTimeout(() => setSubjectFeedback(null), 3500);
  };

  const handleAddCategorySubmit = (subj: string, e: React.FormEvent) => {
    e.preventDefault();
    const catInput = newCategoryInputs[subj] || '';
    if (!catInput.trim()) return;

    const success = addCategory(subj, catInput.trim());
    if (success) {
      setSubjectFeedback({ type: 'success', message: `Added category "${catInput.trim()}" to ${subj}!` });
      setNewCategoryInputs(prev => ({ ...prev, [subj]: '' }));
    } else {
      setSubjectFeedback({ type: 'error', message: `Category "${catInput.trim()}" already exists in ${subj}!` });
    }
    setTimeout(() => setSubjectFeedback(null), 3500);
  };

  const handleDeleteCategoryClick = (subj: string, cat: string) => {
    const success = deleteCategory(subj, cat);
    if (success) {
      setSubjectFeedback({ type: 'success', message: `Category "${cat}" removed from ${subj}.` });
    } else {
      setSubjectFeedback({ type: 'error', message: `Each subject must keep at least 1 category.` });
    }
    setTimeout(() => setSubjectFeedback(null), 3500);
  };

  const handleResetSubjects = () => {
    if (!window.confirm('Reset all subjects and categories to standard default values? (Botany, Zoology, Physics, Chemistry with Kattar Tests & Practice Sets)')) {
      return;
    }
    resetToDefault();
    setSubjectFeedback({ type: 'success', message: 'Subjects and categories restored to defaults.' });
    setTimeout(() => setSubjectFeedback(null), 3500);
  };

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
        
        {/* Subjects & Categories Management Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Subjects & Categories
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add custom subjects and organize the test categories available within each subject.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetSubjects}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="Reset all subjects & categories to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Feedback alert */}
            {subjectFeedback && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs sm:text-sm animate-in fade-in ${
                subjectFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}>
                {subjectFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{subjectFeedback.message}</span>
              </div>
            )}

            {/* Add New Subject Form */}
            <form onSubmit={handleAddSubjectSubmit} className="flex gap-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="New subject name (e.g. Mathematics, English, Botany)..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={!newSubjectInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </form>

            {/* Subjects List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Configured Subjects ({subjects.length})
              </h3>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/30">
                {subjects.map((subj) => {
                  const isExpanded = !!expandedSubjects[subj];
                  const cats = subjectMap[subj] || ['Kattar Tests', 'Practice Sets'];

                  return (
                    <div key={subj} className="transition-colors">
                      {/* Subject Row Header */}
                      <div className="flex items-center justify-between p-3 sm:p-3.5 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleExpandSubject(subj)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                        >
                          <div className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                          <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">
                            {subj}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
                            {cats.length} {cats.length === 1 ? 'category' : 'categories'}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubjectClick(subj)}
                            disabled={subjects.length <= 1}
                            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30"
                            title={`Delete subject ${subj}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Categories Panel */}
                      {isExpanded && (
                        <div className="px-3.5 pb-4 pt-1 bg-white/60 dark:bg-slate-800/40 space-y-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Layers size={13} />
                              Categories in {subj}:
                            </span>
                          </div>

                          {/* Category Chips */}
                          <div className="flex flex-wrap gap-2">
                            {cats.map((cat) => (
                              <div
                                key={cat}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 group"
                              >
                                <span>{cat}</span>
                                {cats.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategoryClick(subj, cat)}
                                    className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    title={`Remove ${cat} from ${subj}`}
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add Category to this Subject Form */}
                          <form
                            onSubmit={(e) => handleAddCategorySubmit(subj, e)}
                            className="flex gap-2 pt-1"
                          >
                            <input
                              type="text"
                              value={newCategoryInputs[subj] || ''}
                              onChange={(e) =>
                                setNewCategoryInputs((prev) => ({
                                  ...prev,
                                  [subj]: e.target.value,
                                }))
                              }
                              placeholder={`Add category to ${subj} (e.g. Chapterwise, Mock Test)...`}
                              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                            />
                            <button
                              type="submit"
                              disabled={!(newCategoryInputs[subj] || '').trim()}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 disabled:opacity-40 rounded-lg text-xs font-semibold transition-colors border border-blue-200 dark:border-blue-800 whitespace-nowrap"
                            >
                              + Add
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

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
