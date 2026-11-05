import localforage from 'localforage';

const FONT_CACHE_KEY = 'cbt_katex_fonts_b64_v2';

interface FontDefinition {
  family: string;
  weight: string;
  style: string;
  file: string;
}

const KATEX_CORE_FONTS: FontDefinition[] = [
  { family: 'KaTeX_Main', weight: 'normal', style: 'normal', file: 'KaTeX_Main-Regular.woff2' },
  { family: 'KaTeX_Main', weight: 'bold', style: 'normal', file: 'KaTeX_Main-Bold.woff2' },
  { family: 'KaTeX_Main', weight: 'normal', style: 'italic', file: 'KaTeX_Main-Italic.woff2' },
  { family: 'KaTeX_Main', weight: 'bold', style: 'italic', file: 'KaTeX_Main-BoldItalic.woff2' },
  { family: 'KaTeX_Math', weight: 'normal', style: 'italic', file: 'KaTeX_Math-Italic.woff2' },
  { family: 'KaTeX_Math', weight: 'bold', style: 'italic', file: 'KaTeX_Math-BoldItalic.woff2' },
  { family: 'KaTeX_AMS', weight: 'normal', style: 'normal', file: 'KaTeX_AMS-Regular.woff2' },
  { family: 'KaTeX_Caligraphic', weight: 'normal', style: 'normal', file: 'KaTeX_Caligraphic-Regular.woff2' },
  { family: 'KaTeX_SansSerif', weight: 'normal', style: 'normal', file: 'KaTeX_SansSerif-Regular.woff2' },
  { family: 'KaTeX_SansSerif', weight: 'bold', style: 'normal', file: 'KaTeX_SansSerif-Bold.woff2' },
  { family: 'KaTeX_Size1', weight: 'normal', style: 'normal', file: 'KaTeX_Size1-Regular.woff2' },
  { family: 'KaTeX_Size2', weight: 'normal', style: 'normal', file: 'KaTeX_Size2-Regular.woff2' },
  { family: 'KaTeX_Size3', weight: 'normal', style: 'normal', file: 'KaTeX_Size3-Regular.woff2' },
  { family: 'KaTeX_Size4', weight: 'normal', style: 'normal', file: 'KaTeX_Size4-Regular.woff2' },
  { family: 'KaTeX_Typewriter', weight: 'normal', style: 'normal', file: 'KaTeX_Typewriter-Regular.woff2' },
];

let memoryFontMap: Record<string, string> | null = null;
let warmupPromise: Promise<Record<string, string>> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize))));
  }
  return btoa(chunks.join(''));
}

export async function warmUpKatexFontCache(): Promise<Record<string, string>> {
  if (memoryFontMap && Object.keys(memoryFontMap).length > 0) {
    return memoryFontMap;
  }
  if (warmupPromise) {
    return warmupPromise;
  }

  warmupPromise = (async () => {
    try {
      const cached = await localforage.getItem<Record<string, string>>(FONT_CACHE_KEY);
      if (cached && cached['KaTeX_Main-Regular.woff2']) {
        memoryFontMap = cached;
        return cached;
      }
    } catch {
      // ignore IndexedDB errors
    }

    const baseUrl =
      typeof window !== 'undefined'
        ? new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
        : '/';

    const fetchedMap: Record<string, string> = {};
    await Promise.all(
      KATEX_CORE_FONTS.map(async (f) => {
        try {
          const res = await fetch(`${baseUrl}libs/fonts/${f.file}`, { cache: 'force-cache' });
          if (!res.ok) return;
          const buf = await res.arrayBuffer();
          if (buf.byteLength > 0) {
            fetchedMap[f.file] = `data:font/woff2;base64,${arrayBufferToBase64(buf)}`;
          }
        } catch {
          // ignore single font failure
        }
      })
    );

    if (Object.keys(fetchedMap).length > 0) {
      memoryFontMap = fetchedMap;
      try {
        await localforage.setItem(FONT_CACHE_KEY, fetchedMap);
      } catch {
        // ignore storage quota errors
      }
    }
    return fetchedMap;
  })();

  return warmupPromise;
}

/**
 * Generates self-contained @font-face rules with `font-display: swap` and embedded Base64 woff2 data URIs
 * so sandboxed `about:srcdoc` iframes render KaTeX_Main and math glyphs immediately both online and offline
 * without Flash of Invisible Text (FOIT).
 */
export function getOfflineKatexFontCss(assetBase: string): string {
  const map = memoryFontMap || {};
  return KATEX_CORE_FONTS.map((f) => {
    const dataUri = map[f.file];
    const urlUrl = `${assetBase}libs/fonts/${f.file}`;
    const srcValue = dataUri
      ? `url("${dataUri}") format("woff2"), url("${urlUrl}") format("woff2")`
      : `url("${urlUrl}") format("woff2")`;
    return `@font-face {
  font-family: '${f.family}';
  src: ${srcValue};
  font-weight: ${f.weight};
  font-style: ${f.style};
  font-display: swap;
}`;
  }).join('\n');
}
