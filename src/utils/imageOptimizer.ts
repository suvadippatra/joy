// High-Performance Client-Side Image Optimizer, Compressor & Filter Engine

export type ImageFilterType = 'none' | 'grayscale' | 'bw_diagram' | 'invert' | 'document_clean';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  filter?: ImageFilterType;
  brightness?: number; // -50 to 50
  contrast?: number;   // -50 to 50
}

/**
 * Optimizes an uploaded File (supports PNG, JPEG, WebP, SVG, GIF, BMP)
 * For SVG: preserves pure vector markup
 * For GIF: preserves animation frames unless requested otherwise
 * For Bitmap: compresses and downscales to high-efficiency WebP/JPEG
 */
export async function optimizeImageFile(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1000,
    quality = 0.85,
    filter = 'none',
    brightness = 0,
    contrast = 0
  } = options;

  // 1. Direct handling for SVG vector files
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 2. Direct handling for Animated GIF files if no filters are applied
  if (
    (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) &&
    filter === 'none' &&
    brightness === 0 &&
    contrast === 0
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 3. For PNG, JPEG, WebP, or when filters/cropping are applied:
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const result = processAndCompressImage(img, {
            maxWidth,
            maxHeight,
            quality,
            filter,
            brightness,
            contrast
          });
          resolve(result);
        } catch (err) {
          // Fallback to original data URL if canvas manipulation fails
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image into memory'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Processes an HTMLImageElement or Canvas with dimension bounds, filters, and compression
 */
export function processAndCompressImage(
  source: HTMLImageElement | HTMLCanvasElement,
  options: ImageOptimizationOptions = {}
): string {
  const {
    maxWidth = 1200,
    maxHeight = 1000,
    quality = 0.85,
    filter = 'none',
    brightness = 0,
    contrast = 0
  } = options;

  let srcWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  let srcHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

  if (!srcWidth || !srcHeight) {
    srcWidth = 800;
    srcHeight = 600;
  }

  // Calculate proportional constrained dimensions
  let destWidth = srcWidth;
  let destHeight = srcHeight;

  if (destWidth > maxWidth) {
    destHeight = Math.round((destHeight * maxWidth) / destWidth);
    destWidth = maxWidth;
  }

  if (destHeight > maxHeight) {
    destWidth = Math.round((destWidth * maxHeight) / destHeight);
    destHeight = maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = destWidth;
  canvas.height = destHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw source image onto canvas
  ctx.drawImage(source, 0, 0, destWidth, destHeight);

  // Apply pixel filters if specified
  if (filter !== 'none' || brightness !== 0 || contrast !== 0) {
    applyFiltersToCanvas(ctx, destWidth, destHeight, filter, brightness, contrast);
  }

  // Try WebP first for ultra-high compression, fallback to JPEG
  try {
    const webpData = canvas.toDataURL('image/webp', quality);
    if (webpData.startsWith('data:image/webp')) {
      return webpData;
    }
  } catch {
    // Fallback
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Applies custom diagram enhancement filters (Clean Paper B&W, Grayscale, Invert, Brightness/Contrast)
 */
export function applyFiltersToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: ImageFilterType,
  brightness: number = 0,
  contrast: number = 0
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Pre-calculate contrast factor: contrast ranges from -50 to 50
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const bVal = (brightness / 100) * 255;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply brightness
    if (bVal !== 0) {
      r = Math.min(255, Math.max(0, r + bVal));
      g = Math.min(255, Math.max(0, g + bVal));
      b = Math.min(255, Math.max(0, b + bVal));
    }

    // Apply contrast
    if (contrast !== 0) {
      r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
    }

    // Apply specific filter
    if (filter === 'grayscale') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (filter === 'bw_diagram') {
      // High contrast B&W diagram enhancer: clears dirty paper noise to pure white, text to black
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      // High-gamma curve
      const sharp = gray > 175 ? 255 : gray < 90 ? 0 : Math.pow(gray / 175, 2) * 255;
      data[i] = sharp;
      data[i + 1] = sharp;
      data[i + 2] = sharp;
    } else if (filter === 'document_clean') {
      // Document Clean: Lightens paper background while preserving line details
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      let val = gray * 1.25;
      if (val > 235) val = 255;
      data[i] = Math.min(255, val);
      data[i + 1] = Math.min(255, val);
      data[i + 2] = Math.min(255, val);
    } else if (filter === 'invert') {
      // Dark mode inverted diagram
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    } else {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Calculates human readable size of a Base64/Data URI
 */
export function formatDataUrlSize(dataUrl: string): string {
  if (!dataUrl) return '0 KB';
  const stringLength = dataUrl.length - (dataUrl.indexOf(',') + 1);
  const sizeInBytes = Math.round(stringLength * (3 / 4));
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  }
  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}
