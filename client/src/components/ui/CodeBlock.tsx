import { useMemo } from 'react';

interface CodeBlockProps {
    code: string;
    className?: string;
}

export const CodeBlock = ({ code, className = '' }: CodeBlockProps) => {

    // Simple regex-based highlighter to avoid heavy dependencies
    const highlightedCode = useMemo(() => {
        let html = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const keywords = [
            'import', 'from', 'def', 'return', 'print', 'if', 'else', 'for', 'in', 'with', 'as',
            'while', 'try', 'except', 'class', 'pass', 'continue', 'break'
        ];

        const builtins = ['requests', 'BeautifulSoup', 'webdriver', 'By', 'sync_playwright'];

        // Strings
        html = html.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-yellow-300">$&</span>');

        // Comments
        html = html.replace(/(#.*)/g, '<span class="text-gray-500 italic">$1</span>');

        // Keywords
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            html = html.replace(regex, `<span class="text-pink-400 font-bold">$1</span>`);
        });

        // Builtins/Libs
        builtins.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            html = html.replace(regex, `<span class="text-blue-400">$1</span>`);
        });

        // Method calls (word before parenthesis)
        html = html.replace(/(\w+)(?=\()/g, '<span class="text-green-300">$1</span>');

        return html;
    }, [code]);

    return (
        <pre
            className={`font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all ${className}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
    );
};
