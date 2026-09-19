import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CBTTest } from '../data/cbtData';
import { useCBTData } from '../hooks/useCBTData';
import { useSubjectCategories } from '../hooks/useSubjectCategories';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { Play, MoreVertical, Trash2, CloudDownload, CloudOff, Loader2, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { StartExamModal } from '../components/StartExamModal';
import { triggerHtmlDownload } from '../utils/cbtCompiler';

export default function SubjectView() {
  const { subject: subjectParam } = useParams<{ subject: string }>();
  const { subjects, getCategoriesForSubject } = useSubjectCategories();

  const subject = subjects.find(s => s.toLowerCase() === subjectParam?.toLowerCase()) || (subjectParam ? (subjectParam.charAt(0).toUpperCase() + subjectParam.slice(1)) : 'Botany');
  const availableCategories = getCategoriesForSubject(subject);

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const saved = sessionStorage.getItem(`activeCategory_${subjectParam}`);
    if (saved && availableCategories.some(c => c.toLowerCase() === saved.toLowerCase())) {
      return saved;
    }
    return availableCategories[0] || 'Kattar Tests';
  });

  // Keep activeCategory synced if categories change or subject changes
  useEffect(() => {
    if (!availableCategories.some(c => c.toLowerCase() === activeCategory.toLowerCase())) {
      setActiveCategory(availableCategories[0] || 'Kattar Tests');
    }
  }, [availableCategories, activeCategory]);

  useEffect(() => { 
    sessionStorage.setItem(`activeCategory_${subjectParam}`, activeCategory); 
  }, [activeCategory, subjectParam]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTestToStart, setSelectedTestToStart] = useState<CBTTest | null>(null);
  const navigate = useNavigate();
  
  const { tests, deleteLocalTest, getLocalTestHTML } = useCBTData();
  const { downloadedTests, isDownloading, downloadTest, removeDownload } = useOfflineCache();
  
  const subjectTests = tests.filter(test => test.subject.toLowerCase() === subject.toLowerCase());
  const displayTests = subjectTests.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase());

  // Always scroll to the top cleanly when opening a subject or switching categories
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [subjectParam, activeCategory]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 bg-transparent flex flex-col font-sans transition-colors">
      <Header title={`${subject} Tests`} showBack onBack={() => navigate('/')} />
      
      <main className="flex-1 w-full px-3 py-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8 mx-auto xl:max-w-[90rem]">
        
        {/* Categories Tabs - Centered with smooth horizontal scroll if many categories */}
        <div className="flex items-center justify-center border-b-2 border-blue-200/80 dark:border-slate-700 w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 md:gap-12 min-w-max px-2">
            {availableCategories.map((cat) => {
              const count = subjectTests.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length;
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    "flex items-center gap-2 pb-2.5 sm:pb-3 text-sm sm:text-lg lg:text-xl font-bold transition-colors relative whitespace-nowrap shrink-0",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-400 dark:text-slate-500 hover:text-blue-500"
                  )}
                >
                  <span>{cat}</span>
                  <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-current text-[11px] sm:text-xs shrink-0 font-bold">
                    {count}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tests Grid - Compact, equal dimension cards */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 mt-2">
          {displayTests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-blue-100 dark:border-slate-700/50">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-base font-medium">No tests found in this category.</p>
              <p className="text-xs opacity-70 mt-1">Upload a local HTML file or check back later.</p>
            </div>
          ) : (
            displayTests.map((test) => (
              <div key={test.id} className="relative group/card">
                {test.disabled ? (
                  <div className="group relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col p-3.5 sm:p-4 min-h-[115px] sm:min-h-[135px] h-full cursor-not-allowed opacity-60">
                    <div className="absolute inset-0 bg-stripes-slate opacity-20"></div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-2 text-slate-400 shrink-0">
                      <Play size={14} className="ml-0.5" />
                    </div>
                    <div className="mt-auto pr-7 z-10">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                        {test.category} (Maintenance)
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 truncate w-full">
                        {test.title}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setSelectedTestToStart(test)}
                    className="w-full text-left group relative overflow-hidden bg-white dark:bg-slate-800/90 border border-blue-100/90 dark:border-blue-800/50 rounded-2xl flex flex-col p-3.5 sm:p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-200 min-h-[115px] sm:min-h-[135px] h-full"
                  >
                    <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 rounded-bl-full transition-transform group-hover:scale-110" />
                    
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 dark:bg-slate-700/80 flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 shadow-xs">
                      <Play size={14} className="ml-0.5" fill="currentColor" />
                    </div>
                    
                    <div className="mt-auto pr-7 w-full">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5 truncate flex items-center gap-1.5 flex-wrap">
                        <span>{test.category}</span>
                        {test.isLocal && <span className="text-amber-500 font-bold">(Local)</span>}
                        {!test.isLocal && downloadedTests[test.id] && (
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded text-[9px] sm:text-[10px] font-bold inline-flex items-center gap-0.5">
                            <CloudDownload size={10} /> Saved Offline
                          </span>
                        )}
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate w-full">
                        {test.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {test.totalQuestions ? `${test.totalQuestions} Qs • ` : ''}{test.duration || '60 Mins'}
                      </p>
                    </div>
                  </button>
                )}
                
                {!test.disabled && (
                  <div className="absolute bottom-2.5 sm:bottom-3 right-2 sm:right-2.5 z-10">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setOpenMenuId(openMenuId === test.id ? null : test.id);
                      }}
                      className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === test.id && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 sm:w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50 py-1">
                        {test.isLocal ? (
                          <>
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const html = await getLocalTestHTML(test.id);
                                if (html) {
                                  triggerHtmlDownload(`${test.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Offline`, html);
                                } else {
                                  alert('Test file content could not be retrieved.');
                                }
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs sm:text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            >
                              <Download size={14} />
                              <span>Download HTML (CDN)</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteLocalTest(test.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                              <Trash2 size={14} />
                              <span>Remove HTML</span>
                            </button>
                          </>
                        ) : (
                          <>
                            {downloadedTests[test.id] ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeDownload(test.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              >
                                <CloudOff size={14} />
                                <span>Remove from Offline</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  downloadTest(test);
                                  setOpenMenuId(null);
                                }}
                                disabled={isDownloading[test.id]}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                              >
                                {isDownloading[test.id] ? (
                                  <Loader2 size={14} className="animate-spin text-blue-500" />
                                ) : (
                                  <CloudDownload size={14} className="text-blue-500" />
                                )}
                                <span>{isDownloading[test.id] ? 'Downloading...' : 'Make Available Offline'}</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
      </main>

      {/* Start Exam Confirmation Modal */}
      <StartExamModal
        isOpen={Boolean(selectedTestToStart)}
        onClose={() => setSelectedTestToStart(null)}
        onConfirm={() => {
          if (selectedTestToStart) {
            const id = selectedTestToStart.id;
            setSelectedTestToStart(null);
            navigate(`/test/${id}`);
          }
        }}
        test={selectedTestToStart}
      />
    </div>
  );
}
