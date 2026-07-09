import React, { createContext, useReducer, type ReactNode } from 'react';
import type { CaseFormData, Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data, Step7Data, Step8Data } from '../types/caseForm.types';

// ─── Initial State ─────────────────────────────────────────────────────────────

export function generate8DigitId(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

const initialFormData: CaseFormData = {
  id: generate8DigitId(),
  step1: {
    caseTitle: '',
    learningObjective: '',
    criticalTimeLimit: 720,       // 12 minutes in seconds
    speciality: '',
    caseCategory: '',
    showCountdown: true,
    addedBy: '',
  },
  step2: {
    age: '',
    gender: 'Male',
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    bloodGroup: '',
    baselineVitals: {
      heartRate: 72,
      bpSystolic: 120,
      bpDiastolic: 80,
      spO2: 98,
      respRate: 16,
      painScore: 0,
    },
  },
  step3: {
    chiefComplaint: '',
    openingLine: '',
    historyOfPresentIllness: '',
    currentMedications: '',
    drugAllergies: '',
    knownAllergies: [],
    habits: [],
    pastMedicalHistory: '',
    symptoms: [],
    familyMedicalHistory: '',
    isConscious: true,
  },
  step4: {
    actions: [],
  },
  step5: {
    successThresholdSeconds: 5400,    // 90 minutes in seconds
    partialThresholdSeconds: 7200,    // 120 minutes in seconds
  },
  step6: {
    evidenceFiles: [],
  },
  step7: {
    pathwaySteps: [],
  },
  step8: { notes: '' },
  isVerified: false,
};

// ─── Action Types ──────────────────────────────────────────────────────────────

type CaseFormAction =
  | { type: 'UPDATE_STEP1'; payload: Partial<Step1Data> }
  | { type: 'UPDATE_STEP2'; payload: Partial<Step2Data> }
  | { type: 'UPDATE_STEP3'; payload: Partial<Step3Data> }
  | { type: 'UPDATE_STEP4'; payload: Partial<Step4Data> }
  | { type: 'UPDATE_STEP5'; payload: Partial<Step5Data> }
  | { type: 'UPDATE_STEP6'; payload: Partial<Step6Data> }
  | { type: 'UPDATE_STEP7'; payload: Partial<Step7Data> }
  | { type: 'UPDATE_STEP8'; payload: Partial<Step8Data> }
  | { type: 'LOAD_CASE'; payload: CaseFormData }
  | { type: 'RESET_FORM' };

// ─── Reducer ───────────────────────────────────────────────────────────────────

function caseFormReducer(state: CaseFormData, action: CaseFormAction): CaseFormData {
  switch (action.type) {
    case 'UPDATE_STEP1': return { ...state, step1: { ...state.step1, ...action.payload } };
    case 'UPDATE_STEP2': return { ...state, step2: { ...state.step2, ...action.payload } };
    case 'UPDATE_STEP3': return { ...state, step3: { ...state.step3, ...action.payload } };
    case 'UPDATE_STEP4': return { ...state, step4: { ...state.step4, ...action.payload } };
    case 'UPDATE_STEP5': return { ...state, step5: { ...state.step5, ...action.payload } };
    case 'UPDATE_STEP6': return { ...state, step6: { ...state.step6, ...action.payload } };
    case 'UPDATE_STEP7': return { ...state, step7: { ...state.step7, ...action.payload } };
    case 'UPDATE_STEP8': return { ...state, step8: { ...state.step8, ...action.payload } };
    case 'LOAD_CASE':    return action.payload;
    case 'RESET_FORM':   return { ...initialFormData, id: generate8DigitId() };
    default:             return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface CaseFormContextValue {
  formData: CaseFormData;
  dispatch: React.Dispatch<CaseFormAction>;
}

export const CaseFormContext = createContext<CaseFormContextValue | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────

interface CaseFormProviderProps {
  children: ReactNode;
}

export function CaseFormProvider({ children }: CaseFormProviderProps) {
  const [formData, dispatch] = useReducer(caseFormReducer, initialFormData);

  return (
    <CaseFormContext.Provider value={{ formData, dispatch }}>
      {children}
    </CaseFormContext.Provider>
  );
}
