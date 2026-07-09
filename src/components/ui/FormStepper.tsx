import { Stepper, Step } from 'react-form-stepper';
import { STEP_CONFIG } from '../../types/caseForm.types';

interface FormStepperProps {
  currentStep: number; // 1-indexed
  onStepClick: (step: number) => void;
}

// react-form-stepper uses 0-based activeStep
export function FormStepper({ currentStep, onStepClick }: FormStepperProps) {
  return (
    <div className="form-stepper-wrapper">
      <Stepper
        activeStep={currentStep - 1}
        styleConfig={{
          activeBgColor: '#111827',
          activeTextColor: '#ffffff',
          completedBgColor: '#111827',
          completedTextColor: '#ffffff',
          inactiveBgColor: '#e5e7eb',
          inactiveTextColor: '#6b7280',
          size: '2.2em',
          circleFontSize: '0.85rem',
          labelFontSize: '0.7rem',
          borderRadius: '50%',
          fontWeight: '600',
        }}
        connectorStyleConfig={{
          completedColor: '#111827',
          activeColor: '#111827',
          disabledColor: '#d1d5db',
          strokeWidth: 2,
          stepSize: '2.2em',
          style: 'solid',
        }}
        connectorStateColors
      >
        {STEP_CONFIG.map((step) => (
          <Step
            key={step.stepNumber}
            label={step.title}
            onClick={() => onStepClick(step.stepNumber)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </Stepper>
    </div>
  );
}
