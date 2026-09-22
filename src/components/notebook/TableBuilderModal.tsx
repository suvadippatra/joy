import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Table, X, Check, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Sparkles, BookOpen } from 'lucide-react';

interface TableBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (markdown: string) => void;
}

type TablePresetStyle = 'academic' | 'minimal' | 'striped';
type ColumnAlign = 'left' | 'center' | 'right';

const TEMPLATES = [
  {
    name: 'Constants & SI Units',
    headers: ['Constant Name', 'Symbol', 'Standard Value', 'SI Unit'],
    alignments: ['left', 'center', 'right', 'center'] as ColumnAlign[],
    rows: [
      ['Speed of Light', '$c$', '$2.998 \\times 10^8$', 'm/s'],
      ["Planck's Constant", '$h$', '$6.626 \\times 10^{-34}$', 'J·s'],
      ['Gravitational Const', '$G$', '$6.674 \\times 10^{-11}$', 'N·m²/kg²'],
      ['Elementary Charge', '$e$', '$1.602 \\times 10^{-19}$', 'C']
    ]
  },
  {
    name: 'Physics / Chemistry Data',
    headers: ['Parameter', 'Formula / Symbol', 'Measured Value', 'Uncertainty'],
    alignments: ['left', 'center', 'right', 'right'] as ColumnAlign[],
    rows: [
      ['Terminal Velocity', '$v_t = \\sqrt{2mg/\\rho A C_d}$', '12.45', '±0.08 m/s'],
      ['Kinetic Energy', '$K = \\frac{1}{2}mv^2$', '145.2', '±1.2 J'],
      ['Momentum', '$\\vec{p} = m\\vec{v}$', '23.8', '±0.15 kg·m/s']
    ]
  },
  {
    name: 'Comparison Matrix',
    headers: ['Feature', 'Classical Model', 'Quantum Model', 'Conclusion'],
    alignments: ['left', 'left', 'left', 'center'] as ColumnAlign[],
    rows: [
      ['State Description', 'Deterministic trajectory', 'Wavefunction $\\psi(x,t)$', 'Complementary'],
      ['Energy Distribution', 'Continuous values', 'Quantized packets $E=h\\nu$', 'Quantum verified'],
      ['Measurement', 'Independent of observer', 'Probabilistic collapse', 'Fundamentally distinct']
    ]
  }
];

