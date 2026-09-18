import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import { useReports } from '../hooks/useReports';
import { useCBTData } from '../hooks/useCBTData';
import { useNavigate, Link } from 'react-router-dom';
import { Target, Percent, Clock } from 'lucide-react';
import { CBTTest } from '../data/cbtData';
import { StartExamModal } from '../components/StartExamModal';

export default function RecentTestsView() {
  const { reports } = useReports();
  const { tests } = useCBTData();
  const navigate = useNavigate();
  const [selectedTestToStart, setSelectedTestToStart] = useState<CBTTest | null>(null);
  
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
      <Header title="Recent Exams" showBack onBack={() => navigate('/')} />
      
      <main className="flex-1 w-full px-3 py-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto xl:max-w-[90rem]">
        {recentExams.length > 0 ? (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {recentExams.map((report) => {
              const targetTest = tests.find(t => t.id === report.testId) || {
                id: report.testId,
                title: report.testTitle,
                subject: report.subject,
                category: 'Practice Sets' as const,
                dateAdded: report.date
              };

              return (
                <button 
                  key={report.id} 
                  type="button"
                  onClick={() => setSelectedTestToStart(targetTest)}
                  className="group relative text-left overflow-hidden bg-white dark:bg-slate-800/90 border border-blue-100/90 dark:border-blue-800/50 rounded-2xl flex flex-col p-3.5 sm:p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-200 min-h-[120px] sm:min-h-[135px]"
                >
                  <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-1.5 w-full">
                    <p className="text-[10px] sm:text-[11px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider truncate">
                      {report.subject}
                    </p>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap ml-2">
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 w-full leading-snug mb-2.5 flex-1">
                    {report.testTitle}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 w-full">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Target size={12} className="text-blue-500" />
                        <span className="text-[11px] sm:text-xs font-semibold">{report.score}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Percent size={12} className="text-emerald-500" />
                        <span className="text-[11px] sm:text-xs font-semibold">{report.accuracy}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock size={11} />
                      <span className="text-[10px] sm:text-[11px] font-medium">{report.time}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-16 opacity-70">
            <Clock size={56} className="text-slate-400 dark:text-slate-500 mb-3" />
            <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300">No Recent Exams</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">You haven't attempted any tests recently.</p>
            <Link to="/" className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-md shadow-blue-500/20">
              Browse Subjects
            </Link>
          </div>
        )}
      </main>

      {/* Start Exam Confirmation Modal */}
      <StartExamModal
        isOpen={Boolean(selectedTestToStart)}
        onClose={() => setSelectedTestToStart(null)}
        onConfirm={() => {
          if (selectedTestToStart) {
            const id = selectedTestToStart.id;
            setSelectedTestToStart(null);
            navigate(`/test/${id}`);
          }
        }}
        test={selectedTestToStart}
      />
    </div>
  );
}
