import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, WifiOff, LayoutDashboard, FileEdit, CloudDownload, Sparkles, BookOpen } from 'lucide-react';

export default function Footer() {
  const features = [
    {
      icon: <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />,
      title: "100% Offline Capable",
      desc: "Install as a PWA to take exams smoothly without needing an active internet connection."
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />,
      title: "Instant Response",
      desc: "Zero server lag during tests with instantaneous question and formula rendering."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />,
      title: "Secure & Private",
      desc: "All test scores, analytics, and answers are preserved safely in your device storage."
    },
    {
      icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />,
      title: "Authentic Exam Interface",
      desc: "Realistic computer-based testing environment calibrated for accurate exam simulation."
    },
    {
      icon: <FileEdit className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />,
      title: "Create Custom Tests",
      desc: "Upload custom test files to practice under exact CBT exam formats and timing rules."
    },
    {
      icon: <CloudDownload className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />,
      title: "Take Tests Anywhere",
      desc: "Save tests directly for uninterrupted offline practice whenever and wherever you need."
    }
  ];

  return (
    <footer className="w-full mt-6 sm:mt-8 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Why Use CBT Hub?</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">Advanced testing engine built for focused, distraction-free practice.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3 sm:p-5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs mb-2 sm:mb-3 border border-slate-100 dark:border-slate-800 shrink-0">
                {f.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 leading-snug">{f.title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-normal sm:leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        
        {/* CBT Maker Studio CTA Button */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center px-2">
          <Link
            to="/maker"
            id="cbt-maker-cta-btn"
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 max-w-xl text-center"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse shrink-0" />
            <span className="text-center tracking-tight">
              Start creating tests by pasting CBT format and attaching images
            </span>
          </Link>
          <p className="mt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Author custom tests with instant LaTeX/HTML math formatting, image precision cropping, and live preview.
          </p>

          {/* Document Studio Portal Button - Placed right under CBT Maker */}
          <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 w-full max-w-xl flex flex-col items-center">
            <Link
              to="/doc-studio"
              id="doc-studio-cta-btn"
              className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full text-center"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 shrink-0" />
              <span className="text-center tracking-tight">
                Document Studio: LaTeX Academic Notebook, Print &amp; Word Processor
              </span>
            </Link>
            <p className="mt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Create publication-grade academic notes, papers &amp; formula sheets with LaTeX math, custom Google Fonts, image flow, paginated A4 preview, and 1-click HTML export.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-1">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
             CBT Hub &copy; {new Date().getFullYear()}. Created by <a href="https://github.com/suvadippatra" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@suvadippatra</a>
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-500">
             Designed for uninterrupted offline practice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
