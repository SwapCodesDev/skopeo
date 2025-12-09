export interface ElementData {

    tagName: string;
    id: string;
    className: string;
    innerText: string;
    innerHTML: string;
    attributes: Record<string, string>;
    selector: string;
    rect: DOMRect;
    children: { tagName: string; id: string; className: string }[];
    hasParent: boolean;
    tree?: TreeNode;
    xpath?: string;
}

export interface TreeNode {
    tagName: string;
    id: string;
    className: string;
    children?: TreeNode[];
    path: number[]; // relative path indices from root
}

export type CodeMode = 'bs4' | 'selenium' | 'playwright';

export interface ConsoleLog {
    type: 'log' | 'warn' | 'error' | 'info';
    args: any[];
    timestamp: number;
}

export interface NetworkRequest {
    id: string;
    url: string;
    method: string;
    status?: number;
    type: 'fetch' | 'xhr' | 'script' | 'image' | 'css' | 'video' | 'audio' | 'font' | 'link' | 'other' | string;
    timestamp: number;
    duration?: number;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestBody?: string | null;
    responseBody?: string | null;
    error?: string;
}

export interface StorageItem {
    key: string;
    value: string;
}

export interface MediaAsset {
    url: string;
    type: 'image' | 'video' | 'audio';
    dimensions?: string;
}
