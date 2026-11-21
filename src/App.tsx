import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { cn } from './utils/cn';
import { FormDemo } from './pages/FormDemo';
import { TableDemo } from './pages/TableDemo';
import { OnboardingLayout } from './pages/onboarding/OnboardingLayout';
import { OnboardingStepPage } from './pages/onboarding/OnboardingStepPage';
import { OnboardingSubmittedPage } from './pages/onboarding/OnboardingSubmittedPage';
import { OnboardingRequestsPage } from './pages/OnboardingRequestsPage';
import { OnboardingProvider } from './context/OnboardingContext';

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
    isActive
      ? 'border-primary-600 text-primary-600'
      : 'border-transparent text-gray-500 hover:text-gray-700',
  );
}

export function App() {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-1 px-4">
            <NavLink to="/requests" className={navClass}>Requests</NavLink>
            <NavLink to="/form"     className={navClass}>Form Components</NavLink>
            <NavLink to="/table"    className={navClass}>DataTable</NavLink>
          </div>
        </nav>

        <Routes>
          <Route path="/"        element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<OnboardingRequestsPage />} />
          <Route path="/form"    element={<FormDemo />} />
          <Route path="/table"   element={<TableDemo />} />

          <Route path="/onboarding/:requestId" element={<OnboardingLayout />}>
            <Route index element={<Navigate to="client-profile" replace />} />
            <Route path=":stepId"  element={<OnboardingStepPage />} />
            <Route path="submitted" element={<OnboardingSubmittedPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Routes>
      </div>
    </OnboardingProvider>
  );
}
