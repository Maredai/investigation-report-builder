import React from 'react';
import { Sun, Moon, Trash2, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenClearConfirm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenClearConfirm,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-neutral-950 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-yellow-400 text-black border border-yellow-500 shadow-xs shrink-0">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-black dark:text-white truncate">
              AF TEAM CRL INVESTIGATION BUILDER
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 truncate hidden xs:block">
              Fraud Review &amp; Jira Investigation Report
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenClearConfirm}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-black dark:text-white hover:bg-yellow-400 hover:text-black bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl transition-all duration-150 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            title="Reset all form fields and data"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 dark:text-neutral-300" />
            <span className="hidden xxs:inline">Clear All</span>
          </button>
        </div>
      </div>
    </header>
  );
};
