import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CaseDetailsSection } from './components/CaseDetailsSection';
import { DeviceInfoSection } from './components/DeviceInfoSection';
import { ScreenshotsSection } from './components/ScreenshotsSection';
import { FindingsSection } from './components/FindingsSection';
import { ConclusionSection } from './components/ConclusionSection';
import { LivePreview } from './components/LivePreview';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { ToastContainer } from './components/Toast';
import {
  ReportState,
  ScreenshotItem,
  ToastMessage,
  FindingsState,
  DEFAULT_CONCLUSION_BULLETS,
} from './types/report';
import { checkConclusionConflict } from './utils/reportGenerator';
import { FileEdit, Eye } from 'lucide-react';

const createInitialFindings = (): FindingsState => ({
  f1: { toggle: 'skip', amounts: [''] },
  f2: { toggle: 'skip', option: 'purchased', model: '', date: '' },
  f3: { toggle: 'skip', count: '', accountIds: '' },
  f4: { toggle: 'skip', models: '' },
  f5: { toggle: 'skip', km: '', minutes: '', vicinityThreshold: 5 },
  f6: { toggle: 'skip' },
  f7: {
    toggle: 'skip',
    posLoan: 'updated',
    cashLoan: 'updated',
    skyroCredit: ['no_topup'],
  },
  f8: { toggle: 'skip', status: 'uncontactable', contactResult: 'confirmed' },
  f9: { toggle: 'skip' },
});

const createInitialState = (): ReportState => ({
  caseDetails: {
    personId: '',
    accountNumber: '',
    creditLimit: '',
    transactionDetails: '',
  },
  deviceInfo: {
    phoneModel: '',
    deviceId: '',
    applicationDate: '',
  },
  screenshots: [],
  findings: createInitialFindings(),
  conclusion: {
    type: 'valid',
    selectedTypes: ['valid'],
    customText: '',
    customBullets: [],
  },
});

export default function App() {
  const [state, setState] = useState<ReportState>(createInitialState);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('af_crl_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // Ignore localStorage access issues
    }
    return false; // Default to Light Mode
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    caseDetails: false,
    deviceInfo: false,
    screenshots: false,
    findings: false,
    conclusion: false,
  });
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to html element and persist
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('af_crl_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('af_crl_theme', 'light');
      }
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  const addToast = useCallback(
    (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Global paste handler for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        const readers = imageFiles.map((file) => {
          return new Promise<ScreenshotItem>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              resolve({
                id: 'scr_' + Math.random().toString(36).substring(2, 9),
                name: 'Pasted Screenshot',
                dataUrl,
                size: file.size,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        Promise.all(readers)
          .then((newScreenshots) => {
            setState((prev) => ({
              ...prev,
              screenshots: [...prev.screenshots, ...newScreenshots],
            }));
            addToast('info', `Pasted ${newScreenshots.length} image from clipboard`);
          })
          .catch(() => {
            addToast('error', 'Failed to paste image');
          });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addToast]);

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAll = () => {
    setState(createInitialState());
    addToast('info', 'Report cleared and reset to initial state.');
  };

  // State updaters
  const updateCaseDetails = (updated: Partial<ReportState['caseDetails']>) => {
    setState((prev) => ({
      ...prev,
      caseDetails: { ...prev.caseDetails, ...updated },
    }));
  };

  const updateDeviceInfo = (updated: Partial<ReportState['deviceInfo']>) => {
    setState((prev) => {
      const nextPhone =
        updated.phoneModel !== undefined
          ? updated.phoneModel
          : prev.deviceInfo.phoneModel;

      // Auto-fill F2 model if user hasn't explicitly set a different one
      const currentF2Model = prev.findings.f2.model;
      const shouldUpdateF2Model =
        !currentF2Model || currentF2Model === prev.deviceInfo.phoneModel;

      return {
        ...prev,
        deviceInfo: { ...prev.deviceInfo, ...updated },
        findings: shouldUpdateF2Model
          ? {
              ...prev.findings,
              f2: {
                ...prev.findings.f2,
                model: nextPhone,
              },
            }
          : prev.findings,
      };
    });
  };

  const addScreenshots = (newItems: ScreenshotItem[]) => {
    setState((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, ...newItems],
    }));
  };

  const removeScreenshot = (id: string) => {
    setState((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((s) => s.id !== id),
    }));
  };

  const updateFindings = (updated: Partial<FindingsState>) => {
    setState((prev) => ({
      ...prev,
      findings: { ...prev.findings, ...updated },
    }));
  };

  const updateConclusion = (updated: Partial<ReportState['conclusion']>) => {
    setState((prev) => ({
      ...prev,
      conclusion: { ...prev.conclusion, ...updated },
    }));
  };

  const conflictDetails = checkConclusionConflict(state);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors duration-200 antialiased overflow-x-hidden">
      {/* Sticky Header */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenClearConfirm={() => setIsClearModalOpen(true)}
      />

      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden sticky top-16 z-20 px-3 sm:px-4 py-2 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'form'
                ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Form Inputs</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'preview'
                ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Form Column (Left) */}
          <div
            className={`lg:col-span-7 space-y-4 sm:space-y-5 ${
              mobileTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Case Details */}
            <CaseDetailsSection
              data={state.caseDetails}
              onChange={updateCaseDetails}
              isCollapsed={Boolean(collapsed.caseDetails)}
              onToggleCollapse={() => toggleSection('caseDetails')}
            />

            {/* Device Info */}
            <DeviceInfoSection
              data={state.deviceInfo}
              onChange={updateDeviceInfo}
              isCollapsed={Boolean(collapsed.deviceInfo)}
              onToggleCollapse={() => toggleSection('deviceInfo')}
            />

            {/* Screenshots (Amplitude) */}
            <ScreenshotsSection
              screenshots={state.screenshots}
              onAddScreenshots={addScreenshots}
              onRemoveScreenshot={removeScreenshot}
              onNotify={addToast}
              isCollapsed={Boolean(collapsed.screenshots)}
              onToggleCollapse={() => toggleSection('screenshots')}
            />

            {/* Findings */}
            <FindingsSection
              findings={state.findings}
              onChange={updateFindings}
              phoneModel={state.deviceInfo.phoneModel}
              creditLimit={state.caseDetails.creditLimit}
              onUpdateCreditLimit={(val) => updateCaseDetails({ creditLimit: val })}
              isCollapsed={Boolean(collapsed.findings)}
              onToggleCollapse={() => toggleSection('findings')}
            />

            {/* Conclusion */}
            <ConclusionSection
              conclusion={state.conclusion}
              onChange={updateConclusion}
              conflictDetails={conflictDetails}
              isCollapsed={Boolean(collapsed.conclusion)}
              onToggleCollapse={() => toggleSection('conclusion')}
            />
          </div>

          {/* Live Preview Column (Right, Sticky on Desktop) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <LivePreview state={state} onNotify={addToast} />
          </div>
        </div>
      </main>

      {/* Clear Confirmation Modal */}
      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
