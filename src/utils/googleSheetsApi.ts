import type { CaseFormData } from '../types/caseForm.types';

const SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwb9xHHxUiKd6RFY-0-7jS7_rzzO8SufF-LKsz0rFT5ga0O8RHX80rTvZM_CTXvIPCe/exec';

export interface SheetCase {
  caseId: string;
  title: string;
  speciality: string;
  category: string;
  timeLimit: number;
  actionsCount: number;
  evidenceCount: number;
  pathwayCount: number;
  updatedAt: string;
  fullData: CaseFormData;
}

/**
 * Fetch all cases from the Google Sheet.
 * Requires the Apps Script to handle GET requests with ?action=list
 */
export async function fetchCasesFromSheet(): Promise<SheetCase[]> {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=list`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.cases || [];
  } catch (err) {
    console.warn('Could not fetch cases from Google Sheet. Falling back to localStorage.', err);
    return [];
  }
}

/**
 * Delete a case from the Google Sheet by caseId.
 * Requires the Apps Script to handle POST with action=delete
 */
export async function deleteCaseFromSheet(caseId: string): Promise<boolean> {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', caseId }),
    });
    return true;
  } catch (err) {
    console.error('Failed to delete case from sheet:', err);
    return false;
  }
}

/**
 * Update a case on the Google Sheet.
 * Requires the Apps Script to handle POST with action=update
 */
export async function updateCaseOnSheet(caseId: string, formData: CaseFormData, userEmail?: string | null): Promise<boolean> {
  try {
    const pathwayNames = (formData.step7?.pathwaySteps || [])
      .map((step) => formData.step4?.actions?.find((a) => a.id === step.actionId)?.actionName)
      .filter(Boolean)
      .join(', ');

    const cleanData = {
      ...formData,
      step1: {
        ...(formData.step1 || {}),
        addedBy: formData.step1?.addedBy || userEmail || '',
      },
      step4: {
        ...(formData.step4 || {}),
        actions: (formData.step4?.actions || []).map(({ scanImageFile: _f, safePatientImageFile: _f2, ...rest }) => rest),
      },
      step6: {
        ...(formData.step6 || {}),
        evidenceFiles: (formData.step6?.evidenceFiles || []).map(({ fileFile: _f, ...rest }) => rest),
      },
      step7: pathwayNames,
    };

    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', caseId, data: cleanData }),
    });
    return true;
  } catch (err) {
    console.error('Failed to update case on sheet:', err);
    return false;
  }
}
