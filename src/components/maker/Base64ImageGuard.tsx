import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Eye,
  EyeOff,
  Crop as CropIcon,
  RefreshCw,
  Trash2,
  Clock,
  ZoomIn,
  X,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { formatDataUrlSize } from '../../utils/imageOptimizer';

interface Base64ImageGuardProps {
  imageSrc: string;
  label?: string;
  onOpenStudio?: () => void;
  onReplaceImage?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  compact?: boolean;
}

export default function Base64ImageGuard({
  imageSrc,
  label = 'Diagram',
  onOpenStudio,
  onReplaceImage,
  onRemoveImage,
  compact = false
}: Base64ImageGuardProps) {
  const [isViewing, setIsViewing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const timerRef = useRef<any>(null);

  const approxSize = formatDataUrlSize(imageSrc);

  // 10-second auto-hide countdown
  useEffect(() => {
    if (isViewing) {
      setSecondsRemaining(10);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsViewing(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isViewing]);

  if (!imageSrc) return null;

  if (imageSrc === 'PLACEHOLDER') {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 p-3 w-full transition-all">
        <div className="flex items-center gap-2.5 text-xs font-bold text-amber-800 dark:text-amber-200">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-xs sm:text-sm">Diagram Image Required</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-normal">
              This {label.toLowerCase()} contains an <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">[IMAGE]</code> placeholder.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {onReplaceImage && (
            <label className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
              <Upload size={14} />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp,.bmp"
                className="hidden"
                onChange={onReplaceImage}
              />
            </label>
          )}

          {onRemoveImage && (
            <button
              type="button"
              onClick={onRemoveImage}
              className="p-1.5 text-amber-700 dark:text-amber-300 hover:text-red-500 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              title="Remove Placeholder"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2.5 transition-all w-fit max-w-full">
      {/* Control Bar: Compact Badge + Actions */}
      <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-900/40">
          <ImageIcon size={14} className="shrink-0" />
          <span>{label}</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 bg-blue-200/50 dark:bg-blue-900/50 rounded-sm">
            {approxSize}
          </span>
        </div>

        {/* View (10s) Button */}
        <button
          type="button"
          onClick={() => setIsViewing(!isViewing)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            isViewing
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-blue-600'
          }`}
          title={isViewing ? 'Hide image preview' : 'View image (auto-hides after 10s to save memory)'}
        >
          {isViewing ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{isViewing ? `Hide (${secondsRemaining}s)` : 'View (10s)'}</span>
        </button>

        {/* Studio Button */}
        {onOpenStudio && (
          <button
            type="button"
            onClick={onOpenStudio}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-blue-600 text-xs font-bold transition-colors"
            title="Open Image Studio (Crop, Filter & Compress)"
          >
            <CropIcon size={13} />
            <span>Studio</span>
          </button>
        )}

        {/* Replace Button */}
        {onReplaceImage && (
          <label
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-blue-600 text-xs font-bold cursor-pointer transition-colors"
            title="Replace with another image"
          >
            <RefreshCw size={13} />
            <span>Replace</span>
            <input
              type="file"
              accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp,.bmp"
              className="hidden"
              onChange={onReplaceImage}
            />
          </label>
        )}

        {/* Remove Button */}
        {onRemoveImage && (
          <button
            type="button"
            onClick={onRemoveImage}
            className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete Image"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Temporary Image Preview (Only Mounted When Active) */}
      {isViewing && (
        <div className="relative mt-1 p-2 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col items-center gap-2 animate-in fade-in duration-150">
          <div className="relative group max-h-[260px] overflow-hidden rounded-lg">
            <img
              src={imageSrc}
              alt="Attached Diagram"
              className="max-h-[240px] w-auto max-w-full object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100 text-xs font-bold flex items-center gap-1"
            >
              <ZoomIn size={13} />
              <span>Zoom</span>
            </button>
          </div>

          {/* Countdown & Memory Safe Banner */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Clock size={12} />
              <span>Auto-hiding in {secondsRemaining}s (Memory Saver)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsViewing(false)}
              className="text-xs text-slate-400 hover:text-white underline font-semibold"
            >
              Close Now
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Lightbox if requested */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={imageSrc}
              alt="Enlarged Diagram"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-slate-800"
            />
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
