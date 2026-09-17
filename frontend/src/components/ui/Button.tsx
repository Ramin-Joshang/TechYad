import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-[var(--neo-primary)] text-white hover:bg-blue-700 shadow-md shadow-[var(--neo-primary)]/20",
      secondary: "bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] hover:bg-[var(--neo-border)]",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20",
      ghost: "bg-transparent text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]",
      outline: "bg-transparent border-2 border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:border-[var(--neo-border)] hover:bg-[var(--neo-bg)]"
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-11 w-11 flex justify-center p-0"
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
