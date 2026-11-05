# প্রশ্নপত্র Maker — CBT/QP Suite

> **Offline-first, all-in-one web toolkit** for Bengali academic question papers & NTA-style computer-based exams. No backend, no installation—just open and create.

[![Version](https://img.shields.io/badge/version-v4.4.1-blue)](#changelog) 
[![Status](https://img.shields.io/badge/status-Production%20Ready-success)](/)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

---

## 🚀 Quick Start

| Tool | Purpose | URL |
|------|---------|-----|
| **QP Maker** | Author question papers with LaTeX math, images, OCR support | [`index.html`](https://suvadippatra.github.io/shibu/) |
| **CBT Maker** | Build NTA/TCS-style online exams with timer & calculator | [`cbt/cbt_index.html`](https://suvadippatra.github.io/shibu/cbt/cbt_index.html) |
| **PDF Tools** | Merge, watermark, invert colors, detect watermarks | See [PDF Tools](#pdf-tools) |

**Works offline.** Open directly in your browser or host on GitHub Pages.

---

## ✨ What You Can Do

### 📝 QP Maker
- **Multi-format authoring:** MCQ, NAT (Numerical Answer Type), Labeled Diagrams in Bengali & English
- **Math rendering:** Full LaTeX via KaTeX + MathML support (online/offline)
- **Smart layouts:** 4 view modes (portrait, landscape, continuous) with answer space controls
- **Export formats:** DOCX (with embedded fonts), HTML (printable), QPF (custom format)
- **Smart validation:** Real-time Bengali scientific notation checker with LaTeX suggestions
- **Image support:** Built-in OCR for scanned papers, Cropper.js for precise image placement
- **Watermark control:** Custom SVG or PNG overlays with full positioning control

### 💻 CBT Maker
- **Flexible exam structure:** Multi-section builder (A, B, C) with custom marks & negative marking
- **Question types:** MCQ, NAT with image & math support
- **Math engines:** Native MathML, KaTeX (local), KaTeX (CDN), pure HTML fallback
- **AI extraction:** Auto-extract questions from scanned papers (sends to your LLM of choice)
- **Full exam UI:** Timer, calculator, physical constants panel, question palette
- **Single-file output:** Self-contained HTML—no dependencies after generation

### 🔧 PDF Tools
| Tool | What It Does |
|------|-------------|
| **PDF Merge** | Combine & reorder multiple PDFs |
| **PDF Colour Invert** | Flip colors for dark-mode-friendly printing |
| **PDF Watermark Detect** | Analyze & locate watermarks in PDFs |
| **Add Watermark** | Apply SVG/PNG watermarks to PDFs |

---

## 📁 Project Structure

```
shibu/
├── 📄 index.html                    # QP Maker entry point
├── 📄 pdf-merge.html                # PDF tools
├── 📄 add-watermark.html
├── 📄 pdf-colour-invert.html
├── 📄 pdf-watermark-detect.html
│
├── 📁 cbt/
│   ├── 📄 cbt_index.html            # CBT Maker entry point
│   ├── 📄 Last.html                 # Runtime exam template
│   └── 📁 vendor/cropper/           # Image cropper (bundled)
│
├── 📁 libs/                         # Bundled JS libraries (offline)
│   ├── pdf-lib.min.js
│   ├── jszip.min.js
│   ├── katex.min.js
│   └── fontkit.umd.min.js
│
├── 📁 fonts/                        # Embedded fonts
│   ├── TiroBangla.woff2             # Bengali body font
│   └── DMSerifText.woff2            # Latin heading font
│
└── 📁 watermark/                    # Watermark assets
    └── default.png
```

---

## 🌐 Deployment

### GitHub Pages (Recommended)

1. **Enable Pages:** Settings → Pages → Source: Deploy from branch → `main` / root
2. **Access:** `https://<your-username>.github.io/shibu/`
3. ✅ **Auto-update:** Changes to `main` deploy instantly

### Local Server

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080/`

> ⚠️ **Note:** Use `localhost` instead of `file://`—browser security blocks fonts and WASM from `file://`

---

## 🔌 Dependencies

**Everything is bundled locally.** Internet is optional for:

| Resource | Purpose | Source | Fallback |
|----------|---------|--------|----------|
| KaTeX CSS v0.16.8 | Math styling | jsDelivr (CDN) | Unstyled but renders |
| Plus Jakarta Sans | UI font | Google Fonts | System sans-serif |
| KaTeX JS v0.16.8 | Online math engine | jsDelivr (CDN) | Local fallback |

**Bundled (offline):** pdf-lib, JSZip, fontkit, KaTeX JS (QP Maker), Bengali fonts, Cropper.js

---

## 🔧 What's New in v4.4.1

**9 Critical Bug Fixes:**
- ✅ KaTeX Online engine now renders equations (was showing raw LaTeX)
- ✅ Live preview sync for MCQ/NAT changes (instant, no compile)
- ✅ Preview uses actual render engine selection (was hardcoded)
- ✅ Responsive MCQ option layout (1–4 per row, adaptive)
- ✅ Section headers in preview match final output (true WYSIWYG)
- ✅ Missing `</body></html>` closing tags added
- ✅ Font filenames corrected to match bundled files
- ✅ KaTeX CSS loaded from CDN (was missing locally)
- ✅ Font parameter `Q_FONT_FAMILY` support in output template

**New Features:**
- ⭐ Real-time Bengali scientific notation validator with inline tooltips
- ⭐ "✏️ Corrections" modal with Bengali↔LaTeX conversion table
- ⭐ Enhanced AI extraction prompt (forbids Bengali notation)
- ⭐ Math engine detection in output (adapts KaTeX/MathML rendering)

---

## ✅ Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome / Chromium | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Mobile (Chrome/Firefox) | Latest | ✅ Responsive |

**Minimum requirement:** ES2020 support (optional chaining, nullish coalescing)

---

## ⚠️ Known Limitations

- **Client-side only:** All processing runs in browser. Large PDFs (>50 MB) may be slow on low-end hardware.
- **TiroBangla italic:** Single font file (no separate italic variant)—both italic & regular `@font-face` declarations use the same file.
- **UI font offline:** Plus Jakarta Sans loads from CDN; offline fallback is system sans-serif (layout unaffected).
- **Cropper location:** Image cropper requires `vendor/cropper/` to exist relative to `cbt/cbt_index.html`.
- **KaTeX CSS CDN-only:** Not bundled locally. Without internet, equations render unstyled (but functional).

---

## 💻 Development

**No build step required.** All tools are single HTML files.

```bash
# Clone & open
git clone https://github.com/suvadippatra/shibu.git
cd shibu

# Serve locally
python3 -m http.server 8080

# Open browser
# http://localhost:8080
```

### File Organization Tips
- All dependencies are already bundled in `libs/` and `fonts/`
- Don't delete `cbt/Last.html`—it's used at runtime as the exam template
- CDN resources are optional; local versions work offline

---

## 📋 Changelog

### v4.4.1 — August 2026
**Fixes (9):**
- KaTeX Online rendering (was raw LaTeX text)
- Live MCQ/NAT preview sync
- Preview render engine selection
- Responsive MCQ option layout
- WYSIWYG section headers
- Missing closing tags in `index.html`
- Font filename corrections
- KaTeX CSS CDN loading

**Features (4):**
- Bengali scientific notation validator
- `renderFraction()` LaTeX helper
- "✏️ Corrections" modal with Bengali→LaTeX table
- Math engine detection in output template

### v4.4.0 — May 2026
- Initial release: QP Maker + CBT Maker, LaTeX math, DOCX export, QPF format, PDF tools

---

## 🎓 Built For

Indian academic contexts—specifically:
- **State/CBSE/ICSE** question paper authoring in Bengali
- **NTA exams** (JEE, NEET, UGC NET)
- **School assessments** with flexible layouts and watermarking

---

## 👤 Credits

**Author:** [Suvadip Patra](https://github.com/suvadippatra)

**Built with:**
- [pdf-lib](https://pdf-lib.js.org/) — PDF manipulation
- [KaTeX](https://katex.org/) — Math rendering
- [JSZip](https://stuk.github.io/jszip/) — DOCX generation
- [fontkit](https://github.com/foliojs/fontkit) — Font embedding
- [Cropper.js](https://fengyuanchen.github.io/cropperjs/) — Image cropping
- [TiroBangla](https://fonts.google.com/specimen/Tiro+Bangla) — Bengali typography
- [DM Serif Text](https://fonts.google.com/specimen/DM+Serif+Text) — Latin typography

---

<div align="center">

Made with 💙 for Bengali education

**[Open QP Maker](https://suvadippatra.github.io/shibu/)** · **[Open CBT Maker](https://suvadippatra.github.io/shibu/cbt/cbt_index.html)**

*Last updated: September 12, 2026*

</div>
