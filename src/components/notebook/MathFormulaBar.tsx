import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface MathFormulaBarProps {
  onInsertMath: (latexString: string, isBlock?: boolean) => void;
}

interface FormulaItem {
  label: string;
  latex: string;
  isBlock?: boolean;
}

const MATH_PRESETS: { category: string; items: FormulaItem[] }[] = [
  {
    category: 'Basic Math',
    items: [
      { label: 'a/b', latex: '\\frac{a}{b}' },
      { label: 'xⁿ', latex: 'x^{n}' },
      { label: 'xᵢ', latex: 'x_{i}' },
      { label: '√x', latex: '\\sqrt{x}' },
      { label: 'ⁿ√x', latex: '\\sqrt[n]{x}' },
      { label: '±', latex: '\\pm' },
      { label: '×', latex: '\\times' },
      { label: '÷', latex: '\\div' },
      { label: '≠', latex: '\\neq' },
      { label: '≈', latex: '\\approx' },
      { label: '≤', latex: '\\le' },
      { label: '≥', latex: '\\ge' },
      { label: '∞', latex: '\\infty' },
    ]
  },
  {
    category: 'Calculus & Algebra',
    items: [
      { label: '∫ dx', latex: '\\int_{a}^{b} f(x) \\, dx' },
      { label: '∑', latex: '\\sum_{i=1}^{n} x_i' },
      { label: '∏', latex: '\\prod_{i=1}^{n} a_i' },
      { label: 'lim', latex: '\\lim_{x \\to 0} f(x)' },
      { label: 'dy/dx', latex: '\\frac{dy}{dx}' },
      { label: '∂y/∂x', latex: '\\frac{\\partial y}{\\partial x}' },
      { label: 'Matrix 2×2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', isBlock: true },
      { label: 'Cases {', latex: '\\begin{cases} x, & \\text{if } x \\ge 0 \\\\ -x, & \\text{if } x < 0 \\end{cases}', isBlock: true },
      { label: 'Vector →', latex: '\\vec{v}' },
      { label: 'Hat ^', latex: '\\hat{i}' }
    ]
  },
  {
    category: 'Greek Symbols',
    items: [
      { label: 'α', latex: '\\alpha' },
      { label: 'β', latex: '\\beta' },
      { label: 'γ', latex: '\\gamma' },
      { label: 'θ', latex: '\\theta' },
      { label: 'λ', latex: '\\lambda' },
      { label: 'μ', latex: '\\mu' },
      { label: 'π', latex: '\\pi' },
      { label: 'ρ', latex: '\\rho' },
      { label: 'σ', latex: '\\sigma' },
      { label: 'φ', latex: '\\phi' },
      { label: 'ω', latex: '\\omega' },
      { label: 'Δ', latex: '\\Delta' },
      { label: 'Ω', latex: '\\Omega' },
      { label: 'Σ', latex: '\\Sigma' }
    ]
  },
  {
    category: 'Physics & Chemistry',
    items: [
      { label: 'E = mc²', latex: 'E = mc^2' },
      { label: 'F = ma', latex: '\\vec{F} = m\\vec{a}' },
      { label: '→ (Arrow)', latex: '\\rightarrow' },
      { label: '⇌ (Equilibrium)', latex: '\\rightleftharpoons' },
      { label: 'H₂O', latex: '\\text{H}_2\\text{O}' },
      { label: '℃', latex: '^\\circ\\text{C}' }
    ]
  }
];

export default function MathFormulaBar({ onInsertMath }: MathFormulaBarProps) {
  const [activeCategory, setActiveCategory] = useState(MATH_PRESETS[0].category);

  const currentCategory = MATH_PRESETS.find(p => p.category === activeCategory) || MATH_PRESETS[0];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-thin text-xs">
      <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 shrink-0 mr-1">
        <span className="font-mono text-xs">Σ</span>
        <span className="hidden sm:inline">Math:</span>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-1 shrink-0">
        {MATH_PRESETS.map(preset => (
          <button
            key={preset.category}
            type="button"
            onClick={() => setActiveCategory(preset.category)}
            className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors whitespace-nowrap ${
              activeCategory === preset.category
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {preset.category}
          </button>
        ))}
      </div>

      {/* Symbol / Formula Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {currentCategory.items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            title={item.latex}
            onClick={() => onInsertMath(item.latex, item.isBlock)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 font-mono text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
