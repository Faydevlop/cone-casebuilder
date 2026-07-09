// ─── Step 1: Case Overview ────────────────────────────────────────────────────
export interface Step1Data {
  caseTitle: string;
  learningObjective: string;
  criticalTimeLimit: number;        // stored in total seconds
  speciality: string;
  caseCategory: string;
  showCountdown: boolean;           // Toggle: show countdown to learner
  addedBy?: string;                 // User email who created/uploaded this case
}

// ─── Step 2: Patient Demographics & Baseline Vitals ──────────────────────────
export const BLOOD_GROUP_OPTIONS = [
  { value: '', label: 'Select blood group...' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export interface BaselineVitalsData {
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spO2: number;
  respRate: number;
  painScore: number;
}

export interface Step2Data {
  age: number | '';
  gender: string;
  weight: number | '';
  weightUnit: 'kg' | 'lbs';
  height: number | '';
  heightUnit: 'cm' | 'in';
  bloodGroup: string;
  baselineVitals: BaselineVitalsData;
}

// ─── Step 3: Patient History ──────────────────────────────────────────────────
export interface Step3Data {
  chiefComplaint: string;
  openingLine: string;              // Introductory statement
  historyOfPresentIllness: string;
  currentMedications: string;
  drugAllergies: string;
  knownAllergies: string[];
  habits: string[];
  pastMedicalHistory: string;
  symptoms: string[];
  familyMedicalHistory: string;
  isConscious: boolean;             // Toggle: conscious status
}

// ─── Vital Effect (per-vital-sign structured delta) ──────────────────────────
export interface VitalEffect {
  heartRate: number | null;
  bpSystolic: number | null;
  bpDiastolic: number | null;
  spO2: number | null;
  respRate: number | null;
  painScore: number | null;
}

export const EMPTY_VITAL_EFFECT: VitalEffect = {
  heartRate: null,
  bpSystolic: null,
  bpDiastolic: null,
  spO2: null,
  respRate: null,
  painScore: null,
};

// ─── Step 4: Actions & Investigations ───────────────────────────────────────
export type ActionCategory =
  | 'Imaging'
  | 'Lab Test'
  | 'Procedure'
  | 'Medication'
  | 'Respiratory Support'
  | 'Monitoring';

export interface ObservationOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Observation {
  prompt: string;
  options: ObservationOption[];
}

export interface CombinedAction {
  id: string;
  actionName: string;
  actionCategory: ActionCategory | '';
  // Timing – ALL stored in total seconds
  timeCost: number | '';
  hasRecommendedWindow: boolean;
  recommendedWithinSeconds: number | '';
  // Imaging / Lab result
  scanImageUrl: string | null;
  scanImageFile: File | null;
  resultText: string;
  // Vital effects – structured per-sign deltas
  vitalEffectOnTime: VitalEffect;
  vitalEffectDelayed: VitalEffect;
  vitalEffectNotPerformed: VitalEffect;
  // Scoring matrix
  completionScore: number | '';
  penaltyDelayed: number | '';
  penaltyNotPerformed: number | '';
  observation: Observation;
  medicationDose?: string; // Dose field if category is Medication
  safePatientImageUrl: string | null;
  safePatientImageFile: File | null;
}

export interface Step4Data {
  actions: CombinedAction[];
}

// ─── Steps 5, 6, 7: Placeholder ──────────────────────────────────────────────
export interface Step5Data {
  successThresholdSeconds: number | '';
  partialThresholdSeconds: number | '';
}

export interface EvidenceFile {
  id: string;
  name: string;
  fileUrl: string | null;
  fileFile: File | null;
  description: string;
}

export interface Step6Data {
  evidenceFiles: EvidenceFile[];
}

export interface PathwayStep {
  id: string;
  actionId: string;
  isCritical: boolean;
}

export interface Step7Data {
  pathwaySteps: PathwayStep[];
}

export interface Step8Data {
  notes: string;
}

// ─── Full Form Data ───────────────────────────────────────────────────────────
export interface CaseFormData {
  id?: string;                       // Unique 8-digit ID
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  step7: Step7Data;
  step8: Step8Data;
  isVerified?: boolean;              // Checker verification status flag
}

// ─── Step Config (drives sidebar nav & FormStepper) ──────────────────────────
export interface StepConfig {
  stepNumber: number;
  title: string;
  subtitle: string;
}

export const STEP_CONFIG: StepConfig[] = [
  { stepNumber: 1, title: 'Case Overview',    subtitle: 'Primary identifiers & goals' },
  { stepNumber: 2, title: 'Demographics',      subtitle: 'Vitals & basic profile' },
  { stepNumber: 3, title: 'Patient History',   subtitle: 'Complaints & background' },
  { stepNumber: 4, title: 'Actions',           subtitle: 'Interventions & tests' },
  { stepNumber: 5, title: 'Scoring Criteria',  subtitle: 'Outcomes & timing' },
  { stepNumber: 6, title: 'Evidence Pack',     subtitle: 'Reference files & guidelines' },
  { stepNumber: 7, title: 'Clinical Pathway',  subtitle: 'Expected action sequence' },
  { stepNumber: 8, title: 'Review & Publish',  subtitle: 'Final submission' },
];

export const TOTAL_STEPS = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert total seconds to DHMS split */
export function secondsToDHMS(total: number): { days: number; hours: number; minutes: number; seconds: number } {
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { days: d, hours: h, minutes: m, seconds: s };
}

/** Convert DHMS split to total seconds */
export function dhmsToSeconds(d: number, h: number, m: number, s: number): number {
  return d * 86400 + h * 3600 + m * 60 + s;
}

/** Format total seconds as "Xd Xh Xm Xs" */
export function formatDuration(total: number | '' | undefined): string {
  if (total === '' || total === undefined || total === 0) return '0s';
  const { days, hours, minutes, seconds } = secondsToDHMS(total);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}
