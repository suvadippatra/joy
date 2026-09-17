const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove truncate from subject name, add whitespace-normal or just remove truncate
c = c.replace(
  'text-lg sm:text-2xl lg:text-4xl font-extrabold text-white truncate w-full',
  'text-xl sm:text-2xl lg:text-4xl font-extrabold text-white break-words w-full'
);

// 2. Increase opacity of subject icons so they are clearly visible
c = c.replace('text-emerald-400/30 dark:text-emerald-500/20', 'text-white/40 dark:text-white/30');
c = c.replace('text-rose-400/30 dark:text-rose-500/20', 'text-white/40 dark:text-white/30');
c = c.replace('text-blue-400/30 dark:text-blue-500/20', 'text-white/40 dark:text-white/30');
c = c.replace('text-amber-400/30 dark:text-amber-500/20', 'text-white/40 dark:text-white/30');
c = c.replace('text-indigo-400/30 dark:text-indigo-500/20', 'text-white/40 dark:text-white/30');


// 3. Add Empty State for Recent Tests to fill the gap
const oldRecentExams = `{recentExams.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">`;
const newRecentExams = `<div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
                Recent Exams
              </h2>
              {recentExams.length > 0 && (
                <Link 
                  to="/recent"
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  View More <ArrowRight size={16} />
                </Link>
              )}
            </div>
            
            {recentExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;

const oldRecentExamsEnd = `              ))}
            </div>
          </div>
        )}`;
const newRecentExamsEnd = `              ))}
            </div>
            ) : (
              <div className="w-full bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-3xl flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
                <Activity size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">No Recent Exams</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  When you complete a test, your analytics and score reports will appear here automatically.
                </p>
              </div>
            )}
          </div>`;

c = c.replace('{recentExams.length > 0 && (\n          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">', newRecentExams);

c = c.replace('              ))}\n            </div>\n          </div>\n        )}', newRecentExamsEnd);

fs.writeFileSync('src/pages/Home.tsx', c);
console.log('Fixed home visuals');
