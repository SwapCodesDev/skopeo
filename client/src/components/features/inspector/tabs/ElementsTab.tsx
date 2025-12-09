import { useState, useEffect } from 'react';
import { DomTree } from '../DomTree';
import { XPathSearch } from '../XPathSearch';
import { NodeIdentity } from '../NodeIdentity';
import { DataExtractor } from '../DataExtractor';
import { CodeGenerator } from '../CodeGenerator';
import { Button } from '../../../ui/Button';
import { useInspector } from '../../../../context/InspectorContext';
import type { ElementData } from '../../../../types';

interface ElementsTabProps {
    selectedElement: ElementData | null;
    inspectMode: boolean;
    setInspectMode: (val: boolean) => void;
    url: string;
}

export default function ElementsTab({ selectedElement, inspectMode, url }: ElementsTabProps) {
    const [selectedExtractors, setSelectedExtractors] = useState<string[]>([]);
    const [xpathError, setXpathError] = useState<string | null>(null);
    const [visibleSections, setVisibleSections] = useState({
        tree: true, xpath: true, identity: true, parent: true, children: true, extract: true, code: true
    });
    const [showMenu, setShowMenu] = useState(false);
    const { refreshKey } = useInspector();

    useEffect(() => {
        setSelectedExtractors([]);
        setXpathError(null);
        // Reset other local state if needed
    }, [refreshKey, selectedElement]);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'XPATH_STATUS') {
                if (event.data.status === 'not-found') setXpathError('Element not found');
                else if (event.data.status === 'error') setXpathError('Invalid XPath: ' + event.data.error);
                else setXpathError(null);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const toggleSection = (key: keyof typeof visibleSections) => {
        setVisibleSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleExtractor = (key: string) => {
        setSelectedExtractors(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    if (!selectedElement) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-60">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                </div>
                <p>Select an element to inspect</p>
                {/* Inspect Mode Toggle Removed (Moved to AppMenu) */}
            </div>
        );
    }

    return (
        <div className="h-full space-y-6">
            {/* Header Controls for Elements Tab */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 bg-gray-800/30 rounded-full p-1 pl-3 border border-gray-700/30">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Inspect</span>
                    {/* Status Indicator (Read Only) */}
                    <div className={`w-2 h-2 rounded-full mr-2 ${inspectMode ? 'bg-green-500' : 'bg-gray-600'}`} />
                </div>

                <div className="relative">
                    <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </Button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/90 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-[10px] font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Visible Sections</div>
                            {Object.entries(visibleSections).map(([key, isVisible]) => (
                                <label key={key} className="flex items-center px-2 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={() => toggleSection(key as any)}
                                        className="rounded border-gray-600 bg-gray-800 text-blue-500 mr-2 focus:ring-blue-500/20"
                                    />
                                    <span className="text-sm capitalize">{key}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {visibleSections.tree && <DomTree tree={selectedElement.tree || null} />}
            {visibleSections.xpath && (
                <XPathSearch
                    error={xpathError}
                    setError={setXpathError}
                    initialValue={selectedElement?.xpath || ''}
                />
            )}
            {visibleSections.identity && <NodeIdentity element={selectedElement} />}

            {/* Parent Nav */}
            {visibleSections.parent && (
                <Button
                    variant="secondary"
                    className="w-full justify-center gap-2"
                    disabled={!selectedElement.hasParent}
                    onClick={() => {
                        const iframes = document.getElementsByTagName('iframe');
                        if (iframes[0]?.contentWindow) iframes[0].contentWindow.postMessage({ type: 'SELECT_PARENT' }, '*');
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    Select Parent
                </Button>
            )}

            {visibleSections.extract && (
                <DataExtractor
                    element={selectedElement}
                    selectedExtractors={selectedExtractors}
                    onToggle={toggleExtractor}
                />
            )}

            {visibleSections.code && (
                <CodeGenerator
                    element={selectedElement}
                    extractors={selectedExtractors}
                    url={url}
                />
            )}
        </div>
    );
}
