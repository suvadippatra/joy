export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  correct: number | number[];
  correctNat?: string;
  image?: string;
  table?: string;
  marksCorrect?: number;
  marksWrong?: number;
  explanation?: string;
}

export interface Section {
  name: string;
  marks: number;
  negative: number;
  maxAttempts: number;
}

export interface Constant {
  name: string;
  value: string;
}

export interface ExamAudio {
  bg: string;
  start: string;
  submit: string;
}

export interface AppState {
  agencyName: string;
  examTitle: string;
  examSubtitle: string;
  duration: number | string;
  timerMode: 'COUNTDOWN' | 'STOPWATCH';
  fontName: string;
  previewTableFontSize?: number;
  questionViewMode?: 'SINGLE' | 'CONTINUOUS';
  mathMode: 'LATEX' | 'HTML';
  renderEngine: 'KATEX_LOCAL' | 'MATHML' | 'HTML_FALLBACK' | 'KATEX_ONLINE';
  rules: string[];
  audio: ExamAudio;
  constants: Constant[];
  sections: Section[];
  questionsBySection: Record<string, Question[]>;
}

export const defaultRules: string[] = [
  "The examination will be conducted in Computer Based Test (CBT) mode.",
  "Candidates must verify all question sections before answering.",
  "Total Duration of Examination is specified on your admit card.",
  "Rough work must be performed only on the provided scratchpad.",
  "Scientific Calculator is available on-screen via the header toolbar.",
  "Submit the examination only when completely finished."
];

export const defaultConstants: Constant[] = [
  { name: "Speed of Light in Vacuum (c)", value: "3.00 × 10⁸ m/s" },
  { name: "Planck's Constant (h)", value: "6.626 × 10⁻³⁴ J·s" },
  { name: "Reduced Planck's Constant (ℏ)", value: "1.055 × 10⁻³⁴ J·s" },
  { name: "Gravitational Constant (G)", value: "6.674 × 10⁻¹¹ N·m²/kg²" },
  { name: "Elementary Charge (e)", value: "1.602 × 10⁻¹⁹ C" },
  { name: "Electron Rest Mass (mₑ)", value: "9.109 × 10⁻³¹ kg" },
  { name: "Proton Rest Mass (mₚ)", value: "1.673 × 10⁻²⁷ kg" },
  { name: "Neutron Rest Mass (mₙ)", value: "1.675 × 10⁻²⁷ kg" },
  { name: "Avogadro's Number (Nₐ)", value: "6.022 × 10²³ mol⁻¹" },
  { name: "Universal Gas Constant (R)", value: "8.314 J·K⁻¹·mol⁻¹ (0.0821 L·atm·K⁻¹·mol⁻¹)" },
  { name: "Boltzmann Constant (k_B)", value: "1.381 × 10⁻²³ J/K" },
  { name: "Stefan-Boltzmann Constant (σ)", value: "5.670 × 10⁻⁸ W·m⁻²·K⁻⁴" },
  { name: "Wien's Constant (b)", value: "2.898 × 10⁻³ m·K" },
  { name: "Permittivity of Free Space (ε₀)", value: "8.854 × 10⁻¹² F/m" },
  { name: "Permeability of Free Space (μ₀)", value: "4π × 10⁻⁷ T·m/A" },
  { name: "Coulomb's Constant (1/4πε₀)", value: "8.988 × 10⁹ N·m²/C²" },
  { name: "Faraday Constant (F)", value: "96,485 C·mol⁻¹" },
  { name: "Rydberg Constant (R_H)", value: "1.097 × 10⁷ m⁻¹" },
  { name: "Bohr Radius (a₀)", value: "0.529 × 10⁻¹⁰ m" },
  { name: "Standard Atmosphere (1 atm)", value: "1.013 × 10⁵ Pa (760 mmHg)" }
];

/**
 * Clean Pristine Initial App State (Default at first load)
 */
export function createCleanAppState(): AppState {
  return {
    agencyName: "National Testing Agency",
    examTitle: "Untitled CBT Paper",
    examSubtitle: "",
    duration: 90,
    timerMode: 'COUNTDOWN',
    fontName: "'KaTeX_Main', serif",
    previewTableFontSize: 100,
    questionViewMode: 'CONTINUOUS',
    mathMode: 'LATEX',
    renderEngine: 'KATEX_LOCAL',
    rules: [...defaultRules],
    audio: { bg: '', start: '', submit: '' },
    constants: [...defaultConstants],
    sections: [
      { name: "Section 1", marks: 4, negative: 1, maxAttempts: 0 }
    ],
    questionsBySection: {
      "Section 1": [
        {
          id: 1,
          type: 'MCQ',
          text: '',
          options: ['', '', '', ''],
          correct: 0,
          marksCorrect: 4,
          marksWrong: 1,
          explanation: '',
          image: '',
          table: ''
        }
      ]
    }
  };
}

