import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { subjects, categories, Subject, Category, CBTTest } from '../data/cbtData';
import { useCBTData } from '../hooks/useCBTData';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Upload, X, Leaf, Dna, Activity, FlaskConical, Microscope, Clock, Percent, Target, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import { useReports } from '../hooks/useReports';

export default function Home() {
  const { tests, addLocalTest } = useCBTData();
  const { reports } = useReports();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSubject, setUploadSubject] = useState<Subject | ''>('');
  const [uploadCategory, setUploadCategory] = useState<Category | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group unique tests in reports by their most recent attempt
  const recentExams = useMemo(() => {
    const uniqueMap = new Map();
    reports.forEach(r => {
      if (!uniqueMap.has(r.testId)) {
        uniqueMap.set(r.testId, r);
      }
    });
    return Array.from(uniqueMap.values()).slice(0, 3);
  }, [reports]);

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Botany': return <Leaf size={48} className="text-emerald-400/30 dark:text-emerald-500/20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />;
      case 'Zoology': return <Dna size={48} className="text-rose-400/30 dark:text-rose-500/20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />;
      case 'Physics': return <Activity size={48} className="text-blue-400/30 dark:text-blue-500/20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />;
      case 'Chemistry': return <FlaskConical size={48} className="text-amber-400/30 dark:text-amber-500/20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />;
      default: return <Microscope size={48} className="text-indigo-400/30 dark:text-indigo-500/20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadSubject || !uploadCategory) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const match = content.match(/<title>(.*?)<\/title>/i);
      const title = match ? match[1] : file.name.replace('.html', '');
      
      const durationMatch = content.match(/duration\s*:\s*(\d+)/i) || content.match(/Duration:?\s*(\d+)\s*(mins?|minutes?)/i);
      let durationStr = '180 Mins';
      if (durationMatch && durationMatch[1]) {
        durationStr = `${durationMatch[1]} Mins`;
      }

      const newTest: CBTTest = {
        id: 'local_' + Date.now(),
        title,
        subject: uploadSubject as Subject,
        category: uploadCategory as Category,
        dateAdded: new Date().toISOString(),
        isLocal: true,
        duration: durationStr
      };

      await addLocalTest(newTest, content);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsUploadModalOpen(false);
      setUploadSubject('');
      setUploadCategory('');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 bg-transparent flex flex-col font-sans transition-colors">
      <Header title="CBT TEST" />
      
      <main className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8 mx-auto xl:max-w-[90rem] mb-12">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Subjects</h2>
          <div className="flex items-center gap-3">
            <Link 
              to="/reports"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-md shadow-emerald-500/20"
            >
              <span className="text-lg">📊</span>
              <span>Reports</span>
            </Link>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md shadow-blue-500/20"
            >
              <Upload size={18} />
              <span>Upload Test</span>
            </button>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-2">
          {subjects.map((subject) => (
            <Link 
              key={subject} 
              to={`/subject/${subject.toLowerCase()}`}
              className="relative overflow-hidden aspect-[16/9] sm:aspect-[4/3] rounded-3xl flex items-end p-4 sm:p-6 lg:p-8 group shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 dark:shadow-black/40 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
              
              {/* Decorative Icon */}
              {getSubjectIcon(subject)}

              <h2 className="relative text-lg sm:text-2xl lg:text-4xl font-extrabold text-white truncate w-full tracking-tight drop-shadow-md z-10">
                {subject}
              </h2>
            </Link>
          ))}
        </div>

        {/* Recent Tests */}
        {recentExams.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
                Recent Exams
              </h2>
              <Link 
                to="/recent"
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View More <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        )}
      </main>
      <Footer />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Upload Local Test</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setUploadSubject(s)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${uploadSubject === s ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setUploadCategory(c)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${uploadCategory === c ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-700">
                <input 
                  type="file" 
                  accept=".html" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  disabled={!uploadSubject || !uploadCategory}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors ${(!uploadSubject || !uploadCategory) ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}`}
                >
                  <Upload size={18} />
                  <span>Select HTML File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
