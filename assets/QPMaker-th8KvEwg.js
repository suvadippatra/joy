import{b as Fe,r as we,j as e}from"./index-BnaKFKMX.js";const De={0:"₀",1:"₁",2:"₂",3:"₃",4:"₄",5:"₅",6:"₆",7:"₇",8:"₈",9:"₉","০":"₀","১":"₁","২":"₂","৩":"₃","৪":"₄","৫":"₅","৬":"₆","৭":"₇","৮":"₈","৯":"₉","+":"₊","-":"₋","=":"₌","(":"₍",")":"₎"},Be={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹","০":"⁰","১":"¹","২":"²","৩":"³","৪":"⁴","৫":"⁵","৬":"⁶","৭":"⁷","৮":"⁸","৯":"⁹","+":"⁺","-":"⁻","=":"⁼","(":"⁽",")":"⁾",n:"ⁿ"},Ue={alpha:"α",beta:"β",gamma:"γ",delta:"δ",Delta:"Δ",theta:"θ",lambda:"λ",mu:"μ",pi:"π",sigma:"σ",Sigma:"Σ",omega:"ω",Omega:"Ω",phi:"φ",psi:"ψ",rho:"ρ",tau:"τ",epsilon:"ε",deg:"°",degree:"°",pm:"±",mp:"∓",times:"×",div:"÷",cdot:"·",neq:"≠",leq:"≤",geq:"≥",approx:"≈",equiv:"≡",prop:"∝",inf:"∞",infty:"∞",sqrt:"√",cbrt:"∛",int:"∫",sum:"∑",prod:"∏",partial:"∂",nabla:"∇",forall:"∀",exists:"∃",in:"∈",notin:"∉",subset:"⊂",union:"∪",cap:"∩",and:"∧",or:"∨",not:"¬",implies:"⇒",iff:"⇔",to:"→",gets:"←",up:"↑",down:"↓",lr:"↔",rev:"⇌",hbar:"ℏ",angstrom:"Å",micro:"μ",ohm:"Ω",celsius:"°C",fahrenheit:"°F",kelvin:"K"};function X(H){return String(H??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function We(H){let S=H.trim();return S=S.replace(/<->|<=>/g," ⇌ ").replace(/->/g," → ").replace(/\^(\d*[+-]|\+|\-)/g,(z,j)=>j.split("").map(w=>Be[w]||w).join("")),S=S.replace(/([A-Za-z\)\]])(\d+)/g,(z,j,w)=>j+w.split("").map(A=>De[A]||A).join("")),`<span class="tok-chem">${X(S)}</span>`}function Ye(H){let S=H.trim();if(!S)return"";S=S.replace(/÷/g," \\div ").replace(/×/g," \\times ").replace(/±/g," \\pm ").replace(/≠/g," \\neq ").replace(/≤/g," \\leq ").replace(/≥/g," \\geq ").replace(/≈/g," \\approx ").replace(/∞/g," \\infty "),S=S.replace(/(^|[^\\a-zA-Z0-9\u0980-\u09FF\/])([\u0980-\u09FFa-zA-Z0-9]+)\s*\/\s*([\u0980-\u09FFa-zA-Z0-9]+)(?=$|[^\/a-zA-Z0-9\u0980-\u09FF])/g,(j,w,A,I)=>`${w}\\frac{${A}}{${I}}`);const z=[];return S=S.replace(/\\(?:text|mathrm|textbf|textit)\s*\{[^{}]*\}/g,j=>(z.push(j),`@@PROTECTED_TEXT_${z.length-1}@@`)),S=S.replace(/[\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+)*/g,j=>`\\text{${j}}`),S=S.replace(/@@PROTECTED_TEXT_(\d+)@@/g,(j,w)=>z[Number(w)]||""),S}function Z(H,S=!1){const z=Ye(H),j=window.katex;if(j&&typeof j.renderToString=="function")try{const A=j.renderToString(z,{throwOnError:!1,displayMode:S,strict:!1,trust:!0});return`<span class="tok-eq${S?" tok-eq-block":""}">${A}</span>`}catch{}let w=X(H.trim());return w=w.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,'<span class="qp-inline-frac"><span class="qp-frac-num">$1</span><span class="qp-frac-den">$2</span></span>'),w=w.replace(/([\u0980-\u09FFa-zA-Z0-9]+)\s*\/\s*([\u0980-\u09FFa-zA-Z0-9]+)/g,'<span class="qp-inline-frac"><span class="qp-frac-num">$1</span><span class="qp-frac-den">$2</span></span>'),w=w.replace(/\\div\b/g,"÷").replace(/\\times\b/g,"×").replace(/\\pm\b/g,"±").replace(/\\sqrt\s*\{([^{}]+)\}/g,"√($1)"),`<span class="tok-eq">${w}</span>`}function _e(H){if(!H)return"";const S=String(H),z=/\[(EQ|FRAC|CHEM|SYM|SUB|SUP):([\s\S]*?)\]|\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|(\\frac\s*\{[^{}]+\}\s*\{[^{}]+\}|\\sqrt\s*(?:\[[^\]]+\])?\s*\{[^{}]+\})|((?:[\u09E6-\u09EF]+|[\u0980-\u09FF]{1,12})\s*\/\s*(?:[\u09E6-\u09EF]+|[\u0980-\u09FF]{1,12}))/g;let j="",w=0,A;for(;(A=z.exec(S))!==null;){A.index>w&&(j+=X(S.slice(w,A.index)));const[,I,J,K,l,R,Q,o,M]=A;if(I){const L=J.trim();if(I==="EQ"||I==="FRAC")j+=Z(L,!1);else if(I==="CHEM")j+=We(L);else if(I==="SYM"){const P=Ue[L]||L;j+=`<span class="tok-sym">${X(P)}</span>`}else I==="SUB"?j+=`<sub>${X(L)}</sub>`:I==="SUP"&&(j+=`<sup>${X(L)}</sup>`)}else if(K!==void 0||l!==void 0){const L=(K??l).trim();j+=Z(L,!0)}else if(R!==void 0||Q!==void 0){const L=(R??Q).trim();j+=Z(L,!1)}else o!==void 0?j+=Z(o.trim(),!1):M!==void 0&&(j+=Z(M.trim(),!1));w=z.lastIndex}return w<S.length&&(j+=X(S.slice(w))),j}const Xe=`
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
`,$e=`@EXAM
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
`,je=`You are an expert OCR engine for Indian school exam papers (Bengali, English, Hindi, Sanskrit, Science, Math).
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
--- END FORMAT ---`,Ve=`Convert the following raw question paper text into QPF v1.1 format.

RULES:
- Chemical formulas → [CHEM:H2O], [CHEM:H2SO4], [CHEM:CO2], reactions: [CHEM:A + B -> C]
- Math/Physics equations & fractions (Bengali or English) → [EQ:\\frac{a}{b}], [EQ:\\frac{৩}{৪}], $\\frac{লব}{হর}$, [EQ:x^2], [EQ:\\sqrt{x}]
- Symbols → [SYM:deg], [SYM:ohm], [SYM:alpha], [SYM:pi], [SYM:pm], [SYM:times], [SYM:neq], [SYM:leq], [SYM:geq]
- Subscript/superscript → [SUB:n], [SUP:2+]
- OR questions → put @OR on its own line between the two questions
- Keep original language intact. Output ONLY raw QPF text, no markdown fences.

PASTE YOUR RAW QUESTIONS BELOW THIS LINE:
-----------------------------------------
`;function Ge(){const H=Fe(),S=we.useRef(null);return we.useEffect(()=>{var ke,qe;const z=S.current;if(!z)return;if(!document.getElementById("qp-katex-css")){const t=document.createElement("link");t.id="qp-katex-css",t.rel="stylesheet",t.href="/joy/libs/katex.min.css",document.head.appendChild(t)}const j=(t,a)=>new Promise(r=>{if(document.getElementById(t)){r();return}const i=document.createElement("script");i.id=t,i.src=a,i.onload=()=>r(),i.onerror=()=>r(),document.head.appendChild(i)}),w=t=>String(t).replace(/[0-9]/g,a=>"০১২৩৪৫৬৭৮৯"[+a]),A=["ক","খ","গ","ঘ","ঙ","চ","ছ","জ","ঝ","ঞ"],I=["a","b","c","d","e","f","g","h","i","j"],J=["বিভাগ 'ক'","বিভাগ 'খ'","বিভাগ 'গ'","বিভাগ 'ঘ'","বিভাগ 'ঙ'","বিভাগ 'চ'","বিভাগ 'ছ'","বিভাগ 'জ'","বিভাগ 'ঝ'","বিভাগ 'ঞ'"],K=["Section 'A'","Section 'B'","Section 'C'","Section 'D'","Section 'E'","Section 'F'","Section 'G'","Section 'H'","Section 'I'","Section 'J'"];let l={exam:{title:"বার্ষিক পরীক্ষা - ২০২৫",subject:"ভৌতবিজ্ঞান",class:"দশম শ্রেণী",time:"৩ ঘণ্টা ১৫ মিনিট",marks:"৯০",instructions:"সমস্ত প্রশ্নের উত্তর দাও। ডানদিকের সংখ্যা পূর্ণমান নির্দেশ করে।",headerLayout:"standard",headerBox:"double",divider:"double"},cfg:{fs:10.5,lh:1.38,pad:.9,orient:"auto",cut:"dashed",layout:1,zoom:.72,wmOpacity:.08,wmSize:55,wmSrc:"none",wmCustomData:"",wmUnlocked:!1,ansSpace:!1,lang:"mixed"},sections:[]},R=null,Q=null;const o=t=>z.querySelector(`#${t}`),M=t=>X(t),L=t=>_e(t);function P(t,a=""){const r=o("toasts");if(!r)return;const i=document.createElement("div");i.className="toast"+(a?" "+a:""),i.textContent=t,r.appendChild(i),setTimeout(()=>i.remove(),3400)}function ee(){var t,a,r,i,s,n,p,g,b;l.exam.title=((t=o("ei-title"))==null?void 0:t.value)||"",l.exam.subject=((a=o("ei-sub"))==null?void 0:a.value)||"",l.exam.class=((r=o("ei-cls"))==null?void 0:r.value)||"",l.exam.time=((i=o("ei-time"))==null?void 0:i.value)||"",l.exam.marks=((s=o("ei-marks"))==null?void 0:s.value)||"",l.exam.instructions=((n=o("ei-instr"))==null?void 0:n.value)||"",l.exam.headerLayout=((p=o("ei-hlayout"))==null?void 0:p.value)||"standard",l.exam.headerBox=((g=o("ei-hbox"))==null?void 0:g.value)||"double",l.exam.divider=((b=o("ei-div"))==null?void 0:b.value)||"double",o("paper-badge")&&(o("paper-badge").textContent=l.exam.title||"Untitled"),o("ei-meta")&&(o("ei-meta").textContent=l.exam.subject||"")}function Se(){o("ei-title")&&(o("ei-title").value=l.exam.title),o("ei-sub")&&(o("ei-sub").value=l.exam.subject),o("ei-cls")&&(o("ei-cls").value=l.exam.class),o("ei-time")&&(o("ei-time").value=l.exam.time),o("ei-marks")&&(o("ei-marks").value=l.exam.marks),o("ei-instr")&&(o("ei-instr").value=l.exam.instructions),o("ei-hlayout")&&(o("ei-hlayout").value=l.exam.headerLayout),o("ei-hbox")&&(o("ei-hbox").value=l.exam.headerBox),o("ei-div")&&(o("ei-div").value=l.exam.divider),o("paper-badge")&&(o("paper-badge").textContent=l.exam.title||"Untitled"),o("ei-meta")&&(o("ei-meta").textContent=l.exam.subject||"")}function Ee(t){const a=t.split(/\r?\n/),r={...l.exam},i=[];let s=null,n=null,p=!1,g=null;const b=()=>{n&&s&&(s.questions.push(n),n=null)},v=()=>{b(),s&&(i.push(s),s=null)};for(const m of a){const u=m.trim();if(!u||u.startsWith("#")||u.startsWith("//"))continue;if(u==="@EXAM"){v(),g="exam";continue}if(u==="@SECTION"){v(),g="sec",s={id:Date.now()+Math.random(),name:J[i.length]||`Section ${i.length+1}`,type:"short",marksPerQ:2,answerAny:5,optStyle:"bn",info:"",questions:[]};continue}if(u==="@OR"){b(),s&&s.questions.length>0&&(p=!0);continue}if(u.startsWith("@Q ")||u==="@Q"){b(),s||(s={id:Date.now(),name:J[0],type:"short",marksPerQ:2,answerAny:5,optStyle:"bn",info:"",questions:[]}),n={id:Date.now()+Math.random(),text:u.slice(2).trim(),opts:[],orWithPrev:p,marks:""},p=!1,g="q";continue}if(u.startsWith("@OPT ")&&n){n.opts.push(u.slice(5).trim());continue}if(u.startsWith("@MARKS ")&&n){n.marks=u.slice(7).trim();continue}const d=u.match(/^([A-Z_]+)\s*:\s*(.*)$/);if(d){const[,c,f]=d;g==="exam"?c==="TITLE"?r.title=f:c==="SUBJECT"?r.subject=f:c==="CLASS"?r.class=f:c==="TIME"?r.time=f:c==="MARKS"?r.marks=f:c==="INSTRUCTIONS"?r.instructions=f:c==="HEADER_LAYOUT"?r.headerLayout=f.toLowerCase():c==="HEADER_BOX"?r.headerBox=f.toLowerCase():c==="DIVIDER"&&(r.divider=f.toLowerCase()):(g==="sec"||g==="q")&&s&&(c==="NAME"?s.name=f:c==="TYPE"?s.type=f.toLowerCase():c==="MARKS_PER_Q"?s.marksPerQ=parseFloat(f)||1:c==="ANSWER_ANY"?s.answerAny=parseInt(f)||5:c==="OPT_STYLE"?s.optStyle=f.toLowerCase():c==="INFO"&&(s.info=f));continue}g==="q"&&n&&(n.text+=" "+u)}return v(),i.forEach(m=>{m.type==="mcq"&&m.questions.forEach(u=>{for(;u.opts.length<4;)u.opts.push("")})}),{exam:r,sections:i}}function Ne(){ee();let t=`@EXAM
TITLE: ${l.exam.title}
SUBJECT: ${l.exam.subject}
CLASS: ${l.exam.class}
TIME: ${l.exam.time}
MARKS: ${l.exam.marks}
HEADER_LAYOUT: ${l.exam.headerLayout}
HEADER_BOX: ${l.exam.headerBox}
DIVIDER: ${l.exam.divider}
INSTRUCTIONS: ${l.exam.instructions}
`;return l.sections.forEach(a=>{t+=`
@SECTION
NAME: ${a.name}
TYPE: ${a.type}
MARKS_PER_Q: ${a.marksPerQ}
ANSWER_ANY: ${a.answerAny}
OPT_STYLE: ${a.optStyle}
INFO: ${a.info}

`,a.questions.forEach(r=>{r.orWithPrev&&(t+=`@OR
`),t+=`@Q ${r.text}
`,r.marks&&(t+=`@MARKS ${r.marks}
`),a.type==="mcq"&&(r.opts||[]).forEach(i=>t+=`@OPT ${i}
`)})}),t}function te(t){var a,r;if(!t.trim()){P("Nothing to import!","err");return}try{const{exam:i,sections:s}=Ee(t);l.exam=i,s.length>0&&(l.sections=s),Se(),q(),k(),(a=o("import-drawer"))==null||a.classList.remove("open"),(r=o("btn-import-toggle"))==null||r.classList.remove("active"),P(`Imported ${s.length} section(s), ${s.reduce((n,p)=>n+p.questions.length,0)} questions!`)}catch(i){P("Parse error: "+i.message,"err")}}function q(){const t=o("secs");if(!t)return;t.innerHTML="",l.sections.forEach((r,i)=>{const s=r.marksPerQ*r.answerAny,n=R&&R.secIdx===i,p=document.createElement("div");p.className="acard open";let g="",b=0;r.questions.forEach((v,m)=>{v.orWithPrev||b++;const u=v.orWithPrev?"↳ OR":`Q${b}`,d=n&&Q!==m;v.orWithPrev&&(g+=`<div class="or-pill"><span>— অথবা / OR —</span>
              <button class="ibtn del" data-act="unlink-or" data-si="${i}" data-qi="${m}" style="margin-left:auto">✕ Unlink</button>
            </div>`);let c="";if(r.type==="mcq"){const h=r.optStyle==="en"?I:A;c='<div class="opts-grid">'+[0,1,2,3].map(y=>`
              <div class="opt-row">
                <span class="opt-lbl">${h[y]})</span>
                <input type="text" value="${M(v.opts[y]||"")}" placeholder="Option ${h[y]} (supports $...$ / [EQ:...])"
                  data-act="q-opt" data-si="${i}" data-qi="${m}" data-oi="${y}">
              </div>`).join("")+"</div>";const x=v.mcqImg;c+=x?`<div class="qextra-box" style="margin-top:5px">
                  <div class="qextra-box-head"><span>🖼 Image</span>
                    <div style="display:flex;gap:4px;align-items:center">
                      <select data-act="mcqimg-align" data-si="${i}" data-qi="${m}" style="font-size:0.68rem;padding:1px 4px;width:auto">
                        <option value="left" ${x.align==="left"?"selected":""}>Left</option>
                        <option value="center" ${!x.align||x.align==="center"?"selected":""}>Center</option>
                        <option value="right" ${x.align==="right"?"selected":""}>Right</option>
                      </select>
                      <input type="range" min="15" max="100" value="${x.width||50}" style="width:65px"
                        data-act="mcqimg-w" data-si="${i}" data-qi="${m}" title="Size %">
                      <button class="ibtn del" data-act="mcqimg-del" data-si="${i}" data-qi="${m}">✕</button>
                    </div>
                  </div>
                  <img src="${x.src}" style="max-height:70px;max-width:100%;border-radius:4px;display:block" alt="">
                </div>`:`<div style="margin-top:4px"><button class="xbtn" data-act="mcqimg-add" data-si="${i}" data-qi="${m}">🖼 +Image</button></div>`}let f="",T="";if(r.type!=="mcq"){const h=v.extra||{};if(f=`<div class="qextra-bar">
              <button class="xbtn ${h.img?"active":""}" data-act="x-img" data-si="${i}" data-qi="${m}">🖼 Image</button>
              <button class="xbtn ${h.tbl?"active":""}" data-act="x-tbl" data-si="${i}" data-qi="${m}">⊞ Table</button>
              <button class="xbtn ${h.dia?"active":""}" data-act="x-dia" data-si="${i}" data-qi="${m}">✏ Diagram</button>
              <button class="xbtn ${h.ldia?"active":""}" data-act="x-ldia" data-si="${i}" data-qi="${m}">🏷 Labeled Diagram</button>
            </div>`,h.img&&(T+=`<div class="qextra-box">
                <div class="qextra-box-head"><span>🖼 Image</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <select data-act="img-align" data-si="${i}" data-qi="${m}" style="font-size:0.68rem;padding:1px 4px;width:auto">
                      <option value="left" ${h.img.align==="left"?"selected":""}>Left</option>
                      <option value="center" ${!h.img.align||h.img.align==="center"?"selected":""}>Center</option>
                      <option value="right" ${h.img.align==="right"?"selected":""}>Right</option>
                    </select>
                    <input type="range" min="20" max="100" value="${h.img.width||60}" style="width:70px"
                      data-act="img-w" data-si="${i}" data-qi="${m}" title="Width %">
                    <button class="ibtn del" data-act="x-img-del" data-si="${i}" data-qi="${m}">✕</button>
                  </div>
                </div>
                ${h.img.src?`<img src="${h.img.src}" style="max-height:80px;max-width:100%;border-radius:4px;display:block;margin-bottom:4px" alt="">`:""}
                <button class="sbtn" data-act="img-pick" data-si="${i}" data-qi="${m}" style="width:100%;justify-content:center">📂 ${h.img.src?"Change Image":"Upload Image"}</button>
              </div>`),h.tbl){const x=h.tbl;let y="";for(let E=0;E<x.rows;E++){let C="";for(let O=0;O<x.cols;O++){const V=x.data[E]&&x.data[E][O]||"",re=E===0&&x.hasHeader?"th":"td";C+=`<${re}><input type="text" value="${M(V)}" placeholder="${E===0&&x.hasHeader?"Header":"Cell"}"
                    data-act="tbl-cell" data-si="${i}" data-qi="${m}" data-r="${E}" data-c="${O}"></${re}>`}y+=`<tr>${C}</tr>`}T+=`<div class="qextra-box">
                <div class="qextra-box-head"><span>⊞ Table (${x.rows}×${x.cols})</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <label style="font-size:0.67rem;display:flex;align-items:center;gap:3px;cursor:pointer">
                      <input type="checkbox" ${x.hasHeader?"checked":""} data-act="tbl-hdr" data-si="${i}" data-qi="${m}" style="width:auto"> Header row
                    </label>
                    <button class="ibtn del" data-act="x-tbl-del" data-si="${i}" data-qi="${m}">✕</button>
                  </div>
                </div>
                <div class="tbl-wrap"><table class="tbl-edit">${y}</table></div>
                <div class="tbl-controls">
                  <button class="ibtn" data-act="tbl-r+" data-si="${i}" data-qi="${m}">+ Row</button>
                  <button class="ibtn" data-act="tbl-r-" data-si="${i}" data-qi="${m}">− Row</button>
                  <button class="ibtn" data-act="tbl-c+" data-si="${i}" data-qi="${m}">+ Col</button>
                  <button class="ibtn" data-act="tbl-c-" data-si="${i}" data-qi="${m}">− Col</button>
                </div>
              </div>`}if(h.dia&&(T+=`<div class="qextra-box">
                <div class="qextra-box-head"><span>✏ Diagram</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <select data-act="dia-align" data-si="${i}" data-qi="${m}" style="font-size:0.68rem;padding:1px 4px;width:auto">
                      <option value="left" ${h.dia.align==="left"?"selected":""}>Left</option>
                      <option value="center" ${!h.dia.align||h.dia.align==="center"?"selected":""}>Center</option>
                      <option value="right" ${h.dia.align==="right"?"selected":""}>Right</option>
                    </select>
                    <input type="range" min="20" max="100" value="${h.dia.width||65}" style="width:70px"
                      data-act="dia-w" data-si="${i}" data-qi="${m}" title="Width %">
                    <button class="ibtn del" data-act="x-dia-del" data-si="${i}" data-qi="${m}">✕</button>
                  </div>
                </div>
                ${h.dia.src?`<img src="${h.dia.src}" style="max-height:80px;max-width:100%;border-radius:4px;background:#fff;display:block;margin-bottom:4px" alt="">`:""}
                <button class="sbtn accent" data-act="dia-open" data-si="${i}" data-qi="${m}" style="width:100%;justify-content:center">✏ ${h.dia.src?"Edit Diagram":"Draw Diagram"}</button>
              </div>`),h.ldia){const x=h.ldia,y=(x.labels||[]).map((E,C)=>`
                <div style="display:flex;gap:4px;align-items:center;margin-bottom:3px">
                  <span style="font-size:0.7rem;color:var(--accent);font-weight:700;min-width:22px">${me(C,x.style)})</span>
                  <input type="text" value="${M(E)}" placeholder="Label ${C+1} (blank = student fills)"
                    data-act="ldia-lbl" data-si="${i}" data-qi="${m}" data-li="${C}" style="flex:1;font-size:0.74rem;padding:3px 6px">
                  <button class="ibtn del" data-act="ldia-lbl-del" data-si="${i}" data-qi="${m}" data-li="${C}">✕</button>
                </div>`).join("");T+=`<div class="qextra-box">
                <div class="qextra-box-head"><span>🏷 Labeled Diagram</span>
                  <div style="display:flex;gap:4px;align-items:center">
                    <select data-act="ldia-style" data-si="${i}" data-qi="${m}" style="font-size:0.68rem;padding:1px 4px;width:auto" title="Numbering style">
                      <option value="num" ${!x.style||x.style==="num"?"selected":""}>1, 2, 3</option>
                      <option value="alpha" ${x.style==="alpha"?"selected":""}>A, B, C</option>
                      <option value="alphal" ${x.style==="alphal"?"selected":""}>a, b, c</option>
                      <option value="roman" ${x.style==="roman"?"selected":""}>i, ii, iii</option>
                      <option value="bn" ${x.style==="bn"?"selected":""}>ক, খ, গ</option>
                    </select>
                    <input type="range" min="20" max="75" value="${x.imgW||45}" style="width:60px"
                      data-act="ldia-w" data-si="${i}" data-qi="${m}" title="Image width %">
                    <button class="ibtn del" data-act="x-ldia-del" data-si="${i}" data-qi="${m}">✕</button>
                  </div>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:6px">
                  <button class="sbtn" data-act="ldia-img" data-si="${i}" data-qi="${m}" style="flex:1;justify-content:center">📂 ${x.src?"Change Image":"Upload Image"}</button>
                  <button class="sbtn accent" data-act="ldia-draw" data-si="${i}" data-qi="${m}" style="flex:1;justify-content:center">✏ Draw</button>
                </div>
                ${x.src?`<img src="${x.src}" style="max-height:70px;max-width:100%;border-radius:4px;background:#fff;display:block;margin-bottom:6px" alt="">`:""}
                <div style="margin-bottom:4px">${y}</div>
                <button class="ibtn" data-act="ldia-lbl-add" data-si="${i}" data-qi="${m}" style="width:100%;text-align:center;padding:4px">+ Add Label Line</button>
              </div>`}}g+=`
            <div class="qcard ${v.orWithPrev?"or-linked":""} ${d?"or-selecting":""}"
                 data-si="${i}" data-qi="${m}" ${n?'data-act="or-pick"':""}>
              <div class="qcard-top">
                <span class="qnum">${u}</span>
                <input type="text" value="${M(v.marks||"")}" placeholder="marks e.g. 2 or 1+2"
                  style="width:82px;font-size:0.7rem;padding:2px 6px"
                  data-act="q-marks" data-si="${i}" data-qi="${m}" title="Custom marks override">
                ${l.cfg.ansSpace&&r.type!=="mcq"?`
                <input type="number" value="${v.ansLines??""}" min="0" max="200" step="2" placeholder="mm"
                  style="width:52px;font-size:0.7rem;padding:2px 5px"
                  data-act="q-lines" data-si="${i}" data-qi="${m}" title="Blank space height in mm">`:""}
                <div class="qcard-actions">
                  ${m>0?`<button class="ibtn ${v.orWithPrev?"or-on":""}" data-act="toggle-or" data-si="${i}" data-qi="${m}" title="Toggle OR with previous">অথবা</button>`:""}
                  <button class="ibtn del" data-act="del-q" data-si="${i}" data-qi="${m}">✕</button>
                </div>
              </div>
              <textarea rows="2" placeholder="প্রশ্ন লিখুন... ফর্মুলা: [EQ:\\frac{৩}{৪}], $\\frac{লব}{হর}$, [CHEM:H2O]"
                data-act="q-text" data-si="${i}" data-qi="${m}">${M(v.text)}</textarea>
              ${c}
              ${f}
              ${T}
            </div>`}),p.innerHTML=`
          <div class="acard-head" data-act="toggle-card">
            <span class="sec-badge">${M(r.name)}</span>
            <span class="acard-title">${r.questions.length} Qs · ${r.type.toUpperCase()}</span>
            <span class="acard-meta">${r.marksPerQ}×${r.answerAny}=${s}M</span>
            <button class="ibtn del" data-act="del-sec" data-si="${i}" style="margin-left:4px">✕</button>
            <span class="acard-chev">▾</span>
          </div>
          <div class="acard-body">
            <div class="fg ${l.cfg.ansSpace&&r.type!=="mcq"?"c4":"c3"}">
              <div class="fl"><label>Section Name</label>
                <input type="text" value="${M(r.name)}" data-act="sec-name" data-si="${i}">
              </div>
              <div class="fl"><label>Type</label>
                <select data-act="sec-type" data-si="${i}">
                  <option value="mcq" ${r.type==="mcq"?"selected":""}>MCQ</option>
                  <option value="short" ${r.type==="short"?"selected":""}>Short</option>
                  <option value="descriptive" ${r.type==="descriptive"?"selected":""}>Descriptive</option>
                  <option value="long" ${r.type==="long"?"selected":""}>Long</option>
                </select>
              </div>
              <div class="fl"><label>Opt Style</label>
                <select data-act="sec-opt" data-si="${i}">
                  <option value="bn" ${r.optStyle==="bn"?"selected":""}>ক খ গ ঘ</option>
                  <option value="en" ${r.optStyle==="en"?"selected":""}>a b c d</option>
                </select>
              </div>
              ${l.cfg.ansSpace&&r.type!=="mcq"?`
              <div class="fl"><label>Gap (mm)</label>
                <input type="number" value="${r.ansLines??(r.type==="short"?15:r.type==="descriptive"?35:55)}" min="0" max="200" step="2"
                  data-act="sec-lines" data-si="${i}" title="Default blank space in mm after each question">
              </div>`:""}
            </div>
            <div class="fg c3">
              <div class="fl"><label>Marks / Q</label>
                <input type="number" value="${r.marksPerQ}" min="0.5" step="0.5" data-act="sec-mpq" data-si="${i}">
              </div>
              <div class="fl"><label>Answer Any</label>
                <input type="number" value="${r.answerAny}" min="1" data-act="sec-any" data-si="${i}">
              </div>
              <div class="fl"><label>Total Marks</label>
                <input type="text" value="${s}" readonly style="opacity:0.55;cursor:default">
              </div>
            </div>
            <div class="fg">
              <div class="fl"><label>Section Instruction</label>
                <input type="text" value="${M(r.info)}" placeholder="e.g. যেকোনো পাঁচটি প্রশ্নের উত্তর দাও" data-act="sec-info" data-si="${i}">
              </div>
            </div>
            <div class="qlist">${g}</div>
            <div class="add-row">
              <button class="abtn" data-act="add-q" data-si="${i}">+ Add Question</button>
              <button class="abtn ${n?"or-mode":""}" data-act="or-mode" data-si="${i}">
                ${n?"⚡ Click 2nd Question (Cancel)":"🔗 Link OR (অথবা)"}
              </button>
            </div>
          </div>`,t.appendChild(p)});const a=document.createElement("button");a.className="abtn",a.style.cssText="padding:9px;font-size:0.78rem;flex-shrink:0",a.textContent="+ Add Section (বিভাগ যোগ করুন)",a.dataset.act="add-sec",t.appendChild(a)}const Te=["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii"];function me(t,a){return a==="alpha"?String.fromCharCode(65+t):a==="alphal"?String.fromCharCode(97+t):a==="roman"?Te[t]||String(t+1):a==="bn"&&A[t]||String(t+1)}function Ce(t,a){const r=t.match(/^(.*?)\s*(\((?:\d+\+)+\d+\))\s*$/s);return r?`${L(r[1])}<span style="float:right;font-weight:700;font-size:${a*.92}pt;margin-left:8px;white-space:nowrap">${M(r[2])}</span>`:L(t)}function fe(t,a,r,i,s){const n=document.createElement("div"),g=l.cfg.lang==="full-bn"||l.cfg.lang==="mixed"&&t.optStyle==="bn"?w(r):String(r),b=a.marks!==""&&a.marks!==void 0?a.marks:"";let v="";if(t.type==="mcq"&&a.opts&&a.opts.length){const c=t.optStyle==="en"?I:A;if(v=`<div class="qp-opts" style="font-size:${i*.95}pt">`+a.opts.map((f,T)=>`<div>(${c[T]}) ${L(f)}</div>`).join("")+"</div>",a.mcqImg&&a.mcqImg.src){const f=a.mcqImg.align==="left"?"flex-start":a.mcqImg.align==="right"?"flex-end":"center";v+=`<div class="qp-img-wrap" style="display:flex;justify-content:${f}"><img src="${a.mcqImg.src}" style="width:${a.mcqImg.width||50}%" alt=""></div>`}}let m="";if(t.type!=="mcq"&&a.extra){const c=a.extra;if(c.img&&c.img.src){const f=c.img.align==="left"?"flex-start":c.img.align==="right"?"flex-end":"center";m+=`<div class="qp-img-wrap" style="display:flex;justify-content:${f}"><img src="${c.img.src}" style="width:${c.img.width||60}%" alt=""></div>`}if(c.tbl&&c.tbl.data){const f=c.tbl;let T="";for(let h=0;h<f.rows;h++){const x=h===0&&f.hasHeader?"th":"td",y=Array.from({length:f.cols},(E,C)=>`<${x}>${L(f.data[h]&&f.data[h][C]||"")}</${x}>`).join("");T+=`<tr>${y}</tr>`}m+=`<table class="qp-tbl" style="font-size:${i*.92}pt">${T}</table>`}if(c.dia&&c.dia.src){const f=c.dia.align==="left"?"flex-start":c.dia.align==="right"?"flex-end":"center";m+=`<div class="qp-img-wrap" style="display:flex;justify-content:${f}"><img src="${c.dia.src}" style="width:${c.dia.width||65}%" alt=""></div>`}if(c.ldia&&(c.ldia.src||c.ldia.labels&&c.ldia.labels.length)){const f=c.ldia,T=f.imgW||45,h=100-T-4,x=(f.labels||[]).map((y,E)=>{const C=me(E,f.style),O=y.trim()?`<span style="border-bottom:1px solid #000;padding:0 4px;min-width:60px;display:inline-block">${L(y)}</span>`:'<span style="border-bottom:1px solid #000;display:inline-block;width:75%">&nbsp;</span>';return`<div style="display:flex;align-items:baseline;gap:5px;margin-bottom:${Math.max(3,i*.35)}px;font-size:${i*.92}pt">
              <span style="font-weight:700;min-width:20px;flex-shrink:0">${C})</span>
              <span style="border-bottom:1px dashed #666;width:18px;flex-shrink:0;display:inline-block;margin-bottom:2px"></span>
              ${O}
            </div>`}).join("");m+=`<div style="display:flex;align-items:center;gap:4%;margin:5px 0">
            ${f.src?`<div style="width:${T}%;flex-shrink:0"><img src="${f.src}" style="width:100%;height:auto;display:block" alt=""></div>`:""}
            <div style="width:${f.src?h:100}%">${x}</div>
          </div>`}}let u="";if(l.cfg.ansSpace&&t.type!=="mcq"){const c=t.type==="short"?15:t.type==="descriptive"?35:55,f=a.ansLines!==void 0&&a.ansLines!==""?+a.ansLines:t.ansLines!==void 0?+t.ansLines:c;f>0&&(u=`<div class="qp-ans-space" style="height:${f}mm"></div>`)}const d=document.createElement("div");return d.className="qp-q",d.style.fontSize=`${i}pt`,d.style.lineHeight=String(s),d.innerHTML=`<div class="qp-q-row">
        <span class="qp-qn">${g}.</span>
        <span class="qp-qt">${Ce(a.text,i)}</span>
        ${b!==""?`<span class="qp-qm">[${M(String(b))}]</span>`:""}
      </div>${v}${m}${u}`,n.appendChild(d),n}function Me(){ee();const{exam:t,cfg:a}=l,r=a.fs,i=a.lang!=="full-en",s=i?"বিষয়":"Subject",n=i?"শ্রেণী":"Class",p=i?"সময়":"Time",g=i?"পূর্ণমান":"Full Marks";let b="";t.headerLayout==="standard"?b=`
          <div class="qp-school" style="font-size:${r*1.32}pt">${L(t.title)}</div>
          <div class="qp-sub" style="font-size:${r*1.08}pt">${L(t.subject)}</div>
          ${t.class?`<div class="qp-Meta-center" style="font-size:${r*.95}pt">${n}: ${M(t.class)}</div>`:""}
          <div class="qp-meta" style="font-size:${r*.93}pt">
            <span>${p}: ${M(t.time)}</span><span>${g}: ${M(t.marks)}</span>
          </div>`:t.headerLayout==="split"?b=`
          <div class="qp-school" style="font-size:${r*1.28}pt">${L(t.title)}</div>
          <div class="qp-meta" style="font-size:${r*.95}pt">
            <span>${s}: ${L(t.subject)}</span><span>${n}: ${M(t.class)}</span>
          </div>
          <div class="qp-meta" style="font-size:${r*.93}pt">
            <span>${p}: ${M(t.time)}</span><span>${g}: ${M(t.marks)}</span>
          </div>`:t.headerLayout==="compact"?b=`
          <div class="qp-school" style="font-size:${r*1.18}pt">${L(t.title)} — ${L(t.subject)}</div>
          <div class="qp-meta" style="font-size:${r*.9}pt">
            <span>${n}: ${M(t.class)}</span><span>${p}: ${M(t.time)}</span><span>${g}: ${M(t.marks)}</span>
          </div>`:b=`
          <div class="qp-school" style="font-size:${r*1.22}pt">${L(t.title)}</div>
          <div class="qp-Meta-center" style="font-size:${r*.93}pt">${L(t.subject)} | ${M(t.class)} | ${p}: ${M(t.time)} | ${g}: ${M(t.marks)}</div>`,t.instructions&&(b+=`<div class="qp-instr" style="font-size:${r*.87}pt">${L(t.instructions)}</div>`);const v=document.createElement("div");return v.innerHTML=`<div class="qp-hdr b-${t.headerBox}">${b}</div><div class="qp-div d-${t.divider}"></div>`,v}function Le(t){const{cfg:a}=l,r=a.fs,i=t.marksPerQ*t.answerAny,s=a.lang==="full-bn"||a.lang==="mixed"&&t.optStyle==="bn",n=s?w(t.marksPerQ):t.marksPerQ,p=s?w(t.answerAny):t.answerAny,g=s?w(i):i,b=document.createElement("div");return b.innerHTML=`<div class="qp-sec-hdr" style="font-size:${r*1.03}pt">${M(t.name)}</div>
        <div class="qp-sec-info" style="font-size:${r*.9}pt">
          ${t.info?L(t.info)+" ":""}[ ${n} × ${p} = ${g} ]
        </div>`,b}function xe(){const{cfg:t}=l,a=t.fs,r=t.lh,i=[];return i.push({el:Me()}),l.sections.forEach(s=>{if(!s.questions.length)return;i.push({el:Le(s),isSecHdr:!0});let n=0,p=0;for(;p<s.questions.length;){const g=s.questions[p];g.orWithPrev||n++;const b=document.createElement("div");for(b.appendChild(fe(s,g,n,a,r));p+1<s.questions.length&&s.questions[p+1].orWithPrev;){p++;const v=s.questions[p],m=t.lang==="full-en"?"OR":t.lang==="full-bn"?"অথবা":s.optStyle==="en"?"OR":"অথবা",u=document.createElement("div");u.className="qp-or",u.style.fontSize=`${a*.9}pt`,u.textContent=m,b.appendChild(u),b.appendChild(fe(s,v,n,a,r))}i.push({el:b}),p++}}),i}function Pe(t,a){const r=3.7795275591,i=(t==="landscape"?297:210)*r,s=(t==="landscape"?210:297)*r;let n=1,p=1;return a===2?t==="landscape"?(n=2,p=1):(n=1,p=2):a===4&&(n=2,p=2),{cellW:i/n,cellH:s/p}}function ie(t,a){const i=l.cfg.pad*10*3.7795275591,{cellW:s,cellH:n}=Pe(t,a),p=s-i*2,g=n-i*2,b=16,v=document.createElement("div");v.className="qp-paper",v.style.cssText=`position:fixed;left:-9999px;top:0;width:${p}px;font-size:${l.cfg.fs}pt;line-height:${l.cfg.lh};visibility:hidden;`,z.appendChild(v);const m=xe(),u=[[]];let d=0;for(let c=0;c<m.length;c++){const{el:f,isSecHdr:T}=m[c];v.appendChild(f);const h=f.offsetHeight+3;let x=0;T&&c+1<m.length&&(v.appendChild(m[c+1].el),x=m[c+1].el.offsetHeight+3,v.removeChild(m[c+1].el));const y=g-b;d>0&&d+h+x>y&&(u.push([]),d=0),u[u.length-1].push(f),d+=h}return z.removeChild(v),u}function B(t,a,r,i,s){const n=document.createElement("div");n.className="qp-cell",n.style.cssText=`padding:${a};position:relative;box-sizing:border-box;display:flex;flex-direction:column;`,r&&n.insertAdjacentHTML("beforeend",r);const p=document.createElement("div");if(p.className="qp-paper",p.style.cssText=`font-size:${l.cfg.fs}pt;line-height:${l.cfg.lh};flex:1;`,t.forEach(g=>p.appendChild(g)),n.appendChild(p),s>1){const g=i===s,b=l.cfg.lang==="full-bn",v=b?`পৃষ্ঠা ${w(i)} / ${w(s)}`:`Page ${i} of ${s}`,m=g?b?"— সমাপ্ত —":"— END —":b?"[ পরের পৃষ্ঠা দেখুন / P.T.O. ]":"[ P.T.O. ]",u=document.createElement("div");u.style.cssText=`display:flex;justify-content:space-between;align-items:center;font-family:'Noto Serif Bengali','Times New Roman',serif;font-size:${l.cfg.fs*.78}pt;color:#444;border-top:0.5px solid #bbb;padding-top:2px;margin-top:3px;flex-shrink:0;`,u.innerHTML=`<span>${v}</span><span style="font-style:italic;font-weight:600">${m}</span>`,n.appendChild(u)}return n}function k(){const t=o("preview-vp");if(!t)return;const{cfg:a}=l,r=a.layout;let i=a.orient;i==="auto"&&(i=r===2?"landscape":"portrait");let s="dashed",n="1px";a.cut==="dotted"?s="dotted":a.cut==="solid"?s="solid":a.cut==="scissors"&&(s="dashed",n="1.5px");const p=`${a.pad}cm`,g=i==="landscape"?210:297,b=a.zoom,v=-(g*3.7795275591*(1-b)),m=a.wmSrc==="default"&&a.wmUnlocked?"/joy/watermark.svg":a.wmSrc==="custom"&&a.wmCustomData?a.wmCustomData:"",u=m?`<div class="cell-wm" style="--wm-size:${a.wmSize}%;--wm-opacity:${a.wmOpacity}"><img src="${m}" alt=""></div>`:"";if(t.innerHTML="",r==="flow"){const x=xe(),y=document.createElement("div");y.className=`a4-sheet ${i} flow-mode`,y.style.transform=`scale(${b})`;const E=B(x.map(C=>C.el),p,u,1,1);y.appendChild(E),t.appendChild(y),o("pbar-info")&&(o("pbar-info").textContent=`Flow · ${i}`);return}const d=ie(i,r),c=d.length,f=x=>{const y=document.createElement("div");y.className=`a4-sheet ${i}`,y.style.cssText=`--cut-s:${s};--cut-w:${n};transform:scale(${b});margin-bottom:${v}px;`,a.cut==="scissors"&&r>1&&(r===2&&i==="portrait"?y.insertAdjacentHTML("beforeend",'<span class="cut-mark" style="top:calc(50% - 7px);left:3px">✂</span>'):r===2&&i==="landscape"?y.insertAdjacentHTML("beforeend",'<span class="cut-mark" style="left:calc(50% - 7px);top:3px">✂</span>'):r===4&&y.insertAdjacentHTML("beforeend",'<span class="cut-mark" style="top:calc(50% - 7px);left:3px">✂</span><span class="cut-mark" style="left:calc(50% - 7px);top:3px">✂</span>'));const E=document.createElement("div");return E.className=`sheet-grid g${r} ${i}`,x.forEach(C=>E.appendChild(C)),y.appendChild(E),y};let T=0;if(r===1)d.forEach((x,y)=>{const E=B(x,p,u,y+1,c);t.appendChild(f([E])),T++});else if(r===2){let x=d.slice();if(c===1){const y=B(x[0],p,u,1,1),E=B(x[0].map(C=>C.cloneNode(!0)),p,u,1,1);t.appendChild(f([y,E])),T=1}else{for(;x.length%4!==0;)x.push([]);const y=x.length,E=d.length,C=O=>{const V=x[O];return V&&V.length?B(V,p,u,O+1,E):B([],p,u,0,1)};for(let O=0;O<y/4;O++){const V=y-1-2*O,re=2*O,Re=2*O+1,Qe=y-2-2*O;t.appendChild(f([C(V),C(re)])),t.appendChild(f([C(Re),C(Qe)])),T+=2}}}else if(r===4)if(c===1){const x=Array.from({length:4},()=>B(d[0].map(y=>y.cloneNode(!0)),p,u,1,1));t.appendChild(f(x)),T=1}else{const x=d.slice();for(;x.length%4!==0;)x.push([]);for(let y=0;y<x.length;y+=4){const E=[0,1,2,3].map(C=>{const O=x[y+C];return O&&O.length?B(O,p,u,y+C+1,c):B([],p,u,0,1)});t.appendChild(f(E)),T++}}const h=c===1&&r>1?` (${r} copies)`:` (${c}p → ${T} sheet${T>1?"s":""})`;o("pbar-info")&&(o("pbar-info").textContent=`${r===1?"Mono":r===2?"Double":"Quad"} · ${i}${h}`)}function ze(){const t=l.cfg.layout==="flow"?1:l.cfg.layout;let a=l.cfg.orient;a==="auto"&&(a=t===2?"landscape":"portrait");let r=7,i=1.05,s=.4;e:for(let p=12;p>=7;p-=.5)for(let g=1.4;g>=1.05;g=Math.round((g-.05)*100)/100)for(let b=1;b>=.4;b=Math.round((b-.1)*10)/10)if(l.cfg.fs=p,l.cfg.lh=g,l.cfg.pad=b,ie(a,t).length===1){r=p,i=g,s=b;break e}l.cfg.fs=r,l.cfg.lh=i,l.cfg.pad=s,o("r-fs")&&(o("r-fs").value=r),o("v-fs")&&(o("v-fs").textContent=r+"pt"),o("r-lh")&&(o("r-lh").value=i),o("v-lh")&&(o("v-lh").textContent=i),o("r-pad")&&(o("r-pad").value=s),o("v-pad")&&(o("v-pad").textContent=s+"cm"),k();const n=ie(a,t);P(n.length===1?`Auto-fit: 1 page (${r}pt)`:`Fit into ${n.length} pages at min size (7pt)`,n.length===1?"":"warn")}async function Oe(){window.JSZip||(P("Loading JSZip library...","warn"),await j("qp-jszip-js","/joy/libs/jszip.min.js"));const a=window.JSZip;if(!a){P("JSZip not loaded.","err");return}ee();const{exam:r,cfg:i}=l,s=d=>String(d||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\[(CHEM|EQ|SYM|SUB|SUP):([^\]]*)\]/g,"$2");let n="";n+=`<text:p text:style-name="Title">${s(r.title)}</text:p>`,n+=`<text:p text:style-name="Sub">${s(r.subject)} — ${s(r.class)}</text:p>`,n+=`<text:p text:style-name="Meta">সময়: ${s(r.time)}     পূর্ণমান: ${s(r.marks)}</text:p>`,r.instructions&&(n+=`<text:p text:style-name="Instr">${s(r.instructions)}</text:p>`),n+='<text:p text:style-name="HR">────────────────────────────────────────────────</text:p>',l.sections.forEach(d=>{if(!d.questions.length)return;const c=d.marksPerQ*d.answerAny,f=i.lang==="full-bn"||i.lang==="mixed"&&d.optStyle==="bn";n+=`<text:p text:style-name="SecH">${s(d.name)}</text:p>`,n+=`<text:p text:style-name="SecI">${s(d.info)} [${f?w(d.marksPerQ):d.marksPerQ} × ${f?w(d.answerAny):d.answerAny} = ${f?w(c):c}]</text:p>`;let T=0;d.questions.forEach(h=>{h.orWithPrev?n+='<text:p text:style-name="Or">— অথবা / OR —</text:p>':T++;const x=f?w(T):T,y=h.marks||d.marksPerQ;if(n+=`<text:p text:style-name="Q">${x}. ${s(h.text)}   [${s(String(y))}]</text:p>`,d.type==="mcq"&&h.opts.length){const E=d.optStyle==="en"?I:A;n+=`<text:p text:style-name="Opts">${h.opts.map((C,O)=>`(${E[O]}) ${s(C)}`).join("     ")}</text:p>`}})});const p=`<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:style style:name="Title" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${i.fs*1.3}pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="Sub"   style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="1.5mm"/><style:text-properties fo:font-size="${i.fs*1.05}pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="Meta"  style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="1.5mm"/><style:text-properties fo:font-size="${i.fs}pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="Instr" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${i.fs*.9}pt" fo:font-style="italic"/></style:style>
    <style:style style:name="HR"    style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="3mm"/><style:text-properties fo:font-size="8pt"/></style:style>
    <style:style style:name="SecH"  style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="4mm" fo:margin-bottom="1mm" fo:background-color="#eeeeee"/><style:text-properties fo:font-size="${i.fs}pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="SecI"  style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${i.fs*.9}pt" fo:font-style="italic"/></style:style>
    <style:style style:name="Q"     style:family="paragraph"><style:paragraph-properties fo:margin-bottom="1.5mm"/><style:text-properties fo:font-size="${i.fs}pt"/></style:style>
    <style:style style:name="Opts"  style:family="paragraph"><style:paragraph-properties fo:margin-left="6mm" fo:margin-bottom="2mm"/><style:text-properties fo:font-size="${i.fs*.93}pt"/></style:style>
    <style:style style:name="Or"    style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="1mm" fo:margin-bottom="1mm"/><style:text-properties fo:font-size="${i.fs*.9}pt" fo:font-weight="bold" fo:font-style="italic"/></style:style>
  </office:automatic-styles>
  <office:body><office:text>${n}</office:text></office:body>
