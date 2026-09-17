import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-2 space-x-reverse border-b border-[var(--neo-border)]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-bold border-b-2 transition-colors",
            activeTab === tab.id
              ? "border-[var(--neo-primary)] text-[var(--neo-primary)]"
              : "border-transparent text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] hover:border-[var(--neo-border)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
