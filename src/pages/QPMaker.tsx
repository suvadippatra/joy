import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderQpfText, escapeHtml } from '../utils/qpBilingualMath';

const QP_STYLES = `
.qp-maker-root {
  --bg: #0f1117; --surface: #181c27; --surface2: #1f2435; --surface3: #252b3d;
  --border: #2a3047; --border2: #343d58;
  --accent: #4f8ef7; --accent2: #7c5cfc; --accent-glow: rgba(79,142,247,0.16);
  --green: #2dd4a0; --red: #f75f5f; --orange: #f79b4f;
  --text: #e2e6f3; --text2: #8b93b0; --text3: #555f7d;
  --radius: 8px; --sidebar-w: 440px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  background: var(--bg); color: var(--text);
  height: 100vh; width: 100vw; display: flex; flex-direction: column; overflow: hidden;
  user-select: none;
}
.qp-maker-root.light-mode {
  --bg: #f0f2f7; --surface: #ffffff; --surface2: #e8ecf4; --surface3: #dde2ef;
  --border: #ccd3e8; --border2: #b8c2dc;
  --accent: #2563eb; --accent2: #6d28d9; --accent-glow: rgba(37,99,235,0.12);
  --green: #059669; --red: #dc2626; --orange: #d97706;
  --text: #1a2035; --text2: #4a5578; --text3: #8892b0;
}
.qp-maker-root * { box-sizing: border-box; }
.qp-maker-root input, .qp-maker-root textarea, .qp-maker-root select, .qp-maker-root #preview-vp { user-select: text; }

/* TOPBAR */
.qp-maker-root #topbar {
  height: 50px; background: var(--surface); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 14px; gap: 10px; flex-shrink: 0; z-index: 30;
}
.qp-maker-root .brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem; letter-spacing: -0.02em; white-space: nowrap; }
.qp-maker-root .brand-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 0 8px var(--accent); }
.qp-maker-root .brand em { font-style: normal; color: var(--accent); }
.qp-maker-root .vdiv { width: 1px; height: 22px; background: var(--border); flex-shrink: 0; }
.qp-maker-root #paper-badge {
  font-size: 0.78rem; color: var(--text2); background: var(--surface2);
  border: 1px solid var(--border); border-radius: 5px; padding: 3px 10px;
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.qp-maker-root .spacer { flex: 1; }
.qp-maker-root .tbtn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 6px; font-size: 0.78rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface2);
  color: var(--text2); transition: all 0.14s; white-space: nowrap; font-family: inherit;
}
.qp-maker-root .tbtn:hover { background: var(--surface3); color: var(--text); border-color: var(--border2); }
.qp-maker-root .tbtn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.qp-maker-root .tbtn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.qp-maker-root .tbtn.primary:hover { background: #3a7be8; }

/* WORKSPACE */
.qp-maker-root #workspace { display: flex; flex: 1; overflow: hidden; position: relative; }

/* SIDEBAR */
.qp-maker-root #sidebar {
  width: var(--sidebar-w); flex-shrink: 0;
  display: flex; flex-direction: column;
  background: var(--surface); border-right: 1px solid var(--border); overflow: hidden;
  min-width: 280px; max-width: 72vw;
}
.qp-maker-root #resize-handle {
  width: 5px; flex-shrink: 0; cursor: col-resize;
  background: transparent; position: relative; z-index: 20;
  transition: background 0.15s;
}
.qp-maker-root #resize-handle:hover, .qp-maker-root #resize-handle.dragging { background: var(--accent); }

.qp-maker-root #import-strip {
  padding: 8px 12px; background: var(--surface2); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 7px; flex-shrink: 0; flex-wrap: wrap;
}
.qp-maker-root #import-strip .strip-label { font-size: 0.7rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; margin-right: 2px; }
.qp-maker-root .sbtn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 5px; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface3);
  color: var(--text2); transition: all 0.13s; font-family: inherit;
}
.qp-maker-root .sbtn:hover { color: var(--text); border-color: var(--accent); }
.qp-maker-root .sbtn.accent { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.qp-maker-root .sbtn.green { background: rgba(45,212,160,0.12); border-color: rgba(45,212,160,0.35); color: var(--green); }

/* Import Drawer */
.qp-maker-root #import-drawer {
  background: var(--surface2); border-bottom: 1px solid var(--border);
  overflow: hidden; max-height: 0; transition: max-height 0.25s ease; flex-shrink: 0;
}
.qp-maker-root #import-drawer.open { max-height: 360px; overflow-y: auto; }
.qp-maker-root .drawer-inner { padding: 12px; }
.qp-maker-root .drawer-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
.qp-maker-root .dtab {
  padding: 4px 12px; border-radius: 5px; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface3);
  color: var(--text2); font-family: inherit; transition: all 0.13s;
}
.qp-maker-root .dtab.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.qp-maker-root .dtab-pane { display: none; }
.qp-maker-root .dtab-pane.active { display: block; }
.qp-maker-root #qpf-paste {
  width: 100%; height: 110px; background: var(--bg); border: 1px solid var(--border);
  border-radius: 6px; color: var(--text); font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem; padding: 8px; resize: none; outline: none; line-height: 1.5;
}
.qp-maker-root #qpf-paste:focus { border-color: var(--accent); }
.qp-maker-root .drop-zone {
  border: 2px dashed var(--border2); border-radius: 7px; padding: 20px;
  text-align: center; cursor: pointer; transition: all 0.15s; color: var(--text2); font-size: 0.8rem;
}
.qp-maker-root .drop-zone:hover, .qp-maker-root .drop-zone.drag { border-color: var(--accent); background: var(--accent-glow); color: var(--accent); }
.qp-maker-root .drawer-actions { display: flex; gap: 6px; margin-top: 8px; align-items: center; }

/* SIDEBAR SCROLL */
.qp-maker-root #sidebar-scroll { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.qp-maker-root #sidebar-scroll::-webkit-scrollbar { width: 4px; }
.qp-maker-root #sidebar-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

/* Accordion Cards */
.qp-maker-root .acard { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; flex-shrink: 0; }
.qp-maker-root .acard-head {
  display: flex; align-items: center; gap: 7px; padding: 9px 12px;
  cursor: pointer; user-select: none; border-bottom: 1px solid transparent; transition: background 0.13s;
}
.qp-maker-root .acard-head:hover { background: var(--surface3); }
.qp-maker-root .acard.open .acard-head { border-bottom-color: var(--border); }
.qp-maker-root .acard-icon { font-size: 0.85rem; flex-shrink: 0; }
.qp-maker-root .acard-title { font-size: 0.8rem; font-weight: 700; flex: 1; }
.qp-maker-root .acard-meta { font-size: 0.7rem; color: var(--text3); font-family: 'JetBrains Mono', monospace; }
.qp-maker-root .acard-chev { font-size: 0.65rem; color: var(--text3); transition: transform 0.18s; }
.qp-maker-root .acard.open .acard-chev { transform: rotate(180deg); }
.qp-maker-root .acard-body { display: none; padding: 11px 12px; }
.qp-maker-root .acard.open .acard-body { display: block; }

/* Form grid */
.qp-maker-root .fg { display: grid; gap: 7px; margin-bottom: 7px; }
.qp-maker-root .fg.c2 { grid-template-columns: 1fr 1fr; }
.qp-maker-root .fg.c3 { grid-template-columns: 1fr 1fr 1fr; }
.qp-maker-root .fg.c4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.qp-maker-root .fl { display: flex; flex-direction: column; gap: 3px; }
.qp-maker-root .fl label { font-size: 0.67rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }
.qp-maker-root input[type=text], .qp-maker-root input[type=number], .qp-maker-root select, .qp-maker-root textarea {
  background: var(--bg); border: 1px solid var(--border); border-radius: 5px;
  color: var(--text); font-family: inherit; font-size: 0.8rem; padding: 5px 8px;
  outline: none; transition: border-color 0.13s; width: 100%;
}
.qp-maker-root input:focus, .qp-maker-root select:focus, .qp-maker-root textarea:focus { border-color: var(--accent); }
.qp-maker-root textarea { resize: vertical; min-height: 46px; line-height: 1.45; }
.qp-maker-root select option { background: #1f2435; color: #e2e6f3; }

/* Section badge */
.qp-maker-root .sec-badge {
  font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;
  background: var(--accent-glow); color: var(--accent); border: 1px solid rgba(79,142,247,0.3);
  font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
}

/* Question cards */
.qp-maker-root .qlist { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.qp-maker-root .qcard {
  background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 10px; position: relative; transition: border-color 0.13s;
}
.qp-maker-root .qcard:hover { border-color: var(--border2); }
.qp-maker-root .qcard.or-linked { border-left: 3px solid var(--accent2); }
.qp-maker-root .qcard.or-selecting { border-color: var(--orange) !important; background: rgba(247,155,79,0.06); cursor: pointer; }
.qp-maker-root .qcard-top { display: flex; align-items: center; gap: 5px; margin-bottom: 6px; }
.qp-maker-root .qnum { font-size: 0.7rem; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
.qp-maker-root .qcard-actions { display: flex; gap: 3px; margin-left: auto; }
.qp-maker-root .ibtn {
  padding: 2px 6px; border-radius: 4px; font-size: 0.67rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface2);
  color: var(--text3); font-family: inherit; transition: all 0.12s; line-height: 1.4;
}
.qp-maker-root .ibtn:hover { color: var(--text); border-color: var(--border2); }
.qp-maker-root .ibtn.del:hover { background: rgba(247,95,95,0.12); border-color: var(--red); color: var(--red); }
.qp-maker-root .ibtn.or-on { background: rgba(124,92,252,0.18); border-color: var(--accent2); color: #b9a4ff; }

/* Options grid */
.qp-maker-root .opts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 5px; }
.qp-maker-root .opt-row { display: flex; align-items: center; gap: 4px; }
.qp-maker-root .opt-lbl { font-size: 0.7rem; color: var(--accent); font-weight: 700; min-width: 18px; flex-shrink: 0; }
.qp-maker-root .or-pill {
  display: flex; align-items: center; gap: 6px; padding: 3px 10px;
  background: rgba(124,92,252,0.1); border: 1px dashed rgba(124,92,252,0.4);
  border-radius: 4px; font-size: 0.7rem; color: #b9a4ff; font-weight: 700; margin: 2px 0;
}
.qp-maker-root .add-row { display: flex; gap: 5px; margin-top: 8px; flex-wrap: wrap; }
.qp-maker-root .abtn {
  flex: 1; padding: 6px 8px; border-radius: 5px; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; border: 1px dashed var(--border2); background: transparent;
  color: var(--text2); font-family: inherit; transition: all 0.13s; text-align: center; white-space: nowrap;
}
.qp-maker-root .abtn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
.qp-maker-root .abtn.or-mode { border-color: var(--orange); color: var(--orange); background: rgba(247,155,79,0.08); }

/* Extra items on non-MCQ questions */
.qp-maker-root .qextra-bar { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.qp-maker-root .xbtn {
  padding: 2px 8px; border-radius: 4px; font-size: 0.67rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface3);
  color: var(--text2); font-family: inherit; transition: all 0.12s;
}
.qp-maker-root .xbtn:hover { border-color: var(--accent); color: var(--accent); }
.qp-maker-root .xbtn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.qp-maker-root .qextra-box { margin-top: 6px; padding: 8px; background: var(--surface2); border: 1px solid var(--border); border-radius: 5px; }
.qp-maker-root .qextra-box-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 0.7rem; font-weight: 700; color: var(--text2); }

/* Table builder */
.qp-maker-root .tbl-wrap { overflow-x: auto; margin-top: 4px; }
.qp-maker-root .tbl-edit { border-collapse: collapse; width: 100%; font-size: 0.75rem; }
.qp-maker-root .tbl-edit td, .qp-maker-root .tbl-edit th { border: 1px solid var(--border2); padding: 2px; }
.qp-maker-root .tbl-edit input { border: none; background: transparent; padding: 3px 5px; font-size: 0.74rem; width: 100%; min-width: 55px; color: var(--text); }
.qp-maker-root .tbl-edit th input { font-weight: 700; color: var(--accent); }
.qp-maker-root .tbl-controls { display: flex; gap: 4px; margin-top: 5px; flex-wrap: wrap; }

/* Diagram canvas modal */
.qp-maker-root #dia-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; align-items: center; justify-content: center; }
.qp-maker-root #dia-modal.open { display: flex; }
.qp-maker-root #dia-box { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; width: 580px; max-width: 96vw; }
.qp-maker-root #dia-toolbar { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.qp-maker-root .dtool { padding: 4px 10px; border-radius: 5px; font-size: 0.74rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--surface2); color: var(--text2); font-family: inherit; }
.qp-maker-root .dtool.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.qp-maker-root #dia-canvas { border: 1px solid var(--border2); border-radius: 6px; background: #fff; cursor: crosshair; touch-action: none; display: block; max-width: 100%; }

/* Export bar */
.qp-maker-root #export-bar {
  padding: 8px 12px; background: var(--surface); border-top: 1px solid var(--border);
  display: flex; gap: 6px; flex-shrink: 0;
}
.qp-maker-root .ebtn {
  flex: 1; padding: 7px 6px; border-radius: 6px; font-size: 0.74rem; font-weight: 700;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface2);
  color: var(--text2); font-family: inherit; transition: all 0.13s; text-align: center;
}
.qp-maker-root .ebtn:hover { color: var(--text); border-color: var(--border2); }
.qp-maker-root .ebtn.odt { background: rgba(45,212,160,0.1); border-color: rgba(45,212,160,0.35); color: var(--green); }
.qp-maker-root .ebtn.pdf { background: var(--accent); border-color: var(--accent); color: #fff; }
.qp-maker-root .ebtn.qpf { background: rgba(124,92,252,0.12); border-color: rgba(124,92,252,0.35); color: #b9a4ff; }

/* SETTINGS PANEL */
.qp-maker-root #settings-panel {
  background: var(--surface); border-bottom: 1px solid var(--border);
  overflow: hidden; max-height: 0; transition: max-height 0.25s ease; flex-shrink: 0;
}
.qp-maker-root #settings-panel.open { max-height: 290px; overflow-y: auto; }
.qp-maker-root .sp-inner { padding: 12px 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 10px 16px; align-items: end; }
.qp-maker-root .sp-group { display: flex; flex-direction: column; gap: 4px; }
.qp-maker-root .sp-label { font-size: 0.67rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; }
.qp-maker-root .sp-label span { color: var(--accent); font-family: 'JetBrains Mono', monospace; }
.qp-maker-root input[type=range] { width: 100%; accent-color: var(--accent); cursor: pointer; padding: 0; border: none; background: transparent; }
.qp-maker-root .seg { display: flex; border: 1px solid var(--border); border-radius: 5px; overflow: hidden; }
.qp-maker-root .seg-btn {
  flex: 1; padding: 4px 5px; font-size: 0.7rem; font-weight: 600; text-align: center;
  cursor: pointer; background: var(--bg); color: var(--text2); border: none;
  border-right: 1px solid var(--border); font-family: inherit; transition: all 0.12s; white-space: nowrap;
}
.qp-maker-root .seg-btn:last-child { border-right: none; }
.qp-maker-root .seg-btn.active { background: var(--accent); color: #fff; }

/* PREVIEW AREA */
.qp-maker-root #right-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 260px; }
.qp-maker-root #preview { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #141720; }
.qp-maker-root #preview-bar {
  height: 38px; background: var(--surface); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 14px; gap: 8px; flex-shrink: 0;
}
.qp-maker-root .pbar-label { font-size: 0.7rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; }
.qp-maker-root .lchip {
  padding: 3px 9px; border-radius: 4px; font-size: 0.72rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: var(--surface2);
  color: var(--text2); transition: all 0.12s; font-family: inherit;
}
.qp-maker-root .lchip.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.qp-maker-root .zbtn {
  width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); cursor: pointer; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; font-family: inherit;
}
.qp-maker-root .zbtn:hover { border-color: var(--accent); color: var(--accent); }
.qp-maker-root #zlabel { font-size: 0.7rem; color: var(--text2); font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: center; }

.qp-maker-root #preview-vp {
  flex: 1; overflow: auto; padding: 24px;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
}
.qp-maker-root #preview-vp::-webkit-scrollbar { width: 6px; height: 6px; }
.qp-maker-root #preview-vp::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

/* A4 SHEET */
.qp-maker-root .a4-sheet {
  background: #fff; color: #000;
  box-shadow: 0 6px 32px rgba(0,0,0,0.55);
  position: relative; flex-shrink: 0; overflow: hidden;
  transform-origin: top center;
}
.qp-maker-root .a4-sheet.portrait  { width: 210mm; height: 297mm; }
.qp-maker-root .a4-sheet.landscape { width: 297mm; height: 210mm; }
.qp-maker-root .a4-sheet.flow-mode { height: auto; min-height: 297mm; overflow: visible; }
.qp-maker-root .sheet-grid { width: 100%; height: 100%; display: grid; }
.qp-maker-root .sheet-grid.g1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
.qp-maker-root .sheet-grid.g2.portrait  { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
.qp-maker-root .sheet-grid.g2.landscape { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
.qp-maker-root .sheet-grid.g4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.qp-maker-root .qp-cell { overflow: hidden; position: relative; box-sizing: border-box; }
.qp-maker-root .a4-sheet.flow-mode .qp-cell { overflow: visible; }

/* Cut lines */
.qp-maker-root .sheet-grid.g2.portrait  .qp-cell:first-child { border-bottom: var(--cut-w,1px) var(--cut-s,dashed) #888; }
.qp-maker-root .sheet-grid.g2.landscape .qp-cell:first-child { border-right:  var(--cut-w,1px) var(--cut-s,dashed) #888; }
.qp-maker-root .sheet-grid.g4 .qp-cell:nth-child(1) { border-right: var(--cut-w,1px) var(--cut-s,dashed) #888; border-bottom: var(--cut-w,1px) var(--cut-s,dashed) #888; }
.qp-maker-root .sheet-grid.g4 .qp-cell:nth-child(2) { border-bottom: var(--cut-w,1px) var(--cut-s,dashed) #888; }
.qp-maker-root .sheet-grid.g4 .qp-cell:nth-child(3) { border-right: var(--cut-w,1px) var(--cut-s,dashed) #888; }

.qp-maker-root .cut-mark { position: absolute; font-size: 9pt; color: #777; pointer-events: none; z-index: 5; line-height: 1; }

/* Watermark */
.qp-maker-root .cell-wm {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  pointer-events: none; z-index: 2; overflow: hidden;
}
.qp-maker-root .cell-wm img {
  width: var(--wm-size, 55%); height: auto; max-height: 80%;
  object-fit: contain; opacity: var(--wm-opacity, 0.08);
  filter: grayscale(20%); user-select: none; -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

/* PAPER TYPOGRAPHY & BENGALI + ENGLISH MATH */
.qp-maker-root .qp-paper {
  font-family: 'Noto Serif Bengali', 'Tiro Bangla', 'Times New Roman', serif;
  color: #000; width: 100%; height: 100%; box-sizing: border-box; position: relative; z-index: 1;
}
.qp-maker-root .qp-hdr { text-align: center; margin-bottom: 5px; padding-bottom: 4px; }
.qp-maker-root .qp-hdr.b-single  { border: 1.5px solid #000; padding: 5px 8px; }
.qp-maker-root .qp-hdr.b-double  { border: 3px double #000; padding: 5px 8px; }
.qp-maker-root .qp-hdr.b-rounded { border: 1.5px solid #000; border-radius: 5px; padding: 5px 8px; }
.qp-maker-root .qp-hdr.b-bottom  { border-bottom: 2px solid #000; }
.qp-maker-root .qp-hdr.b-none    { border: none; }
.qp-maker-root .qp-school { font-weight: 700; line-height: 1.2; }
.qp-maker-root .qp-sub    { font-weight: 600; margin-top: 1px; }
.qp-maker-root .qp-meta   { display: flex; justify-content: space-between; margin-top: 3px; font-weight: 600; }
.qp-maker-root .qp-Meta-center { text-align: center; margin-top: 2px; font-weight: 600; }
.qp-maker-root .qp-instr  { font-style: italic; margin-top: 2px; }
.qp-maker-root .qp-div    { margin: 3px 0; }
.qp-maker-root .qp-div.d-solid  { border-top: 1.5px solid #000; }
.qp-maker-root .qp-div.d-double { border-top: 3px double #000; }
.qp-maker-root .qp-div.d-dashed { border-top: 1px dashed #000; }
.qp-maker-root .qp-div.d-none   { display: none; }
.qp-maker-root .qp-sec-hdr {
  font-weight: 700; text-align: center; background: #ebebeb;
  border: 1px solid #bbb; padding: 1.5px 6px; margin: 5px 0 3px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.qp-maker-root .qp-sec-info { text-align: center; font-style: italic; margin-bottom: 3px; }
.qp-maker-root .qp-q { margin-bottom: 3px; text-align: justify; }
.qp-maker-root .qp-q-row { display: flex; gap: 4px; align-items: baseline; }
.qp-maker-root .qp-qn { font-weight: 700; flex-shrink: 0; }
.qp-maker-root .qp-qt { flex: 1; }
.qp-maker-root .qp-qm { font-weight: 600; flex-shrink: 0; margin-left: 3px; white-space: nowrap; }
.qp-maker-root .qp-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 1px 10px; margin-top: 2px; padding-left: 12px; }
.qp-maker-root .qp-or { text-align: center; font-weight: 700; font-style: italic; margin: 2px 0; position: relative; }
.qp-maker-root .qp-or::before, .qp-maker-root .qp-or::after { content: ''; position: absolute; top: 50%; width: 36%; border-top: 1px dotted #555; }
.qp-maker-root .qp-or::before { left: 0; }
.qp-maker-root .qp-or::after  { right: 0; }

/* Scientific & Bilingual Math tokens */
.qp-maker-root .tok-chem { font-family: 'Noto Serif Bengali', 'Times New Roman', serif; white-space: nowrap; }
.qp-maker-root .tok-sym  { font-family: 'Times New Roman', 'Noto Serif Bengali', serif; }
.qp-maker-root .tok-eq   { display: inline-block; vertical-align: middle; margin: 0 1px; }
.qp-maker-root .tok-eq-block { display: block; text-align: center; margin: 4px 0; }
.qp-maker-root .tok-eq .katex { font-size: 1.02em; }
.qp-maker-root .tok-eq .katex .text,
.qp-maker-root .tok-eq .katex .mord.text {
  font-family: 'Noto Serif Bengali', 'Tiro Bangla', 'Times New Roman', serif !important;
}
.qp-maker-root .qp-inline-frac {
  display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle;
  margin: 0 2px; font-size: 0.9em; line-height: 1.1;
}
.qp-maker-root .qp-inline-frac .qp-frac-num { border-bottom: 1px solid #000; padding: 0 2px; }
.qp-maker-root .qp-inline-frac .qp-frac-den { padding: 0 2px; }

/* Answer space */
.qp-maker-root .qp-ans-space { width: 100%; box-sizing: border-box; border-bottom: 1px dotted #bbb; margin-top: 2px; }

/* Extra rendered elements on paper */
.qp-maker-root .qp-img-wrap { margin: 4px 0; }
.qp-maker-root .qp-img-wrap img { max-width: 100%; height: auto; display: block; }
.qp-maker-root .qp-tbl { border-collapse: collapse; width: 100%; margin: 4px 0; font-size: inherit; }
.qp-maker-root .qp-tbl th, .qp-maker-root .qp-tbl td { border: 1px solid #000; padding: 2px 5px; text-align: left; }
.qp-maker-root .qp-tbl th { font-weight: 700; background: #e8e8e8; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

/* GUIDE & INFO DRAWERS */
.qp-maker-root #guide, .qp-maker-root #info {
  position: fixed; right: 0; top: 50px; bottom: 0; width: 390px; max-width: 92vw;
  background: var(--surface); border-left: 1px solid var(--border);
  z-index: 100; transform: translateX(100%); transition: transform 0.24s ease;
  display: flex; flex-direction: column; overflow: hidden;
}
.qp-maker-root #guide.open, .qp-maker-root #info.open { transform: translateX(0); }
.qp-maker-root .g-head { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.qp-maker-root .g-head h3 { font-size: 0.88rem; font-weight: 700; margin: 0; }
.qp-maker-root .g-body { flex: 1; overflow-y: auto; padding: 14px 16px; font-size: 0.78rem; line-height: 1.65; color: var(--text2); }
.qp-maker-root .g-body h4 { color: var(--accent); font-size: 0.8rem; margin: 14px 0 5px; }
.qp-maker-root .g-body h4:first-child { margin-top: 0; }
.qp-maker-root .g-body pre {
  background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
  padding: 9px 11px; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
  color: #a8d8a8; overflow-x: auto; white-space: pre; line-height: 1.5; margin: 5px 0;
}
.qp-maker-root .g-body code { background: var(--surface2); padding: 1px 5px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--orange); }

/* TOAST */
.qp-maker-root #toasts { position: fixed; bottom: 16px; right: 16px; z-index: 999; display: flex; flex-direction: column; gap: 6px; }
.qp-maker-root .toast {
  background: var(--surface2); border: 1px solid var(--border); border-left: 3px solid var(--green);
  border-radius: 7px; padding: 9px 14px; font-size: 0.78rem; color: var(--text);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4); animation: qpSlideIn 0.18s ease; max-width: 320px;
}
.qp-maker-root .toast.err  { border-left-color: var(--red); }
.qp-maker-root .toast.warn { border-left-color: var(--orange); }
@keyframes qpSlideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

@media print {
  @page { size: A4; margin: 0; }
  body * { visibility: hidden; }
  .qp-maker-root #preview-vp, .qp-maker-root #preview-vp * { visibility: visible; }
  .qp-maker-root #preview-vp { position: fixed; inset: 0; padding: 0; gap: 0; background: #fff; overflow: visible; }
  .qp-maker-root .a4-sheet { box-shadow: none; page-break-after: always; transform: none !important; margin-bottom: 0 !important; }
  .qp-maker-root .a4-sheet:last-child { page-break-after: avoid; }
}
`;