</office:document-content>`,g=`<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:page-layout style:name="pm1">
      <style:page-layout-properties fo:page-width="210mm" fo:page-height="297mm"
        fo:margin-top="${i.pad}cm" fo:margin-bottom="${i.pad}cm"
        fo:margin-left="${i.pad}cm" fo:margin-right="${i.pad}cm"/>
    </style:page-layout>
  </office:automatic-styles>
  <office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`,b=`<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`,v=new a;v.file("mimetype","application/vnd.oasis.opendocument.text",{compression:"STORE"}),v.file("content.xml",p),v.file("styles.xml",g),v.folder("META-INF").file("manifest.xml",b);const m=await v.generateAsync({type:"blob",mimeType:"application/vnd.oasis.opendocument.text"}),u=document.createElement("a");u.href=URL.createObjectURL(m),u.download=`${r.subject||"question_paper"}.odt`,u.click(),URL.revokeObjectURL(u.href),P("ODT downloaded!")}const F=o("secs"),ge=t=>{var p,g,b,v,m,u;const r=t.target.closest("[data-act]");if(!r)return;const i=r.dataset.act,s=+(r.dataset.si||0),n=+(r.dataset.qi||0);if(i==="toggle-card"){if(t.target.closest('[data-act="del-sec"]'))return;(p=r.closest(".acard"))==null||p.classList.toggle("open")}else if(i==="add-sec"){const d=l.sections.length;l.sections.push({id:Date.now(),name:l.cfg.lang==="full-en"?K[d]||`Section ${d+1}`:J[d]||`বিভাগ ${d+1}`,type:"short",marksPerQ:2,answerAny:5,optStyle:l.cfg.lang==="full-en"?"en":"bn",info:l.cfg.lang==="full-en"?"Answer the following questions:":"নিম্নলিখিত প্রশ্নগুলির উত্তর দাও:",questions:[]}),q(),k()}else if(i==="del-sec"){if(t.stopPropagation(),l.sections.length<=1){P("At least 1 section required!","err");return}l.sections.splice(s,1),q(),k()}else if(i==="add-q"){const d=l.sections[s];d.questions.push({id:Date.now()+Math.random(),text:"",opts:d.type==="mcq"?["","","",""]:[],orWithPrev:!1,marks:""}),q(),k(),setTimeout(()=>{var f;const c=(f=o("secs"))==null?void 0:f.querySelectorAll(`.qcard[data-si="${s}"] textarea`);c&&c.length&&c[c.length-1].focus()},40)}else if(i==="del-q"){const d=l.sections[s];(g=d.questions[n+1])!=null&&g.orWithPrev&&(d.questions[n+1].orWithPrev=!1),d.questions.splice(n,1),q(),k()}else if(i==="toggle-or"){const d=l.sections[s].questions[n];d.orWithPrev=!d.orWithPrev,q(),k(),P(d.orWithPrev?"Linked as OR (অথবা)!":"OR unlinked")}else if(i==="unlink-or")l.sections[s].questions[n].orWithPrev=!1,q(),k();else if(i==="or-mode")R&&R.secIdx===s?(R=null,Q=null):(R={secIdx:s},Q=null,P("Click 1st question, then 2nd question to link as OR","warn")),q();else if(i==="or-pick"&&R&&R.secIdx===s){if(t.target.tagName==="INPUT"||t.target.tagName==="TEXTAREA"||t.target.tagName==="BUTTON")return;if(Q===null)Q=n,P(`Q${n+1} selected — now click the next question to link as OR`),q();else{const d=n;d===Q+1?(l.sections[s].questions[d].orWithPrev=!0,P("Questions linked with অথবা / OR!")):Q===d+1?(l.sections[s].questions[Q].orWithPrev=!0,P("Questions linked with অথবা / OR!")):P("Select two consecutive questions!","err"),R=null,Q=null,q(),k()}}else if(i==="mcqimg-add")G(d=>{l.sections[s].questions[n].mcqImg={src:d,width:50,align:"center"},q(),k()});else if(i==="mcqimg-del")delete l.sections[s].questions[n].mcqImg,q(),k();else if(i==="x-img"){const d=l.sections[s].questions[n];d.extra=d.extra||{},d.extra.img?q():G(c=>{d.extra.img={src:c,width:60},q(),k()})}else if(i==="x-img-del")(b=l.sections[s].questions[n].extra)==null||delete b.img,q(),k();else if(i==="img-pick")G(d=>{var f;const c=l.sections[s].questions[n];c.extra=c.extra||{},c.extra.img={...c.extra.img||{},src:d,width:((f=c.extra.img)==null?void 0:f.width)||60},q(),k()});else if(i==="x-tbl"){const d=l.sections[s].questions[n];d.extra=d.extra||{},d.extra.tbl||(d.extra.tbl={rows:3,cols:3,hasHeader:!0,data:[["","",""],["","",""],["","",""]]}),q(),k()}else if(i==="x-tbl-del")(v=l.sections[s].questions[n].extra)==null||delete v.tbl,q(),k();else if(i==="tbl-r+"){const d=l.sections[s].questions[n].extra.tbl;d.rows++,d.data.push(Array(d.cols).fill("")),q(),k()}else if(i==="tbl-r-"){const d=l.sections[s].questions[n].extra.tbl;d.rows>1&&(d.rows--,d.data.pop(),q(),k())}else if(i==="tbl-c+"){const d=l.sections[s].questions[n].extra.tbl;d.cols++,d.data.forEach(c=>c.push("")),q(),k()}else if(i==="tbl-c-"){const d=l.sections[s].questions[n].extra.tbl;d.cols>1&&(d.cols--,d.data.forEach(c=>c.pop()),q(),k())}else if(i==="x-dia"||i==="dia-open"){const d=l.sections[s].questions[n];d.extra=d.extra||{},d.extra.dia=d.extra.dia||{src:"",width:65},be(s,n)}else if(i==="x-dia-del")(m=l.sections[s].questions[n].extra)==null||delete m.dia,q(),k();else if(i==="x-ldia"){const d=l.sections[s].questions[n];d.extra=d.extra||{},d.extra.ldia||(d.extra.ldia={src:"",imgW:45,style:"num",labels:["","","",""]}),q(),k()}else if(i==="x-ldia-del")(u=l.sections[s].questions[n].extra)==null||delete u.ldia,q(),k();else if(i==="ldia-img")G(d=>{const c=l.sections[s].questions[n].extra.ldia;c.src=d,q(),k()});else if(i==="ldia-draw"){const d=l.sections[s].questions[n];d.extra=d.extra||{},d.extra.ldia=d.extra.ldia||{src:"",imgW:45,style:"num",labels:["","","",""]},be(s,n,"ldia")}else if(i==="ldia-lbl-add")l.sections[s].questions[n].extra.ldia.labels.push(""),q(),k();else if(i==="ldia-lbl-del"){const d=+(r.dataset.li||0);l.sections[s].questions[n].extra.ldia.labels.splice(d,1),q(),k()}},ue=t=>{var p;const a=t.target,r=a.dataset.act,i=+(a.dataset.si||0),s=+(a.dataset.qi||0);if(!r)return;const n=l.sections[i];if(r==="sec-name"){n.name=a.value;const g=(p=a.closest(".acard"))==null?void 0:p.querySelector(".sec-badge");g&&(g.textContent=a.value)}else if(r==="sec-type")n.type=a.value,n.type==="mcq"&&n.questions.forEach(g=>{for(;g.opts.length<4;)g.opts.push("")}),q();else if(r==="sec-opt")n.optStyle=a.value,q();else if(r==="sec-mpq")n.marksPerQ=parseFloat(a.value)||1,q();else if(r==="sec-any")n.answerAny=parseInt(a.value)||1,q();else if(r==="sec-info")n.info=a.value;else if(r==="sec-lines")n.ansLines=parseInt(a.value)||0;else if(r==="q-text")n.questions[s].text=a.value;else if(r==="q-marks")n.questions[s].marks=a.value;else if(r==="q-lines")n.questions[s].ansLines=a.value===""?"":parseInt(a.value)||0;else if(r==="q-opt")n.questions[s].opts[+(a.dataset.oi||0)]=a.value;else if(r==="mcqimg-w")n.questions[s].mcqImg.width=+a.value;else if(r==="mcqimg-align")n.questions[s].mcqImg.align=a.value;else if(r==="img-w")n.questions[s].extra.img.width=+a.value;else if(r==="img-align")n.questions[s].extra.img.align=a.value;else if(r==="dia-w")n.questions[s].extra.dia.width=+a.value;else if(r==="dia-align")n.questions[s].extra.dia.align=a.value;else if(r==="tbl-cell"){const g=+(a.dataset.r||0),b=+(a.dataset.c||0);n.questions[s].extra.tbl.data[g][b]=a.value}else r==="tbl-hdr"?(n.questions[s].extra.tbl.hasHeader=a.checked,q()):r==="ldia-lbl"?n.questions[s].extra.ldia.labels[+(a.dataset.li||0)]=a.value:r==="ldia-style"?(n.questions[s].extra.ldia.style=a.value,q()):r==="ldia-w"&&(n.questions[s].extra.ldia.imgW=+a.value);k()};F==null||F.addEventListener("click",ge),F==null||F.addEventListener("input",ue);function G(t){const a=document.createElement("input");a.type="file",a.accept="image/*",a.onchange=()=>{var s;const r=(s=a.files)==null?void 0:s[0];if(!r)return;const i=new FileReader;i.onload=n=>{var p;return t((p=n.target)==null?void 0:p.result)},i.readAsDataURL(r)},a.click()}let oe=null,D="pen",se=!1,W=0,Y=0,ne=null;const N=o("dia-canvas"),$=N==null?void 0:N.getContext("2d");function be(t,a,r="dia"){var s,n,p;if(oe={si:t,qi:a,key:r},!$||!N)return;$.fillStyle="#fff",$.fillRect(0,0,N.width,N.height);const i=(n=(s=l.sections[t].questions[a].extra)==null?void 0:s[r])==null?void 0:n.src;if(i){const g=new Image;g.onload=()=>$.drawImage(g,0,0),g.src=i}(p=o("dia-modal"))==null||p.classList.add("open")}const le=t=>{const a=N.getBoundingClientRect(),r=N.width/a.width,i=N.height/a.height;return[(t.clientX-a.left)*r,(t.clientY-a.top)*i]};function Ae(t,a,r,i,s){const p=Math.atan2(s-r,i-a);t.beginPath(),t.moveTo(a,r),t.lineTo(i,s),t.lineTo(i-10*Math.cos(p-Math.PI/6),s-10*Math.sin(p-Math.PI/6)),t.moveTo(i,s),t.lineTo(i-10*Math.cos(p+Math.PI/6),s-10*Math.sin(p+Math.PI/6)),t.stroke()}N&&$&&(N.onpointerdown=t=>{var a,r,i,s,n;if(D==="text"){const[p,g]=le(t),b=prompt("Enter label text:");b&&($.fillStyle=((a=o("dia-color"))==null?void 0:a.value)||"#000",$.font=`${12+ +((((r=o("dia-size"))==null?void 0:r.value)||2)*2)}px sans-serif`,$.fillText(b,p,g));return}se=!0,[W,Y]=le(t),ne=$.getImageData(0,0,N.width,N.height),$.strokeStyle=D==="eraser"?"#fff":((i=o("dia-color"))==null?void 0:i.value)||"#000",$.lineWidth=D==="eraser"?+(((s=o("dia-size"))==null?void 0:s.value)||2)*6:+(((n=o("dia-size"))==null?void 0:n.value)||2),$.lineCap="round",$.lineJoin="round",(D==="pen"||D==="eraser")&&($.beginPath(),$.moveTo(W,Y))},N.onpointermove=t=>{if(!se)return;const[a,r]=le(t);if(D==="pen"||D==="eraser")$.lineTo(a,r),$.stroke();else if(ne)if($.putImageData(ne,0,0),$.beginPath(),D==="line")$.moveTo(W,Y),$.lineTo(a,r),$.stroke();else if(D==="rect")$.strokeRect(W,Y,a-W,r-Y);else if(D==="circle"){const i=Math.abs(a-W)/2,s=Math.abs(r-Y)/2;$.ellipse((W+a)/2,(Y+r)/2,i,s,0,0,Math.PI*2),$.stroke()}else D==="arrow"&&Ae($,W,Y,a,r)},N.onpointerup=()=>{se=!1}),(ke=o("dia-toolbar"))==null||ke.addEventListener("click",t=>{const a=t.target.closest("[data-dtool]");a&&(D=a.dataset.dtool||"pen",z.querySelectorAll("[data-dtool]").forEach(r=>r.classList.toggle("active",r===a)))}),o("dia-clear")&&(o("dia-clear").onclick=()=>{!$||!N||($.fillStyle="#fff",$.fillRect(0,0,N.width,N.height))}),o("dia-img-load")&&(o("dia-img-load").onclick=()=>G(t=>{const a=new Image;a.onload=()=>{if(!$||!N)return;$.fillStyle="#fff",$.fillRect(0,0,N.width,N.height);const r=Math.min(N.width/a.width,N.height/a.height);$.drawImage(a,(N.width-a.width*r)/2,(N.height-a.height*r)/2,a.width*r,a.height*r)},a.src=t})),o("dia-cancel")&&(o("dia-cancel").onclick=()=>{var t;return(t=o("dia-modal"))==null?void 0:t.classList.remove("open")}),o("dia-save")&&(o("dia-save").onclick=()=>{var s;if(!oe||!N)return;const{si:t,qi:a,key:r}=oe,i=l.sections[t].questions[a];i.extra=i.extra||{},i.extra[r]={...i.extra[r]||{},src:N.toDataURL("image/png")},r==="dia"&&!i.extra.dia.width&&(i.extra.dia.width=65),(s=o("dia-modal"))==null||s.classList.remove("open"),q(),k(),P("Diagram saved!")}),["ei-title","ei-sub","ei-cls","ei-time","ei-marks","ei-instr","ei-hlayout","ei-hbox","ei-div"].forEach(t=>{var a;(a=o(t))==null||a.addEventListener("input",()=>{ee(),k()})}),o("ei-head")&&(o("ei-head").onclick=()=>{var t;return(t=o("ei-card"))==null?void 0:t.classList.toggle("open")}),o("btn-settings")&&(o("btn-settings").onclick=()=>{var t,a;(t=o("settings-panel"))==null||t.classList.toggle("open"),(a=o("btn-settings"))==null||a.classList.toggle("active")}),o("r-fs")&&(o("r-fs").oninput=t=>{l.cfg.fs=+t.target.value,o("v-fs")&&(o("v-fs").textContent=l.cfg.fs+"pt"),k()}),o("r-lh")&&(o("r-lh").oninput=t=>{l.cfg.lh=+t.target.value,o("v-lh")&&(o("v-lh").textContent=l.cfg.lh),k()}),o("r-pad")&&(o("r-pad").oninput=t=>{l.cfg.pad=+t.target.value,o("v-pad")&&(o("v-pad").textContent=l.cfg.pad+"cm"),k()});const de=(t,a,r)=>{var i;(i=o(t))==null||i.addEventListener("click",s=>{const n=s.target.closest(".seg-btn");n&&(o(t).querySelectorAll(".seg-btn").forEach(p=>p.classList.remove("active")),n.classList.add("active"),l.cfg[a]=n.dataset.v,r&&r(),k())})};de("seg-orient","orient"),de("seg-cut","cut"),de("seg-lang","lang",()=>q()),z.querySelectorAll(".lchip").forEach(t=>{t.onclick=()=>{z.querySelectorAll(".lchip").forEach(r=>r.classList.remove("active")),t.classList.add("active");const a=t.dataset.l;l.cfg.layout=a==="flow"?"flow":+(a||1),k()}}),o("z-in")&&(o("z-in").onclick=()=>{l.cfg.zoom=Math.min(1.3,+(l.cfg.zoom+.08).toFixed(2)),o("zlabel")&&(o("zlabel").textContent=Math.round(l.cfg.zoom*100)+"%"),k()}),o("z-out")&&(o("z-out").onclick=()=>{l.cfg.zoom=Math.max(.35,+(l.cfg.zoom-.08).toFixed(2)),o("zlabel")&&(o("zlabel").textContent=Math.round(l.cfg.zoom*100)+"%"),k()}),o("r-wmo")&&(o("r-wmo").oninput=t=>{l.cfg.wmOpacity=+t.target.value/100,o("v-wmo")&&(o("v-wmo").textContent=t.target.value+"%"),k()}),o("r-wms")&&(o("r-wms").oninput=t=>{l.cfg.wmSize=+t.target.value,o("v-wms")&&(o("v-wms").textContent=t.target.value+"%"),k()});const He="c91d1b1bd6dc0111f0619fa2353cdb5c19991f5253655fb1a9a9aa8d08414fb3";async function Ie(t){const a=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return Array.from(new Uint8Array(a)).map(r=>r.toString(16).padStart(2,"0")).join("")}function ae(t){var a;(a=o("seg-wm"))==null||a.querySelectorAll(".seg-btn").forEach(r=>r.classList.toggle("active",r.dataset.v===t))}(qe=o("seg-wm"))==null||qe.addEventListener("click",t=>{var i;const a=t.target.closest(".seg-btn");if(!a)return;const r=a.dataset.v||"none";if(r==="custom"){o("wm-code-wrap")&&(o("wm-code-wrap").style.display="none"),(i=o("wm-file"))==null||i.click();return}if(r==="default"){ae("default"),l.cfg.wmUnlocked?(l.cfg.wmSrc="default",o("wm-code-wrap")&&(o("wm-code-wrap").style.display="none"),k()):(o("wm-code-wrap")&&(o("wm-code-wrap").style.display="flex"),setTimeout(()=>{var s;return(s=o("wm-code-inp"))==null?void 0:s.focus()},50));return}o("wm-code-wrap")&&(o("wm-code-wrap").style.display="none"),ae("none"),l.cfg.wmSrc="none",k()});async function he(){var r;const t=(((r=o("wm-code-inp"))==null?void 0:r.value)||"").trim();await Ie(t)===He?(l.cfg.wmUnlocked=!0,l.cfg.wmSrc="default",o("wm-code-wrap")&&(o("wm-code-wrap").style.display="none"),o("wm-code-inp")&&(o("wm-code-inp").value=""),ae("default"),k(),P("Watermark enabled!")):(P("Wrong code!","err"),o("wm-code-inp")&&(o("wm-code-inp").value="",o("wm-code-inp").focus()))}o("wm-code-ok")&&(o("wm-code-ok").onclick=he),o("wm-code-inp")&&(o("wm-code-inp").onkeydown=t=>{t.key==="Enter"&&he()}),o("wm-file")&&(o("wm-file").onchange=t=>{var i;const a=(i=t.target.files)==null?void 0:i[0];if(!a)return;const r=new FileReader;r.onload=s=>{var n;l.cfg.wmCustomData=(n=s.target)==null?void 0:n.result,l.cfg.wmSrc="custom",ae("custom"),k(),P("Custom watermark loaded!")},r.readAsDataURL(a),t.target.value=""}),o("btn-import-toggle")&&(o("btn-import-toggle").onclick=()=>{var t,a;(t=o("import-drawer"))==null||t.classList.toggle("open"),(a=o("btn-import-toggle"))==null||a.classList.toggle("active")}),o("btn-demo")&&(o("btn-demo").onclick=()=>te($e)),z.querySelectorAll(".dtab").forEach(t=>{t.onclick=()=>{var a;z.querySelectorAll(".dtab").forEach(r=>r.classList.remove("active")),z.querySelectorAll(".dtab-pane").forEach(r=>r.classList.remove("active")),t.classList.add("active"),(a=o(`dpane-${t.dataset.tab}`))==null||a.classList.add("active")}}),o("btn-parse-paste")&&(o("btn-parse-paste").onclick=()=>{var t;return te(((t=o("qpf-paste"))==null?void 0:t.value)||"")}),o("btn-clear-paste")&&(o("btn-clear-paste").onclick=()=>{o("qpf-paste")&&(o("qpf-paste").value="")});const _=o("drop-zone"),ce=o("qpf-file");_&&ce&&(_.onclick=()=>ce.click(),_.ondragover=t=>{t.preventDefault(),_.classList.add("drag")},_.ondragleave=()=>_.classList.remove("drag"),_.ondrop=t=>{var a;t.preventDefault(),_.classList.remove("drag"),(a=t.dataTransfer)!=null&&a.files[0]&&ve(t.dataTransfer.files[0])},ce.onchange=t=>{t.target.files[0]&&ve(t.target.files[0])});function ve(t){if(!t)return;const a=new FileReader;a.onload=r=>{var i;return te((i=r.target)==null?void 0:i.result)},a.readAsText(t,"UTF-8")}o("btn-prompt-img")&&(o("btn-prompt-img").onclick=()=>navigator.clipboard.writeText(je).then(()=>P("Image OCR Prompt copied!"))),o("btn-prompt-txt")&&(o("btn-prompt-txt").onclick=()=>navigator.clipboard.writeText(Ve).then(()=>P("Text convert Prompt copied!"))),o("btn-copy-prompt")&&(o("btn-copy-prompt").onclick=()=>navigator.clipboard.writeText(je).then(()=>P("AI Prompt copied!"))),o("btn-autofit")&&(o("btn-autofit").onclick=ze),o("btn-ans-space")&&(o("btn-ans-space").onclick=()=>{var t;l.cfg.ansSpace=!l.cfg.ansSpace,(t=o("btn-ans-space"))==null||t.classList.toggle("active",l.cfg.ansSpace),o("btn-ans-space")&&(o("btn-ans-space").textContent=`📝 Ans Space: ${l.cfg.ansSpace?"ON":"OFF"}`),q(),k()});const ye=()=>window.print();o("btn-print")&&(o("btn-print").onclick=ye),o("btn-print2")&&(o("btn-print2").onclick=ye),o("btn-odt")&&(o("btn-odt").onclick=Oe),o("btn-qpf-dl")&&(o("btn-qpf-dl").onclick=()=>{const t=new Blob([Ne()],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(t),a.download=`${l.exam.subject||"paper"}.qpf`,a.click(),URL.revokeObjectURL(a.href),P(".qpf saved!")}),o("btn-guide")&&(o("btn-guide").onclick=()=>{var t,a,r,i;(t=o("info"))==null||t.classList.remove("open"),(a=o("btn-info"))==null||a.classList.remove("active"),(r=o("guide"))==null||r.classList.toggle("open"),(i=o("btn-guide"))==null||i.classList.toggle("active")}),o("btn-guide-close")&&(o("btn-guide-close").onclick=()=>{var t,a;(t=o("guide"))==null||t.classList.remove("open"),(a=o("btn-guide"))==null||a.classList.remove("active")}),o("btn-info")&&(o("btn-info").onclick=()=>{var t,a,r,i;(t=o("guide"))==null||t.classList.remove("open"),(a=o("btn-guide"))==null||a.classList.remove("active"),(r=o("info"))==null||r.classList.toggle("open"),(i=o("btn-info"))==null||i.classList.toggle("active")}),o("btn-info-close")&&(o("btn-info-close").onclick=()=>{var t,a;(t=o("info"))==null||t.classList.remove("open"),(a=o("btn-info"))==null||a.classList.remove("active")}),o("btn-theme")&&(o("btn-theme").onclick=()=>{const t=z.classList.toggle("light-mode");o("btn-theme")&&(o("btn-theme").textContent=t?"🌙 Dark":"☀️ Light")});const U=o("resize-handle"),pe=o("sidebar");if(U&&pe){let t=0,a=0;U.onpointerdown=r=>{t=r.clientX,a=pe.offsetWidth,U.classList.add("dragging"),U.setPointerCapture(r.pointerId),U.onpointermove=i=>{const s=Math.min(Math.max(a+i.clientX-t,280),window.innerWidth*.7);pe.style.width=s+"px"},U.onpointerup=()=>{U.classList.remove("dragging"),U.onpointermove=null,U.onpointerup=null}}}return Promise.all([j("qp-katex-js","/joy/libs/katex.min.js"),j("qp-jszip-js","/joy/libs/jszip.min.js")]).then(()=>{te($e)}),()=>{F==null||F.removeEventListener("click",ge),F==null||F.removeEventListener("input",ue)}},[]),e.jsxs("div",{ref:S,className:"qp-maker-root",children:[e.jsx("style",{children:Xe}),e.jsxs("div",{id:"topbar",children:[e.jsx("button",{className:"tbtn",onClick:()=>H("/"),title:"Back to Main Homepage",children:"← Home"}),e.jsx("div",{className:"vdiv"}),e.jsxs("div",{className:"brand",children:[e.jsx("div",{className:"brand-dot"}),e.jsxs("span",{children:["প্রশ্নপত্র ",e.jsx("em",{children:"Maker"})]})]}),e.jsx("div",{className:"vdiv"}),e.jsx("div",{id:"paper-badge",children:"বার্ষিক পরীক্ষা - ২০২৫"}),e.jsx("div",{className:"spacer"}),e.jsx("button",{className:"tbtn",id:"btn-info",children:"ℹ Info"}),e.jsx("button",{className:"tbtn",id:"btn-guide",children:"📖 Guide"}),e.jsx("button",{className:"tbtn",id:"btn-theme",title:"Toggle dark / light mode",children:"☀️ Light"}),e.jsx("button",{className:"tbtn",id:"btn-autofit",title:"Auto-shrink font to fit 1 page",children:"⚡ Auto-fit"}),e.jsx("button",{className:"tbtn",id:"btn-ans-space",title:"Toggle blank answer lines after questions",children:"📝 Ans Space: OFF"}),e.jsx("button",{className:"tbtn",id:"btn-settings",children:"⚙ Settings"}),e.jsx("button",{className:"tbtn primary",id:"btn-print",children:"🖨 Print / PDF"})]}),e.jsxs("div",{id:"workspace",children:[e.jsxs("div",{id:"sidebar",children:[e.jsxs("div",{id:"import-strip",children:[e.jsx("span",{className:"strip-label",children:"QPF"}),e.jsx("button",{className:"sbtn accent",id:"btn-import-toggle",children:"📥 Import QPF"}),e.jsx("button",{className:"sbtn green",id:"btn-demo",children:"✨ Demo"}),e.jsx("button",{className:"sbtn",id:"btn-copy-prompt",style:{marginLeft:"auto"},children:"🤖 AI Prompt"})]}),e.jsx("div",{id:"import-drawer",children:e.jsxs("div",{className:"drawer-inner",children:[e.jsxs("div",{className:"drawer-tabs",children:[e.jsx("button",{className:"dtab active","data-tab":"paste",children:"📋 Paste QPF Text"}),e.jsx("button",{className:"dtab","data-tab":"file",children:"📂 Upload .qpf / .txt"}),e.jsx("button",{className:"dtab","data-tab":"prompt",children:"🤖 Get AI Prompt"})]}),e.jsxs("div",{className:"dtab-pane active",id:"dpane-paste",children:[e.jsx("textarea",{id:"qpf-paste",placeholder:`Paste QPF format text here...

