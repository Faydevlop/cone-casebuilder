import { useState } from 'react';
import type { DeteriorationRule } from '../../types/caseForm.types';

interface DeteriorationTableProps {
  rules: DeteriorationRule[];
  onChange: (rules: DeteriorationRule[]) => void;
}

function generateId() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function DeteriorationTable({ rules, onChange }: DeteriorationTableProps) {
  const [newParam, setNewParam] = useState('');
  const [newChange, setNewChange] = useState('');
  const [newDirection, setNewDirection] = useState<'+' | '-'>('+');
  const [newPer, setNewPer] = useState('');
  const [newUnit, setNewUnit] = useState<'min' | 'mins' | 'secs'>('min');

  function removeRule(id: string) {
    onChange(rules.filter((r) => r.id !== id));
  }

  function addCustomRule() {
    if (!newParam.trim() || !newChange || !newPer) return;
    const rule: DeteriorationRule = {
      id: generateId(),
      parameter: newParam.trim(),
      changeValue: parseFloat(newChange),
      direction: newDirection,
      perInterval: parseFloat(newPer),
      intervalUnit: newUnit,
    };
    onChange([...rules, rule]);
    setNewParam('');
    setNewChange('');
    setNewPer('');
  }

  function formatCondition(rule: DeteriorationRule) {
    return `${rule.direction}${rule.changeValue} per ${rule.perInterval} ${rule.intervalUnit}`;
  }

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Condition</th>
            <th style={{ width: 60, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td style={{ fontWeight: 500 }}>{rule.parameter}</td>
              <td style={{ color: 'var(--color-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {formatCondition(rule)}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-icon-only btn-sm"
                  onClick={() => removeRule(rule.id)}
                  aria-label="Remove rule"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add custom rule row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 60px 100px 60px 80px auto',
          gap: '8px',
          marginTop: '12px',
          alignItems: 'end',
        }}
      >
        <div className="form-group">
          <label className="form-label">Parameter</label>
          <input
            className="form-input"
            placeholder="e.g. Temperature"
            value={newParam}
            onChange={(e) => setNewParam(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Dir</label>
          <select
            className="form-select"
            value={newDirection}
            onChange={(e) => setNewDirection(e.target.value as '+' | '-')}
            style={{ paddingRight: '8px' }}
          >
            <option value="+">+</option>
            <option value="-">-</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Change</label>
          <input
            className="form-input"
            type="number"
            placeholder="1.5"
            value={newChange}
            onChange={(e) => setNewChange(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Per</label>
          <input
            className="form-input"
            type="number"
            placeholder="1"
            value={newPer}
            onChange={(e) => setNewPer(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value as 'min' | 'mins' | 'secs')}
            style={{ paddingRight: '8px' }}
          >
            <option value="min">min</option>
            <option value="mins">mins</option>
            <option value="secs">secs</option>
          </select>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={addCustomRule}
          style={{ marginBottom: '0', alignSelf: 'end', height: '42px' }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
