import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Header from '../components/Header';
import { CBTTest } from '../data/cbtData';
import { useCBTData } from '../hooks/useCBTData';
import { useSubjectCategories } from '../hooks/useSubjectCategories';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Upload, X, Leaf, Dna, Activity, FlaskConical, Microscope, Clock, Percent, Target, ArrowRight, Edit3, Check, Sparkles, Database, Calculator, BookOpen, GraduationCap, Layers } from 'lucide-react';
import Footer from '../components/Footer';
import { useReports } from '../hooks/useReports';
import { StartExamModal } from '../components/StartExamModal';

interface PendingImportData {
  title: string;
  rawContent: string;
  subject: string;
  category: string;
  durationStr: string;
  totalQuestions: number;
  totalMarks: number;
  marksCorrect: number;
  marksWrong: number;
}

export default function Home() {
  const { tests, addLocalTest } = useCBTData();
  const { reports } = useReports();
  const { subjects, getCategoriesForSubject, addSubject } = useSubjectCategories();
  const navigate = useNavigate();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTestToStart, setSelectedTestToStart] = useState<CBTTest | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pending Import State for Renaming before saving
  const [pendingImport, setPendingImport] = useState<PendingImportData | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
    const lower = subject.toLowerCase();
    if (lower.includes('botan')) return <Leaf size={22} className="text-white drop-shadow-sm" />;
    if (lower.includes('zool')) return <Dna size={22} className="text-white drop-shadow-sm" />;
    if (lower.includes('physic')) return <Activity size={22} className="text-white drop-shadow-sm" />;
    if (lower.includes('chem')) return <FlaskConical size={22} className="text-white drop-shadow-sm" />;
    if (lower.includes('math')) return <Calculator size={22} className="text-white drop-shadow-sm" />;
    if (lower.includes('eng') || lower.includes('lit')) return <BookOpen size={22} className="text-white drop-shadow-sm" />;
    if (lower.includes('bio')) return <Dna size={22} className="text-white drop-shadow-sm" />;
    return <Layers size={22} className="text-white drop-shadow-sm" />;
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      let content = evt.target?.result as string;
      const match = content.match(/<title>(.*?)<\/title>/i);
      const title = match ? match[1].trim() : file.name.replace('.html', '');
      
      const durationMatch = content.match(/EXAM_DURATION_MINS\s*=\s*(\d+)/) || 
                            content.match(/duration\s*:\s*(\d+)/i) || 
                            content.match(/Duration:?\s*(\d+)\s*(mins?|minutes?)/i);
      let durationStr = '90 Mins';
      if (durationMatch && durationMatch[1]) {
        durationStr = `${durationMatch[1]} Mins`;
      }

      // Strip external KaTeX CDN stylesheets and scripts from uploaded HTML to guarantee offline execution
      content = content.replace(/<link[^>]*href=["'][^"']*(?:katex|cdn\.jsdelivr|cdnjs\.cloudflare)[^"']*["'][^>]*>/gi, '');
      content = content.replace(/<script[^>]*src=["'][^"']*(?:katex|auto-render|cdn\.jsdelivr|cdnjs\.cloudflare)[^"']*["'][^>]*>\s*<\/script>/gi, '');
      content = content.replace(/window\.mathRenderEngine\s*=\s*['"](?:katex_online|mathml|html_fallback)['"]/g, "window.mathRenderEngine = 'katex_local'");

      // Parse question bank for accurate question count and marks
      let totalQuestions = 0;
      let marksCorrect = 4;
      let marksWrong = 1;

      const qBankMatch = content.match(/const\s+QUESTION_BANK\s*=\s*(\[[\s\S]*?\]);\s*(?:const|let|var|function|\/\/|\/\*|<)/);
      if (qBankMatch) {
        try {
          const qb = JSON.parse(qBankMatch[1]);
          for (const sec of qb) {
            const qCount = sec.questions ? sec.questions.length : 0;
            totalQuestions += qCount;
            if (sec.marksCorrect !== undefined) marksCorrect = sec.marksCorrect;
            if (sec.marksWrong !== undefined) marksWrong = sec.marksWrong;
          }
        } catch {
          // fallback if parsing fails
        }
      }

      // Fallback question counting by question ID pattern
      if (totalQuestions === 0) {
        const idMatches = content.match(/"id"\s*:\s*\d+/g);
        if (idMatches && idMatches.length > 0) {
          totalQuestions = idMatches.length;
        } else {
          totalQuestions = 45;
        }
      }

      const totalMarks = totalQuestions * marksCorrect;

      // Guess initial subject from title or content
      let guessedSubject: string = subjects[0] || 'Botany';
      const lower = (title + ' ' + file.name).toLowerCase();
      for (const s of subjects) {
        if (lower.includes(s.toLowerCase())) {
          guessedSubject = s;
          break;
        }
      }

      const availableCats = getCategoriesForSubject(guessedSubject);

      setPendingImport({
        title,
        rawContent: content,
        subject: guessedSubject,
        category: availableCats[0] || 'Kattar Tests',
        durationStr,
        totalQuestions,
        totalMarks,
        marksCorrect,
        marksWrong
      });
      setIsUploadModalOpen(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveImportedExam = async () => {
    if (!pendingImport) return;
    setIsImporting(true);
    try {
      const finalSubject = isCustomSubject && customSubject.trim() ? customSubject.trim() : pendingImport.subject;
      if (isCustomSubject && customSubject.trim()) {
        addSubject(customSubject.trim());
      }

      const newTest: CBTTest = {
        id: 'local_' + Date.now(),
        title: pendingImport.title.trim() || 'Custom CBT Test',
        subject: finalSubject,
        category: pendingImport.category,
        dateAdded: new Date().toISOString(),
        isLocal: true,
        duration: pendingImport.durationStr,
        totalQuestions: pendingImport.totalQuestions,
        totalMarks: pendingImport.totalMarks,
        marksCorrect: pendingImport.marksCorrect,
        marksWrong: pendingImport.marksWrong
      };

      await addLocalTest(newTest, pendingImport.rawContent);
      setIsUploadModalOpen(false);
      setPendingImport(null);
      setCustomSubject('');
      setIsCustomSubject(false);
    } catch (err) {
      console.error('Failed to import test:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent flex flex-col font-sans transition-colors">
      <Header title="CBT Test" isHome={true} />
      
      <main className="w-full px-3 py-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 mx-auto xl:max-w-[90rem]">
        {/* Header with Subjects, Reports, and Upload Test on one single line */}
        <div className="flex items-center justify-between gap-2 flex-nowrap w-full">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 shrink-0">Subjects</h2>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link 
              to="/reports"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 whitespace-nowrap"
            >
              <span className="text-sm sm:text-base">📊</span>
              <span>Reports</span>
            </Link>
            
            <input 
              type="file" 
              accept=".html" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelected} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-blue-500/20 whitespace-nowrap"
            >
              <Upload size={15} />
              <span>Import HTML Test</span>
            </button>
          </div>
        </div>

        {/* Subject Grid - Equal compact dimensions, no wrapping, clearly visible graphics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {subjects.map((subject) => (
            <Link 
              key={subject} 
              to={`/subject/${subject.toLowerCase()}`}
              className="relative overflow-hidden h-20 min-[400px]:h-22 sm:h-28 md:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-4 group shadow-md shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 dark:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-95 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />
              
              <h2 className="relative text-sm min-[380px]:text-base sm:text-xl lg:text-2xl font-extrabold text-white whitespace-nowrap tracking-tight drop-shadow-sm z-10 select-none">
                {subject}
              </h2>

              {/* Clearly visible decorative graphic badge */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 min-[400px]:w-9 min-[400px]:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 text-white shadow-inner group-hover:scale-105 transition-transform shrink-0 ml-2">
                {getSubjectIcon(subject)}
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Tests */}
        <div className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
              Recent Exams
            </h2>
            {recentExams.length > 0 && (
              <Link 
                to="/recent"
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View More <ArrowRight size={15} />
              </Link>
            )}
          </div>
          
          {recentExams.length > 0 ? (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
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
                    className="group relative text-left overflow-hidden bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex flex-col p-3.5 sm:p-5 shadow-md shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-1.5 w-full">
                      <p className="text-[11px] sm:text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider truncate">
                        {report.subject}
                      </p>
                      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap ml-2">
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 w-full leading-snug mb-2.5 sm:mb-4 flex-1">
                      {report.testTitle}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700/50 w-full">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Target size={13} className="text-blue-500" />
                          <span className="text-xs sm:text-sm font-semibold">{report.score}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Percent size={13} className="text-emerald-500" />
                          <span className="text-xs sm:text-sm font-semibold">{report.accuracy}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] sm:text-xs font-medium">{report.time}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="w-full bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[200px]">
              <Activity size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 mb-1.5">No Recent Exams</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                When you complete a test, your analytics and score reports will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

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

      {/* Import & Rename Confirmation Modal */}
      {isUploadModalOpen && pendingImport && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    Import CBT HTML File
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and rename the exam before saving to your library.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setPendingImport(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Editable Test Title */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Edit3 size={14} className="text-blue-500" />
                <span>Exam Title / Name (Editable)</span>
              </label>
              <input
                type="text"
                value={pendingImport.title}
                onChange={e => setPendingImport({ ...pendingImport, title: e.target.value })}
                placeholder="Enter exam title..."
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Detected Details */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Duration</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pendingImport.durationStr}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Questions</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{pendingImport.totalQuestions} Qs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Marks</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{pendingImport.totalMarks} M</span>
              </div>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Destination Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {subjects.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const nextCats = getCategoriesForSubject(s);
                      setPendingImport({ 
                        ...pendingImport, 
                        subject: s,
                        category: nextCats[0] || 'Kattar Tests'
                      });
                      setIsCustomSubject(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      !isCustomSubject && pendingImport.subject === s
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Destination Category
              </label>
              <div className="flex flex-wrap gap-2">
                {getCategoriesForSubject(pendingImport.subject).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPendingImport({ ...pendingImport, category: c })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      pendingImport.category === c
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setPendingImport(null);
                }}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveImportedExam}
                disabled={isImporting}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Check size={16} />
                <span>{isImporting ? 'Saving...' : 'Save to CBT Hub'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
