const SVG_VECTOR_ADD = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" width="360" height="220" style="background:#f8fafc;border-radius:10px;border:1px solid #cbd5e1;font-family:serif">
    <defs>
      <marker id="arrB" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#2563eb"/></marker>
      <marker id="arrG" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#059669"/></marker>
      <marker id="arrR" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dc2626"/></marker>
    </defs>
    <line x1="40" y1="180" x2="320" y2="180" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="40" y1="180" x2="40" y2="25" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="40" y1="180" x2="200" y2="140" stroke="#2563eb" stroke-width="3" marker-end="url(#arrB)"/>
    <line x1="200" y1="140" x2="280" y2="45" stroke="#059669" stroke-width="3" marker-end="url(#arrG)"/>
    <line x1="40" y1="180" x2="280" y2="45" stroke="#dc2626" stroke-width="3" stroke-dasharray="5,3" marker-end="url(#arrR)"/>
    <text x="125" y="172" font-size="15" font-weight="bold" fill="#1d4ed8">Vector A</text>
    <text x="250" y="102" font-size="15" font-weight="bold" fill="#047857">Vector B</text>
    <text x="135" y="95" font-size="16" font-weight="bold" fill="#b91c1c">R = A + B</text>
  </svg>`
)}`;

const SVG_COMPTON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240" width="420" height="240" style="background:#f8fafc;border-radius:10px;border:1px solid #cbd5e1;font-family:serif">
    <defs>
      <marker id="arP" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#7c3aed"/></marker>
      <marker id="arE" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#0284c7"/></marker>
    </defs>
    <line x1="20" y1="120" x2="390" y2="120" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5,5"/>
    <path d="M 25 120 Q 40 105, 55 120 T 85 120 T 115 120 T 145 120 T 175 120" fill="none" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#arP)"/>
    <circle cx="190" cy="120" r="12" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
    <text x="184" y="125" font-size="13" font-weight="bold" fill="#ffffff">e⁻</text>
    <path d="M 190 120 Q 210 95, 225 100 T 260 75 T 295 50 T 330 30" fill="none" stroke="#db2777" stroke-width="2.5" marker-end="url(#arP)"/>
    <line x1="190" y1="120" x2="335" y2="195" stroke="#0284c7" stroke-width="2.8" marker-end="url(#arE)"/>
    <path d="M 240 120 A 50 50 0 0 0 232 93" fill="none" stroke="#475569" stroke-width="1.5"/>
    <path d="M 235 120 A 45 45 0 0 1 230 140" fill="none" stroke="#475569" stroke-width="1.5"/>
    <text x="248" y="108" font-size="14" font-style="italic" fill="#0f172a">θ</text>
    <text x="245" y="142" font-size="14" font-style="italic" fill="#0f172a">φ</text>
    <text x="35" y="96" font-size="13" font-weight="bold" fill="#6d28d9">Incident Photon (λ₀)</text>
    <text x="245" y="26" font-size="13" font-weight="bold" fill="#be185d">Scattered Photon (λ' &gt; λ₀)</text>
    <text x="245" y="216" font-size="13" font-weight="bold" fill="#0369a1">Recoil Electron (KE)</text>
  </svg>`
)}`;

export const NOTEBOOK_TEMPLATES: Record<string, { title: string; subject: string; content: string }> = {
  showcase: {
    title: "Statistical Mechanics, Compton Scattering & Relativistic Collisions",
    subject: "Full Showcase Template · Research & Textbook Layout",
    content: `# Statistical Foundations & Relativistic Photon Scattering

\\begin{abstract}
This showcase paper demonstrates all capabilities of **Academic Document Studio**: inline LaTeX ($\\Omega$, $E = h\\nu$), double-escaped notation \\\\(N \\sim 10^{23}\\\\), numbered theorems, wrapped vector SVG figures, two-column research sections, and interactive data tables.
\\end{abstract}

## 1. Microstates, Macrostates & Statistical Equilibrium

Imagine flipping a coin twenty times; while getting twenty heads in a row is physically possible, getting approximately ten heads and ten tails is overwhelmingly more likely simply because there are far more combinations of individual flips that produce a half-and-half split. In thermal physics, the **primary foundational idea** needed to start the entire subject is the distinction between a **microstate** and a **macrostate**, unified by the **Postulate of Equal A Priori Probabilities**.

Because macrostates corresponding to uniform, randomized distributions contain an exponentially higher number of constituent microstates (multiplicity $\\Omega$) than ordered ones, an isolated macroscopic system with $N \\sim 10^{23}$ particles spends virtually all its time in the most probable macrostate:

$$
S = k_B \\ln \\Omega \\quad \\text{where} \\quad P_i = \\frac{1}{\\Omega}
$$

> [!THEOREM]
> **Boltzmann Entropy & Canonical Ensemble Distribution**
> For a system in thermal contact with a heat bath at temperature $T$, the probability of occupying a discrete energy eigenstate $E_r$ is given by the Gibbs canonical factor:
> $$P(E_r) = \\frac{e^{-E_r / (k_B T)}}{Z}, \\qquad Z = \\sum_{r} e^{-E_r / (k_B T)}$$

### Comparison of Statistical Ensembles

| Ensemble Name | Fixed Macroscopic Variables | Characteristic Potential | Partition Function |
| :--- | :---: | :---: | :--- |
| **Microcanonical** | Particle number $N$, Volume $V$, Energy $E$ | Entropy $S(E,V,N) = k_B \\ln \\Omega$ | $\\Omega(E, V, N)$ |
| **Canonical** | Particle number $N$, Volume $V$, Temp $T$ | Helmholtz Free Energy $F = -k_B T \\ln Z$ | $Z = \\sum e^{-\\beta E_r}$ |
| **Grand Canonical** | Chemical Potential $\\mu$, Volume $V$, Temp $T$ | Grand Potential $\\Phi_G = -k_B T \\ln \\mathcal{Z}$ | $\\mathcal{Z} = \\sum e^{-\\beta(E_r - \\mu N_r)}$ |

---

## 2. The Compton Effect & Relativistic Photon Collisions

\\begin{wrapfigure}{r}{0.45\\textwidth}
![Compton Scattering](${SVG_COMPTON}){width=100% align=float-right}
\\caption{Fig. 1.1: Relativistic Compton scattering geometry showing incident wavelength $\\lambda_0$, scattered photon $\\lambda'$, and recoil electron at angle $\\phi$.}
\\end{wrapfigure}

In 1923, Arthur H. Compton observed that monochromatic X-rays scattered from a graphite target exhibit a wavelength shift $\\Delta \\lambda = \\lambda' - \\lambda_0$ that depends strictly on the scattering angle $\\theta$. Treating the interaction as a relativistic two-body collision between a photon of momentum $p = h/\\lambda_0$ and a stationary electron of rest energy $m_e c^2$:

$$
\\Delta \\lambda = \\lambda' - \\lambda_0 = \\frac{h}{m_e c}(1 - \\cos\\theta) = \\lambda_C (1 - \\cos\\theta)
$$

where the electron **Compton Wavelength** is $\\lambda_C = \\frac{h}{m_e c} = 2.426 \\times 10^{-12}\\,\\text{m} = 0.02426\\,\\text{\\AA}$.

\\begin{twocolumn}
### Key Experimental Regimes
1. **Forward Scattering ($\\theta = 0^\\circ$):** $\\cos 0^\\circ = 1 \\implies \\Delta \\lambda = 0$. No kinetic energy is transferred.
2. **Orthogonal Scattering ($\\theta = 90^\\circ$):** $\\cos 90^\\circ = 0 \\implies \\Delta \\lambda = \\lambda_C = 0.0243\\,\\text{\\AA}$.
3. **Backscattering ($\\theta = 180^\\circ$):** $\\cos 180^\\circ = -1 \\implies \\Delta \\lambda_{\\max} = 2\\lambda_C = 0.0485\\,\\text{\\AA}$.

### Recoil Electron Kinetic Energy
By conservation of total relativistic energy $h\\nu_0 + m_e c^2 = h\\nu' + m_e c^2 + K_e$, the kinetic energy imparted to the recoil electron is:
$$
K_e = h\\nu_0 \\left[ \\frac{\\frac{h\\nu_0}{m_e c^2}(1 - \\cos\\theta)}{1 + \\frac{h\\nu_0}{m_e c^2}(1 - \\cos\\theta)} \\right]
$$
\\end{twocolumn}
`
  },
  physics: {
    title: "Classical Mechanics & Rotational Dynamics",
    subject: "Physics Advanced Notes",
    content: `# Classical Mechanics & Rotational Dynamics

## 1. Newton's Laws of Motion & Momentum

The fundamental equation of motion for a particle of invariant mass $m$ subjected to an external net force $\\vec{F}_{\\text{net}}$ is given by:

$$
\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt} = m\\frac{d^2\\vec{r}}{dt^2} = m\\vec{a}
$$

> [!THEOREM]
> **Conservation of Linear Momentum**
> If the net external force acting on a closed system is zero ($\\sum \\vec{F}_{\\text{ext}} = 0$), the total linear momentum $\\vec{P} = \\sum m_i \\vec{v}_i$ remains strictly constant over time.

---

### Important Mechanics Parameters

| Quantity | Symbol | SI Unit | Dimensional Formula |
| :--- | :---: | :---: | :---: |
| Angular Velocity | $\\vec{\\omega}$ | $\\text{rad}\\cdot\\text{s}^{-1}$ | $[M^0 L^0 T^{-1}]$ |
| Torque | $\\vec{\\tau}$ | $\\text{N}\\cdot\\text{m}$ | $[M L^2 T^{-2}]$ |
| Moment of Inertia | $I$ | $\\text{kg}\\cdot\\text{m}^2$ | $[M L^2 T^0]$ |
| Angular Momentum | $\\vec{L}$ | $\\text{J}\\cdot\\text{s}$ | $[M L^2 T^{-1}]$ |

---pagebreak---

## 2. Rotational Kinetic Energy & Parallel Axis Theorem

For a rigid body rotating about a fixed axis with angular velocity $\\omega$, the total rotational kinetic energy is:

$$
K_{\\text{rot}} = \\frac{1}{2} I \\omega^2 = \\frac{L^2}{2I}
$$

> [!FORMULA]
> **Parallel Axis Theorem**
> The moment of inertia $I$ about any arbitrary axis parallel to an axis passing through the center of mass is:
> $$I = I_{\\text{cm}} + M d^2$$
> where $M$ is the total mass of the body and $d$ is the perpendicular distance between the two parallel axes.

### Kinematics Comparison
- Linear displacement: $s = v_0 t + \\frac{1}{2} a t^2$
- Angular displacement: $\\theta = \\omega_0 t + \\frac{1}{2} \\alpha t^2$
- Work-Energy Theorem: $W_{\\text{net}} = \\Delta K = \\int \\vec{\\tau} \\cdot d\\vec{\\theta}$
`
  },
  calculus: {
    title: "Calculus & Differential Equations",
    subject: "Mathematics Higher Level",
    content: `# Advanced Calculus & Integration

## 1. Fundamental Theorem of Calculus

Let $f: [a, b] \\to \\mathbb{R}$ be a continuous real-valued function. If $F(x) = \\int_{a}^{x} f(t) \\, dt$, then $F$ is uniformly differentiable on $(a, b)$ and:

$$
F'(x) = \\frac{d}{dx} \\left( \\int_{a}^{x} f(t) \\, dt \\right) = f(x)
$$

> [!DEFINITION]
> **Definite Integral as Riemann Sum**
> The definite integral of $f(x)$ over $[a, b]$ is defined as the limit of the Riemann sum as the partition mesh $\\|P\\| \\to 0$:
> $$ \\int_{a}^{b} f(x) \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x_i $$

---

### Standard Integration Formulas

| Function $f(x)$ | Indefinite Integral $\\int f(x)\\,dx$ |
| :--- | :--- |
| $x^n \\quad (n \\neq -1)$ | $\\frac{x^{n+1}}{n+1} + C$ |
| $\\frac{1}{x}$ | $\\ln|x| + C$ |
| $e^{kx}$ | $\\frac{1}{k} e^{kx} + C$ |
| $\\sin(kx)$ | $-\\frac{1}{k} \\cos(kx) + C$ |
| $\\frac{1}{1 + x^2}$ | $\\arctan(x) + C$ |

---pagebreak---

## 2. Second-Order Linear Differential Equations

Consider the homogeneous linear differential equation with constant real coefficients:

$$
a \\frac{d^2 y}{dx^2} + b \\frac{dy}{dx} + c y = 0
$$

The characteristic auxiliary equation is given by:

$$
a r^2 + b r + c = 0 \\implies r = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

- **Case 1 (Distinct Roots $\\Delta > 0$):** $y(x) = c_1 e^{r_1 x} + c_2 e^{r_2 x}$
- **Case 2 (Repeated Root $\\Delta = 0$):** $y(x) = (c_1 + c_2 x) e^{r x}$
- **Case 3 (Complex Conjugates $\\Delta < 0$):** $y(x) = e^{\\alpha x} \\left( c_1 \\cos(\\beta x) + c_2 \\sin(\\beta x) \\right)$
`
  },
  biology: {
    title: "Molecular Genetics & DNA Replication",
    subject: "Botany & Zoology Notes",
    content: `# Molecular Basis of Inheritance

## 1. The Structure of the DNA Double Helix

DNA (*Deoxyribonucleic Acid*) is a long polymer of deoxyribonucleotides. The double helix model was proposed by **James Watson and Francis Crick in 1953**, based on the X-ray diffraction data produced by Rosalind Franklin and Maurice Wilkins.

> [!KEY]
> **Salient Features of Double Helix:**
> - Made of two polynucleotide chains where the backbone is formed by <span style="color: #1d4ed8">**sugar-phosphate**</span>, and the nitrogenous bases project inside.
> - The two chains have **antiparallel polarity**: $5' \\rightarrow 3'$ in one chain and $3' \\rightarrow 5'$ in the other.
> - The bases in two strands are paired through **hydrogen bonds (H-bonds)**:
>   - $\\text{Adenine} = \\text{Thymine}$ (2 H-bonds)
>   - $\\text{Guanine} \\equiv \\text{Cytosine}$ (3 H-bonds)

---

### Key Enzymes in DNA Replication

| Enzyme | Primary Function in Replication |
| :--- | :--- |
| **DNA Helicase** | Unwinds the DNA double helix at replication fork |
| **DNA Topoisomerase** | Relieves torsional strain and supercoiling |
| **DNA Polymerase III** | Main catalyst for $5' \\rightarrow 3'$ strand polymerization |
| **DNA Ligase** | Catalyzes phosphodiester bonds to join Okazaki fragments |

---pagebreak---

## 2. Central Dogma of Molecular Biology

Proposed by Francis Crick, the flow of genetic information occurs in the following sequential order:

$$
\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}
$$

In retroviruses (e.g. HIV), the process occurs in reverse via the enzyme **Reverse Transcriptase**:

$$
\\text{RNA} \\xrightarrow{\\text{Reverse Transcription}} \\text{DNA}
$$
`
  },
  exam: {
    title: "All-India Science & Mathematics Examination",
    subject: "Official Examination Paper",
    content: `# NATIONAL INSTITUTE OF ADVANCED SCIENCES
### ANNUAL COMPETITIVE EXAMINATION - 2026

**Subject:** Physical Sciences & Pure Mathematics | **Duration:** 180 Minutes | **Max Marks:** 100
---
*General Instructions: All questions are compulsory. Section A contains 1-mark objective questions. Section B contains theoretical problem solving.*

---

## SECTION A: FUNDAMENTAL CONCEPTS [20 Marks]

> [!KEY]
> **Instructions for Q1–Q5:** Choose the single correct option. Each question carries **+4 marks** for correct answer and **-1 mark** for incorrect response.

**Q1.** A particle of mass $m$ moves in a central potential field $V(r) = -\\frac{k}{r}$. The total energy $E$ for a closed elliptical orbit satisfies:
- (A) $E > 0$
- (B) $E = 0$
- (C) $E < 0$
- (D) Indeterminate

**Q2.** The limit $\\lim_{x \\to 0} \\frac{\\sin(ax)}{\\tan(bx)}$ evaluate to:
- (A) $\\frac{a}{b}$
- (B) $\\frac{b}{a}$
- (C) $1$
- (D) $0$

**Q3.** In a Young's Double Slit Experiment, if monochromatic light of wavelength $\\lambda = 600\\,\\text{nm}$ is used with slit separation $d = 1\\,\\text{mm}$ and screen distance $D = 2\\,\\text{m}$, the fringe width $\\beta$ is:
- (A) $0.6\\,\\text{mm}$
- (B) $1.2\\,\\text{mm}$
- (C) $2.4\\,\\text{mm}$
- (D) $3.6\\,\\text{mm}$

---pagebreak---

## SECTION B: ANALYTICAL PROBLEM SOLVING [30 Marks]

> [!THEOREM]
> **Question 4 (Descriptive Proof & Derivation) [10 Marks]**
> State Gauss's Divergence Theorem. Use it to evaluate the surface integral $\\iint_S \\vec{F} \\cdot d\\vec{S}$, where $\\vec{F} = x\\hat{i} + y\\hat{j} + z\\hat{k}$ and $S$ is the closed sphere $x^2 + y^2 + z^2 = R^2$.

**Solution Space & Steps:**
1. State the integral divergence identity:
   $$\\iint_{\\partial V} \\vec{F} \\cdot d\\vec{S} = \\iiint_V (\\nabla \\cdot \\vec{F}) \\, dV$$
2. Compute the divergence: $\\nabla \\cdot \\vec{F} = \\frac{\\partial x}{\\partial x} + \\frac{\\partial y}{\\partial y} + \\frac{\\partial z}{\\partial z} = 1 + 1 + 1 = 3$.
3. Evaluate the volume integral of the sphere:
   $$\\iiint_V 3 \\, dV = 3 \\times \\left( \\frac{4}{3} \\pi R^3 \\right) = 4 \\pi R^3$$

---

### Comparison of Quantum Mechanics vs Classical Mechanics

| Physical Observable | Classical Mechanics | Quantum Mechanics (Schrödinger) |
| :--- | :--- | :--- |
| **State Description** | Position $\\vec{r}(t)$ & Momentum $\\vec{p}(t)$ | Wavefunction $\\Psi(\\vec{r}, t) \\in \\mathcal{H}$ |
| **Equation of Motion** | $\\vec{F} = m\\frac{d^2\\vec{r}}{dt^2}$ | $i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H}\\Psi$ |
| **Measurement** | Continuous & Deterministic | Probabilistic: $P = |\\Psi|^2$ |
`
  },
  textbook_vectors: {
    title: "Vector Addition & Trigonometric Methods",
    subject: "Physics · Margin-Rail Layout",
    content: `# Chapter 1: Vectors & Geometric Representation

\\begin{marginlayout}
\\begin{margincol}
\\begin{figure}[c]
![Fig 1.11](${SVG_VECTOR_ADD}){width=95% align=center}
\\caption{Figure 1.11 Graphical triangle method of vector addition yielding $\\vec{R} = \\vec{A} + \\vec{B}$.}
\\end{figure}

\\begin{caution}
Vectors cannot be added algebraically unless their direction angles are collinear. Always resolve into orthogonal cartesian components.
\\end{caution}
\\end{margincol}
\\begin{maincol}
## 1.3 Geometric & Analytic Vector Addition

When two displacement vectors $\\vec{A}$ and $\\vec{B}$ lie in a plane, the resultant vector $\\vec{R}$ represents the single displacement having identical physical effect:

$$
\\vec{R} = \\vec{A} + \\vec{B}
$$

### Parallelogram Law & Law of Cosines

If $\\vec{A}$ and $\\vec{B}$ make an angle $\\theta$ with each other, the magnitude of the resultant vector is calculated directly from the law of cosines:

$$
R = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}
$$

And the orientation angle $\\alpha$ with respect to $\\vec{A}$ satisfies:

$$
\\tan\\alpha = \\frac{B\\sin\\theta}{A + B\\cos\\theta}
$$

> [!FORMULA]
> **Vector Orthogonal Components:**
> - $A_x = A\\cos\\theta$
> - $A_y = A\\sin\\theta$
> - Magnitude: $A = \\sqrt{A_x^2 + A_y^2}$
\\end{maincol}
\\end{marginlayout}
`
  },
  textbook_compton: {
    title: "The Compton Effect & Photon Collisions",
    subject: "Modern Physics · Wrap-Figure Layout",
    content: `# Chapter 28: Quantum Physics & Photons

## 28.3 The Compton Effect & Photon-Electron Scattering

In 1923, Arthur H. Compton recorded the scattering of monochromatic X-rays directed at a graphite target and observed that the scattered radiation contained components of shifted, longer wavelengths.

\\begin{wrapfigure}{r}{0.42\\textwidth}
![Compton Scattering](${SVG_COMPTON}){width=100% align=float-right}
\\caption{Fig. 28.15: Compton scattering geometry. An incident photon collides with a stationary electron and scatters at angle $\\theta$.}
\\end{wrapfigure}

Treating this interaction as a relativistic elastic collision between a photon of energy $E = h\\nu = \\frac{hc}{\\lambda}$ and a free stationary electron of rest mass $m_e$, relativistic conservation of 4-momentum gives the fundamental Compton shift formula:

$$
\\Delta \\lambda = \\lambda' - \\lambda_0 = \\frac{h}{m_e c}(1 - \\cos\\theta)
$$

Where the **Compton Wavelength** of the electron is defined as:

$$
\\lambda_C = \\frac{h}{m_e c} = 2.426 \\times 10^{-12}\\,\\text{m} = 0.02426\\,\\text{\\AA}
$$

### Key Experimental Conclusions:
1. **Maximum Shift at $\\theta = 180^\\circ$ (Backscattering):** $\\Delta \\lambda = 2\\lambda_C = 0.0485\\,\\text{\\AA}$.
2. **Independence from Target Material:** The wavelength shift depends strictly on the scattering angle $\\theta$ and fundamental constants ($h, m_e, c$).
`
  }
};

