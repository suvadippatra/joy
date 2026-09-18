import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Check,
  X,
  Crop as CropIcon,
  Sparkles,
  Sliders,
  Eye,
  Maximize2
} from 'lucide-react';
import {
  ImageFilterType,
  applyFiltersToCanvas,
  formatDataUrlSize
} from '../../utils/imageOptimizer';

interface ImageCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export default function ImageCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete
}: ImageCropperModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperInstanceRef = useRef<any>(null);
  const debounceTimerRef = useRef<any>(null);

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ImageFilterType>('none');
  const [qualityLevel, setQualityLevel] = useState<number>(0.80);
  const [maxDimension, setMaxDimension] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<'CROP' | 'PREVIEW'>('CROP');
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');
  const [croppedSize, setCroppedSize] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<string>('');

  // Calculate original size
  useEffect(() => {
    if (imageSrc) {
      setOriginalSize(formatDataUrlSize(imageSrc));
    }
  }, [imageSrc]);

  // Dynamically load local Cropper.js and CSS if not already loaded
  useEffect(() => {
    if (!isOpen) return;

    const linkId = 'local-cropper-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `${import.meta.env.BASE_URL}libs/cropper.min.css`;
      document.head.appendChild(link);
    }

    if ((window as any).Cropper) {
      setIsScriptLoaded(true);
    } else {
      const scriptId = 'local-cropper-js';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `${import.meta.env.BASE_URL}libs/cropper.min.js`;
        script.onload = () => setIsScriptLoaded(true);
        document.body.appendChild(script);
      } else {
        script.onload = () => setIsScriptLoaded(true);
      }
    }
  }, [isOpen]);

  // Debounced live calculation of filtered/compressed output to prevent lag
  const updateEstimatedPreview = useCallback(() => {
    if (!cropperInstanceRef.current) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!cropperInstanceRef.current) return;
      try {
        const canvas = cropperInstanceRef.current.getCroppedCanvas({
          maxWidth: maxDimension,
          maxHeight: maxDimension,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx && selectedFilter !== 'none') {
            applyFiltersToCanvas(ctx, canvas.width, canvas.height, selectedFilter, 0, 0);
          }
          let compressed = '';
          try {
            compressed = canvas.toDataURL('image/webp', qualityLevel);
            if (!compressed.startsWith('data:image/webp')) {
              compressed = canvas.toDataURL('image/jpeg', qualityLevel);
            }
          } catch {
            compressed = canvas.toDataURL('image/jpeg', qualityLevel);
          }
          setLivePreviewUrl(compressed);
          setCroppedSize(formatDataUrlSize(compressed));
        }
      } catch (err) {
        console.warn('Preview calculation skipped', err);
      }
    }, 60);
  }, [selectedFilter, qualityLevel, maxDimension]);

  // Initialize Cropper once script and image are ready
  useEffect(() => {
    if (!isOpen || !isScriptLoaded || !imageRef.current) return;

    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.destroy();
    }

    const CropperClass = (window as any).Cropper;
    if (!CropperClass) return;

    cropperInstanceRef.current = new CropperClass(imageRef.current, {
      aspectRatio: aspectRatio === null ? NaN : aspectRatio,
      viewMode: 1,
      autoCropArea: 0.95,
      responsive: true,
      restore: false,
      checkCrossOrigin: false,
      crop() {
        updateEstimatedPreview();
      }
    });

    return () => {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
        cropperInstanceRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen, isScriptLoaded, imageSrc, aspectRatio, updateEstimatedPreview]);

  useEffect(() => {
    updateEstimatedPreview();
  }, [selectedFilter, qualityLevel, maxDimension, updateEstimatedPreview]);

  if (!isOpen) return null;

  const handleRotate = (deg: number) => {
    cropperInstanceRef.current?.rotate(deg);
  };

  const handleScaleX = () => {
    const current = cropperInstanceRef.current?.getData() || {};
    cropperInstanceRef.current?.scaleX((current.scaleX || 1) * -1);
  };

  const handleScaleY = () => {
    const current = cropperInstanceRef.current?.getData() || {};
    cropperInstanceRef.current?.scaleY((current.scaleY || 1) * -1);
  };

  const handleZoom = (ratio: number) => {
    cropperInstanceRef.current?.zoom(ratio);
  };

  const handleReset = () => {
    cropperInstanceRef.current?.reset();
    setSelectedFilter('none');
    setQualityLevel(0.80);
    setMaxDimension(1000);
  };

  const handleApplyCrop = () => {
    if (livePreviewUrl) {
      onCropComplete(livePreviewUrl);
      onClose();
      return;
    }

    if (!cropperInstanceRef.current) return;
    const canvas = cropperInstanceRef.current.getCroppedCanvas({
      maxWidth: maxDimension,
      maxHeight: maxDimension,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx && selectedFilter !== 'none') {
        applyFiltersToCanvas(ctx, canvas.width, canvas.height, selectedFilter, 0, 0);
      }

      let compressed = '';
      try {
        compressed = canvas.toDataURL('image/webp', qualityLevel);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', qualityLevel);
        }
      } catch {
        compressed = canvas.toDataURL('image/jpeg', qualityLevel);
      }

      onCropComplete(compressed);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl flex flex-col max-h-[94vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CropIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                Image Studio & Compression Optimizer
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Crop boundaries, enhance paper contrast, and compress for ultra-fast performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Studio View Mode Switcher */}
        <div className="px-5 pt-2 pb-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('CROP')}
              className={`px-3 py-1.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'CROP'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CropIcon size={14} />
              <span>Crop & Bounds</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'PREVIEW'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye size={14} />
              <span>Live Compressed Preview</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2 py-1">
            <span>Original: {originalSize || '...'}</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-emerald-400 font-bold">Optimized: {croppedSize || '...'}</span>
          </div>
        </div>

        {/* Cropper or Live Preview Viewport */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 min-h-[260px] sm:min-h-[340px] max-h-[46vh] overflow-hidden">
          {/* Cropper View */}
          <div className={`w-full h-full flex items-center justify-center ${activeTab === 'CROP' ? 'block' : 'hidden'}`}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source to crop"
              className="max-w-full max-h-full block opacity-0"
              onLoad={() => {
                if (imageRef.current) imageRef.current.style.opacity = '1';
              }}
            />
          </div>

          {/* Live Filtered & Compressed Preview View */}
          {activeTab === 'PREVIEW' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              {livePreviewUrl ? (
                <div className="max-w-full max-h-full flex flex-col items-center gap-2">
                  <img
                    src={livePreviewUrl}
                    alt="Processed Preview"
                    className="max-h-[300px] max-w-full object-contain rounded-xl border border-slate-800 shadow-lg"
                  />
                  <span className="text-xs text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                    Filter: <strong className="text-slate-200">{selectedFilter}</strong> &bull; Quality:{' '}
                    <strong className="text-slate-200">{Math.round(qualityLevel * 100)}%</strong> &bull; Size:{' '}
                    <strong className="text-emerald-400">{croppedSize}</strong>
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-sm">Generating live preview...</span>
              )}
            </div>
          )}
        </div>

        {/* Filter Selection Bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-500" />
              <span>Diagram Filter:</span>
            </span>
            {[
              { id: 'none', label: 'Original' },
              { id: 'bw_diagram', label: 'Clean B&W Scan' },
              { id: 'document_clean', label: 'Paper Boost' },
              { id: 'grayscale', label: 'Grayscale' },
              { id: 'invert', label: 'Invert (Dark)' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id as ImageFilterType)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ratio:</span>
            {[
              { label: 'Free', val: null },
              { label: '1:1', val: 1 },
              { label: '4:3', val: 4 / 3 },
              { label: '16:9', val: 16 / 9 }
            ].map(r => (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  setAspectRatio(r.val);
                  cropperInstanceRef.current?.setAspectRatio(r.val === null ? NaN : r.val);
                }}
                className={`px-2.5 py-0.5 text-xs font-bold rounded-lg transition-colors ${
                  aspectRatio === r.val
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Precision Compression & Resolution Sliders Bar (Anti-Lag, Smooth Control) */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Quality Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders size={13} className="text-blue-500" />
                <span>Compression Quality: {Math.round(qualityLevel * 100)}%</span>
              </span>
              <span className="text-slate-500 font-normal">
                {qualityLevel >= 0.85 ? 'High Fidelity' : qualityLevel >= 0.65 ? 'Balanced (Recommended)' : 'Max Compact'}
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={qualityLevel}
              onChange={e => setQualityLevel(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Max Dimension Bound Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Maximize2 size={13} className="text-purple-500" />
                <span>Max Resolution Bound: {maxDimension}px</span>
              </span>
              <span className="text-slate-500 font-normal">
                {maxDimension <= 600 ? 'Small Diagram' : maxDimension <= 1000 ? 'Standard HD' : 'Ultra HD'}
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="1600"
              step="100"
              value={maxDimension}
              onChange={e => setMaxDimension(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>
        </div>

        {/* Geometry & Transform Controls Toolbar */}
        <div className="px-5 py-2.5 bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              title="Rotate Left 90°"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              title="Rotate Right 90°"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              onClick={handleScaleX}
              title="Flip Horizontal"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <FlipHorizontal size={15} />
            </button>
            <button
              type="button"
              onClick={handleScaleY}
              title="Flip Vertical"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <FlipVertical size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              title="Zoom In"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 ml-1"
            >
              Reset
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tip: Switch to &ldquo;Live Compressed Preview&rdquo; tab to inspect high-contrast diagram clarity
          </span>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {croppedSize ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Memory Footprint: {croppedSize} (High Speed WebP/JPEG)
              </span>
            ) : (
              'Auto WebP/JPEG compression enabled'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Check size={16} />
              <span>Apply & Attach Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
