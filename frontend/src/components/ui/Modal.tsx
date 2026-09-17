import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[var(--neo-border)] flex flex-col max-h-[90vh]",
        className
      )}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--neo-border)] shrink-0">
          <h2 className="text-xl font-bold text-[var(--neo-text-main)]">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="p-6 border-t border-[var(--neo-border)] bg-[var(--neo-bg)]/50 rounded-b-3xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
