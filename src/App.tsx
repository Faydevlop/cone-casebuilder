import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseFormProvider } from './context/CaseFormContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { FormStepper } from './components/ui/FormStepper';
import { Dashboard } from './pages/Dashboard';
import { CheckerPortal } from './pages/CheckerPortal';
import { Step1CaseOverview } from './pages/Step1CaseOverview';
import { Step2PatientDemographics } from './pages/Step2PatientDemographics';
import { Step3PatientHistory } from './pages/Step3PatientHistory';
import { Step4Actions } from './pages/Step5Actions';
import { Step6Placeholder } from './pages/Step6Placeholder';
import { Step7Placeholder } from './pages/Step7Placeholder';
import { Step7ClinicalPathway } from './pages/Step7ClinicalPathway';
import { Step8Placeholder } from './pages/Step8Placeholder';
import { TOTAL_STEPS } from './types/caseForm.types';
import { useCaseForm } from './hooks/useCaseForm';
import type { CaseFormData } from './types/caseForm.types';
import './index.css';

// ─── Case Builder Content Router ───────────────────────────────────────────────

type ViewType = 'dashboard' | 'builder' | 'checker';

function CaseBuilderContent() {
  const { userRole } = useAuth();
  const defaultView = userRole === 'checker' ? 'checker' : 'dashboard';
  const [currentView, setCurrentView] = useState<ViewType>(defaultView);
  const [currentStep, setCurrentStep] = useState(1);
  const { dispatch } = useCaseForm();

  function handleViewChange(view: ViewType) {
    if (userRole === 'checker' && view !== 'checker') return;
    if (userRole === 'faculty' && view === 'checker') return;

    if (view === 'builder') {
      dispatch({ type: 'RESET_FORM' });
      setCurrentStep(1);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAddCase() {
    dispatch({ type: 'RESET_FORM' });
    setCurrentStep(1);
    setCurrentView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleEditCase(caseData: CaseFormData) {
    dispatch({ type: 'LOAD_CASE', payload: caseData });
    setCurrentStep(1);
    setCurrentView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToStep(step: number) {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goNext() { goToStep(currentStep + 1); }
  function goPrev() { goToStep(currentStep - 1); }

  function renderStep() {
    switch (currentStep) {
      case 1:  return <Step1CaseOverview onNext={goNext} />;
      case 2:  return <Step2PatientDemographics onPrev={goPrev} onNext={goNext} />;
      case 3:  return <Step3PatientHistory onPrev={goPrev} onNext={goNext} />;
      case 4:  return <Step4Actions onPrev={goPrev} onNext={goNext} />;
      case 5:  return <Step6Placeholder onPrev={goPrev} onNext={goNext} />;
      case 6:  return <Step7Placeholder onPrev={goPrev} onNext={goNext} />;
      case 7:  return <Step7ClinicalPathway onPrev={goPrev} onNext={goNext} />;
      case 8:  return <Step8Placeholder onPrev={goPrev} />;
      default: return <Step1CaseOverview onNext={goNext} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <div className="main-area" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <TopBar />

        {currentView === 'builder' ? (
          <>
            <div className="stepper-bar-container">
              <FormStepper currentStep={currentStep} onStepClick={goToStep} />
            </div>
            <main className="page-content">
              {renderStep()}
            </main>
          </>
        ) : currentView === 'checker' ? (
          <main className="page-content">
            <CheckerPortal />
          </main>
        ) : (
          <main className="page-content">
            <Dashboard onAddCase={handleAddCase} onEditCase={handleEditCase} />
          </main>
        )}
      </div>
    </div>
  );
}

// ─── Auth Gate ─────────────────────────────────────────────────────────────────

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <CaseFormProvider>
      <CaseBuilderContent />
    </CaseFormProvider>
  );
}

// ─── Root App Wrapper ─────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
