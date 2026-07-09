import { useCaseForm } from '../hooks/useCaseForm';
import { StepNavigation } from '../components/ui/StepNavigation';
import { DeteriorationTable } from '../components/features/DeteriorationTable';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import type { Step3Data } from '../types/caseForm.types';

const ALL_PARAMETERS = ['Heart Rate', 'Systolic BP', 'SpO2', 'Resp Rate', 'Pain'];

interface Step3Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step3VitalThresholds({ onPrev, onNext }: Step3Props) {
  const { formData, dispatch } = useCaseForm();
  const { step3 } = formData;

  function update(partial: Partial<Step3Data>) {
    dispatch({ type: 'UPDATE_STEP3', payload: partial });
  }

  function toggleParameter(param: string) {
    const isActive = step3.activeParameters.includes(param);
    if (isActive) {
      update({ activeParameters: step3.activeParameters.filter((p) => p !== param) });
    } else {
      update({ activeParameters: [...step3.activeParameters, param] });
    }
  }

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Step 3: Vital Thresholds & Deterioration</h1>
        <p className="page-subtitle">
          Define the logic for patient deterioration and the critical safety boundaries for the simulation engine.
        </p>
      </div>

      {/* Engine Logic Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">〜</div>
          <div className="card-title">Engine Logic</div>
        </div>

        {/* Predefined Parameters */}
        <div style={{ marginBottom: '28px' }}>
          <div className="form-label" style={{ marginBottom: '10px' }}>Predefined Parameters</div>
          <div className="param-chip-group">
            {ALL_PARAMETERS.map((param) => (
              <button
                key={param}
                type="button"
                className={`param-chip ${step3.activeParameters.includes(param) ? 'active' : ''}`}
                onClick={() => toggleParameter(param)}
                id={`param-chip-${param.toLowerCase().replace(/\s/g, '-')}`}
              >
                {param}
              </button>
            ))}
          </div>
        </div>

        {/* Deterioration Logic */}
        <div>
          <div className="form-label" style={{ marginBottom: '10px' }}>Deterioration Logic</div>
          <DeteriorationTable
            rules={step3.deteriorationRules}
            onChange={(rules) => update({ deteriorationRules: rules })}
          />
        </div>

        <StepNavigation
          currentStep={3}
          onPrev={onPrev}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
          nextLabel="Next: Lab Results"
        />
      </div>

      {/* Pro Tip */}
      <div className="pro-tip-card">
        <div className="pro-tip-title">Pro Tip</div>
        <p className="pro-tip-text">
          Setting a wider gap between Warning and Fatal thresholds allows students more time to
          intervene before a "Code Blue" event is triggered in the simulation engine.
        </p>
      </div>
    </div>
  );
}
