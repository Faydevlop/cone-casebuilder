import { STEP_CONFIG, TOTAL_STEPS } from '../../types/caseForm.types';

interface StepNavigationProps {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isLastStep?: boolean;
  onSubmit?: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
}

export function StepNavigation({
  currentStep,
  onPrev,
  onNext,
  onSaveDraft,
  isLastStep = false,
  onSubmit,
  nextLabel,
  isSubmitting = false,
}: StepNavigationProps) {
  const nextStepConfig = STEP_CONFIG.find((s) => s.stepNumber === currentStep + 1);
  const defaultNextLabel = nextStepConfig ? `Next: ${nextStepConfig.title}` : 'Next';
  const resolvedNextLabel = nextLabel ?? defaultNextLabel;

  return (
    <div className="step-navigation">
      {/* Left: Previous button */}
      <div className="step-nav-left">
        {currentStep > 1 ? (
          <button type="button" className="btn btn-secondary" onClick={onPrev} id="btn-prev">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Right: Save Draft + Next/Submit */}
      <div className="step-nav-right">
        <button type="button" className="btn btn-secondary" onClick={onSaveDraft} id="btn-save-draft">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          Save Draft
        </button>

        {isLastStep ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            id="btn-submit"
            disabled={isSubmitting}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {isSubmitting ? 'Publishing...' : 'Submit & Export JSON'}
          </button>
        ) : (
          currentStep < TOTAL_STEPS && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              id="btn-next"
            >
              {resolvedNextLabel}
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )
        )}
      </div>
    </div>
  );
}
