import { useEffect, useState } from 'react';
import Preview from './components/Preview';
import InspectorPanel from './components/inspector/InspectorPanel';
import type { ElementData } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

function App() {
  const [url, setUrl] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [inspectMode, setInspectMode] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Disable pointer events on iframe to prevent capturing mousemove
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex h-screen w-screen bg-black overflow-hidden m-0 p-0 relative">
          {/* Main Content (Preview) */}
          <div className="flex-1 h-full min-w-0 flex flex-col relative" style={{ pointerEvents: isResizing ? 'none' : 'auto' }}>
            <Preview
              url={url}
              setUrl={setUrl}
              onElementSelect={(el) => {
                setSelectedElement(el);
                setIsMobileOpen(true); // Auto-open on mobile select
              }}
              inspectMode={inspectMode}
            />
          </div>

          {/* Drag Handle */}
          <div
            className="hidden md:block w-1 hover:w-2 bg-gray-800 hover:bg-blue-600 cursor-col-resize transition-all z-30 flex-none"
            onMouseDown={() => setIsResizing(true)}
          />

          {/* Desktop Sidebar (Hidden on mobile) */}
          <div className="hidden md:block h-full shadow-2xl z-20 flex-none" style={{ width: sidebarWidth }}>
            <InspectorPanel
              selectedElement={selectedElement}
              inspectMode={inspectMode}
              setInspectMode={setInspectMode}
              url={url}
              setUrl={setUrl}
            />
          </div>

          {/* Mobile Bottom Sheet / Drawer */}
          <div
            className={`md:hidden fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out bg-gray-900 border-t border-gray-800 rounded-t-2xl shadow-2xl h-[80vh] ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}`}
          >
            {/* Mobile Handle to close */}
            <div
              className="w-full h-6 flex justify-center items-center cursor-pointer"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
            </div>
            <div className="h-full overflow-hidden pb-8">
              <InspectorPanel
                selectedElement={selectedElement}
                inspectMode={inspectMode}
                setInspectMode={setInspectMode}
                url={url}
                setUrl={setUrl}
              />
            </div>
          </div>

          {/* Mobile FAB to toggle Inspector if closed but element selected */}
          {!isMobileOpen && selectedElement && (
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 hover:bg-blue-500 transition-colors animate-bounce"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          )}

        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
