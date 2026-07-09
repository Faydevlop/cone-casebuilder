import type { CaseFormData } from '../types/caseForm.types';

/**
 * Serialises the full form data to a JSON string and
 * triggers a browser download of `case_output.json`.
 */
export function downloadCaseAsJson(formData: CaseFormData, filename = 'case_output.json'): void {
  const pathwayNames = formData.step7.pathwaySteps
    .map((step) => formData.step4.actions.find((a) => a.id === step.actionId)?.actionName)
    .filter(Boolean)
    .join(', ');

  const exportable = {
    ...formData,
    step4: {
      ...formData.step4,
      actions: formData.step4.actions.map(({ scanImageFile: _f, safePatientImageFile: _f2, ...rest }) => rest),
    },
    step6: {
      ...formData.step6,
      evidenceFiles: formData.step6.evidenceFiles.map(({ fileFile: _f, ...rest }) => rest),
    },
    step7: pathwayNames,
  };

  const json = JSON.stringify(exportable, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

/**
 * Saves a draft to localStorage so the user can resume later.
 */
export function saveDraftToLocalStorage(formData: CaseFormData): void {
  try {
    const exportable = {
      ...formData,
      step4: {
        ...formData.step4,
        actions: formData.step4.actions.map(({ scanImageFile: _f, safePatientImageFile: _f2, ...rest }) => rest),
      },
      step6: {
        ...formData.step6,
        evidenceFiles: formData.step6.evidenceFiles.map(({ fileFile: _f, ...rest }) => rest),
      },
    };
    localStorage.setItem('clinicaone_draft', JSON.stringify(exportable));
  } catch {
    console.warn('Could not save draft to localStorage.');
  }
}
