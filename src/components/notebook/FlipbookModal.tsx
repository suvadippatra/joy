import React, { useMemo } from 'react';
import { X, Maximize2, Minimize2, BookOpen } from 'lucide-react';
import { NotebookDocument } from '../../types/notebook';
import { parseDocumentToPages } from '../../utils/notebookRenderer';
import { generateFlipbookHtml } from '../../utils/flipbookGenerator';

interface FlipbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NotebookDocument;
}

export default function FlipbookModal({
  isOpen,
  onClose,
  document: doc
}: FlipbookModalProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Generate pages HTML
  const pagesHtml = useMemo(() => {
    return parseDocumentToPages(doc.content, doc.assets);
  }, [doc.content, doc.assets]);

  // Generate standalone iframe srcdoc
  const flipbookSrcDoc = useMemo(() => {
    return generateFlipbookHtml({
      title: doc.title || 'Academic Document',
      pagesHtml: pagesHtml.length > 0 ? pagesHtml : ['<p class="text-slate-500 italic p-6">Empty document</p>'],
      pageSettings: doc.pageSettings,
      assets: doc.assets
    });
  }, [doc.title, pagesHtml, doc.pageSettings, doc.assets]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'fixed inset-2 sm:inset-4 w-auto h-auto' 
            : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{doc.title || 'Untitled Document'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {pagesHtml.length} {pagesHtml.length === 1 ? 'Page' : 'Pages'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Interactive 3D Flipbook Reader &bull; Turn pages smoothly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Close Reader"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sandboxed 3D Flipbook Iframe */}
        <div className="flex-1 w-full h-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <iframe
            srcDoc={flipbookSrcDoc}
            title={`${doc.title} 3D Flipbook`}
            className="w-full h-full border-0 block"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
