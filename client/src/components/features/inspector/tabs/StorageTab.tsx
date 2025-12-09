import { useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import { useInspector } from '../../../../context/InspectorContext';
import type { StorageItem } from '../../../../types';

export default function StorageTab() {
    const [cookies, setCookies] = useState<StorageItem[]>([]);
    const [localStorage, setLocalStorage] = useState<StorageItem[]>([]);
    const [activeView, setActiveView] = useState<'cookies' | 'local'>('cookies');
    const { refreshKey } = useInspector();

    const scanStorage = () => {
        // Since we are in an iframe (or accessing one), accessing storage directly might be blocked or tricky.
        // We will rely on the injected script to send us this data if possible?
        // Actually, preventing XSS, we might not have access to HttpOnly cookies.
        // For this demo, let's try to simulate or read what we can from the iframe via postMessage.
        // But the iframe is cross-origin usually. 
        // Our proxy injects the script, so it runs in the origin. It can read non-HttpOnly cookies and LocalStorage.
        // Let's assume we implement a STORAGE_SCAN message.

        const iframes = document.getElementsByTagName('iframe');
        if (iframes[0]?.contentWindow) {
            iframes[0].contentWindow.postMessage({ type: 'SCAN_STORAGE' }, '*');
        }
    };

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'STORAGE_DATA') {
                setCookies(event.data.payload.cookies);
                setLocalStorage(event.data.payload.localStorage);
            }
        };
        window.addEventListener('message', handler);

        // Initial scan
        setTimeout(scanStorage, 1000);

        return () => window.removeEventListener('message', handler);
    }, [refreshKey]);

    const data = activeView === 'cookies' ? cookies : localStorage;

    return (
        <div className="flex flex-col h-full space-y-2">
            <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveView('cookies')}
                        className={`px-3 py-1 rounded text-xs font-semibold ${activeView === 'cookies' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        Cookies
                    </button>
                    <button
                        onClick={() => setActiveView('local')}
                        className={`px-3 py-1 rounded text-xs font-semibold ${activeView === 'local' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        Local Storage
                    </button>
                </div>
                <Button size="sm" variant="ghost" onClick={scanStorage}>Refresh</Button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs border border-gray-800/50 rounded-lg bg-gray-900/20">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800/50 text-gray-400 sticky top-0">
                        <tr>
                            <th className="p-2 font-medium w-1/3">Key</th>
                            <th className="p-2 font-medium">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={2} className="p-4 text-center text-gray-500 italic">No data found</td>
                            </tr>
                        )}
                        {data.map((item, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="p-2 text-blue-300 break-all align-top">{item.key}</td>
                                <td className="p-2 text-gray-300 break-all align-top">{item.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