const DEMO_QPF = `@EXAM
TITLE: বার্ষিক পরীক্ষা — ২০২৫
SUBJECT: ভৌতবিজ্ঞান ও গণিত (Bilingual Demo)
CLASS: দশম শ্রেণী
TIME: ৩ ঘণ্টা ১৫ মিনিট
MARKS: ৯০
HEADER_LAYOUT: standard
HEADER_BOX: double
DIVIDER: double
INSTRUCTIONS: সমস্ত প্রশ্নের উত্তর দাও। ভগ্নাংশ ও গাণিতিক সমীকরণ বাংলা ও ইংরেজি উভয় ভাষাতেই সমর্থিত।

@SECTION
NAME: বিভাগ 'ক'
TYPE: mcq
MARKS_PER_Q: 1
ANSWER_ANY: 15
OPT_STYLE: bn
INFO: সঠিক উত্তরটি বেছে নিয়ে লেখো:

@Q জলের রাসায়নিক সংকেত কী? [CHEM:H2O] এবং সালফিউরিক অ্যাসিড [CHEM:H2SO4]-এর আণবিক ভর কত?
@OPT [CHEM:H2O] ও ৯৮
@OPT [CHEM:CO2] ও ৪৪
@OPT [CHEM:NaCl] ও ৫৮.৫
@OPT [CHEM:NH3] ও ১৭

@Q যদি কোনো ভগ্নাংশের $\\frac{লব}{হর} = \\frac{৩}{৪}$ হয় এবং তাকে $\\frac{৯}{১৬}$ দিয়ে ভাগ করা হয় ($\\frac{৩}{৪} \\div \\frac{৯}{১৬}$), তবে ভাগফল কত হবে?
@OPT $\\frac{৪}{৩}$
@OPT $\\frac{৩}{৪}$
@OPT $\\frac{২৭}{৬৪}$
@OPT $\\frac{১৬}{৯}$

@Q দ্বিঘাত সমীকরণ [EQ:ax^2 + bx + c = 0]-এর বীজদ্বয় নির্ণয়ের শ্রীধর আচার্যের সূত্রটি হলো:
@OPT [EQ:x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}]
@OPT [EQ:x = \\frac{b \\pm \\sqrt{b^2 + 4ac}}{2a}]
@OPT [EQ:x = \\frac{-b}{2a}]
@OPT [EQ:x = \\sqrt{\\frac{c}{a}}]

@Q ওহমের সূত্র অনুযায়ী রোধের একক কী?
@OPT [SYM:ohm] (ওহম)
@OPT জুল (J)
@OPT ওয়াট (W)
@OPT ভোল্ট (V)

@SECTION
NAME: বিভাগ 'খ'
TYPE: short
MARKS_PER_Q: 2
ANSWER_ANY: 10
INFO: সংক্ষিপ্ত উত্তর দাও:

@Q নিউটনের দ্বিতীয় গতিসূত্রটি লেখো এবং দেখাও যে $F = m \\times a$ বা $\\text{বল} = \\frac{\\text{ভরবেগের পরিবর্তন}}{\\text{সময়}}$।
@Q ফ্যারাডের তড়িৎচুম্বকীয় আবেশের সূত্র দুটি বিবৃত করো। [EQ:\\mathcal{E} = -N\\frac{d\\Phi_B}{dt}]
@OR
@Q লেন্জের সূত্রটি লেখো এবং শক্তির সংরক্ষণ সূত্রের সাথে এর সম্পর্ক ব্যাখ্যা করো।
@Q সালোকসংশ্লেষের রাসায়নিক সমীকরণটি লেখো: [CHEM:6CO2 + 6H2O -> C6H12O6 + 6O2]

@SECTION
NAME: বিভাগ 'গ'
TYPE: descriptive
MARKS_PER_Q: 5
ANSWER_ANY: 5
INFO: যেকোনো পাঁচটি প্রশ্নের উত্তর দাও:

@Q গ্যাসের গতিতত্ত্বের মূল স্বীকার্যগুলি লেখো। আদর্শ গ্যাস সমীকরণ [EQ:PV = nRT] থেকে দেখাও যে স্থির তাপমাত্রায় $\\frac{P_1}{P_2} = \\frac{V_2}{V_1}$। (1+3+1)
@OR
@Q বয়েলের সূত্র ও চার্লসের সূত্রের সমন্বয়ে আদর্শ গ্যাস সমীকরণটি প্রতিষ্ঠা করো। (2+3)
@Q তড়িৎপ্রবাহের তাপীয় ফল সংক্রান্ত জুলের সূত্রগুলি লেখো এবং [EQ:H = \\frac{I^2 R t}{J}] সমীকরণটি ব্যাখ্যা করো। (2+3)
`;

const PROMPT_IMG = `You are an expert OCR engine for Indian school exam papers (Bengali, English, Hindi, Sanskrit, Science, Math).
Carefully read the attached question paper image(s) and convert EVERY question into QPF v1.1 format below.

CRITICAL RULES FOR SCIENTIFIC & BILINGUAL MATH CONTENT:
1. Chemical formulas → wrap in [CHEM:...] using plain ASCII:
   Water = [CHEM:H2O], Sulfuric acid = [CHEM:H2SO4], Glucose = [CHEM:C6H12O6]
   Ions: [CHEM:SO4^2-], [CHEM:Fe^3+], [CHEM:NH4+]
   Reactions: [CHEM:2H2 + O2 -> 2H2O], reversible: [CHEM:N2 + 3H2 <=> 2NH3]

2. Math / Physics equations & Fractions (English or Bengali) → wrap in [EQ:...] or $...$ using LaTeX:
   Fractions (English): [EQ:\\frac{a}{b}]
   Fractions (Bengali numerals or words): [EQ:\\frac{৩}{৪}] or $\\frac{লব}{হর}$
   Division: [EQ:১২ \\div ৪ = ৩]
   Square root: [EQ:\\sqrt{x^2 + y^2}], Superscript/subscript: [EQ:v = u + at], [EQ:E = mc^2]
   Quadratic: [EQ:x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}]

3. Special symbols → wrap in [SYM:...]:
   Degrees: [SYM:deg] or [SYM:celsius], Ohm: [SYM:ohm], Micro: [SYM:micro]

4. Simple subscript/superscript outside math → [SUB:2], [SUP:3+]
5. Preserve original language (Bengali stays Bengali, English stays English).
6. If two questions have OR / অথবা between them, put @OR on its own line between them.
7. Output ONLY the raw QPF text below — no explanation, no markdown fences.

--- QPF FORMAT ---
@EXAM
TITLE: <exam name>
SUBJECT: <subject>
CLASS: <class>
TIME: <duration>
MARKS: <total marks>
HEADER_LAYOUT: standard
HEADER_BOX: double
DIVIDER: solid
INSTRUCTIONS: <instructions if any>

@SECTION
NAME: <e.g. বিভাগ 'ক' or Section A>
TYPE: <mcq | short | descriptive | long>
MARKS_PER_Q: <number>
ANSWER_ANY: <number>
OPT_STYLE: <bn | en>
INFO: <section instruction>

@Q <question text with [CHEM:...], [EQ:...], $...$, [SYM:...] tags>
@OPT <option A>
@OPT <option B>
@OPT <option C>
@OPT <option D>
--- END FORMAT ---`;

const PROMPT_TXT = `Convert the following raw question paper text into QPF v1.1 format.

RULES:
- Chemical formulas → [CHEM:H2O], [CHEM:H2SO4], [CHEM:CO2], reactions: [CHEM:A + B -> C]
- Math/Physics equations & fractions (Bengali or English) → [EQ:\\frac{a}{b}], [EQ:\\frac{৩}{৪}], $\\frac{লব}{হর}$, [EQ:x^2], [EQ:\\sqrt{x}]
- Symbols → [SYM:deg], [SYM:ohm], [SYM:alpha], [SYM:pi], [SYM:pm], [SYM:times], [SYM:neq], [SYM:leq], [SYM:geq]
- Subscript/superscript → [SUB:n], [SUP:2+]
- OR questions → put @OR on its own line between the two questions
- Keep original language intact. Output ONLY raw QPF text, no markdown fences.

PASTE YOUR RAW QUESTIONS BELOW THIS LINE:
-----------------------------------------
`;

