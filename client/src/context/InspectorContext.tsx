import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ElementData } from '../types';

interface InspectorContextType {
    url: string;
    setUrl: (url: string) => void;
    selectedElement: ElementData | null;
    setSelectedElement: (element: ElementData | null) => void;
    inspectMode: boolean;
    setInspectMode: (mode: boolean) => void;
}

const InspectorContext = createContext<InspectorContextType | undefined>(undefined);

export function InspectorProvider({ children }: { children: ReactNode }) {
    const [url, setUrl] = useState('');
    const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
    const [inspectMode, setInspectMode] = useState(true);

    return (
        <InspectorContext.Provider
            value={{
                url,
                setUrl,
                selectedElement,
                setSelectedElement,
                inspectMode,
                setInspectMode,
            }}
        >
            {children}
        </InspectorContext.Provider>
    );
}

export function useInspector() {
    const context = useContext(InspectorContext);
    if (context === undefined) {
        throw new Error('useInspector must be used within an InspectorProvider');
    }
    return context;
}
