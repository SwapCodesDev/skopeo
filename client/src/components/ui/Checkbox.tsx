import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    subLabel?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = '', label, subLabel, ...props }, ref) => {
        return (
            <label className={`flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group ${className}`}>
                <div className="relative flex items-center mt-0.5">
                    <input
                        type="checkbox"
                        ref={ref}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-gray-900/50 transition-all checked:border-blue-500 checked:bg-blue-600 hover:border-blue-400"
                        {...props}
                    />
                    <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</p>
                    {subLabel && <p className="text-xs text-gray-500 truncate">{subLabel}</p>}
                </div>
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";
