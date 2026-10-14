import React, { useState } from 'react';
import {
  Copy,
  FileCheck,
  Image as ImageIcon,
  Check,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { ReportState, ScreenshotItem } from '../types/report';
import {
  parseNumeric,
  formatPesos,
  getAllFindingSentences,
  getConclusionText,
  getConclusionSentences,
  generatePlainTextReport,
  generateHtmlReport,
  generateInvestigationTableText,
  generateInvestigationTableHtml,
  hasBlankFields,
  convertDataUrlToPngBlob,
} from '../utils/reportGenerator';

interface LivePreviewProps {
  state: ReportState;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', msg: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ state, onNotify }) => {
  const [copyState, setCopyState] = useState<'idle' | 'text' | 'image' | 'all' | 'table'>('idle');

  const { caseDetails, deviceInfo, screenshots } = state;

  // Determine if completely empty
  const isCompletelyEmpty =
    !caseDetails.personId &&
    !caseDetails.accountNumber &&
    !caseDetails.creditLimit &&
    !caseDetails.transactionDetails &&
    !deviceInfo.phoneModel &&
    !deviceInfo.deviceId &&
    !deviceInfo.applicationDate &&
    screenshots.length === 0 &&
    getAllFindingSentences(state).length === 0;

  const renderValue = (val: string) => {
    const trimmed = val ? val.trim() : '';
    if (!trimmed) {
      return (
        <span className="font-mono bg-yellow-100 dark:bg-yellow-950/70 text-black dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800 px-1.5 py-0.5 rounded font-bold text-xs">
          ____
        </span>
      );
    }
    return <span className="text-black dark:text-white font-medium">{trimmed}</span>;
  };

  const creditNum = parseNumeric(caseDetails.creditLimit);
  const creditDisplay = creditNum > 0 ? (
    <span className="text-black dark:text-white font-medium">{formatPesos(creditNum)}</span>
  ) : (
    <span className="font-mono bg-yellow-100 dark:bg-yellow-950/70 text-black dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800 px-1.5 py-0.5 rounded font-bold text-xs">
      ____
    </span>
  );

  const findingSentences = getAllFindingSentences(state);
  const conclusionText = getConclusionText(state);
  const conclusionSentences = getConclusionSentences(state);
  const isBulletConclusion =
    conclusionSentences.length > 1 ||
    Boolean(
      state.conclusion.selectedTypes?.includes('custom') &&
        state.conclusion.customBullets &&
        state.conclusion.customBullets.length > 0
    );

  // Copy Plain Text
  const handleCopyText = async () => {
    const blanksExist = hasBlankFields(state);
    if (blanksExist) {
      onNotify('warning', 'Some fields are blank');
    }

    try {
      const text = generatePlainTextReport(state);
      await navigator.clipboard.writeText(text);
      setCopyState('text');
      onNotify('success', 'Copied text to clipboard!');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      onNotify('error', 'Failed to copy text to clipboard');
    }
  };

  // Copy Image (First or Selected Screenshot)
  const handleCopyFirstImage = async () => {
    if (screenshots.length === 0) {
      onNotify('warning', 'No screenshots available to copy.');
      return;
    }

    try {
      const first = screenshots[0];
      const pngBlob = await convertDataUrlToPngBlob(first.dataUrl);
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
          }),
        ]);
        setCopyState('image');
        onNotify('success', 'Copied image to clipboard!');
        setTimeout(() => setCopyState('idle'), 2000);
      } else {
        throw new Error('Clipboard write not supported');
      }
    } catch {
      onNotify('error', 'Browser blocked direct image copy. You can right-click and copy the image.');
    }
  };

  // Copy Investigation Table Only
  const handleCopyInvestigationTable = async () => {
    try {
      const plainText = generateInvestigationTableText(deviceInfo);
      const htmlText = generateInvestigationTableHtml(deviceInfo);

      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const htmlBlob = new Blob([htmlText], { type: 'text/html' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopyState('table');
      onNotify('success', 'Copied Investigation table!');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      onNotify('error', 'Failed to copy investigation table');
    }
  };

  // Copy All (Rich HTML + Plain Text with Embedded Images)
  const handleCopyAll = async () => {
    const blanksExist = hasBlankFields(state);
    if (blanksExist) {
      onNotify('warning', 'Some fields are blank');
    }

    const plainText = generatePlainTextReport(state);
    const htmlText = generateHtmlReport(state);

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const htmlBlob = new Blob([htmlText], { type: 'text/html' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
        setCopyState('all');
        onNotify('success', 'Copied report and images to clipboard!');
        setTimeout(() => setCopyState('idle'), 2000);
      } else {
        await navigator.clipboard.writeText(plainText);
        setCopyState('all');
        onNotify('success', 'Copied plain-text report to clipboard!');
        setTimeout(() => setCopyState('idle'), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
        setCopyState('all');
        onNotify('info', 'Copied plain-text report (rich clipboard unavailable)');
        setTimeout(() => setCopyState('idle'), 2000);
      } catch {
        onNotify('error', 'Failed to copy report to clipboard');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-400 text-black border border-yellow-500 shrink-0">
            <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
              Live Investigation Preview
            </h2>
          </div>
        </div>

        {hasBlankFields(state) && !isCompletelyEmpty && (
          <span
            className="flex items-center gap-1 text-[11px] font-bold text-black bg-yellow-100 dark:bg-yellow-950/70 border border-yellow-300 dark:border-yellow-800 px-2 py-0.5 rounded-md shrink-0"
            title="Some fields are not filled in yet"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <span className="hidden sm:inline">Incomplete</span>
          </span>
        )}
      </div>

      {/* Main Preview Body */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
        {isCompletelyEmpty ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="p-3 rounded-full bg-yellow-100 text-black mb-3 border border-yellow-300">
              <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
            </div>
            <p className="text-sm font-bold text-black dark:text-white">
              Empty Investigation Document
            </p>
            <p className="text-xs max-w-xs mt-1 text-neutral-600 dark:text-neutral-400">
              Complete the case details or answer findings on the left to generate the formatted Jira report.
            </p>
          </div>
        ) : (
          <div className="font-sans text-xs sm:text-sm text-black dark:text-white space-y-4 select-text leading-relaxed">
            {/* Header Block */}
            <div className="space-y-1">
              <p>
                <strong className="text-black dark:text-white">PERSON ID:</strong> {renderValue(caseDetails.personId)}
              </p>
              <p>
                <strong className="text-black dark:text-white">ACCOUNT NUMBER:</strong> {renderValue(caseDetails.accountNumber)}
              </p>
              <p>
                <strong className="text-black dark:text-white">SKYRO CREDIT LIMIT:</strong> {creditDisplay}
              </p>
              <p>
                <strong className="text-black dark:text-white">TRANSACTION DETAILS:</strong> {renderValue(caseDetails.transactionDetails)}
              </p>
            </div>

            {/* Investigation Block - Table Format */}
            <div className="pt-2">
              <div className="flex items-center justify-between pb-2 gap-2">
                <p>
                  <strong className="text-black dark:text-white">INVESTIGATION:</strong>
                </p>
                <button
                  type="button"
                  onClick={handleCopyInvestigationTable}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors border border-yellow-500 shadow-2xs focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  title="Copy Investigation Table to clipboard (Jira markup and rich table)"
                >
                  {copyState === 'table' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Table!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Table</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-xs">
                <table className="w-full border-collapse text-xs sm:text-sm min-w-[280px]">
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
                    <tr>
                      <td className="py-2.5 px-3.5 font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 w-2/5">
                        PHONE MODEL
                      </td>
                      <td className="py-2.5 px-3.5 text-black dark:text-neutral-100 font-medium">
                        {renderValue(deviceInfo.phoneModel)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
                        DEVICE ID
                      </td>
                      <td className="py-2.5 px-3.5 text-black dark:text-neutral-100 font-mono text-xs">
                        {renderValue(deviceInfo.deviceId)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
                        APPLICATION DATE
                      </td>
                      <td className="py-2.5 px-3.5 text-black dark:text-neutral-100 font-medium">
                        {renderValue(deviceInfo.applicationDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Uploaded Screenshots Inline */}
            {screenshots.length > 0 && (
              <div className="py-3 space-y-3">
                {screenshots.map((s, idx) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 overflow-hidden shadow-xs space-y-2"
                  >
                    <img
                      src={s.dataUrl}
                      alt={`Evidence ${idx + 1}: ${s.name}`}
                      className="w-full max-h-72 object-contain rounded-lg mx-auto bg-white"
                    />
                    <div className="text-center">
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                        Screenshot {idx + 1}: {s.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Answered Finding Sentences - Bullet Points */}
            {findingSentences.length > 0 && (
              <div className="py-2 border-t border-neutral-200 dark:border-neutral-800">
                <ul className="list-disc pl-5 space-y-1.5 text-black dark:text-white">
                  {findingSentences.map((sentence, index) => (
                    <li key={index} className="leading-relaxed">
                      {sentence}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conclusion Block */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
              <p>
                <strong className="text-black dark:text-white">Conclusion:</strong>
              </p>
              {conclusionSentences.length === 0 ? (
                <p className="text-black dark:text-neutral-200 font-medium">
                  {renderValue('')}
                </p>
              ) : isBulletConclusion ? (
                <ul className="list-disc pl-5 space-y-1 text-black dark:text-neutral-200 font-medium">
                  {conclusionSentences.map((sentence, index) => (
                    <li key={index} className="leading-relaxed">
                      {sentence}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-black dark:text-neutral-200 font-medium">
                  {conclusionSentences[0] === '____'
                    ? renderValue('')
                    : conclusionSentences[0]}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 z-20 mt-auto p-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-black dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-xl transition-colors focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            title="Copy plain-text report"
          >
            {copyState === 'text' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* Copy Image */}
          <button
            type="button"
            onClick={handleCopyFirstImage}
            disabled={screenshots.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors focus:ring-2 focus:ring-yellow-400 focus:outline-none border ${
              screenshots.length > 0
                ? 'text-black dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700'
                : 'text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 cursor-not-allowed'
            }`}
            title={screenshots.length > 0 ? 'Copy first screenshot as PNG' : 'No screenshot to copy'}
          >
            {copyState === 'image' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Copy Image</span>
              </>
            )}
          </button>
        </div>

        {/* Copy All (Primary) */}
        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-xl border border-yellow-500 shadow-xs transition-all duration-150 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          title="Copy formatted text and embedded screenshots to clipboard"
        >
          {copyState === 'all' ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Copied All!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2.2]" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
