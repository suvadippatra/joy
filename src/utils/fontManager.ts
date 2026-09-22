import { GoogleFontMeta } from '../types/notebook';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'local' | 'google';
  isMonospace?: boolean;
}

export const LOCAL_FONTS: FontOption[] = [
  { id: 'katex-main', name: 'LaTeX Computer Modern (KaTeX)', family: "'KaTeX_Main', serif", category: 'local' },
  { id: 'katex-sans', name: 'LaTeX Sans-Serif', family: "'KaTeX_SansSerif', sans-serif", category: 'local' },
  { id: 'katex-math', name: 'LaTeX Math Italic', family: "'KaTeX_Math', serif", category: 'local' },
  { id: 'katex-mono', name: 'LaTeX Typewriter', family: "'KaTeX_Typewriter', monospace", category: 'local', isMonospace: true },
  { id: 'dm-serif', name: 'DM Serif Text', family: "'DM Serif Text', serif", category: 'local' },
  { id: 'inter', name: 'Inter (Clean Sans)', family: "'Inter', sans-serif", category: 'local' },
  { id: 'georgia', name: 'Georgia (Book Serif)', family: "Georgia, serif", category: 'local' },
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', Times, serif", category: 'local' },
  { id: 'courier', name: 'Courier New', family: "'Courier New', Courier, monospace", category: 'local', isMonospace: true },
];

export const POPULAR_GOOGLE_FONTS: GoogleFontMeta[] = [
  { family: 'EB Garamond', category: 'serif', description: 'Quintessential Renaissance academic typeface' },
  { family: 'Crimson Pro', category: 'serif', description: 'Sophisticated book and thesis typography' },
  { family: 'Merriweather', category: 'serif', description: 'Highly legible and sturdy textbook serif' },
  { family: 'Source Serif 4', category: 'serif', description: "Adobe's versatile academic reading serif" },
  { family: 'Cormorant Garamond', category: 'serif', description: 'Graceful, high-contrast traditional serif' },
  { family: 'Spectral', category: 'serif', description: "Google's dedicated long-form editorial serif" },
  { family: 'Bitter', category: 'serif', description: 'Contemporary slab serif designed for comfortable reading' },
  { family: 'Fira Code', category: 'monospace', description: 'Engineered monospace with mathematical ligatures' },
  { family: 'Inconsolata', category: 'monospace', description: 'Clean, humanist monospace for algorithms & math' },
  { family: 'Playfair Display', category: 'display', description: 'Refined, high-contrast display serif for titles' },
  { family: 'Cinzel', category: 'display', description: 'Classical Roman inscriptional proportions' },
  { family: 'Lexend', category: 'sans-serif', description: 'Scientifically engineered for maximum reading speed' },
  { family: 'Outfit', category: 'sans-serif', description: 'Geometric, futuristic modern headings' },
  { family: 'Caveat', category: 'handwriting', description: 'Natural teacher handwritten lecture notes' },
];

const loadedFontsSet = new Set<string>();

/**
 * Dynamically loads a Google Font by injecting a <link> tag into document.head
 */
export function loadGoogleFont(fontFamily: string): boolean {
  if (!fontFamily) return false;
  const cleanFamily = fontFamily.replace(/['"]/g, '').trim();
  
  // Check if already loaded
  const linkId = `gfont-${cleanFamily.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(linkId) || loadedFontsSet.has(cleanFamily)) {
    return true;
  }

  try {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const encoded = encodeURIComponent(cleanFamily);
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
    loadedFontsSet.add(cleanFamily);
    return true;
  } catch (err) {
    console.error(`Failed to load Google Font: ${cleanFamily}`, err);
    return false;
  }
}

/**
 * Preloads all custom fonts saved in a document
 */
export function preloadDocumentFonts(customFonts: string[]) {
  if (!customFonts || !Array.isArray(customFonts)) return;
  customFonts.forEach(font => loadGoogleFont(font));
}
