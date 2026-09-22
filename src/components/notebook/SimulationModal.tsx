import React, { useState } from 'react';
import { X, ExternalLink, Atom, Play, Sparkles, Sliders, Check } from 'lucide-react';

interface SimulationPreset {
  id: string;
  category: 'physics' | 'math' | 'chemistry';
  title: string;
  provider: string;
  description: string;
  url: string;
  defaultHeight: string;
  badge: string;
}

const SIMULATION_PRESETS: SimulationPreset[] = [
  // Physics (PhET & HTML5)
  {
    id: 'phet-wave',
    category: 'physics',
    title: 'Wave on a String',
    provider: 'PhET Interactive Simulations',
    description: 'Explore wave properties, frequency, amplitude, damping, and tension on a string.',
    url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html',
    defaultHeight: '400px',
    badge: 'Physics'
  },
  {
    id: 'phet-circuit',
    category: 'physics',
    title: 'Circuit Construction Kit (DC)',
    provider: 'PhET Interactive Simulations',
    description: 'Build circuits with batteries, light bulbs, resistors, switches, and voltmeters.',
    url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
    defaultHeight: '420px',
    badge: 'Electrodynamics'
  },
  {
    id: 'phet-pendulum',
    category: 'physics',
    title: 'Pendulum Lab',
    provider: 'PhET Interactive Simulations',
    description: 'Analyze simple harmonic motion, period, gravity variation, and energy conservation.',
    url: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html',
    defaultHeight: '400px',
    badge: 'Mechanics'
  },
  {
    id: 'phet-faraday',
    category: 'physics',
    title: "Faraday's Electromagnetic Lab",
    provider: 'PhET Interactive Simulations',
    description: 'Investigate magnetic fields, electromagnets, transformers, and electromagnetic induction.',
    url: 'https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_all.html',
    defaultHeight: '420px',
    badge: 'Magnetism'
  },
  {
    id: 'phet-skate',
    category: 'physics',
    title: 'Energy Skate Park: Basics',
    provider: 'PhET Interactive Simulations',
    description: 'Learn conservation of kinetic, potential, and thermal energy on skate tracks.',
    url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
    defaultHeight: '400px',
    badge: 'Energy'
  },
  {
    id: 'phet-projectile',
    category: 'physics',
    title: 'Projectile Motion',
    provider: 'PhET Interactive Simulations',
    description: 'Launch cannonballs, adjust launch angle, initial speed, air resistance, and mass.',
    url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html',
    defaultHeight: '420px',
    badge: 'Kinematics'
  },

  // Mathematics (Desmos & GeoGebra)
  {
    id: 'desmos-graphing',
    category: 'math',
    title: 'Desmos 2D Graphing Calculator',
    provider: 'Desmos',
    description: 'Plot functions, polar curves, parametric equations, regressions, and derivatives.',
    url: 'https://www.desmos.com/calculator?embed',
    defaultHeight: '420px',
    badge: 'Calculus & Algebra'
  },
  {
    id: 'geogebra-3d',
    category: 'math',
    title: 'GeoGebra 3D Calculator',
    provider: 'GeoGebra',
    description: '3D mathematical geometry, vector surfaces, planes, spheres, and multivariable graphs.',
    url: 'https://www.geogebra.org/calculator',
    defaultHeight: '420px',
    badge: '3D Geometry'
  },
  {
    id: 'desmos-geometry',
    category: 'math',
    title: 'Desmos Geometry Tool',
    provider: 'Desmos',
    description: 'Interactive Euclidean geometric constructions, circles, polygons, and angles.',
    url: 'https://www.desmos.com/geometry?embed',
    defaultHeight: '400px',
    badge: 'Geometry'
  },

  // Chemistry (PhET)
  {
    id: 'phet-molecules',
    category: 'chemistry',
    title: 'Molecule Shapes (VSEPR)',
    provider: 'PhET Interactive Simulations',
    description: 'Rotate and build 3D molecules, check bond angles, electron geometry, and lone pairs.',
    url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html',
    defaultHeight: '420px',
    badge: 'Chemical Bonding'
  },
  {
    id: 'phet-atom',
    category: 'chemistry',
    title: 'Build an Atom',
    provider: 'PhET Interactive Simulations',
    description: 'Construct atoms from protons, neutrons, and electrons. Explore atomic number and ions.',
    url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html',
    defaultHeight: '400px',
    badge: 'Atomic Structure'
  }
];

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSimulation: (markdown: string) => void;
}

