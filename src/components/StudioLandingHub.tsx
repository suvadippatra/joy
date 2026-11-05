import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import localforage from 'localforage';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  FolderOpen,
  Clock,
  Trash2,
  Copy,
  BookmarkPlus,
  BookOpen,
  FileText,
  Sparkles,
  Check,
  Edit3,
  Columns2,
  Sigma,
  Layout
} from 'lucide-react';

export interface SavedStudioProject<T = any> {
  id: string;
  title: string;
  subtitle: string;
  metaBadge: string;
  updatedAt: string;
  data: T;
}

interface StudioLandingHubProps<T = any> {
  mode: 'doc-studio' | 'cbt-maker';
  activeTitle: string;
  activeSubtitle: string;
  activeMetaBadge: string;
  activeUpdatedAt?: string;
  activeData: T;
  onResumeActive: () => void;
  onCreateNewBlank: () => void;
  onLoadProjectData: (data: T) => void;
  onSelectTemplate?: (templateId: string) => void;
  onOpenFullGuide: () => void;
}

export default function StudioLandingHub<T = any>({
  mode,
  activeTitle,
  activeSubtitle,
  activeMetaBadge,
  activeUpdatedAt,
  activeData,
  onResumeActive,
  onCreateNewBlank,
  onLoadProjectData,
  onSelectTemplate,
  onOpenFullGuide
}: StudioLandingHubProps<T>) {
  const storageKey = mode === 'doc-studio' ? 'doc_studio_projects_v1' : 'cbt_maker_projects_v1';
  const [projects, setProjects] = useState<SavedStudioProject<T>[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    let mounted = true;
    localforage
      .getItem<SavedStudioProject<T>[]>(storageKey)
      .then(list => {
        if (mounted && Array.isArray(list)) {
          setProjects(list);
        }
      })
      .catch(err => console.error('Failed to load studio projects:', err));
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const persistProjects = async (nextList: SavedStudioProject<T>[]) => {
    setProjects(nextList);
    try {
      await localforage.setItem(storageKey, nextList);
    } catch (err) {
      console.error('Failed to save studio projects:', err);
    }
  };

  const handleSaveCurrentToLibrary = async () => {
    const now = new Date().toISOString();
    const existingIdx = projects.findIndex(
      p => p.title.trim().toLowerCase() === (activeTitle || 'Untitled').trim().toLowerCase()
    );
    let nextList: SavedStudioProject<T>[];
    if (existingIdx >= 0) {
      const updated: SavedStudioProject<T> = {
        ...projects[existingIdx],
        title: activeTitle || 'Untitled Project',
        subtitle: activeSubtitle || '',
        metaBadge: activeMetaBadge,
        updatedAt: now,
        data: JSON.parse(JSON.stringify(activeData))
      };
      nextList = [updated, ...projects.filter((_, i) => i !== existingIdx)];
    } else {
      const created: SavedStudioProject<T> = {
        id: 'proj_' + Math.random().toString(36).substring(2, 10),
        title: activeTitle || 'Untitled Project',
        subtitle: activeSubtitle || '',
        metaBadge: activeMetaBadge,
        updatedAt: now,
        data: JSON.parse(JSON.stringify(activeData))
      };
      nextList = [created, ...projects];
    }
    await persistProjects(nextList);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleDuplicateProject = async (proj: SavedStudioProject<T>) => {
    const copy: SavedStudioProject<T> = {
      ...proj,
      id: 'proj_' + Math.random().toString(36).substring(2, 10),
      title: `${proj.title} (Copy)`,
      updatedAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(proj.data))
    };
    await persistProjects([copy, ...projects]);
  };

  const handleDeleteProject = async (id: string) => {
    await persistProjects(projects.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const handleConfirmRename = async (id: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    const nextList = projects.map(p => {
      if (p.id !== id) return p;
      const clonedData: any = JSON.parse(JSON.stringify(p.data));
      if (clonedData && typeof clonedData === 'object') {
        if ('title' in clonedData) clonedData.title = renameValue.trim();
        if ('config' in clonedData && clonedData.config) clonedData.config.title = renameValue.trim();
      }
      return {
        ...p,
        title: renameValue.trim(),
        updatedAt: new Date().toISOString(),
        data: clonedData
      };
    });
    await persistProjects(nextList);
    setRenamingId(null);
  };

  const formatTime = (iso?: string) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const isDoc = mode === 'doc-studio';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-13 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isDoc ? 'bg-blue-600' : 'bg-indigo-600'}`}>
              {isDoc ? <FileText size={16} /> : <Columns2 size={16} />}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight">
                {isDoc ? 'Document Studio' : 'CBT Creation Studio'}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isDoc ? 'Academic Word Processor, LaTeX & Research Paper Typesetting' : 'High-Speed Multi-Column Exam & Question Paper Builder'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFullGuide}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen size={14} className="text-amber-500" />
            <span>User Guide</span>
          </button>
          <button
            type="button"
            onClick={onResumeActive}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Open Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 1-Click Resume Active Draft Banner */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Clock size={13} />
              <span>ACTIVE WORKSPACE DRAFT</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">{formatTime(activeUpdatedAt)}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {activeTitle || 'Untitled Project'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {activeSubtitle && <span>{activeSubtitle}</span>}
              {activeSubtitle && <span>•</span>}
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{activeMetaBadge}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleSaveCurrentToLibrary}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Save a snapshot of the active workspace to your Recent Projects library"
            >
              {savedNotice ? <Check size={14} className="text-emerald-500" /> : <BookmarkPlus size={14} className="text-blue-500" />}
              <span>{savedNotice ? 'Saved to Projects' : 'Save to Projects'}</span>
            </button>

            <button
              type="button"
              onClick={onCreateNewBlank}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>New Blank</span>
            </button>

            <button
              type="button"
              onClick={onResumeActive}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Resume Draft</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* Quick Starter Templates */}
        {onSelectTemplate && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Start Templates
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isDoc ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('exam')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                      2-Column Research / Exam
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">IEEE two-column paper with headers &amp; math</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('physics')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                      Physics &amp; Mechanics
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Theorems, inline &amp; display LaTeX derivations</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('textbook_vectors')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                      Margin Rail Textbook
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Sidenotes, figures &amp; asymmetric rail layout</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('calculus')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                      Calculus &amp; Proofs
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Aligned equations, matrices &amp; proof callouts</div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('kattar')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                      Chapterwise Kattar Test
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Single subject (+4 / -1) high-speed template</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('jee')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                      JEE Main 3-Section
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Physics, Chemistry &amp; Maths with MCQ + NAT</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('neet')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                      NEET 4-Subject Mock
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Physics, Chemistry, Botany &amp; Zoology</div>
                  </button>
                  <button
                    type="button"
                    onClick={onCreateNewBlank}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                      Blank Custom Exam
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Start fresh with custom sections &amp; marking</div>
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {/* Saved Recent Projects Library */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FolderOpen size={13} />
              <span>Saved Recent Projects ({projects.length})</span>
            </h3>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No saved projects in your library yet. Click <strong>"Save to Projects"</strong> above to store snapshots of multiple papers or exams.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    {renamingId === proj.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleConfirmRename(proj.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          className="flex-1 px-2 py-1 text-xs font-bold rounded border border-blue-500 bg-slate-50 dark:bg-slate-800"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmRename(proj.id)}
                          className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => onLoadProjectData(proj.data)}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer truncate"
                        >
                          {proj.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {proj.metaBadge}
                        </span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      {proj.subtitle && <span className="truncate max-w-[140px]">{proj.subtitle}</span>}
                      {proj.subtitle && <span>•</span>}
                      <span>{formatTime(proj.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(proj.id);
                          setRenameValue(proj.title);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Rename"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateProject(proj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate"
                      >
                        <Copy size={13} />
                      </button>
                      {deletingId === proj.id ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(proj.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onLoadProjectData(proj.data)}
                      className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Open</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Concise User Guides Showcase */}
        <section className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Essential User Guides &amp; Shortcuts</span>
            </h3>
            <button
              type="button"
              onClick={onOpenFullGuide}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open Complete Reference →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <Sigma size={15} className="text-blue-500" />
                <span>Inline &amp; Block LaTeX Math</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Write inline formulas with <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">$E = mc^2$</code>, <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">{'\\(x^2\\)'}</code>, or bare commands like <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">{'\\frac{a}{b}'}</code> and <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">{'\\alpha'}</code>. Use <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">$$...$$</code> for centered equations.
              </p>
            </div>

            {isDoc ? (
              <>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Layout size={15} className="text-emerald-500" />
                    <span>Margins, Headers &amp; Page Numbers</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Switch to the <strong>Page Layout</strong> ribbon tab to adjust Top/Bottom/Left/Right margins in mm, paper size, and 2-column IEEE layout, or click directly on any sheet's header or footer to edit on-page.
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <FileText size={15} className="text-purple-500" />
                    <span>Live Edit-to-Page Sync</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    As you type or click any paragraph in the editor, the preview automatically scrolls to that page and highlights the active block on the virtual sheet.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Columns2 size={15} className="text-indigo-500" />
                    <span>Resizable 1-Col ↔ 2-Col Split View</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Edit all questions on the left while viewing all preview cards in the same order on the right. Drag the center divider—wider panes automatically arrange questions into 2 columns!
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Layout size={15} className="text-emerald-500" />
                    <span>Zero-Lag 200+ Question Engine</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Memoized question cards and cached offline KaTeX rendering ensure instant typing with zero lag even on full-length 180–200 question papers.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
