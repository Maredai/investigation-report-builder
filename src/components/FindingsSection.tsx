import React from 'react';
import {
  SearchCheck,
  ChevronDown,
  RotateCcw,
  CheckCheck,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  FindingsState,
  FindingToggle,
  DeviceMatchOption,
  PosLoanStatus,
  CashLoanStatus,
  SkyroCreditOption,
  ClientContactStatus,
  ContactResult,
} from '../types/report';
import {
  calculateF1,
  formatPesos,
  formatTravelTime,
} from '../utils/reportGenerator';
import { EasyDatePicker } from './EasyDatePicker';

interface FindingsSectionProps {
  findings: FindingsState;
  onChange: (updated: Partial<FindingsState>) => void;
  phoneModel: string;
  creditLimit: string;
  onUpdateCreditLimit: (val: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const FindingsSection: React.FC<FindingsSectionProps> = ({
  findings,
  onChange,
  phoneModel,
  creditLimit,
  onUpdateCreditLimit,
  isCollapsed,
  onToggleCollapse,
}) => {
  const answeredCount = Object.values(findings).filter(
    (f) => f.toggle !== 'skip'
  ).length;

  const handleToggle = (key: keyof FindingsState, val: FindingToggle) => {
    onChange({
      [key]: {
        ...findings[key],
        toggle: val,
      },
    });
  };

  const handleSelectAll = () => {
    const isAllSelected = answeredCount === 9;
    const updated: Partial<FindingsState> = {};
    (Object.keys(findings) as Array<keyof FindingsState>).forEach((key) => {
      updated[key] = {
        ...findings[key],
        toggle: isAllSelected ? 'skip' : 'yes',
      } as any;
    });
    onChange(updated);
  };

  const handleResetFindings = () => {
    const updated: Partial<FindingsState> = {};
    (Object.keys(findings) as Array<keyof FindingsState>).forEach((key) => {
      updated[key] = {
        ...findings[key],
        toggle: 'skip',
      } as any;
    });
    onChange(updated);
  };

  // F1 Helpers
  const f1Calc = calculateF1(findings.f1.amounts, creditLimit);

  const handleAddF1Amount = () => {
    onChange({
      f1: {
        ...findings.f1,
        amounts: [...findings.f1.amounts, ''],
      },
    });
  };

  const handleUpdateF1Amount = (index: number, val: string) => {
    const nextAmounts = [...findings.f1.amounts];
    nextAmounts[index] = val;
    onChange({
      f1: {
        ...findings.f1,
        amounts: nextAmounts,
      },
    });
  };

  const handleRemoveF1Amount = (index: number) => {
    const nextAmounts = findings.f1.amounts.filter((_, i) => i !== index);
    onChange({
      f1: {
        ...findings.f1,
        amounts: nextAmounts.length > 0 ? nextAmounts : [''],
      },
    });
  };

  // Reusable 4-state toggle button (Skip / Yes / No / Other)
  const renderToggle = (
    current: FindingToggle,
    onSelect: (val: FindingToggle) => void
  ) => {
    return (
      <div className="inline-flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold shrink-0">
        <button
          type="button"
          onClick={() => onSelect('skip')}
          className={`px-2.5 py-1 rounded-md transition-all ${current === 'skip'
            ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xs font-bold border border-neutral-300 dark:border-neutral-600'
            : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => onSelect('yes')}
          className={`px-2.5 py-1 rounded-md transition-all ${current === 'yes'
            ? 'bg-yellow-400 text-black shadow-xs font-bold border border-yellow-500'
            : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onSelect('no')}
          className={`px-2.5 py-1 rounded-md transition-all ${current === 'no'
            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold border border-black dark:border-white'
            : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onSelect('other')}
          className={`px-2.5 py-1 rounded-md transition-all ${current === 'other'
            ? 'bg-yellow-300 text-black shadow-xs font-bold border border-yellow-400'
            : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
        >
          Other
        </button>
      </div>
    );
  };

  // Reusable direct single-select tick-box button selector
  const renderTickButtons = <T extends string>(
    options: { id: T; label: string }[],
    current: T,
    onSelect: (val: T) => void
  ) => {
    return (
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {options.map((opt) => {
          const isSelected = current === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected
                ? 'bg-yellow-400 text-black border-yellow-500 shadow-xs font-bold'
                : 'bg-white dark:bg-neutral-800 text-black dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-yellow-400 hover:bg-yellow-50/30'
                }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected
                  ? 'border-black bg-black text-yellow-400'
                  : 'border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900'
                  }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Reusable multi-select tick-box button selector
  const renderMultiTickButtons = <T extends string>(
    options: { id: T; label: string }[],
    selected: T[],
    onToggle: (id: T) => void
  ) => {
    return (
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected
                ? 'bg-yellow-400 text-black border-yellow-500 shadow-xs font-bold'
                : 'bg-white dark:bg-neutral-800 text-black dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-yellow-400 hover:bg-yellow-50/30'
                }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected
                  ? 'border-black bg-black text-yellow-400'
                  : 'border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900'
                  }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderCustomSentenceInput = (
    key: keyof FindingsState,
    defaultLabel: string = 'Custom Statement (type if option is not listed)'
  ) => {
    return (
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
          {defaultLabel}
        </label>
        <textarea
          rows={2}
          value={findings[key].customSentence || ''}
          onChange={(e) =>
            onChange({
              [key]: {
                ...findings[key],
                customSentence: e.target.value,
              },
            })
          }
          placeholder="Type custom finding statement to output in the report..."
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs relative transition-all duration-200">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-400 text-black border border-yellow-500 shrink-0">
            <SearchCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
              Findings
            </h2>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-neutral-500 transition-transform duration-200 shrink-0 ${isCollapsed ? '-rotate-90' : 'rotate-0'
            }`}
        />
      </button>

      {!isCollapsed && (
        <div className="px-4 sm:px-5 pb-5 sm:pb-6 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 text-black hover:text-yellow-600 dark:text-neutral-200 dark:hover:text-yellow-400 font-bold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{answeredCount === 9 ? 'Deselect All' : 'Select All'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleResetFindings}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {/* 1: CREDIT LIMIT UTILIZATION */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f1.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Was there credit limit utilization?
                  </span>
                </div>
                {renderToggle(findings.f1.toggle, (val) =>
                  handleToggle('f1', val)
                )}
              </div>

              {findings.f1.toggle === 'other' && (
                renderCustomSentenceInput('f1', 'Custom Credit Limit Statement (type if option is not listed)')
              )}

              {findings.f1.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                  {/* Direct Credit Limit & Computed Utilization Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                        Skyro Credit Limit (₱) <span className="text-yellow-600 dark:text-yellow-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black dark:text-white text-xs font-bold">
                          ₱
                        </span>
                        <input
                          type="text"
                          value={creditLimit}
                          onChange={(e) => onUpdateCreditLimit(e.target.value)}
                          placeholder="10,000.00"
                          className={`w-full pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border font-mono tabular-nums text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none ${!creditLimit.trim()
                            ? 'border-yellow-400 ring-1 ring-yellow-400/40'
                            : 'border-neutral-300 dark:border-neutral-700'
                            }`}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                        Editable here &amp; syncs with Case Details
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                        Computed Utilization
                      </label>
                      <div className="flex items-center h-8 px-3 rounded-lg bg-yellow-400 border border-yellow-500 text-xs">
                        {f1Calc.hasLimit ? (
                          <span className="font-bold text-black font-mono">
                            {f1Calc.pctFormatted}% ({formatPesos(f1Calc.total)} of {formatPesos(f1Calc.limit)})
                          </span>
                        ) : (
                          <span className="text-black/60 font-medium">
                            Enter limit to calculate
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                        Sum: {formatPesos(f1Calc.total)} ({f1Calc.transactionCount} {f1Calc.txWord})
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">


                    {f1Calc.exceedsLimit && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-950/60 text-black dark:text-yellow-200 border border-yellow-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                        Amount exceeds limit (fees/interest?)
                      </span>
                    )}


                  </div>

                  {/* Amounts inputs */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-black dark:text-neutral-200">
                      Amount used (₱)
                    </label>
                    {findings.f1.amounts.map((amount, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black dark:text-white text-xs font-bold">
                            ₱
                          </span>
                          <input
                            type="text"
                            value={amount}
                            onChange={(e) =>
                              handleUpdateF1Amount(idx, e.target.value)
                            }
                            placeholder="4,942.20"
                            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-mono focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                          />
                        </div>
                        {findings.f1.amounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveF1Amount(idx)}
                            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                            title="Remove transaction amount"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddF1Amount}
                      className="inline-flex items-center gap-1 text-xs text-black hover:text-yellow-600 dark:text-neutral-200 dark:hover:text-yellow-400 font-bold pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Amount</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2: DEVICE MATCH */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f2.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Did the device match POS loan records?
                  </span>
                </div>
                {renderToggle(findings.f2.toggle, (val) =>
                  handleToggle('f2', val)
                )}
              </div>

              {findings.f2.toggle === 'other' && (
                renderCustomSentenceInput('f2', 'Custom Device Match Statement (type if option is not listed)')
              )}

              {findings.f2.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                      Match Status
                    </label>
                    {renderTickButtons<DeviceMatchOption>(
                      [
                        { id: 'purchased', label: 'Purchased under POS loan' },
                        { id: 'previously_used', label: 'Previously used under POS loan' },
                        { id: 'no_match', label: 'No match / different device' },
                        { id: 'no_record', label: 'No POS loan on record' },
                        { id: 'other', label: 'Other' },
                      ],
                      findings.f2.option,
                      (val) =>
                        onChange({
                          f2: {
                            ...findings.f2,
                            option: val,
                          },
                        })
                    )}
                  </div>

                  {findings.f2.option === 'other' ? (
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                        Custom Match Details
                      </label>
                      <textarea
                        rows={2}
                        value={findings.f2.customOption || ''}
                        onChange={(e) =>
                          onChange({
                            f2: {
                              ...findings.f2,
                              customOption: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Device matches client history from secondary registry..."
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                          Device Model (auto-filled from Device Info)
                        </label>
                        <input
                          type="text"
                          value={findings.f2.model || phoneModel}
                          onChange={(e) =>
                            onChange({
                              f2: {
                                ...findings.f2,
                                model: e.target.value,
                              },
                            })
                          }
                          placeholder={phoneModel || 'e.g. Samsung Galaxy A54'}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                        />
                      </div>

                      {/* Date is hidden for no_match and no_record */}
                      {findings.f2.option !== 'no_match' &&
                        findings.f2.option !== 'no_record' && (
                          <div>
                            <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                              POS Loan Date
                            </label>
                            <EasyDatePicker
                              value={findings.f2.date}
                              onChange={(val) =>
                                onChange({
                                  f2: {
                                    ...findings.f2,
                                    date: val,
                                  },
                                })
                              }
                              placeholder="Select or pick loan date..."
                            />
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3: OTHER ACCOUNTS ON DEVICE */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f3.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Were other accounts associated with this device?
                  </span>
                </div>
                {renderToggle(findings.f3.toggle, (val) =>
                  handleToggle('f3', val)
                )}
              </div>

              {findings.f3.toggle === 'other' && (
                renderCustomSentenceInput('f3', 'Custom Accounts Statement (type if option is not listed)')
              )}

              {findings.f3.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                      Account Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={findings.f3.count}
                      onChange={(e) =>
                        onChange({
                          f3: {
                            ...findings.f3,
                            count: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 2"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                      Account IDs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={findings.f3.accountIds}
                      onChange={(e) =>
                        onChange({
                          f3: {
                            ...findings.f3,
                            accountIds: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 98124, 71204"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4: OTHER DEVICES IN AMPLITUDE */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f4.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Were other devices detected in Amplitude?
                  </span>
                </div>
                {renderToggle(findings.f4.toggle, (val) =>
                  handleToggle('f4', val)
                )}
              </div>

              {findings.f4.toggle === 'other' && (
                renderCustomSentenceInput('f4', 'Custom Other Devices Statement (type if option is not listed)')
              )}

              {findings.f4.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                    Other Device Models
                  </label>
                  <input
                    type="text"
                    value={findings.f4.models}
                    onChange={(e) =>
                      onChange({
                        f4: {
                          ...findings.f4,
                          models: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Xiaomi Redmi Note 12, iPhone 13"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 5: FIRST TRANSACTION DISTANCE */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f5.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Did the transaction occur outside the client's usual vicinity?
                  </span>
                </div>
                {renderToggle(findings.f5.toggle, (val) =>
                  handleToggle('f5', val)
                )}
              </div>

              {findings.f5.toggle === 'other' && (
                renderCustomSentenceInput('f5', 'Custom Distance Statement (type if option is not listed)')
              )}

              {findings.f5.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={findings.f5.km}
                        onChange={(e) =>
                          onChange({
                            f5: {
                              ...findings.f5,
                              km: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. 3.2"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                        Travel Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={findings.f5.minutes}
                        onChange={(e) =>
                          onChange({
                            f5: {
                              ...findings.f5,
                              minutes: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. 65"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                      {findings.f5.minutes && (
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                          Formatted: {formatTravelTime(findings.f5.minutes)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1">
                        Vicinity Threshold (km)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={findings.f5.vicinityThreshold}
                        onChange={(e) =>
                          onChange({
                            f5: {
                              ...findings.f5,
                              vicinityThreshold:
                                parseFloat(e.target.value) || 5,
                            },
                          })
                        }
                        placeholder="5"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6: PAYMENT ATTEMPT */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f6.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Was there an attempt to make a payment?
                  </span>
                </div>
                {renderToggle(findings.f6.toggle, (val) =>
                  handleToggle('f6', val)
                )}
              </div>

              {findings.f6.toggle === 'other' && (
                renderCustomSentenceInput('f6', 'Custom Payment Attempt Statement (type if option is not listed)')
              )}
            </div>

            {/* 7: ACCOUNT STATUS (POS LOAN, CASH LOAN, SKYRO CREDIT) */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f7.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Were there delinquent accounts on record?
                  </span>
                </div>
                {renderToggle(findings.f7.toggle, (val) =>
                  handleToggle('f7', val)
                )}
              </div>

              {findings.f7.toggle === 'other' && (
                renderCustomSentenceInput('f7', 'Custom Account Status Statement (type if option is not listed)')
              )}

              {findings.f7.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3.5">
                  {/* POS Loan Status */}
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                      POS Loan Status
                    </label>
                    {renderTickButtons<PosLoanStatus>(
                      [
                        { id: 'updated', label: 'Updated' },
                        { id: 'delinquent', label: 'Delinquent' },
                        { id: 'no_pos', label: 'No POS loan' },
                        { id: 'other', label: 'Other' },
                      ],
                      findings.f7.posLoan,
                      (val) =>
                        onChange({
                          f7: {
                            ...findings.f7,
                            posLoan: val,
                          },
                        })
                    )}
                    {findings.f7.posLoan === 'other' && (
                      <input
                        type="text"
                        value={findings.f7.customPosLoan || ''}
                        onChange={(e) =>
                          onChange({
                            f7: {
                              ...findings.f7,
                              customPosLoan: e.target.value,
                            },
                          })
                        }
                        placeholder="Type custom POS loan status..."
                        className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Cash Loan Status */}
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                      Cash Loan Status
                    </label>
                    {renderTickButtons<CashLoanStatus>(
                      [
                        { id: 'updated', label: 'Updated' },
                        { id: 'delinquent', label: 'Delinquent' },
                        { id: 'no_cash', label: 'No Cash loan' },
                        { id: 'other', label: 'Other' },
                      ],
                      findings.f7.cashLoan || 'updated',
                      (val) =>
                        onChange({
                          f7: {
                            ...findings.f7,
                            cashLoan: val,
                          },
                        })
                    )}
                    {findings.f7.cashLoan === 'other' && (
                      <input
                        type="text"
                        value={findings.f7.customCashLoan || ''}
                        onChange={(e) =>
                          onChange({
                            f7: {
                              ...findings.f7,
                              customCashLoan: e.target.value,
                            },
                          })
                        }
                        placeholder="Type custom Cash loan status..."
                        className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Skyro Credit Status (Direct multiple tick boxes allowed) */}
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                      Skyro Credit Status
                    </label>
                    {renderMultiTickButtons<SkyroCreditOption>(
                      [
                        { id: 'no_skyro', label: 'No Skyro Credit' },
                        { id: 'no_topup', label: 'No top-up attempts' },
                        { id: 'topup_attempted', label: 'Top-up attempted' },
                        { id: 'updated', label: 'Updated' },
                        { id: 'other', label: 'Other' },
                      ],
                      Array.isArray(findings.f7.skyroCredit)
                        ? findings.f7.skyroCredit
                        : (findings.f7.skyroCredit ? [findings.f7.skyroCredit as SkyroCreditOption] : []),
                      (opt) => {
                        const current = Array.isArray(findings.f7.skyroCredit)
                          ? [...findings.f7.skyroCredit]
                          : (findings.f7.skyroCredit ? [findings.f7.skyroCredit as SkyroCreditOption] : []);

                        if (opt === 'no_skyro') {
                          const next: SkyroCreditOption[] = current.includes('no_skyro') ? [] : ['no_skyro'];
                          onChange({ f7: { ...findings.f7, skyroCredit: next } });
                          return;
                        }

                        let next: SkyroCreditOption[] = current.filter((x) => x !== 'no_skyro');
                        if (opt === 'no_topup') {
                          next = next.filter((x) => x !== 'topup_attempted');
                          if (next.includes('no_topup')) {
                            next = next.filter((x) => x !== 'no_topup');
                          } else {
                            next.push('no_topup');
                          }
                        } else if (opt === 'topup_attempted') {
                          next = next.filter((x) => x !== 'no_topup');
                          if (next.includes('topup_attempted')) {
                            next = next.filter((x) => x !== 'topup_attempted');
                          } else {
                            next.push('topup_attempted');
                          }
                        } else {
                          if (next.includes(opt)) {
                            next = next.filter((x) => x !== opt);
                          } else {
                            next.push(opt);
                          }
                        }
                        onChange({ f7: { ...findings.f7, skyroCredit: next } });
                      }
                    )}
                    {Array.isArray(findings.f7.skyroCredit) && findings.f7.skyroCredit.includes('other') && (
                      <input
                        type="text"
                        value={findings.f7.customSkyroCredit || ''}
                        onChange={(e) =>
                          onChange({
                            f7: {
                              ...findings.f7,
                              customSkyroCredit: e.target.value,
                            },
                          })
                        }
                        placeholder="Type custom Skyro Credit status..."
                        className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 8: CLIENT CONTACT */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f8.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Was the client contacted regarding the transaction?
                  </span>
                </div>
                {renderToggle(findings.f8.toggle, (val) =>
                  handleToggle('f8', val)
                )}
              </div>

              {findings.f8.toggle === 'other' && (
                renderCustomSentenceInput('f8', 'Custom Client Contact Statement (type if option is not listed)')
              )}

              {findings.f8.toggle === 'yes' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                        Contact State
                      </label>
                      {renderTickButtons<ClientContactStatus>(
                        [
                          { id: 'uncontactable', label: 'Uncontactable' },
                          { id: 'contacted', label: 'Contacted' },
                          { id: 'other', label: 'Other' },
                        ],
                        findings.f8.status,
                        (val) =>
                          onChange({
                            f8: {
                              ...findings.f8,
                              status: val,
                            },
                          })
                      )}
                      {findings.f8.status === 'other' && (
                        <input
                          type="text"
                          value={findings.f8.customStatus || ''}
                          onChange={(e) =>
                            onChange({
                              f8: {
                                ...findings.f8,
                                customStatus: e.target.value,
                              },
                            })
                          }
                          placeholder="Type custom contact status..."
                          className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                        />
                      )}
                    </div>

                    {findings.f8.status === 'contacted' && (
                      <div>
                        <label className="block text-xs font-bold text-black dark:text-neutral-200 mb-1.5">
                          Client Statement
                        </label>
                        {renderMultiTickButtons<ContactResult>(
                          [
                            { id: 'confirmed', label: 'Confirmed' },
                            { id: 'denied', label: 'Denied' },
                            { id: 'unaware', label: 'Unaware' },
                            { id: 'other', label: 'Other' },
                          ],
                          Array.isArray(findings.f8.contactResult)
                            ? findings.f8.contactResult
                            : (findings.f8.contactResult ? [findings.f8.contactResult as ContactResult] : []),
                          (opt) => {
                            const current = Array.isArray(findings.f8.contactResult)
                              ? [...findings.f8.contactResult]
                              : (findings.f8.contactResult ? [findings.f8.contactResult as ContactResult] : []);

                            if (opt === 'confirmed') {
                              const next: ContactResult[] = current.includes('confirmed') ? [] : ['confirmed'];
                              onChange({ f8: { ...findings.f8, contactResult: next } });
                              return;
                            }

                            let next: ContactResult[] = current.filter((x) => x !== 'confirmed');
                            if (next.includes(opt)) {
                              next = next.filter((x) => x !== opt);
                            } else {
                              next.push(opt);
                            }
                            onChange({ f8: { ...findings.f8, contactResult: next } });
                          }
                        )}
                        {Array.isArray(findings.f8.contactResult) && findings.f8.contactResult.includes('other') && (
                          <input
                            type="text"
                            value={findings.f8.customResult || ''}
                            onChange={(e) =>
                              onChange({
                                f8: {
                                  ...findings.f8,
                                  customResult: e.target.value,
                                },
                              })
                            }
                            placeholder="Type custom client statement..."
                            className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 9: RECIPIENT */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${findings.f9.toggle !== 'skip'
                ? 'border-yellow-400 bg-yellow-50/20 dark:bg-yellow-950/15'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    Does the client's name appear as the recipient?
                  </span>
                </div>
                {renderToggle(findings.f9.toggle, (val) =>
                  handleToggle('f9', val)
                )}
              </div>

              {findings.f9.toggle === 'other' && (
                renderCustomSentenceInput('f9', 'Custom Recipient Statement (type if option is not listed)')
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