export default function TableBuilderModal({
  isOpen,
  onClose,
  onInsertTable
}: TableBuilderModalProps) {
  const [rowsCount, setRowsCount] = useState<number>(3);
  const [colsCount, setColsCount] = useState<number>(4);
  const [hoverGrid, setHoverGrid] = useState<{ r: number; c: number } | null>(null);

  // Headers and Rows Content
  const [headers, setHeaders] = useState<string[]>([
    'Parameter',
    'Symbol',
    'SI Unit',
    'Remarks'
  ]);
  const [alignments, setAlignments] = useState<ColumnAlign[]>([
    'left',
    'center',
    'center',
    'left'
  ]);
  const [tableData, setTableData] = useState<string[][]>([
    ['Force', '$\\vec{F}$', 'N', 'Vector quantity'],
    ['Energy', '$E$', 'J', 'Scalar quantity'],
    ['Power', '$P$', 'W', 'Rate of work done']
  ]);

  const [presetStyle, setPresetStyle] = useState<TablePresetStyle>('academic');

  if (!isOpen) return null;

  // Resize table grid
  const applyGridDimensions = (rCount: number, cCount: number) => {
    const validRows = Math.min(Math.max(1, rCount), 20);
    const validCols = Math.min(Math.max(1, cCount), 10);

    setRowsCount(validRows);
    setColsCount(validCols);

    // Update headers
    setHeaders(prev => {
      const next = [...prev];
      while (next.length < validCols) {
        next.push(`Header ${next.length + 1}`);
      }
      return next.slice(0, validCols);
    });

    // Update alignments
    setAlignments(prev => {
      const next = [...prev];
      while (next.length < validCols) {
        next.push('left');
      }
      return next.slice(0, validCols);
    });

    // Update data rows
    setTableData(prev => {
      const nextData: string[][] = [];
      for (let r = 0; r < validRows; r++) {
        const row = prev[r] ? [...prev[r]] : [];
        while (row.length < validCols) {
          row.push('');
        }
        nextData.push(row.slice(0, validCols));
      }
      return nextData;
    });
  };

  const handleHeaderChange = (colIdx: number, val: string) => {
    const next = [...headers];
    next[colIdx] = val;
    setHeaders(next);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    const next = tableData.map((row, r) => {
      if (r !== rowIdx) return row;
      const newRow = [...row];
      newRow[colIdx] = val;
      return newRow;
    });
    setTableData(next);
  };

  const toggleAlignment = (colIdx: number) => {
    const order: ColumnAlign[] = ['left', 'center', 'right'];
    const current = alignments[colIdx] || 'left';
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    const next = [...alignments];
    next[colIdx] = order[nextIdx];
    setAlignments(next);
  };

  const addRow = () => {
    applyGridDimensions(rowsCount + 1, colsCount);
  };

  const removeRow = () => {
    if (rowsCount > 1) {
      applyGridDimensions(rowsCount - 1, colsCount);
    }
  };

  const addCol = () => {
    applyGridDimensions(rowsCount, colsCount + 1);
  };

  const removeCol = () => {
    if (colsCount > 1) {
      applyGridDimensions(rowsCount, colsCount - 1);
    }
  };

  const loadTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setHeaders([...tmpl.headers]);
    setAlignments([...tmpl.alignments]);
    setTableData(tmpl.rows.map(r => [...r]));
    setRowsCount(tmpl.rows.length);
    setColsCount(tmpl.headers.length);
  };

  const handleInsert = () => {
    // Generate clean markdown table
    const headerRow = `| ${headers.map(h => (h.trim() || ' ')).join(' | ')} |`;
    const separatorRow = `| ${alignments.map(align => {
      if (align === 'center') return ':---:';
      if (align === 'right') return '---:';
      return ':---';
    }).join(' | ')} |`;

    const bodyRows = tableData.map(row => {
      return `| ${row.map(cell => (cell.trim() || ' ')).join(' | ')} |`;
    }).join('\n');

    const markdown = `\n${headerRow}\n${separatorRow}\n${bodyRows}\n\n`;
    onInsertTable(markdown);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Table size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Visual Table Builder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick rows &amp; columns with interactive grid or customize live before inserting.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Controls: 8x8 Grid Picker & Quick Academic Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            {/* Left: 8x8 Visual Grid Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Quick Grid Dimensions
                </label>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                  {hoverGrid ? `${hoverGrid.r} Rows × ${hoverGrid.c} Cols` : `${rowsCount} Rows × ${colsCount} Cols`}
                </span>
              </div>

              {/* 8x8 Matrix */}
              <div 
                className="grid grid-cols-8 gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit"
                onMouseLeave={() => setHoverGrid(null)}
              >
                {Array.from({ length: 8 }).map((_, r) =>
                  Array.from({ length: 8 }).map((_, c) => {
                    const rowNum = r + 1;
                    const colNum = c + 1;
                    const isHovered = hoverGrid && rowNum <= hoverGrid.r && colNum <= hoverGrid.c;
                    const isSelected = !hoverGrid && rowNum <= rowsCount && colNum <= colsCount;
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onMouseEnter={() => setHoverGrid({ r: rowNum, c: colNum })}
                        onClick={() => applyGridDimensions(rowNum, colNum)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-sm transition-all ${
                          isHovered
                            ? 'bg-blue-500 scale-105 shadow-xs'
                            : isSelected
                            ? 'bg-blue-600/80'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={`${rowNum} × ${colNum}`}
                      />
                    );
                  })
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Hover to preview size, click to set dimensions.
              </p>
            </div>

            {/* Right: Academic Templates & Style Presets */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Academic Presets</span>
                </label>
                <div className="space-y-1.5">
                  {TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => loadTemplate(tmpl)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen size={13} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>{tmpl.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tmpl.rows.length}×{tmpl.headers.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Table Aesthetic Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'academic', label: 'Academic', desc: 'Full borders' },
                    { id: 'minimal', label: 'Clean Minimal', desc: 'Horizontal lines' },
                    { id: 'striped', label: 'Striped Zebra', desc: 'Data heavy' }
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setPresetStyle(style.id as TablePresetStyle)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        presetStyle === style.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{style.label}</div>
                      <div className="text-[10px] opacity-75">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Table Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Table Content Editor (Tap cells to edit &amp; format)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Row</span>
                </button>
                <button
                  type="button"
                  onClick={removeRow}
                  disabled={rowsCount <= 1}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs disabled:opacity-40 transition-colors"
                  title="Remove bottom row"
                >
                  <Trash2 size={12} />
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={addCol}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Column</span>
                </button>
                <button
                  type="button"
                  onClick={removeCol}
                  disabled={colsCount <= 1}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs disabled:opacity-40 transition-colors"
                  title="Remove right column"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Editable Table Matrix */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs max-h-72">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="w-10 px-2 py-2 text-center text-slate-400 font-mono text-[10px]">#</th>
                    {headers.map((h, cIdx) => (
                      <th key={cIdx} className="px-2 py-2 border-r border-slate-200 dark:border-slate-700 min-w-[130px]">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={h}
                            onChange={e => handleHeaderChange(cIdx, e.target.value)}
                            placeholder={`Header ${cIdx + 1}`}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-600 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => toggleAlignment(cIdx)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded bg-slate-200 dark:bg-slate-700 shrink-0"
                            title={`Alignment: ${alignments[cIdx]} (Click to toggle)`}
                          >
                            {alignments[cIdx] === 'center' ? (
                              <AlignCenter size={13} />
                            ) : alignments[cIdx] === 'right' ? (
                              <AlignRight size={13} />
                            ) : (
                              <AlignLeft size={13} />
                            )}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className={`border-b border-slate-100 dark:border-slate-800 ${
                        presetStyle === 'striped' && rIdx % 2 === 1 
                          ? 'bg-slate-50 dark:bg-slate-800/30' 
                          : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px] select-none">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2 py-1.5 border-r border-slate-100 dark:border-slate-800 min-w-[130px]">
                          <input
                            type="text"
                            value={cell}
                            onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                            placeholder="Data..."
                            className="w-full px-2 py-1 bg-transparent rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none transition-colors text-slate-800 dark:text-slate-200"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-400">
            LaTeX math like <span className="font-mono text-blue-500">$E=mc^2$</span> supported inside cells.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Check size={16} />
              <span>Insert Table</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
