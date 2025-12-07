import type { ElementData } from '../../types';

interface NodeIdentityProps {
    element: ElementData;
}

export const NodeIdentity = ({ element }: NodeIdentityProps) => {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs font-mono font-bold uppercase border border-blue-500/30">
                    {element.tagName}
                </span>
                {element.id && (
                    <span className="text-gray-400 text-sm font-mono">#{element.id}</span>
                )}
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg font-mono text-xs text-blue-300 break-all border border-gray-700/50 shadow-inner">
                {element.selector}
            </div>
        </div>
    );
};
