# AI Agent Instructions for CBT Test Platform

## 1. When the User Uploads or Imports a New HTML CBT Test File in Chat
Whenever the user provides or uploads a new HTML test file in the conversation, the agent MUST follow this protocol before making changes:

1. **Ask for Classification**:
   - Ask the user which **Subject** (e.g., Botany, Zoology, Physics, Chemistry, Mathematics, etc.) and which **Category** (e.g., Chapterwise, Mock Test, Full Length, Kattar Tests, etc.) this test belongs to.

2. **Inspect and Analyze the File Structure**:
   - Check if the HTML uses **LaTeX** (e.g. `$...$` or `$$...$$`), **MathML** (`<math>`, `<mrow>`, `<mfrac>`), or pure HTML tags/spans.
   - Check how math and scripts are loaded: Is it using KaTeX online CDNs (`cdn.jsdelivr.net`, `cdnjs.cloudflare.com`) or native MathML?
   - Check the exam metadata in the file:
     - **Title**: `<title>` or `examTitle` or `PARAMETER 1`
     - **Duration**: `EXAM_DURATION_MINS` or `duration`
     - **Total Questions & Sections**: `QUESTION_BANK`, number of sections, questions count, marking scheme (`marksCorrect`, `marksWrong`, `maxAttempts`)
     - **Font Family**: `Q_FONT_FAMILY` or `--q-font`
     - **Answer Input Types**: MCQ, Multiple-Correct, Numerical (NAT) with Virtual Keyboard triggers.

3. **Proactively Confirm & Verify**:
   - If anything new or irregular is found in the HTML structure (new question types, different variable names, unique scripts, external styles, audio files, or image paths), explicitly report it and confirm with the user.
   - Ensure external CDN dependencies are redirected to local offline resources (`public/libs/katex.min.js`, `public/libs/katex.min.css`, `public/libs/auto-render.min.js`, and `public/libs/fonts/`).
   - Confirm font replacements (e.g., KaTeX Computer Modern, Tiro Bangla, DM Serif Text) and verify that no runtime script errors or syntax breaks will occur.

## 2. Architecture & Offline Engine Standards
- **Zero CDN Dependency**: All math (KaTeX) and fonts MUST be loaded from `/libs/` and `/fonts/` to ensure 100% offline PWA usability.
- **MathML & LaTeX Compatibility**: Both MathML and LaTeX delimited expressions must be supported seamlessly without collision or missing font glyphs.
- **Safe HTML Sanitization & Injection**: Strip remote CDN `<link>` and `<script>` tags dynamically when tests are viewed or cached in IndexedDB (`localforage`).
