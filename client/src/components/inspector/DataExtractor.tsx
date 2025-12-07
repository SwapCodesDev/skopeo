import { Checkbox } from '../ui/Checkbox';
import type { ElementData } from '../../types';

interface DataExtractorProps {
    element: ElementData;
    selectedExtractors: string[];
    onToggle: (key: string) => void;
}

export const DataExtractor = ({ element, selectedExtractors, onToggle }: DataExtractorProps) => {
    return (
        <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Extract Data</h3>
            <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden backdrop-blur-sm">
                {/* Special Properties */}
                {['innerText', 'innerHTML'].map(prop => (
                    <Checkbox
                        key={prop}
                        label={prop}
                        subLabel="Property"
                        checked={selectedExtractors.includes(prop)}
                        onChange={() => onToggle(prop)}
                        className="border-b border-gray-700/50 last:border-0 rounded-none hover:bg-white/5"
                    />
                ))}

                {/* Attributes */}
                {Object.entries(element.attributes).map(([key, val]) => (
                    <Checkbox
                        key={key}
                        label={key}
                        subLabel={val.length > 30 ? val.substring(0, 30) + '...' : val}
                        checked={selectedExtractors.includes(key)}
                        onChange={() => onToggle(key)}
                        className="border-b border-gray-700/50 last:border-0 rounded-none hover:bg-white/5"
                    />
                ))}
            </div>
        </div>
    );
};
