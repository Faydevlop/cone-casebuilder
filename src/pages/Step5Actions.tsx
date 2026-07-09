import { useState } from 'react';
import { useCaseForm } from '../hooks/useCaseForm';
import { StepNavigation } from '../components/ui/StepNavigation';
import { ActionCard } from '../components/features/ActionCard';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import { EMPTY_VITAL_EFFECT } from '../types/caseForm.types';
import type { CombinedAction } from '../types/caseForm.types';
import { PRESET_GROUPS, createActionFromPreset } from '../data/defaultActions';

function generateId() {
  return `action_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyAction(): CombinedAction {
  return {
    id: generateId(),
    actionName: '',
    actionCategory: '',
    timeCost: '',
    hasRecommendedWindow: false,
    recommendedWithinSeconds: '',
    scanImageUrl: null,
    scanImageFile: null,
    resultText: '',
    vitalEffectOnTime: { ...EMPTY_VITAL_EFFECT },
    vitalEffectDelayed: { ...EMPTY_VITAL_EFFECT },
    vitalEffectNotPerformed: { ...EMPTY_VITAL_EFFECT },
    completionScore: '',
    penaltyDelayed: '',
    penaltyNotPerformed: '',
    observation: { prompt: '', options: [] },
    medicationDose: '',
    safePatientImageUrl: null,
    safePatientImageFile: null,
  };
}

interface Step4Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step4Actions({ onPrev, onNext }: Step4Props) {
  const { formData, dispatch } = useCaseForm();
  const { step4 } = formData;
  const [showPresets, setShowPresets] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');

  function updateActions(actions: CombinedAction[]) {
    dispatch({ type: 'UPDATE_STEP4', payload: { actions } });
  }

  function addAction() {
    const newAction = createEmptyAction();
    updateActions([...step4.actions, newAction]);
    setTimeout(() => {
      document.getElementById(`action-card-${newAction.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function addPresetAction(presetData: Omit<CombinedAction, 'id'>) {
    const newAction = createActionFromPreset(presetData);
    updateActions([...step4.actions, newAction]);
    setTimeout(() => {
      document.getElementById(`action-card-${newAction.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function updateAction(index: number, updated: CombinedAction) {
    const actions = [...step4.actions];
    actions[index] = updated;
    updateActions(actions);
  }

  function removeAction(index: number) {
    updateActions(step4.actions.filter((_, i) => i !== index));
  }

  // Summary stats
  const total        = step4.actions.length;
  const imagingCount = step4.actions.filter((a) => a.actionCategory === 'Imaging').length;
  const labCount     = step4.actions.filter((a) => a.actionCategory === 'Lab Test').length;
  const procedureCount = step4.actions.filter((a) =>
    ['Procedure', 'Medication', 'Respiratory Support', 'Monitoring', 'Other'].includes(a.actionCategory)
  ).length;

  // Filtered presets
  const filteredPresets = PRESET_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(presetSearch.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="page-animate">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Actions & Investigations</h1>
          <p className="page-subtitle">
            Define every medical action, investigation, and test available to the student.
            Imaging actions support scan image uploads; each action has its own scoring matrix.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowPresets(!showPresets)}
            id="btn-toggle-presets"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: 4 }}>
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            {showPresets ? 'Hide Presets' : 'Add from Presets'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={addAction}
            id="btn-add-action"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Blank Action
          </button>
        </div>
      </div>

      {/* Preset Actions Panel */}
      {showPresets && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Default Action Presets</h3>
            <div style={{ position: 'relative', width: '240px' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Search presets..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                style={{ paddingLeft: '12px', fontSize: 'var(--font-size-sm)' }}
              />
            </div>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginBottom: '16px', marginTop: 0 }}>
            Click any preset below to add it with pre-filled values. You can edit all fields after adding.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
            {filteredPresets.map((group) => (
              <div key={group.category}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                  paddingBottom: '4px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  {group.category}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => addPresetAction(item.data)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: '1px solid var(--color-border)',
                        borderRadius: '20px',
                        background: 'var(--color-surface-alt)',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(99,102,241,0.12)';
                        (e.target as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'var(--color-surface-alt)';
                        (e.target as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                      }}
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredPresets.length === 0 && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: '12px 0' }}>
                No presets match "{presetSearch}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Actions</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{total}</span>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Imaging Studies</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{imagingCount}</span>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Tests</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{labCount}</span>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interventions</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{procedureCount}</span>
        </div>
      </div>

      {/* Action Cards (Full Width) */}
      <div>
        {step4.actions.length === 0 ? (
          <div className="card">
            <div className="placeholder-page">
              <div className="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="placeholder-title">No Actions Defined</div>
              <p className="placeholder-subtitle">
                Add medical actions, interventions, and diagnostic tests that students can perform
                during the simulation. Use presets for quick setup or add blank actions for custom configurations.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowPresets(true)}
                >
                  Browse Presets
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addAction}
                >
                  + Add Blank Action
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {step4.actions.map((action, index) => (
              <ActionCard
                key={action.id}
                action={action}
                index={index}
                onChange={(updated) => updateAction(index, updated)}
                onRemove={() => removeAction(index)}
              />
            ))}
            <button type="button" className="add-row-btn" onClick={addAction} id="btn-add-more-action" style={{ width: '100%', marginBottom: '24px' }}>
              + Add Another Action
            </button>
          </>
        )}

        <StepNavigation
          currentStep={4}
          onPrev={onPrev}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
          nextLabel="Next: Scoring Criteria"
        />
      </div>
    </div>
  );
}
