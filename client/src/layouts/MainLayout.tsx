import { useLayout } from '../context/LayoutContext';
import { useInspector } from '../context/InspectorContext';
import Preview from '../components/features/preview/Preview';
import InspectorPanel from '../components/features/inspector/InspectorPanel';
import { useWindowResize } from '../hooks/useWindowResize';

export function MainLayout() {
    const {
        sidebarWidth,
        // setSidebarWidth, 
        isMobileOpen,
        setIsMobileOpen,
        isResizing,
        setIsResizing
    } = useLayout();

    const { selectedElement } = useInspector();

    useWindowResize();

    return (
        <div className="flex h-screen w-screen bg-black overflow-hidden m-0 p-0 relative">
            {/* Main Content (Preview) */}
            <div className="flex-1 h-full min-w-0 flex flex-col relative" style={{ pointerEvents: isResizing ? 'none' : 'auto' }}>
                <Preview />
            </div>

            {/* Drag Handle */}
            <div
                className="hidden md:block w-1 hover:w-2 bg-gray-800 hover:bg-blue-600 cursor-col-resize transition-all z-30 flex-none"
                onMouseDown={() => setIsResizing(true)}
            />

            {/* Desktop Sidebar (Hidden on mobile) */}
            <div className="hidden md:block h-full shadow-2xl z-20 flex-none" style={{ width: sidebarWidth }}>
                <InspectorPanel />
            </div>

            {/* Mobile Bottom Sheet / Drawer */}
            <div
                className={`md:hidden fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out bg-gray-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[85vh] flex flex-col ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {/* Mobile Handle to close */}
                <div
                    className="w-full h-8 flex justify-center items-center cursor-pointer hover:bg-white/5 transition-colors rounded-t-3xl touch-none"
                    onClick={() => setIsMobileOpen(false)}
                >
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full" />
                </div>

                <div className="flex-1 overflow-hidden pb-safe">
                    <InspectorPanel />
                </div>
            </div>

            {/* Mobile FAB to toggle Inspector */}
            {!isMobileOpen && (
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 z-40 hover:bg-blue-500 active:scale-95 transition-all animate-in fade-in zoom-in duration-300"
                >
                    {selectedElement ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    )}
                </button>
            )}

        </div>
    );
}
