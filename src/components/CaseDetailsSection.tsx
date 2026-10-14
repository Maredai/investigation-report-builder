import React from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { CaseDetails } from '../types/report';

interface CaseDetailsSectionProps {
  data: CaseDetails;
  onChange: (updated: Partial<CaseDetails>) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const CaseDetailsSection: React.FC<CaseDetailsSectionProps> = ({
  data,
  onChange,
  isCollapsed,
  onToggleCollapse,
}) => {
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
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
              Case Details
            </h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Person ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-black dark:text-neutral-200">
                  Person ID <span className="text-yellow-600 dark:text-yellow-400">*</span>
                </label>
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {data.personId.length}/23 chars
                </span>
              </div>

              <div className="relative">
                {/* Ghost overlay aligned in monospace font */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center px-3.5 font-mono text-xs sm:text-sm tracking-wider select-none"
                >
                  <span className="opacity-0 whitespace-pre">{data.personId}</span>
                  <span className="text-neutral-400/60 dark:text-neutral-600 font-medium">
                    {'PHL-****-****-****-****'.slice(Math.min(data.personId.length, 23))}
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={23}
                  value={data.personId}
                  onChange={(e) => onChange({ personId: e.target.value.toUpperCase() })}
                  placeholder="PHL-****-****-****-****"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border text-black dark:text-white placeholder-transparent font-mono tracking-wider transition-colors relative z-10 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none ${
                    !data.personId.trim()
                      ? 'border-yellow-400 ring-1 ring-yellow-400/40'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                />
              </div>

              {!data.personId.trim() ? (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Required field (max 23 characters, e.g. PHL-****-****-****-****)
                </p>
              ) : (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Format: PHL-****-****-****-****
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                Account Number <span className="text-yellow-600 dark:text-yellow-400">*</span>
              </label>
              <input
                type="text"
                value={data.accountNumber}
                onChange={(e) => onChange({ accountNumber: e.target.value })}
                placeholder="e.g. 8420-1928-4421"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none ${
                  !data.accountNumber.trim()
                    ? 'border-yellow-400 ring-1 ring-yellow-400/40'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              />
              {!data.accountNumber.trim() && (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Required field
                </p>
              )}
            </div>
          </div>

          {/* Skyro Credit Limit */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
              Skyro Credit Limit (₱) <span className="text-yellow-600 dark:text-yellow-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black dark:text-white font-bold text-sm">
                ₱
              </span>
              <input
                type="text"
                value={data.creditLimit}
                onChange={(e) => onChange({ creditLimit: e.target.value })}
                placeholder="10,000.00"
                className={`w-full pl-8 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors font-mono tabular-nums focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none ${
                  !data.creditLimit.trim()
                    ? 'border-yellow-400 ring-1 ring-yellow-400/40'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              />
            </div>
            {!data.creditLimit.trim() ? (
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                Required for credit limit utilization calculation
              </p>
            ) : (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Accepts numeric values with commas and decimals
              </p>
            )}
          </div>

          {/* Transaction Details */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
              Transaction Details
            </label>
            <textarea
              rows={3}
              value={data.transactionDetails}
              onChange={(e) => onChange({ transactionDetails: e.target.value })}
              placeholder="e.g. ₱5,000 QR transaction at Merchant ABC on October 14, 2026 at 14:22"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
            />

          </div>
        </div>
      )}
    </div>
  );
};
