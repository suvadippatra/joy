import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Settings as SettingsIcon, Type, Keyboard, HardDrive } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    useLatexFont: false,
    keyboardPlacement: 'draggable'
  });
  
  const [memoryUsage, setMemoryUsage] = useState<string>('Calculating...');

  useEffect(() => {
    const saved = localStorage.getItem('cbtSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const quotaMb = ((estimate.quota || 0) / 1024 / 1024).toFixed(2);
        const usageMb = ((estimate.usage || 0) / 1024 / 1024).toFixed(2);
        setMemoryUsage(`${usageMb} MB used of ${quotaMb} MB limit`);
      }).catch(() => {
        setMemoryUsage('Unavailable');
      });
    } else {
      setMemoryUsage('Storage API not supported');
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('cbtSettings', JSON.stringify(updated));
  };

  return (
    <div className="flex-1 bg-transparent transition-colors">
      <Header title="Settings" showBack />
      
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        
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
            
            {/* Storage Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0 h-min">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Local Memory Usage</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {memoryUsage}
                  </p>
                </div>
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
                    Forces Tiro Bangla and DM Serif Text fonts for better mathematical rendering and readability.
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

            {/* Keyboard Placement */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 h-min">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Virtual Keyboard Placement</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    Choose how the virtual keyboard appears on screen during NAT questions.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      className={`
                        flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                        ${settings.keyboardPlacement === 'draggable' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}
                      `}
                    >
                      <input 
                        type="radio" 
                        name="keyboardPlacement" 
                        value="draggable" 
                        className="sr-only"
                        checked={settings.keyboardPlacement === 'draggable'}
                        onChange={(e) => updateSetting('keyboardPlacement', e.target.value)}
                      />
                      <span className="font-medium text-sm">Draggable (Floating)</span>
                    </label>
                    
                    <label 
                      className={`
                        flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                        ${settings.keyboardPlacement === 'bottom' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}
                      `}
                    >
                      <input 
                        type="radio" 
                        name="keyboardPlacement" 
                        value="bottom" 
                        className="sr-only"
                        checked={settings.keyboardPlacement === 'bottom'}
                        onChange={(e) => updateSetting('keyboardPlacement', e.target.value)}
                      />
                      <span className="font-medium text-sm">Fixed to Bottom</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </main>
    </div>
  );
}
