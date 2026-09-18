import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Table as TableIcon, Sparkles, Columns, RotateCcw, Eye, Code } from 'lucide-react';

interface VisualTableEditorProps {
  initialHtml?: string;
  onChange: (tableHtml: string) => void;
  onClear: () => void;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

// Default Match the Following preset
const matchPreset: TableData = {
  headers: ['Column I (List I)', 'Column II (List II)'],
  rows: [
    ['(A) Item A', '(i) Description 1'],
    ['(B) Item B', '(ii) Description 2'],
    ['(C) Item C', '(iii) Description 3'],
    ['(D) Item D', '(iv) Description 4']
  ]
};

// 2-Column Comparison preset
const comparisonPreset: TableData = {
  headers: ['Property / Feature', 'Observation / Value'],
  rows: [
    ['Molecular Formula', 'C₆H₁₂O₆'],
    ['Molar Mass', '180.16 g/mol'],
    ['Physical State', 'White crystalline solid']
  ]
};

// 3-Column Data preset
const threeColPreset: TableData = {
  headers: ['List I (Quantity)', 'List II (Symbol)', 'List III (SI Unit)'],
  rows: [
    ['Electric Flux', 'Φ', 'N·m²/C (or V·m)'],
    ['Permittivity', 'ε₀', 'F/m (or C²/N·m²)'],
    ['Inductance', 'L', 'Henry (H)']
  ]
};

// Helper to convert structured TableData to clean HTML
function tableDataToHtml(data: TableData): string {
  if (!data.headers.length && !data.rows.length) return '';

  const headerCells = data.headers
    .map(
      h =>
        `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background: #f8fafc; font-weight: bold; text-align: left;">${h || '&nbsp;'}</th>`
    )
    .join('');

  const rowLines = data.rows
    .map(row => {
      const cells = row
        .map(
          cell =>
            `<td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left;">${cell || '&nbsp;'}</td>`
        )
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 0.95em; border: 1px solid #cbd5e1;"><thead><tr>${headerCells}</tr></thead><tbody>${rowLines}</tbody></table>`;
}

// Helper to parse HTML table into TableData
function parseHtmlToTableData(html: string): TableData | null {
  if (!html || !html.includes('<table')) return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return null;

    const headers: string[] = [];
    const ths = table.querySelectorAll('th');
    if (ths.length > 0) {
      ths.forEach(th => headers.push(th.textContent?.trim() || ''));
    }

    const rows: string[][] = [];
    const trs = table.querySelectorAll('tbody tr, tr');
    trs.forEach(tr => {
      // Skip header row if already parsed
      if (tr.querySelector('th') && headers.length > 0) return;
      const tds = tr.querySelectorAll('td');
      if (tds.length > 0) {
        const rowData: string[] = [];
        tds.forEach(td => rowData.push(td.textContent?.trim() || ''));
        rows.push(rowData);
      }
    });

    // If no explicit <th> found, construct from first row
    if (headers.length === 0 && rows.length > 0) {
      const firstRow = rows.shift()!;
      return {
        headers: firstRow,
        rows
      };
    }

    if (headers.length > 0 || rows.length > 0) {
      return {
        headers: headers.length > 0 ? headers : ['Column 1', 'Column 2'],
        rows: rows.length > 0 ? rows : [['', '']]
      };
    }
  } catch (err) {
    console.error('Error parsing table HTML:', err);
  }

  return null;
}

export default function VisualTableEditor({
  initialHtml,
  onChange,
  onClear
}: VisualTableEditorProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [tableData, setTableData] = useState<TableData>(() => {
    if (initialHtml) {
      const parsed = parseHtmlToTableData(initialHtml);
      if (parsed) return parsed;
    }
    return matchPreset;
  });

  const [rawHtml, setRawHtml] = useState<string>(initialHtml || '');

  // Synchronize when initialHtml changes externally
  useEffect(() => {
    if (initialHtml && initialHtml !== tableDataToHtml(tableData)) {
      setRawHtml(initialHtml);
      const parsed = parseHtmlToTableData(initialHtml);
      if (parsed) {
        setTableData(parsed);
      }
    }
  }, [initialHtml]);

  // Update parent when tableData changes
  const updateTable = (newData: TableData) => {
    setTableData(newData);
    const html = tableDataToHtml(newData);
    setRawHtml(html);
    onChange(html);
  };

  const handleHeaderChange = (index: number, val: string) => {
    const nextHeaders = [...tableData.headers];
    nextHeaders[index] = val;
    updateTable({ ...tableData, headers: nextHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const nextRows = tableData.rows.map((row, ri) => {
      if (ri !== rowIndex) return row;
      const nextRow = [...row];
      nextRow[colIndex] = val;
      return nextRow;
    });
    updateTable({ ...tableData, rows: nextRows });
  };

  const addRow = () => {
    const emptyRow = new Array(tableData.headers.length).fill('');
    updateTable({
      ...tableData,
      rows: [...tableData.rows, emptyRow]
    });
  };

  const removeRow = (index: number) => {
    if (tableData.rows.length <= 1) return;
    const nextRows = tableData.rows.filter((_, i) => i !== index);
    updateTable({ ...tableData, rows: nextRows });
  };

  const addColumn = () => {
    const colNumber = tableData.headers.length + 1;
    const nextHeaders = [...tableData.headers, `Column ${colNumber}`];
    const nextRows = tableData.rows.map(row => [...row, '']);
    updateTable({
      headers: nextHeaders,
      rows: nextRows
    });
  };

  const removeColumn = (colIndex: number) => {
    if (tableData.headers.length <= 1) return;
    const nextHeaders = tableData.headers.filter((_, i) => i !== colIndex);
    const nextRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
    updateTable({
      headers: nextHeaders,
      rows: nextRows
    });
  };

  const applyPreset = (preset: TableData) => {
    updateTable(preset);
  };

  const handleRawHtmlChange = (newHtml: string) => {
    setRawHtml(newHtml);
    onChange(newHtml);
    const parsed = parseHtmlToTableData(newHtml);
    if (parsed) {
      setTableData(parsed);
    }
  };

  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 shadow-xs">
      {/* Header & Preset Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <TableIcon size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              Interactive Table / Matrix Editor
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Edit cells directly — no HTML coding or script needed
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'visual'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye size={12} />
              <span>Visual Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'code'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code size={12} />
              <span>HTML</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 size={13} />
            <span>Remove Table</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
        <span className="text-slate-400 font-bold shrink-0">Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset(matchPreset)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 hover:text-purple-600 text-slate-700 dark:text-slate-300 font-medium transition-colors shrink-0"
        >
          Match Column I & II
        </button>
        <button
          type="button"
          onClick={() => applyPreset(comparisonPreset)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 hover:text-purple-600 text-slate-700 dark:text-slate-300 font-medium transition-colors shrink-0"
        >
          2-Column Property List
        </button>
        <button
          type="button"
          onClick={() => applyPreset(threeColPreset)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 hover:text-purple-600 text-slate-700 dark:text-slate-300 font-medium transition-colors shrink-0"
        >
          3-Column Matrix
        </button>
      </div>

      {/* Main Table Grid View */}
      {viewMode === 'visual' ? (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs sm:text-sm border-collapse">
              {/* Header Row */}
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="w-8 p-2 text-center text-slate-400 font-normal">#</th>
                  {tableData.headers.map((header, ci) => (
                    <th key={ci} className="p-2 text-left border-l border-slate-200 dark:border-slate-800 min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={header}
                          onChange={e => handleHeaderChange(ci, e.target.value)}
                          placeholder={`Column ${ci + 1}`}
                          className="w-full px-2 py-1 text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        {tableData.headers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColumn(ci)}
                            title="Remove this column"
                            className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-10 p-2 text-center border-l border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={addColumn}
                      title="Add a new column"
                      className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody>
                {tableData.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="p-2 text-center font-bold text-slate-400 text-xs">
                      {ri + 1}
                    </td>
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-2 border-l border-slate-100 dark:border-slate-800/60">
                        <input
                          type="text"
                          value={cell}
                          onChange={e => handleCellChange(ri, ci, e.target.value)}
                          placeholder={`Row ${ri + 1}, Col ${ci + 1}`}
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center border-l border-slate-100 dark:border-slate-800/60">
                      {tableData.rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(ri)}
                          title="Delete this row"
                          className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Grid Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors"
            >
              <Plus size={14} />
              <span>+ Add Row</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              {tableData.rows.length} rows &times; {tableData.headers.length} columns
            </span>
          </div>
        </div>
      ) : (
        /* Raw HTML view */
        <div className="space-y-2">
          <textarea
            rows={4}
            value={rawHtml}
            onChange={e => handleRawHtmlChange(e.target.value)}
            placeholder="<table class='...'>...</table>"
            className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      )}
    </div>
  );
}
