import React, { useState, useEffect, useRef, useCallback, startTransition, useDeferredValue } from 'react';
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
  AlertTriangle,
  Columns2,
  Maximize2,
  PenTool,
  X,
  LayoutGrid,
  FolderOpen
} from 'lucide-react';
import { AppState, defaultAppState, cleanAppState, createCleanAppState, demoShowcaseAppState, Question, QuestionType } from '../types/cbtMaker';
import { compileCBTHTML } from '../utils/cbtCompiler';
import { optimizeImageFile } from '../utils/imageOptimizer';
import ImageCropperModal from '../components/maker/ImageCropperModal';
import AIPromptModal from '../components/maker/AIPromptModal';
import PasteImportModal from '../components/maker/PasteImportModal';
import ExamSettingsModal from '../components/maker/ExamSettingsModal';
import ImportToAppModal from '../components/maker/ImportToAppModal';
import QuestionLivePreview from '../components/maker/QuestionLivePreview';
import LaTeXGuideModal from '../components/maker/LaTeXGuideModal';
import AutoExpandingTextarea from '../components/maker/AutoExpandingTextarea';
import Base64ImageGuard from '../components/maker/Base64ImageGuard';
import VisualTableEditor from '../components/maker/VisualTableEditor';
import QuestionSidebarList from '../components/maker/QuestionSidebarList';
import SectionTabSelector from '../components/maker/SectionTabSelector';
import QuestionEditor from '../components/maker/QuestionEditor';
import QuestionPaletteTray from '../components/maker/QuestionPaletteTray';
import MobileMoreMenu from '../components/maker/MobileMoreMenu';
import StudioLandingHub from '../components/StudioLandingHub';
import { useButtonDisplayMode } from '../hooks/useButtonDisplayMode';

const CBT_DRAFT_KEY = 'cbt_maker_draft';
const CBT_HAS_USER_DRAFT_KEY = 'cbt_maker_has_user_draft';

