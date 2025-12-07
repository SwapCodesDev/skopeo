import { useMemo } from 'react';

interface CodeBlockProps {
    code: string;
    className?: string;
}

export const CodeBlock = ({ code, className = '' }: CodeBlockProps) => {

    // Simple regex-based highlighter to avoid heavy dependencies
    const highlightedCode = useMemo(() => {
        let text = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Stash strings and comments to avoid matching keywords inside them or corruption
        const tokens: { id: string, val: string }[] = [];
        const stash = (val: string, type: 'str' | 'com' | 'kwd' | 'blt' | 'mth') => {
            const id = `__${type}_${tokens.length}__`;
            tokens.push({ id, val });
            return id;
        };

        // 1. Stash Strings
        text = text.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) =>
            stash(`<span class="text-yellow-300">${match}</span>`, 'str')
        );

        // 2. Stash Comments
        text = text.replace(/(#.*)/g, (match) =>
            stash(`<span class="text-gray-500 italic">${match}</span>`, 'com')
        );

        // 3. Stash Keywords (Must be before methods to take precedence)
        const keywords = [
            'import', 'from', 'def', 'return', 'print', 'if', 'else', 'for', 'in', 'with', 'as',
            'while', 'try', 'except', 'class', 'pass', 'continue', 'break', 'range', 'len'
        ];
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            text = text.replace(regex, (match) =>
                stash(`<span class="text-pink-400 font-bold">${match}</span>`, 'kwd')
            );
        });

        // 4. Stash Builtins
        const builtins = ['requests', 'BeautifulSoup', 'webdriver', 'By', 'sync_playwright', 'time'];
        builtins.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            text = text.replace(regex, (match) =>
                stash(`<span class="text-blue-400">${match}</span>`, 'blt')
            );
        });

        // 5. Stash Method calls 
        // Matches `word(` -> `word`
        // We replace it with `<span...>word</span>(` 
        // We check if it's already a stashed token (starts with __)
        text = text.replace(/(\w+)(\()/g, (match, name, paren) => {
            if (name.startsWith('__')) return match;
            return stash(`<span class="text-green-300">${name}</span>`, 'mth') + paren;
        });

        // Restore tokens
        tokens.forEach(t => {
            text = text.replace(t.id, t.val);
        });

        return text;
    }, [code]);

    return (
        <pre
            className={`font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all ${className}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
    );
};
