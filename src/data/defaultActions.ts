import type { CombinedAction, VitalEffect } from '../types/caseForm.types';
import { EMPTY_VITAL_EFFECT } from '../types/caseForm.types';

/**
 * Default / preset actions that can be quickly added to a case.
 * All timing values are in seconds.
 * Users can modify any field after adding.
 */

function makeId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function preset(
  name: string,
  category: CombinedAction['actionCategory'],
  timeCostSec: number,
  recommendSec: number,
  completionScore: number,
  penaltyDelayed: number,
  penaltyNotPerformed: number,
  resultText = '',
  vitalOnTime: Partial<VitalEffect> = {},
): Omit<CombinedAction, 'id'> {
  return {
    actionName: name,
    actionCategory: category,
    timeCost: timeCostSec,
    hasRecommendedWindow: recommendSec > 0,
    recommendedWithinSeconds: recommendSec,
    scanImageUrl: null,
    scanImageFile: null,
    resultText,
    vitalEffectOnTime: { ...EMPTY_VITAL_EFFECT, ...vitalOnTime },
    vitalEffectDelayed: { ...EMPTY_VITAL_EFFECT },
    vitalEffectNotPerformed: { ...EMPTY_VITAL_EFFECT },
    completionScore,
    penaltyDelayed,
    penaltyNotPerformed,
    observation: { prompt: '', options: [] },
    medicationDose: '',
    safePatientImageUrl: null,
    safePatientImageFile: null,
  };
}

export interface PresetGroup {
  category: string;
  items: { label: string; data: Omit<CombinedAction, 'id'> }[];
}

