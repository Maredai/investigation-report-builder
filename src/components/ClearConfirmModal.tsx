import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-dialog-title"
    >
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-300 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-400 text-black border border-yellow-500">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="clear-dialog-title" className="text-base font-bold text-black dark:text-white">
                Reset Investigation Report
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Confirmation required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          This action will immediately erase all case details, device information, uploaded screenshots, findings, and conclusion choices. All data stored in memory will be lost.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-300 dark:border-neutral-700"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 border border-yellow-500 rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
