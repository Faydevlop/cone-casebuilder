import { useState } from 'react';
import { useCaseForm } from '../hooks/useCaseForm';
import { StepNavigation } from '../components/ui/StepNavigation';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import type { PathwayStep, CombinedAction } from '../types/caseForm.types';

interface Step7Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step7ClinicalPathway({ onPrev, onNext }: Step7Props) {
  const { formData, dispatch } = useCaseForm();
  const { step7, step4, step1 } = formData;

  const [filterText, setFilterText] = useState('');

  // Update pathway helper
  function updatePathway(steps: PathwayStep[]) {
    dispatch({ type: 'UPDATE_STEP7', payload: { pathwaySteps: steps } });
  }

  // Add action to pathway
  function addActionToPathway(actionId: string) {
    // We allow the same action to be added multiple times if needed (e.g., repeated vitals check)
    const newStep: PathwayStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actionId: actionId,
      isCritical: false,
    };
    updatePathway([...step7.pathwaySteps, newStep]);
  }

  // Remove step from pathway
  function removeStep(stepId: string) {
    updatePathway(step7.pathwaySteps.filter((s) => s.id !== stepId));
  }

  // Toggle critical action flag
  function toggleCritical(stepId: string) {
    const updated = step7.pathwaySteps.map((s) => {
      if (s.id === stepId) {
        return { ...s, isCritical: !s.isCritical };
      }
      return s;
    });
    updatePathway(updated);
  }

  // Drag and Drop handlers
  function handleDragStart(e: React.DragEvent, actionId: string) {
    e.dataTransfer.setData('text/plain', actionId);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('text/plain');
    if (actionId) {
      addActionToPathway(actionId);
    }
  }

  // Group available actions by category
  const availableActions = step4.actions.filter((a) =>
    a.actionName.toLowerCase().includes(filterText.toLowerCase())
  );

  const categories = Array.from(new Set(step4.actions.map((a) => a.actionCategory || 'Other')));

  return (
    <div className="page-animate">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Define Expected Clinical Record</h1>
          <p className="page-subtitle">
            Configure the optimal sequence of actions for the '{step1.caseTitle || 'Simulation'}' scenario.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            saveDraftToLocalStorage(formData);
            alert('Optimal pathway saved as draft!');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Optimal Pathway
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: AVAILABLE ACTIONS LIBRARY */}
        <div className="card" style={{ padding: '20px', maxHeight: '75vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.07em', margin: '0 0 10px 0' }}>
              Available Actions Library
            </h3>
            
            {/* Filter Search */}
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                placeholder="Filter actions..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{
                  paddingLeft: '36px',
                  fontSize: 'var(--font-size-sm)',
                  height: '38px',
                }}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-muted)' }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '4px' }}>
            {categories.length === 0 ? (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No actions defined in Step 4. Go back to define actions.
              </p>
            ) : (
              categories.map((cat) => {
                const catActions = availableActions.filter((a) => (a.actionCategory || 'Other') === cat);
                if (catActions.length === 0) return null;

                return (
                  <div key={cat}>
                    <h4 style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                      letterSpacing: '0.06em',
                      marginBottom: '8px',
                      borderBottom: '1px solid var(--color-border-light)',
                      paddingBottom: '4px'
                    }}>
                      {cat}s
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {catActions.map((action) => (
                        <div
                          key={action.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, action.id)}
                          onClick={() => addActionToPathway(action.id)}
                          style={{
                            padding: '12px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'grab',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          className="library-action-item"
                          title="Drag to Golden Path or click to add"
                        >
                          <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                              {action.actionName || 'Unnamed Action'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '2px' }}>
                              {action.timeCost ? `${action.timeCost}s cost` : 'No cost'} • {action.actionCategory}
                            </div>
                          </div>
                          <span style={{ fontSize: '18px', color: 'var(--color-muted)', fontWeight: 300 }}>+</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: GOLDEN PATH SEQUENCE */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
              Golden Path Sequence
            </h3>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'rgba(59, 130, 246, 0.9)',
              letterSpacing: '0.05em'
            }}>
              MODE: SEQUENTIAL
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              minHeight: '400px',
              background: step7.pathwaySteps.length > 0 ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              transition: 'background var(--transition-base)'
            }}
          >
            {step7.pathwaySteps.length === 0 ? (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: 'var(--color-muted)',
                pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '28px' }}>➕</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  Drag actions here to add to the sequence
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)' }}>
                  (Or click on actions from the library to add them instantly)
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Visual Connector Line */}
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '24px',
                  bottom: '24px',
                  width: '2px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  zIndex: 0
                }} />

                {step7.pathwaySteps.map((step, idx) => {
                  const action = step4.actions.find((a) => a.id === step.actionId);
                  if (!action) return null;

                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
                      {/* Step Number Circle */}
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 'var(--font-size-sm)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {idx + 1}
                      </div>

                      {/* Step card */}
                      <div style={{
                        flex: 1,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: 'var(--shadow-xs)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'rgba(99, 102, 241, 0.9)',
                            alignSelf: 'flex-start',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {action.actionCategory}
                          </span>
                          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {action.actionName}
                          </div>
                          
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeStep(step.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--color-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                              fontSize: '18px'
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dropzone helper at the bottom when items exist */}
                <div style={{
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <span>➕</span> Drag actions here to append to the pathway
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <StepNavigation
          currentStep={7}
          onPrev={onPrev}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
          nextLabel="Next: Review & Publish"
        />
      </div>
    </div>
  );
}
