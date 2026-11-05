# Academic Document Studio, High-Capacity CBT Maker & Instant Test Engine Upgrade

This plan upgrades **Document Studio** into a complete browser-based academic word processor and research paper studio with working inline LaTeX and direct page layout controls, eliminates lag in **CBT Maker** for large 50–200+ question papers using a container-responsive multi-column workspace, adds a **Recent Projects & User Guides Landing Hub** to both tools, and guarantees **0ms instant HTML test rendering** across online/offline and LaTeX/system font modes.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices incorporate your confirmed answers from our planning interview:

- **Confirmed Decision 1 — Studio Landing Hub (Recent Projects & Guides)**: Opening **Document Studio** or **CBT Maker** presents a clean **Recent Projects & User Guides Hub** first, featuring a 1-click **Resume Active Draft** primary action, multi-project library (Open, Duplicate, Delete, Export), starter templates, and interactive user guides. A **Projects Hub** button in each studio's top bar lets you switch projects anytime.
- **Confirmed Decision 2 — Document Studio 2-Tab Word Processor Ribbon & On-Sheet Header/Footer Editing**: Replaces hidden modal-only page settings with a compact **2-Tab Ribbon** (**Tab 1: Home & Formatting** | **Tab 2: Page Layout, Margins, Header & Footer**) plus direct click-to-edit running headers, footers, and page numbers right on the virtual paper sheet.
- **Confirmed Decision 3 — CBT Maker Adaptive Multi-Column Side-by-Side Architecture**:
  - **Split Mode**: Left pane displays a scrollable list of editable question cards; Right pane displays the full scrollable list of live preview cards in the exact same order.
  - **Container-Width-Responsive Columns (`1-Col` ↔ `2-Col`)**: Each pane independently measures its own width via `ResizeObserver`. On wide desktop displays or when widened via the draggable splitter ($\ge 880\text{px}$), a pane automatically arranges its questions into a **2-column grid**; when narrowed ($< 880\text{px}$), that pane seamlessly reflows into a **1-column stack**.
  - **Three Workspace Modes**: **Split View** (resizable Left Editor + Right Preview), **Edit Only** (full-width multi-column question editor grid), and **Preview Only** (full-width multi-column live preview grid).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Document Studio**: Fixes inline LaTeX (`$...$` and `\(...\)`) rendering across all paragraphs, lists, callouts, and tables; adds a full Word-processor ribbon with direct controls for margins, paper size, columns, alignment, line spacing, running headers, footers, and page numbering; synchronizes the live page preview to automatically scroll to and highlight whichever section is currently being edited; and removes non-essential UI text clutter.
  2. **CBT Creation Studio**: Eliminates typing and scrolling lag on 50–200+ question papers using strict per-question memoization, $O(1)$ KaTeX formula caching, and CSS `content-visibility` virtualization, while introducing an adaptive 1-column / 2-column grid layout that responds dynamically to the draggable split bar and screen width.
  3. **Recent Projects & User Guides Hub**: Persists multiple named CBT projects and Document Studio manuscripts in IndexedDB (`localforage`) so users can manage a portfolio of exams and research papers alongside visual quick-start guides.
  4. **Instant CBT Viewer Engine**: Pre-bridges the in-memory KaTeX engine and local font faces directly from the parent window into exam iframes so tests appear in $0\text{ms}$ without network waits, whether online or offline, and whether LaTeX fonts are enabled or disabled.

---

## 2. User Experience & Visual Design

- **Aesthetic Direction & Anti-Bloat Discipline**:
  - Clean, high-density academic studio interface inspired by Overleaf, Notion, and Microsoft Word Print Layout.
  - **Decluttered Chrome**: Removes redundant helper paragraphs, verbose sub-captions, and decorative badges inside question cards and toolbars so screen real estate is dedicated to authoring and previewing content.
  - **Color & Surface Hierarchy**: Crisp neutral canvas (`bg-slate-50 dark:bg-slate-950`), elevated paper sheets and question cards (`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`), and focused high-contrast primary actions (`bg-blue-600 text-white`).
  - **Typography**: `KaTeX_Main` (Computer Modern Serif) for academic documents and LaTeX math, paired with clean sans-serif UI controls and `tabular-nums` for question counters, marks, and margin measurements.

