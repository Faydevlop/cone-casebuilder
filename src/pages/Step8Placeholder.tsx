import { useState } from 'react';
import { useCaseForm } from '../hooks/useCaseForm';
import { useAuth } from '../context/AuthContext';
import { StepNavigation } from '../components/ui/StepNavigation';
import { saveDraftToLocalStorage, downloadCaseAsJson } from '../utils/saveCase';
import { formatDuration } from '../types/caseForm.types';
import type { VitalEffect } from '../types/caseForm.types';

interface Step8Props {
  onPrev: () => void;
}

/** Render a VitalEffect as compact inline badges */
function VitalBadges({ effect }: { effect: VitalEffect | string }) {
  if (typeof effect === 'string') {
    return <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>{effect || 'None'}</span>;
  }
  const labels: Record<keyof VitalEffect, string> = {
    heartRate: 'HR',
    bpSystolic: 'BP Sys',
    bpDiastolic: 'BP Dia',
    spO2: 'SpO2',
    respRate: 'RR',
    painScore: 'Pain',
  };
  const active = (Object.keys(effect) as (keyof VitalEffect)[]).filter((k) => effect[k] !== null);
  if (active.length === 0) return <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {active.map((k) => {
        const val = effect[k]!;
        const isPositive = val >= 0;
        return (
          <span
            key={k}
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: '8px',
              background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: isPositive ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
            }}
          >
            {labels[k]}: {isPositive ? '+' : ''}{val}
          </span>
        );
      })}
    </div>
  );
}

