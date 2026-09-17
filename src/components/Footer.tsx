import React from 'react';
import { Zap, ShieldCheck, WifiOff, LayoutDashboard } from 'lucide-react';

export default function Footer() {
  const features = [
    {
      icon: <WifiOff className="w-6 h-6 text-blue-500" />,
      title: "100% Offline Capable",
      desc: "Install as a PWA. Take exams perfectly offline with cached dependencies."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Lightning Fast",
      desc: "Zero server latency during tests. Math rendering happens instantly on-device."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "Secure Environment",
      desc: "Tests are executed locally in a secure, sandboxed browser wrapper."
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-purple-500" />,
      title: "Real Exam Interface",
      desc: "Pixel-perfect clone of NTA/JEE examination interfaces for true simulation."
    }
  ];

  return (
    <footer className="w-full mt-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Why Use CBT Hub?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">The most advanced local testing engine built for students.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-4 border border-slate-100 dark:border-slate-800">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
             CBT Hub &copy; {new Date().getFullYear()}. Created by <a href="https://github.com/suvadippatra" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@suvadippatra</a>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
             Designed for uninterrupted offline practice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