- **Key User Flows**:
  1. **Opening CBT Maker or Document Studio (Landing Hub)**:
     - Displays the **Recent Projects & Guides Hub** with:
       - **Resume Current Draft** card (shows title, last edited time, question/page count).
       - **Create New Project** & **Academic / Exam Templates** cards.
       - **Recent Projects Grid** (stored in `localforage` — click to open, duplicate, rename, or delete).
       - **Interactive Quick-Start Guides** (LaTeX Math Syntax, Research Paper Layout & Margins, High-Speed Bulk Question Authoring).
  2. **Authoring in Document Studio**:
     - Switch between **Home** tab (font, size, bold/italic/underline, color/highlight, alignment, line spacing, lists, tables, figures, inline/block math) and **Page Layout** tab (margins preset + `Top/Bottom/Left/Right mm` steppers, paper size, orientation, columns, header title/subtitle inputs, and footer page numbering format/alignment).
     - Click directly on any page's top header or bottom footer on the preview sheet to edit header text or page numbering inline.
     - Typing in any paragraph or equation in the editor automatically scrolls the preview sheet to the edited block and pulses a subtle focus highlight on that block.
  3. **Authoring Long Question Papers in CBT Maker**:
     - Drag the center splitter left or right: as the Editor pane widens past $880\text{px}$, question editor cards automatically switch from 1 column to 2 columns side-by-side; as the Preview pane narrows below $880\text{px}$, preview cards automatically switch from 2 columns to 1 column (and vice versa).
     - Typing in any question card updates only that specific question's state and its matching preview card on the right—keeping keystrokes at $60\text{fps}$ even with 150+ questions loaded.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Fixing Inline LaTeX Corruption in Document Studio**
  - *Root Cause Identified*: `notebookRenderer.ts` previously tokenized inline math `$formula$` into `%%MATH_INL_0%%` before passing paragraphs to `parseInlineMarkdown()`. Because `%%MATH_INL_0%%` contained underscore characters (`_`), Markdown's `_italic_` and `__bold__` regexes matched across the underscores inside `%%MATH_INL_0%%` (turning it into `%%MATH<em>INL</em>0%%`), breaking token restoration whenever inline math appeared in a paragraph!
  - *Chosen Approach*: Replace all internal placeholder tokens with underscore-free, markdown-inert control delimiters (`\u0002MATHINL0\u0003`, `\u0002MATHDISP0\u0003`, `\u0002RAWHTML0\u0003`, `\u0002IFRAME0\u0003`), plus add live unclosed `$formula` recovery for the active paragraph being typed.
  - *Why*: Guarantees 100% reliable inline LaTeX (`$...$` and `\(...\)`) inside paragraphs, bold/italic phrases, lists, callouts, and table cells without regex collisions.

- **Decision 2 — Eliminating CBT Maker Lag on 50–200+ Question Papers**
  - *Root Cause Identified*: Passing inline closures (`partial => updateQuestionAtIndex(qIdx, partial)`) inside `.map()` defeated `React.memo` on `QuestionEditor` and `MemoizedQuestionCard`, forcing all 100+ editors and 100+ preview cards to re-render on every keystroke.
  - *Chosen Approach*:
    1. Pass index-stable callbacks (`onUpdateQuestionAtIndex`, `onFocusQuestionAtIndex`, `onDuplicateAtIndex`, `onDeleteAtIndex`, `onMoveAtIndex`) and a strict custom equality check (`areQuestionPropsEqual`) on both `QuestionEditor` and `MemoizedQuestionCard`.
    2. Add an $O(1)$ in-memory LRU cache to `formatContent()` in `cbtCompiler.ts` so unchanged question/option math strings never re-run KaTeX compilation.
    3. Apply CSS `content-visibility: auto` to off-screen question cards so the browser only computes layout for visible cards.

- **Decision 3 — Instant 0ms CBT Test Rendering (Online/Offline & LaTeX/Standard Font)**
  - *Root Cause Identified*: `cbtHtmlCorrector.ts` injected blocking `<link>` and `<script>` tags in `<head>`, and `CBTViewer.tsx` waited for `useCBTData()` before mounting the iframe.
  - *Chosen Approach*: Pre-expose `window.katex` and `window.renderMathInElement` on the main application `window` at startup, synchronously attach them to the iframe's `contentWindow` on load, inline all `@font-face` rules with `font-display: swap`, and resolve `staticCbtTests` / `localforage` immediately without waiting for background directory scans.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     INDEXEDDB (localforage) & LOCAL CACHE                    │
│  • cbt_projects_list (Saved CBT Exams)   • doc_studio_projects (Manuscripts) │
│  • Global O(1) KaTeX Render Cache        • Preloaded Local KaTeX Font Faces  │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │                                      │
                    ▼                                      ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────────┐
