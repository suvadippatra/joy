import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Check, X, Crop as CropIcon } from 'lucide-react';

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
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [croppedSize, setCroppedSize] = useState<string>('');

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
        // Debounce estimate size
        const canvas = cropperInstanceRef.current?.getCroppedCanvas({ maxWidth: 1000, maxHeight: 800 });
        if (canvas) {
          const approxBytes = Math.round((canvas.toDataURL('image/jpeg', 0.85).length * 3) / 4);
          setCroppedSize(`${Math.round(approxBytes / 1024)} KB`);
        }
      }
    });

    return () => {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
        cropperInstanceRef.current = null;
      }
    };
  }, [isOpen, isScriptLoaded, imageSrc, aspectRatio]);

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
  };

  const handleApplyCrop = () => {
    if (!cropperInstanceRef.current) return;
    const canvas = cropperInstanceRef.current.getCroppedCanvas({
      maxWidth: 1200,
      maxHeight: 1000,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    if (canvas) {
      // Compress to high quality WebP/JPEG for memory efficiency
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      onCropComplete(base64);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl flex flex-col max-h-[92vh] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CropIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">Image Precision Cropper</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Crop, orient, and compress images for zero-lag test rendering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Viewport Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 min-h-[300px] sm:min-h-[420px] max-h-[55vh] overflow-hidden">
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

        {/* Controls Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Ratio:</span>
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
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  aspectRatio === r.val
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Transform Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              title="Rotate Left 90°"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              title="Rotate Right 90°"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RotateCw size={16} />
            </button>
            <button
              type="button"
              onClick={handleScaleX}
              title="Flip Horizontal"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <FlipHorizontal size={16} />
            </button>
            <button
              type="button"
              onClick={handleScaleY}
              title="Flip Vertical"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <FlipVertical size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              title="Zoom In"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              title="Zoom Out"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ZoomOut size={16} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {croppedSize ? (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Estimated memory size: {croppedSize}
              </span>
            ) : (
              'High quality compression auto-applied'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
