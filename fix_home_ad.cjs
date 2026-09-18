const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const mainTag = '<main className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8 mx-auto xl:max-w-[90rem] mb-12">';
const newMainTag = mainTag + `
        {/* Offline Feature Announcement Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/20 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="relative z-10 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              New Feature
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Take Tests Anywhere, Anytime
            </h2>
            <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
              You can now download individual exams for true offline access! Look for the download icon next to any test in the subject folders.
            </p>
          </div>
          <div className="relative z-10 shrink-0 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
        </div>
`;

c = c.replace(mainTag, newMainTag);

// Replace grid classes for recent exams
c = c.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">'
);

fs.writeFileSync('src/pages/Home.tsx', c);
console.log('Fixed Home');
