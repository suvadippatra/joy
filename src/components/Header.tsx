import { Moon, Sun, Search, ChevronLeft, X, Settings, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { useCBTData } from '../hooks/useCBTData';
import { PWAInstallButton } from './PWAInstallButton';
import { CBTTest } from '../data/cbtData';
import { StartExamModal } from './StartExamModal';

export default function Header({ 
  title, 
  showBack = false, 
  hideControls = false, 
  onBack, 
  actions,
  isHome = false 
}: { 
  title: string, 
  showBack?: boolean, 
  hideControls?: boolean, 
  onBack?: () => void, 
  actions?: ReactNode,
  isHome?: boolean 
}) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSearchTest, setSelectedSearchTest] = useState<CBTTest | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { tests } = useCBTData();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = tests.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="flex items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-blue-200/70 dark:border-blue-800/50 sticky top-0 z-50 transition-colors gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-[65%] lg:max-w-[50%]">
          {showBack && (
            <button onClick={onBack || (() => navigate(-1))} className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 text-slate-600 dark:text-slate-300 transition-colors shrink-0">
              <ChevronLeft size={22} />
            </button>
          )}
          
          {isHome && (
            <img 
              src="/logo.png" 
              alt="CBT Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-sm shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" 
            />
          )}
          
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate tracking-tight ml-0.5 sm:ml-1">
            {title}
          </h1>
        </div>
        
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        
        {!hideControls && (
          <div className="flex items-center gap-1.5 sm:gap-3 flex-nowrap justify-end shrink-0">
            <div className="relative shrink-0" ref={searchRef}>
              <div className="flex items-center bg-blue-50/80 dark:bg-slate-800 rounded-full border border-blue-200/80 dark:border-blue-700/50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-900 transition-all">
                <div className="pl-2.5 sm:pl-3 py-1.5 sm:py-2 text-blue-500 dark:text-blue-400">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none pl-2 pr-3 py-1 sm:py-1.5 text-xs sm:text-sm w-20 min-[400px]:w-28 sm:w-36 md:w-48 text-slate-800 dark:text-slate-200 placeholder-blue-300 dark:placeholder-slate-500 truncate"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="pr-2.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800 rounded-2xl shadow-xl shadow-blue-900/10 dark:shadow-black/40 py-2 z-50">
                  {searchResults.length > 0 ? (
                    searchResults.map(test => (
                      <button 
                        key={test.id} 
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSelectedSearchTest(test);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors"
                      >
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">{test.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{test.subject} &bull; {test.category}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      No tests found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 sm:p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors shrink-0"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link
              to="/maker"
              className="p-1.5 sm:p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400 transition-colors shrink-0"
              title="CBT Maker Studio"
            >
              <Sparkles size={20} />
            </Link>

            <Link
              to="/settings"
              className="p-1.5 sm:p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors shrink-0"
              title="Settings"
            >
              <Settings size={20} />
            </Link>
            
            <PWAInstallButton />
          </div>
        )}
      </header>

      {/* Start Exam Confirmation Modal from Search */}
      <StartExamModal
        isOpen={Boolean(selectedSearchTest)}
        onClose={() => setSelectedSearchTest(null)}
        onConfirm={() => {
          if (selectedSearchTest) {
            const id = selectedSearchTest.id;
            setSelectedSearchTest(null);
            navigate(`/test/${id}`);
          }
        }}
        test={selectedSearchTest}
      />
    </>
  );
}