export default function CBTMaker() {
  const navigate = useNavigate();
  const [showLandingHub, setShowLandingHub] = useState<boolean>(true);
  const { buttonDisplayMode, shouldShowLabel } = useButtonDisplayMode();

  const [hasActiveDraft, setHasActiveDraft] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CBT_HAS_USER_DRAFT_KEY) === '1' && Boolean(localStorage.getItem(CBT_DRAFT_KEY));
    } catch {
      return false;
    }
  });

  // Load draft from localStorage only if user has an active draft; otherwise fallback to clean initial state
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      if (localStorage.getItem(CBT_HAS_USER_DRAFT_KEY) === '1') {
        const saved = localStorage.getItem(CBT_DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.sections && parsed.sections.length > 0) {
            return {
              ...parsed,
              questionViewMode: parsed.questionViewMode || 'CONTINUOUS'
            };
          }
        }
      }
    } catch (e) {
      console.error('Failed to load cbt_maker_draft', e);
    }
    return cleanAppState;
  });

  // Split-screen & View Layout State ('split' | 'editor' | 'preview')
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor' | 'preview'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'editor';
    }
    return 'split';
  });

  const [previewWidthPercent, setPreviewWidthPercent] = useState<number>(() => {
    try {
      const savedWidth = localStorage.getItem('cbt_preview_width_percent');
      if (savedWidth) {
        const num = Number(savedWidth);
        if (num >= 20 && num <= 80) return num;
      }
    } catch {}
    return 48; // Default 48% preview width for balanced side-by-side view
  });

  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);

  // Measure Editor Pane container width to automatically switch between 1-col and 2-col editor layout
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const [editorPaneWidth, setEditorPaneWidth] = useState<number>(700);

  useEffect(() => {
    const el = editorPaneRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setEditorPaneWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [showLandingHub, layoutMode]);

  const isEditorTwoCol = (appState.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS' && editorPaneWidth >= 820;

  // Navigation State
  const [activeSectionName, setActiveSectionName] = useState<string>(() => {
    return appState.sections[0]?.name || 'Section 1';
  });
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [editingSection, setEditingSection] = useState<{ oldName: string; currentVal: string } | null>(null);

  // In-app Confirmation Modal States (Zero blocking window.confirm)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [showCleanConfirmModal, setShowCleanConfirmModal] = useState<boolean>(false);
  const [showLoadDemoConfirmModal, setShowLoadDemoConfirmModal] = useState<boolean>(false);
  const [draftResetCounter, setDraftResetCounter] = useState<number>(0);

  // Fast Jump Search Input
  const [jumpQVal, setJumpQVal] = useState<string>('');

  // Modals & Tray
  const [isQuestionTrayOpen, setIsQuestionTrayOpen] = useState(false);
  const [isExamSettingsOpen, setIsExamSettingsOpen] = useState(false);
  const [isLaTeXGuideOpen, setIsLaTeXGuideOpen] = useState(false);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isPasteImportOpen, setIsPasteImportOpen] = useState(false);
  const [isImportToAppOpen, setIsImportToAppOpen] = useState(false);
  const [compiledResult, setCompiledResult] = useState<{ html: string; filename: string } | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastNotice({ message, type });
    setTimeout(() => {
      setToastNotice(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Deferred state for live preview so typing in editor never blocks on heavy preview updates
  const deferredAppState = useDeferredValue(appState);

  // Quick In-Place Title Rename
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(appState.examTitle || 'Untitled CBT Paper');

  useEffect(() => {
    setTempTitle(appState.examTitle || 'Untitled CBT Paper');
  }, [appState.examTitle]);

  const commitTitleRename = () => {
    const trimmed = tempTitle.trim() || 'Untitled CBT Paper';
    setAppState(prev => ({ ...prev, examTitle: trimmed }));
    setIsEditingTitle(false);
  };

  // Image Cropper & Optimizer Modal State
  const [cropperData, setCropperData] = useState<{
    isOpen: boolean;
    imageSrc: string;
    target: 'question' | { optionIndex: number };
    questionIndex?: number;
  }>({
    isOpen: false,
    imageSrc: '',
    target: 'question'
  });

  // Auxiliary Collapsible State (Table, Solution)
  const [openAux, setOpenAux] = useState<{ table: boolean; explanation: boolean }>({
    table: false,
    explanation: false
  });

  // Debounced Auto-Save Draft to localStorage only after user starts a project/draft
  useEffect(() => {
    if (!hasActiveDraft) return;
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          try {
            localStorage.setItem(CBT_DRAFT_KEY, JSON.stringify(appState));
            localStorage.setItem(CBT_HAS_USER_DRAFT_KEY, '1');
          } catch (e) {
            console.warn('LocalStorage save warning', e);
          }
        });
      } else {
        try {
          localStorage.setItem(CBT_DRAFT_KEY, JSON.stringify(appState));
          localStorage.setItem(CBT_HAS_USER_DRAFT_KEY, '1');
        } catch (e) {
          console.warn('LocalStorage save warning', e);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [appState, hasActiveDraft]);

  // Save preferred width percent to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cbt_preview_width_percent', String(previewWidthPercent));
    } catch {}
  }, [previewWidthPercent]);

  // Handle Splitter Dragging for Live Preview (Supports both Mouse & Touch on all devices)
  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!isDraggingSplitter) return;
      const totalWidth = window.innerWidth;
      const newPreviewWidth = Math.min(Math.max(((totalWidth - clientX) / totalWidth) * 100, 20), 80);
      setPreviewWidthPercent(Math.round(newPreviewWidth));
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false);
      }
    };

    if (isDraggingSplitter) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingSplitter]);

  // Derived Active Data
  const activeSection = appState.sections.find(s => s.name === activeSectionName) || appState.sections[0];
  const questionsInCurrentSection = appState.questionsBySection[activeSection?.name] || [];
  const activeQuestion: Question | null = questionsInCurrentSection[activeQuestionIndex] || null;

  // Deferred Preview Data
  const deferredActiveSection = deferredAppState.sections.find(s => s.name === activeSectionName) || deferredAppState.sections[0] || activeSection;
  const deferredQuestionsInSection = deferredAppState.questionsBySection[deferredActiveSection?.name] || questionsInCurrentSection;
  const deferredActiveQuestion: Question | null = deferredQuestionsInSection[activeQuestionIndex] || activeQuestion;

  // Question State Updater by Index
  const updateQuestionAtIndex = useCallback((qIndex: number, partial: Partial<Question>) => {
    if (!activeSectionName) return;
    setAppState(prev => {
      const currentList = prev.questionsBySection[activeSectionName] || [];
      if (!currentList[qIndex]) return prev;

      const updatedList = [...currentList];
      updatedList[qIndex] = {
        ...updatedList[qIndex],
        ...partial
      };

      return {
        ...prev,
        questionsBySection: {
          ...prev.questionsBySection,
          [activeSectionName]: updatedList
        }
      };
    });
  }, [activeSectionName]);

  // Question State Updater for active question
  const updateCurrentQuestion = useCallback((partial: Partial<Question>) => {
    updateQuestionAtIndex(activeQuestionIndex, partial);
  }, [updateQuestionAtIndex, activeQuestionIndex]);

  // Non-blocking Question & Section Selectors
  const handleSelectQuestion = useCallback((index: number) => {
    startTransition(() => {
      setActiveQuestionIndex(index);
    });
  }, []);

  const handleSelectSection = useCallback((secName: string) => {
    startTransition(() => {
      setActiveSectionName(secName);
      setActiveQuestionIndex(0);
    });
  }, []);

  // Add Question
  const handleAddQuestion = useCallback(() => {
    if (!activeSectionName) return;
    setAppState(prev => {
      const currentList = prev.questionsBySection[activeSectionName] || [];
      const newQ: Question = {
        id: Date.now(),
        type: 'MCQ',
        text: '',
        options: ['', '', '', ''],
        correct: 0,
        image: '',
        table: '',
        explanation: ''
      };
      const updatedList = [...currentList, newQ];
      return {
        ...prev,
        questionsBySection: {
          ...prev.questionsBySection,
          [activeSectionName]: updatedList
        }
      };
    });
    startTransition(() => {
      setAppState(prev => {
        const count = prev.questionsBySection[activeSectionName]?.length || 1;
        setActiveQuestionIndex(count - 1);
        return prev;
      });
    });
  }, [activeSectionName]);

  // Duplicate Question at Index
  const handleDuplicateQuestionAtIndex = useCallback((idx: number = activeQuestionIndex) => {
    if (!activeSectionName) return;
    setAppState(prev => {
      const currentList = prev.questionsBySection[activeSectionName] || [];
      const qToDup = currentList[idx];
      if (!qToDup) return prev;

      const dupQ: Question = {
        ...JSON.parse(JSON.stringify(qToDup)),
        id: Date.now()
      };
      const updatedList = [
        ...currentList.slice(0, idx + 1),
        dupQ,
        ...currentList.slice(idx + 1)
      ];
      return {
        ...prev,
        questionsBySection: {
          ...prev.questionsBySection,
          [activeSectionName]: updatedList
        }
      };
    });
    startTransition(() => {
      setActiveQuestionIndex(idx + 1);
    });
  }, [activeSectionName, activeQuestionIndex]);

  // Delete Question at Index
  const handleDeleteQuestionAtIndex = useCallback((idx: number = activeQuestionIndex) => {
    if (!activeSectionName) return;
    setAppState(prev => {
      const currentList = prev.questionsBySection[activeSectionName] || [];
      if (currentList.length <= 1) {
        // Reset current question content instead of deleting
        const updatedList = [...currentList];
        updatedList[0] = {
          id: Date.now(),
          type: 'MCQ',
          text: '',
          options: ['', '', '', ''],
          correct: 0,
          image: '',
          table: '',
          explanation: ''
        };
        return {
          ...prev,
          questionsBySection: {
            ...prev.questionsBySection,
            [activeSectionName]: updatedList
          }
        };
      }

      const updatedList = currentList.filter((_, i) => i !== idx);
      return {
        ...prev,
        questionsBySection: {
          ...prev.questionsBySection,
          [activeSectionName]: updatedList
        }
      };
    });

    startTransition(() => {
      setActiveQuestionIndex(prev => Math.max(0, prev - 1));
    });
  }, [activeSectionName, activeQuestionIndex]);

  // Move Question Up/Down/Left/Right at Index
  const handleMoveQuestionAtIndex = useCallback((idx: number, dir: 'up' | 'down' | 'left' | 'right') => {
    if (!activeSectionName) return;
    const targetIdx = (dir === 'up' || dir === 'left') ? idx - 1 : idx + 1;

    setAppState(prev => {
      const currentList = [...(prev.questionsBySection[activeSectionName] || [])];
      if (targetIdx < 0 || targetIdx >= currentList.length) return prev;

      const temp = currentList[idx];
      currentList[idx] = currentList[targetIdx];
      currentList[targetIdx] = temp;

      return {
        ...prev,
        questionsBySection: {
          ...prev.questionsBySection,
          [activeSectionName]: currentList
        }
      };
    });

    startTransition(() => {
      setActiveQuestionIndex(targetIdx);
    });
  }, [activeSectionName]);

  // Add Question Next (inserts right after active question)
  const handleAddQuestionNext = useCallback(() => {
    if (!activeSectionName) return;
    setAppState(prev => {
      const currentList = prev.questionsBySection[activeSectionName] || [];
      const newQ: Question = {
        id: Date.now(),
        type: 'MCQ',
        text: '',
        options: ['', '', '', ''],
        correct: 0,
        image: '',
        table: '',
        explanation: ''
      };
      const insertAt = activeQuestionIndex + 1;
      const updatedList = [
        ...currentList.slice(0, insertAt),
        newQ,
        ...currentList.slice(insertAt)
      ];
      return {
        ...prev,
        questionsBySection: {
          ...prev.questionsBySection,
          [activeSectionName]: updatedList
        }
      };
    });
    startTransition(() => {
      setActiveQuestionIndex(prev => prev + 1);
    });
  }, [activeSectionName, activeQuestionIndex]);

  // Add Section
  const handleAddSection = () => {
    let baseName = `Section ${appState.sections.length + 1}`;
    let counter = 1;
    while (appState.sections.some(s => s.name === baseName)) {
      counter++;
      baseName = `Section ${appState.sections.length + counter}`;
    }

    const newSec = {
      name: baseName,
      marks: 4,
      negative: 1,
      maxAttempts: 0
    };
    const newQ: Question = {
      id: Date.now(),
      type: 'MCQ',
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      image: '',
      table: '',
      explanation: ''
    };

    setAppState(prev => ({
      ...prev,
      sections: [...prev.sections, newSec],
      questionsBySection: {
        ...prev.questionsBySection,
        [baseName]: [newQ]
      }
    }));
    setActiveSectionName(baseName);
    setActiveQuestionIndex(0);
  };

  // Delete Section Execution (Instant, No Iframe Freeze)
  const executeDeleteSection = (secNameToDelete: string) => {
    if (appState.sections.length <= 1) return;

    const filteredSecs = appState.sections.filter(s => s.name !== secNameToDelete);
    const updatedQuestions = { ...appState.questionsBySection };
    delete updatedQuestions[secNameToDelete];

    setAppState(prev => ({
      ...prev,
      sections: filteredSecs,
      questionsBySection: updatedQuestions
    }));

    if (activeSectionName === secNameToDelete) {
      setActiveSectionName(filteredSecs[0].name);
      setActiveQuestionIndex(0);
    }
    setSectionToDelete(null);
  };

  // Rename Section
  const handleRenameSection = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;

    if (appState.sections.some(s => s.name === trimmed && s.name !== oldName)) {
      return;
    }

    const updatedSecs = appState.sections.map(s => (s.name === oldName ? { ...s, name: trimmed } : s));
    const updatedQs = { ...appState.questionsBySection };
    if (updatedQs[oldName]) {
      updatedQs[trimmed] = updatedQs[oldName];
      delete updatedQs[oldName];
    }

    setAppState(prev => ({
      ...prev,
      sections: updatedSecs,
      questionsBySection: updatedQs
    }));
    if (activeSectionName === oldName) {
      setActiveSectionName(trimmed);
    }
  };

  // Reset / Clear Draft to 1 Section & 1 Blank Question (Clean Current Test)
  const executeResetDraft = () => {
    const freshClean = createCleanAppState();
    setAppState(freshClean);
    setHasActiveDraft(true);
    try {
      localStorage.setItem(CBT_HAS_USER_DRAFT_KEY, '1');
      localStorage.setItem(CBT_DRAFT_KEY, JSON.stringify(freshClean));
    } catch (e) {
      console.error(e);
    }
    setActiveSectionName(freshClean.sections[0].name);
    setActiveQuestionIndex(0);
    setDraftResetCounter(c => c + 1);
    setShowCleanConfirmModal(false);
  };

  // Load Full Showcase CBT Template
  const executeLoadDemo = () => {
    const demoCopy = JSON.parse(JSON.stringify(demoShowcaseAppState));
    setAppState(demoCopy);
    setHasActiveDraft(true);
    try {
      localStorage.setItem(CBT_HAS_USER_DRAFT_KEY, '1');
      localStorage.setItem(CBT_DRAFT_KEY, JSON.stringify(demoCopy));
    } catch {}
    setActiveSectionName(demoCopy.sections[0].name);
    setActiveQuestionIndex(0);
    setDraftResetCounter(c => c + 1);
    setShowLoadDemoConfirmModal(false);
  };

  // Clean parser for option text and embedded image marker
  const parseOptionData = (rawOption: string) => {
    const raw = rawOption || '';
    const match = raw.match(/\|\|IMG:([\s\S]+?)\|\|/);
    const image = match ? match[1].trim() : null;
    const text = raw.replace(/\|\|IMG:([\s\S]+?)\|\|/g, '').trim();
    return { text, image, rawMatch: match ? match[0] : null };
  };

  // Open Image Cropper for Question or Option with Fast Pre-compression & SVG/GIF support
  const handleImageFilePickedForIndex = async (
    qIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'question' | { optionIndex: number }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

    try {
      const optimizedBase64 = await optimizeImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1000,
        quality: 0.80
      });

      if (isSvg || isGif) {
        if (target === 'question') {
          updateQuestionAtIndex(qIndex, { image: optimizedBase64 });
        } else {
          const optIdx = target.optionIndex;
          const targetQ = questionsInCurrentSection[qIndex];
          if (!targetQ) return;
          const currentOpts = [...(targetQ.options || [])];
          const { text } = parseOptionData(currentOpts[optIdx]);
          currentOpts[optIdx] = text ? `${text} ||IMG:${optimizedBase64}||` : `||IMG:${optimizedBase64}||`;
          updateQuestionAtIndex(qIndex, { options: currentOpts });
        }
      } else {
        setCropperData({
          isOpen: true,
          imageSrc: optimizedBase64,
          target,
          questionIndex: qIndex
        });
      }
    } catch (err) {
      console.error('Failed to optimize image file', err);
      const reader = new FileReader();
      reader.onload = evt => {
        const src = evt.target?.result as string;
        setCropperData({
          isOpen: true,
          imageSrc: src,
          target,
          questionIndex: qIndex
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleImageFilePicked = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'question' | { optionIndex: number }
  ) => {
    handleImageFilePickedForIndex(activeQuestionIndex, e, target);
  };

  // Crop Completed handler
  const handleCropComplete = (croppedBase64: string) => {
    const qIndex = cropperData.questionIndex !== undefined ? cropperData.questionIndex : activeQuestionIndex;
    if (cropperData.target === 'question') {
      updateQuestionAtIndex(qIndex, { image: croppedBase64 });
    } else {
      const optIdx = cropperData.target.optionIndex;
      const targetQ = questionsInCurrentSection[qIndex];
      if (!targetQ) return;
      const currentOpts = [...(targetQ.options || [])];
      const { text } = parseOptionData(currentOpts[optIdx]);
      currentOpts[optIdx] = text ? `${text} ||IMG:${croppedBase64}||` : `||IMG:${croppedBase64}||`;
      updateQuestionAtIndex(qIndex, { options: currentOpts });
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
      showToast(`Error compiling test: ${err.message || err}`, 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  // Isolate StudioLandingHub so editor header & question marking pills never appear on the homepage
  if (showLandingHub) {
    return (
      <>
        <StudioLandingHub<AppState>
          mode="cbt-maker"
          hasActiveDraft={hasActiveDraft}
          activeTitle={appState.examTitle || 'Untitled CBT Paper'}
          activeSubtitle={appState.examSubtitle || appState.agencyName || 'National Testing Agency'}
          activeMetaBadge={`${appState.sections.length} Sec • ${(Object.values(appState.questionsBySection) as Question[][]).reduce((acc: number, arr: Question[]) => acc + arr.length, 0)} Qs • ${appState.duration} mins`}
          activeData={appState}
          onResumeActive={() => {
            setHasActiveDraft(true);
            setShowLandingHub(false);
          }}
          onCreateNewBlank={() => {
            executeResetDraft();
            setShowLandingHub(false);
          }}
          onLoadShowcaseTemplate={() => {
            executeLoadDemo();
            setShowLandingHub(false);
          }}
          onLoadProjectData={(payload) => {
            if (payload && payload.sections && payload.sections.length > 0) {
              const nextState: AppState = {
                ...payload,
                questionViewMode: payload.questionViewMode || 'CONTINUOUS'
              };
              setAppState(nextState);
              setHasActiveDraft(true);
              try {
                localStorage.setItem(CBT_HAS_USER_DRAFT_KEY, '1');
                localStorage.setItem(CBT_DRAFT_KEY, JSON.stringify(nextState));
              } catch {}
              setActiveSectionName(payload.sections[0].name);
              setActiveQuestionIndex(0);
              setDraftResetCounter(c => c + 1);
            }
            setShowLandingHub(false);
          }}
          onOpenFullGuide={() => setIsLaTeXGuideOpen(true)}
        />
        {isLaTeXGuideOpen && (
          <LaTeXGuideModal
            isOpen={isLaTeXGuideOpen}
            onClose={() => setIsLaTeXGuideOpen(false)}
            onInsertSnippet={insertMathSnippet}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      {/* Non-blocking In-App Toast Banner */}
      {toastNotice && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[10000] max-w-md w-[92%] px-4 py-2.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200 bg-slate-900 text-white border-slate-700">
          <span>{toastNotice.message}</span>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {/* Responsive Single-Row Top Toolbar */}
      <header className="px-3 sm:px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Back + Studio Hub Icon + Title + Active Section Pill */}
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            title="Back to Home Dashboard"
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => setShowLandingHub(true)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors shrink-0 cursor-pointer"
            title="Studio Hub (Start Blank, Load Showcase Template & Saved Projects)"
          >
            <FolderOpen size={15} />
          </button>

          {/* Title Editor */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <input
                type="text"
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitTitleRename();
                  if (e.key === 'Escape') {
                    setTempTitle(appState.examTitle || 'Untitled CBT Paper');
                    setIsEditingTitle(false);
                  }
                }}
                onBlur={commitTitleRename}
                autoFocus
                className="px-2 py-0.5 text-xs font-extrabold rounded-md bg-slate-100 dark:bg-slate-800 border border-blue-500 text-slate-900 dark:text-slate-100 focus:outline-none w-28 sm:w-44"
                placeholder="Exam title..."
              />
              <button
                type="button"
                onClick={commitTitleRename}
                className="p-1 rounded-md bg-blue-600 text-white"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 group cursor-pointer shrink-0 min-w-0 ml-1"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename exam title"
            >
              <h1 className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate max-w-[110px] sm:max-w-[200px] group-hover:text-blue-600 transition-colors">
                {appState.examTitle || 'Untitled CBT Paper'}
              </h1>
              <Edit2 size={11} className="text-slate-400 shrink-0" />
            </div>
          )}

          {/* Active Section Indicator Pill (Clicking opens Question Palette Tray) */}
          <button
            type="button"
            onClick={() => setIsQuestionTrayOpen(true)}
            className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
            title="Open Question Palette & Sections"
          >
            <Layers size={12} />
            <span className="truncate max-w-[70px] sm:max-w-[120px]">{activeSectionName}</span>
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Q{activeQuestionIndex + 1}/{questionsInCurrentSection.length}
            </span>
          </button>
        </div>

        {/* Right: Controls & Main Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Question Palette / Tray Toggle Button */}
          <button
            type="button"
            onClick={() => setIsQuestionTrayOpen(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isQuestionTrayOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
            title="Open CBT Question Matrix & Section Palette"
          >
            <LayoutGrid size={14} />
            {shouldShowLabel(isQuestionTrayOpen, true) && <span className="hidden sm:inline">Palette</span>}
          </button>

          {/* Desktop & Tablet Secondary Action Buttons (Visible on screens >= 480px) */}
          <div className="hidden min-[480px]:flex items-center gap-1 sm:gap-1.5">
            {/* View Mode Segmented Controls: Split | Edit | View (Smart Active-Label Default) */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs gap-0.5">
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                title="Split View (Editor + Live Preview)"
                className={`flex items-center gap-1 rounded-md font-bold transition-all cursor-pointer ${
                  layoutMode === 'split'
                    ? 'px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                    : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns2 size={13} />
                {shouldShowLabel(layoutMode === 'split', true) && <span>Split</span>}
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('editor')}
                title="Editor Only"
                className={`flex items-center gap-1 rounded-md font-bold transition-all cursor-pointer ${
                  layoutMode === 'editor'
                    ? 'px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                    : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit2 size={13} />
                {shouldShowLabel(layoutMode === 'editor', true) && <span>Edit</span>}
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('preview')}
                title="Live Preview Only"
                className={`flex items-center gap-1 rounded-md font-bold transition-all cursor-pointer ${
                  layoutMode === 'preview'
                    ? 'px-2.5 py-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs scale-[1.02]'
                    : 'px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye size={13} />
                {shouldShowLabel(layoutMode === 'preview', true) && <span>Preview</span>}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAIPromptOpen(true)}
              title="AI Prompt Generator"
              className="p-1.5 rounded-lg text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
            </button>

            <button
              type="button"
              onClick={() => setIsPasteImportOpen(true)}
              title="Bulk Paste Import"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <FileText size={14} />
            </button>

            <button
              type="button"
              onClick={() => setIsLaTeXGuideOpen(true)}
              title="LaTeX & Inline Expression Guide"
              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <BookOpen size={14} />
            </button>

            <button
              type="button"
              onClick={() => setIsExamSettingsOpen(true)}
              title="Exam Settings"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Settings size={14} />
            </button>
          </div>

          {/* Mobile Phone Kebab Triple-Dot Menu (Strictly phone layout < 480px) */}
          <div className="min-[480px]:hidden flex items-center">
            <MobileMoreMenu
              layoutMode={layoutMode}
              onChangeLayoutMode={setLayoutMode}
              onOpenAIPrompt={() => setIsAIPromptOpen(true)}
              onOpenPasteImport={() => setIsPasteImportOpen(true)}
              onOpenLaTeXGuide={() => setIsLaTeXGuideOpen(true)}
              onOpenExamSettings={() => setIsExamSettingsOpen(true)}
              onResetDraft={executeResetDraft}
              onLoadDemo={executeLoadDemo}
            />
          </div>

          <button
            type="button"
            onClick={handleCompileAndExport}
            disabled={isCompiling}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 touch-manipulation cursor-pointer"
          >
            <Download size={13} />
            {buttonDisplayMode !== 'icon-only' && <span>{isCompiling ? 'Saving...' : 'Compile'}</span>}
          </button>
        </div>
      </header>

      {/* Docked Section & Question Quick-Navigator Bar */}
      <div className="px-3 sm:px-4 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 z-20 overflow-x-auto scrollbar-none">
        {/* Left: Section Tabs + Add Section */}
        <div className="flex items-center gap-1 shrink-0">
          {appState.sections.map(sec => {
            const isSecActive = sec.name === activeSectionName;
            const qCount = (appState.questionsBySection[sec.name] || []).length;
            return (
              <button
                key={sec.name}
                type="button"
                onClick={() => handleSelectSection(sec.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSecActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <span className="truncate max-w-[110px]">{sec.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isSecActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {qCount}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleAddSection}
            title="Add New Section"
            className="flex items-center gap-0.5 px-2 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">Sec</span>
          </button>
        </div>

        {/* Center: Question Number Pills with Status Dot + Add Q */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {questionsInCurrentSection.map((qItem, idx) => {
            const isQActive = idx === activeQuestionIndex;
            const hasStatement = Boolean(qItem.text && qItem.text.trim().length > 0);
            return (
              <button
                key={qItem.id || idx}
                type="button"
                onClick={() => {
                  handleSelectQuestion(idx);
                  if (appState.questionViewMode === 'CONTINUOUS') {
                    const el = document.getElementById(`editor-question-${idx}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    const prevEl = document.getElementById(`preview-question-${idx}`);
                    if (prevEl) prevEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                title={`Question ${idx + 1} (${qItem.type}) ${hasStatement ? '• Ready' : '• Empty'}`}
                className={`relative flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                  isQActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs ring-2 ring-blue-500/40'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasStatement ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
                <span>Q{idx + 1}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleAddQuestion}
            title="Append New Question to Section"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus size={12} />
            <span>Add Q</span>
          </button>
        </div>

        {/* Right: Quick Engine & Stream Status Toggles */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {(appState.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS' && layoutMode !== 'preview' && (
            <span
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              title="Editor automatically adjusts between 1-column and 2-column grid based on pane width"
            >
              {isEditorTwoCol ? '2-Col Edit' : '1-Col Edit'}
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              setAppState(prev => ({
                ...prev,
                mathMode: prev.mathMode === 'LATEX' ? 'HTML' : 'LATEX'
              }))
            }
            title="Toggle between LaTeX ($...$) and Pure HTML math mode"
            className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer"
          >
            {appState.mathMode === 'LATEX' ? 'LaTeX • Offline' : 'HTML Mode'}
          </button>
          <button
            type="button"
            onClick={() =>
              setAppState(prev => ({
                ...prev,
                questionViewMode: (prev.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS' ? 'SINGLE' : 'CONTINUOUS'
              }))
            }
            title="Switch between Multi-Question Stream View and Single Question Focus"
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              (appState.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {(appState.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS' ? 'Multi-Q Stream' : 'Single Q'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split Body */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left / Editor Container */}
        <div
          ref={editorPaneRef}
          style={{
            width: layoutMode === 'split' ? `${100 - previewWidthPercent}%` : layoutMode === 'editor' ? '100%' : '0%'
          }}
          className={`flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0 ${
            layoutMode === 'preview' ? 'hidden' : 'flex'
          }`}
        >
          {/* Active Question Editor Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
            {(appState.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS' && questionsInCurrentSection.length > 0 ? (
              <div className="pb-20 w-full">
                {/* Adaptive 1-Column / 2-Column Grid of Question Editors */}
                <div
                  className={
                    isEditorTwoCol
                      ? 'grid grid-cols-2 gap-4 items-start max-w-6xl mx-auto'
                      : 'grid grid-cols-1 gap-3.5 max-w-3xl mx-auto'
                  }
                >
                  {questionsInCurrentSection.map((qItem, qIdx) => (
                    <QuestionEditor
                      key={`${activeSectionName}_${qItem.id ?? qIdx}_${draftResetCounter}`}
                      question={qItem}
                      questionIndex={qIdx}
                      totalQuestions={questionsInCurrentSection.length}
                      section={activeSection}
                      sectionIndex={appState.sections.findIndex(s => s.name === activeSectionName)}
                      mathMode={appState.mathMode}
                      isActive={qIdx === activeQuestionIndex}
                      showNavigationFooter={false}
                      onFocusQuestion={() => {
                        setActiveQuestionIndex(qIdx);
                        const previewEl = document.getElementById(`preview-question-${qIdx}`);
                        if (previewEl) {
                          previewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      onUpdateQuestion={partial => updateQuestionAtIndex(qIdx, partial)}
                      onImageFilePicked={(e, target) => handleImageFilePickedForIndex(qIdx, e, target)}
                      onOpenLaTeXGuide={() => setIsLaTeXGuideOpen(true)}
                      onOpenCropper={(src, target) => {
                        setCropperData({
                          isOpen: true,
                          imageSrc: src,
                          target,
                          questionIndex: qIdx
                        });
                      }}
                      onDuplicateQuestion={() => handleDuplicateQuestionAtIndex(qIdx)}
                      onDeleteQuestion={() => handleDeleteQuestionAtIndex(qIdx)}
                      onMoveQuestionUp={() => handleMoveQuestionAtIndex(qIdx, 'up')}
                      onMoveQuestionDown={() => handleMoveQuestionAtIndex(qIdx, 'down')}
                    />
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>+ Add Question to {activeSectionName}</span>
                  </button>
                </div>
              </div>
            ) : activeQuestion ? (
              <div className="max-w-3xl mx-auto w-full">
                <QuestionEditor
                  key={`${activeSectionName}_${activeQuestion?.id ?? activeQuestionIndex}_${draftResetCounter}`}
                  question={activeQuestion}
                  questionIndex={activeQuestionIndex}
                  totalQuestions={questionsInCurrentSection.length}
                  section={activeSection}
                  sectionIndex={appState.sections.findIndex(s => s.name === activeSectionName)}
                  mathMode={appState.mathMode}
                  isActive={true}
                  showNavigationFooter={true}
                  onFocusQuestion={() => {
                    const previewEl = document.getElementById(`preview-question-${activeQuestionIndex}`);
                    if (previewEl) {
                      previewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  onUpdateQuestion={updateCurrentQuestion}
                  onImageFilePicked={handleImageFilePicked}
                  onOpenLaTeXGuide={() => setIsLaTeXGuideOpen(true)}
                  onOpenCropper={(src, target) => {
                    setCropperData({
                      isOpen: true,
                      imageSrc: src,
                      target,
                      questionIndex: activeQuestionIndex
                    });
                  }}
                  onPrevQuestion={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                  onNextQuestion={() => setActiveQuestionIndex(prev => Math.min(questionsInCurrentSection.length - 1, prev + 1))}
                  onAddQuestionNext={handleAddQuestionNext}
                  onDuplicateQuestion={() => handleDuplicateQuestionAtIndex(activeQuestionIndex)}
                  onDeleteQuestion={() => handleDeleteQuestionAtIndex(activeQuestionIndex)}
                  onMoveQuestionUp={() => handleMoveQuestionAtIndex(activeQuestionIndex, 'up')}
                  onMoveQuestionDown={() => handleMoveQuestionAtIndex(activeQuestionIndex, 'down')}
                />
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-base font-medium">
                No question available. Click <strong>+ Add Q</strong> above to start.
              </div>
            )}
          </div>
        </div>

        {/* Draggable Divider Bar (Rendered in Split View) */}
        {layoutMode === 'split' && (
          <div
            onMouseDown={e => {
              e.preventDefault();
              setIsDraggingSplitter(true);
            }}
            onTouchStart={() => setIsDraggingSplitter(true)}
            onDoubleClick={() => setPreviewWidthPercent(48)}
            className={`relative w-2.5 hover:w-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 cursor-col-resize transition-all shrink-0 items-center justify-center group select-none flex z-30 ${
              isDraggingSplitter ? 'bg-blue-600 w-3.5 shadow-lg' : ''
            }`}
            title="Drag divider to resize Live Preview (Double-click to reset 48%)"
          >
            <div className="flex flex-col gap-1 items-center justify-center pointer-events-none">
              <div className="w-1 h-3 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
              <div className="w-1 h-3 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
              <div className="w-1 h-3 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
            </div>

            <div
              className={`absolute top-4 -left-12 px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-mono font-bold shadow-lg pointer-events-none transition-opacity ${
                isDraggingSplitter ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {previewWidthPercent}%
            </div>
          </div>
        )}

        {/* Right / Live Interactive Preview Pane */}
        <div
          style={{
            width: layoutMode === 'split' ? `${previewWidthPercent}%` : layoutMode === 'preview' ? '100%' : '0%'
          }}
          className={`h-full shrink-0 ${
            layoutMode === 'editor' ? 'hidden' : 'flex'
          }`}
        >
          <QuestionLivePreview
            question={deferredActiveQuestion}
            questionIndex={activeQuestionIndex}
            totalQuestions={deferredQuestionsInSection.length}
            section={deferredActiveSection || { name: 'Default', marks: 4, negative: 1, maxAttempts: 0 }}
            allSections={deferredAppState.sections}
            allQuestionsInSection={deferredQuestionsInSection}
            questionViewMode={deferredAppState.questionViewMode || 'CONTINUOUS'}
            onToggleViewMode={() => {
              setAppState(prev => ({
                ...prev,
                questionViewMode: (prev.questionViewMode || 'CONTINUOUS') === 'CONTINUOUS' ? 'SINGLE' : 'CONTINUOUS'
              }));
            }}
            onSelectQuestionIndex={idx => {
              setActiveQuestionIndex(idx);
              const editorEl = document.getElementById(`editor-question-${idx}`);
              if (editorEl) {
                editorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            onEditQuestion={idx => {
              setActiveQuestionIndex(idx);
              if (layoutMode === 'preview') {
                setLayoutMode('split');
              }
              setTimeout(() => {
                const editorEl = document.getElementById(`editor-question-${idx}`);
                if (editorEl) {
                  editorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 60);
            }}
            onSelectSection={secName => {
              setActiveSectionName(secName);
              setActiveQuestionIndex(0);
            }}
            onPrevQuestion={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
            onNextQuestion={() => setActiveQuestionIndex(prev => Math.min(questionsInCurrentSection.length - 1, prev + 1))}
            fontName={deferredAppState.fontName}
            previewTableFontSize={deferredAppState.previewTableFontSize}
            mathMode={deferredAppState.mathMode}
            renderEngine={deferredAppState.renderEngine}
            layoutMode={layoutMode}
          />
        </div>
      </div>

      {/* Fullscreen overlay while dragging divider */}
      {isDraggingSplitter && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto" />
      )}

      {/* In-App Delete Section Confirmation Modal */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/50">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                  Delete Section &ldquo;{sectionToDelete}&rdquo;?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  All questions inside this section will be deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteSection(sectionToDelete)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Clean Test Confirmation Modal */}
      {showCleanConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/50">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                  Clean Current Test?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  This wipes all draft sections & questions, leaving 1 default section with 1 blank question.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeResetDraft}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
              >
                Yes, Clean Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Demo Test Confirmation Modal */}
      {showLoadDemoConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/50">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                  Load Sample Demo CBT?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  This loads a sample multi-section exam with physics formulas, biology diagrams, and chemistry questions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLoadDemoConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLoadDemo}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
              >
                Load Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Precision Studio & Optimizer Modal */}
      {cropperData.isOpen && (
        <ImageCropperModal
          isOpen={cropperData.isOpen}
          imageSrc={cropperData.imageSrc}
          onClose={() => setCropperData(prev => ({ ...prev, isOpen: false }))}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* AI Prompt Generator Modal */}
      {isAIPromptOpen && (
        <AIPromptModal
          isOpen={isAIPromptOpen}
          onClose={() => setIsAIPromptOpen(false)}
          examTitle={appState.examTitle}
          sections={appState.sections}
        />
      )}

      {/* Paste / Bulk Import Modal */}
      {isPasteImportOpen && (
        <PasteImportModal
          isOpen={isPasteImportOpen}
          onClose={() => setIsPasteImportOpen(false)}
          currentState={appState}
          onOpenAIPrompt={() => {
            setIsPasteImportOpen(false);
            setIsAIPromptOpen(true);
          }}
          onImportSuccess={(newState, count, missingImages) => {
            setAppState(prev => ({
              ...prev,
              ...newState
            }));
            if (newState.sections && newState.sections.length > 0) {
              setActiveSectionName(newState.sections[0].name);
              setActiveQuestionIndex(0);
            }
            if (missingImages && missingImages > 0) {
              showToast(`Imported ${count} questions! Note: ${missingImages} question(s) have [IMAGE] placeholders.`, 'warning');
            } else {
              showToast(`Successfully imported ${count} questions!`, 'success');
            }
          }}
        />
      )}

      {/* Question Palette & Section Tray */}
      <QuestionPaletteTray
        isOpen={isQuestionTrayOpen}
        onClose={() => setIsQuestionTrayOpen(false)}
        sections={appState.sections}
        activeSectionName={activeSectionName}
        questionsBySection={appState.questionsBySection}
        activeQuestionIndex={activeQuestionIndex}
        onSelectSection={handleSelectSection}
        onSelectQuestion={handleSelectQuestion}
        onAddQuestion={handleAddQuestion}
        onAddSection={handleAddSection}
        onRenameSection={(oldName, newName) => {
          handleRenameSection(oldName, newName);
        }}
        onDeleteSection={(secName) => {
          setSectionToDelete(secName);
        }}
        onMoveQuestion={handleMoveQuestionAtIndex}
        onDuplicateQuestion={handleDuplicateQuestionAtIndex}
        onDeleteQuestion={handleDeleteQuestionAtIndex}
        onUpdateSectionMarks={(secName, marks, negative) => {
          setAppState(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.name === secName ? { ...s, marks, negative } : s)
          }));
        }}
      />

      {/* Global Exam Settings Modal */}
      {isExamSettingsOpen && (
        <ExamSettingsModal
          isOpen={isExamSettingsOpen}
          onClose={() => setIsExamSettingsOpen(false)}
          appState={appState}
          onSave={updates => setAppState(prev => ({ ...prev, ...updates }))}
          onResetDraft={executeResetDraft}
          onLoadDemo={executeLoadDemo}
        />
      )}

      {/* LaTeX & HTML Guide Modal */}
      {isLaTeXGuideOpen && (
        <LaTeXGuideModal
          isOpen={isLaTeXGuideOpen}
          onClose={() => setIsLaTeXGuideOpen(false)}
          onInsertSnippet={insertMathSnippet}
        />
      )}

      {/* Compile & Import to CBT Hub Modal */}
      {compiledResult && isImportToAppOpen && (
        <ImportToAppModal
          isOpen={isImportToAppOpen}
          onClose={() => setIsImportToAppOpen(false)}
          compiledHtml={compiledResult.html}
          filename={compiledResult.filename}
          appState={appState}
          onUpdateTitle={newTitle => setAppState(prev => ({ ...prev, examTitle: newTitle }))}
        />
      )}
    </div>
  );
}
