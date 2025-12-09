import { useState } from 'react';
import ElementsTab from './tabs/ElementsTab';
import SourcesTab from './tabs/SourcesTab';
import ConsoleTab from './tabs/ConsoleTab';
import NetworkTab from './tabs/NetworkTab';
import StorageTab from './tabs/StorageTab';
import { AppMenu } from './AppMenu';
import { useInspector } from '../../../context/InspectorContext';

type Tab = 'elements' | 'console' | 'sources' | 'network' | 'storage';

export default function InspectorPanel() {
    const { selectedElement, inspectMode, setInspectMode, url } = useInspector();
    const [activeTab, setActiveTab] = useState<Tab>('elements');

    return (
        <div className="flex flex-col h-full bg-gray-950/80 backdrop-blur-xl border-l border-gray-800/50 text-gray-300 w-full">
            {/* Main Header */}
            <div className="shrink-0 p-3 border-b border-white/5 bg-gray-900/40 backdrop-blur-md relative z-50">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                            Skopeo DevTools
                        </h2>
                    </div>
                    <AppMenu />
                </div>

                {/* Scrollable Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mask-linear-fade">
                    {['elements', 'console', 'sources', 'network', 'storage'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            className={`
                                relative px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap active:scale-95
                                ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/50'
                                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'}
                            `}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute inset-0 rounded-lg bg-white/10 animate-pulse-slow pointer-events-none" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">

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

