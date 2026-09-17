import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange, className, ...props }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Simple logic to show a few pages around current page
  let visiblePages = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      visiblePages = [...pages.slice(0, 4), -1, totalPages];
    } else if (currentPage >= totalPages - 2) {
      visiblePages = [1, -1, ...pages.slice(totalPages - 4)];
    } else {
      visiblePages = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
    }
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} {...props}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-xl text-[var(--neo-text-muted)] hover:bg-[var(--neo-surface-2)] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {visiblePages.map((page, index) => (
        page === -1 ? (
          <span key={`dots-${index}`} className="px-3 py-2 text-[var(--neo-text-muted)]">
            <MoreHorizontal className="w-5 h-5" />
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 rounded-xl font-bold transition-all",
              currentPage === page
                ? "bg-[var(--neo-primary)] text-white shadow-md"
                : "text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]"
            )}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl text-[var(--neo-text-muted)] hover:bg-[var(--neo-surface-2)] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </nav>
  );
}