export function Step8Placeholder({ onPrev }: Step8Props) {
  const { formData } = useCaseForm();
  const { step1, step2, step3, step4, step5, step6, step7 } = formData;
  const { userEmail } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit() {
    setIsSubmitting(true);
    
    // Download local backup JSON
    downloadCaseAsJson(formData);
    
    const pathwayNames = formData.step7.pathwaySteps
      .map((step) => formData.step4.actions.find((a) => a.id === step.actionId)?.actionName)
      .filter(Boolean)
      .join(', ');

    // Clean File objects for JSON upload
    const cleanData = {
      ...formData,
      step1: {
        ...formData.step1,
        addedBy: formData.step1.addedBy || userEmail || '',
      },
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

    const targetUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwb9xHHxUiKd6RFY-0-7jS7_rzzO8SufF-LKsz0rFT5ga0O8RHX80rTvZM_CTXvIPCe/exec';

    fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    })
      .then(() => {
        // Clear draft
        localStorage.removeItem('clinicaone_draft');
        
        // Save to published list in localStorage so it reflects on local dashboard
        try {
          const saved = localStorage.getItem('clinicaone_cases');
          const list = saved ? JSON.parse(saved) : [];
          const newCase = {
            id: `case_${Date.now()}`,
            title: step1.caseTitle || 'Untitled Case',
            speciality: step1.speciality || 'General',
            category: step1.caseCategory || 'general',
            timeLimit: step1.criticalTimeLimit || 720,
            actionsCount: step4.actions.length,
            evidenceCount: formData.step6.evidenceFiles.length,
            pathwayCount: step7.pathwaySteps.length,
            updatedAt: new Date().toLocaleDateString(),
            fullData: formData,
            isVerified: false,
          };
          list.push(newCase);
          localStorage.setItem('clinicaone_cases', JSON.stringify(list));
        } catch (e) {
          console.warn('Could not save to local cases list.', e);
        }
        
        alert('Case published successfully to Google Sheet! Local JSON backup downloaded.');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to publish to Google Sheet. Check console or internet connection.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const totalActions   = step4.actions.length;
  const imagingCount   = step4.actions.filter((a) => a.actionCategory === 'Imaging').length;
  const labCount       = step4.actions.filter((a) => a.actionCategory === 'Lab Test').length;
  const evidenceCount  = formData.step6.evidenceFiles.length;
  const pathwayCount   = step7.pathwaySteps.length;

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Review & Publish Scenario</h1>
        <p className="page-subtitle">
          Review all configured data in a single comprehensive report preview before publishing.
        </p>
      </div>

      {/* ─── Case Report Single Big Preview ─── */}
      <div className="card" style={{ padding: '36px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              ClinicaOne Simulation Scenario Report
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
              {step1.caseTitle || 'Untitled Scenario'}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: step1.caseCategory === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: step1.caseCategory === 'emergency' ? 'var(--color-accent-red)' : 'var(--color-accent-green)',
            }}>
              {step1.caseCategory || 'Category Not Set'}
            </span>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: '6px' }}>
              Speciality: <strong>{step1.speciality || 'Not Set'}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Case Overview */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            1. Case Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>TIME LIMIT</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                {formatDuration(step1.criticalTimeLimit)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>SHOW COUNTDOWN TO LEARNER</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                {step1.showCountdown ? 'Yes' : 'No'}
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>LEARNING OBJECTIVES</span>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', whiteSpace: 'pre-line', marginTop: '4px' }}>
                {step1.learningObjective || 'No objectives specified.'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Patient Demographics & Baseline Vitals */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            2. Patient Demographics & Baseline Vitals
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>AGE</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{step2.age || 'Not specified'} years</div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>GENDER</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{step2.gender}</div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HEIGHT</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{step2.height ? `${step2.height} ${step2.heightUnit}` : 'Not specified'}</div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>WEIGHT</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{step2.weight ? `${step2.weight} ${step2.weightUnit}` : 'Not specified'}</div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>BLOOD GROUP</span>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{step2.bloodGroup || 'Not specified'}</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>Baseline Vitals</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              {Object.entries(step2.baselineVitals).map(([key, val]) => {
                const labelMap: Record<string, string> = {
                  heartRate: 'HR',
                  bpSystolic: 'BP Sys',
                  bpDiastolic: 'BP Dia',
                  spO2: 'SpO2',
                  respRate: 'RR',
                  painScore: 'Pain'
                };
                const unitMap: Record<string, string> = {
                  heartRate: ' bpm',
                  bpSystolic: ' mmHg',
                  bpDiastolic: ' mmHg',
                  spO2: '%',
                  respRate: '/min',
                  painScore: '/10'
                };
                return (
                  <div key={key} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-secondary)' }}>{labelMap[key] || key}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                      {val}{unitMap[key]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Patient History */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            3. Patient History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>OPENING LINE / INTRO</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px', fontStyle: 'italic' }}>
                  "{step3.openingLine || 'No opening line provided.'}"
                </div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>CONSCIOUSNESS STATUS</span>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {step3.isConscious ? 'Patient is conscious' : 'Patient is unconscious / semi-conscious'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>CHIEF COMPLAINT</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{step3.chiefComplaint || 'Not specified'}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HISTORY OF PRESENT ILLNESS (HPI)</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{step3.historyOfPresentIllness || 'Not specified'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>SYMPTOMS</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {step3.symptoms.length > 0 ? step3.symptoms.map((s) => (
                    <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                  )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>KNOWN DRUG/NON-DRUG ALLERGIES</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {step3.knownAllergies.length > 0 ? step3.knownAllergies.map((s) => (
                    <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                  )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HABITS & LIFESTYLE</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {step3.habits.length > 0 ? step3.habits.map((s) => (
                    <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                  )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>PAST MEDICAL HISTORY</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{step3.pastMedicalHistory || 'Not specified'}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>FAMILY MEDICAL HISTORY</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{step3.familyMedicalHistory || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Actions & Investigations */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            4. Configured Actions & Investigations ({totalActions})
          </h3>
          
          {step4.actions.length === 0 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
              No actions defined.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {step4.actions.map((act, aIdx) => (
                <div key={act.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {/* Action row header */}
                  <div style={{ background: 'var(--color-surface-alt)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      #{aIdx + 1}: {act.actionName} {act.actionCategory === 'Medication' && act.medicationDose && `(${act.medicationDose})`}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {act.actionCategory || 'Other'}
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Time Cost & Recommended windows */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>TIME COST</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{formatDuration(act.timeCost)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>RECOMMENDED TIME LIMIT</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                          {act.hasRecommendedWindow ? `Perform within ${formatDuration(act.recommendedWithinSeconds)}` : 'No Limit'}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>SCORING RULES (OnTime / Delay / Miss)</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-accent-green)' }}>+{act.completionScore || 0}</span> /{' '}
                          <span style={{ color: 'var(--color-accent-amber)' }}>-{act.hasRecommendedWindow ? (act.penaltyDelayed || 0) : '0'}</span> /{' '}
                          <span style={{ color: 'var(--color-accent-red)' }}>-{act.penaltyNotPerformed || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vitals delta changes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>VITAL EFFECTS (ON TIME)</span>
                        <div style={{ marginTop: '4px' }}><VitalBadges effect={act.vitalEffectOnTime} /></div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>VITAL EFFECTS (DELAYED)</span>
                        <div style={{ marginTop: '4px' }}>
                          {act.hasRecommendedWindow ? <VitalBadges effect={act.vitalEffectDelayed} /> : <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>N/A</span>}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>VITAL EFFECTS (MISS)</span>
                        <div style={{ marginTop: '4px' }}><VitalBadges effect={act.vitalEffectNotPerformed} /></div>
                      </div>
                    </div>

                    {/* Results Interpretation & Scans */}
                    {(act.resultText || act.scanImageUrl || act.safePatientImageUrl) && (
                      <div style={{ background: 'var(--color-surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                          {act.actionCategory === 'Imaging' ? 'PROFESSIONAL INSIGHTS' : 'RESULT INTERPRETATION'}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          {act.scanImageUrl && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '160px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-muted)' }}>
                                {act.actionCategory === 'Imaging' ? 'PATHOLOGICAL SCAN (BEFORE)' : 'LAB CHART'}
                              </span>
                              <img src={act.scanImageUrl} alt="Before Action Scan" style={{ maxHeight: '90px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-border)' }} />
                            </div>
                          )}

                          {act.actionCategory === 'Imaging' && act.safePatientImageUrl && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '160px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-muted)' }}>SAFE PATIENT SCAN (AFTER)</span>
                              <img src={act.safePatientImageUrl} alt="After Action Scan" style={{ maxHeight: '90px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-border)' }} />
                            </div>
                          )}
                        </div>

                        {act.resultText && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            {act.resultText}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Observation Question prompt & options */}
                    {act.observation?.prompt && (
                      <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '10px', marginTop: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary)', display: 'block', marginBottom: '4px' }}>OBSERVATION PROMPT & CORRECT ANSWER</span>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>Q: {act.observation.prompt}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {act.observation.options.map((opt) => (
                            <span key={opt.id} style={{
                              fontSize: '10px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: opt.isCorrect ? '1px solid var(--color-accent-green)' : '1px solid var(--color-border)',
                              background: opt.isCorrect ? 'rgba(16,185,129,0.06)' : 'transparent',
                              color: opt.isCorrect ? 'var(--color-accent-green)' : 'var(--color-muted)',
                              fontWeight: opt.isCorrect ? 600 : 400
                            }}>
                              {opt.text} {opt.isCorrect && '✓'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Scoring Criteria */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            5. Time Scoring Thresholds
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>Full Success Time Limit</span>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '6px' }}>&lt; {formatDuration(step5.successThresholdSeconds)}</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>Partial Success Window</span>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '6px' }}>{formatDuration(step5.successThresholdSeconds)} - {formatDuration(step5.partialThresholdSeconds)}</div>
            </div>
          </div>
        </div>

        {/* Section 6: Evidence Pack */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            6. Evidence Reference Files ({evidenceCount})
          </h3>
          {step6.evidenceFiles.length === 0 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
              No reference documents uploaded.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {step6.evidenceFiles.map((file) => (
                <div key={file.id} style={{ padding: '12px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{file.name}</div>
                  {file.description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', marginTop: '2px' }}>{file.description}</div>}
                  {file.fileFile && <div style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '4px' }}>📎 {file.fileFile.name}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 7: Expected Clinical Pathway Sequence */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
            7. Expected Clinical Pathway Golden Path
          </h3>
          {pathwayCount === 0 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
              No timeline sequence created.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {step7.pathwaySteps.map((step, idx) => {
                const action = step4.actions.find((a) => a.id === step.actionId);
                return (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '8px 14px',
                      background: 'var(--color-surface-alt)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '20px',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}>
                        {idx + 1}
                      </span>
                      <span>{action ? action.actionName : 'Unknown'}</span>
                    </div>
                    {idx < pathwayCount - 1 && (
                      <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rarr;</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ready to export and submit navigation */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="placeholder-page" style={{ minHeight: 140, padding: '24px 0' }}>
          <div className="placeholder-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="placeholder-title">Ready to Export</div>
          <p className="placeholder-subtitle" style={{ margin: '8px 0 0 0' }}>
            Click "Submit & Export JSON" below to download your complete case configuration
            as a <code>case_output.json</code> file ready for the simulation engine.
          </p>
        </div>

        <StepNavigation
          currentStep={8}
          onPrev={onPrev}
          onNext={() => {}}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
          isLastStep={true}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
