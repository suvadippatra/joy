import QRCode from 'qrcode';

/**
 * Generates an SVG string representation of a QR Code for offline vector rendering.
 * Falls back to a clean placeholder if generation encounters an error.
 */
export function generateQrCodeSvg(text: string, size: number = 80): string {
  try {
    let svgOutput = '';
    // QRCode.toString with callback or sync
    QRCode.toString(text, {
      type: 'svg',
      margin: 1,
      width: size,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }, (err, string) => {
      if (!err && string) {
        svgOutput = string;
      }
    });

    if (svgOutput) {
      return svgOutput;
    }
  } catch (e) {
    console.warn('QR Code generation error:', e);
  }

  // Fallback minimalist vector icon
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/>
      <path d="M12 7v4M10 12h4M12 16v1"/>
    </svg>
  `;
}
