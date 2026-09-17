import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div className={cn(
            "w-5 h-5 border-2 rounded-full transition-all",
            "border-[var(--neo-border)] bg-white group-hover:border-[var(--neo-secondary)]",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
            "peer-checked:border-[var(--neo-primary)]",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}></div>
          <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--neo-primary)] pointer-events-none opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all"></div>
        </div>
        {label && <span className="text-sm font-medium text-[var(--neo-text-secondary)] peer-disabled:opacity-50">{label}</span>}
      </label>
    );
  }
);
Radio.displayName = "Radio";

export { Radio };
