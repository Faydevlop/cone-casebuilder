import { useRef } from 'react';
import type { CombinedAction, ActionCategory, VitalEffect, ObservationOption } from '../../types/caseForm.types';
import { EMPTY_VITAL_EFFECT } from '../../types/caseForm.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { DHMSInput } from '../ui/DHMSInput';
import { VitalEffectEditor } from './VitalEffectEditor';
import { ToggleSwitch } from '../ui/ToggleSwitch';

const ACTION_CATEGORY_OPTIONS: { value: ActionCategory | ''; label: string }[] = [
  { value: '',                   label: 'Select category...' },
  { value: 'Imaging',            label: 'Imaging' },
  { value: 'Lab Test',           label: 'Lab Test' },
  { value: 'Procedure',          label: 'Procedure' },
  { value: 'Medication',         label: 'Medication' },
  { value: 'Respiratory Support', label: 'Respiratory Support' },
  { value: 'Monitoring',         label: 'Monitoring' },
];


interface ActionCardProps {
  action: CombinedAction;
  index: number;
  onChange: (updated: CombinedAction) => void;
  onRemove: () => void;
}

export function ActionCard({ action, index, onChange, onRemove }: ActionCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const fileSafeRef = useRef<HTMLInputElement>(null);

  function update(partial: Partial<CombinedAction>) {
    onChange({ ...action, ...partial });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const url = URL.createObjectURL(file);
      update({ scanImageFile: file, scanImageUrl: url });
    }
  }

  function handleSafeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const url = URL.createObjectURL(file);
      update({ safePatientImageFile: file, safePatientImageUrl: url });
    }
  }

  // Ensure vital effects are always VitalEffect objects (handle old string data gracefully)
  const safeVitalOnTime: VitalEffect =
    typeof action.vitalEffectOnTime === 'object' && action.vitalEffectOnTime !== null
      ? action.vitalEffectOnTime
      : { ...EMPTY_VITAL_EFFECT };
  const safeVitalDelayed: VitalEffect =
    typeof action.vitalEffectDelayed === 'object' && action.vitalEffectDelayed !== null
      ? action.vitalEffectDelayed
      : { ...EMPTY_VITAL_EFFECT };
  const safeVitalNotPerformed: VitalEffect =
    typeof action.vitalEffectNotPerformed === 'object' && action.vitalEffectNotPerformed !== null
      ? action.vitalEffectNotPerformed
      : { ...EMPTY_VITAL_EFFECT };



  // Observation options management
  const observationPrompt = action.observation?.prompt || '';
  const observationOptions = action.observation?.options || [];

  function updateObservation(promptText: string, opts: ObservationOption[]) {
    update({
      observation: {
        prompt: promptText,
        options: opts,
      }
    });
  }

  function addObservationOption() {
    const newOpt: ObservationOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: '',
      isCorrect: false,
    };
    updateObservation(observationPrompt, [...observationOptions, newOpt]);
  }

  function updateObservationOption(optId: string, textVal: string, correctVal: boolean) {
    const updatedOpts = observationOptions.map((o) =>
      o.id === optId ? { ...o, text: textVal, isCorrect: correctVal } : o
    );
    updateObservation(observationPrompt, updatedOpts);
  }

  function removeObservationOption(optId: string) {
    updateObservation(
      observationPrompt,
      observationOptions.filter((o) => o.id !== optId)
    );
  }

  return (
    <div className="config-card" id={`action-card-${action.id}`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="config-card-header">
        <div className="config-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Drag handle */}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" opacity={0.4}>
            <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 8a2 2 0 11-4 0 2 2 0 014 0zM7 14a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 8a2 2 0 11-4 0 2 2 0 014 0zM17 14a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Action #{index + 1}
          {action.actionCategory && (
            <span
              style={{
                marginLeft: 6,
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(99,102,241,0.15)',
                color: 'rgba(129,140,248,1)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {action.actionCategory}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-danger btn-icon-only btn-sm"
          onClick={onRemove}
          aria-label={`Remove action ${index + 1}`}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="config-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Section 1: Identity */}
        <div style={{ display: 'grid', gridTemplateColumns: action.actionCategory === 'Medication' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px' }}>
          <Input
            label="Action Name"
            id={`action-name-${action.id}`}
            placeholder="e.g. 12-Lead ECG, Administer Oxygen, IV Cannulation"
            value={action.actionName}
            onChange={(e) => update({ actionName: e.target.value })}
          />
          <Select
            label="Action Category"
            id={`action-category-${action.id}`}
            options={ACTION_CATEGORY_OPTIONS}
            value={action.actionCategory}
            onChange={(e) => update({ actionCategory: e.target.value as ActionCategory })}
          />
          {action.actionCategory === 'Medication' && (
            <Input
              label="Dose / Dosage"
              id={`action-dose-${action.id}`}
              placeholder="e.g. 325mg PO, 1mg IV Push"
              value={action.medicationDose || ''}
              onChange={(e) => update({ medicationDose: e.target.value })}
            />
          )}
        </div>

        {/* Section 2: Timing / Recommended Limit Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
          <DHMSInput
            label="Time Cost"
            id={`action-time-${action.id}`}
            value={action.timeCost}
            onChange={(val) => update({ timeCost: val })}
            hint="Time elapsed in simulation while this action is being performed."
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ marginBottom: '8px' }}>
              <ToggleSwitch
                id={`action-has-recommended-toggle-${action.id}`}
                checked={action.hasRecommendedWindow}
                onChange={(checked) => {
                  update({
                    hasRecommendedWindow: checked,
                    recommendedWithinSeconds: checked ? action.recommendedWithinSeconds : '',
                    penaltyDelayed: checked ? action.penaltyDelayed : '',
                    vitalEffectDelayed: checked ? safeVitalDelayed : { ...EMPTY_VITAL_EFFECT },
                  });
                }}
                label="Set recommended time limit for this action"
              />
            </div>
            
            <DHMSInput
              id={`action-recommended-${action.id}`}
              label="Recommended Perform Within"
              value={action.hasRecommendedWindow ? action.recommendedWithinSeconds : ''}
              onChange={(val) => update({ recommendedWithinSeconds: val })}
              disabled={!action.hasRecommendedWindow}
              hint="From case start, this action should ideally be performed within this window."
            />
          </div>
        </div>

        {/* Section 3: Media Upload & Text Results (Imaging / Lab Test) */}
        {action.actionCategory === 'Imaging' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Pathological / Before Action Dropzone */}
              <div className="form-group">
                <label className="form-label">Attachment (Pathological/Before Action)</label>
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
                  {action.scanImageUrl ? (
                    <img
                      src={action.scanImageUrl}
                      alt="Scan attachment"
                      style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="drop-zone-text">Drag & Drop Pathological Image<br />(Before Action)</span>
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

              {/* Safe Patient / After Action Dropzone */}
              <div className="form-group">
                <label className="form-label">Attachment (Normal/Safe Patient/After Action)</label>
                <div
                  className="drop-zone"
                  onClick={() => fileSafeRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      update({ safePatientImageFile: file, safePatientImageUrl: url });
                    }
                  }}
                >
                  {action.safePatientImageUrl ? (
                    <img
                      src={action.safePatientImageUrl}
                      alt="Safe scan attachment"
                      style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="drop-zone-text">Drag & Drop Normal/Safe Image<br />(After Action)</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileSafeRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleSafeFileChange}
                />
              </div>
            </div>

            <Textarea
              label="Professional Insights"
              id={`action-result-${action.id}`}
              placeholder="e.g. ECG tracing shows sinus tachycardia at 115 bpm with diffuse ST-elevation..."
              value={action.resultText}
              onChange={(e) => update({ resultText: e.target.value })}
              style={{ minHeight: 90 }}
              hint="Describe the clinical findings or standard insights learners must review."
            />
          </div>
        )}

        {action.actionCategory === 'Lab Test' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Attachment (Lab Chart/Image)</label>
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
                {action.scanImageUrl ? (
                  <img
                    src={action.scanImageUrl}
                    alt="Lab attachment"
                    style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="drop-zone-text">Drag & Drop Lab Chart Image</span>
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
            
            <Textarea
              label="Lab Result / Interpretation"
              id={`action-result-${action.id}`}
              placeholder="e.g. WBC: 14.2 (high), Hgb: 9.1 (low), Platelets: 220 (normal). Consistent with bacterial infection..."
              value={action.resultText}
              onChange={(e) => update({ resultText: e.target.value })}
              style={{ minHeight: 180 }}
              hint="What the student sees when this test result is returned."
            />
          </div>
        )}

        {/* Section 4 & 5: Vital Effects & Scoring Matrix Combined (Scoring directly under its vital effect editor column) */}
        <div>
          <div className="form-label" style={{ marginBottom: '4px' }}>Vital Effects & Scoring</div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginBottom: '16px', marginTop: 0 }}>
            Configure the physiological response and the score awarded/deducted for each timeline outcome.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {/* Column 1: On Time */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <VitalEffectEditor
                label="If Performed On Time"
                id={`vital-ontime-${action.id}`}
                value={safeVitalOnTime}
                onChange={(v) => update({ vitalEffectOnTime: v })}
              />
              <Input
                label="Completion Score"
                id={`score-completion-${action.id}`}
                type="number"
                placeholder="20"
                value={action.completionScore}
                onChange={(e) => update({ completionScore: e.target.value === '' ? '' : Number(e.target.value) })}
                hint="Points awarded if performed within the recommended time window."
              />
            </div>

            {/* Column 2: Delayed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <VitalEffectEditor
                label="If Delayed but Performed"
                id={`vital-delayed-${action.id}`}
                value={safeVitalDelayed}
                onChange={(v) => update({ vitalEffectDelayed: v })}
                disabled={!action.hasRecommendedWindow}
              />
              <Input
                label="Penalty (if delayed)"
                id={`score-delayed-${action.id}`}
                type="number"
                placeholder="10"
                value={action.hasRecommendedWindow ? action.penaltyDelayed : ''}
                onChange={(e) => update({ penaltyDelayed: e.target.value === '' ? '' : Number(e.target.value) })}
                disabled={!action.hasRecommendedWindow}
                hint="Points deducted if performed but after the recommended time window."
              />
            </div>

            {/* Column 3: Not Performed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <VitalEffectEditor
                label="If Not Performed"
                id={`vital-notdone-${action.id}`}
                value={safeVitalNotPerformed}
                onChange={(v) => update({ vitalEffectNotPerformed: v })}
              />
              <Input
                label="Penalty (if not performed)"
                id={`score-notdone-${action.id}`}
                type="number"
                placeholder="-5"
                value={action.penaltyNotPerformed}
                onChange={(e) => update({ penaltyNotPerformed: e.target.value === '' ? '' : Number(e.target.value) })}
                hint="Points deducted if the action is never performed during the session."
              />
            </div>
          </div>
        </div>

        {/* Section 6: Action Observation Options Builder */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <div className="form-label" style={{ marginBottom: '4px' }}>Observations & Questions</div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginBottom: '14px' }}>
            Ask the student what they observed once this action is performed (e.g. "What did you note in the ECG interpretation?"). Add choices and tick the correct ones.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              id={`obs-prompt-${action.id}`}
              label="Observation Question / Prompt"
              placeholder="e.g. Select the primary ECG abnormality observed:"
              value={observationPrompt}
              onChange={(e) => updateObservation(e.target.value, observationOptions)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>Choices</span>
              
              {observationOptions.map((opt, oIdx) => (
                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', width: '60px' }}>Choice #{oIdx + 1}</span>
                  
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ST-elevation in leads V1-V4"
                    value={opt.text}
                    onChange={(e) => updateObservationOption(opt.id, e.target.value, opt.isCorrect)}
                    style={{ flex: 1, padding: '6px 12px', fontSize: 'var(--font-size-sm)' }}
                  />

                  <div>
                    <ToggleSwitch
                      id={`correct-${opt.id}`}
                      checked={opt.isCorrect}
                      onChange={(checked) => updateObservationOption(opt.id, opt.text, checked)}
                      label="Correct Choice"
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger btn-icon-only btn-sm"
                    onClick={() => removeObservationOption(opt.id)}
                    style={{ padding: '4px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={addObservationOption}
                style={{ alignSelf: 'flex-start', marginTop: '6px' }}
              >
                + Add Option Choice
              </button>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
