import { useState } from 'react';
import type { TreeNode } from '../../../types';

interface TreeItemProps {
    node: TreeNode;
    onHover: (path: number[] | null) => void;
    onSelect: (path: number[]) => void;
    depth?: number;
}

const TreeItem = ({ node, onHover, onSelect, depth = 0 }: TreeItemProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="font-mono text-[11px] leading-relaxed select-none">
            <div
                className="flex items-center hover:bg-white/10 rounded px-1 cursor-pointer transition-colors"
                style={{ paddingLeft: `${depth * 12}px` }}
                onMouseEnter={() => onHover(node.path)}
                onMouseLeave={() => onHover(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.path);
                }}
            >
                <div
                    className="flex items-center justify-center w-4 h-4 mr-1 text-gray-500 hover:text-white cursor-pointer transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (node.children?.length) setExpanded(!expanded);
                    }}
                >
                    {node.children && node.children.length > 0 && (
                        <span className={`transform transition-transform ${expanded ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                    )}
                </div>

                <span className="text-blue-400 mr-1">{node.tagName}</span>
                {node.id && <span className="text-yellow-500 mr-1">#{node.id}</span>}
                {node.className && <span className="text-gray-500 truncate max-w-[100px]">.{node.className.split(' ')[0]}</span>}
            </div>
            {expanded && node.children?.map((child, i) => (
                <TreeItem key={i} node={child} onHover={onHover} onSelect={onSelect} depth={depth + 1} />
            ))}
        </div>
    );
};

interface DomTreeProps {
    tree: TreeNode | null;
}

export const DomTree = ({ tree }: DomTreeProps) => {
    if (!tree) return null;

    const postMessage = (type: string, payload: any) => {
        const iframes = document.getElementsByTagName('iframe');
        if (iframes[0] && iframes[0].contentWindow) {
            iframes[0].contentWindow.postMessage({ type, ...payload }, '*');
        }
    };

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden backdrop-blur-sm">
            <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700/50 text-xs font-semibold text-gray-400 flex justify-between items-center group">
                <span>DOM Structure</span>
                <button
                    onClick={() => {
                        // TODO: Refactor serialization logic to utility if needed, duplicating for now for speed
                        const getLabel = (node: TreeNode) => {
                            let line = node.tagName;
                            if (node.id) line += `#${node.id}`;
                            if (node.className) line += `.${node.className.split(' ').join('.')}`;
                            return line;
                        };
                        const serializeTree = (node: TreeNode, prefix = '', isLast = true, isRoot = true): string => {
                            let result = isRoot ? getLabel(node) : `${prefix}${isLast ? '┗ ' : '┣ '}${getLabel(node)}`;
                            const children = node.children || [];
                            const childPrefix = isRoot ? '' : prefix + (isLast ? '  ' : '┃ ');
                            children.forEach((child, index) => {
                                const isLastChild = index === children.length - 1;
                                result += '\n' + serializeTree(child, childPrefix, isLastChild, false);
                            });
                            return result;
                        };
                        navigator.clipboard.writeText(serializeTree(tree));
                    }}
                    className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all font-normal"
                >
                    Copy
                </button>
            </div>
            <div className="p-2 overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <TreeItem
                    node={tree}
                    onHover={(path) => postMessage('HIGHLIGHT_DESCENDANT', { path })}
                    onSelect={(path) => postMessage('SELECT_TREE_NODE', { path })}
                />
            </div>
        </div>
    );
};
