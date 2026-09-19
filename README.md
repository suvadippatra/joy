# 🎓 CBT Hub — Computer Based Test Portal & Creator

> **A high-performance, offline-first Computer Based Test (CBT) portal and exam authoring suite designed for NTA / TCS iON style exam conducting with zero latency.**

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Attributions & Inventory Credits](#-attributions--inventory-credits)
4. [How to Use in Detail](#-how-to-use-in-detail)
   - [Taking CBT Exams (Student Portal)](#1-taking-cbt-exams-student-portal)
   - [Creating & Editing CBT Tests (CBT Maker)](#2-creating--editing-cbt-tests-cbt-maker)
   - [Managing Offline Storage](#3-managing-offline-storage)
5. [Local Development Setup](#-local-development-setup)
6. [Server-Side Deployment (Excluding GitHub Pages)](#-server-side-deployment-excluding-github-pages)
   - [Method 1: Docker Containerization](#method-1-docker-containerization)
   - [Method 2: Express.js Production Node Server](#method-2-expressjs-production-node-server)
   - [Method 3: Deploying to Google Cloud Run / Render / Railway / VPS](#method-3-deploying-to-cloud-hosts)
7. [How to Implement a User Login & Auth System](#-how-to-implement-a-user-login--auth-system)
8. [License Recommendation (Restricting Commercial Use)](#-license-recommendation-restricting-commercial-use)

---

## 🚀 Overview

**CBT Hub** provides a complete solution for conducting, authoring, and analyzing Computer Based Tests. Built with an offline-first PWA architecture, it guarantees 100% offline usability with KaTeX mathematical rendering, multi-script fonts, real-time analytics, and NTA/TCS iON compliant exam palettes.

---

## ✨ Key Features

- ⚡ **Zero-Latency Option Selection**: Touch-optimized (`touch-action: manipulation`) with instant visual feedback (< 16ms).
- 🧮 **Offline LaTeX & MathML**: Self-contained KaTeX math rendering engine with pre-cached Computer Modern fonts.
- 🎨 **CBT Test Authoring Suite**: Create custom chapterwise, mock, or full-length exams with live preview, Assertion-Reason formatting, image compression, and size-capped audio embedding (2MB cap).
- 📊 **Real-Time Analytics & Reports**: Automatic extraction of scores, accuracy, time spent per section, and historical performance tracking stored securely in IndexedDB (`localforage`).
- 📱 **Progressive Web App (PWA)**: Full offline service worker caching with Workbox runtime caching for prebuilt test HTMLs and KaTeX assets.

---

## 📜 Attributions & Inventory Credits

This project stands on the shoulders of open-source projects, fonts, and exam design standards. We gratefully acknowledge the following materials and technologies:

### 1. Math & Mathematical Rendering Engine
* **[KaTeX](https://katex.org/)** — Developed by Khan Academy and open-source contributors (MIT License). Used for high-speed offline LaTeX equation rendering.
* **KaTeX Computer Modern Fonts** (`KaTeX_Main`, `KaTeX_Math`, `KaTeX_AMS`, `KaTeX_Caligraphic`, `KaTeX_Size1-4`) — Included locally in `/public/libs/fonts/` under the SIL Open Font License.

### 2. Typography & Fonts
* **[Tiro Bangla](https://fonts.google.com/specimen/Tiro+Bangla)** by Tiro Typeworks (SIL Open Font License) — Used for complex Indic script and Bengali character rendering.
* **[DM Serif Text](https://fonts.google.com/specimen/DM+Serif+Text)** by Colophon Foundry (SIL Open Font License) — Used for display headers and editorial branding.
* **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** by Tokotype (SIL Open Font License) — Used for UI body copy and button controls.

### 3. Frontend Architecture & UI Frameworks
* **[React 19](https://react.dev/) & [Vite](https://vitejs.dev/)** — Modern frontend library and build tool (MIT License).
* **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS engine (MIT License).
* **[Lucide Icons](https://lucide.dev/)** — Open-source vector icon set (ISC License).
* **[Motion (framer-motion v12)](https://motion.dev/)** — Declarative UI animation library (MIT License).
* **[Recharts](https://recharts.org/)** — Composable chart library for rendering student performance reports (MIT License).

### 4. Offline Persistence & Service Worker
* **[LocalForage](https://localforage.github.io/localforage/)** by Mozilla & contributors (Apache-2.0 License) — Asynchronous IndexedDB storage manager.
* **[Vite PWA & Workbox](https://vite-pwa-org.netlify.app/)** by Google Chrome team & Vite PWA contributors (MIT License) — Service Worker compilation and offline caching strategy.

### 5. Backend & AI Integrations
* **[Express.js](https://expressjs.com/)** — Fast, unopinionated web framework for Node.js (MIT License).
* **[@google/genai SDK](https://www.npmjs.com/package/@google/genai)** — Google Gemini API client for automated question generation and paper synthesis.

### 6. Design & Interface Standards
* **NTA (National Testing Agency) & TCS iON Exam Specifications** — Design guidelines for Computer Based Test interfaces, question palette states (Answered, Marked for Review, Not Answered, Not Visited), section tabs, and countdown timer behavior.

---

## 📖 How to Use in Detail

### 1. Taking CBT Exams (Student Portal)

1. **Select Subject & Category**:
   - Launch the app and select your subject (e.g., Botany, Zoology, Physics, Chemistry, Mathematics).
   - Filter tests by category: *Chapterwise*, *Mock Test*, *Full Length*, or *Kattar Tests*.
2. **Launch Test**:
   - Click **Start Exam** to enter the full-screen CBT environment.
3. **Navigating Questions & Answering**:
   - Use the **Question Palette** on the right sidebar to jump between questions.
   - Click an option to select your answer instantly.
   - Click **Save & Next** to record your response and proceed.
   - Use **Mark for Review & Next** if you wish to revisit a question later.
   - Click **Clear Response** to deselect your answer.
4. **Submitting & Viewing Results**:
   - Once the timer expires or you click **Submit Test**, your analytics report is generated immediately.
   - View your total score, section-wise breakdown, accuracy percentage, and time spent.

### 2. Creating & Editing CBT Tests (CBT Maker)

1. **Access CBT Maker**:
   - Click **CBT Maker** in the top navigation bar.
2. **Define Test Metadata**:
   - Set Test Title, Subject, Category, Exam Duration (minutes), and Marking Scheme (Positive/Negative marks).
3. **Add & Format Questions**:
   - Select Question Type: *Single Correct (MCQ)*, *Multiple Correct (MSQ)*, or *Numerical (NAT)*.
   - Enter text or LaTeX equations using `$math$` or `$$math$$` notation.
   - **Assertion-Reason Questions**: Type statements separated by line breaks; formatting is automatically preserved via `pre-wrap`.
4. **Attaching Media**:
   - **Images**: Drag and drop images into the question or option slots. They are automatically compressed to standard WebP/JPEG format.
   - **Audio Files**: Upload audio files (MP3, WAV, OGG, AAC, WEBM). Files must adhere to the **2 MB size cap** to prevent HTML bloat.
5. **Live LaTeX Preview**:
   - Use the side-by-side **Live Preview** pane to inspect rendered equations, tables, and option choices in real-time.
6. **Compile & Export**:
   - Click **Export Standalone HTML** to generate a single, self-contained CBT HTML file ready for offline deployment.

### 3. Managing Offline Storage

- Tests saved locally are stored in your browser's IndexedDB.
- To download a test for offline use when network connectivity is available, click the **Triple-Dot Menu** on any test card and select **Save Offline**.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cbt-hub.git
cd cbt-hub

# Install dependencies
npm install

# Start the local development server (Port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🖥️ Server-Side Deployment (Excluding GitHub Pages)

When hosting CBT Hub on dedicated servers, VPS, or containerized platforms (excluding GitHub Pages), follow these configurations:

### Method 1: Docker Containerization

Create a `Dockerfile` in the root directory:

```dockerfile
# Step 1: Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Production Phase
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY server.ts ./

# Use tsx or compile server.ts to JS
RUN npm install -g tsx

EXPOSE 3000
CMD ["tsx", "server.ts"]
```

Build and run the container:

```bash
docker build -t cbt-hub .
docker run -p 3000:3000 cbt-hub
```

### Method 2: Express.js Production Node Server

1. Ensure `package.json` contains the production start script:
   ```json
   "scripts": {
     "build": "vite build",
     "start": "tsx server.ts"
   }
   ```
2. Build the static assets and run the Express server:
   ```bash
   npm run build
   npm run start
   ```

### Method 3: Deploying to Cloud Hosts

- **Google Cloud Run**:
  - Deploy directly using `gcloud run deploy --source .`
  - Ensure the container listens on port `3000` or reads `process.env.PORT`.
- **Render / Railway**:
  - Connect your repository.
  - Set Build Command: `npm run build`
  - Set Start Command: `npm start`
- **VPS (Ubuntu / DigitalOcean / AWS EC2)**:
  - Install Node.js & PM2: `npm install -g pm2`
  - Build the project: `npm run build`
  - Start process: `pm2 start "npm start" --name "cbt-hub"`
  - Set up Nginx as a reverse proxy forwarding port `80/443` to `http://127.0.0.1:3000`.

---

## 🔐 How to Implement a User Login & Auth System

To convert this single-tenant app into a multi-user platform with accounts and authentication:

### Architecture Blueprint

```
           +------------------+
           |   React Client   |
           +--------+---------+
                    | (Bearer JWT Token)
                    v
   +---------------------------------+
   |      Express.js Backend API     |
   |   (/api/auth, /api/reports)     |
   +----------------+----------------+
                    |
                    v
      +----------------------------+
      |  Database (PostgreSQL/     |
      |  MongoDB / Firestore)      |
      +----------------------------+
```

### Step-by-Step Implementation Guide

1. **Database Schema (Users & Reports)**:
   - Create a `users` table: `id`, `email`, `password_hash`, `role` (`student` | `teacher` | `admin`), `created_at`.
   - Create a `test_reports` table: `id`, `user_id` (foreign key), `test_id`, `score`, `accuracy`, `time_taken_seconds`, `responses_json`, `created_at`.

2. **Backend Authentication API Routes**:
   - Implement `/api/auth/register` (hash passwords using `bcrypt`).
   - Implement `/api/auth/login` (generate a Signed `JWT` token).
   - Add a Middleware `verifyToken`:
     ```typescript
     import { Request, Response, NextFunction } from 'express';
     import jwt from 'jsonwebtoken';

     export function authenticateToken(req: Request, res: Response, next: NextFunction) {
       const authHeader = req.headers['authorization'];
       const token = authHeader && authHeader.split(' ')[1];
       if (!token) return res.sendStatus(401);

       jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
         if (err) return res.sendStatus(403);
         (req as any).user = user;
         next();
       });
     }
     ```

3. **Client-Side Auth Context & Navigation**:
   - Wrap `App.tsx` with an `AuthProvider` managing JWT storage in `localStorage` or `httpOnly` cookies.
   - Redirect unauthenticated users to `/login` when accessing exam reports or test creation pages.
   - Sync local IndexedDB test reports to `/api/reports` whenever the device is online.

```text
Copyright (c) 2026 @suvadippatra. All rights reserved.
```
---

<p center>
  <b>CBT Hub</b> — Built with care for seamless offline assessment.
</p>
