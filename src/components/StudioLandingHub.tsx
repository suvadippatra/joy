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
  Layout,
  Layers
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
  hasActiveDraft?: boolean;
  activeTitle: string;
  activeSubtitle: string;
  activeMetaBadge: string;
  activeUpdatedAt?: string;
  activeData: T;
  onResumeActive: () => void;
  onCreateNewBlank: () => void;
  onLoadShowcaseTemplate: () => void;
  onLoadProjectData: (data: T) => void;
  onSelectTemplate?: (templateId: string) => void;
  onOpenFullGuide: () => void;
}

export default function StudioLandingHub<T = any>({
  mode,
  hasActiveDraft = false,
  activeTitle,
  activeSubtitle,
  activeMetaBadge,
  activeUpdatedAt,
  activeData,
  onResumeActive,
  onCreateNewBlank,
  onLoadShowcaseTemplate,
  onLoadProjectData,
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
      {/* Standalone Studio Hub Top Bar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Home Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${isDoc ? 'bg-blue-600' : 'bg-indigo-600'}`}>
              {isDoc ? <FileText size={17} /> : <Columns2 size={17} />}
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen size={14} className="text-amber-500" />
            <span>User Guide</span>
          </button>
          {hasActiveDraft && (
            <button
              type="button"
              onClick={onResumeActive}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span>Resume Workspace</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Primary Action Cards: Start Blank vs Load Full Showcase Template */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {hasActiveDraft ? 'Create or Load Template' : 'Get Started — Choose How to Begin'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Start Blank */}
            <button
              type="button"
              onClick={onCreateNewBlank}
              className="group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-left transition-all shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
                  <Plus size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {isDoc ? 'Start Blank Document' : 'Start Blank Question Set'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isDoc
                      ? 'Open a clean academic sheet with full control over margins, running headers, page numbering, and inline/block LaTeX math.'
                      : 'Begin with a clean 1-section question set using smart inline expressions (@marks, @type, @ans, @sol:) and zero UI clutter.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Start Fresh Blank Workspace</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Option 2: Load Full Showcase Template */}
            <button
              type="button"
              onClick={onLoadShowcaseTemplate}
              className="group relative bg-white dark:bg-slate-900 border-2 border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-left transition-all shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 group-hover:scale-105 transition-transform">
                    <Sparkles size={21} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200/60 dark:border-indigo-800/60">
                    All Features Showcase
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Load Full Showcase Template
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isDoc
                      ? 'Explore an authentic pre-written research paper demonstrating inline & display LaTeX, theorem callouts, vector SVG figures, wrap-figures, tables, and 2-column formatting.'
                      : 'Explore an authentic multi-section exam with SCQ, Multiple-Correct (MSQ), Numerical (NAT), LaTeX integrals, SVG diagrams, Matrix-Match tables, and solutions.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Load Pre-Written Showcase</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* Active Draft Resume Banner (Only shown after user starts or edits a project) */}
        {hasActiveDraft && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Clock size={13} />
                <span>CURRENT WORKSPACE DRAFT</span>
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
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Save a snapshot of the active workspace to your Saved Projects library"
              >
                {savedNotice ? <Check size={14} className="text-emerald-500" /> : <BookmarkPlus size={14} className="text-blue-500" />}
                <span>{savedNotice ? 'Saved to Projects' : 'Save Snapshot'}</span>
              </button>

              <button
                type="button"
                onClick={onResumeActive}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Resume Draft</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* Saved Recent Projects Library (Only shown when user has saved projects) */}
        {projects.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FolderOpen size={13} />
                <span>Saved Projects ({projects.length})</span>
              </h3>
            </div>

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
                      className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Concise User Guides & Inline Syntax Reference */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers size={13} className="text-blue-500" />
              <span>Quick Syntax &amp; Workflow Guide</span>
            </h3>
            <button
              type="button"
              onClick={onOpenFullGuide}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open Full Guide &amp; Reference →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <Sigma size={15} className="text-blue-500" />
                <span>Offline Inline &amp; Display LaTeX</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Write inline math with <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">$E = mc^2$</code> or <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">{'\\(\\Omega\\)'}</code>, and block equations with <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">$$...$$</code> or <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">{'\\[...\\]'}</code>.
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
                    Use the <strong>Page Layout</strong> tab to configure margins in mm, paper size, and 2-column IEEE layout, or click directly on any sheet's header or footer to edit on-page.
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <FileText size={15} className="text-purple-500" />
                    <span>Smart Toolbar &amp; Horizontal Scroll</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Grouped toolbar buttons display compact icons by default and expand to show their label when active. Zoomed sheets scroll smoothly both vertically and horizontally.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Sparkles size={15} className="text-indigo-500" />
                    <span>Smart Inline Question Directives</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Type <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">@marks(+4,-1)</code>, <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">@type(NAT)</code>, <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">@ans(B)</code>, or <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">@sol: ...</code> directly in the question box to auto-configure metadata!
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Columns2 size={15} className="text-emerald-500" />
                    <span>Resizable 1-Col ↔ 2-Col Split View</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Edit questions on the left while viewing synchronized preview cards on the right. Drag the center divider to dynamically switch between 1-column and 2-column grids.
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
