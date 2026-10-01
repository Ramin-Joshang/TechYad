import * as React from "react";
import { cn, toEnDigits } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  allowDecimals?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, onChange, allowDecimals, ...props }, ref) => {
    const isNumber = type === "number";

    // Handle change to transparently convert Persian and Arabic numerals to English digits
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumber) {
        let val = toEnDigits(e.target.value);
        if (allowDecimals) {
          val = val.replace(/[^0-9.]/g, '');
          // allow only first decimal dot
          const parts = val.split('.');
          if (parts.length > 2) {
            val = parts[0] + '.' + parts.slice(1).join('');
          }
        } else {
          val = val.replace(/[^0-9-]/g, '');
        }
        e.target.value = val;
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-[var(--neo-text-secondary)]">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={isNumber ? "text" : type}
            inputMode={isNumber ? (allowDecimals ? "decimal" : "numeric") : props.inputMode}
            dir={isNumber ? "ltr" : props.dir}
            className={cn(
              "flex w-full rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] px-4 py-3 text-sm text-[var(--neo-text-main)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--neo-text-muted)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pr-10",
              isNumber && "font-mono text-left",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            onChange={handleChange}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
