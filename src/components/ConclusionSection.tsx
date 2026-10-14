import React, { useState } from 'react';
import {
  Scale,
  ChevronDown,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  ListPlus,
} from 'lucide-react';
import {
  ConclusionState,
  ConclusionType,
  CustomBullet,
  DEFAULT_CONCLUSION_BULLETS,
} from '../types/report';
import { ConflictDetails } from '../utils/reportGenerator';

interface ConclusionSectionProps {
  conclusion: ConclusionState;
  onChange: (updated: Partial<ConclusionState>) => void;
  conflictDetails: ConflictDetails;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ConclusionSection: React.FC<ConclusionSectionProps> = ({
  conclusion,
  onChange,
  conflictDetails,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [newBulletText, setNewBulletText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const selectedTypes: ConclusionType[] =
    conclusion.selectedTypes && conclusion.selectedTypes.length > 0
      ? conclusion.selectedTypes
      : conclusion.type
      ? [conclusion.type]
      : ['valid'];

  const customBullets: CustomBullet[] = conclusion.customBullets || [];

  const options: { type: ConclusionType; label: string; description: string }[] = [
    {
      type: 'valid',
      label: 'Valid',
      description: 'Transaction appears valid and client-initiated',
    },
    {
      type: 'qr_gambling',
      label: 'Merchant QR blocked, gambling',
      description: 'Block policy triggered by gaming or gambling merchant',
    },
    {
      type: 'qr_cash_conversion',
      label: 'Merchant QR blocked, cash conversion',
      description: 'Unauthorized cash-out or conversion scheme',
    },
    {
      type: 'custom',
      label: 'Custom',
      description: 'Custom bullet points and analyst statements',
    },
  ];

  // Standard conclusion bullet additions
  const quickAdditions = DEFAULT_CONCLUSION_BULLETS;

  const isBulletActive = (text: string) => {
    return customBullets.some(
      (b) => b.checked && b.text.trim().toLowerCase() === text.trim().toLowerCase()
    );
  };

  const handleToggleSuggestion = (text: string) => {
    const trimmed = text.trim();
    const existing = customBullets.find(
      (b) => b.text.trim().toLowerCase() === trimmed.toLowerCase()
    );

    let updatedBullets: CustomBullet[];
    if (existing) {
      if (existing.checked) {
        // Remove or uncheck when clicked again
        updatedBullets = customBullets.filter(
          (b) => b.text.trim().toLowerCase() !== trimmed.toLowerCase()
        );
      } else {
        updatedBullets = customBullets.map((b) =>
          b.text.trim().toLowerCase() === trimmed.toLowerCase()
            ? { ...b, checked: true }
            : b
        );
      }
    } else {
      const newBullet: CustomBullet = {
        id: 'cb_' + Math.random().toString(36).substring(2, 9),
        text: trimmed,
        checked: true,
      };
      updatedBullets = [...customBullets, newBullet];
    }

    const nextTypes: ConclusionType[] = selectedTypes.includes('custom')
      ? selectedTypes
      : [...selectedTypes, 'custom' as ConclusionType];

    onChange({
      customBullets: updatedBullets,
      selectedTypes: nextTypes,
      type: (nextTypes[0] || 'custom') as ConclusionType,
    });
  };

  const handleToggleType = (type: ConclusionType) => {
    let nextTypes: ConclusionType[];
    if (selectedTypes.includes(type)) {
      nextTypes = selectedTypes.filter((t) => t !== type);
    } else {
      nextTypes = [...selectedTypes, type];
    }
    onChange({
      selectedTypes: nextTypes,
      type: nextTypes[0] || 'custom',
    });
  };

  const handleAddBulletText = (textToAdd: string) => {
    const raw = textToAdd.trim();
    if (!raw) return;

    // Handle multiline paste: split by newline
    const lines = raw
      .split('\n')
      .map((l) => l.replace(/^[-*•\d.]\s*/, '').trim())
      .filter((l) => l.length > 0);

    const newItems: CustomBullet[] = lines.map((line) => ({
      id: 'cb_' + Math.random().toString(36).substring(2, 9),
      text: line,
      checked: true,
    }));

    const updatedBullets = [...customBullets, ...newItems];
    const nextTypes: ConclusionType[] = selectedTypes.includes('custom')
      ? selectedTypes
      : [...selectedTypes, 'custom' as ConclusionType];

    onChange({
      customBullets: updatedBullets,
      selectedTypes: nextTypes,
      type: (nextTypes[0] || 'custom') as ConclusionType,
    });
    setNewBulletText('');
  };

  const handleToggleBulletCheck = (id: string) => {
    const updated = customBullets.map((b) =>
      b.id === id ? { ...b, checked: !b.checked } : b
    );
    onChange({ customBullets: updated });
  };

  const handleDeleteBullet = (id: string) => {
    const updated = customBullets.filter((b) => b.id !== id);
    onChange({ customBullets: updated });
  };

  const handleStartEdit = (bullet: CustomBullet) => {
    setEditingId(bullet.id);
    setEditingText(bullet.text);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      handleDeleteBullet(id);
    } else {
      const updated = customBullets.map((b) =>
        b.id === id ? { ...b, text: trimmed } : b
      );
      onChange({ customBullets: updated });
    }
    setEditingId(null);
    setEditingText('');
  };

  const handleSelectAllStandard = () => {
    const existingMap = new Map(
      customBullets.map((b) => [b.text.trim().toLowerCase(), b])
    );
    const standardItems: CustomBullet[] = DEFAULT_CONCLUSION_BULLETS.map(
      (text, idx) => {
        const existing = existingMap.get(text.trim().toLowerCase());
        if (existing) {
          return { ...existing, checked: true };
        }
        return {
          id: `cb_std_${idx}_${Date.now()}`,
          text,
          checked: true,
        };
      }
    );
    const customOnly = customBullets.filter(
      (b) =>
        !DEFAULT_CONCLUSION_BULLETS.some(
          (s) => s.trim().toLowerCase() === b.text.trim().toLowerCase()
        )
    );
    const nextTypes: ConclusionType[] = selectedTypes.includes('custom')
      ? selectedTypes
      : [...selectedTypes, 'custom' as ConclusionType];

    onChange({
      customBullets: [...standardItems, ...customOnly],
      selectedTypes: nextTypes,
      type: (nextTypes[0] || 'custom') as ConclusionType,
    });
  };

  const handleClearAllBullets = () => {
    onChange({ customBullets: [] });
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
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
              Conclusion
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
          {/* Conflict Warning Hint */}
          {conflictDetails.hasConflict && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-800 transition-all duration-150">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5 text-black dark:text-neutral-200">
                  <p className="font-bold text-black dark:text-white">
                    Conclusion may conflict with findings.
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    The report conclusion is marked as &quot;Valid&quot;, but the following finding points indicate anomalies:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-800 dark:text-neutral-300 font-medium">
                    {conflictDetails.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
                    Note: This warning is advisory and does not prevent copying.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Select Tick Box Conclusion Options */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt) => {
                const isSelected = selectedTypes.includes(opt.type);
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleToggleType(opt.type)}
                    className={`text-left relative flex flex-col p-3.5 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/30 shadow-xs ring-1 ring-yellow-400'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-yellow-400 bg-white dark:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-xs font-bold text-black dark:text-white">
                        {opt.label}
                      </span>
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-black bg-black text-yellow-400'
                            : 'border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Bullets Card (Shown when Custom is selected or bullets exist) */}
          {selectedTypes.includes('custom') && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-black dark:text-white" />
                  <span className="text-xs font-bold text-black dark:text-white">
                    Custom Bullets
                  </span>
                  {customBullets.filter((b) => b.checked).length > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-yellow-400 text-black border border-yellow-500">
                      {customBullets.filter((b) => b.checked).length} active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAllStandard}
                    className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white underline decoration-neutral-300"
                  >
                    Select all standard
                  </button>
                  {customBullets.length > 0 && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-600">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllBullets}
                        className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white underline decoration-neutral-300"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Add Custom Bullet Input Bar */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  value={newBulletText}
                  onChange={(e) => setNewBulletText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBulletText(newBulletText);
                    }
                  }}
                  placeholder="Type custom conclusion bullet point and press Enter..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddBulletText(newBulletText)}
                  disabled={!newBulletText.trim()}
                  className="px-4 py-2 text-xs sm:text-sm font-bold bg-yellow-400 text-black rounded-xl border border-yellow-500 hover:bg-yellow-300 active:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Bullet</span>
                </button>
              </div>

              {/* Quick Additions (Visible standard bullet chips) */}
              <div className="space-y-2 pt-1 border-t border-neutral-200 dark:border-neutral-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Quick additions:
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Click to toggle conclusion statements
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickAdditions.map((bulletText, i) => {
                    const active = isBulletActive(bulletText);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleSuggestion(bulletText)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-left ${
                          active
                            ? 'bg-black dark:bg-white text-yellow-400 dark:text-black border-black dark:border-white shadow-xs font-semibold'
                            : 'bg-white dark:bg-neutral-800 text-black dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-yellow-400 hover:bg-yellow-50/40 dark:hover:bg-neutral-700/50'
                        }`}
                        title={active ? 'Click to deselect' : 'Click to add'}
                      >
                        {active ? (
                          <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                        )}
                        <span>{bulletText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Custom Bullets List */}
              {customBullets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Active Bullets:
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Included in final report
                    </span>
                  </div>
                  <div className="space-y-2">
                    {customBullets.map((bullet) => {
                      const isEditing = editingId === bullet.id;
                      return (
                        <div
                          key={bullet.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                            bullet.checked
                              ? 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 shadow-xs'
                              : 'bg-neutral-100/70 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-800 opacity-60'
                          }`}
                        >
                          {/* Direct Tick Box */}
                          <button
                            type="button"
                            onClick={() => handleToggleBulletCheck(bullet.id)}
                            className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                            title={bullet.checked ? 'Click to uncheck bullet' : 'Click to check bullet'}
                          >
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                bullet.checked
                                  ? 'border-black bg-black text-yellow-400'
                                  : 'border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900'
                              }`}
                            >
                              {bullet.checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </button>

                          {/* Bullet Text / Editing */}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveEdit(bullet.id);
                                    } else if (e.key === 'Escape') {
                                      setEditingId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="w-full px-2.5 py-1 text-xs bg-white dark:bg-neutral-900 rounded-lg border border-yellow-400 text-black dark:text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(bullet.id)}
                                  className="px-2.5 py-1 text-xs font-bold bg-yellow-400 text-black rounded-lg border border-yellow-500"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => handleStartEdit(bullet)}
                                className={`text-xs block cursor-pointer select-text leading-relaxed ${
                                  bullet.checked
                                    ? 'text-black dark:text-white font-medium'
                                    : 'text-neutral-500 dark:text-neutral-400 line-through'
                                }`}
                                title="Click to edit"
                              >
                                {bullet.text}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBullet(bullet.id)}
                            className="text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