export default function SimulationModal({
  isOpen,
  onClose,
  onInsertSimulation
}: SimulationModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'physics' | 'math' | 'chemistry'>('all');
  
  // Custom simulation form state
  const [customTitle, setCustomTitle] = useState('');
  const [customUrlOrEmbed, setCustomUrlOrEmbed] = useState('');
  const [customWidth, setCustomWidth] = useState('100%');
  const [customHeight, setCustomHeight] = useState('400px');
  const [previewUrl, setPreviewUrl] = useState('');

  if (!isOpen) return null;

  const filteredPresets = SIMULATION_PRESETS.filter(p => 
    categoryFilter === 'all' || p.category === categoryFilter
  );

  const handleSelectPreset = (preset: SimulationPreset) => {
    const markdown = `\n:::iframe {title="${preset.title}" width=100% height=${preset.defaultHeight}}\n${preset.url}\n:::\n`;
    onInsertSimulation(markdown);
    onClose();
  };

  const handleInsertCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlOrEmbed.trim()) return;

    let extractedUrl = customUrlOrEmbed.trim();
    let extractedTitle = customTitle.trim() || 'Interactive Simulation';

    // If user pasted a full <iframe src="..." ...> embed code, parse it
    const iframeMatch = customUrlOrEmbed.match(/src=["']([^"']+)["']/);
    if (iframeMatch) {
      extractedUrl = iframeMatch[1];
      const titleMatch = customUrlOrEmbed.match(/title=["']([^"']+)["']/);
      if (titleMatch && !customTitle.trim()) {
        extractedTitle = titleMatch[1];
      }
    }

    const widthVal = customWidth.trim() || '100%';
    const heightVal = customHeight.trim() || '400px';

    const markdown = `\n:::iframe {title="${extractedTitle}" width=${widthVal} height=${heightVal}}\n${extractedUrl}\n:::\n`;
    onInsertSimulation(markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Atom size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Interactive Simulations & Iframes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Embed PhET Virtual Labs, Desmos Calculators, GeoGebra or custom HTML simulations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles size={14} />
              STEM Preset Labs ({SIMULATION_PRESETS.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders size={14} />
              Custom URL / Embed Code
            </button>
          </div>

          {activeTab === 'presets' && (
            <div className="flex items-center gap-1">
              {(['all', 'physics', 'math', 'chemistry'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPresets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {preset.title}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                      {preset.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                    <span className="font-mono">{preset.provider}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Insert Lab &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleInsertCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Simulation Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g., PhET Wave on a String, GeoGebra Prism Model"
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Embed URL or Raw HTML &lt;iframe&gt; Code
                </label>
                <textarea
                  rows={3}
                  value={customUrlOrEmbed}
                  onChange={e => {
                    setCustomUrlOrEmbed(e.target.value);
                    const match = e.target.value.match(/src=["']([^"']+)["']/);
                    if (match) setPreviewUrl(match[1]);
                    else if (e.target.value.startsWith('http')) setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://phet.colorado.edu/... or <iframe src='...'></iframe>"
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Accepts direct HTTPS links or copy-pasted iframe embed codes from PhET, Desmos, GeoGebra, Wolfram, YouTube, etc.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frame Width
                  </label>
                  <input
                    type="text"
                    value={customWidth}
                    onChange={e => setCustomWidth(e.target.value)}
                    placeholder="100%"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frame Height
                  </label>
                  <input
                    type="text"
                    value={customHeight}
                    onChange={e => setCustomHeight(e.target.value)}
                    placeholder="400px"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Preview frame if URL detected */}
              {previewUrl && (
                <div className="mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Live Preview Test
                  </span>
                  <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-white">
                    <iframe
                      src={previewUrl}
                      title="Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Check size={15} />
                  Insert Simulation
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 text-xs text-slate-500 flex items-center justify-between">
          <span>✨ Automatically generates QR Code & link poster when printing to PDF</span>
          <span className="font-mono text-[11px]">:::iframe syntax</span>
        </div>
      </div>
    </div>
  );
}
