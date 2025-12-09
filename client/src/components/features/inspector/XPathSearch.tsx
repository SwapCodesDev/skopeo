import { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface XPathSearchProps {
    error: string | null;
    setError: (err: string | null) => void;
    initialValue?: string;
}

export const XPathSearch = ({ error, setError, initialValue = '' }: XPathSearchProps) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue || '');
    }, [initialValue]);

    const handleSearch = (val: string) => {
        setError(null);
        const iframes = document.getElementsByTagName('iframe');
        if (iframes[0] && iframes[0].contentWindow) {
            iframes[0].contentWindow.postMessage({ type: 'SELECT_XPATH', xpath: val }, '*');
        }
    };

    return (
        <div className="space-y-2 mb-4">
            <div className="flex gap-2 items-start">
                <div className="flex-1">
                    <Input
                        placeholder="Locate by XPath..."
                        value={value}
                        error={error || undefined}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                        }}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setError(null);
                        }}
                    />
                </div>
                <Button
                    size="sm"
                    className="mt-0 h-[38px]" // Match Input height (assuming standard input height is around 38px/40px or configured similarly)
                    onClick={() => handleSearch(value)}
                >
                    Find
                </Button>
            </div>
        </div>
    );
};
