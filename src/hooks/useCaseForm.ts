import { useContext } from 'react';
import { CaseFormContext } from '../context/CaseFormContext';

/**
 * Custom hook to access the global case form state and dispatch.
 * Must be used within a <CaseFormProvider>.
 */
export function useCaseForm() {
  const context = useContext(CaseFormContext);
  if (!context) {
    throw new Error('useCaseForm must be used within a CaseFormProvider');
  }
  return context;
}