export default function QPMaker() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Ensure local KaTeX CSS & JS and JSZip are loaded for 100% offline math & ODT export
    if (!document.getElementById('qp-katex-css')) {
      const link = document.createElement('link');
      link.id = 'qp-katex-css';
      link.rel = 'stylesheet';
      link.href = `${import.meta.env.BASE_URL}libs/katex.min.css`;
      document.head.appendChild(link);
    }

    const loadScript = (id: string, src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.id = id;
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });
    };

    const bnNum = (n: number | string) => String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
    const bnAlpha = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'];
    const enAlpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const secBn = ["বিভাগ 'ক'", "বিভাগ 'খ'", "বিভাগ 'গ'", "বিভাগ 'ঘ'", "বিভাগ 'ঙ'", "বিভাগ 'চ'", "বিভাগ 'ছ'", "বিভাগ 'জ'", "বিভাগ 'ঝ'", "বিভাগ 'ঞ'"];
    const secEn = ["Section 'A'", "Section 'B'", "Section 'C'", "Section 'D'", "Section 'E'", "Section 'F'", "Section 'G'", "Section 'H'", "Section 'I'", "Section 'J'"];

    let S: any = {
      exam: {
        title: 'বার্ষিক পরীক্ষা - ২০২৫',
        subject: 'ভৌতবিজ্ঞান',
        class: 'দশম শ্রেণী',
        time: '৩ ঘণ্টা ১৫ মিনিট',
        marks: '৯০',
        instructions: 'সমস্ত প্রশ্নের উত্তর দাও। ডানদিকের সংখ্যা পূর্ণমান নির্দেশ করে।',
        headerLayout: 'standard',
        headerBox: 'double',
        divider: 'double'
      },
      cfg: {
        fs: 10.5,
        lh: 1.38,
        pad: 0.9,
        orient: 'auto',
        cut: 'dashed',
        layout: 1,
        zoom: 0.72,
        wmOpacity: 0.08,
        wmSize: 55,
        wmSrc: 'none',
        wmCustomData: '',
        wmUnlocked: false,
        ansSpace: false,
        lang: 'mixed'
      },
      sections: []
    };

    let orMode: { secIdx: number } | null = null;
    let orFirst: number | null = null;

    const $ = (id: string) => root.querySelector(`#${id}`) as any;
    const esc = (s: any) => escapeHtml(s);
    const renderTok = (raw: any) => renderQpfText(raw);

    function toast(msg: string, type = '') {
      const box = $('toasts');
      if (!box) return;
      const el = document.createElement('div');
      el.className = 'toast' + (type ? ' ' + type : '');
      el.textContent = msg;
      box.appendChild(el);
      setTimeout(() => el.remove(), 3400);
    }

    function readExamForm() {
      S.exam.title = $('ei-title')?.value || '';
      S.exam.subject = $('ei-sub')?.value || '';
      S.exam.class = $('ei-cls')?.value || '';
      S.exam.time = $('ei-time')?.value || '';
      S.exam.marks = $('ei-marks')?.value || '';
      S.exam.instructions = $('ei-instr')?.value || '';
      S.exam.headerLayout = $('ei-hlayout')?.value || 'standard';
      S.exam.headerBox = $('ei-hbox')?.value || 'double';
      S.exam.divider = $('ei-div')?.value || 'double';
      if ($('paper-badge')) $('paper-badge').textContent = S.exam.title || 'Untitled';
      if ($('ei-meta')) $('ei-meta').textContent = S.exam.subject || '';
    }

    function pushExamForm() {
      if ($('ei-title')) $('ei-title').value = S.exam.title;
      if ($('ei-sub')) $('ei-sub').value = S.exam.subject;
      if ($('ei-cls')) $('ei-cls').value = S.exam.class;
      if ($('ei-time')) $('ei-time').value = S.exam.time;
      if ($('ei-marks')) $('ei-marks').value = S.exam.marks;
      if ($('ei-instr')) $('ei-instr').value = S.exam.instructions;
      if ($('ei-hlayout')) $('ei-hlayout').value = S.exam.headerLayout;
      if ($('ei-hbox')) $('ei-hbox').value = S.exam.headerBox;
      if ($('ei-div')) $('ei-div').value = S.exam.divider;
      if ($('paper-badge')) $('paper-badge').textContent = S.exam.title || 'Untitled';
      if ($('ei-meta')) $('ei-meta').textContent = S.exam.subject || '';
    }

    function parseQPF(raw: string) {
      const lines = raw.split(/\r?\n/);
      const exam: any = { ...S.exam };
      const sections: any[] = [];
      let curSec: any = null;
      let curQ: any = null;
      let pendingOr = false;
      let mode: string | null = null;

      const flushQ = () => {
        if (curQ && curSec) {
          curSec.questions.push(curQ);
          curQ = null;
        }
      };
      const flushSec = () => {
        flushQ();
        if (curSec) {
          sections.push(curSec);
          curSec = null;
        }
      };

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;
        if (line === '@EXAM') {
          flushSec();
          mode = 'exam';
          continue;
        }
        if (line === '@SECTION') {
          flushSec();
          mode = 'sec';
          curSec = {
            id: Date.now() + Math.random(),
            name: secBn[sections.length] || `Section ${sections.length + 1}`,
            type: 'short',
            marksPerQ: 2,
            answerAny: 5,
            optStyle: 'bn',
            info: '',
            questions: []
          };
          continue;
        }
        if (line === '@OR') {
          flushQ();
          if (curSec && curSec.questions.length > 0) pendingOr = true;
          continue;
        }
        if (line.startsWith('@Q ') || line === '@Q') {
          flushQ();
          if (!curSec) {
            curSec = {
              id: Date.now(),
              name: secBn[0],
              type: 'short',
              marksPerQ: 2,
              answerAny: 5,
              optStyle: 'bn',
              info: '',
              questions: []
            };
          }
          curQ = {
            id: Date.now() + Math.random(),
            text: line.slice(2).trim(),
            opts: [],
            orWithPrev: pendingOr,
            marks: ''
          };
          pendingOr = false;
          mode = 'q';
          continue;
        }
        if (line.startsWith('@OPT ') && curQ) {
          curQ.opts.push(line.slice(5).trim());
          continue;
        }
        if (line.startsWith('@MARKS ') && curQ) {
          curQ.marks = line.slice(7).trim();
          continue;
        }

        const kv = line.match(/^([A-Z_]+)\s*:\s*(.*)$/);
        if (kv) {
          const [, k, v] = kv;
          if (mode === 'exam') {
            if (k === 'TITLE') exam.title = v;
            else if (k === 'SUBJECT') exam.subject = v;
            else if (k === 'CLASS') exam.class = v;
            else if (k === 'TIME') exam.time = v;
            else if (k === 'MARKS') exam.marks = v;
            else if (k === 'INSTRUCTIONS') exam.instructions = v;
            else if (k === 'HEADER_LAYOUT') exam.headerLayout = v.toLowerCase();
            else if (k === 'HEADER_BOX') exam.headerBox = v.toLowerCase();
            else if (k === 'DIVIDER') exam.divider = v.toLowerCase();
          } else if ((mode === 'sec' || mode === 'q') && curSec) {
            if (k === 'NAME') curSec.name = v;
            else if (k === 'TYPE') curSec.type = v.toLowerCase();
            else if (k === 'MARKS_PER_Q') curSec.marksPerQ = parseFloat(v) || 1;
            else if (k === 'ANSWER_ANY') curSec.answerAny = parseInt(v) || 5;
            else if (k === 'OPT_STYLE') curSec.optStyle = v.toLowerCase();
            else if (k === 'INFO') curSec.info = v;
          }
          continue;
        }
        if (mode === 'q' && curQ) curQ.text += ' ' + line;
      }
      flushSec();

      sections.forEach((sec) => {
        if (sec.type === 'mcq') {
          sec.questions.forEach((q: any) => {
            while (q.opts.length < 4) q.opts.push('');
          });
        }
      });

      return { exam, sections };
    }

    function toQPF(): string {
      readExamForm();
      let o = `@EXAM\nTITLE: ${S.exam.title}\nSUBJECT: ${S.exam.subject}\nCLASS: ${S.exam.class}\nTIME: ${S.exam.time}\nMARKS: ${S.exam.marks}\nHEADER_LAYOUT: ${S.exam.headerLayout}\nHEADER_BOX: ${S.exam.headerBox}\nDIVIDER: ${S.exam.divider}\nINSTRUCTIONS: ${S.exam.instructions}\n`;
      S.sections.forEach((sec: any) => {
        o += `\n@SECTION\nNAME: ${sec.name}\nTYPE: ${sec.type}\nMARKS_PER_Q: ${sec.marksPerQ}\nANSWER_ANY: ${sec.answerAny}\nOPT_STYLE: ${sec.optStyle}\nINFO: ${sec.info}\n\n`;
        sec.questions.forEach((q: any) => {
          if (q.orWithPrev) o += `@OR\n`;
          o += `@Q ${q.text}\n`;
          if (q.marks) o += `@MARKS ${q.marks}\n`;
          if (sec.type === 'mcq') (q.opts || []).forEach((op: string) => (o += `@OPT ${op}\n`));
        });
      });
      return o;
    }

    function applyQPF(raw: string) {
      if (!raw.trim()) {
        toast('Nothing to import!', 'err');
        return;
      }
      try {
        const { exam, sections } = parseQPF(raw);
        S.exam = exam;
        if (sections.length > 0) S.sections = sections;
        pushExamForm();
        renderSections();
        renderPreview();
        $('import-drawer')?.classList.remove('open');
        $('btn-import-toggle')?.classList.remove('active');
        toast(`Imported ${sections.length} section(s), ${sections.reduce((a, s) => a + s.questions.length, 0)} questions!`);
      } catch (e: any) {
        toast('Parse error: ' + e.message, 'err');
      }
    }

    function renderSections() {
      const wrap = $('secs');
      if (!wrap) return;
      wrap.innerHTML = '';

      S.sections.forEach((sec: any, si: number) => {
        const total = sec.marksPerQ * sec.answerAny;
        const isOrSec = orMode && orMode.secIdx === si;
        const card = document.createElement('div');
        card.className = 'acard open';

        let qHTML = '';
        let displayNum = 0;
        sec.questions.forEach((q: any, qi: number) => {
          if (!q.orWithPrev) displayNum++;
          const qLabel = q.orWithPrev ? '↳ OR' : `Q${displayNum}`;
          const isOrSel = isOrSec && orFirst !== qi;

          if (q.orWithPrev) {
            qHTML += `<div class="or-pill"><span>— অথবা / OR —</span>
              <button class="ibtn del" data-act="unlink-or" data-si="${si}" data-qi="${qi}" style="margin-left:auto">✕ Unlink</button>
            </div>`;
          }

          let optsHTML = '';
          if (sec.type === 'mcq') {
            const labels = sec.optStyle === 'en' ? enAlpha : bnAlpha;
            optsHTML =
              `<div class="opts-grid">` +
              [0, 1, 2, 3]
                .map(
                  (oi) => `
              <div class="opt-row">
                <span class="opt-lbl">${labels[oi]})</span>
                <input type="text" value="${esc(q.opts[oi] || '')}" placeholder="Option ${labels[oi]} (supports $...$ / [EQ:...])"
                  data-act="q-opt" data-si="${si}" data-qi="${qi}" data-oi="${oi}">
              </div>`
                )
                .join('') +
              `</div>`;
            const mimg = q.mcqImg;
            optsHTML += mimg
              ? `<div class="qextra-box" style="margin-top:5px">
                  <div class="qextra-box-head"><span>🖼 Image</span>
                    <div style="display:flex;gap:4px;align-items:center">
                      <select data-act="mcqimg-align" data-si="${si}" data-qi="${qi}" style="font-size:0.68rem;padding:1px 4px;width:auto">
                        <option value="left" ${mimg.align === 'left' ? 'selected' : ''}>Left</option>
                        <option value="center" ${!mimg.align || mimg.align === 'center' ? 'selected' : ''}>Center</option>
                        <option value="right" ${mimg.align === 'right' ? 'selected' : ''}>Right</option>
                      </select>
                      <input type="range" min="15" max="100" value="${mimg.width || 50}" style="width:65px"
                        data-act="mcqimg-w" data-si="${si}" data-qi="${qi}" title="Size %">
                      <button class="ibtn del" data-act="mcqimg-del" data-si="${si}" data-qi="${qi}">✕</button>
                    </div>
                  </div>
                  <img src="${mimg.src}" style="max-height:70px;max-width:100%;border-radius:4px;display:block" alt="">
                </div>`
              : `<div style="margin-top:4px"><button class="xbtn" data-act="mcqimg-add" data-si="${si}" data-qi="${qi}">🖼 +Image</button></div>`;
          }

          let extraBarHTML = '';
          let extraBoxesHTML = '';
          if (sec.type !== 'mcq') {
            const ex = q.extra || {};
            extraBarHTML = `<div class="qextra-bar">
              <button class="xbtn ${ex.img ? 'active' : ''}" data-act="x-img" data-si="${si}" data-qi="${qi}">🖼 Image</button>
              <button class="xbtn ${ex.tbl ? 'active' : ''}" data-act="x-tbl" data-si="${si}" data-qi="${qi}">⊞ Table</button>
              <button class="xbtn ${ex.dia ? 'active' : ''}" data-act="x-dia" data-si="${si}" data-qi="${qi}">✏ Diagram</button>
              <button class="xbtn ${ex.ldia ? 'active' : ''}" data-act="x-ldia" data-si="${si}" data-qi="${qi}">🏷 Labeled Diagram</button>
            </div>`;

            if (ex.img) {
              extraBoxesHTML += `<div class="qextra-box">
                <div class="qextra-box-head"><span>🖼 Image</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <select data-act="img-align" data-si="${si}" data-qi="${qi}" style="font-size:0.68rem;padding:1px 4px;width:auto">
                      <option value="left" ${ex.img.align === 'left' ? 'selected' : ''}>Left</option>
                      <option value="center" ${!ex.img.align || ex.img.align === 'center' ? 'selected' : ''}>Center</option>
                      <option value="right" ${ex.img.align === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                    <input type="range" min="20" max="100" value="${ex.img.width || 60}" style="width:70px"
                      data-act="img-w" data-si="${si}" data-qi="${qi}" title="Width %">
                    <button class="ibtn del" data-act="x-img-del" data-si="${si}" data-qi="${qi}">✕</button>
                  </div>
                </div>
                ${
                  ex.img.src
                    ? `<img src="${ex.img.src}" style="max-height:80px;max-width:100%;border-radius:4px;display:block;margin-bottom:4px" alt="">`
                    : ''
                }
                <button class="sbtn" data-act="img-pick" data-si="${si}" data-qi="${qi}" style="width:100%;justify-content:center">📂 ${
                ex.img.src ? 'Change Image' : 'Upload Image'
              }</button>
              </div>`;
            }

            if (ex.tbl) {
              const t = ex.tbl;
              let rowsH = '';
              for (let r = 0; r < t.rows; r++) {
                let cellsH = '';
                for (let c = 0; c < t.cols; c++) {
                  const val = (t.data[r] && t.data[r][c]) || '';
                  const tag = r === 0 && t.hasHeader ? 'th' : 'td';
                  cellsH += `<${tag}><input type="text" value="${esc(val)}" placeholder="${
                    r === 0 && t.hasHeader ? 'Header' : 'Cell'
                  }"
                    data-act="tbl-cell" data-si="${si}" data-qi="${qi}" data-r="${r}" data-c="${c}"></${tag}>`;
                }
                rowsH += `<tr>${cellsH}</tr>`;
              }
              extraBoxesHTML += `<div class="qextra-box">
                <div class="qextra-box-head"><span>⊞ Table (${t.rows}×${t.cols})</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <label style="font-size:0.67rem;display:flex;align-items:center;gap:3px;cursor:pointer">
                      <input type="checkbox" ${t.hasHeader ? 'checked' : ''} data-act="tbl-hdr" data-si="${si}" data-qi="${qi}" style="width:auto"> Header row
                    </label>
                    <button class="ibtn del" data-act="x-tbl-del" data-si="${si}" data-qi="${qi}">✕</button>
                  </div>
                </div>
                <div class="tbl-wrap"><table class="tbl-edit">${rowsH}</table></div>
                <div class="tbl-controls">
                  <button class="ibtn" data-act="tbl-r+" data-si="${si}" data-qi="${qi}">+ Row</button>
                  <button class="ibtn" data-act="tbl-r-" data-si="${si}" data-qi="${qi}">− Row</button>
                  <button class="ibtn" data-act="tbl-c+" data-si="${si}" data-qi="${qi}">+ Col</button>
                  <button class="ibtn" data-act="tbl-c-" data-si="${si}" data-qi="${qi}">− Col</button>
                </div>
              </div>`;
            }

            if (ex.dia) {
              extraBoxesHTML += `<div class="qextra-box">
                <div class="qextra-box-head"><span>✏ Diagram</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <select data-act="dia-align" data-si="${si}" data-qi="${qi}" style="font-size:0.68rem;padding:1px 4px;width:auto">
                      <option value="left" ${ex.dia.align === 'left' ? 'selected' : ''}>Left</option>
                      <option value="center" ${!ex.dia.align || ex.dia.align === 'center' ? 'selected' : ''}>Center</option>
                      <option value="right" ${ex.dia.align === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                    <input type="range" min="20" max="100" value="${ex.dia.width || 65}" style="width:70px"
                      data-act="dia-w" data-si="${si}" data-qi="${qi}" title="Width %">
                    <button class="ibtn del" data-act="x-dia-del" data-si="${si}" data-qi="${qi}">✕</button>
                  </div>
                </div>
                ${
                  ex.dia.src
                    ? `<img src="${ex.dia.src}" style="max-height:80px;max-width:100%;border-radius:4px;background:#fff;display:block;margin-bottom:4px" alt="">`
                    : ''
                }
                <button class="sbtn accent" data-act="dia-open" data-si="${si}" data-qi="${qi}" style="width:100%;justify-content:center">✏ ${
                ex.dia.src ? 'Edit Diagram' : 'Draw Diagram'
              }</button>
              </div>`;
            }

            if (ex.ldia) {
              const ld = ex.ldia;
              const labelsHTML = (ld.labels || [])
                .map(
                  (lb: string, li: number) => `
                <div style="display:flex;gap:4px;align-items:center;margin-bottom:3px">
                  <span style="font-size:0.7rem;color:var(--accent);font-weight:700;min-width:22px">${formatLabelIdx(li, ld.style)})</span>
                  <input type="text" value="${esc(lb)}" placeholder="Label ${li + 1} (blank = student fills)"
                    data-act="ldia-lbl" data-si="${si}" data-qi="${qi}" data-li="${li}" style="flex:1;font-size:0.74rem;padding:3px 6px">
                  <button class="ibtn del" data-act="ldia-lbl-del" data-si="${si}" data-qi="${qi}" data-li="${li}">✕</button>
                </div>`
                )
                .join('');
              extraBoxesHTML += `<div class="qextra-box">
                <div class="qextra-box-head"><span>🏷 Labeled Diagram</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <select data-act="ldia-style" data-si="${si}" data-qi="${qi}" style="font-size:0.68rem;padding:1px 4px;width:auto" title="Numbering style">
                      <option value="num" ${(!ld.style || ld.style === 'num') ? 'selected' : ''}>1, 2, 3</option>
                      <option value="alpha" ${ld.style === 'alpha' ? 'selected' : ''}>A, B, C</option>
                      <option value="alphal" ${ld.style === 'alphal' ? 'selected' : ''}>a, b, c</option>
                      <option value="roman" ${ld.style === 'roman' ? 'selected' : ''}>i, ii, iii</option>
                      <option value="bn" ${ld.style === 'bn' ? 'selected' : ''}>ক, খ, গ</option>
                    </select>
                    <input type="range" min="20" max="75" value="${ld.imgW || 45}" style="width:60px"
                      data-act="ldia-w" data-si="${si}" data-qi="${qi}" title="Image width %">
                    <button class="ibtn del" data-act="x-ldia-del" data-si="${si}" data-qi="${qi}">✕</button>
                  </div>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:6px">
                  <button class="sbtn" data-act="ldia-img" data-si="${si}" data-qi="${qi}" style="flex:1;justify-content:center">📂 ${
                ld.src ? 'Change Image' : 'Upload Image'
              }</button>
                  <button class="sbtn accent" data-act="ldia-draw" data-si="${si}" data-qi="${qi}" style="flex:1;justify-content:center">✏ Draw</button>
                </div>
                ${
                  ld.src
                    ? `<img src="${ld.src}" style="max-height:70px;max-width:100%;border-radius:4px;background:#fff;display:block;margin-bottom:6px" alt="">`
                    : ''
                }
                <div style="margin-bottom:4px">${labelsHTML}</div>
                <button class="ibtn" data-act="ldia-lbl-add" data-si="${si}" data-qi="${qi}" style="width:100%;text-align:center;padding:4px">+ Add Label Line</button>
              </div>`;
            }
          }

          qHTML += `
            <div class="qcard ${q.orWithPrev ? 'or-linked' : ''} ${isOrSel ? 'or-selecting' : ''}"
                 data-si="${si}" data-qi="${qi}" ${isOrSec ? `data-act="or-pick"` : ''}>
              <div class="qcard-top">
                <span class="qnum">${qLabel}</span>
                <input type="text" value="${esc(q.marks || '')}" placeholder="marks e.g. 2 or 1+2"
                  style="width:82px;font-size:0.7rem;padding:2px 6px"
                  data-act="q-marks" data-si="${si}" data-qi="${qi}" title="Custom marks override">
                ${
                  S.cfg.ansSpace && sec.type !== 'mcq'
                    ? `
                <input type="number" value="${q.ansLines ?? ''}" min="0" max="200" step="2" placeholder="mm"
                  style="width:52px;font-size:0.7rem;padding:2px 5px"
                  data-act="q-lines" data-si="${si}" data-qi="${qi}" title="Blank space height in mm">`
                    : ''
                }
                <div class="qcard-actions">
                  ${
                    qi > 0
                      ? `<button class="ibtn ${q.orWithPrev ? 'or-on' : ''}" data-act="toggle-or" data-si="${si}" data-qi="${qi}" title="Toggle OR with previous">অথবা</button>`
                      : ''
                  }
                  <button class="ibtn del" data-act="del-q" data-si="${si}" data-qi="${qi}">✕</button>
                </div>
              </div>
              <textarea rows="2" placeholder="প্রশ্ন লিখুন... ফর্মুলা: [EQ:\\frac{৩}{৪}], $\\frac{লব}{হর}$, [CHEM:H2O]"
                data-act="q-text" data-si="${si}" data-qi="${qi}">${esc(q.text)}</textarea>
              ${optsHTML}
              ${extraBarHTML}
              ${extraBoxesHTML}
            </div>`;
        });

        card.innerHTML = `
          <div class="acard-head" data-act="toggle-card">
            <span class="sec-badge">${esc(sec.name)}</span>
            <span class="acard-title">${sec.questions.length} Qs · ${sec.type.toUpperCase()}</span>
            <span class="acard-meta">${sec.marksPerQ}×${sec.answerAny}=${total}M</span>
            <button class="ibtn del" data-act="del-sec" data-si="${si}" style="margin-left:4px">✕</button>
            <span class="acard-chev">▾</span>
          </div>
          <div class="acard-body">
            <div class="fg ${S.cfg.ansSpace && sec.type !== 'mcq' ? 'c4' : 'c3'}">
              <div class="fl"><label>Section Name</label>
                <input type="text" value="${esc(sec.name)}" data-act="sec-name" data-si="${si}">
              </div>
              <div class="fl"><label>Type</label>
                <select data-act="sec-type" data-si="${si}">
                  <option value="mcq" ${sec.type === 'mcq' ? 'selected' : ''}>MCQ</option>
                  <option value="short" ${sec.type === 'short' ? 'selected' : ''}>Short</option>
                  <option value="descriptive" ${sec.type === 'descriptive' ? 'selected' : ''}>Descriptive</option>
                  <option value="long" ${sec.type === 'long' ? 'selected' : ''}>Long</option>
                </select>
              </div>
              <div class="fl"><label>Opt Style</label>
                <select data-act="sec-opt" data-si="${si}">
                  <option value="bn" ${sec.optStyle === 'bn' ? 'selected' : ''}>ক খ গ ঘ</option>
                  <option value="en" ${sec.optStyle === 'en' ? 'selected' : ''}>a b c d</option>
                </select>
              </div>
              ${
                S.cfg.ansSpace && sec.type !== 'mcq'
                  ? `
              <div class="fl"><label>Gap (mm)</label>
                <input type="number" value="${sec.ansLines ?? (sec.type === 'short' ? 15 : sec.type === 'descriptive' ? 35 : 55)}" min="0" max="200" step="2"
                  data-act="sec-lines" data-si="${si}" title="Default blank space in mm after each question">
              </div>`
                  : ''
              }
            </div>
            <div class="fg c3">
              <div class="fl"><label>Marks / Q</label>
                <input type="number" value="${sec.marksPerQ}" min="0.5" step="0.5" data-act="sec-mpq" data-si="${si}">
              </div>
              <div class="fl"><label>Answer Any</label>
                <input type="number" value="${sec.answerAny}" min="1" data-act="sec-any" data-si="${si}">
              </div>
              <div class="fl"><label>Total Marks</label>
                <input type="text" value="${total}" readonly style="opacity:0.55;cursor:default">
              </div>
            </div>
            <div class="fg">
              <div class="fl"><label>Section Instruction</label>
                <input type="text" value="${esc(sec.info)}" placeholder="e.g. যেকোনো পাঁচটি প্রশ্নের উত্তর দাও" data-act="sec-info" data-si="${si}">
              </div>
            </div>
            <div class="qlist">${qHTML}</div>
            <div class="add-row">
              <button class="abtn" data-act="add-q" data-si="${si}">+ Add Question</button>
              <button class="abtn ${isOrSec ? 'or-mode' : ''}" data-act="or-mode" data-si="${si}">
                ${isOrSec ? '⚡ Click 2nd Question (Cancel)' : '🔗 Link OR (অথবা)'}
              </button>
            </div>
          </div>`;
        wrap.appendChild(card);
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'abtn';
      addBtn.style.cssText = 'padding:9px;font-size:0.78rem;flex-shrink:0';
      addBtn.textContent = '+ Add Section (বিভাগ যোগ করুন)';
      addBtn.dataset.act = 'add-sec';
      wrap.appendChild(addBtn);
    }

    const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
    function formatLabelIdx(i: number, style?: string) {
      if (style === 'alpha') return String.fromCharCode(65 + i);
      if (style === 'alphal') return String.fromCharCode(97 + i);
      if (style === 'roman') return ROMAN[i] || String(i + 1);
      if (style === 'bn') return bnAlpha[i] || String(i + 1);
      return String(i + 1);
    }

    function renderSubParts(raw: string, fs: number) {
      const m = raw.match(/^(.*?)\s*(\((?:\d+\+)+\d+\))\s*$/s);
      if (!m) return renderTok(raw);
      return `${renderTok(m[1])}<span style="float:right;font-weight:700;font-size:${fs * 0.92}pt;margin-left:8px;white-space:nowrap">${esc(
        m[2]
      )}</span>`;
    }

    function buildQuestionBlock(sec: any, q: any, qNum: number, fs: number, lh: number) {
      const wrap = document.createElement('div');
      const useBn = S.cfg.lang === 'full-bn' || (S.cfg.lang === 'mixed' && sec.optStyle === 'bn');
      const numStr = useBn ? bnNum(qNum) : String(qNum);
      const qMarks = q.marks !== '' && q.marks !== undefined ? q.marks : '';

      let optsH = '';
      if (sec.type === 'mcq' && q.opts && q.opts.length) {
        const labels = sec.optStyle === 'en' ? enAlpha : bnAlpha;
        optsH =
          `<div class="qp-opts" style="font-size:${fs * 0.95}pt">` +
          q.opts.map((op: string, oi: number) => `<div>(${labels[oi]}) ${renderTok(op)}</div>`).join('') +
          `</div>`;
        if (q.mcqImg && q.mcqImg.src) {
          const jc = q.mcqImg.align === 'left' ? 'flex-start' : q.mcqImg.align === 'right' ? 'flex-end' : 'center';
          optsH += `<div class="qp-img-wrap" style="display:flex;justify-content:${jc}"><img src="${q.mcqImg.src}" style="width:${
            q.mcqImg.width || 50
          }%" alt=""></div>`;
        }
      }

      let extraH = '';
      if (sec.type !== 'mcq' && q.extra) {
        const ex = q.extra;
        if (ex.img && ex.img.src) {
          const jc = ex.img.align === 'left' ? 'flex-start' : ex.img.align === 'right' ? 'flex-end' : 'center';
          extraH += `<div class="qp-img-wrap" style="display:flex;justify-content:${jc}"><img src="${ex.img.src}" style="width:${
            ex.img.width || 60
          }%" alt=""></div>`;
        }
        if (ex.tbl && ex.tbl.data) {
          const t = ex.tbl;
          let rowsH = '';
          for (let r = 0; r < t.rows; r++) {
            const tag = r === 0 && t.hasHeader ? 'th' : 'td';
            const cells = Array.from({ length: t.cols }, (_, c) => `<${tag}>${renderTok((t.data[r] && t.data[r][c]) || '')}</${tag}>`).join('');
            rowsH += `<tr>${cells}</tr>`;
          }
          extraH += `<table class="qp-tbl" style="font-size:${fs * 0.92}pt">${rowsH}</table>`;
        }
        if (ex.dia && ex.dia.src) {
          const jc = ex.dia.align === 'left' ? 'flex-start' : ex.dia.align === 'right' ? 'flex-end' : 'center';
          extraH += `<div class="qp-img-wrap" style="display:flex;justify-content:${jc}"><img src="${ex.dia.src}" style="width:${
            ex.dia.width || 65
          }%" alt=""></div>`;
        }
        if (ex.ldia && (ex.ldia.src || (ex.ldia.labels && ex.ldia.labels.length))) {
          const ld = ex.ldia;
          const imgW = ld.imgW || 45;
          const lblW = 100 - imgW - 4;
          const linesH = (ld.labels || [])
            .map((lb: string, li: number) => {
              const idx = formatLabelIdx(li, ld.style);
              const content = lb.trim()
                ? `<span style="border-bottom:1px solid #000;padding:0 4px;min-width:60px;display:inline-block">${renderTok(lb)}</span>`
                : `<span style="border-bottom:1px solid #000;display:inline-block;width:75%">&nbsp;</span>`;
              return `<div style="display:flex;align-items:baseline;gap:5px;margin-bottom:${Math.max(3, fs * 0.35)}px;font-size:${fs * 0.92}pt">
              <span style="font-weight:700;min-width:20px;flex-shrink:0">${idx})</span>
              <span style="border-bottom:1px dashed #666;width:18px;flex-shrink:0;display:inline-block;margin-bottom:2px"></span>
              ${content}
            </div>`;
            })
            .join('');
          extraH += `<div style="display:flex;align-items:center;gap:4%;margin:5px 0">
            ${
              ld.src
                ? `<div style="width:${imgW}%;flex-shrink:0"><img src="${ld.src}" style="width:100%;height:auto;display:block" alt=""></div>`
                : ''
            }
            <div style="width:${ld.src ? lblW : 100}%">${linesH}</div>
          </div>`;
        }
      }

      let ansH = '';
      if (S.cfg.ansSpace && sec.type !== 'mcq') {
        const defMm = sec.type === 'short' ? 15 : sec.type === 'descriptive' ? 35 : 55;
        const mm = q.ansLines !== undefined && q.ansLines !== '' ? +q.ansLines : sec.ansLines !== undefined ? +sec.ansLines : defMm;
        if (mm > 0) ansH = `<div class="qp-ans-space" style="height:${mm}mm"></div>`;
      }

      const qDiv = document.createElement('div');
      qDiv.className = 'qp-q';
      qDiv.style.fontSize = `${fs}pt`;
      qDiv.style.lineHeight = String(lh);
      qDiv.innerHTML = `<div class="qp-q-row">
        <span class="qp-qn">${numStr}.</span>
        <span class="qp-qt">${renderSubParts(q.text, fs)}</span>
        ${qMarks !== '' ? `<span class="qp-qm">[${esc(String(qMarks))}]</span>` : ''}
      </div>${optsH}${extraH}${ansH}`;
      wrap.appendChild(qDiv);
      return wrap;
    }

    function buildHeaderEl() {
      readExamForm();
      const { exam, cfg } = S;
      const fs = cfg.fs;
      const isBn = cfg.lang !== 'full-en';
      const lblSub = isBn ? 'বিষয়' : 'Subject';
      const lblCls = isBn ? 'শ্রেণী' : 'Class';
      const lblTime = isBn ? 'সময়' : 'Time';
      const lblMarks = isBn ? 'পূর্ণমান' : 'Full Marks';

      let hdrInner = '';
      if (exam.headerLayout === 'standard') {
        hdrInner = `
          <div class="qp-school" style="font-size:${fs * 1.32}pt">${renderTok(exam.title)}</div>
          <div class="qp-sub" style="font-size:${fs * 1.08}pt">${renderTok(exam.subject)}</div>
          ${exam.class ? `<div class="qp-Meta-center" style="font-size:${fs * 0.95}pt">${lblCls}: ${esc(exam.class)}</div>` : ''}
          <div class="qp-meta" style="font-size:${fs * 0.93}pt">
            <span>${lblTime}: ${esc(exam.time)}</span><span>${lblMarks}: ${esc(exam.marks)}</span>
          </div>`;
      } else if (exam.headerLayout === 'split') {
        hdrInner = `
          <div class="qp-school" style="font-size:${fs * 1.28}pt">${renderTok(exam.title)}</div>
          <div class="qp-meta" style="font-size:${fs * 0.95}pt">
            <span>${lblSub}: ${renderTok(exam.subject)}</span><span>${lblCls}: ${esc(exam.class)}</span>
          </div>
          <div class="qp-meta" style="font-size:${fs * 0.93}pt">
            <span>${lblTime}: ${esc(exam.time)}</span><span>${lblMarks}: ${esc(exam.marks)}</span>
          </div>`;
      } else if (exam.headerLayout === 'compact') {
        hdrInner = `
          <div class="qp-school" style="font-size:${fs * 1.18}pt">${renderTok(exam.title)} — ${renderTok(exam.subject)}</div>
          <div class="qp-meta" style="font-size:${fs * 0.9}pt">
            <span>${lblCls}: ${esc(exam.class)}</span><span>${lblTime}: ${esc(exam.time)}</span><span>${lblMarks}: ${esc(exam.marks)}</span>
          </div>`;
      } else {
        hdrInner = `
          <div class="qp-school" style="font-size:${fs * 1.22}pt">${renderTok(exam.title)}</div>
          <div class="qp-Meta-center" style="font-size:${fs * 0.93}pt">${renderTok(exam.subject)} | ${esc(exam.class)} | ${lblTime}: ${esc(
          exam.time
        )} | ${lblMarks}: ${esc(exam.marks)}</div>`;
      }
      if (exam.instructions) {
        hdrInner += `<div class="qp-instr" style="font-size:${fs * 0.87}pt">${renderTok(exam.instructions)}</div>`;
      }

      const frag = document.createElement('div');
      frag.innerHTML = `<div class="qp-hdr b-${exam.headerBox}">${hdrInner}</div><div class="qp-div d-${exam.divider}"></div>`;
      return frag;
    }

    function buildSectionHdrEl(sec: any) {
      const { cfg } = S;
      const fs = cfg.fs;
      const total = sec.marksPerQ * sec.answerAny;
      const useBn = cfg.lang === 'full-bn' || (cfg.lang === 'mixed' && sec.optStyle === 'bn');
      const dispMpQ = useBn ? bnNum(sec.marksPerQ) : sec.marksPerQ;
      const dispAny = useBn ? bnNum(sec.answerAny) : sec.answerAny;
      const dispTot = useBn ? bnNum(total) : total;

      const frag = document.createElement('div');
      frag.innerHTML = `<div class="qp-sec-hdr" style="font-size:${fs * 1.03}pt">${esc(sec.name)}</div>
        <div class="qp-sec-info" style="font-size:${fs * 0.9}pt">
          ${sec.info ? renderTok(sec.info) + ' ' : ''}[ ${dispMpQ} × ${dispAny} = ${dispTot} ]
        </div>`;
      return frag;
    }

    function buildPaperItems() {
      const { cfg } = S;
      const fs = cfg.fs;
      const lh = cfg.lh;
      const items: { el: HTMLElement; isSecHdr?: boolean }[] = [];

      items.push({ el: buildHeaderEl() });

      S.sections.forEach((sec: any) => {
        if (!sec.questions.length) return;
        items.push({ el: buildSectionHdrEl(sec), isSecHdr: true });

        let qNum = 0;
        let idx = 0;
        while (idx < sec.questions.length) {
          const q = sec.questions[idx];
          if (!q.orWithPrev) qNum++;

          const groupWrap = document.createElement('div');
          groupWrap.appendChild(buildQuestionBlock(sec, q, qNum, fs, lh));

          while (idx + 1 < sec.questions.length && sec.questions[idx + 1].orWithPrev) {
            idx++;
            const orQ = sec.questions[idx];
            const orLbl = cfg.lang === 'full-en' ? 'OR' : cfg.lang === 'full-bn' ? 'অথবা' : sec.optStyle === 'en' ? 'OR' : 'অথবা';
            const orEl = document.createElement('div');
            orEl.className = 'qp-or';
            orEl.style.fontSize = `${fs * 0.9}pt`;
            orEl.textContent = orLbl;
            groupWrap.appendChild(orEl);
            groupWrap.appendChild(buildQuestionBlock(sec, orQ, qNum, fs, lh));
          }

          items.push({ el: groupWrap });
          idx++;
        }
      });

      return items;
    }

    function getCellDimensions(orient: string, n: number) {
      const MM = 3.7795275591;
      const sheetW = (orient === 'landscape' ? 297 : 210) * MM;
      const sheetH = (orient === 'landscape' ? 210 : 297) * MM;
      let cols = 1;
      let rows = 1;
      if (n === 2) {
        if (orient === 'landscape') {
          cols = 2;
          rows = 1;
        } else {
          cols = 1;
          rows = 2;
        }
      } else if (n === 4) {
        cols = 2;
        rows = 2;
      }
      return { cellW: sheetW / cols, cellH: sheetH / rows };
    }

    function paginateItems(orient: string, n: number) {
      const MM = 3.7795275591;
      const padPx = S.cfg.pad * 10 * MM;
      const { cellW, cellH } = getCellDimensions(orient, n);
      const innerW = cellW - padPx * 2;
      const innerH = cellH - padPx * 2;
      const footerReserve = 16;

      const probe = document.createElement('div');
      probe.className = 'qp-paper';
      probe.style.cssText = `position:fixed;left:-9999px;top:0;width:${innerW}px;font-size:${S.cfg.fs}pt;line-height:${S.cfg.lh};visibility:hidden;`;
      root.appendChild(probe);

      const items = buildPaperItems();
      const pages: HTMLElement[][] = [[]];
      let usedH = 0;

      for (let i = 0; i < items.length; i++) {
        const { el, isSecHdr } = items[i];
        probe.appendChild(el);
        const h = el.offsetHeight + 3;

        let nextH = 0;
        if (isSecHdr && i + 1 < items.length) {
          probe.appendChild(items[i + 1].el);
          nextH = items[i + 1].el.offsetHeight + 3;
          probe.removeChild(items[i + 1].el);
        }

        const budget = innerH - footerReserve;
        if (usedH > 0 && usedH + h + nextH > budget) {
          pages.push([]);
          usedH = 0;
        }
        pages[pages.length - 1].push(el);
        usedH += h;
      }

      root.removeChild(probe);
      return pages;
    }

    function makeCellEl(elList: HTMLElement[], pad: string, wmHTML: string, pageNum: number, totalPages: number) {
      const cell = document.createElement('div');
      cell.className = 'qp-cell';
      cell.style.cssText = `padding:${pad};position:relative;box-sizing:border-box;display:flex;flex-direction:column;`;
      if (wmHTML) cell.insertAdjacentHTML('beforeend', wmHTML);

      const paper = document.createElement('div');
      paper.className = 'qp-paper';
      paper.style.cssText = `font-size:${S.cfg.fs}pt;line-height:${S.cfg.lh};flex:1;`;
      elList.forEach((el) => paper.appendChild(el));
      cell.appendChild(paper);

      if (totalPages > 1) {
        const isLast = pageNum === totalPages;
        const isBn = S.cfg.lang === 'full-bn';
        const pgStr = isBn ? `পৃষ্ঠা ${bnNum(pageNum)} / ${bnNum(totalPages)}` : `Page ${pageNum} of ${totalPages}`;
        const ptoStr = isLast ? (isBn ? '— সমাপ্ত —' : '— END —') : isBn ? '[ পরের পৃষ্ঠা দেখুন / P.T.O. ]' : '[ P.T.O. ]';
        const ftr = document.createElement('div');
        ftr.style.cssText = `display:flex;justify-content:space-between;align-items:center;font-family:'Noto Serif Bengali','Times New Roman',serif;font-size:${
          S.cfg.fs * 0.78
        }pt;color:#444;border-top:0.5px solid #bbb;padding-top:2px;margin-top:3px;flex-shrink:0;`;
        ftr.innerHTML = `<span>${pgStr}</span><span style="font-style:italic;font-weight:600">${ptoStr}</span>`;
        cell.appendChild(ftr);
      }
      return cell;
    }

    function renderPreview() {
      const vp = $('preview-vp');
      if (!vp) return;
      const { cfg } = S;
      const n = cfg.layout;

      let orient = cfg.orient;
      if (orient === 'auto') orient = n === 2 ? 'landscape' : 'portrait';

      let cutS = 'dashed';
      let cutW = '1px';
      if (cfg.cut === 'dotted') cutS = 'dotted';
      else if (cfg.cut === 'solid') cutS = 'solid';
      else if (cfg.cut === 'scissors') {
        cutS = 'dashed';
        cutW = '1.5px';
      }

      const pad = `${cfg.pad}cm`;
      const sw = orient === 'landscape' ? 297 : 210;
      const sh = orient === 'landscape' ? 210 : 297;
      const z = cfg.zoom;
      const mbPx = -(sh * 3.7795275591 * (1 - z));

      const wmActiveSrc =
        cfg.wmSrc === 'default' && cfg.wmUnlocked
          ? `${import.meta.env.BASE_URL}watermark.svg`
          : cfg.wmSrc === 'custom' && cfg.wmCustomData
          ? cfg.wmCustomData
          : '';
      const wmHTML = wmActiveSrc
        ? `<div class="cell-wm" style="--wm-size:${cfg.wmSize}%;--wm-opacity:${cfg.wmOpacity}"><img src="${wmActiveSrc}" alt=""></div>`
        : '';

      vp.innerHTML = '';

      if (n === 'flow') {
        const items = buildPaperItems();
        const sheet = document.createElement('div');
        sheet.className = `a4-sheet ${orient} flow-mode`;
        sheet.style.transform = `scale(${z})`;
        const cell = makeCellEl(
          items.map((x) => x.el),
          pad,
          wmHTML,
          1,
          1
        );
        sheet.appendChild(cell);
        vp.appendChild(sheet);
        if ($('pbar-info')) $('pbar-info').textContent = `Flow · ${orient}`;
        return;
      }

      const pages = paginateItems(orient, n);
      const totalPages = pages.length;

      const makeSheet = (cellEls: HTMLElement[]) => {
        const sheet = document.createElement('div');
        sheet.className = `a4-sheet ${orient}`;
        sheet.style.cssText = `--cut-s:${cutS};--cut-w:${cutW};transform:scale(${z});margin-bottom:${mbPx}px;`;
        if (cfg.cut === 'scissors' && n > 1) {
          if (n === 2 && orient === 'portrait') {
            sheet.insertAdjacentHTML('beforeend', `<span class="cut-mark" style="top:calc(50% - 7px);left:3px">✂</span>`);
          } else if (n === 2 && orient === 'landscape') {
            sheet.insertAdjacentHTML('beforeend', `<span class="cut-mark" style="left:calc(50% - 7px);top:3px">✂</span>`);
          } else if (n === 4) {
            sheet.insertAdjacentHTML(
              'beforeend',
              `<span class="cut-mark" style="top:calc(50% - 7px);left:3px">✂</span><span class="cut-mark" style="left:calc(50% - 7px);top:3px">✂</span>`
            );
          }
        }
        const grid = document.createElement('div');
        grid.className = `sheet-grid g${n} ${orient}`;
        cellEls.forEach((c) => grid.appendChild(c));
        sheet.appendChild(grid);
        return sheet;
      };

      let sheetCount = 0;

      if (n === 1) {
        pages.forEach((pg, pi) => {
          const cell = makeCellEl(pg, pad, wmHTML, pi + 1, totalPages);
          vp.appendChild(makeSheet([cell]));
          sheetCount++;
        });
      } else if (n === 2) {
        let P = pages.slice();
        if (totalPages === 1) {
          const c1 = makeCellEl(P[0], pad, wmHTML, 1, 1);
          const c2 = makeCellEl(
            P[0].map((el) => el.cloneNode(true) as HTMLElement),
            pad,
            wmHTML,
            1,
            1
          );
          vp.appendChild(makeSheet([c1, c2]));
          sheetCount = 1;
        } else {
          while (P.length % 4 !== 0) P.push([]);
          const N = P.length;
          const totalLogical = pages.length;
          const getCell = (idx: number) => {
            const pg = P[idx];
            return pg && pg.length ? makeCellEl(pg, pad, wmHTML, idx + 1, totalLogical) : makeCellEl([], pad, wmHTML, 0, 1);
          };
          for (let s = 0; s < N / 4; s++) {
            const fL = N - 1 - 2 * s;
            const fR = 2 * s;
            const bL = 2 * s + 1;
            const bR = N - 2 - 2 * s;
            vp.appendChild(makeSheet([getCell(fL), getCell(fR)]));
            vp.appendChild(makeSheet([getCell(bL), getCell(bR)]));
            sheetCount += 2;
          }
        }
      } else if (n === 4) {
        if (totalPages === 1) {
          const cells = Array.from({ length: 4 }, () =>
            makeCellEl(
              pages[0].map((el) => el.cloneNode(true) as HTMLElement),
              pad,
              wmHTML,
              1,
              1
            )
          );
          vp.appendChild(makeSheet(cells));
          sheetCount = 1;
        } else {
          const P = pages.slice();
          while (P.length % 4 !== 0) P.push([]);
          for (let i = 0; i < P.length; i += 4) {
            const cells = [0, 1, 2, 3].map((k) => {
              const pg = P[i + k];
              return pg && pg.length ? makeCellEl(pg, pad, wmHTML, i + k + 1, totalPages) : makeCellEl([], pad, wmHTML, 0, 1);
            });
            vp.appendChild(makeSheet(cells));
            sheetCount++;
          }
        }
      }

      const dupNote = totalPages === 1 && n > 1 ? ` (${n} copies)` : ` (${totalPages}p → ${sheetCount} sheet${sheetCount > 1 ? 's' : ''})`;
      if ($('pbar-info')) $('pbar-info').textContent = `${n === 1 ? 'Mono' : n === 2 ? 'Double' : 'Quad'} · ${orient}${dupNote}`;
    }

    function runAutoFit() {
      const n = S.cfg.layout === 'flow' ? 1 : S.cfg.layout;
      let orient = S.cfg.orient;
      if (orient === 'auto') orient = n === 2 ? 'landscape' : 'portrait';

      let bestFs = 7;
      let bestLh = 1.05;
      let bestPad = 0.4;
      outer: for (let fs = 12; fs >= 7; fs -= 0.5) {
        for (let lh = 1.4; lh >= 1.05; lh = Math.round((lh - 0.05) * 100) / 100) {
          for (let pad = 1.0; pad >= 0.4; pad = Math.round((pad - 0.1) * 10) / 10) {
            S.cfg.fs = fs;
            S.cfg.lh = lh;
            S.cfg.pad = pad;
            const pages = paginateItems(orient, n);
            if (pages.length === 1) {
              bestFs = fs;
              bestLh = lh;
              bestPad = pad;
              break outer;
            }
          }
        }
      }

      S.cfg.fs = bestFs;
      S.cfg.lh = bestLh;
      S.cfg.pad = bestPad;
      if ($('r-fs')) $('r-fs').value = bestFs;
      if ($('v-fs')) $('v-fs').textContent = bestFs + 'pt';
      if ($('r-lh')) $('r-lh').value = bestLh;
      if ($('v-lh')) $('v-lh').textContent = bestLh;
      if ($('r-pad')) $('r-pad').value = bestPad;
      if ($('v-pad')) $('v-pad').textContent = bestPad + 'cm';
      renderPreview();
      const pages = paginateItems(orient, n);
      toast(
        pages.length === 1 ? `Auto-fit: 1 page (${bestFs}pt)` : `Fit into ${pages.length} pages at min size (7pt)`,
        pages.length === 1 ? '' : 'warn'
      );
    }

    async function exportODT() {
      const JSZipLib = (window as any).JSZip;
      if (!JSZipLib) {
        toast('Loading JSZip library...', 'warn');
        await loadScript('qp-jszip-js', `${import.meta.env.BASE_URL}libs/jszip.min.js`);
      }
      const Zip = (window as any).JSZip;
      if (!Zip) {
        toast('JSZip not loaded.', 'err');
        return;
      }

      readExamForm();
      const { exam, cfg } = S;
      const x = (s: any) =>
        String(s || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/\[(CHEM|EQ|SYM|SUB|SUP):([^\]]*)\]/g, '$2');

      let body = '';
      body += `<text:p text:style-name="Title">${x(exam.title)}</text:p>`;
      body += `<text:p text:style-name="Sub">${x(exam.subject)} — ${x(exam.class)}</text:p>`;
      body += `<text:p text:style-name="Meta">সময়: ${x(exam.time)}     পূর্ণমান: ${x(exam.marks)}</text:p>`;
      if (exam.instructions) body += `<text:p text:style-name="Instr">${x(exam.instructions)}</text:p>`;
      body += `<text:p text:style-name="HR">────────────────────────────────────────────────</text:p>`;

      S.sections.forEach((sec: any) => {
        if (!sec.questions.length) return;
        const tot = sec.marksPerQ * sec.answerAny;
        const useBn = cfg.lang === 'full-bn' || (cfg.lang === 'mixed' && sec.optStyle === 'bn');
        body += `<text:p text:style-name="SecH">${x(sec.name)}</text:p>`;
        body += `<text:p text:style-name="SecI">${x(sec.info)} [${useBn ? bnNum(sec.marksPerQ) : sec.marksPerQ} × ${
          useBn ? bnNum(sec.answerAny) : sec.answerAny
        } = ${useBn ? bnNum(tot) : tot}]</text:p>`;
        let qn = 0;
        sec.questions.forEach((q: any) => {
          if (q.orWithPrev) {
            body += `<text:p text:style-name="Or">— অথবা / OR —</text:p>`;
          } else {
            qn++;
          }
          const numS = useBn ? bnNum(qn) : qn;
          const mS = q.marks || sec.marksPerQ;
          body += `<text:p text:style-name="Q">${numS}. ${x(q.text)}   [${x(String(mS))}]</text:p>`;
          if (sec.type === 'mcq' && q.opts.length) {
            const lbl = sec.optStyle === 'en' ? enAlpha : bnAlpha;
            body += `<text:p text:style-name="Opts">${q.opts.map((op: string, oi: number) => `(${lbl[oi]}) ${x(op)}`).join('     ')}</text:p>`;
          }
        });
      });

      const contentXML = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:style style:name="Title" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${
      cfg.fs * 1.3
    }pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="Sub"   style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="1.5mm"/><style:text-properties fo:font-size="${
      cfg.fs * 1.05
    }pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="Meta"  style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="1.5mm"/><style:text-properties fo:font-size="${cfg.fs}pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="Instr" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${
      cfg.fs * 0.9
    }pt" fo:font-style="italic"/></style:style>
    <style:style style:name="HR"    style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="3mm"/><style:text-properties fo:font-size="8pt"/></style:style>
    <style:style style:name="SecH"  style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="4mm" fo:margin-bottom="1mm" fo:background-color="#eeeeee"/><style:text-properties fo:font-size="${cfg.fs}pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="SecI"  style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${
      cfg.fs * 0.9
    }pt" fo:font-style="italic"/></style:style>
    <style:style style:name="Q"     style:family="paragraph"><style:paragraph-properties fo:margin-bottom="1.5mm"/><style:text-properties fo:font-size="${cfg.fs}pt"/></style:style>
    <style:style style:name="Opts"  style:family="paragraph"><style:paragraph-properties fo:margin-left="6mm" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${
      cfg.fs * 0.93
    }pt"/></style:style>
    <style:style style:name="Or"    style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="1mm" fo:margin-bottom="1mm"/><style:text-properties fo:font-size="${
      cfg.fs * 0.9
    }pt" fo:font-weight="bold" fo:font-style="italic"/></style:style>
  </office:automatic-styles>
  <office:body><office:text>${body}</office:text></office:body>
