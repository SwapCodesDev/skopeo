import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface XPathSearchProps {
    error: string | null;
    setError: (err: string | null) => void;
}

export const XPathSearch = ({ error, setError }: XPathSearchProps) => {
    const handleSearch = (val: string) => {
        setError(null);
        const iframes = document.getElementsByTagName('iframe');
        if (iframes[0] && iframes[0].contentWindow) {
            iframes[0].contentWindow.postMessage({ type: 'SELECT_XPATH', xpath: val }, '*');
        }
    };

    return (
        <div className="space-y-2 mb-4">
            <div className="flex gap-2 items-end">
                <Input
                    placeholder="Locate by XPath..."
                    error={error || undefined}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                    }}
                    onChange={() => setError(null)}
                />
                <Button
                    size="sm"
                    className="mb-[22px]" // Align with input height minus error gap
                    onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                        if (input) handleSearch(input.value);
                    }}
                >
                    Find
                </Button>
            </div>
        </div>
    );
};
