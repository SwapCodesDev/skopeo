import { useState } from 'react';
import ElementsTab from './tabs/ElementsTab';
import SourcesTab from './tabs/SourcesTab';
import ConsoleTab from './tabs/ConsoleTab';
import NetworkTab from './tabs/NetworkTab';
import StorageTab from './tabs/StorageTab';
import { HistoryManager } from './HistoryManager';
import type { ElementData } from '../../types';

interface InspectorPanelProps {
    selectedElement: ElementData | null;
    inspectMode: boolean;
    setInspectMode: (val: boolean) => void;
    url: string;
    setUrl: (url: string) => void;
}

type Tab = 'elements' | 'console' | 'sources' | 'network' | 'storage';

export default function InspectorPanel({ selectedElement, inspectMode, setInspectMode, url, setUrl }: InspectorPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('elements');

    return (
        <div className="flex flex-col h-full bg-gray-950/80 backdrop-blur-xl border-l border-gray-800/50 text-gray-300 w-full">
            {/* Main Header */}
            <div className="p-3 border-b border-gray-800/50 bg-gray-900/30">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-bold text-lg bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
                        Xcrape
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
                    {['elements', 'console', 'sources', 'network', 'storage'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            className={`
                                px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap
                                ${activeTab === tab
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <HistoryManager currentUrl={url} onSelectUrl={setUrl} />

                {activeTab === 'elements' && (
                    <ElementsTab
                        selectedElement={selectedElement}
                        inspectMode={inspectMode}
                        setInspectMode={setInspectMode}
                        url={url}
                    />
                )}

                {activeTab === 'console' && <ConsoleTab url={url} />}
                {activeTab === 'network' && <NetworkTab />}
                {activeTab === 'sources' && <SourcesTab url={url} />}
                {activeTab === 'storage' && <StorageTab />}

            </div>
        </div>
    );
}
