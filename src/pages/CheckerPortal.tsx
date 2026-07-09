import { useState, useEffect } from 'react';
import type { CaseFormData } from '../types/caseForm.types';
import { formatDuration } from '../types/caseForm.types';
import { fetchCasesFromSheet, updateCaseOnSheet } from '../utils/googleSheetsApi';

interface VitalEffect {
  heartRate?: number | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  spO2?: number | null;
  respRate?: number | null;
  painScore?: number | null;
}

function VitalBadges({ effect }: { effect: VitalEffect | string | undefined }) {
  if (!effect) {
    return <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>;
  }
  if (typeof effect === 'string') {
    return <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>{effect}</span>;
  }
  const labels: Record<string, string> = {
    heartRate: 'HR',
    bpSystolic: 'BP Sys',
    bpDiastolic: 'BP Dia',
    spO2: 'SpO2',
    respRate: 'RR',
    painScore: 'Pain',
  };
  const active = (Object.keys(effect) as (keyof VitalEffect)[]).filter(
    (k) => effect[k] !== undefined && effect[k] !== null && effect[k] !== ''
  );
  if (active.length === 0) {
    return <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {active.map((k) => {
        const val = effect[k];
        const numVal = Number(val);
        const isPositive = numVal > 0;
        if (numVal === 0) return null;
        return (
          <span
            key={k}
            style={{
              display: 'inline-block',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: isPositive ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
            }}
          >
            {labels[k] || k}: {isPositive ? '+' : ''}{val}
          </span>
        );
      })}
    </div>
  );
}

