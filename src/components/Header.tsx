import { Moon, Sun, Search, ChevronLeft, X, Settings, GraduationCap } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useCBTData } from '../hooks/useCBTData';
import { PWAInstallButton } from './PWAInstallButton';

export default function Header({ title, showBack = false, hideControls = false, onBack }: { title: string, showBack?: boolean, hideControls?: boolean, onBack?: () => void }) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    <header className="flex flex-wrap items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-blue-200 dark:border-blue-800/50 sticky top-0 z-50 transition-colors gap-y-4">
      <div className="flex items-center gap-2 min-w-0 max-w-[70%] lg:max-w-[50%]">
        {showBack && (
          <button onClick={onBack || (() => navigate(-1))} className="p-2 -ml-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 text-slate-600 dark:text-slate-300 transition-colors shrink-0">
            <ChevronLeft size={24} />
          </button>
        )}
        
        <Link to="/" className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 shrink-0">
          <GraduationCap size={18} className="text-white" />
        </Link>
        
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate tracking-tight uppercase ml-1">
          {title}
        </h1>
      </div>
      
      {!hideControls && (
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
          <div className="relative shrink-0" ref={searchRef}>
            <div className="flex items-center bg-blue-50 dark:bg-slate-800 rounded-full border border-blue-200 dark:border-blue-700/50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-900 transition-all">
              <div className="pl-3 py-2 text-blue-500 dark:text-blue-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search tests..." 
                className="bg-transparent border-none outline-none pl-2 pr-4 py-1.5 sm:py-2 text-sm sm:text-base w-24 sm:w-40 md:w-48 text-slate-800 dark:text-slate-200 placeholder-blue-300 dark:placeholder-slate-500 truncate"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="pr-3 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                  <X size={16} />
                </button>
              )}
            </div>
            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery && (
              <div className="absolute right-0 mt-2 w-64 sm:w-80 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800 rounded-xl shadow-xl shadow-blue-900/10 dark:shadow-black/40 py-2 z-50">
                {searchResults.length > 0 ? (
                  searchResults.map(test => (
                    <Link 
                      key={test.id} 
                      to={`/test/${test.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="block px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                    >
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{test.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{test.subject} &bull; {test.category}</p>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No tests found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          
          <Link
            to="/settings"
            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors shrink-0"
            title="Settings"
          >
            <Settings size={22} />
          </Link>
          
          <PWAInstallButton />
        </div>
      )}
    </header>
  );
}