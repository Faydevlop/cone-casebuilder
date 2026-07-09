import { useCaseForm } from '../hooks/useCaseForm';
import { StepNavigation } from '../components/ui/StepNavigation';
import { TestConfigCard } from '../components/features/TestConfigCard';
import { saveDraftToLocalStorage } from '../utils/saveCase';
import type { DiagnosticTest } from '../types/caseForm.types';

function generateId() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyTest(): DiagnosticTest {
  return {
    id: generateId(),
    testName: '',
    timeCost: '',
    resultInterpretationText: '',
    scanImageUrl: null,
    scanImageFile: null,
  };
}

interface Step4Props {
  onPrev: () => void;
  onNext: () => void;
}

export function Step4Diagnostics({ onPrev, onNext }: Step4Props) {
  const { formData, dispatch } = useCaseForm();
  const { step4 } = formData;

  function updateTests(tests: DiagnosticTest[]) {
    dispatch({ type: 'UPDATE_STEP4', payload: { diagnosticTests: tests } });
  }

  function addTest() {
    updateTests([...step4.diagnosticTests, createEmptyTest()]);
  }

  function updateTest(index: number, updated: DiagnosticTest) {
    const tests = [...step4.diagnosticTests];
    tests[index] = updated;
    updateTests(tests);
  }

  function removeTest(index: number) {
    updateTests(step4.diagnosticTests.filter((_, i) => i !== index));
  }

  return (
    <div className="page-animate">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Diagnostics & Investigations</h1>
          <p className="page-subtitle">
            Configure clinical tests available to students and the expected results.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addTest}
          id="btn-add-test"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Test
        </button>
      </div>

      {/* Test Cards */}
      {step4.diagnosticTests.length === 0 ? (
        <div className="card">
          <div className="placeholder-page">
            <div className="placeholder-icon">🔬</div>
            <div className="placeholder-title">No Tests Configured</div>
            <p className="placeholder-subtitle">
              Add diagnostic tests that students can order during the simulation. Each test
              has a time cost and result interpretation.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={addTest}
              style={{ marginTop: '20px' }}
            >
              + Add First Test
            </button>
          </div>
        </div>
      ) : (
        <>
          {step4.diagnosticTests.map((test, index) => (
            <TestConfigCard
              key={test.id}
              test={test}
              index={index}
              onChange={(updated) => updateTest(index, updated)}
              onRemove={() => removeTest(index)}
            />
          ))}
          <button type="button" className="add-row-btn" onClick={addTest} id="btn-add-more-test">
            + Add Another Test
          </button>
        </>
      )}

      <StepNavigation
        currentStep={4}
        onPrev={onPrev}
        onNext={onNext}
        onSaveDraft={() => saveDraftToLocalStorage(formData)}
        nextLabel="Next: Interventions"
      />
    </div>
  );
}