export function CheckerPortal() {
  const [cases, setCases] = useState<{ id: string; title: string; category: string; speciality: string; timeLimit: number; isVerified: boolean; fullData: CaseFormData }[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseFormData | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  function loadCases() {
    setIsLoading(true);
    fetchCasesFromSheet()
      .then((sheetCases) => {
        const formatted = sheetCases.map((c) => ({
          id: c.caseId,
          title: c.title,
          category: c.category,
          speciality: c.speciality,
          timeLimit: c.timeLimit,
          isVerified: !!c.fullData?.isVerified,
          fullData: c.fullData,
        }));
        setCases(formatted);
      })
      .catch((err) => {
        console.error('CheckerPortal load error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function handleVerify(caseId: string, caseData: CaseFormData) {
    setIsUpdating(true);
    const updatedData: CaseFormData = {
      ...caseData,
      isVerified: true,
    };

    const success = await updateCaseOnSheet(caseId, updatedData);
    setIsUpdating(false);

    if (success) {
      alert('Case marked as verified successfully!');
      // Update local state
      setSelectedCase(updatedData);
      loadCases();
    } else {
      alert('Failed to update case verification status. Check your connection or Apps Script setup.');
    }
  }

  function handleSelectCase(id: string, caseData: CaseFormData) {
    setSelectedCaseId(id);
    setSelectedCase(caseData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="page-animate">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Checker Verification Portal</h1>
          <p className="page-subtitle">
            Review and verify simulation scenarios fetched from the central spreadsheet.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={loadCases}
          disabled={isLoading}
        >
          Refresh List
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCase ? '320px 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* CASES DIRECTORY CARD */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Scenario Backlog</h3>
          
          {isLoading ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
              Loading cases...
            </p>
          ) : cases.length === 0 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
              No cases available in the central registry.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCase(c.id, c.fullData)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedCaseId === c.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: selectedCaseId === c.id ? 'rgba(99, 102, 241, 0.04)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                    {c.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      {c.speciality}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: c.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: c.isVerified ? 'var(--color-accent-green)' : 'var(--color-accent-amber)',
                    }}>
                      {c.isVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DETAILED READ-ONLY REPORT VIEW */}
        {selectedCase && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Verification Status Header Card */}
            <div className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--font-size-md)', color: 'var(--color-primary)' }}>Verification Status</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                  {selectedCase.isVerified ? 'This scenario has been successfully verified.' : 'Checker review is required before publishing.'}
                </p>
              </div>
              <div>
                {selectedCase.isVerified ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--color-accent-green)',
                  }}>
                    ✓ Case Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isUpdating}
                    onClick={() => handleVerify(selectedCaseId!, selectedCase)}
                  >
                    {isUpdating ? 'Updating...' : 'Mark as Verified'}
                  </button>
                )}
              </div>
            </div>

            {/* Read-Only Scenario Details Page (matching Step 8 preview style) */}
            <div className="card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                    {selectedCase.step1?.caseTitle || 'Untitled Scenario'}
                  </h2>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: '6px' }}>
                    Speciality: <strong>{selectedCase.step1?.speciality || 'Not Set'}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: selectedCase.step1?.caseCategory === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: selectedCase.step1?.caseCategory === 'emergency' ? 'var(--color-accent-red)' : 'var(--color-accent-green)',
                  }}>
                    {selectedCase.step1?.caseCategory || 'Category Not Set'}
                  </span>
                </div>
              </div>

              {/* Case Overview */}
              <div>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  1. Case Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>TIME LIMIT</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{formatDuration(selectedCase.step1?.criticalTimeLimit || 0)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>SHOW COUNTDOWN TO LEARNER</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{selectedCase.step1?.showCountdown ? 'Yes' : 'No'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>LEARNING OBJECTIVES</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', whiteSpace: 'pre-line', marginTop: '4px' }}>
                      {selectedCase.step1?.learningObjective || 'No objectives specified.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographics & Baseline Vitals */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  2. Patient Demographics & Baseline Vitals
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>AGE</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{selectedCase.step2?.age || 'Not specified'} years</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>GENDER</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{selectedCase.step2?.gender || 'Male'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HEIGHT</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{selectedCase.step2?.height || 'Not specified'} {selectedCase.step2?.heightUnit || 'cm'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>WEIGHT</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{selectedCase.step2?.weight || 'Not specified'} {selectedCase.step2?.weightUnit || 'kg'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>BLOOD GROUP</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{selectedCase.step2?.bloodGroup || 'Not specified'}</div>
                  </div>
                </div>

                {selectedCase.step2?.baselineVitals && (
                  <div style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>Baseline Vitals</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                      {Object.entries(selectedCase.step2.baselineVitals).map(([key, val]) => {
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
                )}
              </div>

              {/* Patient History */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  3. Patient History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>OPENING LINE / INTRO</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{selectedCase.step3?.openingLine || 'None'}"
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>CONSCIOUSNESS STATUS</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)', marginTop: '4px' }}>
                        {selectedCase.step3?.isConscious ? 'Conscious' : 'Unconscious'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>CHIEF COMPLAINT</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{selectedCase.step3?.chiefComplaint || 'Not specified'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HPI</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{selectedCase.step3?.historyOfPresentIllness || 'Not specified'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>SYMPTOMS</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {selectedCase.step3?.symptoms ? selectedCase.step3.symptoms.map((s) => (
                          <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                        )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>ALLERGIES</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {selectedCase.step3?.knownAllergies ? selectedCase.step3.knownAllergies.map((s) => (
                          <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                        )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HABITS</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {selectedCase.step3?.habits ? selectedCase.step3.habits.map((s) => (
                          <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                        )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>PAST MEDICAL HISTORY</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{selectedCase.step3?.pastMedicalHistory || 'Not specified'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>FAMILY MEDICAL HISTORY</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{selectedCase.step3?.familyMedicalHistory || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  4. Configured Actions & Investigations ({selectedCase.step4?.actions?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedCase.step4?.actions?.map((act, aIdx) => (
                    <div key={act.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--color-surface-alt)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: 700 }}>
                          #{aIdx + 1}: {act.actionName} {act.actionCategory === 'Medication' && act.medicationDose && `(${act.medicationDose})`}
                        </div>
                        <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {act.actionCategory || 'Other'}
                        </span>
                      </div>

                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Timings & scoring */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>TIME COST</span>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{formatDuration(act.timeCost)}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>RECOMMENDED TIME LIMIT</span>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                              {act.hasRecommendedWindow ? `Within ${formatDuration(act.recommendedWithinSeconds)}` : 'No Limit'}
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>SCORING RULES</span>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                              +{act.completionScore || 0} / -{act.penaltyDelayed || 0} / -{act.penaltyNotPerformed || 0}
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
                            <div style={{ marginTop: '4px' }}><VitalBadges effect={act.vitalEffectDelayed} /></div>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>VITAL EFFECTS (MISS)</span>
                            <div style={{ marginTop: '4px' }}><VitalBadges effect={act.vitalEffectNotPerformed} /></div>
                          </div>
                        </div>

                        {/* Result Text & Scans */}
                        {(act.resultText || act.scanImageUrl || act.safePatientImageUrl) && (
                          <div style={{ background: 'var(--color-surface-alt)', padding: '10px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                              {act.actionCategory === 'Imaging' ? 'PROFESSIONAL INSIGHTS' : 'RESULT INTERPRETATION'}
                            </span>
                            
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {act.scanImageUrl && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '140px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-muted)' }}>
                                    {act.actionCategory === 'Imaging' ? 'PATHOLOGICAL SCAN (BEFORE)' : 'LAB CHART'}
                                  </span>
                                  <img src={act.scanImageUrl} alt="Before Action Scan" style={{ maxHeight: '80px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-border)' }} />
                                </div>
                              )}

                              {act.actionCategory === 'Imaging' && act.safePatientImageUrl && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '140px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-muted)' }}>SAFE PATIENT SCAN (AFTER)</span>
                                  <img src={act.safePatientImageUrl} alt="After Action Scan" style={{ maxHeight: '80px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-border)' }} />
                                </div>
                              )}
                            </div>

                            {act.resultText && (
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                                {act.resultText}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Observation Question */}
                        {act.observation?.prompt && (
                          <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>OBSERVATION PROMPT</span>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Q: {act.observation.prompt}</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {act.observation.options?.map((opt) => (
                                <span key={opt.id} style={{
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: opt.isCorrect ? '1px solid var(--color-accent-green)' : '1px solid var(--color-border)',
                                  color: opt.isCorrect ? 'var(--color-accent-green)' : 'var(--color-muted)',
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
              </div>

              {/* Scoring */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  5. Scoring Criteria
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-lg)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-accent-green)', fontWeight: 700 }}>Success Threshold</span>
                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '6px' }}>&lt; {formatDuration(selectedCase.step5?.successThresholdSeconds || 0)}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-lg)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-accent-amber)', fontWeight: 700 }}>Partial Success Limit</span>
                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '6px' }}>{formatDuration(selectedCase.step5?.successThresholdSeconds || 0)} - {formatDuration(selectedCase.step5?.partialThresholdSeconds || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Evidence Pack */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  6. Evidence Pack
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedCase.step6?.evidenceFiles ? selectedCase.step6.evidenceFiles.map((file) => (
                    <div key={file.id} style={{ padding: '12px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{file.name}</div>
                      {file.description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: '2px' }}>{file.description}</div>}
                    </div>
                  )) : null}
                  {(!selectedCase.step6?.evidenceFiles || selectedCase.step6.evidenceFiles.length === 0) && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic' }}>No documents attached.</span>
                  )}
                </div>
              </div>

              {/* Clinical Pathway */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  7. Expected Pathway Sequence
                </h3>
                {!selectedCase.step7?.pathwaySteps || selectedCase.step7.pathwaySteps.length === 0 ? (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic' }}>No sequence defined.</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    {selectedCase.step7.pathwaySteps.map((step, idx) => {
                      const action = selectedCase.step4?.actions?.find((a) => a.id === step.actionId);
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
                          {idx < selectedCase.step7.pathwaySteps.length - 1 && (
                            <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rarr;</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feedback Notes */}
              {selectedCase.step8?.notes && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    8. Feedback Notes
                  </h3>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', whiteSpace: 'pre-line' }}>
                    {selectedCase.step8.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
