import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { LayoutProvider } from './context/LayoutContext';
import { InspectorProvider } from './context/InspectorContext';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LayoutProvider>
          <InspectorProvider>
            <MainLayout />
          </InspectorProvider>
        </LayoutProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

