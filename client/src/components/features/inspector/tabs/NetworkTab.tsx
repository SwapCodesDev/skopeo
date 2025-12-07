import { useState, useEffect } from 'react';
import type { NetworkRequest } from '../../../../types';
import { Button } from '../../../ui/Button';

type FilterType = 'all' | 'fetch' | 'xhr' | 'js' | 'css' | 'img' | 'media' | 'doc';

export default function NetworkTab() {
    const [requests, setRequests] = useState<NetworkRequest[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [activeDetailTab, setActiveDetailTab] = useState<'headers' | 'payload' | 'response'>('headers');

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'NETWORK_REQ') {
                setRequests(prev => [...prev, event.data.payload]);
            }
            if (event.data?.type === 'NETWORK_RES') {
                setRequests(prev => prev.map(req =>
                    req.id === event.data.payload.id
                        ? { ...req, status: event.data.payload.status, duration: event.data.payload.timestamp - req.timestamp, ...event.data.payload }
                        : req
                ));
            }
            if (event.data?.type === 'NETWORK_ERR') {
                setRequests(prev => prev.map(req =>
                    req.id === event.data.payload.id
                        ? { ...req, status: 0, error: event.data.payload.error }
                        : req
                ));
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const clearNetwork = () => {
        setRequests([]);
        setSelectedId(null);
    };

    const getStatusColor = (status?: number) => {
        if (!status) return 'text-gray-400';
        if (status >= 200 && status < 300) return 'text-green-400';
        if (status >= 400 && status < 500) return 'text-yellow-400';
        if (status >= 500) return 'text-red-400';
        return 'text-blue-400';
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        if (filter === 'fetch') return req.type === 'fetch';
        if (filter === 'xhr') return req.type === 'xhr';
        if (filter === 'js') return req.type === 'script' || req.url?.endsWith('.js');
        if (filter === 'css') return req.type === 'css' || req.url?.endsWith('.css');
        if (filter === 'img') return req.type === 'image' || req.url?.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
        if (filter === 'media') return req.type === 'video' || req.type === 'audio';
        return true;
    });

    const selectedRequest = requests.find(r => r.id === selectedId);

    return (
        <div className="flex flex-col h-full space-y-2">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800 gap-2 overflow-x-auto scrollbar-none">
                <div className="flex gap-1">
                    {(['all', 'fetch', 'xhr', 'js', 'css', 'img', 'media'] as FilterType[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {filteredRequests.length} / {requests.length}
                    </span>
                    <Button size="sm" variant="ghost" onClick={clearNetwork}>Clear</Button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden border border-gray-800/50 rounded-lg bg-gray-900/20">
                {/* Request List */}
                <div className={`flex-1 overflow-y-auto font-mono text-xs ${selectedId ? 'w-1/2 border-r border-gray-800' : 'w-full'}`}>
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-gray-800/50 text-gray-400 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 font-medium w-12">Stat</th>
                                <th className="p-2 font-medium w-16">Type</th>
                                <th className="p-2 font-medium">Name</th>
                                <th className="p-2 font-medium text-right w-16">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredRequests.map((req) => (
                                <tr
                                    key={req.id}
                                    onClick={() => setSelectedId(req.id)}
                                    className={`cursor-pointer transition-colors ${selectedId === req.id ? 'bg-blue-900/30' : 'hover:bg-white/5'}`}
                                >
                                    <td className={`p-2 font-bold ${getStatusColor(req.status)}`}>
                                        {req.status || (req.status === 0 ? 'ERR' : '...')}
                                    </td>
                                    <td className="p-2 text-gray-500">{req.type}</td>
                                    <td className="p-2 text-gray-300 truncate" title={req.url || ''}>
                                        {req.url?.split('/').pop() || req.url || 'Unknown'}
                                    </td>
                                    <td className="p-2 text-right text-gray-500">
                                        {req.duration ? `${Math.round(req.duration)}ms` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500 italic">No matching requests</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Details Pane */}
                {selectedId && selectedRequest && (
                    <div className="w-1/2 flex flex-col bg-gray-950/50">
                        {/* Detail Tabs */}
                        <div className="flex border-b border-gray-800">
                            {['headers', 'payload', 'response'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveDetailTab(tab as any)}
                                    className={`flex-1 px-3 py-2 text-xs font-semibold capitalize ${activeDetailTab === tab ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button onClick={() => setSelectedId(null)} className="px-3 text-gray-500 hover:text-white">×</button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-gray-300 break-all space-y-2">

                            {/* HEADERS */}
                            {activeDetailTab === 'headers' && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-gray-500 mb-1">General</h3>
                                        <div className="grid grid-cols-[80px_1fr] gap-1">
                                            <span className="text-gray-500">URL</span> <span>{selectedRequest.url}</span>
                                            <span className="text-gray-500">Method</span> <span>{selectedRequest.method}</span>
                                            <span className="text-gray-500">Status</span> <span className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</span>
                                        </div>
                                    </div>
                                    {selectedRequest.requestHeaders && (
                                        <div>
                                            <h3 className="font-bold text-gray-500 mb-1">Request Headers</h3>
                                            <div className="grid grid-cols-[1fr] gap-1 bg-gray-900 p-2 rounded">
                                                {Object.entries(selectedRequest.requestHeaders).map(([k, v]) => (
                                                    <div key={k}><span className="text-blue-300">{k}:</span> <span className="text-gray-400">{v}</span></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedRequest.responseHeaders && (
                                        <div>
                                            <h3 className="font-bold text-gray-500 mb-1">Response Headers</h3>
                                            <div className="grid grid-cols-[1fr] gap-1 bg-gray-900 p-2 rounded">
                                                {Object.entries(selectedRequest.responseHeaders).map(([k, v]) => (
                                                    <div key={k}><span className="text-green-300">{k}:</span> <span className="text-gray-400">{v}</span></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PAYLOAD */}
                            {activeDetailTab === 'payload' && (
                                <div>
                                    {selectedRequest.requestBody ? (
                                        <pre className="whitespace-pre-wrap">{selectedRequest.requestBody}</pre>
                                    ) : (
                                        <div className="text-gray-500 italic">No payload</div>
                                    )}
                                </div>
                            )}

                            {/* RESPONSE */}
                            {activeDetailTab === 'response' && (
                                <div>
                                    {selectedRequest.responseBody ? (
                                        <pre className="whitespace-pre-wrap text-green-100">{selectedRequest.responseBody}</pre>
                                    ) : (
                                        <div className="text-gray-500 italic">No response body captured (or empty)</div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
