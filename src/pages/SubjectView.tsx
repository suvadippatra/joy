import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CBTTest, Category, subjects } from '../data/cbtData';
import { useCBTData } from '../hooks/useCBTData';
import { Play, MoreVertical, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import Footer from '../components/Footer';

export default function SubjectView() {
  const { subject: subjectParam } = useParams<{ subject: string }>();
  const [activeCategory, setActiveCategory] = useState<Category>('Kattar Tests');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { tests, deleteLocalTest } = useCBTData();
  const subject = subjects.find(s => s.toLowerCase() === subjectParam?.toLowerCase()) || 'Botany';
  const subjectTests = tests.filter(test => test.subject === subject);
  
  const kattarCount = subjectTests.filter(t => t.category === 'Kattar Tests').length;
  const practiceCount = subjectTests.filter(t => t.category === 'Practice Sets').length;
  const displayTests = subjectTests.filter(t => t.category === activeCategory);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 bg-transparent flex flex-col font-sans transition-colors">
      <Header title={`${subject} Tests`} showBack onBack={() => navigate('/')} />
      
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8 mx-auto xl:max-w-[90rem]">
        
        {/* Categories Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-blue-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-4 sm:gap-12 w-full">
            <button 
              onClick={() => setActiveCategory('Kattar Tests')}
              className={clsx(
                "flex items-center gap-2 pb-3 text-lg sm:text-2xl font-bold transition-colors relative",
                activeCategory === 'Kattar Tests' 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-400 dark:text-slate-500 hover:text-blue-500"
              )}
            >
              <span>Kattar Tests</span>
              <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-current text-sm sm:text-base shrink-0">
                {kattarCount}
              </span>
              {activeCategory === 'Kattar Tests' && (
                <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveCategory('Practice Sets')}
              className={clsx(
                "flex items-center gap-2 pb-3 text-lg sm:text-2xl font-bold transition-colors relative",
                activeCategory === 'Practice Sets' 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-400 dark:text-slate-500 hover:text-blue-500"
              )}
            >
              <span>Practice Tests</span>
              <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-current text-sm sm:text-base shrink-0">
                {practiceCount}
              </span>
              {activeCategory === 'Practice Sets' && (
                <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              )}
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
          {displayTests.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-slate-700/50">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg font-medium">No tests found in this category.</p>
              <p className="text-sm opacity-70 mt-1">Upload a local HTML file or check back later.</p>
            </div>
          ) : (
            displayTests.map((test) => (
              <div key={test.id} className="relative group/card">
                <Link 
                  to={`/test/${test.id}`}
                  className="group relative overflow-hidden bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex flex-col p-6 shadow-md shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 min-h-[160px] h-full block"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-bl-full transition-transform group-hover:scale-110" />
                  
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                    <Play size={24} className="ml-1" />
                  </div>
                  
                  <div className="mt-auto pr-8">
                    <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1 truncate">
                      {test.category} {test.isLocal && <span className="text-orange-500 ml-1">(Local)</span>}
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 truncate w-full">
                      {test.title}
                    </h3>
                    {test.duration && (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {test.duration}
                      </p>
                    )}
                  </div>
                </Link>
                
                {test.isLocal && (
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
                )}
              </div>
            ))
          )}
        </div>
        
      </main>
      <Footer />
    </div>
  );
}
