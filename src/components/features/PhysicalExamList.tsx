import { useState } from 'react';
import type { PhysicalExamCue } from '../../types/caseForm.types';

interface PhysicalExamListProps {
  cues: PhysicalExamCue[];
  onChange: (cues: PhysicalExamCue[]) => void;
}

function generateId() {
  return `cue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function PhysicalExamList({ cues, onChange }: PhysicalExamListProps) {
  const [newFinding, setNewFinding] = useState('');

  function addCue() {
    if (!newFinding.trim()) return;
    onChange([
      ...cues,
      { id: generateId(), finding: newFinding.trim(), visible: true },
    ]);
    setNewFinding('');
  }

  function removeCue(id: string) {
    onChange(cues.filter((c) => c.id !== id));
  }

  function toggleVisibility(id: string) {
    onChange(cues.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
  }

  return (
    <div>
      {cues.map((cue) => (
        <div key={cue.id} className="exam-cue-row">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--color-accent-blue)', flexShrink: 0 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="exam-cue-text" style={{ opacity: cue.visible ? 1 : 0.4 }}>
            {cue.finding}
          </span>
          <div className="exam-cue-actions">
            <button
              type="button"
              className="btn btn-ghost btn-icon-only btn-sm"
              onClick={() => toggleVisibility(cue.id)}
              aria-label={cue.visible ? 'Hide finding' : 'Show finding'}
              title={cue.visible ? 'Visible to students' : 'Hidden from students'}
            >
              {cue.visible ? (
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-icon-only btn-sm"
              onClick={() => removeCue(cue.id)}
              aria-label="Remove finding"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {/* Add new cue */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          className="form-input"
          placeholder="Add a new physical finding..."
          value={newFinding}
          onChange={(e) => setNewFinding(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCue(); } }}
          id="new-physical-finding"
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={addCue}
          style={{ whiteSpace: 'nowrap' }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
