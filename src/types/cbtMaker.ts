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
export const cleanAppState: AppState = {
  agencyName: "National Testing Agency",
  examTitle: "New CBT Test",
  examSubtitle: "",
  duration: 90,
  timerMode: 'COUNTDOWN',
  fontName: "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif",
  previewTableFontSize: 100,
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

/**
 * Rich Sample Demo State (Loaded on user request)
 */
export const demoShowcaseAppState: AppState = {
  agencyName: "National Testing Agency",
  examTitle: "Kattar CBT Sample Showcase 2026",
  examSubtitle: "Physics, Chemistry & Biology Model Examination",
  duration: 180,
  timerMode: 'COUNTDOWN',
  fontName: "'KaTeX_Main', 'Tiro Bangla', 'DM Serif Text', serif",
  mathMode: 'LATEX',
  renderEngine: 'KATEX_LOCAL',
  rules: [...defaultRules],
  audio: { bg: '', start: '', submit: '' },
  constants: [...defaultConstants],
  sections: [
    { name: "Section 1: General & Biology", marks: 4, negative: 1, maxAttempts: 0 },
    { name: "Section 2: Science & Mathematics", marks: 4, negative: 1, maxAttempts: 0 }
  ],
  questionsBySection: {
    "Section 1: General & Biology": [
      {
        id: 1,
        type: 'MCQ',
        text: "Match the cellular components listed in **Column I** with their primary biochemical functions in **Column II**:\n\nSelect the correct option from the codes given below:",
        table: "<table style='width:100%; border-collapse: collapse; margin: 8px 0; text-align: left; font-size: 0.95em;'><thead><tr style='background: #f1f5f9;'><th style='border: 1px solid #cbd5e1; padding: 6px 10px;'>Column I (Organelle / Component)</th><th style='border: 1px solid #cbd5e1; padding: 6px 10px;'>Column II (Biochemical Function)</th></tr></thead><tbody><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(A) Mitochondria</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(i) Packaging & glycosylation of proteins</td></tr><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(B) Ribosomes (70S & 80S)</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(ii) Translation & polypeptide synthesis</td></tr><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(C) Golgi Apparatus</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(iii) Intracellular hydrolytic enzyme digestion</td></tr><tr><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'><strong>(D) Lysosomes</strong></td><td style='border: 1px solid #cbd5e1; padding: 6px 10px;'>(iv) ATP generation via oxidative phosphorylation</td></tr></tbody></table>",
        options: [
          "(A)-(iv), (B)-(ii), (C)-(i), (D)-(iii)",
          "(A)-(ii), (B)-(iv), (C)-(i), (D)-(iii)",
          "(A)-(iv), (B)-(i), (C)-(ii), (D)-(iii)",
          "(A)-(iii), (B)-(ii), (C)-(iv), (D)-(i)"
        ],
        correct: 0,
        explanation: "Mitochondria carry out oxidative phosphorylation to synthesize ATP. Ribosomes synthesize proteins. Golgi apparatus modifies and packages macromolecules. Lysosomes contain acid hydrolases.",
        image: ''
      },
      {
        id: 2,
        type: 'MCQ',
        text: "Given below are two statements: one is labelled as **Assertion (A)** and the other is labelled as **Reason (R)**:\n\n**Assertion (A):** In glycolysis, a single molecule of glucose undergoes ten enzymatic steps to produce two molecules of pyruvic acid without utilizing molecular oxygen.\n\n**Reason (R):** Glycolysis takes place in the cytosol (cytoplasm) of all living cells and is common to both aerobic and anaerobic cellular respiration.\n\nIn the light of the above statements, choose the most appropriate answer from the options given below:",
        options: [
          "Both (A) and (R) are true and (R) is the correct explanation of (A)",
          "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
          "(A) is true but (R) is false",
          "Both (A) and (R) are false"
        ],
        correct: 1,
        explanation: "Both statements are factually correct. However, Reason (R) describes the location and universal nature of glycolysis, which does not explain why glucose specifically yields two pyruvate molecules via partial oxidation.",
        image: '',
        table: ''
      },
      {
        id: 3,
        type: 'MCQ',
        text: "**Cause:** Excessive burning of fossil fuels and rapid deforestation have led to a sharp surge in tropospheric carbon dioxide (CO<sub>2</sub>) and methane (CH<sub>4</sub>) concentrations.\n\n**Reason / Mechanism:** Greenhouse gas molecules absorb outgoing terrestrial longwave infrared radiation emitted by the Earth and re-radiate it in all directions, intensifying the atmospheric greenhouse effect.\n\nEvaluate the Cause-and-Reason relationship:",
        options: [
          "Both the Cause and the Reason are valid, and the Reason correctly explains the physical mechanism of global greenhouse warming",
          "The Cause is scientifically valid, but the Reason misstates the radiation wavelength interaction",
          "The Reason is true in physics, but completely unrelated to the stated environmental Cause",
          "Neither the Cause nor the Reason represents an established scientific fact"
        ],
        correct: 0,
        explanation: "Atmospheric CO2 and CH4 selectively absorb and re-emit terrestrial infrared (long-wave) radiation, preventing heat from escaping into outer space.",
        image: '',
        table: ''
      }
    ],
    "Section 2: Science & Mathematics": [
      {
        id: 1,
        type: 'MCQ',
        text: "Evaluate the definite integral using King's property $\\int_{a}^{b} f(x)dx = \\int_{a}^{b} f(a+b-x)dx$:\n\n$$I = \\int_{0}^{\\pi/2} \\frac{\\sin^3(x)}{\\sin^3(x) + \\cos^3(x)} \\, dx$$\n\nThe exact analytical value of the definite integral $I$ is:",
        options: [
          "$\\frac{\\pi}{4}$",
          "$\\frac{\\pi}{2}$",
          "$\\frac{\\pi}{3}$",
          "$1$"
        ],
        correct: 0,
        explanation: "Applying the symmetry property: $I = \\int_0^{\\pi/2} \\frac{\\cos^3(x)}{\\cos^3(x) + \\sin^3(x)} dx$. Adding both equations gives $2I = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.",
        image: '',
        table: ''
      },
      {
        id: 2,
        type: 'NAT',
        text: "A projectile is launched from ground level with initial speed $v_0 = 20\\text{ m/s}$ at an elevation angle $\\theta = 30^\\circ$ relative to horizontal terrain. Neglecting air resistance and taking acceleration due to gravity $g = 10\\text{ m/s}^2$:\n\n$$H_{\\max} = \\frac{v_0^2 \\sin^2\\theta}{2g}$$\n\nCalculate the maximum vertical height $H_{\\max}$ attained by the projectile in meters:",
        options: [],
        correct: 0,
        correctNat: "5",
        explanation: "H_max = (20^2 * (sin 30°)^2) / (2 * 10) = (400 * (1/4)) / 20 = 100 / 20 = 5 meters.",
        image: '',
        table: ''
      }
    ]
  }
};

// Default export app state is now clean
export const defaultAppState: AppState = cleanAppState;
