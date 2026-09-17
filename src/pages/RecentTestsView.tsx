import React, { useMemo } from 'react';
import Header from '../components/Header';
import { useReports } from '../hooks/useReports';
import { Link } from 'react-router-dom';
import { Target, Percent, Clock, ArrowLeft } from 'lucide-react';

export default function RecentTestsView() {
  const { reports } = useReports();
  
  // Group unique tests in reports by their most recent attempt
  const recentExams = useMemo(() => {
    const uniqueMap = new Map();
    reports.forEach(r => {
      if (!uniqueMap.has(r.testId)) {
        uniqueMap.set(r.testId, r);
      }
    });
    return Array.from(uniqueMap.values());
  }, [reports]);

  return (
    <div className="flex-1 bg-transparent flex flex-col font-sans transition-colors min-h-screen">
      <Header title="Recent Exams" showBack />
      
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto xl:max-w-[90rem]">
        {recentExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {recentExams.map((report) => (
              <Link 
                key={report.id} 
                to={`/test/${report.testId}`}
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
          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-70">
            <Clock size={64} className="text-slate-400 dark:text-slate-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">No Recent Exams</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">You haven't attempted any tests recently.</p>
            <Link to="/" className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20">
              Browse Subjects
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
