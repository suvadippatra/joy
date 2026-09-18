const fs = require('fs');
let c = fs.readFileSync('src/pages/SubjectView.tsx', 'utf8');

if (!c.includes('useOfflineCache')) {
  c = c.replace(
    "import { useCBTData } from '../hooks/useCBTData';",
    "import { useCBTData } from '../hooks/useCBTData';\nimport { useOfflineCache } from '../hooks/useOfflineCache';"
  );
  
  c = c.replace(
    "import { Play, MoreVertical, Trash2 } from 'lucide-react';",
    "import { Play, MoreVertical, Trash2, CloudDownload, CloudOff, Loader2 } from 'lucide-react';"
  );
  if (!c.includes('CloudDownload')) {
    c = c.replace(
        "import { Play, MoreVertical, Trash2 } from 'lucide-react';",
        "import { Play, MoreVertical, Trash2, CloudDownload, CloudOff, Loader2 } from 'lucide-react';"
    );
  }
}

c = c.replace(
  "const { tests, deleteLocalTest } = useCBTData();",
  "const { tests, deleteLocalTest } = useCBTData();\n  const { downloadedTests, isDownloading, downloadTest, removeDownload } = useOfflineCache();"
);

// We need to modify the triple dot button. It currently only shows for `test.isLocal`.
// Let's change the condition so it shows for all tests, or at least we always show it, and the menu content changes based on isLocal or download status.

const oldMenuLogic = `{test.isLocal && (
                  <div className="absolute bottom-6 right-4 z-10">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setOpenMenuId(openMenuId === test.id ? null : test.id);
                      }}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === test.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteLocalTest(test.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={16} />
                          Remove HTML
                        </button>
                      </div>
                    )}
                  </div>
                )}`;

const newMenuLogic = `<div className="absolute bottom-6 right-4 z-10">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setOpenMenuId(openMenuId === test.id ? null : test.id);
                      }}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === test.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                        {test.isLocal ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteLocalTest(test.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={16} />
                            Remove HTML
                          </button>
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
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <CloudOff size={16} />
                                Remove from Offline
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
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                              >
                                {isDownloading[test.id] ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
                                Make Available Offline
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>`;

c = c.replace(oldMenuLogic, newMenuLogic);

// Add the downloaded checkmark to the card UI
const oldCategoryLine = `{test.category} {test.isLocal && <span className="text-orange-500 ml-1">(Local)</span>}`;
const newCategoryLine = `{test.category} {test.isLocal && <span className="text-orange-500 ml-1">(Local)</span>} {!test.isLocal && downloadedTests[test.id] && <span className="text-emerald-500 ml-1 flex items-center inline-flex gap-1"><CloudDownload size={12} /> Offline</span>}`;

c = c.replace(oldCategoryLine, newCategoryLine);

fs.writeFileSync('src/pages/SubjectView.tsx', c);
console.log('Fixed SubjectView');
