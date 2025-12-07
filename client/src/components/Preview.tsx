import { useRef, useEffect, useState } from 'react';
import type { ElementData } from '../types';
import { useToast } from './Toast';

interface PreviewProps {
    url: string;
    setUrl: (url: string) => void;
    onElementSelect: (data: ElementData) => void;
    inspectMode: boolean;
}

export default function Preview({ url, setUrl, onElementSelect, inspectMode }: PreviewProps) {
    const [inputUrl, setInputUrl] = useState(url);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'ELEMENT_SELECTED') {
                onElementSelect(event.data.payload);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [onElementSelect]);

    useEffect(() => {
        // Send inspect mode toggle to iframe
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'TOGGLE_INSPECT', value: inspectMode }, '*');
        }
    }, [inspectMode]);

    const handleLoad = () => {
        setLoading(false);
        // Re-send inspect mode on load
        if (iframeRef.current?.contentWindow) {
            // slight delay to ensure script loaded
            setTimeout(() => {
                iframeRef.current?.contentWindow?.postMessage({ type: 'TOGGLE_INSPECT', value: inspectMode }, '*');
            }, 500);
        }
    };

    const loadUrl = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        let target = inputUrl;
        if (!target.startsWith('http')) {
            target = 'https://' + target;
            setInputUrl(target);
        }

        try {
            new URL(target); // Validate URL format
        } catch {
            showToast('Please enter a valid URL', 'error');
            return;
        }

        setUrl(target);
        setLoading(true);
    };

    const proxyUrl = url ? `/proxy?url=${encodeURIComponent(url)}` : '';

    return (
        <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
                <form onSubmit={loadUrl} className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 bg-gray-800 border-none rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Load
                    </button>
                </form>
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative bg-black/50">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/50 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}

                {url ? (
                    <iframe
                        ref={iframeRef}
                        src={proxyUrl}
                        className="w-full h-full bg-white"
                        title="Preview"
                        onLoad={handleLoad}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <p>Enter a URL to start scraping</p>
                    </div>
                )}
            </div>
        </div>
    );
}
