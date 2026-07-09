import { useCaseForm } from '../hooks/useCaseForm';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Input } from '../components/ui/Input';
import { DHMSInput } from '../components/ui/DHMSInput';
import { StepNavigation } from '../components/ui/StepNavigation';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';

interface Step1Props {
  onNext: () => void;
}

export function Step1CaseOverview({ onNext }: Step1Props) {
  const { formData, dispatch } = useCaseForm();
  const { step1 } = formData;

  function update(partial: Partial<typeof step1>) {
    dispatch({ type: 'UPDATE_STEP1', payload: partial });
  }

  const isGeneral = step1.caseCategory === 'general';
  const timeLimitLabel = isGeneral ? 'Time Limit' : 'Critical Time Limit';

  return (
    <div className="page-animate">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Faculty Case Builder</h1>
            <p className="page-subtitle">
              Define pedagogical parameters and clinical triggers for a new simulation scenario.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        {/* Step Header inside card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Step 1 of 8
            </div>
            <h2 className="step-title">1. Case Overview</h2>
            <p className="step-subtitle">
              Establish the primary identifiers and pedagogical goals for this simulation.
            </p>
          </div>
          {/* Decorative medical icon */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity={0.12}>
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
            <path d="M32 18v28M18 32h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <Input
            id="case-title"
            label="Case Title"
            placeholder="e.g. Chest Pain → Pneumothorax (progresses to tension if missed)"
            value={step1.caseTitle}
            onChange={(e) => update({ caseTitle: e.target.value })}
            hint="Display name visible to faculty and students."
          />

          <Textarea
            id="learning-objective"
            label="Learning Objective"
            placeholder={"1. Recognize the condition as a chest-pain mimic.\n2. Use appropriate diagnostics early.\n3. Treat without waiting on imaging."}
            value={step1.learningObjective}
            onChange={(e) => update({ learningObjective: e.target.value })}
            hint="Define what clinical competence looks like for this specific scenario."
            style={{ minHeight: 120 }}
          />

          <Select
            id="speciality"
            label="Speciality"
            options={[
              { value: 'Surgical Cases', label: 'Surgical Cases' },
              { value: 'Neurological Cases', label: 'Neurological Cases' },
              { value: 'Cardiovascular Cases', label: 'Cardiovascular Cases' },
              { value: 'Respiratory Cases', label: 'Respiratory Cases' },
              { value: 'Gastrointestinal Cases', label: 'Gastrointestinal Cases' },
              { value: 'Musculoskeletal Cases', label: 'Musculoskeletal Cases' },
              { value: 'Genitourinary Cases', label: 'Genitourinary Cases' },
              { value: 'Endocrine Cases', label: 'Endocrine Cases' },
              { value: 'Integumentary Cases', label: 'Integumentary Cases' },
              { value: 'Hematologic Cases', label: 'Hematologic Cases' },
              { value: 'Immune Cases', label: 'Immune Cases' },
              { value: 'Psychiatric Cases', label: 'Psychiatric Cases' },
            ]}
            value={step1.speciality}
            onChange={(e) => update({ speciality: e.target.value })}
            hint="The medical speciality this case belongs to."
          />

          <Select
            id="caseCategory"
            label="Case Category"
            options={[
              { value: 'general', label: 'General' },
              { value: 'emergency', label: 'Emergency' },
            ]}
            value={step1.caseCategory}
            onChange={(e) => update({ caseCategory: e.target.value })}
            hint="The type of case this is."
          />

          {/* Countdown toggle switch */}
          <div className="form-group" style={{ marginTop: '-10px', marginBottom: '10px' }}>
            <ToggleSwitch
              id="show-countdown"
              checked={step1.showCountdown}
              onChange={(val) => update({ showCountdown: val })}
              label="Show countdown in learner side"
            />
          </div>

          {/* Timer behaviour info banner — shown only when a category is selected */}
          {step1.caseCategory && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '10px',
                border: `1px solid ${step1.caseCategory === 'emergency' ? 'rgba(239,68,68,0.35)' : 'rgba(99,179,137,0.35)'}`,
                background: step1.caseCategory === 'emergency'
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(99,179,137,0.08)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 700,
                    color: step1.caseCategory === 'emergency' ? 'rgba(239,68,68,0.9)' : 'rgba(99,179,137,0.95)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {step1.caseCategory === 'emergency' ? 'Emergency — Countdown Timer' : 'General — Count-Up Timer'}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', lineHeight: 1.55 }}>
                  {step1.caseCategory === 'emergency'
                    ? 'The timer will count down from the Critical Time Limit. When it reaches zero, the session ends or a critical failure is triggered — simulating a real-world emergency deadline.'
                    : 'The timer will count up from zero and the learner must complete the case within the Time Limit set below. While it is still a completion deadline, general cases allow significantly more time than emergency scenarios.'}
                </span>
              </div>
            </div>
          )}

          <DHMSInput
            id="critical-time-limit"
            label={timeLimitLabel}
            value={step1.criticalTimeLimit}
            onChange={(val) => update({ criticalTimeLimit: typeof val === 'number' ? val : 720 })}
            hint="The total duration before the simulation session automatically concludes or triggers a failure."
            min={10}
            max={86400 * 365} // up to a year
          />

        </div>

        <StepNavigation
          currentStep={1}
          onPrev={() => {}}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
          nextLabel="Next: Patient Demographics"
        />
      </div>
    </div>
  );
}
