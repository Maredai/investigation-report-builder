import React, { useRef, useState } from 'react';
import { Image as ImageIcon, ChevronDown, Upload, X, Copy, Check } from 'lucide-react';
import { ScreenshotItem } from '../types/report';
import { convertDataUrlToPngBlob } from '../utils/reportGenerator';

interface ScreenshotsSectionProps {
  screenshots: ScreenshotItem[];
  onAddScreenshots: (newItems: ScreenshotItem[]) => void;
  onRemoveScreenshot: (id: string) => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', msg: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ScreenshotsSection: React.FC<ScreenshotsSectionProps> = ({
  screenshots,
  onAddScreenshots,
  onRemoveScreenshot,
  onNotify,
  isCollapsed,
  onToggleCollapse,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      onNotify('warning', 'Please select valid image files (PNG, JPG, WebP).');
      return;
    }

    const readers = validFiles.map(file => {
      return new Promise<ScreenshotItem>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          resolve({
            id: 'scr_' + Math.random().toString(36).substring(2, 9),
            name: file.name || 'Screenshot',
            dataUrl,
            size: file.size,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then(items => {
        onAddScreenshots(items);
        onNotify('info', `Added ${items.length} screenshot${items.length > 1 ? 's' : ''}`);
      })
      .catch(() => {
        onNotify('error', 'Failed to load selected screenshot images');
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleCopySingleImage = async (item: ScreenshotItem) => {
    try {
      const pngBlob = await convertDataUrlToPngBlob(item.dataUrl);
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
          }),
        ]);
        setCopiedId(item.id);
        onNotify('success', 'Image copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        throw new Error('Clipboard write not supported');
      }
    } catch {
      onNotify('error', 'Browser blocked direct image copy. You can right-click and copy.');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-400 text-black border border-yellow-500 shrink-0">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
                Screenshots (Amplitude)
              </h2>
              {screenshots.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-yellow-400 text-black border border-yellow-500 font-bold shrink-0">
                  {screenshots.length} {screenshots.length === 1 ? 'image' : 'images'}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-neutral-500 transition-transform duration-200 shrink-0 ${
            isCollapsed ? '-rotate-90' : 'rotate-0'
          }`}
        />
      </button>

      {!isCollapsed && (
        <div className="px-4 sm:px-5 pb-5 sm:pb-6 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
          {/* Dropzone Container */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-yellow-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-white dark:bg-neutral-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-yellow-400 text-black border border-yellow-500">
                <Upload className="w-5 h-5 stroke-[2.2]" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-black dark:text-white">
                Drop images here, paste from clipboard (Ctrl+V), or{' '}
                <span className="underline decoration-yellow-400 decoration-2">browse</span>
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Supports PNG, JPG, and WebP (Amplitude events, telemetry logs)
              </p>
            </div>
          </div>

          {/* Screenshot List Grid */}
          {screenshots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {screenshots.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 shadow-xs flex flex-col justify-between space-y-2.5 transition-all duration-150"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={s.dataUrl}
                      alt={s.name}
                      className="w-14 h-14 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black dark:text-white truncate" title={s.name}>
                        {s.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Photo #{idx + 1} • {(s.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySingleImage(s);
                        }}
                        className="p-1.5 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-yellow-400 rounded-lg transition-colors"
                        title="Copy image"
                        aria-label="Copy image"
                      >
                        {copiedId === s.id ? (
                          <Check className="w-4 h-4 text-black" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveScreenshot(s.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        title="Delete photo"
                        aria-label="Delete photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
