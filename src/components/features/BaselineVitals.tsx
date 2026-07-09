import type { BaselineVitalsData } from '../../types/caseForm.types';

interface BaselineVitalsProps {
  vitals: BaselineVitalsData;
  onChange: (updated: BaselineVitalsData) => void;
}

interface VitalFieldConfig {
  key: keyof BaselineVitalsData;
  label: string;
  unit: string;
  min: number;
  max: number;
}

const VITAL_FIELDS: VitalFieldConfig[] = [
  { key: 'heartRate',    label: 'Heart Rate',   unit: 'bpm',   min: 20,  max: 250 },
  { key: 'bpSystolic',  label: 'BP Systolic',  unit: 'mmHg',  min: 50,  max: 250 },
  { key: 'bpDiastolic', label: 'BP Diastolic',  unit: 'mmHg', min: 20,  max: 150 },
  { key: 'spO2',        label: 'SpO2',          unit: '%',     min: 50,  max: 100 },
  { key: 'respRate',    label: 'Resp Rate',      unit: '/min',  min: 0,   max: 60  },
  { key: 'painScore',   label: 'Pain Score',     unit: '/10',   min: 0,   max: 10  },
];

export function BaselineVitals({ vitals, onChange }: BaselineVitalsProps) {
  function update(key: keyof BaselineVitalsData, value: number) {
    onChange({ ...vitals, [key]: value });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {VITAL_FIELDS.map(({ key, label, unit, min, max }) => (
        <div key={key} className="form-group">
          <label className="form-label" htmlFor={`vital-${key}`}>{label}</label>
          <div className="input-with-suffix">
            <input
              id={`vital-${key}`}
              className="form-input"
              type="number"
              min={min}
              max={max}
              value={vitals[key]}
              onChange={(e) => {
                const v = e.target.value === '' ? min : Number(e.target.value);
                update(key, Math.min(max, Math.max(min, v)));
              }}
              placeholder={String(min)}
            />
            <span className="input-suffix">{unit}</span>
          </div>
          <span className="form-hint">Range: {min} – {max}</span>
        </div>
      ))}
    </div>
  );
}
