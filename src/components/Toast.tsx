import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/report';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-neutral-300 dark:border-neutral-700';
        let bgClass = 'bg-white dark:bg-neutral-900';
        let icon = <CheckCircle2 className="w-5 h-5 text-black dark:text-yellow-400 shrink-0" />;

        if (toast.type === 'warning') {
          borderClass = 'border-yellow-400';
          bgClass = 'bg-yellow-50 dark:bg-neutral-900';
          icon = <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-black dark:border-yellow-500';
          bgClass = 'bg-white dark:bg-neutral-900';
          icon = <AlertCircle className="w-5 h-5 text-black dark:text-yellow-400 shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-yellow-400';
          bgClass = 'bg-white dark:bg-neutral-900';
          icon = <Info className="w-5 h-5 text-black dark:text-yellow-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border-2 shadow-lg transition-all duration-200 ${borderClass} ${bgClass}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-bold text-black dark:text-white">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
