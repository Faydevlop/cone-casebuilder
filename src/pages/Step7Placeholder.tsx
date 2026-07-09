import { useState, useRef } from 'react';
import { useCaseForm } from '../hooks/useCaseForm';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { StepNavigation } from '../components/ui/StepNavigation';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import type { EvidenceFile } from '../types/caseForm.types';

interface Step6Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step7Placeholder({ onPrev, onNext }: Step6Props) {
  const { formData, dispatch } = useCaseForm();
  const { step6 } = formData;

  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFileObject(file);
      setFileUrl(URL.createObjectURL(file));
      if (!fileName) {
        setFileName(file.name.replace(/\.[^/.]+$/, '')); // Set default name to filename without extension
      }
    }
  }

  function handleAddFile() {
    if (!fileName.trim()) {
      alert('Please provide an evidence name.');
      return;
    }

    const newEvidence: EvidenceFile = {
      id: `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName.trim(),
      fileUrl: fileUrl,
      fileFile: fileObject,
      description: description.trim(),
    };

    dispatch({
      type: 'UPDATE_STEP6',
      payload: { evidenceFiles: [...step6.evidenceFiles, newEvidence] },
    });

    // Reset input fields
    setFileName('');
    setDescription('');
    setFileUrl(null);
    setFileObject(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleRemoveFile(id: string) {
    dispatch({
      type: 'UPDATE_STEP6',
      payload: { evidenceFiles: step6.evidenceFiles.filter((f) => f.id !== id) },
    });
  }

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Evidence Pack Collection</h1>
        <p className="page-subtitle">
          Upload reference files associated with this case scenario.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Upload Form */}
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
            Step 6 of 8 — Add Reference File
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Evidence Title"
              id="evidence-name"
              placeholder="e.g. ALS Bradycardia Protocol, Septic Shock Guideline"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <Textarea
              label="Description / Context"
              id="evidence-desc"
              placeholder="e.g. Reference protocol for managing acute bradycardia in clinical simulation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 90 }}
            />

            <div className="form-group">
              <label className="form-label">Evidence File</label>
              <div
                className="drop-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setFileObject(file);
                    setFileUrl(URL.createObjectURL(file));
                    if (!fileName) {
                      setFileName(file.name.replace(/\.[^/.]+$/, ''));
                    }
                  }
                }}
              >
                {fileObject ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '24px' }}>📄</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {fileObject.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      {(fileObject.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="drop-zone-text">Drag & Drop Reference Document<br />(PDF, Image, Word document)</span>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddFile}
              style={{ width: '100%', padding: '12px' }}
            >
              + Add File to Evidence Pack
            </button>
          </div>
        </div>

        {/* Right: Uploaded Files Flat List */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-primary)', margin: '0 0 16px 0' }}>
              Uploaded References ({step6.evidenceFiles.length})
            </h4>

            {step6.evidenceFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
                  No documents uploaded to the pack yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {step6.evidenceFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'var(--color-surface-alt)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                        {file.name}
                      </div>
                      {file.description && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', marginTop: '2px' }}>
                          {file.description}
                        </div>
                      )}
                      {file.fileFile && (
                        <div style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📎 {file.fileFile.name} ({(file.fileFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--color-accent-red)',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Delete reference file"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '28px' }}>
        <StepNavigation
          currentStep={6}
          onPrev={onPrev}
          onNext={onNext}
          onSaveDraft={() => saveDraftToLocalStorage(formData)}
        />
      </div>
    </div>
  );
}
