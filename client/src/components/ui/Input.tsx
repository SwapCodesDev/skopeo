import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && <label className="text-xs font-semibold text-gray-400 ml-1">{label}</label>}
                <input
                    ref={ref}
                    className={`
                        w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-200 
                        placeholder:text-gray-600 outline-none transition-all 
                        focus:border-blue-500/50 focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/20
                        disabled:opacity-50
                        ${error ? 'border-red-500/50 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && <span className="text-[10px] text-red-400 ml-1">{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
