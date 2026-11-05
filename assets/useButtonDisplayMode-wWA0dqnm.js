import{c as a,r as s}from"./index-BnaKFKMX.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],M=a("chevron-down",d);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],g=a("plus",u);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M10 8h4",key:"1sr2af"}],["path",{d:"M12 21v-9",key:"17s77i"}],["path",{d:"M12 8V3",key:"13r4qs"}],["path",{d:"M17 16h4",key:"h1uq16"}],["path",{d:"M19 12V3",key:"o1uvq1"}],["path",{d:"M19 21v-5",key:"qua636"}],["path",{d:"M3 14h4",key:"bcjad9"}],["path",{d:"M5 10V3",key:"cb8scm"}],["path",{d:"M5 21v-7",key:"1w1uti"}]],b=a("sliders-vertical",l),p="smart";function c(){try{const t=localStorage.getItem("cbtSettings");if(t){const e=JSON.parse(t);if(e.buttonDisplayMode==="smart"||e.buttonDisplayMode==="icon-only"||e.buttonDisplayMode==="icon-text")return e.buttonDisplayMode}}catch{}return p}function h(t){try{const e=localStorage.getItem("cbtSettings"),o=e?JSON.parse(e):{};o.buttonDisplayMode=t,localStorage.setItem("cbtSettings",JSON.stringify(o)),window.dispatchEvent(new CustomEvent("cbt_settings_changed",{detail:{buttonDisplayMode:t}}))}catch{}}function w(){const[t,e]=s.useState(()=>c());s.useEffect(()=>{const n=()=>{e(c())};return window.addEventListener("cbt_settings_changed",n),window.addEventListener("storage",n),()=>{window.removeEventListener("cbt_settings_changed",n),window.removeEventListener("storage",n)}},[]);const o=s.useCallback(n=>{h(n),e(n)},[]),r=s.useCallback((n,i=!0)=>t==="icon-text"?!0:t==="icon-only"?!1:i&&n,[t]);return{mode:t,setMode:o,buttonDisplayMode:t,setButtonDisplayMode:o,shouldShowLabel:r}}export{M as C,g as P,b as S,w as u};
