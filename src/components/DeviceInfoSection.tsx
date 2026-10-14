import React from 'react';
import { Smartphone, ChevronDown } from 'lucide-react';
import { DeviceInfo } from '../types/report';
import { EasyDatePicker } from './EasyDatePicker';

interface DeviceInfoSectionProps {
  data: DeviceInfo;
  onChange: (updated: Partial<DeviceInfo>) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DeviceInfoSection: React.FC<DeviceInfoSectionProps> = ({
  data,
  onChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs relative transition-all duration-200">
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-400 text-black border border-yellow-500 shrink-0">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
              Device Info
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
            {/* Phone Model */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                Phone Model <span className="text-yellow-600 dark:text-yellow-400">*</span>
              </label>
              <input
                type="text"
                value={data.phoneModel}
                onChange={(e) => onChange({ phoneModel: e.target.value })}
                placeholder="e.g. Samsung Galaxy A54 5G"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none ${
                  !data.phoneModel.trim()
                    ? 'border-yellow-400 ring-1 ring-yellow-400/40'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              />
              {!data.phoneModel.trim() ? (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Required field (auto-fills into device match question)
                </p>
              ) : (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Propagated to investigation statements automatically
                </p>
              )}
            </div>

            {/* Device ID */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                Device ID <span className="text-yellow-600 dark:text-yellow-400">*</span>
              </label>
              <input
                type="text"
                value={data.deviceId}
                onChange={(e) => onChange({ deviceId: e.target.value })}
                placeholder="e.g. 7d8f-991b-4a21"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 font-mono text-xs transition-colors focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none ${
                  !data.deviceId.trim()
                    ? 'border-yellow-400 ring-1 ring-yellow-400/40'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              />
              {!data.deviceId.trim() && (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Required field
                </p>
              )}
            </div>
          </div>

          {/* Application Date */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
              Application Date <span className="text-yellow-600 dark:text-yellow-400">*</span>
            </label>
            <EasyDatePicker
              value={data.applicationDate}
              onChange={(val) => onChange({ applicationDate: val })}
              required
              placeholder="e.g. October 12, 2026 or pick from calendar"
            />
          </div>
        </div>
      )}
    </div>
  );
};
