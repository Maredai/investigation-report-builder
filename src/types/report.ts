export type FindingToggle = 'skip' | 'yes' | 'no' | 'other';

export interface CaseDetails {
  personId: string;
  accountNumber: string;
  creditLimit: string;
  transactionDetails: string;
}

export interface DeviceInfo {
  phoneModel: string;
  deviceId: string;
  applicationDate: string;
}

export interface ScreenshotItem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  width?: number;
  height?: number;
  comment?: string;
}

export type DeviceMatchOption =
  | 'purchased'
  | 'previously_used'
  | 'no_match'
  | 'no_record'
  | 'other';

export type PosLoanStatus = 'updated' | 'delinquent' | 'no_pos' | 'other';
export type CashLoanStatus = 'updated' | 'delinquent' | 'no_cash' | 'other';
export type SkyroCreditOption =
  | 'no_skyro'
  | 'no_topup'
  | 'topup_attempted'
  | 'updated'
  | 'other';
export type SkyroCreditStatus = SkyroCreditOption | SkyroCreditOption[];

export type ClientContactStatus = 'uncontactable' | 'contacted' | 'other';
export type ContactResult = 'confirmed' | 'denied' | 'unaware' | 'other';

export interface FindingsState {
  f1: {
    toggle: FindingToggle;
    amounts: string[];
    customSentence?: string;
  };
  f2: {
    toggle: FindingToggle;
    option: DeviceMatchOption;
    model: string;
    date: string;
    customOption?: string;
    customSentence?: string;
  };
  f3: {
    toggle: FindingToggle;
    count: string;
    accountIds: string;
    customSentence?: string;
  };
  f4: {
    toggle: FindingToggle;
    models: string;
    customSentence?: string;
  };
  f5: {
    toggle: FindingToggle;
    km: string;
    minutes: string;
    vicinityThreshold: number;
    customSentence?: string;
  };
  f6: {
    toggle: FindingToggle;
    customSentence?: string;
  };
  f7: {
    toggle: FindingToggle;
    posLoan: PosLoanStatus;
    cashLoan: CashLoanStatus;
    skyroCredit: SkyroCreditOption[];
    customPosLoan?: string;
    customCashLoan?: string;
    customSkyroCredit?: string;
    customSentence?: string;
  };
  f8: {
    toggle: FindingToggle;
    status: ClientContactStatus;
    contactResult: ContactResult | ContactResult[];
    customStatus?: string;
    customResult?: string;
    customSentence?: string;
  };
  f9: {
    toggle: FindingToggle;
    customSentence?: string;
  };
}

export type ConclusionType =
  | 'valid'
  | 'qr_gambling'
  | 'qr_cash_conversion'
  | 'custom';

export interface CustomBullet {
  id: string;
  text: string;
  checked: boolean;
}

export const DEFAULT_CONCLUSION_BULLETS: string[] = [
  'No fraud indicators identified against the client.',
  'Investigation remains inconclusive.',
  'Merchant-related concern identified.',
  'Agent involvement or procedural concern identified.',
  'Transaction details require further validation.',
  'Contact verification unsuccessful.',
  'Fraud confirmed.',
  'Suspected fraud — further validation required.',
  'Merchant-related fraud identified.',
  'Agent-related fraud identified.',
  'Fraud involving multiple parties.',
  'Not Fraud — investigation findings support a legitimate transaction with no identified fraud.',
  'Client is Not Fraud, but merchant-related concerns were identified.',
];

export interface ConclusionState {
  type: ConclusionType;
  selectedTypes: ConclusionType[];
  customText: string;
  customBullets: CustomBullet[];
}

export interface ReportState {
  caseDetails: CaseDetails;
  deviceInfo: DeviceInfo;
  screenshots: ScreenshotItem[];
  findings: FindingsState;
  conclusion: ConclusionState;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}
