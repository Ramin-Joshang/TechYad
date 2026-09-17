import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderSearch } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ className, icon, title, description, action, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-3xl border border-[var(--neo-border)]", className)} {...props}>
      <div className="w-20 h-20 bg-[var(--neo-bg)] rounded-full flex items-center justify-center mb-6 text-[var(--neo-text-muted)]">
        {icon || <FolderSearch className="w-10 h-10" />}
      </div>
      {title && <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">{title}</h3>}
      {description && <p className="text-[var(--neo-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
