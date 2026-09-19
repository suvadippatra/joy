/**
 * Audio Optimizer & Size Validator Utility for CBT Tests
 * Enforces strict size limits and audio format checks to prevent HTML file bloat.
 */

export const MAX_AUDIO_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB strict limit per audio file

export interface AudioValidationResult {
  valid: boolean;
  error?: string;
  dataUrl?: string;
  sizeKb?: number;
}

/**
 * Validates and converts an uploaded audio file (mp3, wav, ogg, aac, m4a, webm) to Base64 data URL
 * Enforces a strict 2MB maximum size rule for offline CBT test embedding.
 */
export async function validateAndProcessAudioFile(file: File): Promise<AudioValidationResult> {
  if (!file) {
    return { valid: false, error: 'No audio file provided' };
  }

  // 1. Check audio MIME type or extension
  const validMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/webm'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'webm'];

  if (!validMimeTypes.includes(file.type) && !validExts.includes(ext)) {
    return {
      valid: false,
      error: 'Unsupported audio format. Please upload MP3, WAV, OGG, AAC, M4A, or WEBM audio files.'
    };
  }

  // 2. Strict Size Limit Rule (2 MB)
  const fileSizeKb = Math.round(file.size / 1024);
  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Audio file (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 2 MB limit for embedded CBT tests. Please compress or trim the audio file.`,
      sizeKb: fileSizeKb
    };
  }

  // 3. Read file as Base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        valid: true,
        dataUrl: reader.result as string,
        sizeKb: fileSizeKb
      });
    };
    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Failed to read audio file from disk.'
      });
    };
    reader.readAsDataURL(file);
  });
}
