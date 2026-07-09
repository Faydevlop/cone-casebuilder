import { useCaseForm } from '../hooks/useCaseForm';
import { Textarea } from '../components/ui/Textarea';
import { TagInput } from '../components/ui/TagInput';
import { Input } from '../components/ui/Input';
import { StepNavigation } from '../components/ui/StepNavigation';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import type { Step3Data } from '../types/caseForm.types';

interface Step3Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step3PatientHistory({ onPrev, onNext }: Step3Props) {
  const { formData, dispatch } = useCaseForm();
  const { step3 } = formData;

  function update(partial: Partial<Step3Data>) {
    dispatch({ type: 'UPDATE_STEP3', payload: partial });
  }

  return (
    <div className="page-animate">
      <div className="page-header">
        <h1 className="page-title">Patient History</h1>
        <p className="page-subtitle">
          Document the clinical background, presenting complaints, and medical context for the simulation patient.
        </p>
      </div>

      {/* Chief Complaint & Present Illness */}
      <div className="card">
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
          Step 3 of 8 — Chief Complaint & History
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Input
            id="opening-line"
            label="Opening Line / Introduction"
            placeholder="e.g. A 28-year-old male is brought to the emergency department complaining of sudden-onset chest pain."
            value={step3.openingLine || ''}
            onChange={(e) => update({ openingLine: e.target.value })}
            hint="An introductory statement presented to the learner upon starting the scenario."
          />

          <div className="form-group" style={{ marginTop: '-10px', marginBottom: '10px' }}>
            <ToggleSwitch
              id="patient-conscious"
              checked={step3.isConscious}
              onChange={(val) => update({ isConscious: val })}
              label="Patient is conscious"
            />
          </div>

          <Textarea
            id="chief-complaint"
            label="Chief Complaint"
            placeholder="e.g. Sudden onset of sharp left-sided chest pain and shortness of breath."
            value={step3.chiefComplaint}
            onChange={(e) => update({ chiefComplaint: e.target.value })}
            hint="The primary reason the patient presents today — in their own words."
            style={{ minHeight: 80 }}
          />

          <Textarea
            id="history-of-present-illness"
            label="History of Present Illness (HPI)"
            placeholder="e.g. 28-year-old male with no prior cardiac history who developed sudden pleuritic chest pain at rest, worsening with deep inspiration. No cough, fever, or recent travel."
            value={step3.historyOfPresentIllness}
            onChange={(e) => update({ historyOfPresentIllness: e.target.value })}
            hint="A chronological narrative of the current presenting condition."
            style={{ minHeight: 120 }}
          />

          <TagInput
            id="symptoms"
            label="Symptoms"
            tags={step3.symptoms}
            onChange={(tags) => update({ symptoms: tags })}
            placeholder="Add symptom..."
            hint="Key symptoms the patient is experiencing. Press Enter or comma to add."
          />
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h3 className="card-title">Medications & Allergies</h3>
          <p className="card-subtitle" style={{ marginTop: 4 }}>
            Document current medications and known allergic reactions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Textarea
            id="current-medications"
            label="Current Medications"
            placeholder="e.g. Metformin 500mg twice daily, Lisinopril 10mg once daily, Aspirin 75mg once daily."
            value={step3.currentMedications}
            onChange={(e) => update({ currentMedications: e.target.value })}
            hint="List all medications including dosage and frequency."
            style={{ minHeight: 90 }}
          />

          <div className="form-grid-2">
            <Textarea
              id="drug-allergies"
              label="Drug Allergies"
              placeholder="e.g. Penicillin — anaphylaxis. Sulfonamides — rash."
              value={step3.drugAllergies}
              onChange={(e) => update({ drugAllergies: e.target.value })}
              hint="Specific drug allergies with the type of reaction experienced."
              style={{ minHeight: 90 }}
            />
            <TagInput
              id="known-allergies"
              label="Known Allergies (Non-Drug)"
              tags={step3.knownAllergies}
              onChange={(tags) => update({ knownAllergies: tags })}
              placeholder="Add allergy..."
              hint="Environmental, food, or latex allergies."
            />
          </div>
        </div>
      </div>

      {/* Background History */}
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h3 className="card-title">Background History</h3>
          <p className="card-subtitle" style={{ marginTop: 4 }}>
            Provide the patient's broader medical and social context.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Textarea
            id="past-medical-history"
            label="Past Medical History"
            placeholder="e.g. Hypertension (diagnosed 2018), Type 2 Diabetes (diagnosed 2020), No prior surgeries."
            value={step3.pastMedicalHistory}
            onChange={(e) => update({ pastMedicalHistory: e.target.value })}
            hint="Previous diagnoses, surgeries, hospitalisations, and chronic conditions."
            style={{ minHeight: 100 }}
          />

          <TagInput
            id="habits"
            label="Habits & Lifestyle"
            tags={step3.habits}
            onChange={(tags) => update({ habits: tags })}
            placeholder="e.g. Smoker, Alcohol use..."
            hint="Smoking status, alcohol use, recreational drugs, exercise habits. Press Enter to add."
          />

          <Textarea
            id="family-medical-history"
            label="Family Medical History"
            placeholder="e.g. Father — MI at age 55. Mother — Type 2 Diabetes. No family history of malignancy."
            value={step3.familyMedicalHistory}
            onChange={(e) => update({ familyMedicalHistory: e.target.value })}
            hint="Relevant hereditary conditions in first-degree relatives."
            style={{ minHeight: 90 }}
          />
        </div>
      </div>

      <StepNavigation
        currentStep={3}
        onPrev={onPrev}
        onNext={onNext}
        onSaveDraft={() => saveDraftToLocalStorage(formData)}
        nextLabel="Next: Actions"
      />
    </div>
  );
}
