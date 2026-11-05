export const NOTEBOOK_TEMPLATES: Record<string, { title: string; subject: string; content: string }> = {
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
![Fig 1.11](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80){width=95% align=center}
\\caption{Figure 1.11 Graphical representation of vector $\\vec{A}$ directed at angle $\\theta$ with magnitude $A$.}
\\end{figure}

\\begin{figure}[c]
![Fig 1.12](https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80){width=95% align=center}
\\caption{Figure 1.12 Triangle method of addition: head-to-tail placement yields $\\vec{R} = \\vec{A} + \\vec{B}$.}
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
![Compton Scattering](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80){width=100% align=float-right}
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
