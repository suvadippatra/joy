export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'B5' | 'Custom';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';
export type PaperRuling = 'plain' | 'ruled' | 'grid' | 'dots' | 'ivory';
export type ImageAlignment = 'block-center' | 'float-left' | 'float-right' | 'inline';

export interface PageMargins {
  top: number; // in mm
  bottom: number;
  left: number;
  right: number;
}

export interface PageNumberingConfig {
  enabled: boolean;
  format: 'X' | 'Page X of Y' | '- X -' | 'Page X';
  position: 'bottom-center' | 'bottom-right' | 'top-right';
}

export interface RunningHeaderConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
}

export interface PageSettings {
  paperSize: PaperSize;
  customWidthMm: number;
  customHeightMm: number;
  orientation: PageOrientation;
  margins: PageMargins;
  marginPreset: MarginPreset;
  pageNumbering: PageNumberingConfig;
  runningHeader: RunningHeaderConfig;
  paperRuling: PaperRuling;
  columns: 1 | 2;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
}

export interface GoogleFontMeta {
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  weights?: string;
  description?: string;
}

export interface DocumentAsset {
  id: string;
  name: string;
  mimeType: string;
  sizeFormatted: string;
  dataUrl: string; // Base64 data stored here, outside the editor text
  filter?: string;
  widthPercent?: number;
  alignment?: ImageAlignment;
  isAnimatedGif?: boolean;
}

export interface NotebookDocument {
  id: string;
  title: string;
  author: string;
  subject: string;
  content: string;
  pageSettings: PageSettings;
  customFonts: string[];
  assets?: Record<string, DocumentAsset>;
  createdAt: string;
  updatedAt: string;
}

export const PAPER_DIMENSIONS: Record<Exclude<PaperSize, 'Custom'>, { width: number; height: number; name: string }> = {
  A4: { width: 210, height: 297, name: 'A4 (210 × 297 mm)' },
  Letter: { width: 215.9, height: 279.4, name: 'Letter (8.5 × 11 in)' },
  Legal: { width: 215.9, height: 355.6, name: 'Legal (8.5 × 14 in)' },
  B5: { width: 176, height: 250, name: 'B5 (176 × 250 mm)' }
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  paperSize: 'A4',
  customWidthMm: 210,
  customHeightMm: 297,
  orientation: 'portrait',
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  },
  marginPreset: 'normal',
  pageNumbering: {
    enabled: true,
    format: 'Page X of Y',
    position: 'bottom-center'
  },
  runningHeader: {
    enabled: true,
    title: '',
    subtitle: ''
  },
  paperRuling: 'plain',
  columns: 1,
  fontFamily: "'KaTeX_Main', serif",
  fontSizePt: 11,
  lineHeight: 1.55
};
