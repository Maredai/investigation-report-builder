import { ReportState, DeviceInfo, SkyroCreditOption, ContactResult } from '../types/report';

export function parseNumeric(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/,/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function formatPesos(num: number): string {
  return '₱' + num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercentage(pct: number): string {
  const rounded = Math.round(pct * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

export function formatTravelTime(minutesRaw: string): string {
  const mins = parseInt(minutesRaw, 10);
  if (isNaN(mins) || mins < 0) return '____';
  if (mins === 0) return '0 minutes';

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (remainingMins > 0) {
    parts.push(`${remainingMins} ${remainingMins === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(' ');
}

export interface F1Calculation {
  total: number;
  limit: number;
  pct: number;
  pctFormatted: string;
  hasLimit: boolean;
  exceedsLimit: boolean;
  transactionCount: number;
  txWord: string;
}

export function calculateF1(amounts: string[], rawLimit: string): F1Calculation {
  const limit = parseNumeric(rawLimit);
  const validAmounts = amounts
    .map(a => parseNumeric(a))
    .filter(a => a > 0);

  const total = validAmounts.reduce((sum, current) => sum + current, 0);
  const count = validAmounts.length;
  const txWord = count <= 1 ? 'transaction' : 'transactions';

  const hasLimit = limit > 0;
  const pct = hasLimit ? (total / limit) * 100 : 0;
  const pctFormatted = formatPercentage(pct);
  const exceedsLimit = hasLimit && total > limit;

  return {
    total,
    limit,
    pct,
    pctFormatted,
    hasLimit,
    exceedsLimit,
    transactionCount: count,
    txWord,
  };
}

export function getF1Sentence(calc: F1Calculation): string {
  if (!calc.hasLimit) {
    return '____';
  }

  const formattedTotal = formatPesos(calc.total);
  if (calc.pct >= 100) {
    return `The credit limit was fully utilized, with ${calc.txWord} amounting to ${formattedTotal} (${calc.pctFormatted}% of the limit), indicating that the client was likely aware of the available balance.`;
  } else if (calc.pct > 80) {
    return `The credit limit was almost fully utilized, with ${calc.txWord} amounting to ${formattedTotal} (approximately ${calc.pctFormatted}% of the limit), indicating that the client was likely aware of the available balance.`;
  } else {
    return `The credit limit was partially utilized, with ${calc.txWord} amounting to ${formattedTotal} (approximately ${calc.pctFormatted}% of the limit).`;
  }
}

export function generateFindingSentence(
  index: number,
  state: ReportState
): string | null {
  const { findings, deviceInfo, caseDetails } = state;

  switch (index) {
    case 1: {
      const f1 = findings.f1;
      if (f1.toggle === 'skip') return null;
      if (f1.toggle === 'no') {
        return 'No credit limit utilization.';
      }
      if (f1.toggle === 'other') {
        return f1.customSentence?.trim() || '____';
      }
      const calc = calculateF1(f1.amounts, caseDetails.creditLimit);
      return getF1Sentence(calc);
    }
    case 2: {
      const f2 = findings.f2;
      if (f2.toggle === 'skip') return null;
      if (f2.toggle === 'no') {
        return 'No device match with POS loan records.';
      }
      if (f2.toggle === 'other') {
        return f2.customSentence?.trim() || '____';
      }
      if (f2.option === 'other') {
        return f2.customOption?.trim() || f2.customSentence?.trim() || '____';
      }
      const model = (f2.model || deviceInfo.phoneModel || '').trim() || '____';
      const date = f2.date.trim() || '____';

      switch (f2.option) {
        case 'purchased':
          return `The transaction was made using a ${model} device, which is the same model purchased by the client under the POS loan on ${date}, suggesting that the newly acquired device was used.`;
        case 'previously_used':
          return `The transaction was made using a ${model} device, which is the same model used by the client under the POS loan on ${date}.`;
        case 'no_match':
          return `The transaction was made using a ${model} device, which does not match any device previously used or purchased by the client.`;
        case 'no_record':
          return `The transaction was made using a ${model} device. The client has no POS loan device on record for comparison.`;
      }
      break;
    }
    case 3: {
      const f3 = findings.f3;
      if (f3.toggle === 'skip') return null;
      if (f3.toggle === 'other') {
        return f3.customSentence?.trim() || '____';
      }
      if (f3.toggle === 'no') {
        return 'No other account/s associated with the device.';
      }
      const count = f3.count.trim() || '____';
      const ids = f3.accountIds.trim() || '____';
      const noun = count === '1' ? 'account' : 'accounts';
      return `${count} other ${noun} associated with the device: ${ids}.`;
    }
    case 4: {
      const f4 = findings.f4;
      if (f4.toggle === 'skip') return null;
      if (f4.toggle === 'other') {
        return f4.customSentence?.trim() || '____';
      }
      if (f4.toggle === 'no') {
        return 'No other device found in amplitude.';
      }
      const models = f4.models.trim() || '____';
      return `Other device/s found in amplitude: ${models}.`;
    }
    case 5: {
      const f5 = findings.f5;
      if (f5.toggle === 'skip') return null;
      if (f5.toggle === 'no') {
        return 'The first transaction was made within the client\'s usual vicinity.';
      }
      if (f5.toggle === 'other') {
        return f5.customSentence?.trim() || '____';
      }
      const km = f5.km.trim() || '____';
      const time = formatTravelTime(f5.minutes);
      const kmNum = parseFloat(f5.km);
      const threshold = f5.vicinityThreshold ?? 5;

      if (!isNaN(kmNum) && kmNum <= threshold) {
        return `The first transaction was made within the client's vicinity, approximately ${km} km from the client's location, with an estimated travel time of ${time}.`;
      } else {
        return `The first transaction was made approximately ${km} km from the client's location, with an estimated travel time of ${time}, which is outside the client's usual vicinity.`;
      }
    }
    case 6: {
      const f6 = findings.f6;
      if (f6.toggle === 'skip') return null;
      if (f6.toggle === 'other') {
        return f6.customSentence?.trim() || '____';
      }
      if (f6.toggle === 'yes') {
        return 'There was also an attempt to make a payment, which further suggests account access and activity consistent with the client\'s usage.';
      } else {
        return 'No payment attempt was made.';
      }
    }
    case 7: {
      const f7 = findings.f7;
      if (f7.toggle === 'skip') return null;
      if (f7.toggle === 'no') {
        return 'Both POS Loan and Cash Loan accounts are updated, with no top-up attempts on Skyro Credit.';
      }
      if (f7.toggle === 'other') {
        return f7.customSentence?.trim() || '____';
      }
      const { posLoan, cashLoan = 'updated', customPosLoan, customCashLoan, customSkyroCredit } = f7;
      const skyroOptions: SkyroCreditOption[] = Array.isArray(f7.skyroCredit)
        ? f7.skyroCredit
        : (f7.skyroCredit ? [f7.skyroCredit as SkyroCreditOption] : ['no_topup']);

      if (posLoan === 'other' || cashLoan === 'other' || skyroOptions.includes('other')) {
        const posText = posLoan === 'other' ? (customPosLoan?.trim() || '____') : (posLoan === 'no_pos' ? 'No POS loan' : posLoan.charAt(0).toUpperCase() + posLoan.slice(1));
        const cashText = cashLoan === 'other' ? (customCashLoan?.trim() || '____') : (cashLoan === 'no_cash' ? 'No Cash loan' : cashLoan.charAt(0).toUpperCase() + cashLoan.slice(1));
        const skyroItems: string[] = [];
        if (skyroOptions.includes('no_skyro')) skyroItems.push('No Skyro Credit');
        if (skyroOptions.includes('updated')) skyroItems.push('Updated');
        if (skyroOptions.includes('no_topup')) skyroItems.push('No top-up attempts');
        if (skyroOptions.includes('topup_attempted')) skyroItems.push('Top-up attempted');
        if (skyroOptions.includes('other')) skyroItems.push(customSkyroCredit?.trim() || '____');
        return `POS Loan: ${posText}. Cash Loan: ${cashText}. Skyro Credit: ${skyroItems.join(', ') || '____'}.`;
      }

      const posDelinquent = posLoan === 'delinquent';
      const cashDelinquent = cashLoan === 'delinquent';
      const posUpdated = posLoan === 'updated';
      const cashUpdated = cashLoan === 'updated';
      const noPos = posLoan === 'no_pos';
      const noCash = cashLoan === 'no_cash';
      const noSkyro = skyroOptions.includes('no_skyro');

      if (noPos && noCash && noSkyro) {
        return 'The client has no POS Loan, Cash Loan, or Skyro Credit accounts on record.';
      }

      let loanPart = '';
      if (posDelinquent && cashDelinquent) {
        loanPart = 'Both the POS Loan and Cash Loan accounts are currently delinquent';
      } else if (posDelinquent && cashUpdated) {
        loanPart = 'POS Loan is currently delinquent while Cash Loan is updated';
      } else if (posUpdated && cashDelinquent) {
        loanPart = 'Cash Loan is currently delinquent while POS Loan is updated';
      } else if (posDelinquent && noCash) {
        loanPart = 'POS Loan is currently delinquent, with no Cash Loan on record';
      } else if (noPos && cashDelinquent) {
        loanPart = 'Cash Loan is currently delinquent, with no POS Loan on record';
      } else if (posUpdated && cashUpdated) {
        loanPart = 'Both the POS Loan and Cash Loan accounts are currently updated';
      } else if (posUpdated && noCash) {
        loanPart = 'POS Loan is updated, with no Cash Loan on record';
      } else if (noPos && cashUpdated) {
        loanPart = 'Cash Loan is updated, with no POS Loan on record';
      } else if (noPos && noCash) {
        loanPart = 'The client has no POS Loan or Cash Loan on record';
      } else {
        loanPart = 'Account status records reviewed';
      }

      let skyroPart = '';
      if (noSkyro) {
        skyroPart = 'with no Skyro Credit on record';
      } else if (skyroOptions.includes('updated') && skyroOptions.includes('no_topup')) {
        skyroPart = 'and Skyro Credit account is updated with no top-up attempts';
      } else if (skyroOptions.includes('updated') && skyroOptions.includes('topup_attempted')) {
        skyroPart = 'and Skyro Credit account is updated, with top-up attempts recorded';
      } else if (skyroOptions.includes('no_topup')) {
        skyroPart = 'with no top-up attempts on Skyro Credit';
      } else if (skyroOptions.includes('topup_attempted')) {
        skyroPart = 'and top-up attempts were made on Skyro Credit';
      } else if (skyroOptions.includes('updated')) {
        skyroPart = 'and Skyro Credit account is updated';
      } else {
        skyroPart = 'with Skyro Credit account reviewed';
      }

      return `${loanPart}, ${skyroPart}.`;
    }
    case 8: {
      const f8 = findings.f8;
      if (f8.toggle === 'skip') return null;
      if (f8.toggle === 'no') {
        return 'The client was uncontactable.';
      }
      if (f8.toggle === 'other') {
        return f8.customSentence?.trim() || '____';
      }
      if (f8.status === 'other') {
        return f8.customStatus?.trim() || '____';
      }
      if (f8.status === 'uncontactable') {
        return 'The client was uncontactable.';
      }
      const results: ContactResult[] = Array.isArray(f8.contactResult)
        ? f8.contactResult
        : (f8.contactResult ? [f8.contactResult] : []);

      if (results.includes('other')) {
        return f8.customResult ? `The client was contacted: ${f8.customResult.trim()}.` : '____';
      }
      if (results.includes('denied') && results.includes('unaware')) {
        return 'The client was contacted and denied making the transaction, stating they were unaware of the activity.';
      }
      if (results.includes('confirmed')) {
        return 'The client was contacted and confirmed the transaction.';
      }
      if (results.includes('denied')) {
        return 'The client was contacted and denied making the transaction.';
      }
      if (results.includes('unaware')) {
        return 'The client was contacted and was unaware of the transaction.';
      }
      return null;
    }
    case 9: {
      const f9 = findings.f9;
      if (f9.toggle === 'skip') return null;
      if (f9.toggle === 'other') {
        return f9.customSentence?.trim() || '____';
      }
      if (f9.toggle === 'yes') {
        return 'The client\'s name appears also as the recipient of the transaction, indicating the client received and aware of the transaction.';
      } else {
        return 'The client\'s name does not appear as the recipient of the transaction.';
      }
    }
    default:
      return null;
  }
}

export function getAllFindingSentences(state: ReportState): string[] {
  const sentences: string[] = [];
  for (let i = 1; i <= 9; i++) {
    const s = generateFindingSentence(i, state);
    if (s) {
      sentences.push(s);
    }
  }
  return sentences;
}

export function getConclusionSentences(state: ReportState): string[] {
  const { conclusion } = state;
  const sentences: string[] = [];

  const selectedTypes =
    conclusion.selectedTypes && conclusion.selectedTypes.length > 0
      ? conclusion.selectedTypes
      : conclusion.type
      ? [conclusion.type]
      : ['valid'];

  if (selectedTypes.includes('valid')) {
    sentences.push(
      'The transaction appears to be valid and was likely made by the client. No suspicious or fraudulent activity was observed.'
    );
  }
  if (selectedTypes.includes('qr_gambling')) {
    sentences.push('Merchant QR was blocked, gambling transaction.');
  }
  if (selectedTypes.includes('qr_cash_conversion')) {
    sentences.push('Merchant QR was blocked, cash conversion transaction.');
  }

  if (selectedTypes.includes('custom')) {
    const customBullets = conclusion.customBullets || [];
    const activeBullets = customBullets
      .filter((b) => b.checked && b.text.trim().length > 0)
      .map((b) => b.text.trim());

    sentences.push(...activeBullets);

    if (conclusion.customText && conclusion.customText.trim()) {
      const trimmed = conclusion.customText.trim();
      if (!sentences.includes(trimmed)) {
        sentences.push(trimmed);
      }
    }
  }

  return sentences;
}

export function getConclusionText(state: ReportState): string {
  const sentences = getConclusionSentences(state);
  if (sentences.length === 0) {
    return '____';
  }
  if (sentences.length === 1) {
    return sentences[0];
  }
  return sentences.map((s) => `* ${s}`).join('\n');
}

export interface ConflictDetails {
  hasConflict: boolean;
  reasons: string[];
}

export function checkConclusionConflict(state: ReportState): ConflictDetails {
  const selectedTypes =
    state.conclusion.selectedTypes && state.conclusion.selectedTypes.length > 0
      ? state.conclusion.selectedTypes
      : state.conclusion.type
      ? [state.conclusion.type]
      : ['valid'];

  if (!selectedTypes.includes('valid')) {
    return { hasConflict: false, reasons: [] };
  }

  const reasons: string[] = [];
  const { findings } = state;

  // F2 = No match / different device
  if (findings.f2.toggle !== 'skip' && findings.f2.option === 'no_match') {
    reasons.push('Device Match indicates device does not match past records');
  }

  // F3 = Yes (other accounts on device)
  if (findings.f3.toggle === 'yes') {
    reasons.push('Other accounts are associated with the device');
  }

  // F4 = Yes (other devices in amplitude)
  if (findings.f4.toggle === 'yes') {
    reasons.push('Other devices found in Amplitude');
  }

  // F5 beyond threshold
  if (findings.f5.toggle !== 'skip') {
    const kmNum = parseFloat(findings.f5.km);
    const threshold = findings.f5.vicinityThreshold ?? 5;
    if (!isNaN(kmNum) && kmNum > threshold) {
      reasons.push(`First transaction distance (${kmNum} km) is outside the client's vicinity threshold (${threshold} km)`);
    }
  }

  // F8 = Denied or Unaware
  if (
    findings.f8.toggle !== 'skip' &&
    findings.f8.status === 'contacted' &&
    (findings.f8.contactResult === 'denied' || findings.f8.contactResult === 'unaware')
  ) {
    reasons.push(`Client contact reported transaction as ${findings.f8.contactResult}`);
  }

  // F9 = No (client name does not appear as recipient)
  if (findings.f9.toggle === 'no') {
    reasons.push('Client\'s name does not appear as the recipient');
  }

  return {
    hasConflict: reasons.length > 0,
    reasons,
  };
}

export function generatePlainTextReport(state: ReportState): string {
  const { caseDetails, deviceInfo, screenshots } = state;
  const personId = caseDetails.personId.trim() || '____';
  const accountNum = caseDetails.accountNumber.trim() || '____';

  const creditNum = parseNumeric(caseDetails.creditLimit);
  const creditLimit = creditNum > 0 ? formatPesos(creditNum) : '____';

  const txDetails = caseDetails.transactionDetails.trim() || '____';

  const phoneModel = deviceInfo.phoneModel.trim() || '____';
  const deviceId = deviceInfo.deviceId.trim() || '____';
  const appDate = deviceInfo.applicationDate.trim() || '____';

  const findingSentences = getAllFindingSentences(state);
  const conclusionSentences = getConclusionSentences(state);
  const isBulletConclusion =
    conclusionSentences.length > 1 ||
    Boolean(
      state.conclusion.selectedTypes?.includes('custom') &&
        state.conclusion.customBullets &&
        state.conclusion.customBullets.length > 0
    );

  const lines: string[] = [
    `PERSON ID: ${personId}`,
    `ACCOUNT NUMBER: ${accountNum}`,
    `SKYRO CREDIT LIMIT: ${creditLimit.startsWith('₱') ? creditLimit : '₱' + creditLimit}`,
    `TRANSACTION DETAILS: ${txDetails}`,
    '',
    'INVESTIGATION:',
    `| PHONE MODEL | ${phoneModel} |`,
    `| DEVICE ID | ${deviceId} |`,
    `| APPLICATION DATE | ${appDate} |`,
    '',
  ];

  if (findingSentences.length > 0) {
    findingSentences.forEach((s) => lines.push(`* ${s}`));
    lines.push('');
  }

  lines.push('Conclusion:');
  if (conclusionSentences.length === 0) {
    lines.push('____');
  } else if (isBulletConclusion) {
    conclusionSentences.forEach((s) => lines.push(`* ${s}`));
  } else {
    lines.push(conclusionSentences[0]);
  }

  return lines.join('\n');
}

export function generateInvestigationTableText(deviceInfo: DeviceInfo): string {
  const phoneModel = deviceInfo.phoneModel.trim() || '____';
  const deviceId = deviceInfo.deviceId.trim() || '____';
  const appDate = deviceInfo.applicationDate.trim() || '____';
  return [
    `| PHONE MODEL | ${phoneModel} |`,
    `| DEVICE ID | ${deviceId} |`,
    `| APPLICATION DATE | ${appDate} |`,
  ].join('\n');
}

export function generateInvestigationTableHtml(deviceInfo: DeviceInfo): string {
  const phoneModel = deviceInfo.phoneModel.trim() || '____';
  const deviceId = deviceInfo.deviceId.trim() || '____';
  const appDate = deviceInfo.applicationDate.trim() || '____';
  return `
<table style="border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1; font-family: Arial, sans-serif; font-size: 13px;">
  <tbody>
    <tr style="border-bottom: 1px solid #cbd5e1;">
      <td style="padding: 6px 12px; font-weight: bold; width: 40%; border-right: 1px solid #cbd5e1; color: #0f172a; background-color: #f8fafc;">PHONE MODEL</td>
      <td style="padding: 6px 12px; color: #0f172a;">${phoneModel}</td>
    </tr>
    <tr style="border-bottom: 1px solid #cbd5e1;">
      <td style="padding: 6px 12px; font-weight: bold; border-right: 1px solid #cbd5e1; color: #0f172a; background-color: #f8fafc;">DEVICE ID</td>
      <td style="padding: 6px 12px; font-family: monospace; color: #0f172a;">${deviceId}</td>
    </tr>
    <tr>
      <td style="padding: 6px 12px; font-weight: bold; border-right: 1px solid #cbd5e1; color: #0f172a; background-color: #f8fafc;">APPLICATION DATE</td>
      <td style="padding: 6px 12px; color: #0f172a;">${appDate}</td>
    </tr>
  </tbody>
</table>
  `.trim();
}

export function generateHtmlReport(state: ReportState): string {
  const { caseDetails, deviceInfo, screenshots } = state;
  const personId = caseDetails.personId.trim() || '____';
  const accountNum = caseDetails.accountNumber.trim() || '____';

  const creditNum = parseNumeric(caseDetails.creditLimit);
  const creditLimit = creditNum > 0 ? formatPesos(creditNum) : '____';

  const txDetails = caseDetails.transactionDetails.trim() || '____';

  const phoneModel = deviceInfo.phoneModel.trim() || '____';
  const deviceId = deviceInfo.deviceId.trim() || '____';
  const appDate = deviceInfo.applicationDate.trim() || '____';

  const findingSentences = getAllFindingSentences(state);
  const conclusionSentences = getConclusionSentences(state);
  const isBulletConclusion =
    conclusionSentences.length > 1 ||
    Boolean(
      state.conclusion.selectedTypes?.includes('custom') &&
        state.conclusion.customBullets &&
        state.conclusion.customBullets.length > 0
    );

  const imagesHtml =
    screenshots.length > 0
      ? `<div style="margin: 16px 0; display: flex; flex-direction: column; gap: 14px;">` +
        screenshots
          .map(
            (s, idx) => `
        <div style="margin-bottom: 8px;">
          <img src="${s.dataUrl}" alt="Evidence ${idx + 1}: ${s.name}" style="max-width: 100%; border-radius: 6px; border: 1px solid #e2e8f0; display: block;" />
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-family: monospace;">Screenshot ${idx + 1}: ${s.name}</p>
        </div>
      `
          )
          .join('') +
        `</div>`
      : '';

  const findingsHtml =
    findingSentences.length > 0
      ? `<ul style="margin: 12px 0; padding-left: 20px; line-height: 1.6;">` +
        findingSentences
          .map((s) => `<li style="margin-bottom: 6px; color: #0f172a;">${s}</li>`)
          .join('') +
        `</ul>`
      : '';

  const creditLimitDisplay = creditLimit.startsWith('₱')
    ? creditLimit
    : `₱${creditLimit}`;

  const conclusionHtml =
    conclusionSentences.length === 0
      ? `<p style="margin: 0; color: #64748b;">____</p>`
      : isBulletConclusion
      ? `<ul style="margin: 6px 0; padding-left: 20px; line-height: 1.6;">` +
        conclusionSentences
          .map(
            (s) => `<li style="margin-bottom: 4px; color: #0f172a;">${s}</li>`
          )
          .join('') +
        `</ul>`
      : `<p style="margin: 0; color: #0f172a;">${conclusionSentences[0]}</p>`;

  return `
<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #0f172a;">
  <p style="margin: 0 0 4px 0;"><strong>PERSON ID:</strong> ${personId}</p>
  <p style="margin: 0 0 4px 0;"><strong>ACCOUNT NUMBER:</strong> ${accountNum}</p>
  <p style="margin: 0 0 4px 0;"><strong>SKYRO CREDIT LIMIT:</strong> ${creditLimitDisplay}</p>
  <p style="margin: 0 0 16px 0;"><strong>TRANSACTION DETAILS:</strong> ${txDetails}</p>
  <p style="margin: 0 0 6px 0;"><strong>INVESTIGATION:</strong></p>
  <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin: 6px 0 16px 0; border: 1px solid #cbd5e1; font-family: Arial, sans-serif; font-size: 13px;">
    <tbody>
      <tr style="border-bottom: 1px solid #cbd5e1;">
        <td style="padding: 6px 12px; font-weight: bold; width: 40%; border-right: 1px solid #cbd5e1; color: #0f172a; background-color: #f8fafc;">PHONE MODEL</td>
        <td style="padding: 6px 12px; color: #0f172a;">${phoneModel}</td>
      </tr>
      <tr style="border-bottom: 1px solid #cbd5e1;">
        <td style="padding: 6px 12px; font-weight: bold; border-right: 1px solid #cbd5e1; color: #0f172a; background-color: #f8fafc;">DEVICE ID</td>
        <td style="padding: 6px 12px; font-family: monospace; color: #0f172a;">${deviceId}</td>
      </tr>
      <tr>
        <td style="padding: 6px 12px; font-weight: bold; border-right: 1px solid #cbd5e1; color: #0f172a; background-color: #f8fafc;">APPLICATION DATE</td>
        <td style="padding: 6px 12px; color: #0f172a;">${appDate}</td>
      </tr>
    </tbody>
  </table>
  ${imagesHtml}
  ${findingsHtml ? `<div style="margin: 16px 0;">${findingsHtml}</div>` : ''}
  <p style="margin: 16px 0 4px 0;"><strong>Conclusion:</strong></p>
  ${conclusionHtml}
</div>
`.trim();
}

export function hasBlankFields(state: ReportState): boolean {
  const plain = generatePlainTextReport(state);
  return plain.includes('____');
}

export async function convertDataUrlToPngBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be acquired'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas conversion to PNG failed'));
        }
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image for PNG conversion'));
    img.src = dataUrl;
  });
}
