import { useState, useEffect } from 'react';
import type { CaseFormData } from '../types/caseForm.types';
import { formatDuration } from '../types/caseForm.types';
import { fetchCasesFromSheet, deleteCaseFromSheet } from '../utils/googleSheetsApi';

interface DashboardProps {
  onAddCase: () => void;
  onEditCase: (caseData: CaseFormData) => void;
}

interface SavedCaseSummary {
  id: string;
  title: string;
  speciality: string;
  category: string;
  timeLimit: number;
  actionsCount: number;
  evidenceCount: number;
  pathwayCount: number;
  updatedAt: string;
  fullData: CaseFormData;
  isVerified: boolean;
}

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
    (k) => effect[k] !== undefined && effect[k] !== null
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

export function Dashboard({ onAddCase, onEditCase }: DashboardProps) {
  const [cases, setCases] = useState<SavedCaseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingCase, setViewingCase] = useState<CaseFormData | null>(null);

  function loadCases() {
    setIsLoading(true);
    fetchCasesFromSheet()
      .then((sheetCases) => {
        const loaded: SavedCaseSummary[] = sheetCases.map((sc) => {
          let formattedDate = 'N/A';
          try {
            if (sc.updatedAt) {
              formattedDate = new Date(sc.updatedAt).toLocaleDateString();
            }
          } catch {}
          return {
            id: sc.caseId,
            title: sc.title,
            speciality: sc.speciality || 'Not specified',
            category: sc.category || 'general',
            timeLimit: sc.timeLimit || 0,
            actionsCount: sc.actionsCount || 0,
            evidenceCount: sc.evidenceCount || 0,
            pathwayCount: sc.pathwayCount || 0,
            updatedAt: formattedDate,
            fullData: sc.fullData,
            isVerified: !!sc.fullData?.isVerified,
          };
        });
        setCases(loaded);
      })
      .catch((err) => {
        console.error('Failed to fetch cases:', err);
        setCases([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function handleDelete(caseId: string) {
    setIsLoading(true);
    await deleteCaseFromSheet(caseId);
    setDeleteConfirm(null);
    loadCases();
  }

  const totalCases = cases.length;
  const emergencyCount = cases.filter((c) => String(c.category).toLowerCase() === 'emergency').length;
  const generalCount = cases.filter((c) => String(c.category).toLowerCase() === 'general').length;
  const draftsCount = 0; // Drafts not loaded from sheets

  return (
    <div className="page-animate">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Case Library Dashboard</h1>
          <p className="page-subtitle">
            Manage, review, and create patient simulation scenarios.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={loadCases}
            id="btn-refresh-dashboard"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: 4 }}>
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddCase}
            id="btn-dashboard-add-case"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '6px' }}>
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Case
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Scenarios</span>
          <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.1 }}>{totalCases}</span>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emergency Cases</span>
          <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'rgba(239, 68, 68, 0.9)', lineHeight: 1.1 }}>{emergencyCount}</span>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>General Cases</span>
          <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'rgba(16, 185, 129, 0.9)', lineHeight: 1.1 }}>{generalCount}</span>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Drafts</span>
          <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-secondary)', lineHeight: 1.1 }}>{draftsCount}</span>
        </div>
      </div>

      {/* Main Cases Table / List */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '18px' }}>Simulation Scenarios</h3>
        {isLoading ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="placeholder-page" style={{ padding: '48px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35} style={{ marginBottom: '12px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5m-3.375 0H12m-3 0H5.25m3 0H8.25" />
            </svg>
            <div className="placeholder-title">No Scenarios Yet</div>
            <p className="placeholder-subtitle" style={{ maxWidth: '400px', margin: '8px auto 20px' }}>
              Get started by adding your first patient simulation case. Define patient profiles, HPI details, actions, and scoring matrices.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAddCase}
            >
              + Create First Case
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Scenario Title</th>
                <th>Speciality</th>
                <th>Category</th>
                <th>Verification</th>
                <th>Time Limit</th>
                <th>Actions</th>
                <th>Evidence</th>
                <th>Pathway</th>
                <th style={{ textAlign: 'right' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{c.title}</td>
                  <td>{c.speciality}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: c.category === 'emergency' ? 'rgba(239,68,68,0.08)' : c.category === 'general' ? 'rgba(16,185,129,0.08)' : 'var(--color-badge-draft-bg)',
                      color: c.category === 'emergency' ? 'rgba(239,68,68,0.9)' : c.category === 'general' ? 'rgba(16,185,129,0.9)' : 'var(--color-secondary)',
                    }}>
                      {c.category}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: c.isVerified ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      color: c.isVerified ? 'var(--color-accent-green)' : 'var(--color-accent-amber)',
                    }}>
                      {c.isVerified ? 'Verified ✓' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDuration(c.timeLimit)}</td>
                  <td>{c.actionsCount}</td>
                  <td>{c.evidenceCount || 0}</td>
                  <td>{c.pathwayCount || 0} steps</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewingCase({ ...c.fullData, id: c.id })}
                        style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-primary)' }}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onEditCase(c.fullData)}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      {deleteConfirm === c.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(c.id)}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(null)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteConfirm(c.id)}
                          style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-accent-red)' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Case Report View Modal Overlay ─── */}
      {viewingCase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(6px)',
          padding: '24px',
        }} onClick={() => setViewingCase(null)}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '36px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--color-border)',
            position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={() => setViewingCase(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                fontSize: '20px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              &times;
            </button>

            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  ClinicaOne Simulation Scenario Report (caseId: {viewingCase.id || 'N/A'})
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                  {viewingCase.step1?.caseTitle || 'Untitled Scenario'}
                </h2>
                {viewingCase.step1?.addedBy && (
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                    Created By: <strong>{viewingCase.step1.addedBy}</strong>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: viewingCase.step1?.caseCategory === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: viewingCase.step1?.caseCategory === 'emergency' ? 'var(--color-accent-red)' : 'var(--color-accent-green)',
                }}>
                  {viewingCase.step1?.caseCategory || 'Category Not Set'}
                </span>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: '6px' }}>
                  Speciality: <strong>{viewingCase.step1?.speciality || 'Not Set'}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Section 1: Case Overview */}
              <div>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                  1. Case Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>TIME LIMIT</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {formatDuration(viewingCase.step1?.criticalTimeLimit || 0)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>SHOW COUNTDOWN TO LEARNER</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {viewingCase.step1?.showCountdown ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>LEARNING OBJECTIVES</span>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', whiteSpace: 'pre-line', marginTop: '4px' }}>
                      {viewingCase.step1?.learningObjective || 'No objectives specified.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Patient Demographics & Baseline Vitals */}
              {viewingCase.step2 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    2. Patient Demographics & Baseline Vitals
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>AGE</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{viewingCase.step2.age || 'Not specified'} years</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>GENDER</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{viewingCase.step2.gender}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HEIGHT</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{viewingCase.step2.height ? `${viewingCase.step2.height} ${viewingCase.step2.heightUnit}` : 'Not specified'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>WEIGHT</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{viewingCase.step2.weight ? `${viewingCase.step2.weight} ${viewingCase.step2.weightUnit}` : 'Not specified'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>BLOOD GROUP</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>{viewingCase.step2.bloodGroup || 'Not specified'}</div>
                    </div>
                  </div>

                  {viewingCase.step2.baselineVitals && (
                    <div style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>Baseline Vitals</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                        {Object.entries(viewingCase.step2.baselineVitals).map(([key, val]) => {
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
              )}

              {/* Section 3: Patient History */}
              {viewingCase.step3 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    3. Patient History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>OPENING LINE / INTRO</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px', fontStyle: 'italic' }}>
                          "{viewingCase.step3.openingLine || 'No opening line provided.'}"
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>CONSCIOUSNESS STATUS</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)', marginTop: '4px' }}>
                          {viewingCase.step3.isConscious ? 'Patient is conscious' : 'Patient is unconscious / semi-conscious'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>CHIEF COMPLAINT</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{viewingCase.step3.chiefComplaint || 'Not specified'}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HISTORY OF PRESENT ILLNESS (HPI)</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{viewingCase.step3.historyOfPresentIllness || 'Not specified'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>SYMPTOMS</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {viewingCase.step3.symptoms && viewingCase.step3.symptoms.length > 0 ? viewingCase.step3.symptoms.map((s) => (
                            <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                          )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>KNOWN DRUG/NON-DRUG ALLERGIES</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {viewingCase.step3.knownAllergies && viewingCase.step3.knownAllergies.length > 0 ? viewingCase.step3.knownAllergies.map((s) => (
                            <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                          )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>HABITS & LIFESTYLE</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {viewingCase.step3.habits && viewingCase.step3.habits.length > 0 ? viewingCase.step3.habits.map((s) => (
                            <span key={s} style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{s}</span>
                          )) : <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic' }}>None</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>PAST MEDICAL HISTORY</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{viewingCase.step3.pastMedicalHistory || 'Not specified'}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600 }}>FAMILY MEDICAL HISTORY</span>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: '4px' }}>{viewingCase.step3.familyMedicalHistory || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Actions & Investigations */}
              {viewingCase.step4 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    4. Configured Actions & Investigations ({viewingCase.step4.actions?.length || 0})
                  </h3>
                  
                  {!viewingCase.step4.actions || viewingCase.step4.actions.length === 0 ? (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
                      No actions defined.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {viewingCase.step4.actions.map((act, aIdx) => (
                        <div key={act.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                          <div style={{ background: 'var(--color-surface-alt)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                              #{aIdx + 1}: {act.actionName} {act.actionCategory === 'Medication' && act.medicationDose && `(${act.medicationDose})`}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {act.actionCategory || 'Other'}
                            </span>
                          </div>

                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                                <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>SCORING RULES</span>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                  <span style={{ color: 'var(--color-accent-green)' }}>+{act.completionScore || 0}</span> /{' '}
                                  <span style={{ color: 'var(--color-accent-amber)' }}>-{act.hasRecommendedWindow ? (act.penaltyDelayed || 0) : '0'}</span> /{' '}
                                  <span style={{ color: 'var(--color-accent-red)' }}>-{act.penaltyNotPerformed || 0}</span>
                                </div>
                              </div>
                            </div>

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
                                      <img src={act.scanImageUrl} alt="Before Scan" style={{ maxHeight: '90px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-border)' }} />
                                    </div>
                                  )}

                                  {act.actionCategory === 'Imaging' && act.safePatientImageUrl && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '160px' }}>
                                      <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-muted)' }}>SAFE PATIENT SCAN (AFTER)</span>
                                      <img src={act.safePatientImageUrl} alt="After Scan" style={{ maxHeight: '90px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-border)' }} />
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

                            {act.observation?.prompt && (
                              <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '10px', marginTop: '12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary)', display: 'block', marginBottom: '4px' }}>OBSERVATION PROMPT & ANSWERS</span>
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
              )}

              {/* Section 5: Scoring Thresholds */}
              {viewingCase.step5 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    5. Time Scoring Thresholds
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>Full Success Time Limit</span>
                      <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '6px' }}>&lt; {formatDuration(viewingCase.step5.successThresholdSeconds)}</div>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>Partial Success Window</span>
                      <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '6px' }}>{formatDuration(viewingCase.step5.successThresholdSeconds)} - {formatDuration(viewingCase.step5.partialThresholdSeconds)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 6: Evidence Pack */}
              {viewingCase.step6 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    6. Evidence Reference Files ({viewingCase.step6.evidenceFiles?.length || 0})
                  </h3>
                  {!viewingCase.step6.evidenceFiles || viewingCase.step6.evidenceFiles.length === 0 ? (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
                      No reference documents uploaded.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {viewingCase.step6.evidenceFiles.map((file) => (
                        <div key={file.id} style={{ padding: '12px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{file.name}</div>
                          {file.description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', marginTop: '2px' }}>{file.description}</div>}
                          {file.fileUrl && (
                            <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: 'var(--color-primary)', marginTop: '6px', display: 'inline-block', textDecoration: 'underline' }}>
                              View Attachment
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section 7: Clinical Pathway */}
              {viewingCase.step7 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    7. Expected Clinical Pathway Golden Path
                  </h3>
                  {!viewingCase.step7.pathwaySteps || viewingCase.step7.pathwaySteps.length === 0 ? (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
                      No pathway sequence created.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      {viewingCase.step7.pathwaySteps.map((step, idx) => {
                        const action = viewingCase.step4?.actions?.find((a) => a.id === step.actionId);
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
                            {idx < (viewingCase.step7?.pathwaySteps?.length || 0) - 1 && (
                              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rarr;</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 8: Feedback Notes */}
              {viewingCase.step8?.notes && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '8px', marginBottom: '14px' }}>
                    8. Feedback Notes
                  </h3>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', whiteSpace: 'pre-line' }}>
                    {viewingCase.step8.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '36px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setViewingCase(null)}
              >
                Close Report
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const dataToEdit = { ...viewingCase };
                  setViewingCase(null);
                  onEditCase(dataToEdit);
                }}
              >
                Edit Scenario
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
