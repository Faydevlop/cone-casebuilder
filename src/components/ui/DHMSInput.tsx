import React, { useState, useEffect } from 'react';
import { formatDuration } from '../../types/caseForm.types';

interface DHMSInputProps {
  id: string;
  label?: string;
  hint?: string;
  /** Total value in seconds */
  value: number | '';
  /** Called with total seconds */
  onChange: (totalSeconds: number | '') => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

function formatToDHMSString(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
}

function parseDHMSString(str: string): number {
  const parts = str.split(':').map((p) => parseInt(p.trim(), 10)).filter((p) => !isNaN(p));
  if (parts.length === 0) return 0;
  
  // Reverse to map from seconds upwards: [seconds, minutes, hours, days]
  const reversed = [...parts].reverse();
  const s = reversed[0] || 0;
  const m = reversed[1] || 0;
  const h = reversed[2] || 0;
  const d = reversed[3] || 0;
  
  return s + m * 60 + h * 3600 + d * 86400;
}

export function DHMSInput({ id, label, hint, value, onChange, disabled = false, min = 0, max = 99999999 }: DHMSInputProps) {
  const totalSec = typeof value === 'number' ? value : 0;
  const [typedValue, setTypedValue] = useState(formatToDHMSString(totalSec));

  // Sync internal text state with value prop
  useEffect(() => {
    setTypedValue(formatToDHMSString(totalSec));
  }, [totalSec]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow digits and colons only
    const cleaned = e.target.value.replace(/[^0-9:]/g, '');
    setTypedValue(cleaned);

    // Instant/draft update on parsing
    const parsedSec = parseDHMSString(cleaned);
    if (parsedSec >= min && parsedSec <= max) {
      onChange(parsedSec === 0 && cleaned === '' ? '' : parsedSec);
    }
  }

  function handleBlur() {
    // Format to standard DD:HH:MM:SS layout on blur
    const parsedSec = parseDHMSString(typedValue);
    const finalSec = Math.min(max, Math.max(min, parsedSec));
    onChange(finalSec);
    setTypedValue(formatToDHMSString(finalSec));
  }

  return (
    <div className="form-group" style={{ opacity: disabled ? 0.6 : 1 }}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          id={id}
          className="form-input"
          type="text"
          placeholder="DD:HH:MM:SS"
          value={typedValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          style={{
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            fontSize: 'var(--font-size-md)',
            fontWeight: 600,
            textAlign: 'center',
            maxWidth: '200px',
          }}
        />
        
        {/* Dynamic visual preview feedback badge */}
        {!disabled && value !== '' && value > 0 && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(99,102,241,0.08)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            = {formatDuration(value)}
          </span>
        )}
      </div>
      
      <span className="form-hint" style={{ marginTop: '6px' }}>
        {hint || 'Format as DD:HH:MM:SS (Days:Hours:Minutes:Seconds)'}
      </span>
    </div>
  );
}
