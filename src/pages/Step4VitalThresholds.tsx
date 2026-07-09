import { useCaseForm } from '../hooks/useCaseForm';
import { StepNavigation } from '../components/ui/StepNavigation';
import { DeteriorationTable } from '../components/features/DeteriorationTable';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import type { Step4Data } from '../types/caseForm.types';

const ALL_PARAMETERS = ['Heart Rate', 'Systolic BP', 'SpO2', 'Resp Rate', 'Pain'];

interface Step4Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step4VitalThresholds({ onPrev, onNext }: Step4Props) {
  const { formData, dispatch } = useCaseForm();
  const { step4 } = formData;

  function update(partial: Partial<Step4Data>) {
    dispatch({ type: 'UPDATE_STEP4', payload: partial });
  }

  function toggleParameter(param: string) {
    const isActive = step4.activeParameters.includes(param);
    if (isActive) {
      update({ activeParameters: step4.activeParameters.filter((p) => p !== param) });
    } else {
      update({ activeParameters: [...step4.activeParameters, param] });
    }
  }

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Vital Thresholds & Deterioration</h1>
        <p className="page-subtitle">
          Define which vital parameters are active in this simulation and configure the patient's
          physiological deterioration logic.
        </p>
      </div>

      {/* Parameters & Deterioration Card */}
      <div className="card">
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
          Step 4 of 8 — Vital Parameters
        </div>

        {/* Predefined Parameters */}
        <div style={{ marginBottom: '32px' }}>
          <div className="form-label" style={{ marginBottom: '10px' }}>Active Parameters</div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: '12px' }}>
            Select which vital signs will be tracked and can change during the simulation.
          </p>
          <div className="param-chip-group">
            {ALL_PARAMETERS.map((param) => (
              <button
                key={param}
                type="button"
                className={`param-chip ${step4.activeParameters.includes(param) ? 'active' : ''}`}
                onClick={() => toggleParameter(param)}
                id={`param-chip-${param.toLowerCase().replace(/\s/g, '-')}`}
              >
                {param}
              </button>
            ))}
          </div>
        </div>

        {/* Deterioration Rules */}
        <div>
          <div className="form-label" style={{ marginBottom: '4px' }}>Deterioration Rules</div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: '12px' }}>
            Each rule defines how a vital parameter changes automatically over time if no intervention is taken.
          </p>
          <DeteriorationTable
            rules={step4.deteriorationRules}
            onChange={(rules) => update({ deteriorationRules: rules })}
          />
        </div>

        <StepNavigation
          currentStep={4}
          onPrev={onPrev}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
          nextLabel="Next: Actions & Investigations"
        />
      </div>

      {/* Pro Tip */}
      <div className="pro-tip-card">
        <div className="pro-tip-title">Pro Tip</div>
        <p className="pro-tip-text">
          Setting a wider gap between warning and fatal thresholds allows students more time to
          intervene before a critical failure event is triggered in the simulation engine.
        </p>
      </div>
    </div>
  );
}
