import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-[var(--neo-text-secondary)]">{label}</label>}
        <select
          className={cn(
            "flex w-full rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] px-4 py-3 text-sm text-[var(--neo-text-main)] transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
