import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Play, Check, Copy, FolderPlus, X, Sparkles, Database, Edit3, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../../types/cbtMaker';
import { subjects, categories, CBTTest } from '../../data/cbtData';
import { useCBTData } from '../../hooks/useCBTData';
import { triggerHtmlDownload } from '../../utils/cbtCompiler';

interface ImportToAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  compiledHtml: string;
  filename: string;
  appState: AppState;
  onUpdateTitle?: (newTitle: string) => void;
}

export default function ImportToAppModal({
  isOpen,
  onClose,
  compiledHtml,
  filename,
  appState,
  onUpdateTitle
}: ImportToAppModalProps) {
  const navigate = useNavigate();
  const { addLocalTest } = useCBTData();

  const [examTitle, setExamTitle] = useState<string>(appState.examTitle || 'Custom CBT Test');
  const [downloadFilename, setDownloadFilename] = useState<string>(
    filename || `${(appState.examTitle || 'CBT_Exam').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`
  );

  const [subject, setSubject] = useState<string>(subjects[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const [category, setCategory] = useState<string>(categories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [importedId, setImportedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate statistics
  let totalQuestions = 0;
  let totalMarks = 0;
  appState.sections.forEach(s => {
    const qCount = (appState.questionsBySection[s.name] || []).length;
    totalQuestions += qCount;
    totalMarks += qCount * s.marks;
  });

  const fileSizeKB = Math.round(new Blob([compiledHtml]).size / 1024);

  const finalSubject = isCustomSubject && customSubject.trim() ? customSubject.trim() : subject;
  const finalCategory = (isCustomCategory && customCategory.trim() ? customCategory.trim() : category) as any;
  const finalTitle = examTitle.trim() || appState.examTitle || 'Custom CBT Test';

  const handleImportToHub = async () => {
    setIsImporting(true);
    try {
      if (onUpdateTitle && finalTitle !== appState.examTitle) {
        onUpdateTitle(finalTitle);
      }

      const newId = `local_cbt_${Date.now()}`;
      const newTest: CBTTest = {
        id: newId,
        title: finalTitle,
        subject: finalSubject,
        category: finalCategory,
        duration: `${appState.duration || 90} Mins`,
        totalQuestions,
        totalMarks,
        marksCorrect: appState.sections[0]?.marks || 4,
        marksWrong: appState.sections[0]?.negative || 1,
        isLocal: true,
        dateAdded: new Date().toISOString()
      };

      await addLocalTest(newTest, compiledHtml);
      setImportedId(newId);
    } catch (err) {
      console.error('Failed to import CBT test', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownload = () => {
    const cleanFilename = downloadFilename.endsWith('.html') ? downloadFilename : `${downloadFilename}.html`;
    triggerHtmlDownload(cleanFilename, compiledHtml);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl flex flex-col max-h-[92vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                {importedId ? 'Test Successfully Imported!' : 'Rename, Save & Import Test'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {importedId
                  ? 'Your test is now live in your CBT Hub library and ready to take offline.'
                  : 'Customize test name, filename, subject, and category before saving.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {importedId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Check size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{finalTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Stored under <span className="font-semibold text-blue-600 dark:text-blue-400">{finalSubject}</span> &bull;{' '}
                  <span className="font-semibold">{finalCategory}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/test/${importedId}`);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Play size={18} />
                  <span>Launch Exam in CBT Hub</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                >
                  <Download size={16} />
                  <span>Download .HTML File</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Editable Exam Title */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Edit3 size={14} className="text-blue-500" />
                  <span>CBT Exam Name / Title (Editable)</span>
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={e => {
                    setExamTitle(e.target.value);
                    setDownloadFilename(`${e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`);
                  }}
                  placeholder="e.g. NEET 2026 Botany Mock Test 01"
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Editable Download Filename */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <FileCode size={14} className="text-slate-500" />
                  <span>Export HTML Filename</span>
                </label>
                <input
                  type="text"
                  value={downloadFilename}
                  onChange={e => setDownloadFilename(e.target.value)}
                  placeholder="e.g. NEET_Botany_Test.html"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Test summary card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">{finalTitle}</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {totalQuestions} Questions &bull; {appState.sections.length} Sections &bull; {appState.duration} Mins
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{fileSizeKB} KB</div>
                  <div className="text-slate-400 text-[11px]">100% Offline Ready</div>
                </div>
              </div>

              {/* Destination Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Target Subject (Location in CBT Hub)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSubject(s);
                        setIsCustomSubject(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        !isCustomSubject && subject === s
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomSubject(true)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      isCustomSubject
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    + Custom Subject
                  </button>
                </div>
                {isCustomSubject && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    placeholder="Enter custom subject name (e.g. Mathematics)"
                    className="mt-2 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                )}
              </div>

              {/* Destination Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Target Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCategory(c);
                        setIsCustomCategory(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        !isCustomCategory && category === c
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions note */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
                <Database size={16} className="shrink-0" />
                <span>Importing saves this test locally on your device so you can take it or manage it anytime from the Subject view.</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!importedId && (
          <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <Download size={14} />
                <span>Download HTML</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleImportToHub}
                disabled={isImporting}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <FolderPlus size={16} />
                <span>{isImporting ? 'Importing...' : 'Import to CBT Hub'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
