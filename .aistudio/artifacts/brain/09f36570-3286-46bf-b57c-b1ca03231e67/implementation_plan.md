# Implementation Plan: প্রশ্নপত্র Maker (Question Paper Maker) Replica & Weather Page Overhaul

## 1. Standalone "প্রশ্নপত্র Maker" (Question Paper Making Tool) Replica
We will create a dedicated, fast, and responsive Question Paper Maker section (`/qp-maker`, accessible directly from a new card on the Main Homepage) that replicates the exact interface, layout, and functionality of `/shibu-main/index.html` while upgrading its mathematical and Bengali/English LaTeX engine.

### Core Architecture & UI Replica (`/src/pages/QPMaker.tsx` & `/src/utils/qpEngine.ts`)
- **Exact Visual & Functional Replica**:
  - **Topbar**: Brand header (`প্রশ্নপত্র Maker` / `Question Paper Maker`), Paper Title badge, Info drawer toggle, Guide drawer toggle, Dark/Light theme toggle, `Auto-fit` button, `Ans Space: ON/OFF` toggle, `Settings` toggle, and `Print / PDF` button.
  - **Resizable Split Workspace**:
    - **Left Sidebar (`#sidebar`)**:
      - **QPF Import Strip & Drawer**: Paste or upload `.qpf` / `.txt` files, load Demo QPF, and 1-click Copy AI Prompt (`Image OCR → QPF` & `Text → QPF`).
      - **Exam Info Card**: Exam Title, Subject, Class, Time, Full Marks, Instructions, Header Layout (`Standard`, `Split`, `Compact`, `Minimal`), Header Box Style (`None`, `Single`, `Double`, `Rounded`, `Bottom`), and Divider Style.
      - **Sections & Questions Accordion**: Up to 10 sections (`বিভাগ 'ক'`, `'খ'`... or `Section 'A'`, `'B'`...), Question Type (`MCQ`, `Short`, `Descriptive`, `Long`), Marks/Q, Answer Any, Option Style (`ক খ` vs `a b`), `🔗 Link OR (অথবা)` pairing mode, sub-part mark breakdown floating right `(1+3+1)`, MCQ image upload with L/C/R alignment & size slider, and non-MCQ extra blocks (`🖼 Image`, `⊞ Table`, `✏ Interactive Canvas Diagram Modal`, and `🏷 Labeled Diagram` with pointer lines `1,2 / A,B / a,b / i,ii / ক,খ`).
      - **Export Bar**: `.odt` (LibreOffice OpenDocument Text via local `JSZip`), `.qpf` backup download, and `Print / PDF`.
    - **Right Column (`#right-col`)**:
      - **Collapsible Paper Settings Panel**: Font Size (`7–15pt`), Line Spacing (`0.8–1.75`), Page Margin (`0–2.5cm`), Orientation (`Auto`, `Portrait`, `Landscape`), Cut Line Style (`dotted`, `dashed`, `solid`, `✂ cut`), Watermark Controls (`None`, `Default` with `"BERA26"` unlock code, `Custom` image upload, Opacity & Size sliders), and Paper Language (`পূর্ণ বাংলা / full-bn`, `Mixed / mixed`, `Full English / full-en`).
      - **Live A4 Multi-Mode Preview & Print Engine**: `Mono (1/pg)`, `Double (2/pg)`, `Quad (4/pg)`, and `Flow` booklet pagination with automatic P.T.O., page numbers, cut lines, watermarks, and zoom controls.
- **Upgraded Bilingual (Bengali + English) Math & LaTeX Engine**:
  - **Unified Tag & Delimiter Support**: Supports QPF tags (`[EQ:...]`, `[CHEM:...]`, `[SYM:...]`, `[SUB:...]`, `[SUP:...]`) **and** inline/block LaTeX (`$...$`, `$$...$$`, `\(...\)`, `\[...\]`).
  - **Bengali Numerals & Script Inside Fractions and Math**:
    - Automatically wraps Bengali text and numerals (`\u0980-\u09FF`, `০-৯`) inside `\text{...}` with Tiro Bangla / Noto Serif Bengali fallback when passed to offline KaTeX so expressions like `[EQ:\frac{৩}{৪}]`, `$\frac{লব}{হর}$`, `$\frac{১২}{৫} \div \frac{৩}{১০}$`, or `$\sqrt{২৫} = ৫$` render cleanly with zero KaTeX parse errors or missing glyph boxes.
  - **Smart Auto-Fraction & Division Conversion**:
    - Automatically formats inline Bengali/English fractions and division expressions inside math tokens (e.g., `[EQ:৩/৪]`, `[EQ:লব/হর]`, `÷` to `\div`, `×` to `\times`) into proper stacked fractions (`\frac{...}{...}`) and mathematical symbols.
  - **100% Offline Execution**: Uses local `/libs/katex.min.js`, `/libs/katex.min.css`, and `/libs/jszip.min.js` (and copies `/shibu-main/watermark.svg` and `/shibu-main/logo.png` to `/public/qp/` so all assets work offline).