export const PRESET_GROUPS: PresetGroup[] = [
  {
    category: 'Imaging',
    items: [
      { label: 'Chest X-ray (PA)', data: preset('Chest X-ray (PA)', 'Imaging', 120, 600, 15, 5, 10, 'PA view of chest radiograph.') },
      { label: '12-Lead ECG', data: preset('12-Lead ECG', 'Imaging', 60, 300, 20, 8, 15, 'Standard 12-lead electrocardiogram tracing.') },
      { label: 'CT Head (Non-contrast)', data: preset('CT Head (Non-contrast)', 'Imaging', 300, 900, 15, 5, 10, 'Non-contrast computed tomography of the head.') },
      { label: 'Lung Ultrasound (POCUS)', data: preset('Lung Ultrasound (POCUS)', 'Imaging', 90, 600, 15, 5, 8, 'Point-of-care lung ultrasound.') },
      { label: 'Abdominal Ultrasound', data: preset('Abdominal Ultrasound', 'Imaging', 180, 900, 12, 4, 8, 'Focused abdominal ultrasound (FAST).') },
      { label: 'CT Chest (with contrast)', data: preset('CT Chest (with contrast)', 'Imaging', 300, 1200, 15, 5, 10, 'Contrast-enhanced CT of the chest.') },
      { label: 'Echocardiogram (Bedside)', data: preset('Echocardiogram (Bedside)', 'Imaging', 180, 900, 15, 5, 10, 'Bedside transthoracic echocardiography.') },
    ],
  },
  {
    category: 'Lab Test',
    items: [
      { label: 'Complete Blood Count (CBC)', data: preset('Complete Blood Count (CBC)', 'Lab Test', 180, 600, 10, 3, 8, 'WBC, RBC, Hgb, Hct, Platelets.') },
      { label: 'Arterial Blood Gas (ABG)', data: preset('Arterial Blood Gas (ABG)', 'Lab Test', 120, 300, 15, 5, 12, 'pH, pCO2, pO2, HCO3, Base Excess.') },
      { label: 'Basic Metabolic Panel (BMP)', data: preset('Basic Metabolic Panel (BMP)', 'Lab Test', 180, 600, 10, 3, 8, 'Na, K, Cl, CO2, BUN, Cr, Glucose, Ca.') },
      { label: 'Troponin I / T', data: preset('Troponin I / T', 'Lab Test', 240, 600, 15, 5, 12, 'Cardiac troponin level.') },
      { label: 'D-Dimer', data: preset('D-Dimer', 'Lab Test', 180, 600, 10, 3, 8, 'Fibrin degradation product level.') },
      { label: 'Blood Culture (x2 sets)', data: preset('Blood Culture (x2 sets)', 'Lab Test', 120, 600, 10, 3, 8, 'Aerobic and anaerobic cultures.') },
      { label: 'Urinalysis', data: preset('Urinalysis', 'Lab Test', 120, 900, 8, 2, 5, 'Urine dipstick and microscopy.') },
      { label: 'Coagulation Panel (PT/INR)', data: preset('Coagulation Panel (PT/INR)', 'Lab Test', 180, 600, 10, 3, 6, 'PT, INR, aPTT.') },
      { label: 'Lactate Level', data: preset('Lactate Level', 'Lab Test', 120, 300, 12, 4, 10, 'Serum lactate (venous or arterial).') },
    ],
  },
  {
    category: 'Procedure',
    items: [
      { label: 'IV Cannulation (Peripheral)', data: preset('IV Cannulation (Peripheral)', 'Procedure', 60, 300, 15, 5, 15) },
      { label: 'Endotracheal Intubation', data: preset('Endotracheal Intubation', 'Procedure', 120, 600, 25, 10, 20, '', { spO2: 5, heartRate: -10 }) },
      { label: 'Chest Tube Insertion', data: preset('Chest Tube Insertion', 'Procedure', 300, 900, 20, 8, 15, '', { spO2: 8, respRate: -4 }) },
      { label: 'Needle Decompression', data: preset('Needle Decompression', 'Procedure', 60, 300, 25, 10, 25, '', { spO2: 10, bpSystolic: 15, heartRate: -15 }) },
      { label: 'Foley Catheter Insertion', data: preset('Foley Catheter Insertion', 'Procedure', 120, 900, 8, 2, 5) },
      { label: 'Central Venous Catheter (CVC)', data: preset('Central Venous Catheter (CVC)', 'Procedure', 300, 900, 15, 5, 10) },
      { label: 'Lumbar Puncture', data: preset('Lumbar Puncture', 'Procedure', 300, 1200, 15, 5, 10, 'CSF analysis results.') },
      { label: 'Wound Suturing', data: preset('Wound Suturing', 'Procedure', 300, 1800, 10, 3, 5) },
    ],
  },
  {
    category: 'Medication',
    items: [
      { label: 'IV Normal Saline Bolus (1L)', data: preset('IV Normal Saline Bolus (1L)', 'Medication', 30, 600, 10, 3, 8, '', { bpSystolic: 10, heartRate: -5 }) },
      { label: 'Epinephrine 1mg IV Push', data: preset('Epinephrine 1mg IV Push', 'Medication', 15, 120, 25, 10, 25, '', { heartRate: 20, bpSystolic: 25 }) },
      { label: 'Aspirin 325mg PO', data: preset('Aspirin 325mg PO', 'Medication', 30, 600, 12, 4, 10) },
      { label: 'Nitroglycerin 0.4mg SL', data: preset('Nitroglycerin 0.4mg SL', 'Medication', 30, 300, 12, 4, 8, '', { bpSystolic: -10 }) },
      { label: 'Morphine 2-4mg IV', data: preset('Morphine 2-4mg IV', 'Medication', 30, 600, 10, 3, 5, '', { painScore: -3, respRate: -2 }) },
      { label: 'Amiodarone 150mg IV', data: preset('Amiodarone 150mg IV', 'Medication', 30, 600, 15, 5, 12, '', { heartRate: -15 }) },
      { label: 'Heparin Drip (Protocol)', data: preset('Heparin Drip (Protocol)', 'Medication', 60, 900, 10, 3, 8) },
      { label: 'Antibiotics (Broad Spectrum)', data: preset('Antibiotics (Broad Spectrum)', 'Medication', 60, 600, 15, 5, 15) },
    ],
  },
  {
    category: 'Respiratory Support',
    items: [
      { label: 'Nasal Cannula O2 (2-6L)', data: preset('Nasal Cannula O2 (2-6L)', 'Respiratory Support', 15, 300, 10, 3, 8, '', { spO2: 4 }) },
      { label: 'Non-Rebreather Mask (15L)', data: preset('Non-Rebreather Mask (15L)', 'Respiratory Support', 15, 300, 12, 4, 10, '', { spO2: 8 }) },
      { label: 'BiPAP / CPAP', data: preset('BiPAP / CPAP', 'Respiratory Support', 60, 600, 15, 5, 12, '', { spO2: 6, respRate: -3 }) },
      { label: 'Bag-Valve-Mask (BVM)', data: preset('Bag-Valve-Mask (BVM)', 'Respiratory Support', 15, 120, 15, 5, 15, '', { spO2: 6 }) },
      { label: 'High-Flow Nasal Cannula (HFNC)', data: preset('High-Flow Nasal Cannula (HFNC)', 'Respiratory Support', 30, 600, 12, 4, 10, '', { spO2: 6, respRate: -2 }) },
    ],
  },
  {
    category: 'Monitoring',
    items: [
      { label: 'Continuous Cardiac Monitoring', data: preset('Continuous Cardiac Monitoring', 'Monitoring', 30, 300, 10, 3, 10) },
      { label: 'Pulse Oximetry (Continuous)', data: preset('Pulse Oximetry (Continuous)', 'Monitoring', 15, 300, 8, 2, 8) },
      { label: 'Arterial Line Placement', data: preset('Arterial Line Placement', 'Monitoring', 300, 900, 12, 4, 8) },
      { label: 'Blood Pressure Monitoring (NIBP)', data: preset('Blood Pressure Monitoring (NIBP)', 'Monitoring', 15, 300, 8, 2, 6) },
      { label: 'Temperature Monitoring', data: preset('Temperature Monitoring', 'Monitoring', 15, 600, 5, 1, 3) },
      { label: 'End-Tidal CO2 (EtCO2)', data: preset('End-Tidal CO2 (EtCO2)', 'Monitoring', 30, 300, 10, 3, 8) },
    ],
  },
];

/** Create a full CombinedAction from a preset template */
export function createActionFromPreset(presetData: Omit<CombinedAction, 'id'>): CombinedAction {
  return {
    id: makeId(),
    ...presetData,
  };
}
