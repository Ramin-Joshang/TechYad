import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'primary', children, ...props }: BadgeProps) {
  const variants = {
    primary: "bg-[var(--neo-primary)]/10 text-blue-700",
    secondary: "bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)]",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    outline: "border border-[var(--neo-border)] text-[var(--neo-text-secondary)] bg-transparent"
  };

  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
