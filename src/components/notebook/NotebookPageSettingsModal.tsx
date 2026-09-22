import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, FileText, Check, Layout, Columns, Hash, Sparkles, BookOpen, Compass, Layers } from 'lucide-react';
import { PageSettings, PAPER_DIMENSIONS, PaperSize, MarginPreset, PageOrientation, PaperRuling } from '../../types/notebook';
import { NOTEBOOK_TEMPLATES } from '../../data/notebookTemplates';

interface NotebookPageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PageSettings;
  onUpdateSettings: (newSettings: PageSettings) => void;
  onLoadTemplate?: (templateKey: string) => void;
}

export default function NotebookPageSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onLoadTemplate
}: NotebookPageSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'page' | 'templates' | 'typography'>('page');

  if (!isOpen) return null;

  const handlePaperSizeChange = (size: PaperSize) => {
    if (size !== 'Custom') {
      const dim = PAPER_DIMENSIONS[size];
      onUpdateSettings({
        ...settings,
        paperSize: size,
        customWidthMm: dim.width,
        customHeightMm: dim.height
      });
    } else {
      onUpdateSettings({ ...settings, paperSize: 'Custom' });
    }
  };

  const handleMarginPresetChange = (preset: MarginPreset) => {
    let margins = { ...settings.margins };
    if (preset === 'normal') {
      margins = { top: 20, bottom: 20, left: 20, right: 20 };
    } else if (preset === 'narrow') {
      margins = { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 };
    } else if (preset === 'wide') {
      margins = { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 };
    }
    onUpdateSettings({
      ...settings,
      marginPreset: preset,
      margins
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Document Settings &amp; Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure physical paper dimensions, academic templates, margins, and typography.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          {[
            { id: 'page', label: 'Paper & Layout', icon: <FileText size={14} /> },
            { id: 'templates', label: 'Academic Templates', icon: <BookOpen size={14} /> },
            { id: 'typography', label: 'Ruling & Typography', icon: <Layers size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: PAPER & LAYOUT */}
          {activeTab === 'page' && (
            <div className="space-y-5">
              {/* Paper Size & Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" />
                  <span>Paper Standard &amp; Dimensions</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['A4', 'Letter', 'Legal', 'B5'] as PaperSize[]).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePaperSizeChange(size)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        settings.paperSize === size
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{size}</div>
                      <div className="text-[10px] text-slate-400">
                        {PAPER_DIMENSIONS[size].width} × {PAPER_DIMENSIONS[size].height} mm
                      </div>
                    </button>
                  ))}
                </div>

                {/* Orientation Toggle */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Orientation:</span>
                  <div className="flex gap-2">
                    {(['portrait', 'landscape'] as PageOrientation[]).map(o => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, orientation: o })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                          settings.orientation === o
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout size={14} className="text-blue-500" />
                  <span>Page Margins</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(['normal', 'narrow', 'wide'] as MarginPreset[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMarginPresetChange(m)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold capitalize transition-colors ${
                        settings.marginPreset === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m} ({m === 'normal' ? '20mm' : m === 'narrow' ? '12.7mm' : '25.4mm'})
                    </button>
                  ))}
                </div>

                {/* Custom Margins Inputs */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {(['top', 'bottom', 'left', 'right'] as const).map(side => (
                    <div key={side}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{side} (mm)</span>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        value={settings.margins[side]}
                        onChange={e => onUpdateSettings({
                          ...settings,
                          marginPreset: 'custom',
                          margins: {
                            ...settings.margins,
                            [side]: Number(e.target.value) || 0
                          }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Columns */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Columns size={14} className="text-blue-500" />
                  <span>Column Layout</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2].map(cols => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, columns: cols as 1 | 2 })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        settings.columns === cols
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cols === 1 ? 'Single Column (Standard)' : 'Two Columns (Academic Paper)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Running Header */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Running Header (Top of each page)
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.runningHeader.enabled}
                    onChange={e => onUpdateSettings({
                      ...settings,
                      runningHeader: { ...settings.runningHeader, enabled: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                {settings.runningHeader.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Header Title (e.g. Physics Revision)..."
                      value={settings.runningHeader.title}
                      onChange={e => onUpdateSettings({
                        ...settings,
                        runningHeader: { ...settings.runningHeader, title: e.target.value }
                      })}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle / Chapter tag..."
                      value={settings.runningHeader.subtitle}
                      onChange={e => onUpdateSettings({
                        ...settings,
                        runningHeader: { ...settings.runningHeader, subtitle: e.target.value }
                      })}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Page Numbers */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={14} className="text-blue-500" />
                    <span>Page Numbering</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.pageNumbering.enabled}
                    onChange={e => onUpdateSettings({
                      ...settings,
                      pageNumbering: { ...settings.pageNumbering, enabled: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                {settings.pageNumbering.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={settings.pageNumbering.format}
                      onChange={e => onUpdateSettings({
                        ...settings,
                        pageNumbering: { ...settings.pageNumbering, format: e.target.value as any }
                      })}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Page X of Y">Page X of Y</option>
                      <option value="Page X">Page X</option>
                      <option value="X">X</option>
                      <option value="- X -">- X -</option>
                    </select>
                    <select
                      value={settings.pageNumbering.position}
                      onChange={e => onUpdateSettings({
                        ...settings,
                        pageNumbering: { ...settings.pageNumbering, position: e.target.value as any }
                      })}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load a pre-formatted academic template with structured theorems, formula boxes, and live tables:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(NOTEBOOK_TEMPLATES).map(([key, tpl]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col justify-between gap-3 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                        <BookOpen size={13} />
                        <span>{tpl.subject}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                        {tpl.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onLoadTemplate) {
                          onLoadTemplate(key);
                          onClose();
                        }
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Load This Template</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY & RULING */}
          {activeTab === 'typography' && (
            <div className="space-y-5">
              {/* Paper Ruling Patterns */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-500" />
                  <span>Paper Background &amp; Ruling Style</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'plain', label: 'Plain White', sub: 'Standard sheet' },
                    { id: 'ruled', label: 'Lined Ruling', sub: 'College notebook' },
                    { id: 'grid', label: 'Grid Graph', sub: 'Math & physics' },
                    { id: 'dots', label: 'Dot Matrix', sub: 'Bullet layout' },
                    { id: 'ivory', label: 'Vintage Ivory', sub: 'Warm tint' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, paperRuling: r.id as PaperRuling })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        settings.paperRuling === r.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Document Font Size & Line Height */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Base Body Font Size (pt)
                  </span>
                  <input
                    type="number"
                    min={9}
                    max={16}
                    step={0.5}
                    value={settings.fontSizePt || 11}
                    onChange={e => onUpdateSettings({ ...settings, fontSizePt: parseFloat(e.target.value) || 11 })}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Line Spacing (Relative)
                  </span>
                  <input
                    type="number"
                    min={1.2}
                    max={2.2}
                    step={0.05}
                    value={settings.lineHeight || 1.55}
                    onChange={e => onUpdateSettings({ ...settings, lineHeight: parseFloat(e.target.value) || 1.55 })}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