export const cleanAppState: AppState = createCleanAppState();

const SHOWCASE_PROJECTILE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170" width="420" height="170">
    <rect width="420" height="170" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <line x1="30" y1="140" x2="390" y2="140" stroke="#334155" stroke-width="2"/>
    <line x1="40" y1="140" x2="40" y2="25" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>
    <path d="M 40 140 Q 210 -10 380 140" fill="none" stroke="#2563eb" stroke-width="3"/>
    <line x1="40" y1="140" x2="115" y2="75" stroke="#dc2626" stroke-width="2.2"/>
    <polygon points="115,75 105,78 111,85" fill="#dc2626"/>
    <line x1="210" y1="65" x2="210" y2="140" stroke="#059669" stroke-width="1.8" stroke-dasharray="4 3"/>
    <circle cx="210" cy="65" r="4.5" fill="#2563eb"/>
    <text x="95" y="68" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#dc2626">v₀ = 20 m/s</text>
    <text x="65" y="132" font-family="Georgia, serif" font-size="12" fill="#334155">θ = 30°</text>
    <text x="218" y="106" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#059669">H_max = 5 m</text>
    <text x="190" y="158" font-family="Georgia, serif" font-size="12" fill="#475569">Range R = (v₀² sin 2θ) / g</text>
  </svg>`
)}`;

/**
 * Full-Feature Authentic Showcase Template (Loaded on user request)
 * Demonstrates SCQ, MSQ (Multiple-Correct), NAT (Numerical Value), LaTeX derivations,
 * SVG vector diagrams, Matrix-Match tables, Assertion-Reason, and per-question custom marks.
 */
