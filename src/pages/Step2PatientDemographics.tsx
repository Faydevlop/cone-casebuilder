import { useCaseForm } from '../hooks/useCaseForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StepNavigation } from '../components/ui/StepNavigation';
import { BaselineVitals } from '../components/features/BaselineVitals';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import { BLOOD_GROUP_OPTIONS } from '../types/caseForm.types';
import type { Step2Data } from '../types/caseForm.types';

const GENDER_OPTIONS = [
  { value: 'Male',       label: 'Male' },
  { value: 'Female',     label: 'Female' },
];

interface Step2Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step2PatientDemographics({ onPrev, onNext }: Step2Props) {
  const { formData, dispatch } = useCaseForm();
  const { step2 } = formData;

  function update(partial: Partial<Step2Data>) {
    dispatch({ type: 'UPDATE_STEP2', payload: partial });
  }

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Patient Demographics</h1>
        <p className="page-subtitle">
          Define the patient's basic physiological profile and initial vital signs.
        </p>
      </div>

      {/* Basic Info Card */}
      <div className="card">
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
          Step 2 of 8 — Basic Information
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Age + Gender */}
          <div className="form-grid-2">
            <Input
              id="patient-age"
              label="Age (Years)"
              type="number"
              min={1}
              max={120}
              placeholder="22"
              value={step2.age}
              onChange={(e) => update({ age: e.target.value === '' ? '' : Number(e.target.value) })}
              hint="Minimum 1, maximum 120 years."
            />
            <Select
              id="patient-gender"
              label="Gender"
              options={GENDER_OPTIONS}
              value={step2.gender}
              onChange={(e) => update({ gender: e.target.value })}
            />
          </div>

          {/* Height (Unit selectable) & Weight (Unit selectable) */}
          <div className="form-grid-2">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  id="patient-height"
                  label="Height"
                  type="number"
                  placeholder="175"
                  value={step2.height}
                  onChange={(e) => update({ height: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div style={{ width: '90px', marginTop: '24px' }}>
                <Select
                  id="patient-height-unit"
                  options={[
                    { value: 'cm', label: 'cm' },
                    { value: 'in', label: 'in' },
                  ]}
                  value={step2.heightUnit || 'cm'}
                  onChange={(e) => update({ heightUnit: e.target.value as 'cm' | 'in' })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  id="patient-weight"
                  label="Weight"
                  type="number"
                  placeholder="70"
                  value={step2.weight}
                  onChange={(e) => update({ weight: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div style={{ width: '90px', marginTop: '24px' }}>
                <Select
                  id="patient-weight-unit"
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'lbs', label: 'lbs' },
                  ]}
                  value={step2.weightUnit || 'kg'}
                  onChange={(e) => update({ weightUnit: e.target.value as 'kg' | 'lbs' })}
                />
              </div>
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <Select
              id="patient-blood-group"
              label="Blood Group"
              options={BLOOD_GROUP_OPTIONS}
              value={step2.bloodGroup}
              onChange={(e) => update({ bloodGroup: e.target.value })}
              hint="ABO blood type and Rh factor."
            />
          </div>

        </div>
      </div>

      {/* Baseline Vitals Card */}
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h3 className="card-title">Baseline Vitals</h3>
          <p className="card-subtitle" style={{ marginTop: 4 }}>
            Set the patient's initial vital signs at the start of the simulation.
            All values are capped at realistic human physiological limits.
          </p>
        </div>
        <BaselineVitals
          vitals={step2.baselineVitals}
          onChange={(vitals) => update({ baselineVitals: vitals })}
        />
      </div>

      <StepNavigation
        currentStep={2}
        onPrev={onPrev}
        onNext={onNext}
        onSaveDraft={() => saveDraftToLocalStorage(formData)}
        nextLabel="Next: Patient History"
      />
    </div>
  );
}
