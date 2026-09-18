import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useReports } from '../hooks/useReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, Check } from 'lucide-react';

export default function ReportsView() {
  const navigate = useNavigate();
  const { reports, clearAllReports } = useReports();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Group by test ID for specific test graphs, or just show overall accuracy graph
  const chartData = [...reports].reverse().map((report, idx) => ({
    name: format(new Date(report.date), 'MMM d, HH:mm'),
    accuracy: report.accuracy,
    score: report.score,
    title: report.testTitle
  }));

  const overallAccuracy = reports.length > 0 
    ? (reports.reduce((acc, curr) => acc + curr.accuracy, 0) / reports.length).toFixed(1)
    : 0;

  return (
    <div className="flex-1 bg-transparent flex flex-col font-sans transition-colors">
      <Header title="Your Reports" showBack onBack={() => navigate('/')} />
      
      <main className="flex-1 w-full p-3 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8 mx-auto xl:max-w-[90rem]">
        {reports.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-slate-700/50">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium">No reports available yet.</p>
            <p className="text-sm opacity-70 mt-1">Complete a test to see your performance analysis.</p>
          </div>
        ) : (
          <>
            {/* Top Stats - 2 columns on small tablet/portrait, 3 on desktop */}
            <div className="grid grid-cols-2 min-[640px]:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm flex flex-col justify-center">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Total Exams</span>
                <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{reports.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm flex flex-col justify-center">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Overall Accuracy</span>
                <span className="text-2xl sm:text-3xl font-bold text-emerald-500 mt-1">{overallAccuracy}%</span>
              </div>
              <div className="col-span-2 min-[640px]:col-span-1 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm flex flex-row min-[640px]:flex-col justify-between min-[640px]:justify-center items-center min-[640px]:items-start gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Actions</span>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={async () => {
                        await clearAllReports();
                        setConfirmDelete(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Check size={14} /> Yes, Delete All
                    </button>
                    <button 
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                  >
                    <Trash2 size={15} /> Clear All History
                  </button>
                )}
              </div>
            </div>

            {/* Performance Graph */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Accuracy Trend</h3>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-blue-100 dark:border-blue-800/50 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-blue-100 dark:border-slate-700/50">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Detailed History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Date</th>
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Exam Title</th>
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Score</th>
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Accuracy</th>
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Attempted</th>
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{format(new Date(report.date), 'MMM d, yyyy HH:mm')}</td>
                        <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-200">{report.testTitle}</td>
                        <td className="p-4 text-sm font-bold text-blue-600 dark:text-blue-400">{report.score}</td>
                        <td className="p-4 text-sm font-medium text-emerald-500">{report.accuracy}%</td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-500">{report.correct}</span> / <span className="text-red-500">{report.wrong}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{report.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
