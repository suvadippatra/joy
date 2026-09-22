import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  Upload,
  Crop as CropIcon,
  X,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  Trash2,
  Edit3,
  Copy,
  Plus
} from 'lucide-react';
import ImageCropperModal from '../maker/ImageCropperModal';
import { ImageAlignment, DocumentAsset } from '../../types/notebook';
import {
  ImageFilterType,
  applyFiltersToCanvas,
  formatDataUrlSize
} from '../../utils/imageOptimizer';

interface NotebookImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage?: (imageMarkdown: string) => void;
  onInsertAsset?: (asset: DocumentAsset, markdownToken: string) => void;
  onUpdateAsset?: (asset: DocumentAsset) => void;
  onDeleteAsset?: (assetId: string) => void;
  assets?: Record<string, DocumentAsset>;
  initialEditAssetId?: string | null;
}

export default function NotebookImageModal({
  isOpen,
  onClose,
  onInsertImage,
  onInsertAsset,
  onUpdateAsset,
  onDeleteAsset,
  assets = {},
  initialEditAssetId = null
}: NotebookImageModalProps) {
  const assetList = Object.values(assets);
  const [activeTab, setActiveTab] = useState<'gallery' | 'studio'>(
    initialEditAssetId ? 'studio' : (assetList.length > 0 ? 'gallery' : 'studio')
  );

  const [editingAssetId, setEditingAssetId] = useState<string | null>(initialEditAssetId);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalName, setOriginalName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [alignment, setAlignment] = useState<ImageAlignment>('block-center');
  const [widthPercent, setWidthPercent] = useState<number>(75);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // GIF handling
  const [isGif, setIsGif] = useState<boolean>(false);
  const [preserveGifAnimation, setPreserveGifAnimation] = useState<boolean>(true);

  // Real-time Compression & Filters
  const [qualityLevel, setQualityLevel] = useState<number>(0.82);
  const [selectedFilter, setSelectedFilter] = useState<ImageFilterType>('none');
  const [originalSizeStr, setOriginalSizeStr] = useState<string>('');
  const [compressedSrc, setCompressedSrc] = useState<string>('');
  const [compressedSizeStr, setCompressedSizeStr] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Setup initial asset for editing if specified
  useEffect(() => {
    if (isOpen) {
      if (initialEditAssetId && assets[initialEditAssetId]) {
        loadAssetForEditing(assets[initialEditAssetId]);
      } else if (assetList.length > 0 && !imageSrc) {
        setActiveTab('gallery');
      } else if (!imageSrc) {
        setActiveTab('studio');
      }
    } else {
      setEditingAssetId(null);
      setImageSrc('');
      setOriginalName('');
      setCaption('');
      setIsGif(false);
      setPreserveGifAnimation(true);
      setCompressedSrc('');
      setSelectedFilter('none');
      setQualityLevel(0.82);
    }
  }, [isOpen, initialEditAssetId]);

  const loadAssetForEditing = (asset: DocumentAsset) => {
    setEditingAssetId(asset.id);
    setImageSrc(asset.dataUrl);
    setOriginalName(asset.name || 'image.png');
    setCaption(asset.name || '');
    setAlignment(asset.alignment || 'block-center');
    setWidthPercent(asset.widthPercent || 75);
    const filter = (asset.filter as ImageFilterType) || 'none';
    setSelectedFilter(filter);
    
    const isDetectedGif = !!asset.isAnimatedGif || asset.dataUrl.startsWith('data:image/gif');
    setIsGif(isDetectedGif);
    setPreserveGifAnimation(isDetectedGif);

    const origSize = formatDataUrlSize(asset.dataUrl);
    setOriginalSizeStr(origSize);
    setCompressedSrc(asset.dataUrl);
    setCompressedSizeStr(origSize);
    setActiveTab('studio');
  };

  // Handle image load & compute original size
  const processNewImage = (dataUrl: string, fileName?: string, isFileGif: boolean = false) => {
    setEditingAssetId(null);
    setImageSrc(dataUrl);
    setOriginalName(fileName || 'academic_diagram.png');
    const isDetectedGif = isFileGif || dataUrl.startsWith('data:image/gif');
    setIsGif(isDetectedGif);
    setPreserveGifAnimation(isDetectedGif);

    const origSize = formatDataUrlSize(dataUrl);
    setOriginalSizeStr(origSize);
    setCompressedSrc(dataUrl);
    setCompressedSizeStr(origSize);
    setActiveTab('studio');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isGifFile = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      processNewImage(result, file.name, isGifFile);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const isGifFile = file.type === 'image/gif';
          const reader = new FileReader();
          reader.onload = (evt) => {
            const result = evt.target?.result as string;
            processNewImage(result, file.name || 'pasted_image.png', isGifFile);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const isGifFile = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        processNewImage(result, file.name, isGifFile);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform live canvas compression & filter application
  const runLiveOptimization = useCallback((sourceUrl: string, quality: number, filter: ImageFilterType) => {
    if (!sourceUrl || (isGif && preserveGifAnimation)) {
      setCompressedSrc(sourceUrl);
      setCompressedSizeStr(formatDataUrlSize(sourceUrl));
      return;
    }

    setIsCompressing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setCompressedSrc(sourceUrl);
          setIsCompressing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        if (filter !== 'none') {
          applyFiltersToCanvas(ctx, canvas.width, canvas.height, filter, 0, 0);
        }

        const outMime = isGif ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outMime, quality);
        setCompressedSrc(compressedDataUrl);
        setCompressedSizeStr(formatDataUrlSize(compressedDataUrl));
      } catch (err) {
        console.error('Optimization error:', err);
        setCompressedSrc(sourceUrl);
      } finally {
        setIsCompressing(false);
      }
    };
    img.onerror = () => {
      setCompressedSrc(sourceUrl);
      setIsCompressing(false);
    };
    img.src = sourceUrl;
  }, [isGif, preserveGifAnimation]);

  // Debounced live update when slider/filter changes
  useEffect(() => {
    if (!imageSrc) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      runLiveOptimization(imageSrc, qualityLevel, selectedFilter);
    }, 120);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [imageSrc, qualityLevel, selectedFilter, runLiveOptimization]);

  // Handle Save / Insert
  const handleSaveOrInsert = () => {
    const finalData = compressedSrc || imageSrc;
    if (!finalData) return;

    const finalAssetId = editingAssetId || `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAsset: DocumentAsset = {
      id: finalAssetId,
      name: originalName || caption || 'Figure',
      mimeType: isGif ? 'image/gif' : 'image/jpeg',
      sizeFormatted: compressedSizeStr || originalSizeStr,
      dataUrl: finalData,
      filter: selectedFilter,
      widthPercent,
      alignment,
      isAnimatedGif: isGif && preserveGifAnimation
    };

    const alignOption = alignment === 'block-center' ? 'center' : alignment;
    const captionOpt = caption ? `, caption=${caption}` : '';
    const markdownToken = `\\includegraphics[width=${widthPercent}%, align=${alignOption}${captionOpt}]{asset://${finalAssetId}}`;

    if (editingAssetId && onUpdateAsset) {
      onUpdateAsset(newAsset);
    } else if (onInsertAsset) {
      onInsertAsset(newAsset, `\n\n${markdownToken}\n\n`);
    } else if (onInsertImage) {
      onInsertImage(`\n\n${markdownToken}\n\n`);
    }

    onClose();
  };

  const copyToken = (assetId: string, align: string = 'center', width: number = 75) => {
    const token = `\\includegraphics[width=${width}%, align=${align}]{asset://${assetId}}`;
    navigator.clipboard.writeText(token);
    setCopiedTokenId(assetId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onPaste={handlePaste}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingAssetId ? 'Edit Attached Image' : 'Image & Diagram Studio'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingAssetId
                  ? 'Re-adjust crop, filters, flow alignment, and dimensions from previous state.'
                  : 'Compress, crop, apply scan filters, and position graphics with text wrapping.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={14} />
            <span>Attached Images ({assetList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
              activeTab === 'studio'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>{editingAssetId ? 'Edit in Studio' : 'Upload & Optimize'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: ATTACHED IMAGES GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {assetList.length > 0
                    ? 'All images attached to this document. Edit any image starting from its previous state:'
                    : 'No images attached to this document yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAssetId(null);
                    setImageSrc('');
                    setActiveTab('studio');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Plus size={14} />
                  <span>Attach New Image</span>
                </button>
              </div>

              {assetList.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="p-3.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to upload or drag &amp; drop an image
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports PNG, JPG, WebP, animated GIFs, or clipboard paste (Ctrl+V)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assetList.map(asset => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex flex-col justify-between gap-2.5 transition-all hover:border-blue-400 group"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          <img
                            src={asset.dataUrl}
                            alt={asset.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {asset.name || 'Untitled Image'}
                          </h5>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold">
                              {asset.alignment === 'float-left' ? 'Left Float' : asset.alignment === 'float-right' ? 'Right Float' : 'Centered'}
                            </span>
                            <span>{asset.widthPercent || 75}% width</span>
                            <span>•</span>
                            <span>{asset.sizeFormatted}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 mt-1 truncate">
                            asset://{asset.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => loadAssetForEditing(asset)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit3 size={13} />
                          <span>Edit / Re-optimize</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToken(asset.id, asset.alignment, asset.widthPercent)}
                          className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs transition-colors"
                          title="Copy LaTeX token"
                        >
                          {copiedTokenId === asset.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                        {onDeleteAsset && (
                          <button
                            type="button"
                            onClick={() => onDeleteAsset(asset.id)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs transition-colors"
                            title="Delete image asset"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDIO OPTIMIZER */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              {/* Dropzone if no image is loaded */}
              {!imageSrc && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 scale-[0.99]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="p-3.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-2xs">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to choose image or drag &amp; drop here
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports JPG, PNG, WebP, animated GIFs, or paste directly with Ctrl+V
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Optimization & Placement Studio Controls (Active once image is chosen) */}
              {imageSrc && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Image Preview Stage */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[160px] max-h-[220px]">
                    <img
                      src={compressedSrc || imageSrc}
                      alt="Preview"
                      className="max-h-[180px] max-w-full object-contain rounded-lg shadow-xs"
                      style={{
                        filter:
                          selectedFilter === 'grayscale'
                            ? 'grayscale(100%)'
                            : selectedFilter === 'bw_diagram'
                            ? 'contrast(220%) grayscale(100%) brightness(105%)'
                            : selectedFilter === 'invert'
                            ? 'invert(100%)'
                            : 'none'
                      }}
                    />

                    {/* Top Action Floating Controls */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-md">
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                        title="Crop Image"
                      >
                        <CropIcon size={13} />
                        <span>Crop</span>
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:text-blue-400 transition-colors"
                      >
                        Replace
                      </button>
                    </div>

                    {/* Bottom Size Tag */}
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5">
                      <span>Original: {originalSizeStr}</span>
                      <span>→</span>
                      <span className="font-bold text-emerald-400">
                        {isCompressing ? 'Compressing...' : compressedSizeStr}
                      </span>
                    </div>
                  </div>

                  {/* Flow Alignment Options (Float Left, Center, Float Right, Inline) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Text Flow &amp; Space-Saving Placement
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'float-left', label: 'Float Left', sub: 'Wrap text right (saves space)', icon: <AlignLeft size={14} /> },
                        { id: 'block-center', label: 'Centered', sub: 'Stand-alone block', icon: <AlignCenter size={14} /> },
                        { id: 'float-right', label: 'Float Right', sub: 'Wrap text left (saves space)', icon: <AlignRight size={14} /> },
                        { id: 'inline', label: 'Inline Flow', sub: 'Inside sentence', icon: <FileText size={14} /> },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAlignment(opt.id as ImageAlignment)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            alignment === opt.id
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            {opt.icon}
                            <span>{opt.label}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Width Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Display Width: {widthPercent}%
                      </span>
                      <div className="flex gap-1">
                        {[25, 33, 50, 75, 100].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setWidthPercent(pct)}
                            className={`px-2 py-0.5 text-[10px] rounded font-bold transition-colors ${
                              widthPercent === pct
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      step={5}
                      value={widthPercent}
                      onChange={e => setWidthPercent(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Academic Scan & Print Presets */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-500" />
                      <span>Academic Scan &amp; Print Presets</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'none', label: 'Original', desc: 'True color' },
                        { id: 'bw_diagram', label: 'B&W Scan', desc: 'High contrast' },
                        { id: 'grayscale', label: 'Grayscale', desc: 'Print safe' },
                        { id: 'invert', label: 'Invert', desc: 'Dark schematic' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFilter(f.id as ImageFilterType)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            selectedFilter === f.id
                              ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{f.label}</div>
                          <div className="text-[10px] opacity-75">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Figure Caption */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Figure Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="e.g. Figure 1: Schematic diagram of Carnot engine cycle..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {imageSrc
              ? (editingAssetId ? 'Updates image in place seamlessly' : 'Saved as clean token outside editor text')
              : 'Select or paste image'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            {activeTab === 'studio' && imageSrc && (
              <button
                type="button"
                disabled={!imageSrc}
                onClick={handleSaveOrInsert}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-40"
              >
                <Check size={16} />
                <span>{editingAssetId ? 'Save Updates' : 'Insert Image Asset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Cropper Modal */}
      {isCropperOpen && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={imageSrc}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={(cropped) => {
            setImageSrc(cropped);
            setCompressedSrc(cropped);
            setOriginalSizeStr(formatDataUrlSize(cropped));
            setCompressedSizeStr(formatDataUrlSize(cropped));
            setIsCropperOpen(false);
          }}
        />
      )}
    </div>,
    document.body
  );
}
