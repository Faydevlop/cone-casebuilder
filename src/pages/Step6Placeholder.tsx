import { useCaseForm } from '../hooks/useCaseForm';
import { DHMSInput } from '../components/ui/DHMSInput';
import { StepNavigation } from '../components/ui/StepNavigation';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import { formatDuration } from '../types/caseForm.types';
import type { Step5Data } from '../types/caseForm.types';

interface Step5Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step6Placeholder({ onPrev, onNext }: Step5Props) {
  const { formData, dispatch } = useCaseForm();
  const { step5 } = formData;

  function update(partial: Partial<Step5Data>) {
    dispatch({ type: 'UPDATE_STEP5', payload: partial });
  }

  const successVal = step5.successThresholdSeconds;
  const partialVal = step5.partialThresholdSeconds;

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Scoring Criteria & Thresholds</h1>
        <p className="page-subtitle">
          Define performance benchmarks and time limits for grading the learner's simulation run.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
          Step 5 of 8 — Time-based Performance Rules
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', lineHeight: 1.6, margin: 0 }}>
            Configure the case duration targets that map to success or partial success outcomes. Any time exceeding the Partial Success Limit will be graded as a failed scenario attempt.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DHMSInput
              id="success-threshold"
              label="Success Threshold"
              value={successVal}
              onChange={(val) => update({ successThresholdSeconds: val })}
              hint="Case completed under this limit is a full success."
              min={10}
            />
            <DHMSInput
              id="partial-threshold"
              label="Partial Success Limit"
              value={partialVal}
              onChange={(val) => update({ partialThresholdSeconds: val })}
              hint="Upper bound for partial success. Exceeding this duration triggers failure."
              min={10}
            />
          </div>
        </div>
      </div>

      {/* Logic Preview Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3 className="card-title" style={{ marginBottom: '18px' }}>Grading Logic Preview</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Success Rule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            background: 'rgba(16, 185, 129, 0.04)'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--color-accent-green)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>Full Success Outcome</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                Learner completes the case successfully in less than <strong>{formatDuration(successVal)}</strong>.
              </div>
            </div>
          </div>

          {/* Partial Success Rule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            background: 'rgba(245, 158, 11, 0.04)'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--color-accent-amber)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>Partial Success Outcome</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                Learner completes the case in between <strong>{formatDuration(successVal)}</strong> and <strong>{formatDuration(partialVal)}</strong>.
              </div>
            </div>
          </div>

          {/* Failure Rule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.04)'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--color-accent-red)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>Failed Outcome</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                Learner takes <strong>{formatDuration(partialVal)}</strong> or more to complete the scenario.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <StepNavigation
          currentStep={5}
          onPrev={onPrev}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
        />
      </div>
    </div>
  );
}
