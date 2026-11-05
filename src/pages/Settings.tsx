import React, { useState, useEffect, FormEvent } from 'react';
import Header from '../components/Header';
import { Settings as SettingsIcon, Type, HardDrive, Trash2, RefreshCw, CheckCircle2, AlertTriangle, FolderTree, Plus, X, ChevronDown, ChevronRight, RotateCcw, Layers, Pencil, Check, Sliders } from 'lucide-react';
import localforage from 'localforage';
import { useSubjectCategories } from '../hooks/useSubjectCategories';
import { useButtonDisplayMode, ButtonDisplayMode } from '../hooks/useButtonDisplayMode';

export default function Settings() {
  const [settings, setSettings] = useState({
    useLatexFont: false
  });
  const { mode: buttonDisplayMode, setMode: setButtonDisplayMode } = useButtonDisplayMode();
  
  const [memoryUsage, setMemoryUsage] = useState<string>('Calculating...');
  const [percentUsed, setPercentUsed] = useState<number>(0);
  const [cachedTestCount, setCachedTestCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);
  const [confirmFullReset, setConfirmFullReset] = useState(false);

  // Subject & Category Management State
  const {
    subjects,
    subjectMap,
    addSubject,
    renameSubject,
    deleteSubject,
    addCategory,
    renameCategory,
    deleteCategory,
    resetToDefault
  } = useSubjectCategories();

  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newCategoryInputs, setNewCategoryInputs] = useState<Record<string, string>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    'Botany': true
  });
  const [subjectFeedback, setSubjectFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subject editing & non-blocking confirmation states
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState('');
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<string | null>(null);
  const [confirmResetSubjects, setConfirmResetSubjects] = useState(false);

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<{ subj: string; cat: string } | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

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

  const handleStartEditSubject = (subj: string) => {
    setEditingSubject(subj);
    setEditSubjectValue(subj);
    setConfirmDeleteSubject(null);
  };

  const handleSaveEditSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingSubject) return;
    const trimmed = editSubjectValue.trim();
    if (!trimmed) {
      setSubjectFeedback({ type: 'error', message: 'Subject name cannot be empty.' });
      return;
    }
    if (trimmed === editingSubject) {
      setEditingSubject(null);
      return;
    }
    const success = renameSubject(editingSubject, trimmed);
    if (success) {
      setSubjectFeedback({ type: 'success', message: `Subject "${editingSubject}" renamed to "${trimmed}".` });
      setExpandedSubjects(prev => {
        const next = { ...prev };
        if (next[editingSubject]) {
          delete next[editingSubject];
          next[trimmed] = true;
        }
        return next;
      });
      setEditingSubject(null);
    } else {
      setSubjectFeedback({ type: 'error', message: `Subject "${trimmed}" already exists.` });
    }
    setTimeout(() => setSubjectFeedback(null), 3500);
  };

  const handleConfirmDeleteSubject = (subj: string) => {
    const success = deleteSubject(subj);
    setConfirmDeleteSubject(null);
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

  const handleStartEditCategory = (subj: string, cat: string) => {
    setEditingCategory({ subj, cat });
    setEditCategoryValue(cat);
  };

  const handleSaveEditCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCategory) return;
    const { subj, cat } = editingCategory;
    const trimmed = editCategoryValue.trim();
    if (!trimmed) {
      setSubjectFeedback({ type: 'error', message: 'Category name cannot be empty.' });
      return;
    }
    if (trimmed === cat) {
      setEditingCategory(null);
      return;
    }
    const success = renameCategory(subj, cat, trimmed);
    if (success) {
      setSubjectFeedback({ type: 'success', message: `Category renamed to "${trimmed}".` });
      setEditingCategory(null);
    } else {
      setSubjectFeedback({ type: 'error', message: `Category "${trimmed}" already exists in ${subj}.` });
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

  const handleDoResetSubjects = () => {
    resetToDefault();
    setConfirmResetSubjects(false);
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
    window.dispatchEvent(new Event('cbt_settings_changed'));
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
    setConfirmFullReset(false);
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
            {confirmResetSubjects ? (
              <div className="flex items-center gap-1.5 p-1 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium px-1">Reset all?</span>
                <button
                  type="button"
                  onClick={handleDoResetSubjects}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetSubjects(false)}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResetSubjects(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                title="Reset all subjects & categories to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            )}
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
                  const isEditingThisSubject = editingSubject === subj;
                  const isConfirmingDelete = confirmDeleteSubject === subj;

                  return (
                    <div key={subj} className="transition-colors">
                      {/* Subject Row Header */}
                      {isEditingThisSubject ? (
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40">
                          <form onSubmit={handleSaveEditSubject} className="flex items-center gap-2 flex-1 min-w-0">
                            <input
                              type="text"
                              value={editSubjectValue}
                              onChange={(e) => setEditSubjectValue(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                              placeholder="Subject name"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                              title="Save rename"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSubject(null)}
                              className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        </div>
                      ) : isConfirmingDelete ? (
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-red-50/60 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40">
                          <span className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300 truncate">
                            Delete "{subj}" and all categories?
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteSubject(subj)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSubject(null)}
                              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
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
                              onClick={() => handleStartEditSubject(subj)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                              title={`Rename subject ${subj}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSubject(subj)}
                              disabled={subjects.length <= 1}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30"
                              title={`Delete subject ${subj}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )}

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
                            {cats.map((cat) => {
                              const isEditingCat = editingCategory?.subj === subj && editingCategory?.cat === cat;
                              if (isEditingCat) {
                                return (
                                  <form
                                    key={cat}
                                    onSubmit={handleSaveEditCategory}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700"
                                  >
                                    <input
                                      type="text"
                                      value={editCategoryValue}
                                      onChange={(e) => setEditCategoryValue(e.target.value)}
                                      className="px-2 py-0.5 text-xs bg-white dark:bg-slate-900 border border-blue-400 rounded focus:outline-none text-slate-800 dark:text-slate-100 w-28 sm:w-36"
                                      autoFocus
                                    />
                                    <button
                                      type="submit"
                                      className="p-0.5 text-emerald-600 hover:text-emerald-700"
                                      title="Save"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategory(null)}
                                      className="p-0.5 text-slate-400 hover:text-slate-600"
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </form>
                                );
                              }

                              return (
                                <div
                                  key={cat}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 group"
                                >
                                  <span>{cat}</span>
                                  <div className="flex items-center gap-0.5 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditCategory(subj, cat)}
                                      className="p-0.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                      title={`Rename ${cat}`}
                                    >
                                      <Pencil size={12} />
                                    </button>
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
                                </div>
                              );
                            })}
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
                {confirmFullReset ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">Wipe all offline data?</span>
                    <button
                      type="button"
                      onClick={handleClearAllStorage}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                    >
                      Yes, Wipe
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmFullReset(false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmFullReset(true)}
                    disabled={isCleaning}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Full Memory Reset</span>
                  </button>
                )}
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
                    Applies genuine LaTeX typography (KaTeX Computer Modern Main, KaTeX Math, KaTeX Sans) with pre-cached offline Base64 WOFF2 font bridging across all sandboxed HTML exam viewers and editors.
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

            <hr className="border-slate-100 dark:border-slate-700" />

            {/* Toolbar Button Display Mode */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0 h-min">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Toolbar Button Preview Mode</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Controls how buttons and segmented groups are displayed in Document Studio and CBT Creation Studio. By default (<strong>Smart Active-Label</strong>), toolbars show compact icons only, while the currently selected option in a group expands slightly to display both its icon and text label.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                    {([
                      {
                        id: 'smart' as ButtonDisplayMode,
                        title: 'Smart Active-Label (Default)',
                        desc: 'Icons by default; active button in a group shows Icon + Text slightly larger'
                      },
                      {
                        id: 'icon-only' as ButtonDisplayMode,
                        title: 'Icons Only',
                        desc: 'Ultra-compact icon-only buttons across all toolbars and question cards'
                      },
                      {
                        id: 'icon-text' as ButtonDisplayMode,
                        title: 'Icons + Text Always',
                        desc: 'Shows text labels on all grouped buttons and enables the extra math snippet bar'
                      }
                    ]).map(opt => {
                      const active = buttonDisplayMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setButtonDisplayMode(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-1">
                            <span>{opt.title}</span>
                            {active && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {opt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Platform Guide & Performance Architecture Reference */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Platform Help &amp; Engine Capabilities
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Complete reference for the upgraded offline CBT Creation Tool, Document Studio, Inline Question Expressions, Smart Active-Label Toolbars, and Sandboxed Offline KaTeX Font Bridge.
            </p>
          </div>
          <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">1. CBT Creation Studio, Clean Homepage &amp; Inline Question Expressions</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Clean Zero-State Landing Hub:</strong> Opens with only <strong>Start Blank</strong> and <strong>Load Full Showcase Template</strong> until you save or start a project. Section &amp; question markings (<code className="font-mono">Q1, Q2...</code>) only appear inside the active editor workspace.</li>
                <li><strong>Inline Expression Commands (No Clutter UI):</strong> Type inline directives directly inside any question statement to configure it without extra toolbar buttons:
                  <ul className="list-circle pl-5 mt-1 space-y-0.5 font-mono text-[11px] sm:text-xs">
                    <li><code>@marks(+4,-1)</code> &rarr; Sets Correct Marks (+4) and Penalty (-1)</li>
                    <li><code>@type(NAT)</code> / <code>@type(MSQ)</code> / <code>@type(SCQ)</code> &rarr; Switches Question Type</li>
                    <li><code>@ans(B)</code> / <code>@ans(A,C)</code> / <code>@ans(5)</code> &rarr; Sets Correct Option(s) or NAT Key</li>
                    <li><code>@sol: Step-by-step derivation...</code> &rarr; Populates the Solution / Explanation box on blur</li>
                    <li><code>| Col A | Col B |</code> &rarr; Converts Markdown pipe lines into a structured HTML Matrix/Table on blur</li>
                  </ul>
                </li>
                <li><strong>Side-by-Side Multi-Question Stream &amp; Adaptive 1-Col / 2-Col Grid:</strong> Drag the center splitter or switch between <code className="font-mono">Split | Edit | View</code>—panes &ge; 820px automatically arrange questions in 2 columns.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">2. Document Studio (High-Contrast Print Sheet, Double-Escaped LaTeX &amp; Horizontal Scroll)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>High-Contrast Paper Sheet in Light &amp; Dark Mode:</strong> Virtual paper sheets always render with crisp dark ink (<code className="font-mono">#0f172a</code>) on white paper regardless of whether the app UI is in Light or Dark mode.</li>
                <li><strong>Universal &amp; Double-Escaped Inline LaTeX:</strong> Compiles <code className="font-mono">$...$</code>, <code className="font-mono">\(...\)</code>, double-escaped <code className="font-mono">\\(\Omega\\)</code>, <code className="font-mono">\\[...\\]</code>, and bare LaTeX commands seamlessly inside paragraphs, headings, lists, tables, and <code className="font-mono">\begin&#123;twocolumn&#125;</code> / <code className="font-mono">\begin&#123;wrapfigure&#125;</code> environments.</li>
                <li><strong>Full Horizontal Scroll Accessibility:</strong> Both the preview sub-header (<code className="font-mono">Sheets | Flow</code>, page jumper, zoom controls) and the zoomed paper canvas scroll horizontally without clipping right-edge or left-edge content.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">3. Sandboxed Offline KaTeX Base64 Font Bridge &amp; Single-Pass HTML Exam Viewer</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Offline Sandboxed Iframe Font Access:</strong> Pre-caches <code className="font-mono">/libs/fonts/KaTeX_*.woff2</code> into Base64 data URIs in IndexedDB (<code className="font-mono">katexFontBridge.ts</code>) and injects self-contained <code className="font-mono">@font-face</code> rules with <code className="font-mono">font-display: swap</code> directly into the sandboxed <code className="font-mono">srcDoc</code> exam iframe.</li>
                <li><strong>Instant Single-Pass Loading:</strong> Eliminates duplicate iframe reloads and font-wait invisible text (<code className="font-mono">FOIT</code>) so HTML exams load instantaneously with or without LaTeX fonts, online or 100% offline.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">4. Smart Active-Label Toolbar Mode &amp; Initial Launch Route</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Main Homepage Launch (<code className="font-mono">/#/</code>):</strong> Cold launches always open the main platform dashboard (<code className="font-mono">/#/</code>) rather than jumping into a specific subject route.</li>
                <li><strong>Smart Active-Label Buttons:</strong> By default, grouped toolbar buttons show compact icons only and expand the active selection with both Icon + Text. You can switch between <strong>Smart Active-Label</strong>, <strong>Icons Only</strong>, and <strong>Icons + Text Always</strong> above.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">5. প্রশ্নপত্র Maker (<code className="font-mono">/#/qp-maker</code>) — Bilingual Bengali &amp; English Question Paper Studio</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Exact Standalone Replica Workspace:</strong> Dedicated workspace accessible from the Homepage featuring QPF v1.1 bulk import, AI Prompt templates, up to 10 customizable sections, <code className="font-mono">অথবা / OR</code> question pairing, sub-questions with <code className="font-mono">(1+3+1)</code> part-mark breakdowns, extra blocks (Image, Table, Freehand Diagram Canvas, Labeled Diagram), Auto-fit scaling, Answer Space lines, custom watermarks, and LibreOffice <code className="font-mono">.odt</code> + native PDF/Print export.</li>
                <li><strong>Bilingual Bengali &amp; English LaTeX &amp; Fraction Engine:</strong> Supports QPF tags (<code className="font-mono">[EQ:...]</code>, <code className="font-mono">[FRAC:লব/হর]</code>, <code className="font-mono">[CHEM:...]</code>, <code className="font-mono">[SYM:...]</code>, <code className="font-mono">[SUB:...]</code>, <code className="font-mono">[SUP:...]</code>), inline <code className="font-mono">$...$</code> / <code className="font-mono">$$...$$</code> LaTeX, and automatic stacked fraction conversion for Bengali &amp; English fractions (<code className="font-mono">৩/৪</code>, <code className="font-mono">লব/হর</code>, <code className="font-mono">১৫ ÷ ৪</code>) while preserving Bengali conjuncts (যুক্তাক্ষর) inside KaTeX via automatic <code className="font-mono">\text&#123;...&#125;</code> wrapping.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-900/50 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">6. Aakash Weather &amp; Sky (<code className="font-mono">/#/weather</code>) — 60fps Engine, Canvas Map &amp; Trilingual Localization</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Zero-Lag 60fps Responsiveness:</strong> Replaced heavy full-screen CSS blur filters with GPU-accelerated radial gradients and memoized weather state slices for instant tab, layer, and language switching.</li>
                <li><strong>Astronomical Precision &amp; Day/Night Icons:</strong> Computes dynamic Solar Noon, exact Day Length, and true Lunar Ecliptic Longitude Tithi &amp; Paksha, while automatically switching clear/partly-cloudy sky icons to night-sky variants (<code className="font-mono">🌙</code>) after sunset.</li>
                <li><strong>Interactive HTML5 Canvas Weather Map &amp; Complete Today Metrics:</strong> Renders live RainViewer radar tiles, thermal heatmaps, cloud density, and 60 animated wind streamline particles, alongside Air Quality (AQI, PM2.5, PM10, O₃, NO₂), Dew Point, Visibility, Wind Gusts, Beaufort Wind Scale, and Everyday Lifestyle Advisory cards localized in <strong>English</strong>, <strong>বাংলা</strong>, and <strong>हिन्दी</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