export const demoShowcaseAppState: AppState = {
  agencyName: "National Testing Agency",
  examTitle: "All-Feature CBT Showcase — Physics, Chemistry & Biology",
  examSubtitle: "Demonstrating SCQ, MSQ, NAT, Inline LaTeX, Matrix Tables & Vector Diagrams",
  duration: 180,
  timerMode: 'COUNTDOWN',
  fontName: "'KaTeX_Main', serif",
  questionViewMode: 'CONTINUOUS',
  mathMode: 'LATEX',
  renderEngine: 'KATEX_LOCAL',
  rules: [...defaultRules],
  audio: { bg: '', start: '', submit: '' },
  constants: [...defaultConstants],
  sections: [
    { name: "Section A: Physics & Calculus (SCQ + MSQ + NAT)", marks: 4, negative: 1, maxAttempts: 0 },
    { name: "Section B: Chemistry & Biology (Matrix + AR)", marks: 4, negative: 1, maxAttempts: 0 }
  ],
  questionsBySection: {
    "Section A: Physics & Calculus (SCQ + MSQ + NAT)": [
      {
        id: 101,
        type: 'MCQ',
        marksCorrect: 4,
        marksWrong: 1,
        text: "Evaluate the definite integral using King's symmetry property $\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a+b-x)\\,dx$:\n\n$$I = \\int_{0}^{\\pi/2} \\frac{\\sin^3(x)}{\\sin^3(x) + \\cos^3(x)} \\, dx$$\n\nThe exact analytical value of the definite integral $I$ is:",
        options: [
          "$\\frac{\\pi}{4}$",
          "$\\frac{\\pi}{2}$",
          "$\\frac{\\pi}{3}$",
          "$1$"
        ],
        correct: 0,
        explanation: "Using $f(a+b-x)$: $I = \\int_0^{\\pi/2} \\frac{\\cos^3(x)}{\\cos^3(x) + \\sin^3(x)}\\,dx$. Adding both expressions gives $2I = \\int_0^{\\pi/2} 1\\,dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.",
        image: '',
        table: ''
      },
      {
        id: 102,
        type: 'MSQ',
        marksCorrect: 4,
        marksWrong: 2,
        text: "**[Multiple-Correct MSQ]** In a Compton scattering experiment, an incident X-ray photon of wavelength $\\lambda_0$ collides with a stationary free electron of rest mass $m_e$ and scatters at angle $\\theta$. Which of the following physical statements are **correct**?\n\n$$\\Delta \\lambda = \\lambda' - \\lambda_0 = \\frac{h}{m_e c}(1 - \\cos\\theta)$$",
        options: [
          "The Compton wavelength shift $\\Delta \\lambda$ is independent of the incident photon wavelength $\\lambda_0$",
          "Maximum wavelength shift occurs at grazing incidence $\\theta = 0^\\circ$",
          "For backscattering ($\\theta = 180^\\circ$), the shift equals twice the Compton wavelength $\\frac{2h}{m_e c} \\approx 4.85 \\times 10^{-12}\\text{ m}$",
          "The kinetic energy transferred to the recoil electron is always zero"
        ],
        correct: [0, 2],
        explanation: "From $\\Delta\\lambda = \\lambda_C(1 - \\cos\\theta)$ where $\\lambda_C = h/(m_e c) = 2.426\\text{ pm}$, the shift depends only on scattering angle $\\theta$ (Option A is true) and reaches $2\\lambda_C$ at $\\theta = 180^\\circ$ (Option C is true).",
        image: '',
        table: ''
      },
      {
        id: 103,
        type: 'NAT',
        marksCorrect: 4,
        marksWrong: 0,
        text: "**[Numerical Value + SVG Diagram]** A projectile is launched from horizontal ground with initial velocity $v_0 = 20\\text{ m/s}$ at an elevation angle $\\theta = 30^\\circ$. Taking $g = 10\\text{ m/s}^2$, calculate the maximum vertical height $H_{\\max}$ (in meters):\n\n$$H_{\\max} = \\frac{v_0^2 \\sin^2\\theta}{2g}$$",
        options: [],
        correct: 0,
        correctNat: "5",
        explanation: "Substituting $v_0 = 20\\text{ m/s}$, $\\sin 30^\\circ = 0.5$, and $g = 10\\text{ m/s}^2$: $H_{\\max} = \\frac{400 \\times 0.25}{20} = 5\\text{ m}$.",
        image: SHOWCASE_PROJECTILE_SVG,
        table: ''
      }
    ],
    "Section B: Chemistry & Biology (Matrix + AR)": [
      {
        id: 201,
        type: 'MCQ',
        marksCorrect: 4,
        marksWrong: 1,
        text: "Match the cellular organelles listed in **Column I** with their characteristic biochemical processes in **Column II** and select the correct code:",
        table: "<table style='width:100%; border-collapse: collapse; margin: 8px 0; text-align: left; font-size: 0.95em;'><thead><tr style='background: #f1f5f9;'><th style='border: 1px solid #cbd5e1; padding: 6px 10px;'>Column I (Organelle)</th><th style='border: 1px solid #cbd5e1; padding: 6px 10px;'>Column II (Primary Function)</th></tr></thead><tbody><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(A) Mitochondria</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(i) Glycosylation &amp; vesicular packaging of proteins</td></tr><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(B) Ribosomes ($70\\text{S} / 80\\text{S}$)</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(ii) Polypeptide translation from mRNA template</td></tr><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(C) Golgi Apparatus</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(iii) Acid hydrolase digestion ($\\text{pH} \\approx 4.8$)</td></tr><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(D) Lysosomes</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(iv) Chemiosmotic $\\text{ATP}$ synthesis via $\\text{F}_0\\text{F}_1$-ATPase</td></tr></tbody></table>",
        options: [
          "(A)-(iv), (B)-(ii), (C)-(i), (D)-(iii)",
          "(A)-(ii), (B)-(iv), (C)-(i), (D)-(iii)",
          "(A)-(iv), (B)-(i), (C)-(ii), (D)-(iii)",
          "(A)-(iii), (B)-(ii), (C)-(iv), (D)-(i)"
        ],
        correct: 0,
        explanation: "Mitochondria drive oxidative phosphorylation (iv); Ribosomes catalyze translation (ii); Golgi apparatus performs glycosylation (i); Lysosomes house acid hydrolases (iii).",
        image: ''
      },
      {
        id: 202,
        type: 'MCQ',
        marksCorrect: 4,
        marksWrong: 1,
        text: "Given below are two statements: one is labelled as **Assertion (A)** and the other is labelled as **Reason (R)**:\n\n**Assertion (A):** For an isothermal reversible expansion of an ideal gas, the change in internal energy is $\\Delta U = 0$, while the work done by the gas is $W = nRT \\ln\\left(\\frac{V_2}{V_1}\\right)$.\n\n**Reason (R):** Internal energy $U$ of an ideal gas is a state function that depends exclusively on absolute temperature $T$.\n\nIn the light of the above statements, choose the correct option:",
        options: [
          "Both (A) and (R) are true and (R) is the correct explanation of (A)",
          "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
          "(A) is true but (R) is false",
          "Both (A) and (R) are false"
        ],
        correct: 0,
        explanation: "Since $U = f(T)$ for an ideal gas, $dT = 0 \\implies \\Delta U = 0$. By the First Law of Thermodynamics, $Q = W = \\int_{V_1}^{V_2} \\frac{nRT}{V}\\,dV = nRT \\ln(V_2/V_1)$.",
        image: '',
        table: ''
      }
    ]
  }
};

// Default export app state is now clean
export const defaultAppState: AppState = cleanAppState;
