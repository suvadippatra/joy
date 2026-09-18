import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Settings,
  Download,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Crop as CropIcon,
  Check,
  Eye,
  EyeOff,
  Code,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Hash,
  Layers,
  ArrowLeft,
  Edit2,
  Search,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { AppState, defaultAppState, Question, QuestionType } from '../types/cbtMaker';
import { compileCBTHTML } from '../utils/cbtCompiler';
import ImageCropperModal from '../components/maker/ImageCropperModal';
import AIPromptModal from '../components/maker/AIPromptModal';
import PasteImportModal from '../components/maker/PasteImportModal';
import ExamSettingsModal from '../components/maker/ExamSettingsModal';
import ImportToAppModal from '../components/maker/ImportToAppModal';
import QuestionLivePreview from '../components/maker/QuestionLivePreview';
import LaTeXGuideModal from '../components/maker/LaTeXGuideModal';
import AutoExpandingTextarea from '../components/maker/AutoExpandingTextarea';

export default function CBTMaker() {
  const navigate = useNavigate();

  // Load draft from localStorage or fallback to default
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('cbt_maker_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sections && parsed.sections.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load cbt_maker_draft', e);
    }
    return defaultAppState;
  });

  // Screen size awareness to prevent responsive layout bugs on tablets & small screens
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1150 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1150);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Current active section & question selection
  const [activeSectionName, setActiveSectionName] = useState<string>(() => {
    return appState.sections[0]?.name || 'Section 1';
  });
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Responsive View Toggle for small devices & preview resizing
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showPreviewPane, setShowPreviewPane] = useState<boolean>(true);
  const [previewWidthPercent, setPreviewWidthPercent] = useState<number>(45);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);

  // Mouse & Touch event listeners for divider dragging
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const totalWidth = window.innerWidth;
      const previewWidth = totalWidth - clientX;
      const pct = Math.round((previewWidth / totalWidth) * 100);
      const clamped = Math.max(25, Math.min(75, pct));
      setPreviewWidthPercent(clamped);
    };

    const handlePointerUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [isDraggingSplitter]);

  // Quick jump & inline section renaming state
  const [editingSection, setEditingSection] = useState<{ oldName: string; currentVal: string } | null>(null);
  const [jumpQVal, setJumpQVal] = useState<string>('');

  // Modals state
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isPasteImportOpen, setIsPasteImportOpen] = useState(false);
  const [isExamSettingsOpen, setIsExamSettingsOpen] = useState(false);
  const [isImportToAppOpen, setIsImportToAppOpen] = useState(false);
  const [isLaTeXGuideOpen, setIsLaTeXGuideOpen] = useState(false);

  // Collapsible auxiliary panels for active question (diagram, table, explanation)
  const [openAux, setOpenAux] = useState<{ diagram: boolean; table: boolean; explanation: boolean }>({
    diagram: false,
    table: false,
    explanation: false
  });

  // Image Cropper modal state
  const [cropperData, setCropperData] = useState<{
    isOpen: boolean;
    imageSrc: string;
    target: 'question' | { optionIndex: number };
  }>({
    isOpen: false,
    imageSrc: '',
    target: 'question'
  });

  // Compiled Test storage for download / import
  const [compiledResult, setCompiledResult] = useState<{ html: string; filename: string } | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('cbt_maker_draft', JSON.stringify(appState));
      } catch (e) {
        console.error('Failed to auto-save cbt_maker_draft', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [appState]);

  // Ensure activeSection exists
  useEffect(() => {
    if (!appState.sections.some(s => s.name === activeSectionName)) {
      if (appState.sections[0]) {
        setActiveSectionName(appState.sections[0].name);
        setActiveQuestionIndex(0);
      }
    }
  }, [appState.sections, activeSectionName]);

  const activeSection = appState.sections.find(s => s.name === activeSectionName) || appState.sections[0];
  const questionsInCurrentSection = appState.questionsBySection[activeSection?.name || ''] || [];
  const activeQuestion = questionsInCurrentSection[activeQuestionIndex] || null;

  // Question update helper
  const updateCurrentQuestion = (updates: Partial<Question>) => {
    if (!activeSection) return;
    const secName = activeSection.name;
    const currentList = [...(appState.questionsBySection[secName] || [])];
    if (!currentList[activeQuestionIndex]) return;

    currentList[activeQuestionIndex] = {
      ...currentList[activeQuestionIndex],
      ...updates
    };

    setAppState(prev => ({
      ...prev,
      questionsBySection: {
        ...prev.questionsBySection,
        [secName]: currentList
      }
    }));
  };

  // Add Question
  const handleAddQuestion = () => {
    if (!activeSection) return;
    const secName = activeSection.name;
    const currentList = [...(appState.questionsBySection[secName] || [])];
    const newQ: Question = {
      id: currentList.length + 1,
      type: 'MCQ',
      text: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0,
      correctNat: '',
      image: '',
      table: ''
    };
    const newList = [...currentList, newQ];
    setAppState(prev => ({
      ...prev,
      questionsBySection: {
        ...prev.questionsBySection,
        [secName]: newList
      }
    }));
    setActiveQuestionIndex(newList.length - 1);
  };

  // Duplicate Question
  const handleDuplicateQuestion = (indexToDup: number = activeQuestionIndex) => {
    if (!activeSection) return;
    const secName = activeSection.name;
    const currentList = [...(appState.questionsBySection[secName] || [])];
    const sourceQ = currentList[indexToDup];
    if (!sourceQ) return;

    const dupQ: Question = {
      ...sourceQ,
      id: currentList.length + 1,
      text: sourceQ.text,
      options: [...(sourceQ.options || [])]
    };

    const newList = [...currentList];
    newList.splice(indexToDup + 1, 0, dupQ);

    setAppState(prev => ({
      ...prev,
      questionsBySection: {
        ...prev.questionsBySection,
        [secName]: newList
      }
    }));
    setActiveQuestionIndex(indexToDup + 1);
  };

  // Delete Question
  const handleDeleteQuestion = (indexToDel: number = activeQuestionIndex) => {
    if (!activeSection) return;
    const secName = activeSection.name;
    const currentList = [...(appState.questionsBySection[secName] || [])];
    if (currentList.length <= 1) {
      alert('A section must have at least one question.');
      return;
    }

    const delIdx = indexToDel;
    const newList = currentList.filter((_, idx) => idx !== delIdx);

    setAppState(prev => ({
      ...prev,
      questionsBySection: {
        ...prev.questionsBySection,
        [secName]: newList
      }
    }));
    setActiveQuestionIndex(Math.min(delIdx, newList.length - 1));
  };

  // Move Question Up/Down
  const handleMoveQuestion = (direction: 'up' | 'down', fromIdx: number = activeQuestionIndex) => {
    if (!activeSection) return;
    const secName = activeSection.name;
    const currentList = [...(appState.questionsBySection[secName] || [])];
    const targetIndex = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const temp = currentList[fromIdx];
    currentList[fromIdx] = currentList[targetIndex];
    currentList[targetIndex] = temp;

    setAppState(prev => ({
      ...prev,
      questionsBySection: {
        ...prev.questionsBySection,
        [secName]: currentList
      }
    }));
    setActiveQuestionIndex(targetIndex);
  };

  // Add Section
  const handleAddSection = () => {
    const secNumber = appState.sections.length + 1;
    const newName = `Section ${secNumber}`;
    const newSec = {
      name: newName,
      marks: 4,
      negative: 1,
      maxAttempts: 0
    };
    const initialQ: Question = {
      id: 1,
      type: 'MCQ',
      text: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0,
      correctNat: '',
      image: '',
      table: ''
    };
    setAppState(prev => ({
      ...prev,
      sections: [...prev.sections, newSec],
      questionsBySection: {
        ...prev.questionsBySection,
        [newName]: [initialQ]
      }
    }));
    setActiveSectionName(newName);
    setActiveQuestionIndex(0);
  };

  // Delete Section
  const handleDeleteSection = (secNameToDelete: string) => {
    if (appState.sections.length <= 1) {
      alert('You must have at least one section.');
      return;
    }
    if (!confirm(`Delete ${secNameToDelete} and all its questions?`)) return;

    const remainingSecs = appState.sections.filter(s => s.name !== secNameToDelete);
    const updatedQs = { ...appState.questionsBySection };
    delete updatedQs[secNameToDelete];

    setAppState(prev => ({
      ...prev,
      sections: remainingSecs,
      questionsBySection: updatedQs
    }));
    setActiveSectionName(remainingSecs[0].name);
    setActiveQuestionIndex(0);
  };

  // Rename Section
  const handleRenameSection = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    if (appState.sections.some(s => s.name.toLowerCase() === trimmed.toLowerCase() && s.name !== oldName)) {
      alert('A section with this name already exists.');
      return;
    }
    const updatedSecs = appState.sections.map(s => (s.name === oldName ? { ...s, name: trimmed } : s));
    const updatedQs = { ...appState.questionsBySection };
    updatedQs[trimmed] = updatedQs[oldName] || [];
    delete updatedQs[oldName];

    setAppState(prev => ({
      ...prev,
      sections: updatedSecs,
      questionsBySection: updatedQs
    }));
    if (activeSectionName === oldName) {
      setActiveSectionName(trimmed);
    }
  };

  // Reset / Clear Draft to 1 Section & 1 Blank Question
  const handleResetDraft = () => {
    if (window.confirm("Clear all questions? This will reset the editor to 1 section with 1 blank question.")) {
      try {
        localStorage.removeItem('cbt_maker_draft');
      } catch (e) {
        console.error(e);
      }
      const freshSection = { name: "Section 1", marks: 4, negative: 1, maxAttempts: 0 };
      const freshQ: Question = {
        id: 1,
        type: 'MCQ',
        text: '',
        options: ['', '', '', ''],
        correct: 0,
        correctNat: '',
        image: '',
        table: '',
        explanation: ''
      };
      setAppState({
        ...defaultAppState,
        examTitle: "New CBT Test",
        examSubtitle: "",
        sections: [freshSection],
        questionsBySection: {
          "Section 1": [freshQ]
        }
      });
      setActiveSectionName("Section 1");
      setActiveQuestionIndex(0);
    }
  };

  // Load Demo CBT Showcase
  const handleLoadDemo = () => {
    if (window.confirm("Load sample demo CBT? This will populate a multi-section test with diagrams, tables, and math questions.")) {
      setAppState({ ...defaultAppState });
      setActiveSectionName(defaultAppState.sections[0].name);
      setActiveQuestionIndex(0);
    }
  };

  // Open Image Cropper for Question or Option
  const handleImageFilePicked = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'question' | { optionIndex: number }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const src = evt.target?.result as string;
      setCropperData({
        isOpen: true,
        imageSrc: src,
        target
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Clean parser for option text and embedded image marker
  const parseOptionData = (rawOption: string) => {
    const raw = rawOption || '';
    const match = raw.match(/\|\|IMG:([\s\S]+?)\|\|/);
    const image = match ? match[1].trim() : null;
    const text = raw.replace(/\|\|IMG:([\s\S]+?)\|\|/g, '').trim();
    return { text, image, rawMatch: match ? match[0] : null };
  };

  // Crop Completed handler
  const handleCropComplete = (croppedBase64: string) => {
    if (cropperData.target === 'question') {
      updateCurrentQuestion({ image: croppedBase64 });
    } else {
      const optIdx = cropperData.target.optionIndex;
      if (!activeQuestion) return;
      const currentOpts = [...(activeQuestion.options || [])];
      const { text } = parseOptionData(currentOpts[optIdx]);
      currentOpts[optIdx] = text ? `${text} ||IMG:${croppedBase64}||` : `||IMG:${croppedBase64}||`;
      updateCurrentQuestion({ options: currentOpts });
    }
  };

  // Remove image from an option
  const handleRemoveOptionImage = (optIndex: number) => {
    if (!activeQuestion) return;
    const currentOpts = [...(activeQuestion.options || [])];
    const { text } = parseOptionData(currentOpts[optIndex]);
    currentOpts[optIndex] = text;
    updateCurrentQuestion({ options: currentOpts });
  };

  // Open cropper modal to re-crop existing option image
  const handleEditOptionImage = (optIndex: number) => {
    if (!activeQuestion) return;
    const currentOpts = [...(activeQuestion.options || [])];
    const { image } = parseOptionData(currentOpts[optIndex]);
    if (image) {
      setCropperData({
        isOpen: true,
        imageSrc: image,
        target: { optionIndex: optIndex }
      });
    }
  };

  // Math insertion snippet tool
  const insertMathSnippet = (snippet: string) => {
    if (!activeQuestion) return;
    updateCurrentQuestion({ text: (activeQuestion.text || '') + snippet });
  };

  // Compile Handler
  const handleCompileAndExport = async () => {
    setIsCompiling(true);
    try {
      const res = await compileCBTHTML(appState);
      setCompiledResult(res);
      setIsImportToAppOpen(true);
    } catch (err: any) {
      alert(`Error compiling test: ${err.message || err}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // Render helper for Question Statement & Tools Card
  const renderQuestionStatementCard = () => {
    if (!activeQuestion) return null;
    return (
      <div className="space-y-4 w-full">
        {/* Question Type & Marks Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Left: Type Switcher with short labels (SCQ, MCQ, NAT) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
              Q{activeQuestionIndex + 1}:
            </span>
            {(['MCQ', 'MSQ', 'NAT'] as QuestionType[]).map(t => {
              const label = t === 'MCQ' ? 'SCQ' : t === 'MSQ' ? 'MCQ' : 'NAT';
              const titleDesc =
                t === 'MCQ'
                  ? 'Single Choice Question (SCQ - Single correct option)'
                  : t === 'MSQ'
                  ? 'Multiple Choice Question (MCQ - Multiple correct options)'
                  : 'Numerical Answer Type (NAT - Virtual numeric pad input)';

              return (
                <button
                  key={t}
                  type="button"
                  title={titleDesc}
                  onClick={() => {
                    if (t === 'NAT') {
                      updateCurrentQuestion({ type: t, options: [], correctNat: '' });
                    } else if (t === 'MSQ') {
                      updateCurrentQuestion({
                        type: t,
                        options: activeQuestion.options?.length ? activeQuestion.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                        correct: [0]
                      });
                    } else {
                      updateCurrentQuestion({
                        type: t,
                        options: activeQuestion.options?.length ? activeQuestion.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                        correct: 0
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all touch-manipulation ${
                    activeQuestion.type === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right: Custom Question Marks Override */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">+Marks:</span>
              <input
                type="number"
                step="any"
                value={activeQuestion.marksCorrect !== undefined ? activeQuestion.marksCorrect : ''}
                placeholder={String(activeSection?.marks ?? 4)}
                onChange={e =>
                  updateCurrentQuestion({
                    marksCorrect: e.target.value === '' ? undefined : parseFloat(e.target.value)
                  })
                }
                className="w-11 px-1.5 py-0.5 text-center font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none"
                title="Marks awarded for correct answer (leave blank to use section default)"
              />

              <span className="font-semibold text-red-500 ml-1">-Penalty:</span>
              <input
                type="number"
                step="any"
                value={activeQuestion.marksWrong !== undefined ? activeQuestion.marksWrong : ''}
                placeholder={String(activeQuestion.type === 'NAT' ? 0 : (activeSection?.negative ?? 1))}
                onChange={e =>
                  updateCurrentQuestion({
                    marksWrong: e.target.value === '' ? undefined : parseFloat(e.target.value)
                  })
                }
                className="w-11 px-1.5 py-0.5 text-center font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none"
                title="Negative penalty deducted for incorrect answer (leave blank to use section default)"
              />

              {(activeQuestion.marksCorrect !== undefined || activeQuestion.marksWrong !== undefined) && (
                <button
                  type="button"
                  onClick={() => updateCurrentQuestion({ marksCorrect: undefined, marksWrong: undefined })}
                  title="Reset to Section Default Marks"
                  className="ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Statement Box with Auto-Expanding Textarea */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Question Statement</span>
              <span className="text-[10px] font-normal text-slate-400">(Markdown & LaTeX supported)</span>
            </label>

            {/* Quick Math Formatters & Guide */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => insertMathSnippet('$x$')}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                title="Inline Math"
              >
                $x$
              </button>
              <button
                type="button"
                onClick={() => insertMathSnippet('$$\\frac{a}{b}$$')}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                title="Fraction"
              >
                \frac
              </button>
              <button
                type="button"
                onClick={() => insertMathSnippet('$$\\sqrt{x}$$')}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                title="Square Root"
              >
                \sqrt
              </button>
              <button
                type="button"
                onClick={() => insertMathSnippet('$x^2$')}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                title="Superscript / Power"
              >
                x²
              </button>
              <button
                type="button"
                onClick={() => insertMathSnippet('**bold**')}
                className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                title="Bold Text"
              >
                B
              </button>

              {/* Instant LaTeX Guide Button */}
              <button
                type="button"
                onClick={() => setIsLaTeXGuideOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 transition-colors ml-1"
                title="Open Interactive LaTeX & MathML Guide"
              >
                <BookOpen size={12} />
                <span>LaTeX Guide</span>
              </button>
            </div>
          </div>

          <AutoExpandingTextarea
            value={activeQuestion.text}
            onChange={e => updateCurrentQuestion({ text: e.target.value })}
            placeholder="Enter question text here... (Use $...$ for math, e.g. $\int x dx$ or $H_2O$)"
            className="w-full min-h-[96px] p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            minRows={3}
          />
        </div>

        {/* Compact Auxiliary Tools Row (Diagram, Table, Solution) */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Diagram Attach Button or Inline Thumbnail */}
            {activeQuestion.image ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                <div className="w-6 h-6 rounded border border-blue-300 dark:border-blue-700 overflow-hidden bg-slate-900 flex items-center justify-center shrink-0">
                  {activeQuestion.image === 'PLACEHOLDER' ? (
                    <span className="text-[8px] text-red-400 font-bold">Img</span>
                  ) : (
                    <img src={activeQuestion.image} alt="Thumb" className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Diagram Attached</span>
                <label className="cursor-pointer text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-0.5">
                  <CropIcon size={12} />
                  <span>Recrop</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageFilePicked(e, 'question')}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateCurrentQuestion({ image: '' })}
                  className="text-red-500 hover:text-red-700 ml-1"
                  title="Remove diagram"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors">
                <ImageIcon size={13} className="text-blue-500" />
                <span>+ Diagram / Figure</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageFilePicked(e, 'question')}
                />
              </label>
            )}

            {/* Table Match Toggle */}
            <button
              type="button"
              onClick={() => setOpenAux(prev => ({ ...prev, table: !prev.table }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                activeQuestion.table || openAux.table
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Code size={13} />
              <span>Table / Matrix {activeQuestion.table ? '• Added' : ''}</span>
            </button>

            {/* Solution / Explanation Toggle */}
            <button
              type="button"
              onClick={() => setOpenAux(prev => ({ ...prev, explanation: !prev.explanation }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                activeQuestion.explanation || openAux.explanation
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <HelpCircle size={13} />
              <span>Solution {activeQuestion.explanation ? '• Added' : ''}</span>
            </button>
          </div>

          {/* Table Drawer */}
          {(openAux.table || Boolean(activeQuestion.table)) && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Table Snippet / Match-the-Columns HTML
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentQuestion({
                        table: `<table class="w-full border text-xs"><thead><tr><th class="border p-1">Column I</th><th class="border p-1">Column II</th></tr></thead><tbody><tr><td class="border p-1">A. Item 1</td><td class="border p-1">P. Match 1</td></tr><tr><td class="border p-1">B. Item 2</td><td class="border p-1">Q. Match 2</td></tr></tbody></table>`
                      })
                    }
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Insert Sample Table
                  </button>
                  {activeQuestion.table && (
                    <button
                      type="button"
                      onClick={() => updateCurrentQuestion({ table: '' })}
                      className="text-red-500 hover:underline text-[11px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <AutoExpandingTextarea
                value={activeQuestion.table || ''}
                onChange={e => updateCurrentQuestion({ table: e.target.value })}
                placeholder="Optional <table>...</table> syntax or LaTeX array"
                minRows={2}
                className="w-full p-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          )}

          {/* Solution / Explanation Drawer */}
          {(openAux.explanation || Boolean(activeQuestion.explanation)) && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-emerald-500" />
                  <span>Detailed Solution / Explanation</span>
                </span>
                {activeQuestion.explanation && (
                  <button
                    type="button"
                    onClick={() => updateCurrentQuestion({ explanation: '' })}
                    className="text-red-500 hover:underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <AutoExpandingTextarea
                value={activeQuestion.explanation || ''}
                onChange={e => updateCurrentQuestion({ explanation: e.target.value })}
                placeholder="Step-by-step solution, rationale, or proof (LaTeX $...$ supported)..."
                minRows={2}
                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render helper for Options / NAT Card
  const renderQuestionOptionsCard = () => {
    if (!activeQuestion) return null;
    return (
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 w-full">
        {activeQuestion.type !== 'NAT' ? (
          <div className="space-y-2.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Options & Answer Key ({activeQuestion.type === 'MSQ' ? 'Select all correct' : 'Select one correct'})
              </label>
              <button
                type="button"
                onClick={() => {
                  const currentOpts = [...(activeQuestion.options || [])];
                  currentOpts.push(`Option ${String.fromCharCode(65 + currentOpts.length)}`);
                  updateCurrentQuestion({ options: currentOpts });
                }}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus size={13} />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2.5 w-full">
              {(activeQuestion.options || []).map((opt, oi) => {
                const { text: optText, image: optImgSrc } = parseOptionData(opt);

                const isCorrect =
                  activeQuestion.type === 'MSQ'
                    ? Array.isArray(activeQuestion.correct) && activeQuestion.correct.includes(oi)
                    : activeQuestion.correct === oi;

                return (
                  <div
                    key={oi}
                    className={`p-2.5 rounded-xl border transition-all w-full ${
                      isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Row: Option letter badge, auto-expanding text box (full-width), and actions */}
                    <div className="flex items-start gap-2.5 w-full">
                      {/* Correct Indicator button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (activeQuestion.type === 'MSQ') {
                            const cur = Array.isArray(activeQuestion.correct) ? [...activeQuestion.correct] : [];
                            const updated = cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi];
                            updateCurrentQuestion({ correct: updated });
                          } else {
                            updateCurrentQuestion({ correct: oi });
                          }
                        }}
                        title="Click to set as correct answer"
                        className={`w-7 h-7 mt-0.5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors touch-manipulation ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}
                      </button>

                      {/* Option Auto-Expanding Textarea - NEVER shrinks horizontally */}
                      <div className="flex-1 min-w-0">
                        <AutoExpandingTextarea
                          value={optText}
                          onChange={e => {
                            const currentOpts = [...(activeQuestion.options || [])];
                            const newText = e.target.value;
                            currentOpts[oi] = optImgSrc ? `${newText} ||IMG:${optImgSrc}||` : newText;
                            updateCurrentQuestion({ options: currentOpts });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + oi)} statement (supports multi-line & LaTeX $...$)...`}
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg bg-transparent border-0 text-slate-800 dark:text-slate-100 focus:outline-none min-h-[36px] leading-relaxed"
                          minRows={1}
                        />
                      </div>

                      {/* Option Actions: Attach image button and delete button */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {!optImgSrc && (
                          <label
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors flex items-center gap-1"
                            title="Attach Image to Option"
                          >
                            <ImageIcon size={14} />
                            <span className="text-[10px] hidden sm:inline font-medium">Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleImageFilePicked(e, { optionIndex: oi })}
                            />
                          </label>
                        )}

                        {(activeQuestion.options || []).length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentOpts = (activeQuestion.options || []).filter((_, i) => i !== oi);
                              updateCurrentQuestion({ options: currentOpts });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 shrink-0"
                            title="Delete Option"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Attached Image Thumbnail & Tools - Renders cleanly below the textarea so it never cramps width */}
                    {optImgSrc && (
                      <div className="mt-2 ml-9 flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
                        <div
                          className="w-12 h-9 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0"
                          title="Attached option image"
                        >
                          <img
                            src={optImgSrc}
                            alt={`Option ${String.fromCharCode(65 + oi)}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditOptionImage(oi)}
                            title="Recrop Option Image"
                            className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <CropIcon size={13} />
                          </button>

                          <label
                            className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Replace Image with a new file"
                          >
                            <RefreshCw size={13} />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleImageFilePicked(e, { optionIndex: oi })}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveOptionImage(oi)}
                            title="Remove Option Image"
                            className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* NAT Numerical Answer Input */
          <div className="space-y-2 w-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Correct Numerical Answer / Accepted Range
            </label>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={activeQuestion.correctNat || ''}
                onChange={e => updateCurrentQuestion({ correctNat: e.target.value })}
                placeholder="e.g. 15 or 14.5-15.5"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Candidates will be awarded marks if their entered value is exact or falls within the accepted range (e.g. <code>3.14</code> or <code>3.13-3.15</code>).
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      {/* Top Main Navigation Header */}
      <header className="h-14 px-3 sm:px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            title="Back to CBT Hub Home"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100 truncate">
              {appState.examTitle || 'CBT Maker Studio'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs">
              {appState.sections.length} Sections &bull; {Object.values(appState.questionsBySection).flat().length} Questions
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Load Demo CBT */}
          <button
            type="button"
            onClick={handleLoadDemo}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors touch-manipulation"
            title="Load sample showcase demo test"
          >
            <RotateCcw size={13} />
            <span className="hidden md:inline">Demo CBT</span>
          </button>

          {/* Clear Test */}
          <button
            type="button"
            onClick={handleResetDraft}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors touch-manipulation"
            title="Clear all questions & start with 1 blank question"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          {/* AI Prompt modal */}
          <button
            type="button"
            onClick={() => setIsAIPromptOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors touch-manipulation"
          >
            <Sparkles size={13} />
            <span className="hidden lg:inline">AI Prompt</span>
          </button>

          {/* LaTeX & HTML Guide */}
          <button
            type="button"
            onClick={() => setIsLaTeXGuideOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors touch-manipulation"
            title="LaTeX & Math Guide"
          >
            <BookOpen size={13} />
            <span className="hidden lg:inline">LaTeX Guide</span>
          </button>

          {/* Bulk Paste text */}
          <button
            type="button"
            onClick={() => setIsPasteImportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors touch-manipulation"
          >
            <FileText size={13} />
            <span className="hidden md:inline">Bulk Paste</span>
          </button>

          {/* Exam Global Settings */}
          <button
            type="button"
            onClick={() => setIsExamSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors touch-manipulation"
          >
            <Settings size={13} />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Toggle Live Preview on All Screen Sizes */}
          <button
            type="button"
            onClick={() => {
              if (isDesktop) {
                setShowPreviewPane(!showPreviewPane);
              } else {
                setMobileTab(mobileTab === 'editor' ? 'preview' : 'editor');
              }
            }}
            title="Toggle Live Preview"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-blue-600 transition-colors touch-manipulation"
          >
            {isDesktop ? (
              showPreviewPane ? <EyeOff size={14} /> : <Eye size={14} />
            ) : (
              mobileTab === 'preview' ? <EyeOff size={14} /> : <Eye size={14} />
            )}
            <span className="hidden sm:inline">
              {isDesktop
                ? (showPreviewPane ? 'Hide Preview' : 'Show Preview')
                : (mobileTab === 'preview' ? 'Show Editor' : 'Show Preview')}
            </span>
          </button>

          {/* Compile & Save / Import */}
          <button
            type="button"
            onClick={handleCompileAndExport}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 touch-manipulation"
          >
            <Download size={14} />
            <span>{isCompiling ? 'Compiling...' : 'Compile & Save'}</span>
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Tab Switcher (Editor vs Live Preview) */}
      <div className="min-[1150px]:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors touch-manipulation ${
            mobileTab === 'editor'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors touch-manipulation ${
            mobileTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* Full-width Section Selector Bar */}
      <div className="w-full px-3 sm:px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
            <Layers size={14} />
            <span>Sections:</span>
          </div>
          {appState.sections.map(s => {
            const qCount = (appState.questionsBySection[s.name] || []).length;
            const isCurrent = s.name === activeSectionName;
            const isRenaming = editingSection?.oldName === s.name;

            return (
              <div
                key={s.name}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all touch-manipulation ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                onClick={() => {
                  if (!isRenaming) {
                    setActiveSectionName(s.name);
                    setActiveQuestionIndex(0);
                  }
                }}
              >
                {isRenaming ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingSection.currentVal}
                    onChange={e =>
                      setEditingSection({ oldName: s.name, currentVal: e.target.value })
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleRenameSection(editingSection.oldName, editingSection.currentVal);
                        setEditingSection(null);
                      } else if (e.key === 'Escape') {
                        setEditingSection(null);
                      }
                    }}
                    onBlur={() => {
                      handleRenameSection(editingSection.oldName, editingSection.currentVal);
                      setEditingSection(null);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="w-24 px-1 py-0.5 rounded bg-white text-slate-900 font-bold focus:outline-none text-xs"
                  />
                ) : (
                  <span
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingSection({ oldName: s.name, currentVal: s.name });
                    }}
                    title="Double-click to rename"
                  >
                    {s.name}
                  </span>
                )}

                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {qCount}
                </span>

                {!isRenaming && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingSection({ oldName: s.name, currentVal: s.name });
                    }}
                    title="Rename Section"
                    className={`p-0.5 rounded opacity-70 hover:opacity-100 ${
                      isCurrent ? 'hover:text-blue-100' : 'hover:text-blue-600'
                    }`}
                  >
                    <Edit2 size={11} />
                  </button>
                )}

                {appState.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteSection(s.name);
                    }}
                    title="Delete Section"
                    className="p-0.5 hover:text-red-300 rounded opacity-70 hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddSection}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors shrink-0 touch-manipulation"
          >
            <Plus size={14} />
            <span>Add Section</span>
          </button>
        </div>

        {/* Inline Section Config Badges */}
        {activeSection && (
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-500 shrink-0">
            <div
              className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60"
              title="Section default positive marks"
            >
              <span>+</span>
              <input
                type="number"
                step="any"
                value={activeSection.marks}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setAppState(prev => ({
                    ...prev,
                    sections: prev.sections.map(s =>
                      s.name === activeSection.name ? { ...s, marks: val } : s
                    )
                  }));
                }}
                className="w-9 bg-transparent font-bold text-center focus:outline-none"
              />
              <span>Marks</span>
            </div>

            <div
              className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 text-red-500 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-800/60"
              title="Section default negative penalty"
            >
              <span>-</span>
              <input
                type="number"
                step="any"
                value={activeSection.negative}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setAppState(prev => ({
                    ...prev,
                    sections: prev.sections.map(s =>
                      s.name === activeSection.name ? { ...s, negative: val } : s
                    )
                  }));
                }}
                className="w-9 bg-transparent font-bold text-center focus:outline-none"
              />
              <span>Neg</span>
            </div>
          </div>
        )}
      </div>

      {/* Question Fast Elevator (1, 2, 3...) & Search Jump - Full Width */}
      <div className="w-full px-3 sm:px-5 py-2 bg-slate-100/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 overflow-x-auto z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scroll-smooth">
          {questionsInCurrentSection.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveQuestionIndex(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 touch-manipulation ${
                idx === activeQuestionIndex
                  ? 'bg-blue-600 text-white shadow-xs scale-105 ring-2 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            title="Add New Question"
            className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0 touch-manipulation"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Jump Search Box */}
          <div
            className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shrink-0"
            title="Quick jump to question number"
          >
            <Search size={12} className="text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] hidden sm:inline">
              Go to Q:
            </span>
            <input
              type="number"
              min={1}
              max={questionsInCurrentSection.length}
              value={jumpQVal}
              placeholder={`1-${questionsInCurrentSection.length}`}
              onChange={e => {
                const val = e.target.value;
                setJumpQVal(val);
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 1 && num <= questionsInCurrentSection.length) {
                  setActiveQuestionIndex(num - 1);
                }
              }}
              className="w-12 bg-transparent text-center font-bold text-blue-600 dark:text-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleMoveQuestion('up')}
              disabled={activeQuestionIndex <= 0}
              title="Move Question Up"
              className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 touch-manipulation"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleMoveQuestion('down')}
              disabled={activeQuestionIndex >= questionsInCurrentSection.length - 1}
              title="Move Question Down"
              className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 touch-manipulation"
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleDuplicateQuestion()}
              title="Duplicate Question"
              className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 touch-manipulation"
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteQuestion()}
              title="Delete Question"
              className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 touch-manipulation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Body - Fixed full width & properly centered */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Editor Container */}
        <div
          style={{
            width: isDesktop ? (showPreviewPane ? `${100 - previewWidthPercent}%` : '100%') : '100%'
          }}
          className={`flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden w-full ${
            !isDesktop && mobileTab === 'preview' ? 'hidden' : 'flex'
          }`}
        >
          {/* Active Question Editor Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 w-full">
            {activeQuestion ? (
              <div className="max-w-3xl mx-auto w-full space-y-4">
                {renderQuestionStatementCard()}
                {renderQuestionOptionsCard()}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                No question available. Click <strong>+ Add Question</strong> above to start.
              </div>
            )}
          </div>
        </div>

        {/* Right Side / Live Interactive Preview Pane & Splitter */}
        {(showPreviewPane || (!isDesktop && mobileTab === 'preview')) && (
          <>
            {/* Draggable splitter divider */}
            {isDesktop && showPreviewPane && (
              <div
                onMouseDown={e => {
                  e.preventDefault();
                  setIsDraggingSplitter(true);
                }}
                onTouchStart={() => setIsDraggingSplitter(true)}
                onDoubleClick={() => setPreviewWidthPercent(45)}
                className={`relative w-2.5 hover:w-3 bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 cursor-col-resize transition-all shrink-0 items-center justify-center group select-none flex ${
                  isDraggingSplitter ? 'bg-blue-600 w-3 shadow-md' : ''
                }`}
                title="Drag divider to resize Live Preview (Double-click to reset 45%)"
              >
                <div className="flex flex-col gap-1 items-center justify-center pointer-events-none">
                  <div className="w-1 h-3 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
                  <div className="w-1 h-3 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
                  <div className="w-1 h-3 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
                </div>

                <div
                  className={`absolute top-4 -left-12 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold shadow-lg pointer-events-none transition-opacity ${
                    isDraggingSplitter ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {previewWidthPercent}%
                </div>
              </div>
            )}

            <div
              style={{
                width: isDesktop ? `${previewWidthPercent}%` : '100%'
              }}
              className={`h-full shrink-0 ${
                !isDesktop && mobileTab === 'editor' ? 'hidden' : 'flex w-full'
              }`}
            >
              <QuestionLivePreview
                question={activeQuestion}
                questionIndex={activeQuestionIndex}
                section={activeSection || { name: 'Default', marks: 4, negative: 1, maxAttempts: 0 }}
                fontName={appState.fontName}
                mathMode={appState.mathMode}
                renderEngine={appState.renderEngine}
              />
            </div>
          </>
        )}
      </div>

      {/* Fullscreen overlay while dragging divider */}
      {isDraggingSplitter && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto" />
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperData.isOpen}
        imageSrc={cropperData.imageSrc}
        onClose={() => setCropperData(prev => ({ ...prev, isOpen: false }))}
        onCropComplete={handleCropComplete}
      />

      {/* AI Prompt Generator Modal */}
      <AIPromptModal
        isOpen={isAIPromptOpen}
        onClose={() => setIsAIPromptOpen(false)}
        examTitle={appState.examTitle}
      />

      {/* Paste / Bulk Import Modal */}
      <PasteImportModal
        isOpen={isPasteImportOpen}
        onClose={() => setIsPasteImportOpen(false)}
        currentState={appState}
        onOpenAIPrompt={() => {
          setIsPasteImportOpen(false);
          setIsAIPromptOpen(true);
        }}
        onImportSuccess={(newState, count) => {
          setAppState(prev => ({
            ...prev,
            ...newState
          }));
          if (newState.sections && newState.sections.length > 0) {
            setActiveSectionName(newState.sections[0].name);
            setActiveQuestionIndex(0);
          }
          alert(`Successfully imported ${count} questions!`);
        }}
      />

      {/* Global Exam Settings Modal with Fixed Height & 2-Column Layout */}
      <ExamSettingsModal
        isOpen={isExamSettingsOpen}
        onClose={() => setIsExamSettingsOpen(false)}
        appState={appState}
        onUpdateState={updates => setAppState(prev => ({ ...prev, ...updates }))}
        onResetDraft={handleResetDraft}
        onLoadDemo={handleLoadDemo}
      />

      {/* LaTeX & HTML Guide Modal */}
      <LaTeXGuideModal
        isOpen={isLaTeXGuideOpen}
        onClose={() => setIsLaTeXGuideOpen(false)}
        onInsertSnippet={insertMathSnippet}
      />

      {/* Compile & Import to CBT Hub Modal */}
      {compiledResult && (
        <ImportToAppModal
          isOpen={isImportToAppOpen}
          onClose={() => setIsImportToAppOpen(false)}
          compiledHtml={compiledResult.html}
          filename={compiledResult.filename}
          appState={appState}
        />
      )}
    </div>
  );
}
