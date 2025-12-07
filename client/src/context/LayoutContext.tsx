import { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextType {
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
    isResizing: boolean;
    setIsResizing: (isResizing: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    return (
        <LayoutContext.Provider
            value={{
                sidebarWidth,
                setSidebarWidth,
                isMobileOpen,
                setIsMobileOpen,
                isResizing,
                setIsResizing,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
}
