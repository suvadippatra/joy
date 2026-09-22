import { PageSettings, DocumentAsset } from '../types/notebook';

interface FlipbookGenerateOptions {
  title: string;
  pagesHtml: string[];
  pageSettings: PageSettings;
  assets?: Record<string, DocumentAsset>;
}

/**
 * Generates an isolated, ultra-stable, self-contained 3D Flipbook Reader HTML document.
 * This document is mounted inside a sandboxed iframe (via srcdoc), guaranteeing
 * zero CSS/JS collision with the parent window and 100% offline portability.
 */
export function generateFlipbookHtml({
  title,
  pagesHtml,
  pageSettings
}: FlipbookGenerateOptions): string {
  // Safe serialized pages as JSON string with script tags escaped
  const safePagesJson = JSON.stringify(pagesHtml || []).replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 3D Flipbook Reader</title>
  <link rel="stylesheet" href="/libs/katex.min.css">
  <style>
    /* Local KaTeX Fonts */
    @font-face {
      font-family: 'KaTeX_Main';
      src: url('/libs/fonts/KaTeX_Main-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'KaTeX_Main';
      src: url('/libs/fonts/KaTeX_Main-Bold.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'KaTeX_Main';
      src: url('/libs/fonts/KaTeX_Main-Italic.woff2') format('woff2');
      font-weight: 400;
      font-style: italic;
    }
    @font-face {
      font-family: 'KaTeX_Math';
      src: url('/libs/fonts/KaTeX_Math-Italic.woff2') format('woff2');
      font-weight: 400;
      font-style: italic;
    }
    @font-face {
      font-family: 'KaTeX_SansSerif';
      src: url('/libs/fonts/KaTeX_SansSerif-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: #f1f5f9;
      color: #0f172a;
      font-family: 'KaTeX_Main', serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      user-select: none;
      -webkit-user-select: none;
    }

    /* Top Control Bar */
    .top-bar {
      height: 50px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 100;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .book-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    .badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 6px;
      background: #4f46e5;
      color: white;
      text-transform: uppercase;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 5px 11px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .btn-action:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .btn-action.active {
      background: #4f46e5;
      color: white;
      border-color: #4338ca;
    }

    /* Main Stage */
    .stage {
      flex: 1;
      position: relative;
      perspective: 2500px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 20px;
      background: radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%);
    }

    /* Book Container */
    .book-wrapper {
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.2s ease-out;
      transform-origin: center center;
    }

    .book {
      position: relative;
      display: flex;
      transform-style: preserve-3d;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.1);
    }

    /* Central Spine Shadow */
    .book::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 24px;
      transform: translateX(-50%);
      background: linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.01) 60%, rgba(0,0,0,0.15) 100%);
      pointer-events: none;
      z-index: 50;
    }

    /* Page Leaf */
    .page-leaf {
      width: 440px;
      height: 620px;
      background: #ffffff;
      color: #0f172a;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 36px 32px;
      font-size: 13px;
      line-height: 1.55;
      position: relative;
      user-select: text;
      -webkit-user-select: text;
    }

    .page-leaf::-webkit-scrollbar {
      width: 4px;
    }
    .page-leaf::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 4px;
    }

    .page-left {
      border-radius: 6px 0 0 6px;
      border-right: 1px solid #e2e8f0;
    }

    .page-right {
      border-radius: 0 6px 6px 0;
      border-left: 1px solid #e2e8f0;
    }

    .page-num-badge {
      position: absolute;
      bottom: 12px;
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
    }
    .page-left .page-num-badge {
      left: 32px;
    }
    .page-right .page-num-badge {
      right: 32px;
    }

    /* Navigation Click Hotspots */
    .nav-hotspot {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 60px;
      z-index: 60;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .nav-hotspot:hover {
      opacity: 1;
    }
    .nav-hotspot-left {
      left: 0;
      border-radius: 6px 0 0 6px;
    }
    .nav-hotspot-right {
      right: 0;
      border-radius: 0 6px 6px 0;
    }

    .nav-arrow {
      background: rgba(15, 23, 42, 0.7);
      color: white;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    /* Bottom Control & Thumbnail Drawer */
    .bottom-bar {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 10px 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 100;
      flex-shrink: 0;
      box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
    }

    .controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-nav-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-slider {
      width: 180px;
      accent-color: #4f46e5;
      cursor: pointer;
    }

    .page-counter {
      font-size: 12px;
      font-family: monospace;
      color: #64748b;
      font-weight: 600;
    }

    /* Thumbnail Tray */
    .thumbnail-tray {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 6px 0;
      max-height: 90px;
      transition: all 0.3s ease;
    }
    .thumbnail-tray.hidden {
      display: none;
    }
    .thumb-card {
      width: 55px;
      height: 75px;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 4px;
      cursor: pointer;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #0f172a;
      transition: all 0.15s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .thumb-card:hover {
      transform: translateY(-2px);
      border-color: #4f46e5;
    }
    .thumb-card.active {
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
    }

    /* Simulation in Flipbook */
    .notebook-simulation-wrapper {
      margin: 12px 0;
      border-radius: 8px;
      overflow: hidden;
    }

    /* Tables in Flipbook */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .page-left {
        display: none;
      }
      .page-leaf {
        width: 90vw;
        max-width: 440px;
      }
      .book::after {
        display: none;
      }
    }
  </style>
</head>
<body>

  <!-- Top Bar -->
  <div class="top-bar">
    <div class="book-info">
      <span class="badge">3D Flipbook</span>
      <span style="font-weight: 600; color: #0f172a;">${title}</span>
    </div>

    <div class="toolbar-actions">
      <!-- Sound toggle -->
      <button class="btn-action" id="btnSound" title="Toggle Page Flip Sound">
        <span id="soundIcon">🔊</span>
        <span id="soundLabel">Sound ON</span>
      </button>

      <!-- Zoom controls -->
      <button class="btn-action" id="btnZoomOut" title="Zoom Out">−</button>
      <span id="zoomLabel" style="font-size: 11px; color: #64748b; font-family: monospace; min-width: 38px; text-align: center;">100%</span>
      <button class="btn-action" id="btnZoomIn" title="Zoom In">+</button>
      <button class="btn-action" id="btnZoomReset" title="Reset Zoom">Fit</button>

      <!-- Thumbnails Toggle -->
      <button class="btn-action" id="btnThumbnails">
        <span>📑</span>
        <span>Pages</span>
      </button>
    </div>
  </div>

  <!-- Stage -->
  <div class="stage" id="stage">
    <div class="book-wrapper" id="bookWrapper">
      <div class="book" id="book">
        <!-- Navigation Click Hotspots -->
        <div class="nav-hotspot nav-hotspot-left" id="hotspotLeft" title="Previous Page">
          <div class="nav-arrow">◀</div>
        </div>
        <div class="nav-hotspot nav-hotspot-right" id="hotspotRight" title="Next Page">
          <div class="nav-arrow">▶</div>
        </div>

        <!-- Left Leaf -->
        <div class="page-leaf page-left" id="leftPage">
          <div id="leftContent"></div>
          <div class="page-num-badge" id="leftPageNum"></div>
        </div>

        <!-- Right Leaf -->
        <div class="page-leaf page-right" id="rightPage">
          <div id="rightContent"></div>
          <div class="page-num-badge" id="rightPageNum"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="bottom-bar">
    <div class="controls-row">
      <div class="page-nav-controls">
        <button class="btn-action" id="btnFirst" title="First Page">|◀</button>
        <button class="btn-action" id="btnPrev" title="Previous Page">◀ Prev</button>
        <input type="range" class="page-slider" id="pageSlider" min="0" max="1" value="0">
        <button class="btn-action" id="btnNext" title="Next Page">Next ▶</button>
        <button class="btn-action" id="btnLast" title="Last Page">▶|</button>
      </div>

      <div class="page-counter" id="pageCounter">
        Page 1 of 1
      </div>
    </div>

    <!-- Thumbnail Drawer -->
    <div class="thumbnail-tray hidden" id="thumbnailTray"></div>
  </div>

  <!-- Safe Pages Data Injection -->
  <script id="flipbook-pages-data" type="application/json">
${safePagesJson}
  </script>

  <script>
    let pages = [];
    try {
      const dataEl = document.getElementById('flipbook-pages-data');
      pages = JSON.parse(dataEl ? dataEl.textContent : '[]');
    } catch (e) {
      console.error('Failed to parse flipbook pages JSON:', e);
      pages = ['<p style="padding: 20px; color: #64748b;">Error rendering pages</p>'];
    }

    if (!Array.isArray(pages) || pages.length === 0) {
      pages = ['<div style="padding: 24px; color: #64748b; font-style: italic;">No document pages available</div>'];
    }

    const totalPages = pages.length;
    let currentPageIndex = 0; // Tracks left page (even index in spread)
    let zoomLevel = 1.0;
    let soundEnabled = true;

    // Web Audio API Paper Rustle Synthesizer
    let audioCtx = null;
    function playPageTurnSound() {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const bufferSize = audioCtx.sampleRate * 0.12; // 120ms duration
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 2.0;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        noise.start();
      } catch (e) {
        // Audio optional
      }
    }

    // DOM Elements
    const leftContent = document.getElementById('leftContent');
    const rightContent = document.getElementById('rightContent');
    const leftPageNum = document.getElementById('leftPageNum');
    const rightPageNum = document.getElementById('rightPageNum');
    const pageCounter = document.getElementById('pageCounter');
    const pageSlider = document.getElementById('pageSlider');
    const bookWrapper = document.getElementById('bookWrapper');
    const thumbnailTray = document.getElementById('thumbnailTray');

    pageSlider.max = Math.max(0, totalPages - 1);

    function updatePages(playAudio = false) {
      if (playAudio) playPageTurnSound();

      const isMobile = window.innerWidth <= 900;

      if (isMobile) {
        // Single page mode on mobile
        leftContent.innerHTML = '';
        leftPageNum.innerText = '';
        rightContent.innerHTML = pages[currentPageIndex] || '<p style="color: #94a3b8; font-style: italic;">End of document</p>';
        rightPageNum.innerText = 'Page ' + (currentPageIndex + 1);
        pageCounter.innerText = 'Page ' + (currentPageIndex + 1) + ' of ' + totalPages;
      } else {
        // Spread mode: Even index on Left (if >0), Odd index on Right
        if (currentPageIndex === 0) {
          // If totalPages is 1: show page 1 on left or right cleanly
          if (totalPages === 1) {
            leftContent.innerHTML = pages[0] || '';
            leftPageNum.innerText = 'Page 1';
            rightContent.innerHTML = '<div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic;">End of document</div>';
            rightPageNum.innerText = '';
            pageCounter.innerText = 'Page 1 of 1';
          } else {
            // First page / Cover spread
            leftContent.innerHTML = '<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-style: italic; gap: 8px;"><div style="font-weight: 700; font-size: 16px; color: #0f172a;">${title}</div><div>Academic Publication Cover</div></div>';
            leftPageNum.innerText = '';
            rightContent.innerHTML = pages[0] || '';
            rightPageNum.innerText = 'Page 1';
            pageCounter.innerText = 'Page 1 of ' + totalPages;
          }
        } else {
          const lIdx = currentPageIndex % 2 === 1 ? currentPageIndex - 1 : currentPageIndex;
          const rIdx = lIdx + 1;

          leftContent.innerHTML = pages[lIdx] || '';
          leftPageNum.innerText = 'Page ' + (lIdx + 1);

          rightContent.innerHTML = pages[rIdx] || '<div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic;">End of document</div>';
          rightPageNum.innerText = rIdx < totalPages ? 'Page ' + (rIdx + 1) : '';

          pageCounter.innerText = 'Pages ' + (lIdx + 1) + (rIdx < totalPages ? ' - ' + (rIdx + 1) : '') + ' of ' + totalPages;
        }
      }

      pageSlider.value = currentPageIndex;
      updateThumbnailsActive();
    }

    function flipNext() {
      const isMobile = window.innerWidth <= 900;
      const step = isMobile ? 1 : 2;
      if (currentPageIndex + step < totalPages) {
        currentPageIndex += step;
        updatePages(true);
      } else if (currentPageIndex < totalPages - 1) {
        currentPageIndex = totalPages - 1;
        updatePages(true);
      }
    }

    function flipPrev() {
      const isMobile = window.innerWidth <= 900;
      const step = isMobile ? 1 : 2;
      if (currentPageIndex - step >= 0) {
        currentPageIndex -= step;
        updatePages(true);
      } else if (currentPageIndex > 0) {
        currentPageIndex = 0;
        updatePages(true);
      }
    }

    // Navigation Listeners
    document.getElementById('hotspotRight').onclick = flipNext;
    document.getElementById('hotspotLeft').onclick = flipPrev;
    document.getElementById('btnNext').onclick = flipNext;
    document.getElementById('btnPrev').onclick = flipPrev;

    document.getElementById('btnFirst').onclick = () => {
      if (currentPageIndex !== 0) {
        currentPageIndex = 0;
        updatePages(true);
      }
    };

    document.getElementById('btnLast').onclick = () => {
      const lastIdx = Math.max(0, totalPages - 1);
      if (currentPageIndex !== lastIdx) {
        currentPageIndex = lastIdx;
        updatePages(true);
      }
    };

    pageSlider.oninput = (e) => {
      currentPageIndex = parseInt(e.target.value, 10);
      updatePages(false);
    };

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        flipPrev();
      } else if (e.key === 'Home') {
        currentPageIndex = 0;
        updatePages(true);
      } else if (e.key === 'End') {
        currentPageIndex = Math.max(0, totalPages - 1);
        updatePages(true);
      }
    });

    // Sound Toggle
    const btnSound = document.getElementById('btnSound');
    const soundIcon = document.getElementById('soundIcon');
    const soundLabel = document.getElementById('soundLabel');
    btnSound.onclick = () => {
      soundEnabled = !soundEnabled;
      soundIcon.innerText = soundEnabled ? '🔊' : '🔇';
      soundLabel.innerText = soundEnabled ? 'Sound ON' : 'Muted';
      btnSound.classList.toggle('active', soundEnabled);
    };

    // Thumbnails Tray
    function buildThumbnailTray() {
      thumbnailTray.innerHTML = '';
      pages.forEach((_, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'thumb-card' + (idx === currentPageIndex ? ' active' : '');
        thumb.innerHTML = '<span style="font-weight:700;">' + (idx + 1) + '</span><span style="font-size:9px;color:#64748b;">Page</span>';
        thumb.onclick = () => {
          currentPageIndex = idx;
          updatePages(true);
        };
        thumbnailTray.appendChild(thumb);
      });
    }

    function updateThumbnailsActive() {
      const cards = thumbnailTray.querySelectorAll('.thumb-card');
      cards.forEach((card, idx) => {
        card.classList.toggle('active', idx === currentPageIndex);
      });
    }

    // Zoom Controls
    const zoomLabel = document.getElementById('zoomLabel');
    function applyZoom() {
      bookWrapper.style.transform = 'scale(' + zoomLevel + ')';
      zoomLabel.innerText = Math.round(zoomLevel * 100) + '%';
    }
    document.getElementById('btnZoomIn').onclick = () => {
      if (zoomLevel < 1.8) {
        zoomLevel += 0.15;
        applyZoom();
      }
    };
    document.getElementById('btnZoomOut').onclick = () => {
      if (zoomLevel > 0.5) {
        zoomLevel -= 0.15;
        applyZoom();
      }
    };
    document.getElementById('btnZoomReset').onclick = () => {
      zoomLevel = 1.0;
      applyZoom();
    };

    // Thumbnail toggle
    const btnThumbnails = document.getElementById('btnThumbnails');
    btnThumbnails.onclick = () => {
      thumbnailTray.classList.toggle('hidden');
      btnThumbnails.classList.toggle('active', !thumbnailTray.classList.contains('hidden'));
    };

    // Window resize handling
    window.addEventListener('resize', () => updatePages(false));

    // Initialize immediately
    buildThumbnailTray();
    updatePages(false);
  </script>
</body>
</html>`;
}
