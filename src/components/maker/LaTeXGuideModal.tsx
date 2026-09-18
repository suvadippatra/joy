import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Copy, Check, Sparkles, HelpCircle, Code, ArrowRight, Search } from 'lucide-react';
import { formatContent } from '../../utils/cbtCompiler';

interface LaTeXGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet?: (snippet: string) => void;
}

export default function LaTeXGuideModal({
  isOpen,
  onClose,
  onInsertSnippet
}: LaTeXGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'latex' | 'html' | 'playground'>('latex');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [playgroundText, setPlaygroundText] = useState<string>(
    'The dimensional formula of resistance is $[\\text{M L}^2 \\text{T}^{-3} \\text{I}^{-2}]$.\nElectric field vector: $\\vec{E} = 2\\hat{i} + 3\\hat{j}$ with flux $$\\Phi = \\oint \\vec{E} \\cdot d\\vec{A}$$.\nWater molecule $\\text{H}_2\\text{O}$ has dipole moment $\\mu = 1.85\\ \\text{D}$.'
  );

  const handleCopyOrInsert = (code: string) => {
    if (onInsertSnippet) {
      onInsertSnippet(code);
    }
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const latexCategories = [
    {
      category: '1. Powers, Subscripts & Dimensional Analysis',
      items: [
        { label: 'Subscripts & Superscripts', code: '$x^2, \\quad a_1, \\quad x_{ij}, \\quad 10^{-6}$', desc: 'Use ^ for exponents and _ for subscripts' },
        { label: 'Dimensional Formula (Physics)', code: '$[\\text{M L T}^{-3} \\text{I}^{-1}]$', desc: 'Dimensions with upright letters and negative powers' },
        { label: 'Energy & Work Dimensions', code: '$[\\text{M L}^2 \\text{T}^{-2}]$', desc: 'Standard kinetic energy/work dimension formula' },
        { label: 'Compound Exponents', code: '$e^{-\\frac{E_a}{RT}}, \\quad a^{x+y}$', desc: 'Enclose complex expressions in braces { }' },
        { label: 'Square Root & n-th Root', code: '$\\sqrt{x^2 + y^2}, \\quad \\sqrt[3]{V}$', desc: 'Standard square root and custom n-th roots' }
      ]
    },
    {
      category: '2. Physics Vectors, Hats & Fields',
      items: [
        { label: 'Vector with Arrow', code: '$\\vec{E} = \\alpha x \\hat{i}, \\quad \\vec{F} = m \\vec{a}$', desc: 'Overhead arrows with \\vec{...}' },
        { label: 'Unit Vectors (Cartesian)', code: '$\\hat{i}, \\quad \\hat{j}, \\quad \\hat{k}$', desc: 'Standard unit vector hats with \\hat{...}' },
        { label: 'Vector Dot & Cross Product', code: '$\\vec{A} \\cdot \\vec{B} = AB\\cos\\theta, \\quad \\vec{A} \\times \\vec{B} = AB\\sin\\theta\\ \\hat{n}$', desc: 'Scalar product and cross product' },
        { label: 'Position Vector & Magnitude', code: '$\\vec{r} = x\\hat{i} + y\\hat{j}, \\quad |\\vec{r}| = \\sqrt{x^2 + y^2}$', desc: 'Coordinate vectors and absolute magnitudes' },
        { label: 'Electric / Magnetic Flux', code: '$$\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A}$$', desc: 'Closed loop / surface integral' },
        { label: 'Kinematics of Motion', code: '$$v^2 = u^2 + 2as, \\quad s = ut + \\frac{1}{2}at^2$$', desc: 'Equations of motion' }
      ]
    },
    {
      category: '3. Chemistry, Reactions & States',
      items: [
        { label: 'Chemical Formulas', code: '$\\text{H}_2\\text{O}, \\quad \\text{CO}_2, \\quad \\text{CaCO}_3$', desc: 'Use \\text{...} to prevent italicized letters in chemicals' },
        { label: 'Ionic Charges & Complexes', code: '$\\text{SO}_4^{2-}, \\quad [\\text{Fe}(\\text{CN})_6]^{4-}$', desc: 'Subscripts and superscripts for charges' },
        { label: 'Reaction Arrow with Heat/Catalyst', code: '$$\\text{CaCO}_3 \\xrightarrow{\\Delta} \\text{CaO} + \\text{CO}_2$$', desc: 'Reaction arrow with condition written above' },
        { label: 'Equilibrium & Reversible', code: '$$\\text{N}_2 + 3\\text{H}_2 \\rightleftharpoons 2\\text{NH}_3$$', desc: 'Double reversible equilibrium arrows' },
        { label: 'Equilibrium Constant & pH', code: '$$K_a = \\frac{[\\text{H}^+][\\text{A}^-]}{[\\text{HA}]}, \\quad \\text{pH} = -\\log[\\text{H}^+]$$', desc: 'Concentration brackets and equations' }
      ]
    },
    {
      category: '4. Fractions, Auto-Sizing Brackets & Delimiters',
      items: [
        { label: 'Simple & Nested Fractions', code: '$$\\frac{a}{b}, \\quad \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2}$$', desc: 'Numerator in first braces, denominator in second' },
        { label: 'Auto-Scaling Parentheses', code: '$$\\left( \\frac{x+1}{x-1} \\right)^2$$', desc: 'Use \\left( and \\right) so brackets scale with fraction' },
        { label: 'Square & Curly Brackets', code: '$$\\left[ 1 - \\left(\\frac{T_2}{T_1}\\right) \\right], \\quad \\left\\{ x \\in \\mathbb{R} \\mid x > 0 \\right\\}$$', desc: 'Auto-scaling square and curly delimiters' },
        { label: 'Absolute Value & Norms', code: '$$\\left| \\frac{\\Delta V}{V} \\right|, \\quad \\|\\vec{v}\\|$$', desc: 'Vertical bar delimiters' }
      ]
    },
    {
      category: '5. Greek Letters & Physics Constants',
      items: [
        { label: 'Common Lowercase Greek', code: '$\\alpha, \\quad \\beta, \\quad \\gamma, \\quad \\theta, \\quad \\lambda, \\quad \\mu, \\quad \\pi, \\quad \\omega, \\quad \\rho, \\quad \\sigma$', desc: 'Alphabetical Greek symbols' },
        { label: 'Uppercase Greek', code: '$\\Delta, \\quad \\Omega, \\quad \\Phi, \\quad \\Psi, \\quad \\Sigma, \\quad \\Theta$', desc: 'Resistance Ohm (\\Omega), Change (\\Delta), Flux (\\Phi)' },
        { label: 'Constants & Permittivity', code: '$\\varepsilon_0 = 8.854 \\times 10^{-12}\\ \\text{F/m}, \\quad \\mu_0 = 4\\pi \\times 10^{-7}$', desc: 'Permittivity of free space and permeability' },
        { label: 'Planck & Boltzmann', code: '$h = 6.626 \\times 10^{-34}\\ \\text{J}\\cdot\\text{s}, \\quad k_B = 1.38 \\times 10^{-23}$', desc: 'Universal quantum constants' }
      ]
    },
    {
      category: '6. Calculus, Limits & Summations',
      items: [
        { label: 'Definite & Indefinite Integrals', code: '$$\\int_0^\\infty e^{-x} dx = 1, \\quad \\int f(x)dx$$', desc: 'Integrals with lower and upper limits' },
        { label: 'Derivatives & Partial', code: '$$\\frac{dy}{dx}, \\quad \\frac{d^2y}{dx^2}, \\quad \\frac{\\partial \\psi}{\\partial t}$$', desc: 'Total and partial derivative notations' },
        { label: 'Summation & Products', code: '$$\\sum_{i=1}^{n} x_i, \\quad \\prod_{k=1}^{\\infty} a_k$$', desc: 'Summation with indices' },
        { label: 'Limits', code: '$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$', desc: 'Standard calculus limits' }
      ]
    },
    {
      category: '7. Matrices, Cases & Truth Tables',
      items: [
        { label: '2x2 Matrix', code: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', desc: 'Parenthesized matrix' },
        { label: 'Determinant', code: '$$\\begin{vmatrix} x_1 & y_1 \\\\ x_2 & y_2 \\end{vmatrix}$$', desc: 'Matrix determinant with vertical bars' },
        { label: 'Piecewise / Cases', code: '$$f(x) = \\begin{cases} x^2 & x \\ge 0 \\\\ -x^2 & x < 0 \\end{cases}$$', desc: 'Piecewise defined mathematical function' }
      ]
    }
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return latexCategories;
    const q = searchQuery.toLowerCase();
    return latexCategories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.label.toLowerCase().includes(q) ||
            item.code.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const htmlGuideItems = [
    {
      title: 'How HTML-based exams work',
      description: 'If you prefer not to write LaTeX, you can write pure HTML tags directly in the question or options. The CBT engine natively interprets HTML tags with full styling.'
    },
    {
      title: 'Superscripts & Subscripts',
      code: 'x<sup>2</sup> + y<sup>2</sup> = r<sup>2</sup>\nH<sub>2</sub>O and CO<sub>2</sub>',
      rendered: 'x² + y² = r² and H₂O and CO₂'
    },
    {
      title: 'Text Emphasis',
      code: '<b>Bold Text</b> or <strong>Strong</strong>\n<i>Italic Text</i> or <em>Emphasized</em>\n<u>Underlined Text</u>\n<mark>Highlighted Note</mark>',
      rendered: 'Bold, Italic, Underlined, Highlighted'
    },
    {
      title: 'Greek Letters & Symbols via HTML Entities',
      code: '&alpha; (α), &beta; (β), &gamma; (γ), &theta; (θ), &mu; (µ), &pi; (π), &omega; (ω)\n&plusmn; (±), &times; (×), &divide; (÷), &le; (≤), &ge; (≥), &ne; (≠), &infin; (∞)',
      rendered: 'α, β, γ, θ, µ, π, ω, ±, ×, ÷, ≤, ≥, ≠, ∞'
    },
    {
      title: 'Match-The-Following Tables in Questions',
      code: `<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <tr style="background:#f1f5f9;"><th>List I (Quantities)</th><th>List II (Units)</th></tr>
  <tr><td>(A) Power</td><td>(1) Joule</td></tr>
  <tr><td>(B) Work Done</td><td>(2) Watt</td></tr>
</table>`,
      rendered: 'Clean column layout for Match-List questions'
    }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Exam Writing Guide: LaTeX & HTML
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comprehensive reference for JEE, NEET, and academic math, physics, and chemistry formulas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 pt-2 gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('latex')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'latex'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              📐 LaTeX Cheatsheet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'html'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              🌐 Pure HTML Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('playground')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'playground'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ⚡ Live Playground
            </button>
          </div>

          {activeTab === 'latex' && (
            <div className="relative mb-2 w-full sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search formulas (e.g. vector, dimension)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: LATEX GUIDE */}
          {activeTab === 'latex' && (
            <div className="space-y-6">
              {/* Quick Rule Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                <strong>Golden Rules for Exam Formulas:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-blue-800 dark:text-blue-300">
                  <li>Use <code>$formula$</code> (single dollar) for inline math that flows in sentences (e.g. <code>{'$\\vec{E}$'}</code> or <code>{'$\\text{H}_2\\text{O}$'}</code>).</li>
                  <li>Use <code>$$formula$$</code> (double dollars) for large centered equations on their own line.</li>
                  <li>Click <strong>Insert</strong> to inject the snippet directly into your active question statement or option!</li>
                </ul>
              </div>

              {/* Categories */}
              {filteredCategories.map((cat, ci) => (
                <div key={ci} className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {cat.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {cat.items.map((item, ii) => (
                      <div
                        key={ii}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between gap-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {item.label}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyOrInsert(item.code)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                          >
                            {copiedCode === item.code ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedCode === item.code ? 'Copied' : 'Insert'}</span>
                          </button>
                        </div>

                        {/* Code snippet */}
                        <div className="font-mono text-xs p-1.5 rounded-lg bg-slate-900 text-emerald-400 overflow-x-auto select-all">
                          {item.code}
                        </div>

                        {/* Live Render Preview */}
                        <div
                          className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 overflow-x-auto"
                          dangerouslySetInnerHTML={{
                            __html: formatContent(item.code, 'KATEX_LOCAL', 'LATEX', true)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: HTML GUIDE */}
          {activeTab === 'html' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>When to choose HTML Mode:</strong>
                <p className="mt-1 text-emerald-800 dark:text-emerald-300">
                  If your questions do not require complex integral or matrix formulas, HTML mode lets you write familiar tags like <code>&lt;sup&gt;2&lt;/sup&gt;</code>, <code>&lt;sub&gt;2&lt;/sub&gt;</code>, and <code>&lt;table&gt;</code> without having to learn LaTeX commands.
                </p>
              </div>

              {htmlGuideItems.map((item, hi) => (
                <div
                  key={hi}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2"
                >
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                  )}
                  {item.code && (
                    <div className="font-mono text-xs p-2 rounded-lg bg-slate-900 text-emerald-400 overflow-x-auto select-all whitespace-pre-wrap">
                      {item.code}
                    </div>
                  )}
                  {item.rendered && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Output preview: {item.rendered}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LIVE PLAYGROUND */}
          {activeTab === 'playground' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type or paste math formulas below to verify real-time KaTeX rendering:
              </p>
              <textarea
                rows={4}
                value={playgroundText}
                onChange={e => setPlaygroundText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Live Output
                </span>
                <div
                  className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(playgroundText, 'KATEX_LOCAL', 'LATEX', true)
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Done / Close Guide
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
