import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Table, X, Check, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TableBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (markdown: string) => void;
}

type ColumnAlign = 'left' | 'center' | 'right';

export default function TableBuilderModal({
  isOpen,
  onClose,
  onInsertTable
}: TableBuilderModalProps) {
  const [rowsCount, setRowsCount] = useState<number>(3);
  const [colsCount, setColsCount] = useState<number>(3);

  const [headers, setHeaders] = useState<string[]>([
    '',
    '',
    ''
  ]);
  const [alignments, setAlignments] = useState<ColumnAlign[]>([
    'left',
    'center',
    'right'
  ]);
  const [tableData, setTableData] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);

  if (!isOpen) return null;

  const applyGridDimensions = (rCount: number, cCount: number) => {
    const validRows = Math.min(Math.max(1, rCount), 20);
    const validCols = Math.min(Math.max(1, cCount), 10);

    setRowsCount(validRows);
    setColsCount(validCols);

    setHeaders(prev => {
      const next = [...prev];
      while (next.length < validCols) {
        next.push('');
      }
      return next.slice(0, validCols);
    });

    setAlignments(prev => {
      const next = [...prev];
      while (next.length < validCols) {
        next.push('left');
      }
      return next.slice(0, validCols);
    });

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

  const handleInsert = () => {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Table size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Insert Table
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure table dimensions and edit headers/cells directly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Dimension Controls */}
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rows:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyGridDimensions(rowsCount - 1, colsCount)}
                  disabled={rowsCount <= 1}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-slate-900 dark:text-slate-100">{rowsCount}</span>
                <button
                  type="button"
                  onClick={() => applyGridDimensions(rowsCount + 1, colsCount)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Columns:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyGridDimensions(rowsCount, colsCount - 1)}
                  disabled={colsCount <= 1}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-slate-900 dark:text-slate-100">{colsCount}</span>
                <button
                  type="button"
                  onClick={() => applyGridDimensions(rowsCount, colsCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Table Data Matrix */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs max-h-64">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="w-8 px-2 py-2 text-center text-slate-400 font-mono text-[10px]">#</th>
                  {headers.map((h, cIdx) => (
                    <th key={cIdx} className="px-2 py-2 border-r border-slate-200 dark:border-slate-700 min-w-[120px]">
                      <div className="flex items-center gap-1">
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
                          title={`Alignment: ${alignments[cIdx]}`}
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
                  <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px] select-none">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2 py-1.5 border-r border-slate-100 dark:border-slate-800 min-w-[120px]">
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end items-center gap-2 shrink-0">
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
    </div>,
    document.body
  );
}
