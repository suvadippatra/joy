import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle,
  X,
  BookOpen,
  Sigma,
  Columns,
  Type,
  FileText,
  Image as ImageIcon,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Sliders,
  Keyboard,
  Layers,
  ChevronRight,
  Code
} from 'lucide-react';

interface NotebookHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HelpTab = 'overview' | 'latex' | 'markdown' | 'fonts' | 'page' | 'images' | 'export' | 'shortcuts';

export default function NotebookHelpModal({ isOpen, onClose }: NotebookHelpModalProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>('overview');

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview & Layout', icon: Columns },
    { id: 'latex', label: 'LaTeX Math Formulas', icon: Sigma },
    { id: 'markdown', label: 'Styling & Callouts', icon: FileText },
    { id: 'fonts', label: 'Fonts & Google Store', icon: Type },
    { id: 'page', label: 'Page Setup & Print', icon: Sliders },
    { id: 'images', label: 'Images & Text Flow', icon: ImageIcon },
    { id: 'export', label: 'HTML & PDF Export', icon: Download },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard }
  ] as const;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl h-[88vh] max-h-[850px] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Document Studio Guide &amp; Help Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
                  LaTeX &amp; Academic Print
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete guide to academic formatting, formulas, draggable split view, fonts, and print preparation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close Help"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Body with Sidebar Navigation */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <nav className="w-full md:w-56 p-2 md:p-3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar">
            {tabs.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap shrink-0 md:shrink ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Content Pane */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin text-slate-800 dark:text-slate-200 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Workspace Overview &amp; Draggable Split View
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Document Studio is designed for drafting publication-grade lecture notes, physics and math formula sheets, and research summaries.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                    <div className="font-bold text-xs text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                      <Columns size={15} />
                      <span>Split View (Draggable)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Editor on the left, live paginated A4 preview on the right. Grab the center divider bar and drag horizontally to customize the width ratio on tablet or desktop.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
                    <div className="font-bold text-xs text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                      <Code size={15} />
                      <span>Edit Mode Only</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Maximizes the editor workspace. Ideal for focused typing, bulk LaTeX entry, and taking fast notes with word and character statistics.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="font-bold text-xs text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                      <FileText size={15} />
                      <span>Paginated Preview</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Displays exact virtual paper sheets with margin boundaries, zoom controls, fit-to-width, running headers, and page numbering.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>How Draggable Split Resizing Works</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Hover over or touch the divider line between the editor and preview. A glowing handle appears with a column-resize cursor. Drag left or right to expand the editor up to 80% or preview up to 80%. It works on desktops, tablets (both portrait and landscape), and touch screens!
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: LATEX */}
            {activeTab === 'latex' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    LaTeX Math &amp; Equations (KaTeX Engine)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Full LaTeX mathematical typesetting powered by KaTeX with zero remote dependencies.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                      1. Inline Math: Surround with single dollars ($ ... $)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Renders equations inline seamlessly with the surrounding body text:
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                      The famous relation is $E = mc^2$, where $m$ is rest mass and $c$ is speed of light.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                      2. Display Math: Surround with double dollars ($$ ... $$)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Centers prominent equations on their own line with larger mathematical font sizing:
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs whitespace-pre">
{`$$
\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt} = m\\frac{d^2\\vec{r}}{dt^2} = m\\vec{a}
$$`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                      3. Quick Math Formula Bar
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Located right above the editor. Click on any symbol or formula button to insert it at your cursor:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">a/b (Fractions)</span>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">x^n (Exponents)</span>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">\sqrt&#123;x&#125; (Square Root)</span>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">\int (Integrals)</span>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">\vec&#123;v&#125; (Vectors)</span>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">\sum (Summations)</span>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono">\alpha, \beta, \theta, \omega (Greek)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MARKDOWN & CALLOUTS */}
            {activeTab === 'markdown' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Text Formatting &amp; Academic Callout Cards
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Structure your document with headings, theorem callouts, colored text, lists, and tables.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    <div className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">
                      Theorem Card: &gt; [!THEOREM]
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 text-amber-300 font-mono text-[11px] whitespace-pre">
{`> [!THEOREM]
> **Work-Energy Theorem**
> The net work done equals change in kinetic energy: $W_{\\text{net}} = \\Delta K$.`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="font-bold text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                      Definition Card: &gt; [!DEFINITION]
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] whitespace-pre">
{`> [!DEFINITION]
> **Moment of Inertia**
> Quantitative measure of rotational inertia: $I = \\sum m_i r_i^2$.`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                    <div className="font-bold text-xs text-purple-700 dark:text-purple-400 mb-1">
                      Important Formula: &gt; [!FORMULA]
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 text-purple-300 font-mono text-[11px] whitespace-pre">
{`> [!FORMULA]
> **Angular Momentum**
> $\\vec{L} = I\\vec{\\omega} = \\vec{r} \\times \\vec{p}$`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                    <div className="font-bold text-xs text-blue-700 dark:text-blue-400 mb-1">
                      Page Break: ---pagebreak---
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Forces content onto the next physical printed sheet.
                    </p>
                    <div className="p-2 rounded-xl bg-slate-900 text-blue-300 font-mono text-[11px]">
                      ---pagebreak---
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Text Colors &amp; Highlights
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Select any text and click the <strong>Palette</strong> icon in the toolbar. Choose a text color or background highlight color. It automatically wraps your selection in a safe semantic span without disrupting math or document flow.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: FONTS & GOOGLE STORE */}
            {activeTab === 'fonts' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Typography &amp; Google Fonts Academic Store
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Pick from authentic local LaTeX typefaces or search and install thousands of Google Fonts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      1. Built-in Local Academic Fonts
                    </h4>
                    <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                      <li><strong>Computer Modern Serif (KaTeX_Main)</strong>: Authentic Donald Knuth LaTeX typeface.</li>
                      <li><strong>Computer Modern Sans-Serif</strong>: Clean modern technical notes.</li>
                      <li><strong>Computer Modern Typewriter</strong>: Exact fixed-pitch monospaced output.</li>
                      <li><strong>Tiro Bangla</strong>: High-readability Bengali &amp; Indic academic scripts.</li>
                      <li><strong>DM Serif Text, Georgia, Times New Roman</strong>: Classic university press aesthetics.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>2. Google Fonts Academic Store Modal</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Click the <strong>[T]</strong> button next to the font dropdown or choose <em>&quot;✨ + Open Google Fonts Store...&quot;</em>.
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Explore pre-curated collections (EB Garamond, Crimson Pro, Merriweather, Spectral, Fira Code, Source Serif 4) or type any Google Font name to download and apply it instantly to your document.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PAGE SETUP & PRINT */}
            {activeTab === 'page' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Page Setup, Margins &amp; 1:1 Print/PDF
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Configure physical sheet parameters matching standard printers and university submissions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Paper Dimensions
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Select <strong>A4</strong> (210 &times; 297 mm), <strong>Letter</strong> (216 &times; 279 mm), <strong>Legal</strong>, <strong>B5</strong>, or enter custom width/height in millimeters.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Margins &amp; Columns
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Choose <strong>Normal (20mm)</strong>, <strong>Narrow (12.7mm)</strong>, or <strong>Wide (25.4mm)</strong>. Switch to 2-column layout for IEEE/academic paper style.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Running Headers &amp; Footers
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Enable running headers with custom subject title and running subtitle. Choose page numbering format: <em>Page X of Y</em>, <em>- X -</em>, or <em>Page X</em>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                      <Printer size={14} />
                      <span>1:1 Native Print &amp; PDF</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Click <strong>Print</strong> (or press <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">Ctrl+P</kbd>). In your browser print dialog, select &quot;Save as PDF&quot;, set Margins to <strong>None</strong>, and check <strong>Background Graphics</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: IMAGES & TEXT FLOW */}
            {activeTab === 'images' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Images, Precision Cropping &amp; Layout Flow
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Attach scientific diagrams, apparatus schematics, and charts with flexible wrapping.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      1. Upload or Paste (Ctrl+V)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Click the image icon in the toolbar or press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Ctrl+V</kbd> inside the image dialog to paste any screenshot directly from your clipboard.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      2. In-App Precision Cropper
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Click <strong>Crop Image</strong> to trim borders, focus on a circuit diagram or graph, and adjust aspect ratios before inserting.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      3. Text Flow Wrapping Options
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold">
                        Below Text (Block Center)
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold">
                        Float Left (Wrap Right)
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold">
                        Float Right (Wrap Left)
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold">
                        Inline with Text
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                      4. Live Drag-to-Resize on Virtual Sheet
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      In the live Paginated Preview, click on any image. A blue resize handle appears at the bottom-right corner. Drag it with your mouse or stylus to scale the image width interactively.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Standalone HTML &amp; PDF Export
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Distribute self-contained notes that work on any browser without server dependencies.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                    <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Download size={15} />
                      <span>1-Click Standalone HTML Export</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Clicking <strong>Export HTML</strong> produces a self-contained <code className="font-mono text-emerald-700 dark:text-emerald-400">.html</code> file. It packages all LaTeX formulas, styling, page dimensions, and images directly.
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
                      <li>Opens in Chrome, Edge, Safari, Firefox, or Android browsers.</li>
                      <li>Includes a top navigation bar with 1-click Print, Zoom, and Fit width.</li>
                      <li>Can be emailed, archived, or shared with students directly.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Printer size={15} />
                      <span>Print to PDF Optimization</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Both the studio preview and the exported HTML file hide all navigation headers, toolbars, and borders when printing. Every page automatically breaks at the exact millimeter boundary of your selected paper format.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Keyboard Shortcuts Reference
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Boost your drafting speed with standardized academic hotkeys.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Action</th>
                        <th className="p-3">Shortcut</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-semibold">Bold Text</td>
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">Ctrl + B / Cmd + B</td>
                        <td className="p-3 text-slate-500">Wrap or insert bold text</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Italic Text</td>
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">Ctrl + I / Cmd + I</td>
                        <td className="p-3 text-slate-500">Wrap or insert italic text</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Underline</td>
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">Ctrl + U / Cmd + U</td>
                        <td className="p-3 text-slate-500">Wrap or insert underlined text</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Print / PDF</td>
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">Ctrl + P / Cmd + P</td>
                        <td className="p-3 text-slate-500">Open exact 1:1 print dialog</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Indent / Tab</td>
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">Tab</td>
                        <td className="p-3 text-slate-500">Inserts 2 soft spaces at cursor</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Paste Image</td>
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">Ctrl + V / Cmd + V</td>
                        <td className="p-3 text-slate-500">In image modal: paste screenshot directly</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <span>All shortcuts &amp; offline KaTeX rendering are active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Got it, return to Studio
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