│          DOCUMENT STUDIO              │  │         CBT MAKER STUDIO          │
│ ┌───────────────────────────────────┐ │  │ ┌───────────────────────────────┐ │
│ │ Studio Landing Hub                │ │  │ │ CBT Maker Landing Hub         │ │
│ │ • Resume Draft / Recent Projects  │ │  │ │ • Resume / Recent Exams       │ │
│ │ • Research Templates & Guides     │ │  │ │ • Quick LaTeX & Bulk Guides   │ │
│ └─────────────────┬─────────────────┘ │  │ └───────────────┬───────────────┘ │
│                   ▼                   │  │                 ▼                 │
│ ┌───────────────────────────────────┐ │  │ ┌───────────────────────────────┐ │
│ │ 2-Tab Word Processor Ribbon       │ │  │ │ Compact Top & Section Bar     │ │
│ │ • Tab 1: Home (Text, Math, Insert)│ │  │ │ • Mode: Split | Edit | Preview│ │
│ │ • Tab 2: Page Layout (Margins,    │ │  │ │ • Section Tabs & Q Jump Pills │ │
│ │   Header/Footer, Page Numbers)    │ │  │ └───────────────┬───────────────┘ │
│ └─────────────────┬─────────────────┘ │  │                 ▼                 │
│                   ▼                   │  │ ┌───────────────┴───────────────┐ │
│ ┌─────────────────┴─────────────────┐ │  │ │ Resizable Split Workspace     │ │
│ │ Editor Pane  ◄──►  Page Preview   │ │  │ │ Left: Question Editors Grid   │ │
│ │ • Active Cursor    • Inline $...$ │ │  │ │   (Auto 1-Col / 2-Col by px)  │ │
│ │   Block Tracker    • Click-to-Edit│ │  │ │ Right: Live Previews Grid     │ │
│ │                    Header/Footer  │ │  │ │   (Same Order, Auto 1/2-Col)  │ │
│ │                    • Auto-Scroll  │ │  │ │ • O(1) Memoized Per-Q Updates │ │
│ └───────────────────────────────────┘ │  │ └───────────────────────────────┘ │
└───────────────────────────────────────┘  └───────────────────────────────────┘
```

### Interactive Component & State Mapping

1. **Document Studio Inline Math & Active Block Sync**:
   - `notebookRenderer.ts`: Replaces `%%MATH_INL_(\d+)%%` with `\u0002MATHINL$1\u0003` (and matching underscore-free tokens for display math, raw HTML, and iframes). Adds `data-source-line` / `data-block-id` attributes to rendered blocks so `NotebookPreview` can locate and highlight the exact block being edited.
   - `NotebookEditor.tsx` & `DocStudio.tsx`: Tracks `activeCursorLine` and `activeParagraphText` on keyup/click and passes them to `NotebookPreview.tsx`, which smoothly scrolls the target page/block into view and highlights it briefly.
   - `NotebookToolbar.tsx` & `NotebookPreview.tsx`: Implements the 2-Tab Ribbon (`Home` | `Page Layout`) with direct inputs/steppers for margins (`top`, `bottom`, `left`, `right` in mm), header title/subtitle, and page numbering format/alignment, plus click-to-edit header/footer directly on the rendered sheet.
2. **CBT Maker Multi-Column & Zero-Lag Engine**:
   - `CBTMaker.tsx`: Measures left Editor pane width and right Preview pane width via `ResizeObserver`. Renders a 2-column CSS Grid (`grid-cols-2 gap-4 items-start`) whenever a pane's width is $\ge 880\text{px}$, or a 1-column stack when narrower.
   - `QuestionEditor.tsx` & `QuestionLivePreview.tsx`: Streamlines card headers (removes redundant titles and helper paragraphs), wraps cards in strict `React.memo` with index-based callbacks, and uses `formatContent` with an $O(1)$ cache in `cbtCompiler.ts`.
3. **Recent Projects & Guides Hub (`StudioProjectsHub`)**:
   - Shared/dedicated hub view in both `DocStudio.tsx` and `CBTMaker.tsx` backed by `localforage` (`doc_studio_projects_v1` and `cbt_maker_projects_v1`) supporting Save, Open, Rename, Duplicate, Delete, and built-in User Guide cards.
4. **Instant `CBTViewer.tsx` & `cbtHtmlCorrector.ts`**:
   - Registers `katex` and `renderMathInElement` globally on `window` in `main.tsx` so `CBTViewer` and `cbtHtmlCorrector` render math synchronously on iframe load with zero network dependency and instant font application.
5. **Help Center Synchronization**:
   - Updates `NotebookHelpModal.tsx`, `LaTeXGuideModal.tsx`, and `Settings.tsx` to document the new Project Hubs, 2-Tab Word Processor Ribbon, inline LaTeX engine, active-edit preview sync, and adaptive 1-Col/2-Col CBT Maker layout.
