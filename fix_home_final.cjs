const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = '{/* Recent Tests */}';
const targetIndex = c.indexOf(target);

if (targetIndex !== -1) {
  const goodPart = c.substring(0, targetIndex);
  const newPart = `{/* Recent Tests */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentExams.map((report) => (
                <Link 
                  key={report.id} 
                  to={\`/test/\${report.testId}\`}
                  className="group relative overflow-hidden bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex flex-col p-5 shadow-md shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider truncate">
                      {report.subject}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap ml-2">
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2 w-full leading-tight mb-4 flex-1">
                    {report.testTitle}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Target size={14} className="text-blue-500" />
                        <span className="text-sm font-semibold">{report.score}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Percent size={14} className="text-emerald-500" />
                        <span className="text-sm font-semibold">{report.accuracy}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock size={14} />
                      <span className="text-xs font-medium">{report.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
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
        </div>
      </main>
      <Footer />
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Upload Local Test</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setUploadSubject(s)}
                      className={\`px-3 py-2 rounded-xl text-sm font-medium transition-colors border \${uploadSubject === s ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'}\`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setUploadCategory(c)}
                      className={\`px-3 py-2 rounded-xl text-sm font-medium transition-colors border \${uploadCategory === c ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'}\`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-700">
                <input 
                  type="file" 
                  accept=".html" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  disabled={!uploadSubject || !uploadCategory}
                  onClick={() => fileInputRef.current?.click()}
                  className={\`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors \${(!uploadSubject || !uploadCategory) ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}\`}
                >
                  <Upload size={18} />
                  <span>Select HTML File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

  fs.writeFileSync('src/pages/Home.tsx', goodPart + newPart);
  console.log('Fixed Home syntax');
} else {
  console.log('Could not find Recent Tests in Home.tsx');
}
