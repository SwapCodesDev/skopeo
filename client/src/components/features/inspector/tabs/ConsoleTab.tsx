import { useState, useEffect, useRef } from 'react';
import type { ConsoleLog } from '../../../../types';
import { Button } from '../../../ui/Button';
import { useInspector } from '../../../../context/InspectorContext';

interface ConsoleTabProps {
    url?: string;
}

export default function ConsoleTab({ url }: ConsoleTabProps) {
    const [logs, setLogs] = useState<ConsoleLog[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    const { refreshKey } = useInspector();

    // Clear logs when URL changes or refresh triggered
    useEffect(() => {
        setLogs([]);
    }, [url, refreshKey]);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'CONSOLE_LOG') {
                setLogs(prev => [...prev, event.data.payload]);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const clearConsole = () => setLogs([]);

    const getLogColor = (type: string) => {
        switch (type) {
            case 'error': return 'text-red-400 bg-red-900/10 border-red-900/30';
            case 'warn': return 'text-yellow-400 bg-yellow-900/10 border-yellow-900/30';
            case 'info': return 'text-blue-400 bg-blue-900/10 border-blue-900/30';
            default: return 'text-gray-300 border-gray-800/50';
        }
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Console ({logs.length})
                </span>
                <Button size="sm" variant="ghost" onClick={clearConsole}>Clear</Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs p-1">
                {logs.length === 0 && <div className="text-center text-gray-500 py-4 italic">No logs yet</div>}
                {logs.map((log, i) => (
                    <div key={i} className={`p-2 rounded border border-l-4 ${getLogColor(log.type)}`}>
                        <div className="flex gap-2 mb-1 opacity-70">
                            <span className="uppercase font-bold text-[10px]">{log.type}</span>
                            <span className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="whitespace-pre-wrap break-words">
                            {log.args.join(' ')}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
