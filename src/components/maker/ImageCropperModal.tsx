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
  Maximize2,
  ArrowRight,
  ArrowLeft,
  FileImage,
  RefreshCw,
  Layers,
  Sun,
  Contrast
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

  // Workflow Stage: 'CROP' -> 'OPTIMIZE'
  const [activeStage, setActiveStage] = useState<'CROP' | 'OPTIMIZE'>('CROP');

  // Cropper Controls State
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Cropped Base Image (Snapshot taken upon transitioning to OPTIMIZE)
  const [croppedBaseImg, setCroppedBaseImg] = useState<string>('');
  const [croppedBaseDims, setCroppedBaseDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Optimizer & Compressor Controls State
  const [selectedFilter, setSelectedFilter] = useState<ImageFilterType>('none');
  const [qualityLevel, setQualityLevel] = useState<number>(0.80);
  const [maxDimension, setMaxDimension] = useState<number>(1000);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');

  // Live Optimized Output State
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const [optimizedSize, setOptimizedSize] = useState<string>('');
  const [optimizedDims, setOptimizedDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState<string>('');
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);

  // Calculate original image size
  useEffect(() => {
    if (imageSrc) {
      setOriginalSize(formatDataUrlSize(imageSrc));
    }
  }, [imageSrc]);

  // Load Cropper.js and CSS dynamically if not present
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

    const styleId = 'cropper-touch-handles-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .cropper-point {
          width: 14px !important;
          height: 14px !important;
          opacity: 0.9 !important;
          background-color: #2563eb !important;
          border: 2.5px solid #ffffff !important;
          border-radius: 9999px !important;
          box-shadow: 0 2px 5px rgba(0,0,0,0.35) !important;
        }
        .cropper-point.point-se,
        .cropper-point.point-sw,
        .cropper-point.point-nw,
        .cropper-point.point-ne {
          width: 18px !important;
          height: 18px !important;
        }
        /* Mobile-friendly 44px touch targets */
        .cropper-point::after {
          content: '' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          min-width: 44px !important;
          min-height: 44px !important;
          width: 44px !important;
          height: 44px !important;
        }
      `;
      document.head.appendChild(style);
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

  // Initialize Cropper instance ONCE when script and image are ready.
  // CRITICAL: Notice this does NOT depend on qualityLevel, filter, or compression sliders!
  // This prevents the cropper from ever destroying and resetting when user starts compression.
  useEffect(() => {
    if (!isOpen || !isScriptLoaded || !imageRef.current) return;

    // Reset back to CROP stage on initial modal open
    setActiveStage('CROP');

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
      checkCrossOrigin: false
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
  }, [isOpen, isScriptLoaded, imageSrc]);

  // Snapshot current cropped canvas into croppedBaseImg when transitioning to OPTIMIZE stage
  const captureCroppedBase = useCallback((): string | null => {
    if (!cropperInstanceRef.current) return null;
    try {
      const canvas = cropperInstanceRef.current.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      if (canvas) {
        const base64 = canvas.toDataURL('image/png');
        setCroppedBaseImg(base64);
        setCroppedBaseDims({ width: canvas.width, height: canvas.height });
        return base64;
      }
    } catch (e) {
      console.error('Failed to capture cropped canvas', e);
    }
    return null;
  }, []);

  // Compute live optimized output from croppedBaseImg (or fallback to imageSrc)
  const runOptimization = useCallback(() => {
    const srcToUse = croppedBaseImg || imageSrc;
    if (!srcToUse) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        let destW = img.naturalWidth || 800;
        let destH = img.naturalHeight || 600;

        if (maxDimension > 0) {
          if (destW > destH && destW > maxDimension) {
            destH = Math.round((destH * maxDimension) / destW);
            destW = maxDimension;
          } else if (destH > maxDimension) {
            destW = Math.round((destW * maxDimension) / destH);
            destH = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = destW;
        canvas.height = destH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, destW, destH);

          if (selectedFilter !== 'none' || brightness !== 0 || contrast !== 0) {
            applyFiltersToCanvas(ctx, destW, destH, selectedFilter, brightness, contrast);
          }

          let formatMime = 'image/webp';
          if (outputFormat === 'jpeg') formatMime = 'image/jpeg';
          if (outputFormat === 'png') formatMime = 'image/png';

          let result = '';
          try {
            result = canvas.toDataURL(formatMime, qualityLevel);
            if (formatMime === 'image/webp' && !result.startsWith('data:image/webp')) {
              result = canvas.toDataURL('image/jpeg', qualityLevel);
            }
          } catch {
            result = canvas.toDataURL('image/jpeg', qualityLevel);
          }

          setOptimizedUrl(result);
          setOptimizedSize(formatDataUrlSize(result));
          setOptimizedDims({ width: destW, height: destH });
        }
      };
      img.src = srcToUse;
    }, 50);
  }, [croppedBaseImg, imageSrc, maxDimension, selectedFilter, brightness, contrast, outputFormat, qualityLevel]);

  // Re-run optimization whenever optimization parameters change or when croppedBaseImg updates
  useEffect(() => {
    if (activeStage === 'OPTIMIZE') {
      runOptimization();
    }
  }, [activeStage, croppedBaseImg, runOptimization]);

  // Cropper Toolbar Actions
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

  const handleResetCrop = () => {
    cropperInstanceRef.current?.reset();
    setAspectRatio(null);
    cropperInstanceRef.current?.setAspectRatio(NaN);
  };

  const handleAspectRatioChange = (ratioVal: number | null) => {
    setAspectRatio(ratioVal);
    cropperInstanceRef.current?.setAspectRatio(ratioVal === null ? NaN : ratioVal);
  };

  // Transition to Compression & Enhancement Stage
  const handleProceedToOptimize = () => {
    const base = captureCroppedBase();
    if (base) {
      setActiveStage('OPTIMIZE');
    }
  };

  // Complete and commit image to Question
  const handleApplyFinal = () => {
    if (activeStage === 'OPTIMIZE' && optimizedUrl) {
      onCropComplete(optimizedUrl);
      onClose();
      return;
    }

    // If still in CROP stage, capture and optimize directly
    if (cropperInstanceRef.current) {
      const canvas = cropperInstanceRef.current.getCroppedCanvas({
        maxWidth: maxDimension,
        maxHeight: maxDimension,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      if (canvas) {
        let result = '';
        try {
          result = canvas.toDataURL('image/webp', qualityLevel);
          if (!result.startsWith('data:image/webp')) {
            result = canvas.toDataURL('image/jpeg', qualityLevel);
          }
        } catch {
          result = canvas.toDataURL('image/jpeg', qualityLevel);
        }
        onCropComplete(result);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl flex flex-col max-h-[96vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CropIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Image Cropper & Compression Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {activeStage === 'CROP' ? 'Step 1: Crop' : 'Step 2: Optimize'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Crop boundaries cleanly, enhance document contrast, and compress for instant loading
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

        {/* Studio Pipeline Stages Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStage('CROP')}
              className={`px-3.5 py-1.5 font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeStage === 'CROP'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CropIcon size={14} />
              <span>1. Crop & Bounds</span>
            </button>
            <span className="text-slate-600">&rarr;</span>
            <button
              type="button"
              onClick={handleProceedToOptimize}
              className={`px-3.5 py-1.5 font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeStage === 'OPTIMIZE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>2. Compress & Enhance</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2 py-1">
            <span>Original: {originalSize || '...'}</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-emerald-400 font-bold">
              {activeStage === 'OPTIMIZE' && optimizedSize ? optimizedSize : 'Pending'}
            </span>
          </div>
        </div>

        {/* Viewport Canvas Stage */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 min-h-[250px] sm:min-h-[340px] max-h-[48vh] overflow-hidden select-none">
          {/* CROP VIEWPORT */}
          <div className={`w-full h-full flex items-center justify-center ${activeStage === 'CROP' ? 'block' : 'hidden'}`}>
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

          {/* OPTIMIZE VIEWPORT */}
          {activeStage === 'OPTIMIZE' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 relative">
              {optimizedUrl ? (
                <div className="max-w-full max-h-full flex flex-col items-center justify-center gap-2">
                  <div className="relative group max-h-[300px] flex items-center justify-center">
                    <img
                      src={showOriginalComparison ? (croppedBaseImg || imageSrc) : optimizedUrl}
                      alt="Processed Preview"
                      className="max-h-[280px] max-w-full object-contain rounded-xl border border-slate-800 shadow-2xl transition-all"
                    />
                    {showOriginalComparison && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow">
                        Showing Uncompressed Crop
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                    <span>Dimensions: <strong className="text-slate-200">{optimizedDims.width} × {optimizedDims.height} px</strong></span>
                    <span>&bull;</span>
                    <span>Quality: <strong className="text-slate-200">{Math.round(qualityLevel * 100)}%</strong></span>
                    <span>&bull;</span>
                    <span>Size: <strong className="text-emerald-400 font-bold">{optimizedSize}</strong></span>
                    {originalSize && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60">
                        High Speed Optimized
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                  <span>Calculating optimized preview...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STAGE CONTROLS TOOLBARS */}

        {/* CONTROLS FOR STAGE 1: CROP */}
        {activeStage === 'CROP' && (
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              {/* Aspect Ratio Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
                  <Layers size={13} className="text-blue-500" />
                  <span>Crop Aspect Ratio:</span>
                </span>
                {[
                  { label: 'Free', val: null },
                  { label: '1:1 Square', val: 1 },
                  { label: '4:3 Standard', val: 4 / 3 },
                  { label: '16:9 Wide', val: 16 / 9 },
                  { label: '3:2 Diagram', val: 3 / 2 }
                ].map(r => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => handleAspectRatioChange(r.val)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      aspectRatio === r.val
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Geometry Tools */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate(-90)}
                  title="Rotate Left 90°"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate(90)}
                  title="Rotate Right 90°"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleScaleX}
                  title="Flip Horizontal"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  <FlipHorizontal size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleScaleY}
                  title="Flip Vertical"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  <FlipVertical size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(0.1)}
                  title="Zoom In"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(-0.1)}
                  title="Zoom Out"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleResetCrop}
                  title="Reset Crop Box"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Bottom Proceed Button */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Adjust the crop box to frame your question diagram.
              </span>
              <button
                type="button"
                onClick={handleProceedToOptimize}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Proceed to Compress & Enhance</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* CONTROLS FOR STAGE 2: OPTIMIZE & COMPRESS */}
        {activeStage === 'OPTIMIZE' && (
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            
            {/* Filters Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Enhancement:</span>
                </span>
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'document_clean', label: '📄 Paper Clean' },
                  { id: 'bw_diagram', label: '📐 B&W Sharp' },
                  { id: 'grayscale', label: '⚪ Grayscale' },
                  { id: 'invert', label: '🌙 Invert (Dark)' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id as ImageFilterType)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedFilter === f.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">Format:</span>
                {(['webp', 'jpeg', 'png'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-2 py-0.5 text-xs font-bold uppercase rounded-md transition-colors ${
                      outputFormat === fmt
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Quality */}
              <div className="space-y-1 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Sliders size={12} className="text-blue-500" />
                    <span>Quality: {Math.round(qualityLevel * 100)}%</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {qualityLevel >= 0.85 ? 'HD' : qualityLevel >= 0.65 ? 'Balanced' : 'Compact'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.95"
                  step="0.05"
                  value={qualityLevel}
                  onChange={e => setQualityLevel(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>

              {/* Max Bound Resolution */}
              <div className="space-y-1 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Maximize2 size={12} className="text-purple-500" />
                    <span>Max Width/Height: {maxDimension}px</span>
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

              {/* Contrast / Brightness */}
              <div className="space-y-1 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Contrast size={12} className="text-amber-500" />
                    <span>Contrast: {contrast > 0 ? `+${contrast}` : contrast}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setContrast(0); setBrightness(0); }}
                    className="text-[10px] text-blue-500 hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={contrast}
                  onChange={e => setContrast(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('CROP')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Crop</span>
                </button>

                <button
                  type="button"
                  onMouseDown={() => setShowOriginalComparison(true)}
                  onMouseUp={() => setShowOriginalComparison(false)}
                  onTouchStart={() => setShowOriginalComparison(true)}
                  onTouchEnd={() => setShowOriginalComparison(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors select-none"
                >
                  Hold to Compare
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFinal}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <Check size={16} />
                  <span>Apply & Insert Image</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
