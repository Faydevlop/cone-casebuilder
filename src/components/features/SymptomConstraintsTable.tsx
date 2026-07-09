import type { SymptomConstraint } from '../../types/caseForm.types';

interface SymptomConstraintsTableProps {
  constraints: SymptomConstraint[];
  onChange: (constraints: SymptomConstraint[]) => void;
}

export function SymptomConstraintsTable({ constraints, onChange }: SymptomConstraintsTableProps) {
  function updateConstraint(id: string, field: keyof SymptomConstraint, value: string) {
    onChange(
      constraints.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function addConstraint() {
    const newId = `c_${Date.now()}`;
    onChange([...constraints, { id: newId, attribute: '', value: '' }]);
  }

  function removeConstraint(id: string) {
    onChange(constraints.filter((c) => c.id !== id));
  }

  return (
    <div>
      {constraints.map((constraint) => (
        <div key={constraint.id} className="constraint-row" style={{ marginBottom: '6px' }}>
          <div className="constraint-label-cell">
            <input
              className="constraint-value-input"
              style={{ background: 'transparent', fontWeight: 500 }}
              placeholder="Attribute (e.g. Location)"
              value={constraint.attribute}
              onChange={(e) => updateConstraint(constraint.id, 'attribute', e.target.value)}
            />
          </div>
          <div className="constraint-value-cell" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              className="constraint-value-input"
              placeholder="Value..."
              value={constraint.value}
              onChange={(e) => updateConstraint(constraint.id, 'value', e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-danger btn-icon-only btn-sm"
              onClick={() => removeConstraint(constraint.id)}
              style={{ marginRight: '8px', flexShrink: 0 }}
              aria-label="Remove constraint"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={addConstraint}
        style={{ marginTop: '6px' }}
        id="btn-add-constraint"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Constraint
      </button>
    </div>
  );
}
