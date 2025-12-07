import { useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import type { MediaAsset } from '../../../../types';

interface SourcesTabProps {
    url: string;
}

export default function SourcesTab({ url }: SourcesTabProps) {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [openCategories, setOpenCategories] = useState({ image: true, video: true, audio: true });

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'MEDIA_FOUND') {
                setAssets(event.data.payload);
            }
        };
        window.addEventListener('message', handler);

        // Trigger generic scan
        const iframes = document.getElementsByTagName('iframe');
        if (iframes[0]?.contentWindow) {
            iframes[0].contentWindow.postMessage({ type: 'SCAN_MEDIA' }, '*');
        }

        return () => window.removeEventListener('message', handler);
    }, [url]);

    const toggleCategory = (key: keyof typeof openCategories) => {
        setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const groupedAssets = {
        image: assets.filter(a => a.type === 'image'),
        video: assets.filter(a => a.type === 'video'),
        audio: assets.filter(a => a.type === 'audio'),
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast could go here
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Assets: {assets.length}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                        const iframes = document.getElementsByTagName('iframe');
                        if (iframes[0]?.contentWindow) iframes[0].contentWindow.postMessage({ type: 'SCAN_MEDIA' }, '*');
                    }}
                >
                    Rescan
                </Button>
            </div>

            {/* Images */}
            <div className="border border-gray-800/50 rounded-lg overflow-hidden bg-gray-900/20">
                <button
                    onClick={() => toggleCategory('image')}
                    className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-300">Images</span>
                        <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">{groupedAssets.image.length}</span>
                    </div>
                    <span className={`transform transition-transform ${openCategories.image ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openCategories.image && (
                    <div className="p-3 grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                        {groupedAssets.image.length === 0 && <div className="text-xs text-gray-500 col-span-3 text-center py-4">No images found</div>}
                        {groupedAssets.image.map((asset, i) => (
                            <div key={i} className="group relative aspect-square bg-gray-950 rounded-md border border-gray-800 overflow-hidden">
                                <img src={asset.url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                    <span className="text-[10px] text-gray-400 truncate w-full text-center">{asset.dimensions || '?x?'}</span>
                                    <button
                                        onClick={() => copyToClipboard(asset.url)}
                                        className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-500"
                                    >
                                        Copy URL
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Videos */}
            <div className="border border-gray-800/50 rounded-lg overflow-hidden bg-gray-900/20">
                <button
                    onClick={() => toggleCategory('video')}
                    className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-300">Videos</span>
                        <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">{groupedAssets.video.length}</span>
                    </div>
                    <span className={`transform transition-transform ${openCategories.video ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openCategories.video && (
                    <div className="p-3 space-y-2">
                        {groupedAssets.video.length === 0 && <div className="text-xs text-gray-500 text-center py-4">No videos found</div>}
                        {groupedAssets.video.map((asset, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-950 p-2 rounded border border-gray-800">
                                <div className="truncate text-xs text-gray-400 flex-1 mr-2" title={asset.url}>{asset.url}</div>
                                <Button size="sm" variant="secondary" onClick={() => copyToClipboard(asset.url)}>Copy</Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Audio */}
            <div className="border border-gray-800/50 rounded-lg overflow-hidden bg-gray-900/20">
                <button
                    onClick={() => toggleCategory('audio')}
                    className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-300">Audio</span>
                        <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">{groupedAssets.audio.length}</span>
                    </div>
                    <span className={`transform transition-transform ${openCategories.audio ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openCategories.audio && (
                    <div className="p-3 space-y-2">
                        {groupedAssets.audio.length === 0 && <div className="text-xs text-gray-500 text-center py-4">No audio found</div>}
                        {groupedAssets.audio.map((asset, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-950 p-2 rounded border border-gray-800">
                                <div className="truncate text-xs text-gray-400 flex-1 mr-2" title={asset.url}>{asset.url}</div>
                                <Button size="sm" variant="secondary" onClick={() => copyToClipboard(asset.url)}>Copy</Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