</office:document-content>`;

      const stylesXML = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:page-layout style:name="pm1">
      <style:page-layout-properties fo:page-width="210mm" fo:page-height="297mm"
        fo:margin-top="${cfg.pad}cm" fo:margin-bottom="${cfg.pad}cm"
        fo:margin-left="${cfg.pad}cm" fo:margin-right="${cfg.pad}cm"/>
    </style:page-layout>
  </office:automatic-styles>
  <office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`;

      const manifestXML = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

      const zip = new Zip();
      zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });
      zip.file('content.xml', contentXML);
      zip.file('styles.xml', stylesXML);
      zip.folder('META-INF').file('manifest.xml', manifestXML);
      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.oasis.opendocument.text' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${exam.subject || 'question_paper'}.odt`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('ODT downloaded!');
    }

    // Event Delegation & Handlers
    const secsEl = $('secs');
    const handleSecsClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const act = btn.dataset.act;
      const si = +(btn.dataset.si || 0);
      const qi = +(btn.dataset.qi || 0);

      if (act === 'toggle-card') {
        if ((e.target as HTMLElement).closest('[data-act="del-sec"]')) return;
        btn.closest('.acard')?.classList.toggle('open');
      } else if (act === 'add-sec') {
        const idx = S.sections.length;
        S.sections.push({
          id: Date.now(),
          name: S.cfg.lang === 'full-en' ? secEn[idx] || `Section ${idx + 1}` : secBn[idx] || `বিভাগ ${idx + 1}`,
          type: 'short',
          marksPerQ: 2,
          answerAny: 5,
          optStyle: S.cfg.lang === 'full-en' ? 'en' : 'bn',
          info: S.cfg.lang === 'full-en' ? 'Answer the following questions:' : 'নিম্নলিখিত প্রশ্নগুলির উত্তর দাও:',
          questions: []
        });
        renderSections();
        renderPreview();
      } else if (act === 'del-sec') {
        e.stopPropagation();
        if (S.sections.length <= 1) {
          toast('At least 1 section required!', 'err');
          return;
        }
        S.sections.splice(si, 1);
        renderSections();
        renderPreview();
      } else if (act === 'add-q') {
        const sec = S.sections[si];
        sec.questions.push({
          id: Date.now() + Math.random(),
          text: '',
          opts: sec.type === 'mcq' ? ['', '', '', ''] : [],
          orWithPrev: false,
          marks: ''
        });
        renderSections();
        renderPreview();
        setTimeout(() => {
          const cards = $('secs')?.querySelectorAll(`.qcard[data-si="${si}"] textarea`);
          if (cards && cards.length) (cards[cards.length - 1] as HTMLTextAreaElement).focus();
        }, 40);
      } else if (act === 'del-q') {
        const sec = S.sections[si];
        if (sec.questions[qi + 1]?.orWithPrev) sec.questions[qi + 1].orWithPrev = false;
        sec.questions.splice(qi, 1);
        renderSections();
        renderPreview();
      } else if (act === 'toggle-or') {
        const q = S.sections[si].questions[qi];
        q.orWithPrev = !q.orWithPrev;
        renderSections();
        renderPreview();
        toast(q.orWithPrev ? 'Linked as OR (অথবা)!' : 'OR unlinked');
      } else if (act === 'unlink-or') {
        S.sections[si].questions[qi].orWithPrev = false;
        renderSections();
        renderPreview();
      } else if (act === 'or-mode') {
        if (orMode && orMode.secIdx === si) {
          orMode = null;
          orFirst = null;
        } else {
          orMode = { secIdx: si };
          orFirst = null;
          toast('Click 1st question, then 2nd question to link as OR', 'warn');
        }
        renderSections();
      } else if (act === 'or-pick' && orMode && orMode.secIdx === si) {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') return;
        if (orFirst === null) {
          orFirst = qi;
          toast(`Q${qi + 1} selected — now click the next question to link as OR`);
          renderSections();
        } else {
          const second = qi;
          if (second === orFirst + 1) {
            S.sections[si].questions[second].orWithPrev = true;
            toast('Questions linked with অথবা / OR!');
          } else if (orFirst === second + 1) {
            S.sections[si].questions[orFirst].orWithPrev = true;
            toast('Questions linked with অথবা / OR!');
          } else {
            toast('Select two consecutive questions!', 'err');
          }
          orMode = null;
          orFirst = null;
          renderSections();
          renderPreview();
        }
      } else if (act === 'mcqimg-add') {
        pickImageFile((src) => {
          S.sections[si].questions[qi].mcqImg = { src, width: 50, align: 'center' };
          renderSections();
          renderPreview();
        });
      } else if (act === 'mcqimg-del') {
        delete S.sections[si].questions[qi].mcqImg;
        renderSections();
        renderPreview();
      } else if (act === 'x-img') {
        const q = S.sections[si].questions[qi];
        q.extra = q.extra || {};
        if (!q.extra.img) {
          pickImageFile((src) => {
            q.extra.img = { src, width: 60 };
            renderSections();
            renderPreview();
          });
        } else {
          renderSections();
        }
      } else if (act === 'x-img-del') {
        delete S.sections[si].questions[qi].extra?.img;
        renderSections();
        renderPreview();
      } else if (act === 'img-pick') {
        pickImageFile((src) => {
          const q = S.sections[si].questions[qi];
          q.extra = q.extra || {};
          q.extra.img = { ...(q.extra.img || {}), src, width: q.extra.img?.width || 60 };
          renderSections();
          renderPreview();
        });
      } else if (act === 'x-tbl') {
        const q = S.sections[si].questions[qi];
        q.extra = q.extra || {};
        if (!q.extra.tbl) {
          q.extra.tbl = {
            rows: 3,
            cols: 3,
            hasHeader: true,
            data: [
              ['', '', ''],
              ['', '', ''],
              ['', '', '']
            ]
          };
        }
        renderSections();
        renderPreview();
      } else if (act === 'x-tbl-del') {
        delete S.sections[si].questions[qi].extra?.tbl;
        renderSections();
        renderPreview();
      } else if (act === 'tbl-r+') {
        const t = S.sections[si].questions[qi].extra.tbl;
        t.rows++;
        t.data.push(Array(t.cols).fill(''));
        renderSections();
        renderPreview();
      } else if (act === 'tbl-r-') {
        const t = S.sections[si].questions[qi].extra.tbl;
        if (t.rows > 1) {
          t.rows--;
          t.data.pop();
          renderSections();
          renderPreview();
        }
      } else if (act === 'tbl-c+') {
        const t = S.sections[si].questions[qi].extra.tbl;
        t.cols++;
        t.data.forEach((r: string[]) => r.push(''));
        renderSections();
        renderPreview();
      } else if (act === 'tbl-c-') {
        const t = S.sections[si].questions[qi].extra.tbl;
        if (t.cols > 1) {
          t.cols--;
          t.data.forEach((r: string[]) => r.pop());
          renderSections();
          renderPreview();
        }
      } else if (act === 'x-dia' || act === 'dia-open') {
        const q = S.sections[si].questions[qi];
        q.extra = q.extra || {};
        q.extra.dia = q.extra.dia || { src: '', width: 65 };
        openDiagramModal(si, qi);
      } else if (act === 'x-dia-del') {
        delete S.sections[si].questions[qi].extra?.dia;
        renderSections();
        renderPreview();
      } else if (act === 'x-ldia') {
        const q = S.sections[si].questions[qi];
        q.extra = q.extra || {};
        if (!q.extra.ldia) q.extra.ldia = { src: '', imgW: 45, style: 'num', labels: ['', '', '', ''] };
        renderSections();
        renderPreview();
      } else if (act === 'x-ldia-del') {
        delete S.sections[si].questions[qi].extra?.ldia;
        renderSections();
        renderPreview();
      } else if (act === 'ldia-img') {
        pickImageFile((src) => {
          const ld = S.sections[si].questions[qi].extra.ldia;
          ld.src = src;
          renderSections();
          renderPreview();
        });
      } else if (act === 'ldia-draw') {
        const q = S.sections[si].questions[qi];
        q.extra = q.extra || {};
        q.extra.ldia = q.extra.ldia || { src: '', imgW: 45, style: 'num', labels: ['', '', '', ''] };
        openDiagramModal(si, qi, 'ldia');
      } else if (act === 'ldia-lbl-add') {
        S.sections[si].questions[qi].extra.ldia.labels.push('');
        renderSections();
        renderPreview();
      } else if (act === 'ldia-lbl-del') {
        const li = +(btn.dataset.li || 0);
        S.sections[si].questions[qi].extra.ldia.labels.splice(li, 1);
        renderSections();
        renderPreview();
      }
    };

    const handleSecsInput = (e: Event) => {
      const el = e.target as HTMLInputElement;
      const act = el.dataset.act;
      const si = +(el.dataset.si || 0);
      const qi = +(el.dataset.qi || 0);
      if (!act) return;
      const sec = S.sections[si];

      if (act === 'sec-name') {
        sec.name = el.value;
        const badge = el.closest('.acard')?.querySelector('.sec-badge');
        if (badge) badge.textContent = el.value;
      } else if (act === 'sec-type') {
        sec.type = el.value;
        if (sec.type === 'mcq')
          sec.questions.forEach((q: any) => {
            while (q.opts.length < 4) q.opts.push('');
          });
        renderSections();
      } else if (act === 'sec-opt') {
        sec.optStyle = el.value;
        renderSections();
      } else if (act === 'sec-mpq') {
        sec.marksPerQ = parseFloat(el.value) || 1;
        renderSections();
      } else if (act === 'sec-any') {
        sec.answerAny = parseInt(el.value) || 1;
        renderSections();
      } else if (act === 'sec-info') {
        sec.info = el.value;
      } else if (act === 'sec-lines') {
        sec.ansLines = parseInt(el.value) || 0;
      } else if (act === 'q-text') {
        sec.questions[qi].text = el.value;
      } else if (act === 'q-marks') {
        sec.questions[qi].marks = el.value;
      } else if (act === 'q-lines') {
        sec.questions[qi].ansLines = el.value === '' ? '' : parseInt(el.value) || 0;
      } else if (act === 'q-opt') {
        sec.questions[qi].opts[+(el.dataset.oi || 0)] = el.value;
      } else if (act === 'mcqimg-w') {
        sec.questions[qi].mcqImg.width = +el.value;
      } else if (act === 'mcqimg-align') {
        sec.questions[qi].mcqImg.align = el.value;
      } else if (act === 'img-w') {
        sec.questions[qi].extra.img.width = +el.value;
      } else if (act === 'img-align') {
        sec.questions[qi].extra.img.align = el.value;
      } else if (act === 'dia-w') {
        sec.questions[qi].extra.dia.width = +el.value;
      } else if (act === 'dia-align') {
        sec.questions[qi].extra.dia.align = el.value;
      } else if (act === 'tbl-cell') {
        const r = +(el.dataset.r || 0);
        const c = +(el.dataset.c || 0);
        sec.questions[qi].extra.tbl.data[r][c] = el.value;
      } else if (act === 'tbl-hdr') {
        sec.questions[qi].extra.tbl.hasHeader = el.checked;
        renderSections();
      } else if (act === 'ldia-lbl') {
        sec.questions[qi].extra.ldia.labels[+(el.dataset.li || 0)] = el.value;
      } else if (act === 'ldia-style') {
        sec.questions[qi].extra.ldia.style = el.value;
        renderSections();
      } else if (act === 'ldia-w') {
        sec.questions[qi].extra.ldia.imgW = +el.value;
      }
      renderPreview();
    };

    secsEl?.addEventListener('click', handleSecsClick);
    secsEl?.addEventListener('input', handleSecsInput);

    function pickImageFile(cb: (src: string) => void) {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = () => {
        const f = inp.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => cb(ev.target?.result as string);
        r.readAsDataURL(f);
      };
      inp.click();
    }

    // Diagram Canvas Modal
    let diaTarget: { si: number; qi: number; key: string } | null = null;
    let diaTool = 'pen';
    let diaDrawing = false;
    let diaStartX = 0;
    let diaStartY = 0;
    let diaSnap: ImageData | null = null;
    const diaCanvas = $('dia-canvas') as HTMLCanvasElement;
    const diaCtx = diaCanvas?.getContext('2d');

    function openDiagramModal(si: number, qi: number, targetKey = 'dia') {
      diaTarget = { si, qi, key: targetKey };
      if (!diaCtx || !diaCanvas) return;
      diaCtx.fillStyle = '#fff';
      diaCtx.fillRect(0, 0, diaCanvas.width, diaCanvas.height);
      const existing = S.sections[si].questions[qi].extra?.[targetKey]?.src;
      if (existing) {
        const img = new Image();
        img.onload = () => diaCtx.drawImage(img, 0, 0);
        img.src = existing;
      }
      $('dia-modal')?.classList.add('open');
    }

    const getDiaPos = (e: MouseEvent | Touch) => {
      const r = diaCanvas.getBoundingClientRect();
      const scaleX = diaCanvas.width / r.width;
      const scaleY = diaCanvas.height / r.height;
      return [(e.clientX - r.left) * scaleX, (e.clientY - r.top) * scaleY];
    };

    function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
      const head = 10;
      const ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(ang - Math.PI / 6), y2 - head * Math.sin(ang - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(ang + Math.PI / 6), y2 - head * Math.sin(ang + Math.PI / 6));
      ctx.stroke();
    }

    if (diaCanvas && diaCtx) {
      diaCanvas.onpointerdown = (e) => {
        if (diaTool === 'text') {
          const [x, y] = getDiaPos(e);
          const txt = prompt('Enter label text:');
          if (txt) {
            diaCtx.fillStyle = $('dia-color')?.value || '#000';
            diaCtx.font = `${12 + +(($('dia-size')?.value || 2) * 2)}px sans-serif`;
            diaCtx.fillText(txt, x, y);
          }
          return;
        }
        diaDrawing = true;
        [diaStartX, diaStartY] = getDiaPos(e);
        diaSnap = diaCtx.getImageData(0, 0, diaCanvas.width, diaCanvas.height);
        diaCtx.strokeStyle = diaTool === 'eraser' ? '#fff' : $('dia-color')?.value || '#000';
        diaCtx.lineWidth = diaTool === 'eraser' ? +($('dia-size')?.value || 2) * 6 : +($('dia-size')?.value || 2);
        diaCtx.lineCap = 'round';
        diaCtx.lineJoin = 'round';
        if (diaTool === 'pen' || diaTool === 'eraser') {
          diaCtx.beginPath();
          diaCtx.moveTo(diaStartX, diaStartY);
        }
      };

      diaCanvas.onpointermove = (e) => {
        if (!diaDrawing) return;
        const [x, y] = getDiaPos(e);
        if (diaTool === 'pen' || diaTool === 'eraser') {
          diaCtx.lineTo(x, y);
          diaCtx.stroke();
        } else if (diaSnap) {
          diaCtx.putImageData(diaSnap, 0, 0);
          diaCtx.beginPath();
          if (diaTool === 'line') {
            diaCtx.moveTo(diaStartX, diaStartY);
            diaCtx.lineTo(x, y);
            diaCtx.stroke();
          } else if (diaTool === 'rect') {
            diaCtx.strokeRect(diaStartX, diaStartY, x - diaStartX, y - diaStartY);
          } else if (diaTool === 'circle') {
            const rx = Math.abs(x - diaStartX) / 2;
            const ry = Math.abs(y - diaStartY) / 2;
            diaCtx.ellipse((diaStartX + x) / 2, (diaStartY + y) / 2, rx, ry, 0, 0, Math.PI * 2);
            diaCtx.stroke();
          } else if (diaTool === 'arrow') {
            drawArrow(diaCtx, diaStartX, diaStartY, x, y);
          }
        }
      };

      diaCanvas.onpointerup = () => {
        diaDrawing = false;
      };
    }

    $('dia-toolbar')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-dtool]') as HTMLElement | null;
      if (!btn) return;
      diaTool = btn.dataset.dtool || 'pen';
      root.querySelectorAll('[data-dtool]').forEach((b) => b.classList.toggle('active', b === btn));
    });

    if ($('dia-clear')) {
      $('dia-clear').onclick = () => {
        if (!diaCtx || !diaCanvas) return;
        diaCtx.fillStyle = '#fff';
        diaCtx.fillRect(0, 0, diaCanvas.width, diaCanvas.height);
      };
    }
    if ($('dia-img-load')) {
      $('dia-img-load').onclick = () =>
        pickImageFile((src) => {
          const img = new Image();
          img.onload = () => {
            if (!diaCtx || !diaCanvas) return;
            diaCtx.fillStyle = '#fff';
            diaCtx.fillRect(0, 0, diaCanvas.width, diaCanvas.height);
            const s = Math.min(diaCanvas.width / img.width, diaCanvas.height / img.height);
            diaCtx.drawImage(img, (diaCanvas.width - img.width * s) / 2, (diaCanvas.height - img.height * s) / 2, img.width * s, img.height * s);
          };
          img.src = src;
        });
    }
    if ($('dia-cancel')) $('dia-cancel').onclick = () => $('dia-modal')?.classList.remove('open');
    if ($('dia-save')) {
      $('dia-save').onclick = () => {
        if (!diaTarget || !diaCanvas) return;
        const { si, qi, key } = diaTarget;
        const q = S.sections[si].questions[qi];
        q.extra = q.extra || {};
        q.extra[key] = { ...(q.extra[key] || {}), src: diaCanvas.toDataURL('image/png') };
        if (key === 'dia' && !q.extra.dia.width) q.extra.dia.width = 65;
        $('dia-modal')?.classList.remove('open');
        renderSections();
        renderPreview();
        toast('Diagram saved!');
      };
    }

    // Exam info listeners
    ['ei-title', 'ei-sub', 'ei-cls', 'ei-time', 'ei-marks', 'ei-instr', 'ei-hlayout', 'ei-hbox', 'ei-div'].forEach((id) => {
      $(id)?.addEventListener('input', () => {
        readExamForm();
        renderPreview();
      });
    });
    if ($('ei-head')) $('ei-head').onclick = () => $('ei-card')?.classList.toggle('open');

    // Settings panel
    if ($('btn-settings')) {
      $('btn-settings').onclick = () => {
        $('settings-panel')?.classList.toggle('open');
        $('btn-settings')?.classList.toggle('active');
      };
    }
    if ($('r-fs')) {
      $('r-fs').oninput = (e: any) => {
        S.cfg.fs = +e.target.value;
        if ($('v-fs')) $('v-fs').textContent = S.cfg.fs + 'pt';
        renderPreview();
      };
    }
    if ($('r-lh')) {
      $('r-lh').oninput = (e: any) => {
        S.cfg.lh = +e.target.value;
        if ($('v-lh')) $('v-lh').textContent = S.cfg.lh;
        renderPreview();
      };
    }
    if ($('r-pad')) {
      $('r-pad').oninput = (e: any) => {
        S.cfg.pad = +e.target.value;
        if ($('v-pad')) $('v-pad').textContent = S.cfg.pad + 'cm';
        renderPreview();
      };
    }

    const bindSeg = (id: string, key: string, cb?: () => void) => {
      $(id)?.addEventListener('click', (e: Event) => {
        const b = (e.target as HTMLElement).closest('.seg-btn') as HTMLElement | null;
        if (!b) return;
        $(id)
          .querySelectorAll('.seg-btn')
          .forEach((x: HTMLElement) => x.classList.remove('active'));
        b.classList.add('active');
        S.cfg[key] = b.dataset.v;
        if (cb) cb();
        renderPreview();
      });
    };

    bindSeg('seg-orient', 'orient');
    bindSeg('seg-cut', 'cut');
    bindSeg('seg-lang', 'lang', () => renderSections());

    // Layout chips
    root.querySelectorAll('.lchip').forEach((chip) => {
      (chip as HTMLElement).onclick = () => {
        root.querySelectorAll('.lchip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const lv = (chip as HTMLElement).dataset.l;
        S.cfg.layout = lv === 'flow' ? 'flow' : +(lv || 1);
        renderPreview();
      };
    });

    // Zoom
    if ($('z-in')) {
      $('z-in').onclick = () => {
        S.cfg.zoom = Math.min(1.3, +(S.cfg.zoom + 0.08).toFixed(2));
        if ($('zlabel')) $('zlabel').textContent = Math.round(S.cfg.zoom * 100) + '%';
        renderPreview();
      };
    }
    if ($('z-out')) {
      $('z-out').onclick = () => {
        S.cfg.zoom = Math.max(0.35, +(S.cfg.zoom - 0.08).toFixed(2));
        if ($('zlabel')) $('zlabel').textContent = Math.round(S.cfg.zoom * 100) + '%';
        renderPreview();
      };
    }

    // Watermark controls
    if ($('r-wmo')) {
      $('r-wmo').oninput = (e: any) => {
        S.cfg.wmOpacity = +e.target.value / 100;
        if ($('v-wmo')) $('v-wmo').textContent = e.target.value + '%';
        renderPreview();
      };
    }
    if ($('r-wms')) {
      $('r-wms').oninput = (e: any) => {
        S.cfg.wmSize = +e.target.value;
        if ($('v-wms')) $('v-wms').textContent = e.target.value + '%';
        renderPreview();
      };
    }

    const DEFAULT_WM_HASH = 'c91d1b1bd6dc0111f0619fa2353cdb5c19991f5253655fb1a9a9aa8d08414fb3';
    async function sha256(str: string) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    function setSegActive(v: string) {
      $('seg-wm')
        ?.querySelectorAll('.seg-btn')
        .forEach((x: HTMLElement) => x.classList.toggle('active', x.dataset.v === v));
    }
    $('seg-wm')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('.seg-btn') as HTMLElement | null;
      if (!b) return;
      const v = b.dataset.v || 'none';
      if (v === 'custom') {
        if ($('wm-code-wrap')) $('wm-code-wrap').style.display = 'none';
        $('wm-file')?.click();
        return;
      }
      if (v === 'default') {
        setSegActive('default');
        if (S.cfg.wmUnlocked) {
          S.cfg.wmSrc = 'default';
          if ($('wm-code-wrap')) $('wm-code-wrap').style.display = 'none';
          renderPreview();
        } else {
          if ($('wm-code-wrap')) $('wm-code-wrap').style.display = 'flex';
          setTimeout(() => $('wm-code-inp')?.focus(), 50);
        }
        return;
      }
      if ($('wm-code-wrap')) $('wm-code-wrap').style.display = 'none';
      setSegActive('none');
      S.cfg.wmSrc = 'none';
      renderPreview();
    });

    async function tryUnlockDefaultWm() {
      const entered = ($('wm-code-inp')?.value || '').trim();
      const hash = await sha256(entered);
      if (hash === DEFAULT_WM_HASH) {
        S.cfg.wmUnlocked = true;
        S.cfg.wmSrc = 'default';
        if ($('wm-code-wrap')) $('wm-code-wrap').style.display = 'none';
        if ($('wm-code-inp')) $('wm-code-inp').value = '';
        setSegActive('default');
        renderPreview();
        toast('Watermark enabled!');
      } else {
        toast('Wrong code!', 'err');
        if ($('wm-code-inp')) {
          $('wm-code-inp').value = '';
          $('wm-code-inp').focus();
        }
      }
    }
    if ($('wm-code-ok')) $('wm-code-ok').onclick = tryUnlockDefaultWm;
    if ($('wm-code-inp')) {
      $('wm-code-inp').onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') tryUnlockDefaultWm();
      };
    }
    if ($('wm-file')) {
      $('wm-file').onchange = (e: any) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => {
          S.cfg.wmCustomData = ev.target?.result as string;
          S.cfg.wmSrc = 'custom';
          setSegActive('custom');
          renderPreview();
          toast('Custom watermark loaded!');
        };
        r.readAsDataURL(f);
        e.target.value = '';
      };
    }

    // Import drawer
    if ($('btn-import-toggle')) {
      $('btn-import-toggle').onclick = () => {
        $('import-drawer')?.classList.toggle('open');
        $('btn-import-toggle')?.classList.toggle('active');
      };
    }
    if ($('btn-demo')) $('btn-demo').onclick = () => applyQPF(DEMO_QPF);

    root.querySelectorAll('.dtab').forEach((tab) => {
      (tab as HTMLElement).onclick = () => {
        root.querySelectorAll('.dtab').forEach((t) => t.classList.remove('active'));
        root.querySelectorAll('.dtab-pane').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        $(`dpane-${(tab as HTMLElement).dataset.tab}`)?.classList.add('active');
      };
    });

    if ($('btn-parse-paste')) $('btn-parse-paste').onclick = () => applyQPF($('qpf-paste')?.value || '');
    if ($('btn-clear-paste')) {
      $('btn-clear-paste').onclick = () => {
        if ($('qpf-paste')) $('qpf-paste').value = '';
      };
    }

    const dz = $('drop-zone');
    const qf = $('qpf-file');
    if (dz && qf) {
      dz.onclick = () => qf.click();
      dz.ondragover = (e: DragEvent) => {
        e.preventDefault();
        dz.classList.add('drag');
      };
      dz.ondragleave = () => dz.classList.remove('drag');
      dz.ondrop = (e: DragEvent) => {
        e.preventDefault();
        dz.classList.remove('drag');
        if (e.dataTransfer?.files[0]) readFile(e.dataTransfer.files[0]);
      };
      qf.onchange = (e: any) => {
        if (e.target.files[0]) readFile(e.target.files[0]);
      };
    }
    function readFile(file: File) {
      if (!file) return;
      const r = new FileReader();
      r.onload = (ev) => applyQPF(ev.target?.result as string);
      r.readAsText(file, 'UTF-8');
    }

    if ($('btn-prompt-img')) {
      $('btn-prompt-img').onclick = () => navigator.clipboard.writeText(PROMPT_IMG).then(() => toast('Image OCR Prompt copied!'));
    }
    if ($('btn-prompt-txt')) {
      $('btn-prompt-txt').onclick = () => navigator.clipboard.writeText(PROMPT_TXT).then(() => toast('Text convert Prompt copied!'));
    }
    if ($('btn-copy-prompt')) {
      $('btn-copy-prompt').onclick = () => navigator.clipboard.writeText(PROMPT_IMG).then(() => toast('AI Prompt copied!'));
    }

    if ($('btn-autofit')) $('btn-autofit').onclick = runAutoFit;
    if ($('btn-ans-space')) {
      $('btn-ans-space').onclick = () => {
        S.cfg.ansSpace = !S.cfg.ansSpace;
        $('btn-ans-space')?.classList.toggle('active', S.cfg.ansSpace);
        if ($('btn-ans-space')) $('btn-ans-space').textContent = `📝 Ans Space: ${S.cfg.ansSpace ? 'ON' : 'OFF'}`;
        renderSections();
        renderPreview();
      };
    }

    const doPrint = () => window.print();
    if ($('btn-print')) $('btn-print').onclick = doPrint;
    if ($('btn-print2')) $('btn-print2').onclick = doPrint;
    if ($('btn-odt')) $('btn-odt').onclick = exportODT;
    if ($('btn-qpf-dl')) {
      $('btn-qpf-dl').onclick = () => {
        const blob = new Blob([toQPF()], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${S.exam.subject || 'paper'}.qpf`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast('.qpf saved!');
      };
    }

    // Guide & Info drawers
    if ($('btn-guide')) {
      $('btn-guide').onclick = () => {
        $('info')?.classList.remove('open');
        $('btn-info')?.classList.remove('active');
        $('guide')?.classList.toggle('open');
        $('btn-guide')?.classList.toggle('active');
      };
    }
    if ($('btn-guide-close')) {
      $('btn-guide-close').onclick = () => {
        $('guide')?.classList.remove('open');
        $('btn-guide')?.classList.remove('active');
      };
    }
    if ($('btn-info')) {
      $('btn-info').onclick = () => {
        $('guide')?.classList.remove('open');
        $('btn-guide')?.classList.remove('active');
        $('info')?.classList.toggle('open');
        $('btn-info')?.classList.toggle('active');
      };
    }
    if ($('btn-info-close')) {
      $('btn-info-close').onclick = () => {
        $('info')?.classList.remove('open');
        $('btn-info')?.classList.remove('active');
      };
    }

    // Theme toggle
    if ($('btn-theme')) {
      $('btn-theme').onclick = () => {
        const isLight = root.classList.toggle('light-mode');
        if ($('btn-theme')) $('btn-theme').textContent = isLight ? '🌙 Dark' : '☀️ Light';
      };
    }

    // Resizable sidebar
    const rh = $('resize-handle');
    const sb = $('sidebar');
    if (rh && sb) {
      let startX = 0;
      let startW = 0;
      rh.onpointerdown = (e: PointerEvent) => {
        startX = e.clientX;
        startW = sb.offsetWidth;
        rh.classList.add('dragging');
        rh.setPointerCapture(e.pointerId);
        rh.onpointermove = (ev: PointerEvent) => {
          const w = Math.min(Math.max(startW + ev.clientX - startX, 280), window.innerWidth * 0.7);
          sb.style.width = w + 'px';
        };
        rh.onpointerup = () => {
          rh.classList.remove('dragging');
          rh.onpointermove = null;
          rh.onpointerup = null;
        };
      };
    }

    // Boot: load KaTeX + JSZip then render Demo QPF
    Promise.all([
      loadScript('qp-katex-js', `${import.meta.env.BASE_URL}libs/katex.min.js`),
      loadScript('qp-jszip-js', `${import.meta.env.BASE_URL}libs/jszip.min.js`)
    ]).then(() => {
      applyQPF(DEMO_QPF);
    });

    return () => {
      secsEl?.removeEventListener('click', handleSecsClick);
      secsEl?.removeEventListener('input', handleSecsInput);
    };
  }, []);

  return (
    <div ref={rootRef} className="qp-maker-root">
      <style>{QP_STYLES}</style>

      {/* TOPBAR */}
      <div id="topbar">
        <button className="tbtn" onClick={() => navigate('/')} title="Back to Main Homepage">
          ← Home
        </button>
        <div className="vdiv" />
        <div className="brand">
          <div className="brand-dot" />
          <span>
            প্রশ্নপত্র <em>Maker</em>
          </span>
        </div>
        <div className="vdiv" />
        <div id="paper-badge">বার্ষিক পরীক্ষা - ২০২৫</div>
        <div className="spacer" />
        <button className="tbtn" id="btn-info">
          ℹ Info
        </button>
        <button className="tbtn" id="btn-guide">
          📖 Guide
        </button>
        <button className="tbtn" id="btn-theme" title="Toggle dark / light mode">
          ☀️ Light
        </button>
        <button className="tbtn" id="btn-autofit" title="Auto-shrink font to fit 1 page">
          ⚡ Auto-fit
        </button>
        <button className="tbtn" id="btn-ans-space" title="Toggle blank answer lines after questions">
          📝 Ans Space: OFF
        </button>
        <button className="tbtn" id="btn-settings">
          ⚙ Settings
        </button>
        <button className="tbtn primary" id="btn-print">
          🖨 Print / PDF
        </button>
      </div>

      {/* WORKSPACE */}
      <div id="workspace">
        {/* LEFT SIDEBAR */}
        <div id="sidebar">
          <div id="import-strip">
            <span className="strip-label">QPF</span>
            <button className="sbtn accent" id="btn-import-toggle">
              📥 Import QPF
            </button>
            <button className="sbtn green" id="btn-demo">
              ✨ Demo
            </button>
            <button className="sbtn" id="btn-copy-prompt" style={{ marginLeft: 'auto' }}>
              🤖 AI Prompt
            </button>
          </div>

          <div id="import-drawer">
            <div className="drawer-inner">
              <div className="drawer-tabs">
                <button className="dtab active" data-tab="paste">
                  📋 Paste QPF Text
                </button>
                <button className="dtab" data-tab="file">
                  📂 Upload .qpf / .txt
                </button>
                <button className="dtab" data-tab="prompt">
                  🤖 Get AI Prompt
                </button>
              </div>

              <div className="dtab-pane active" id="dpane-paste">
                <textarea
                  id="qpf-paste"
                  placeholder={`Paste QPF format text here...\n\nSupports [EQ:\\frac{৩}{৪}], $\\frac{লব}{হর}$, [CHEM:H2O], [SYM:ohm]`}
                />
                <div className="drawer-actions">
                  <button className="sbtn accent" id="btn-parse-paste" style={{ flex: 1, justifyContent: 'center', padding: '6px' }}>
                    ⚡ Load into Editor
                  </button>
                  <button className="sbtn" id="btn-clear-paste">
                    Clear
                  </button>
                </div>
              </div>

              <div className="dtab-pane" id="dpane-file">
                <div className="drop-zone" id="drop-zone">
                  📂 Drop <strong>.qpf</strong> or <strong>.txt</strong> file here, or click to browse
                  <input type="file" id="qpf-file" accept=".qpf,.txt" style={{ display: 'none' }} />
                </div>
              </div>

              <div className="dtab-pane" id="dpane-prompt">
                <p style={{ fontSize: '0.74rem', color: 'var(--text2)', marginBottom: '7px', lineHeight: 1.5 }}>
                  Copy this prompt → paste into <strong>ChatGPT / Gemini / Claude</strong> along with an image or text of any question paper →
                  paste the AI output back in the <em>Paste QPF</em> tab!
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="sbtn accent" id="btn-prompt-img" style={{ flex: 1, justifyContent: 'center', padding: '6px' }}>
                    📋 Copy Prompt (for Image / Photo)
                  </button>
                  <button className="sbtn green" id="btn-prompt-txt" style={{ flex: 1, justifyContent: 'center', padding: '6px' }}>
                    📋 Copy Prompt (for Raw Text)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable cards */}
          <div id="sidebar-scroll">
            <div className="acard open" id="ei-card">
              <div className="acard-head" id="ei-head">
                <span className="acard-icon">📋</span>
                <span className="acard-title">Exam Info (পরীক্ষার তথ্য)</span>
                <span className="acard-meta" id="ei-meta">
                  ভৌতবিজ্ঞান
                </span>
                <span className="acard-chev">▾</span>
              </div>
              <div className="acard-body">
                <div className="fg">
                  <div className="fl">
                    <label>Exam Title / পরীক্ষার নাম</label>
                    <input type="text" id="ei-title" defaultValue="বার্ষিক পরীক্ষা - ২০২৫" />
                  </div>
                </div>
                <div className="fg c2">
                  <div className="fl">
                    <label>Subject / বিষয়</label>
                    <input type="text" id="ei-sub" defaultValue="ভৌতবিজ্ঞান" />
                  </div>
                  <div className="fl">
                    <label>Class / শ্রেণী</label>
                    <input type="text" id="ei-cls" defaultValue="দশম শ্রেণী" />
                  </div>
                </div>
                <div className="fg c2">
                  <div className="fl">
                    <label>Time / সময়</label>
                    <input type="text" id="ei-time" defaultValue="৩ ঘণ্টা ১৫ মিনিট" />
                  </div>
                  <div className="fl">
                    <label>Full Marks / পূর্ণমান</label>
                    <input type="text" id="ei-marks" defaultValue="৯০" />
                  </div>
                </div>
                <div className="fg">
                  <div className="fl">
                    <label>Instructions / নির্দেশিকা</label>
                    <textarea id="ei-instr" rows={2} defaultValue="সমস্ত প্রশ্নের উত্তর দাও। ডানদিকের সংখ্যা পূর্ণমান নির্দেশ করে।" />
                  </div>
                </div>
                <div className="fg c3">
                  <div className="fl">
                    <label>Header Layout</label>
                    <select id="ei-hlayout" defaultValue="standard">
                      <option value="standard">Standard</option>
                      <option value="split">Split</option>
                      <option value="compact">Compact</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                  <div className="fl">
                    <label>Header Box</label>
                    <select id="ei-hbox" defaultValue="double">
                      <option value="none">None</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="rounded">Rounded</option>
                      <option value="bottom">Bottom Line</option>
                    </select>
                  </div>
                  <div className="fl">
                    <label>Divider</label>
                    <select id="ei-div" defaultValue="double">
                      <option value="solid">Solid</option>
                      <option value="double">Double</option>
                      <option value="dashed">Dashed</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div id="secs" />
          </div>

          <div id="export-bar">
            <button className="ebtn odt" id="btn-odt">
              📄 .odt (LibreOffice)
            </button>
            <button className="ebtn qpf" id="btn-qpf-dl">
              💾 Save .qpf
            </button>
            <button className="ebtn pdf" id="btn-print2">
              🖨 Print / PDF
            </button>
          </div>
        </div>

        <div id="resize-handle" title="Drag to resize sidebar" />

        {/* RIGHT COLUMN */}
        <div id="right-col">
          <div id="settings-panel">
            <div className="sp-inner">
              <div className="sp-group">
                <div className="sp-label">
                  Font Size <span id="v-fs">10.5pt</span>
                </div>
                <input type="range" id="r-fs" min="7" max="15" step="0.5" defaultValue="10.5" />
              </div>
              <div className="sp-group">
                <div className="sp-label">
                  Line Spacing <span id="v-lh">1.38</span>
                </div>
                <input type="range" id="r-lh" min="0.8" max="1.75" step="0.02" defaultValue="1.38" />
              </div>
              <div className="sp-group">
                <div className="sp-label">
                  Page Margin <span id="v-pad">0.9cm</span>
                </div>
                <input type="range" id="r-pad" min="0" max="2.5" step="0.05" defaultValue="0.9" />
              </div>
              <div className="sp-group">
                <div className="sp-label">Orientation</div>
                <div className="seg" id="seg-orient">
                  <button className="seg-btn active" data-v="auto">
                    Auto
                  </button>
                  <button className="seg-btn" data-v="portrait">
                    Portrait
                  </button>
                  <button className="seg-btn" data-v="landscape">
                    Landscape
                  </button>
                </div>
              </div>
              <div className="sp-group">
                <div className="sp-label">Cut Line Style</div>
                <div className="seg" id="seg-cut">
                  <button className="seg-btn" data-v="dotted">
                    ···
                  </button>
                  <button className="seg-btn active" data-v="dashed">
                    - -
                  </button>
                  <button className="seg-btn" data-v="solid">
                    ───
                  </button>
                  <button className="seg-btn" data-v="scissors">
                    ✂
                  </button>
                </div>
              </div>
              <div className="sp-group">
                <div className="sp-label">
                  Watermark Opacity <span id="v-wmo">8%</span>
                </div>
                <input type="range" id="r-wmo" min="0" max="35" step="1" defaultValue="8" />
              </div>
              <div className="sp-group">
                <div className="sp-label">
                  Watermark Size <span id="v-wms">55%</span>
                </div>
                <input type="range" id="r-wms" min="20" max="90" step="5" defaultValue="55" />
              </div>
              <div className="sp-group">
                <div className="sp-label">Watermark</div>
                <div className="seg" id="seg-wm">
                  <button className="seg-btn active" data-v="none">
                    None
                  </button>
                  <button className="seg-btn" data-v="default">
                    🔒 Default
                  </button>
                  <button className="seg-btn" data-v="custom">
                    📂 Custom
                  </button>
                </div>
                <div id="wm-code-wrap" style={{ display: 'none', marginTop: '5px', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="password"
                    id="wm-code-inp"
                    placeholder="Enter secret code…"
                    style={{ fontSize: '0.73rem', padding: '3px 7px', flex: 1 }}
                  />
                  <button className="sbtn accent" id="wm-code-ok" style={{ padding: '3px 9px' }}>
                    Unlock
                  </button>
                </div>
                <input type="file" id="wm-file" accept=".svg,.png,.jpg,.jpeg,.webp" style={{ display: 'none' }} />
              </div>
              <div className="sp-group">
                <div className="sp-label">Paper Language</div>
                <div className="seg" id="seg-lang">
                  <button className="seg-btn" data-v="full-bn" title="সব সংখ্যা বাংলায় (১, ২, ৩)">
                    পূর্ণ বাংলা
                  </button>
                  <button className="seg-btn active" data-v="mixed" title="বাংলা ও ইংরেজি মিশ্রিত">
                    Mixed
                  </button>
                  <button className="seg-btn" data-v="full-en" title="All numbers & labels in English">
                    Full English
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="preview">
            <div id="preview-bar">
              <span className="pbar-label">Copies / Sheet:</span>
              <button className="lchip active" data-l="1">
                Mono (1/pg)
              </button>
              <button className="lchip" data-l="2">
                Double (2/pg)
              </button>
              <button className="lchip" data-l="4">
                Quad (4/pg)
              </button>
              <button className="lchip" data-l="flow">
                Flow
              </button>
              <div className="spacer" />
              <span id="pbar-info" style={{ fontSize: '0.7rem', color: 'var(--text3)' }} />
              <div className="vdiv" />
              <button className="zbtn" id="z-out">
                −
              </button>
              <span id="zlabel">72%</span>
              <button className="zbtn" id="z-in">
                +
              </button>
            </div>
            <div id="preview-vp" />
          </div>
        </div>
      </div>

      {/* DIAGRAM MODAL */}
      <div id="dia-modal">
        <div id="dia-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.88rem' }}>✏ Draw / Upload Diagram</strong>
            <button className="ibtn del" id="dia-cancel">
              ✕ Close
            </button>
          </div>
          <div id="dia-toolbar">
            <button className="dtool active" data-dtool="pen">
              ✏ Free
            </button>
            <button className="dtool" data-dtool="line">
              ╱ Line
            </button>
            <button className="dtool" data-dtool="rect">
              ▭ Rect
            </button>
            <button className="dtool" data-dtool="circle">
              ◯ Circle
            </button>
            <button className="dtool" data-dtool="arrow">
              → Arrow
            </button>
            <button className="dtool" data-dtool="text">
              T Text
            </button>
            <button className="dtool" data-dtool="eraser">
              ⌫ Erase
            </button>
            <input
              type="color"
              id="dia-color"
              defaultValue="#000000"
              title="Stroke color"
              style={{ width: '28px', height: '26px', padding: '1px', borderRadius: '4px', cursor: 'pointer' }}
            />
            <select id="dia-size" defaultValue="2" style={{ width: 'auto', fontSize: '0.72rem', padding: '3px 6px' }}>
              <option value="1.5">Thin</option>
              <option value="2">Normal</option>
              <option value="3.5">Thick</option>
            </select>
            <button className="dtool" id="dia-clear" style={{ marginLeft: 'auto', color: 'var(--red)' }}>
              🗑 Clear
            </button>
            <button className="dtool" id="dia-img-load">
              📂 Load Image
            </button>
          </div>
          <canvas id="dia-canvas" width={548} height={320} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="sbtn accent" id="dia-save" style={{ padding: '6px 18px' }}>
              ✓ Insert Diagram
            </button>
          </div>
        </div>
      </div>

      {/* INFO DRAWER */}
      <div id="info">
        <div className="g-head">
          <h3>ℹ সম্পূর্ণ ব্যবহার নির্দেশিকা</h3>
          <button className="ibtn" id="btn-info-close">
            ✕
          </button>
        </div>
        <div className="g-body">
          <h4>১. প্রশ্নপত্র তৈরি করার দুটি উপায়</h4>
          <p>
            <strong>উপায় ক — সরাসরি টাইপ করুন:</strong> বামদিকের প্যানেলে <em>Exam Info</em> কার্ডে পরীক্ষার নাম, বিষয়, শ্রেণী, সময় ও পূর্ণমান লিখুন।
            তারপর প্রতিটি <em>Section</em>-এ <code>+ Add Question</code> বোতামে ক্লিক করে প্রশ্ন যোগ করুন।
          </p>
          <p style={{ marginTop: '5px' }}>
            <strong>উপায় খ — AI দিয়ে ছবি/টেক্সট থেকে অটো-ইম্পোর্ট:</strong>
            <br />১. উপরে <code>📥 Import QPF</code> → <code>🤖 Get AI Prompt</code> ট্যাবে যান।
            <br />২. প্রম্পট কপি করে ChatGPT / Gemini-তে প্রশ্নপত্রের ছবি সহ পেস্ট করুন।
            <br />৩. AI যে QPF টেক্সট দেবে সেটি কপি করে <code>📋 Paste QPF Text</code> বক্সে পেস্ট করে <code>⚡ Load into Editor</code> চাপুন।
          </p>

          <h4>২. বাংলা ও ইংরেজি ভগ্নাংশ এবং গণিত (Bilingual Math & LaTeX)</h4>
          <p>প্রশ্ন বা অপশনে বাংলা ও ইংরেজি উভয় ভাষাতেই ভগ্নাংশ, ভাগ ও সমীকরণ লেখা যায়:</p>
          <pre>{`বাংলা ভগ্নাংশ (LaTeX):  $\\frac{লব}{হর}$ বা [EQ:\\frac{৩}{৪}]
সহজ ভগ্নাংশ (Auto):    ৩/৪ বা লব/হর বা [EQ:১২/৫]
ভাগ ও গুণ:             [EQ:১২ \\div ৪ = ৩] বা $\\frac{৩}{৪} \\div \\frac{৯}{১৬}$
দ্বিঘাত সমীকরণ:       [EQ:x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}]
রাসায়নিক সংকেত:     [CHEM:H2SO4], [CHEM:6CO2 + 6H2O -> C6H12O6 + 6O2]`}</pre>

          <h4>৩. অথবা (OR) প্রশ্ন যুক্ত করার নিয়ম</h4>
          <p>
            যেকোনো প্রশ্নের ডানদিকে <code>অথবা</code> বোতামে ক্লিক করলেই প্রশ্নটি আগের প্রশ্নের সাথে <em>— অথবা / OR —</em> হিসেবে যুক্ত হয়ে যাবে।
          </p>

          <h4>৪. প্রশ্নের ভেতরে ভাগ নম্বর (Sub-part Marks)</h4>
          <p>
            প্রশ্নের শেষে বন্ধনীর মধ্যে যোগ আকারে নম্বর লিখলে যেমন <code>(1+3+1)</code> বা <code>(2+3)</code> — সেটি স্বয়ংক্রিয়ভাবে প্রশ্নের ডানদিকে চলে যাবে।
          </p>
        </div>
      </div>

      {/* GUIDE DRAWER */}
      <div id="guide">
        <div className="g-head">
          <h3>📖 QPF Format &amp; Bilingual Math Reference</h3>
          <button className="ibtn" id="btn-guide-close">
            ✕
          </button>
        </div>
        <div className="g-body">
          <h4>1. Bilingual Math &amp; Fractions (বাংলা ও ইংরেজি গণিত)</h4>
          <p>
            Write equations using either <code>[EQ:...]</code> or standard <code>$...$</code> / <code>$$...$$</code> LaTeX. Bengali numerals (
            <code>০-৯</code>) and Bengali words (<code>লব/হর</code>) inside fractions and roots are automatically preserved without breaking Bengali
            conjuncts (যুক্তাক্ষর):
          </p>
          <pre>{`[EQ:\\frac{৩}{৪}]         →  ৩/৪ (stacked fraction)
$\\frac{লব}{হর}$          →  লব/হর (stacked fraction)
[EQ:১২ \\div ৪ = ৩]      →  ১২ ÷ ৪ = ৩
$\\sqrt{২৫} = ৫$          →  √২৫ = ৫
[EQ:E = mc^2]            →  E = mc²
[EQ:\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}]`}</pre>

          <h4>2. Chemistry Formulas — [CHEM:...]</h4>
          <pre>{`[CHEM:H2O]          →  H₂O
[CHEM:H2SO4]        →  H₂SO₄
[CHEM:Ca(OH)2]      →  Ca(OH)₂
[CHEM:SO4^2-]       →  SO₄²⁻
[CHEM:2H2 + O2 -> 2H2O]   →  2H₂ + O₂ → 2H₂O`}</pre>

          <h4>3. Symbols — [SYM:...]</h4>
          <p>
            <code>[SYM:deg]</code> ° &nbsp; <code>[SYM:celsius]</code> °C &nbsp; <code>[SYM:ohm]</code> Ω &nbsp; <code>[SYM:micro]</code> μ &nbsp;{' '}
            <code>[SYM:alpha]</code> α &nbsp; <code>[SYM:beta]</code> β &nbsp; <code>[SYM:pi]</code> π &nbsp; <code>[SYM:pm]</code> ± &nbsp;{' '}
            <code>[SYM:times]</code> × &nbsp; <code>[SYM:div]</code> ÷
          </p>

          <h4>4. Subscript &amp; Superscript</h4>
          <p>
            <code>x[SUP:2]</code> → x² &nbsp;|&nbsp; <code>H[SUB:2]O</code> → H₂O
          </p>
        </div>
      </div>

      <div id="toasts" />
    </div>
  );
}
