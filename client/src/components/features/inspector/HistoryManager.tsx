import { useState, useEffect } from 'react';

interface HistoryManagerProps {
    currentUrl: string;
    onSelectUrl: (url: string) => void;
}

export const HistoryManager = ({ currentUrl, onSelectUrl }: HistoryManagerProps) => {
    const [history, setHistory] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('skopeo_history');
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (!currentUrl) return;

        setHistory(prev => {
            const newHistory = [currentUrl, ...prev.filter(u => u !== currentUrl)].slice(0, 10);
            localStorage.setItem('skopeo_history', JSON.stringify(newHistory));
            return newHistory;
        });
    }, [currentUrl]);

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('skopeo_history');
    };

    if (history.length === 0) return null;

    return (
        <div className="border-t border-gray-800/50 pt-4 mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-white transition-colors"
            >
                <span>Recent Sessions</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {history.map((url, i) => (
                        <div
                            key={i}
                            className="group flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer text-sm text-gray-400 hover:text-blue-300 transition-colors"
                            onClick={() => onSelectUrl(url)}
                        >
                            <div className="truncate flex-1 mr-2" title={url}>
                                {new URL(url).hostname}
                                <span className="text-gray-600 ml-1 opacity-50">{new URL(url).pathname}</span>
                            </div>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-600">Load</span>
                        </div>
                    ))}
                    <div className="pt-2 flex justify-end">
                        <span
                            onClick={clearHistory}
                            className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer underline decoration-red-500/30"
                        >
                            Clear History
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