Supports [EQ:\\frac{৩}{৪}], $\\frac{লব}{হর}$, [CHEM:H2O], [SYM:ohm]`}),e.jsxs("div",{className:"drawer-actions",children:[e.jsx("button",{className:"sbtn accent",id:"btn-parse-paste",style:{flex:1,justifyContent:"center",padding:"6px"},children:"⚡ Load into Editor"}),e.jsx("button",{className:"sbtn",id:"btn-clear-paste",children:"Clear"})]})]}),e.jsx("div",{className:"dtab-pane",id:"dpane-file",children:e.jsxs("div",{className:"drop-zone",id:"drop-zone",children:["📂 Drop ",e.jsx("strong",{children:".qpf"})," or ",e.jsx("strong",{children:".txt"})," file here, or click to browse",e.jsx("input",{type:"file",id:"qpf-file",accept:".qpf,.txt",style:{display:"none"}})]})}),e.jsxs("div",{className:"dtab-pane",id:"dpane-prompt",children:[e.jsxs("p",{style:{fontSize:"0.74rem",color:"var(--text2)",marginBottom:"7px",lineHeight:1.5},children:["Copy this prompt → paste into ",e.jsx("strong",{children:"ChatGPT / Gemini / Claude"})," along with an image or text of any question paper → paste the AI output back in the ",e.jsx("em",{children:"Paste QPF"})," tab!"]}),e.jsxs("div",{style:{display:"flex",gap:"6px"},children:[e.jsx("button",{className:"sbtn accent",id:"btn-prompt-img",style:{flex:1,justifyContent:"center",padding:"6px"},children:"📋 Copy Prompt (for Image / Photo)"}),e.jsx("button",{className:"sbtn green",id:"btn-prompt-txt",style:{flex:1,justifyContent:"center",padding:"6px"},children:"📋 Copy Prompt (for Raw Text)"})]})]})]})}),e.jsxs("div",{id:"sidebar-scroll",children:[e.jsxs("div",{className:"acard open",id:"ei-card",children:[e.jsxs("div",{className:"acard-head",id:"ei-head",children:[e.jsx("span",{className:"acard-icon",children:"📋"}),e.jsx("span",{className:"acard-title",children:"Exam Info (পরীক্ষার তথ্য)"}),e.jsx("span",{className:"acard-meta",id:"ei-meta",children:"ভৌতবিজ্ঞান"}),e.jsx("span",{className:"acard-chev",children:"▾"})]}),e.jsxs("div",{className:"acard-body",children:[e.jsx("div",{className:"fg",children:e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Exam Title / পরীক্ষার নাম"}),e.jsx("input",{type:"text",id:"ei-title",defaultValue:"বার্ষিক পরীক্ষা - ২০২৫"})]})}),e.jsxs("div",{className:"fg c2",children:[e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Subject / বিষয়"}),e.jsx("input",{type:"text",id:"ei-sub",defaultValue:"ভৌতবিজ্ঞান"})]}),e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Class / শ্রেণী"}),e.jsx("input",{type:"text",id:"ei-cls",defaultValue:"দশম শ্রেণী"})]})]}),e.jsxs("div",{className:"fg c2",children:[e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Time / সময়"}),e.jsx("input",{type:"text",id:"ei-time",defaultValue:"৩ ঘণ্টা ১৫ মিনিট"})]}),e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Full Marks / পূর্ণমান"}),e.jsx("input",{type:"text",id:"ei-marks",defaultValue:"৯০"})]})]}),e.jsx("div",{className:"fg",children:e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Instructions / নির্দেশিকা"}),e.jsx("textarea",{id:"ei-instr",rows:2,defaultValue:"সমস্ত প্রশ্নের উত্তর দাও। ডানদিকের সংখ্যা পূর্ণমান নির্দেশ করে।"})]})}),e.jsxs("div",{className:"fg c3",children:[e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Header Layout"}),e.jsxs("select",{id:"ei-hlayout",defaultValue:"standard",children:[e.jsx("option",{value:"standard",children:"Standard"}),e.jsx("option",{value:"split",children:"Split"}),e.jsx("option",{value:"compact",children:"Compact"}),e.jsx("option",{value:"minimal",children:"Minimal"})]})]}),e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Header Box"}),e.jsxs("select",{id:"ei-hbox",defaultValue:"double",children:[e.jsx("option",{value:"none",children:"None"}),e.jsx("option",{value:"single",children:"Single"}),e.jsx("option",{value:"double",children:"Double"}),e.jsx("option",{value:"rounded",children:"Rounded"}),e.jsx("option",{value:"bottom",children:"Bottom Line"})]})]}),e.jsxs("div",{className:"fl",children:[e.jsx("label",{children:"Divider"}),e.jsxs("select",{id:"ei-div",defaultValue:"double",children:[e.jsx("option",{value:"solid",children:"Solid"}),e.jsx("option",{value:"double",children:"Double"}),e.jsx("option",{value:"dashed",children:"Dashed"}),e.jsx("option",{value:"none",children:"None"})]})]})]})]})]}),e.jsx("div",{id:"secs"})]}),e.jsxs("div",{id:"export-bar",children:[e.jsx("button",{className:"ebtn odt",id:"btn-odt",children:"📄 .odt (LibreOffice)"}),e.jsx("button",{className:"ebtn qpf",id:"btn-qpf-dl",children:"💾 Save .qpf"}),e.jsx("button",{className:"ebtn pdf",id:"btn-print2",children:"🖨 Print / PDF"})]})]}),e.jsx("div",{id:"resize-handle",title:"Drag to resize sidebar"}),e.jsxs("div",{id:"right-col",children:[e.jsx("div",{id:"settings-panel",children:e.jsxs("div",{className:"sp-inner",children:[e.jsxs("div",{className:"sp-group",children:[e.jsxs("div",{className:"sp-label",children:["Font Size ",e.jsx("span",{id:"v-fs",children:"10.5pt"})]}),e.jsx("input",{type:"range",id:"r-fs",min:"7",max:"15",step:"0.5",defaultValue:"10.5"})]}),e.jsxs("div",{className:"sp-group",children:[e.jsxs("div",{className:"sp-label",children:["Line Spacing ",e.jsx("span",{id:"v-lh",children:"1.38"})]}),e.jsx("input",{type:"range",id:"r-lh",min:"0.8",max:"1.75",step:"0.02",defaultValue:"1.38"})]}),e.jsxs("div",{className:"sp-group",children:[e.jsxs("div",{className:"sp-label",children:["Page Margin ",e.jsx("span",{id:"v-pad",children:"0.9cm"})]}),e.jsx("input",{type:"range",id:"r-pad",min:"0",max:"2.5",step:"0.05",defaultValue:"0.9"})]}),e.jsxs("div",{className:"sp-group",children:[e.jsx("div",{className:"sp-label",children:"Orientation"}),e.jsxs("div",{className:"seg",id:"seg-orient",children:[e.jsx("button",{className:"seg-btn active","data-v":"auto",children:"Auto"}),e.jsx("button",{className:"seg-btn","data-v":"portrait",children:"Portrait"}),e.jsx("button",{className:"seg-btn","data-v":"landscape",children:"Landscape"})]})]}),e.jsxs("div",{className:"sp-group",children:[e.jsx("div",{className:"sp-label",children:"Cut Line Style"}),e.jsxs("div",{className:"seg",id:"seg-cut",children:[e.jsx("button",{className:"seg-btn","data-v":"dotted",children:"···"}),e.jsx("button",{className:"seg-btn active","data-v":"dashed",children:"- -"}),e.jsx("button",{className:"seg-btn","data-v":"solid",children:"───"}),e.jsx("button",{className:"seg-btn","data-v":"scissors",children:"✂"})]})]}),e.jsxs("div",{className:"sp-group",children:[e.jsxs("div",{className:"sp-label",children:["Watermark Opacity ",e.jsx("span",{id:"v-wmo",children:"8%"})]}),e.jsx("input",{type:"range",id:"r-wmo",min:"0",max:"35",step:"1",defaultValue:"8"})]}),e.jsxs("div",{className:"sp-group",children:[e.jsxs("div",{className:"sp-label",children:["Watermark Size ",e.jsx("span",{id:"v-wms",children:"55%"})]}),e.jsx("input",{type:"range",id:"r-wms",min:"20",max:"90",step:"5",defaultValue:"55"})]}),e.jsxs("div",{className:"sp-group",children:[e.jsx("div",{className:"sp-label",children:"Watermark"}),e.jsxs("div",{className:"seg",id:"seg-wm",children:[e.jsx("button",{className:"seg-btn active","data-v":"none",children:"None"}),e.jsx("button",{className:"seg-btn","data-v":"default",children:"🔒 Default"}),e.jsx("button",{className:"seg-btn","data-v":"custom",children:"📂 Custom"})]}),e.jsxs("div",{id:"wm-code-wrap",style:{display:"none",marginTop:"5px",gap:"4px",alignItems:"center"},children:[e.jsx("input",{type:"password",id:"wm-code-inp",placeholder:"Enter secret code…",style:{fontSize:"0.73rem",padding:"3px 7px",flex:1}}),e.jsx("button",{className:"sbtn accent",id:"wm-code-ok",style:{padding:"3px 9px"},children:"Unlock"})]}),e.jsx("input",{type:"file",id:"wm-file",accept:".svg,.png,.jpg,.jpeg,.webp",style:{display:"none"}})]}),e.jsxs("div",{className:"sp-group",children:[e.jsx("div",{className:"sp-label",children:"Paper Language"}),e.jsxs("div",{className:"seg",id:"seg-lang",children:[e.jsx("button",{className:"seg-btn","data-v":"full-bn",title:"সব সংখ্যা বাংলায় (১, ২, ৩)",children:"পূর্ণ বাংলা"}),e.jsx("button",{className:"seg-btn active","data-v":"mixed",title:"বাংলা ও ইংরেজি মিশ্রিত",children:"Mixed"}),e.jsx("button",{className:"seg-btn","data-v":"full-en",title:"All numbers & labels in English",children:"Full English"})]})]})]})}),e.jsxs("div",{id:"preview",children:[e.jsxs("div",{id:"preview-bar",children:[e.jsx("span",{className:"pbar-label",children:"Copies / Sheet:"}),e.jsx("button",{className:"lchip active","data-l":"1",children:"Mono (1/pg)"}),e.jsx("button",{className:"lchip","data-l":"2",children:"Double (2/pg)"}),e.jsx("button",{className:"lchip","data-l":"4",children:"Quad (4/pg)"}),e.jsx("button",{className:"lchip","data-l":"flow",children:"Flow"}),e.jsx("div",{className:"spacer"}),e.jsx("span",{id:"pbar-info",style:{fontSize:"0.7rem",color:"var(--text3)"}}),e.jsx("div",{className:"vdiv"}),e.jsx("button",{className:"zbtn",id:"z-out",children:"−"}),e.jsx("span",{id:"zlabel",children:"72%"}),e.jsx("button",{className:"zbtn",id:"z-in",children:"+"})]}),e.jsx("div",{id:"preview-vp"})]})]})]}),e.jsx("div",{id:"dia-modal",children:e.jsxs("div",{id:"dia-box",children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx("strong",{style:{fontSize:"0.88rem"},children:"✏ Draw / Upload Diagram"}),e.jsx("button",{className:"ibtn del",id:"dia-cancel",children:"✕ Close"})]}),e.jsxs("div",{id:"dia-toolbar",children:[e.jsx("button",{className:"dtool active","data-dtool":"pen",children:"✏ Free"}),e.jsx("button",{className:"dtool","data-dtool":"line",children:"╱ Line"}),e.jsx("button",{className:"dtool","data-dtool":"rect",children:"▭ Rect"}),e.jsx("button",{className:"dtool","data-dtool":"circle",children:"◯ Circle"}),e.jsx("button",{className:"dtool","data-dtool":"arrow",children:"→ Arrow"}),e.jsx("button",{className:"dtool","data-dtool":"text",children:"T Text"}),e.jsx("button",{className:"dtool","data-dtool":"eraser",children:"⌫ Erase"}),e.jsx("input",{type:"color",id:"dia-color",defaultValue:"#000000",title:"Stroke color",style:{width:"28px",height:"26px",padding:"1px",borderRadius:"4px",cursor:"pointer"}}),e.jsxs("select",{id:"dia-size",defaultValue:"2",style:{width:"auto",fontSize:"0.72rem",padding:"3px 6px"},children:[e.jsx("option",{value:"1.5",children:"Thin"}),e.jsx("option",{value:"2",children:"Normal"}),e.jsx("option",{value:"3.5",children:"Thick"})]}),e.jsx("button",{className:"dtool",id:"dia-clear",style:{marginLeft:"auto",color:"var(--red)"},children:"🗑 Clear"}),e.jsx("button",{className:"dtool",id:"dia-img-load",children:"📂 Load Image"})]}),e.jsx("canvas",{id:"dia-canvas",width:548,height:320}),e.jsx("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end"},children:e.jsx("button",{className:"sbtn accent",id:"dia-save",style:{padding:"6px 18px"},children:"✓ Insert Diagram"})})]})}),e.jsxs("div",{id:"info",children:[e.jsxs("div",{className:"g-head",children:[e.jsx("h3",{children:"ℹ সম্পূর্ণ ব্যবহার নির্দেশিকা"}),e.jsx("button",{className:"ibtn",id:"btn-info-close",children:"✕"})]}),e.jsxs("div",{className:"g-body",children:[e.jsx("h4",{children:"১. প্রশ্নপত্র তৈরি করার দুটি উপায়"}),e.jsxs("p",{children:[e.jsx("strong",{children:"উপায় ক — সরাসরি টাইপ করুন:"})," বামদিকের প্যানেলে ",e.jsx("em",{children:"Exam Info"})," কার্ডে পরীক্ষার নাম, বিষয়, শ্রেণী, সময় ও পূর্ণমান লিখুন। তারপর প্রতিটি ",e.jsx("em",{children:"Section"}),"-এ ",e.jsx("code",{children:"+ Add Question"})," বোতামে ক্লিক করে প্রশ্ন যোগ করুন।"]}),e.jsxs("p",{style:{marginTop:"5px"},children:[e.jsx("strong",{children:"উপায় খ — AI দিয়ে ছবি/টেক্সট থেকে অটো-ইম্পোর্ট:"}),e.jsx("br",{}),"১. উপরে ",e.jsx("code",{children:"📥 Import QPF"})," → ",e.jsx("code",{children:"🤖 Get AI Prompt"})," ট্যাবে যান।",e.jsx("br",{}),"২. প্রম্পট কপি করে ChatGPT / Gemini-তে প্রশ্নপত্রের ছবি সহ পেস্ট করুন।",e.jsx("br",{}),"৩. AI যে QPF টেক্সট দেবে সেটি কপি করে ",e.jsx("code",{children:"📋 Paste QPF Text"})," বক্সে পেস্ট করে ",e.jsx("code",{children:"⚡ Load into Editor"})," চাপুন।"]}),e.jsx("h4",{children:"২. বাংলা ও ইংরেজি ভগ্নাংশ এবং গণিত (Bilingual Math & LaTeX)"}),e.jsx("p",{children:"প্রশ্ন বা অপশনে বাংলা ও ইংরেজি উভয় ভাষাতেই ভগ্নাংশ, ভাগ ও সমীকরণ লেখা যায়:"}),e.jsx("pre",{children:`বাংলা ভগ্নাংশ (LaTeX):  $\\frac{লব}{হর}$ বা [EQ:\\frac{৩}{৪}]
সহজ ভগ্নাংশ (Auto):    ৩/৪ বা লব/হর বা [EQ:১২/৫]
ভাগ ও গুণ:             [EQ:১২ \\div ৪ = ৩] বা $\\frac{৩}{৪} \\div \\frac{৯}{১৬}$
দ্বিঘাত সমীকরণ:       [EQ:x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}]
রাসায়নিক সংকেত:     [CHEM:H2SO4], [CHEM:6CO2 + 6H2O -> C6H12O6 + 6O2]`}),e.jsx("h4",{children:"৩. অথবা (OR) প্রশ্ন যুক্ত করার নিয়ম"}),e.jsxs("p",{children:["যেকোনো প্রশ্নের ডানদিকে ",e.jsx("code",{children:"অথবা"})," বোতামে ক্লিক করলেই প্রশ্নটি আগের প্রশ্নের সাথে ",e.jsx("em",{children:"— অথবা / OR —"})," হিসেবে যুক্ত হয়ে যাবে।"]}),e.jsx("h4",{children:"৪. প্রশ্নের ভেতরে ভাগ নম্বর (Sub-part Marks)"}),e.jsxs("p",{children:["প্রশ্নের শেষে বন্ধনীর মধ্যে যোগ আকারে নম্বর লিখলে যেমন ",e.jsx("code",{children:"(1+3+1)"})," বা ",e.jsx("code",{children:"(2+3)"})," — সেটি স্বয়ংক্রিয়ভাবে প্রশ্নের ডানদিকে চলে যাবে।"]})]})]}),e.jsxs("div",{id:"guide",children:[e.jsxs("div",{className:"g-head",children:[e.jsx("h3",{children:"📖 QPF Format & Bilingual Math Reference"}),e.jsx("button",{className:"ibtn",id:"btn-guide-close",children:"✕"})]}),e.jsxs("div",{className:"g-body",children:[e.jsx("h4",{children:"1. Bilingual Math & Fractions (বাংলা ও ইংরেজি গণিত)"}),e.jsxs("p",{children:["Write equations using either ",e.jsx("code",{children:"[EQ:...]"})," or standard ",e.jsx("code",{children:"$...$"})," / ",e.jsx("code",{children:"$$...$$"})," LaTeX. Bengali numerals (",e.jsx("code",{children:"০-৯"}),") and Bengali words (",e.jsx("code",{children:"লব/হর"}),") inside fractions and roots are automatically preserved without breaking Bengali conjuncts (যুক্তাক্ষর):"]}),e.jsx("pre",{children:`[EQ:\\frac{৩}{৪}]         →  ৩/৪ (stacked fraction)
$\\frac{লব}{হর}$          →  লব/হর (stacked fraction)
[EQ:১২ \\div ৪ = ৩]      →  ১২ ÷ ৪ = ৩
$\\sqrt{২৫} = ৫$          →  √২৫ = ৫
[EQ:E = mc^2]            →  E = mc²
[EQ:\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}]`}),e.jsx("h4",{children:"2. Chemistry Formulas — [CHEM:...]"}),e.jsx("pre",{children:`[CHEM:H2O]          →  H₂O
[CHEM:H2SO4]        →  H₂SO₄
[CHEM:Ca(OH)2]      →  Ca(OH)₂
[CHEM:SO4^2-]       →  SO₄²⁻
[CHEM:2H2 + O2 -> 2H2O]   →  2H₂ + O₂ → 2H₂O`}),e.jsx("h4",{children:"3. Symbols — [SYM:...]"}),e.jsxs("p",{children:[e.jsx("code",{children:"[SYM:deg]"})," °   ",e.jsx("code",{children:"[SYM:celsius]"})," °C   ",e.jsx("code",{children:"[SYM:ohm]"})," Ω   ",e.jsx("code",{children:"[SYM:micro]"})," μ  "," ",e.jsx("code",{children:"[SYM:alpha]"})," α   ",e.jsx("code",{children:"[SYM:beta]"})," β   ",e.jsx("code",{children:"[SYM:pi]"})," π   ",e.jsx("code",{children:"[SYM:pm]"})," ±  "," ",e.jsx("code",{children:"[SYM:times]"})," ×   ",e.jsx("code",{children:"[SYM:div]"})," ÷"]}),e.jsx("h4",{children:"4. Subscript & Superscript"}),e.jsxs("p",{children:[e.jsx("code",{children:"x[SUP:2]"})," → x²  |  ",e.jsx("code",{children:"H[SUB:2]O"})," → H₂O"]})]})]}),e.jsx("div",{id:"toasts"})]})}export{Ge as default};
