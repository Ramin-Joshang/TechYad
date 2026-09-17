import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ className, title = "خطایی رخ داد", description, onRetry, ...props }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-3xl border border-red-100", className)} {...props}>
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
        <AlertOctagon className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">{title}</h3>
      {description && <p className="text-[var(--neo-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> تلاش مجدد
        </Button>
      )}
    </div>
  );
}
