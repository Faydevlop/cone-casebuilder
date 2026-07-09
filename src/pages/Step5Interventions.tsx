import { useCaseForm } from '../hooks/useCaseForm';
import { StepNavigation } from '../components/ui/StepNavigation';
import { ActionCard } from '../components/features/ActionCard';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import type { InterventionAction } from '../types/caseForm.types';

function generateId() {
  return `action_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyAction(): InterventionAction {
  return {
    id: generateId(),
    actionName: '',
    actionType: '',
    timeCost: '',
    expectedEffects: '',
    isCriticalAction: false,
  };
}

interface Step5Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step5Interventions({ onPrev, onNext }: Step5Props) {
  const { formData, dispatch } = useCaseForm();
  const { step5, step4 } = formData;

  function updateActions(actions: InterventionAction[]) {
    dispatch({ type: 'UPDATE_STEP5', payload: { actions } });
  }

  function addAction() {
    updateActions([...step5.actions, createEmptyAction()]);
  }

  function updateAction(index: number, updated: InterventionAction) {
    const actions = [...step5.actions];
    actions[index] = updated;
    updateActions(actions);
  }

  function removeAction(index: number) {
    updateActions(step5.actions.filter((_, i) => i !== index));
  }

  // Summary stats derived from current state
  const totalInterventions = step5.actions.length;
  const criticalCount = step5.actions.filter((a) => a.isCriticalAction).length;
  const totalTests = step4.diagnosticTests.length;
  const estimatedCaseTime = Math.round(
    step5.actions.reduce((sum, a) => sum + (Number(a.timeCost) || 0), 0) / 60
  );

  return (
    <div className="page-animate">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Interventions & Allowed Actions</h1>
          <p className="page-subtitle">
            Define the medical actions available to the student and their physiological consequences.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addAction}
          id="btn-add-action"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Action
        </button>
      </div>

      {/* Two-column layout: Actions list + Summary Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Action Cards */}
        <div>
          {step5.actions.length === 0 ? (
            <div className="card">
              <div className="placeholder-page">
                <div className="placeholder-icon">💊</div>
                <div className="placeholder-title">No Actions Defined</div>
                <p className="placeholder-subtitle">
                  Add medical interventions that students can perform during the simulation.
                  Mark critical actions to track high-stakes decisions.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addAction}
                  style={{ marginTop: '20px' }}
                >
                  + Add First Action
                </button>
              </div>
            </div>
          ) : (
            <>
              {step5.actions.map((action, index) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  index={index}
                  onChange={(updated) => updateAction(index, updated)}
                  onRemove={() => removeAction(index)}
                />
              ))}
              <button type="button" className="add-row-btn" onClick={addAction} id="btn-add-more-action">
                + Add Another Action
              </button>
            </>
          )}

          <StepNavigation
            currentStep={5}
            onPrev={onPrev}
            onNext={onNext}
            onSaveDraft={() => saveDraftToLocalStorage(formData)}
            nextLabel="Next: Optimal Pathway"
          />
        </div>

        {/* Right: Case Summary Panel */}
        <div className="case-summary-panel" style={{ position: 'sticky', top: '80px' }}>
          <div className="case-summary-title">Case Summary</div>

          <div className="summary-stat">
            <span className="summary-stat-label">Total Steps Defined</span>
            <span className="summary-stat-value">5 / 8</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-label">Total Interventions</span>
            <span className="summary-stat-value">{totalInterventions}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-label">Diagnostic Tests</span>
            <span className="summary-stat-value">{totalTests}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-label">Critical Actions</span>
            <span className="summary-stat-value">{criticalCount}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-label">Est. Case Time</span>
            <span className="summary-stat-value">{estimatedCaseTime} Min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
