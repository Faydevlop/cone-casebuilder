import type { VitalEffect } from '../../types/caseForm.types';

const VITAL_KEYS: { key: keyof VitalEffect; label: string; unit: string }[] = [
  { key: 'heartRate',    label: 'HR',      unit: 'bpm' },
  { key: 'bpSystolic',   label: 'BP Sys',  unit: 'mmHg' },
  { key: 'bpDiastolic',  label: 'BP Dia',  unit: 'mmHg' },
  { key: 'spO2',         label: 'SpO2',    unit: '%' },
  { key: 'respRate',     label: 'RR',      unit: '/min' },
  { key: 'painScore',    label: 'Pain',    unit: '/10' },
];

interface VitalEffectEditorProps {
  label: string;
  id: string;
  value: VitalEffect;
  onChange: (updated: VitalEffect) => void;
  disabled?: boolean;
}

export function VitalEffectEditor({ label, id, value, onChange, disabled = false }: VitalEffectEditorProps) {
  function toggleVital(key: keyof VitalEffect) {
    if (disabled) return;
    if (value[key] !== null) {
      // Turn off
      onChange({ ...value, [key]: null });
    } else {
      // Turn on with default 0
      onChange({ ...value, [key]: 0 });
    }
  }

  function updateValue(key: keyof VitalEffect, numVal: number) {
    if (disabled) return;
    onChange({ ...value, [key]: numVal });
  }

  return (
    <div className="form-group" style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <label className="form-label" style={{ marginBottom: '8px' }}>{label}</label>

      {/* Capsule toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {VITAL_KEYS.map(({ key, label: vLabel }) => {
          const isActive = value[key] !== null;
          return (
            <button
              key={key}
              type="button"
              id={`${id}-toggle-${key}`}
              onClick={() => toggleVital(key)}
              disabled={disabled}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '20px',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.03em',
              }}
            >
              {vLabel}
            </button>
          );
        })}
      </div>

      {/* Numeric inputs for active vitals */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {VITAL_KEYS.filter(({ key }) => value[key] !== null).map(({ key, label: vLabel, unit }) => (
          <div key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--color-secondary)', minWidth: '38px' }}>{vLabel}</span>
            <input
              id={`${id}-${key}`}
              type="number"
              value={value[key] ?? 0}
              onChange={(e) => updateValue(key, e.target.value === '' ? 0 : Number(e.target.value))}
              disabled={disabled}
              style={{
                width: '60px',
                padding: '3px 6px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: 'var(--color-bg)',
                color: 'var(--color-primary)',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>{unit}</span>
          </div>
        ))}
        {VITAL_KEYS.every(({ key }) => value[key] === null) && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontStyle: 'italic', padding: '4px 0' }}>
            {disabled ? 'Recommended window must be enabled' : 'Toggle vital signs above to set delta values'}
          </span>
        )}
      </div>
    </div>
  );
}