---

## 2. Weather Page Performance, Visuals, Calculations & Localization Overhaul
We will refactor `/src/pages/WeatherPage.tsx`, `/src/services/weatherService.ts`, `/src/services/weatherTranslations.ts`, `/src/components/weather/WeatherAnimations.tsx`, and `/src/components/weather/WeatherMap.tsx` to make the Weather page instantaneous, visually rich, mathematically accurate, and fully localized in English, Bengali (`বাংলা`), and Hindi (`हिन्दी`).

### A. Zero-Lag Click Response & GPU-Accelerated Animations
- **Eliminate Compositor Thrashing**:
  - Replace heavy full-screen CSS `filter: blur-2xl / blur-3xl` orbs and excessive stacked `backdrop-blur-2xl` layers with hardware-accelerated radial gradients (`translate3d`, `will-change: transform`) and lightweight glass surfaces so touch/click events respond in `<16ms` with smooth 60fps animations.
  - Memoize all sliced hourly arrays (`hourlyTimes`, `hourlyRain`, `hourlyWind`, `hourlyCloud`, `hourlyTemp`) in `WeatherPage.tsx` using `useMemo` so child views (`WeatherMap`, `FarmPlanner`, `SunMoonView`) never re-initialize on unrelated state clicks.

### B. Astronomical, Meteorological & Night-Icon Corrections
- **True Solar Noon, Day Length & Moon Tithi (`computeAstroSnapshot`)**:
  - Compute real **Solar Noon** and **Day Length (hours & minutes)** dynamically from the location's astronomical sunrise/sunset times and longitude equation of time instead of hardcoded `'11:46 AM'` and `11.8`.
  - Compute **Lunar Tithi & Paksha** from the true ecliptic longitude difference $(\lambda_{\text{moon}} - \lambda_{\text{sun}}) \pmod{360^\circ}$ divided by $12^\circ$.
- **Day/Night Weather Icons (`getWmoInfo`)**:
  - Pass `isDay` (`1` or `0`) to `getWmoInfo(weatherCode, isDay)` so clear/mostly-clear nighttime hours and current conditions display `🌙` / `☁️🌙` instead of a daytime sun `☀️`.

### C. Complete Today Tab Cards & Full Bengali / Hindi Localization
- **Restore & Enhance Today Tab Cards**:
  - Expand the Today tab with **Air Quality (AQI, PM2.5, PM10)**, **Dew Point, Visibility, Cloud Cover, Wind Gusts**, **Beaufort Wind Scale Card**, **Coastal Marine Card** (when applicable), **Sunrise/Sunset & Tithi Summary Strip**, and **Everyday Lifestyle Advisory Cards** (Two-Wheeler Riders, Walking & Outdoor Chores, Elderly & Sensitive Groups, Outdoor Clothes Drying).
- **100% Bilingual/Trilingual Expressions (`en`, `bn`, `hi`)**:
  - Localize all tab bars, metric labels, `Now`/`Today`/`Tomorrow` badges, **Natural Sky Sentences (`generateSkySentence`)**, **IMD Station rainfall/heatwave/monsoon categories & district advisories**, and numeric formatting (Bengali numerals when `bn` is active).

### D. Interactive Canvas & Radar Weather Map (`WeatherMap.tsx`)
- **Smooth Heatmap, Rain Radar & Animated Wind Streamlines**:
  - Fix the map re-render bug by decoupling Leaflet initialization from hourly data arrays.
  - Replace the 15 static circles with a **high-FPS HTML5 Canvas Weather Overlay** synced to Leaflet bounds that renders smooth bilinear-interpolated thermal heatmaps (`Temp`), animated flowing wind streamlines (`Wind`), cloud density fields (`Cloud`), and precipitation radar intensity (`Rain` + live RainViewer tile layer when online) with instant click-to-inspect coordinate tooltips.

---

## 3. Help & Documentation Synchronization
- Update `/src/pages/Settings.tsx`, `/src/components/maker/LaTeXGuideModal.tsx`, `/src/components/notebook/NotebookHelpModal.tsx`, and the built-in Guide drawer of `প্রশ্নপত্র Maker` to document the new Question Paper Maker, Bengali/English fraction & LaTeX syntax, and Weather page enhancements.
