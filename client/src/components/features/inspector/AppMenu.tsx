import { useState, useRef, useEffect } from 'react';
import { useInspector } from '../../../context/InspectorContext';
import { Button } from '../../ui/Button';
import { HistoryManager } from './HistoryManager';

export const AppMenu = () => {
    const { inspectMode, setInspectMode, triggerRefresh, url, setUrl } = useInspector();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleRefresh = () => {
        triggerRefresh();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-white/10"
                title="App Application Menu"
            >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 mb-2 border-b border-gray-700/50">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Application Menu</h3>
                    </div>

                    {/* Inspect Mode Toggle */}
                    <div className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg mb-1 transition-colors">
                        <span className="text-sm text-gray-300">Inspect Mode</span>
                        <div className="flex items-center gap-2 bg-gray-800/50 rounded-full p-1 border border-gray-700/50">
                            <button
                                onClick={() => setInspectMode(!inspectMode)}
                                className={`w-9 h-5 rounded-full transition-all relative ${inspectMode ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${inspectMode ? 'translate-x-4' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Refresh Preview */}
                    <button
                        onClick={handleRefresh}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors mb-1 group"
                    >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Preview
                    </button>

                    {/* Recent Sessions (HistoryManager adapted) */}
                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                        <HistoryManager currentUrl={url} onSelectUrl={(newUrl) => {
                            setUrl(newUrl);
                            setIsOpen(false);
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};
