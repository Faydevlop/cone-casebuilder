import { useRef } from 'react';
import type { DiagnosticTest } from '../../types/caseForm.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

const TEST_NAME_OPTIONS = [
  { value: '', label: 'Select test...' },
  { value: '12-Lead ECG & Troponin', label: '12-Lead ECG & Troponin' },
  { value: 'Bedside Lung Ultrasound (POCUS)', label: 'Bedside Lung Ultrasound (POCUS)' },
  { value: 'Chest X-Ray (CXR)', label: 'Chest X-Ray (CXR)' },
  { value: 'CT Pulmonary Angiography (CTPA)', label: 'CT Pulmonary Angiography (CTPA)' },
  { value: 'D-Dimer & BNP Labs', label: 'D-Dimer & BNP Labs' },
  { value: 'Leg Ultrasound (DVT check)', label: 'Leg Ultrasound (DVT check)' },
  { value: 'ABG (Arterial Blood Gas)', label: 'ABG (Arterial Blood Gas)' },
  { value: 'CBC / Full Blood Count', label: 'CBC / Full Blood Count' },
  { value: 'CT Head', label: 'CT Head' },
  { value: 'Urinalysis', label: 'Urinalysis' },
  { value: 'Custom...', label: 'Custom...' },
];

interface TestConfigCardProps {
  test: DiagnosticTest;
  index: number;
  onChange: (updated: DiagnosticTest) => void;
  onRemove: () => void;
}

export function TestConfigCard({ test, index, onChange, onRemove }: TestConfigCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function update(partial: Partial<DiagnosticTest>) {
    onChange({ ...test, ...partial });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const url = URL.createObjectURL(file);
      update({ scanImageFile: file, scanImageUrl: url });
    }
  }

  return (
    <div className="config-card">
      {/* Header */}
      <div className="config-card-header">
        <div className="config-card-title">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" opacity={0.6}>
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Test Configuration #{index + 1}
        </div>
        <button
          type="button"
          className="btn btn-danger btn-icon-only btn-sm"
          onClick={onRemove}
          aria-label={`Remove test ${index + 1}`}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="config-card-body">
        <div className="config-card-grid">
          {/* Col 1: Test Name + Time Cost */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Select
              label="Test Name"
              id={`test-name-${test.id}`}
              options={TEST_NAME_OPTIONS}
              value={test.testName}
              onChange={(e) => update({ testName: e.target.value })}
            />
            <Input
              label="Time Cost (seconds)"
              id={`test-time-${test.id}`}
              type="number"
              min={0}
              suffix="sec"
              placeholder="180"
              value={test.timeCost}
              onChange={(e) => update({ timeCost: e.target.value === '' ? '' : Number(e.target.value) })}
              hint="Time elapsed in simulation before results appear"
            />
          </div>

          {/* Col 2: Result Text */}
          <Textarea
            label="Result Interpretation Text"
            id={`test-result-${test.id}`}
            placeholder="Describe what the student sees when this test is ordered..."
            value={test.resultInterpretationText}
            onChange={(e) => update({ resultInterpretationText: e.target.value })}
            style={{ minHeight: 130 }}
          />

          {/* Col 3: Image attachment */}
          <div className="form-group">
            <label className="form-label">Scan / Image Attachment</label>
            <div
              className="drop-zone"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  update({ scanImageFile: file, scanImageUrl: url });
                }
              }}
            >
              {test.scanImageUrl ? (
                <img
                  src={test.scanImageUrl}
                  alt="Scan attachment"
                  style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                />
              ) : (
                <>
                  <span className="drop-zone-icon">☁</span>
                  <span className="drop-zone-text">Drag & Drop Image<br />(X-ray, ECG scan)</span>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
