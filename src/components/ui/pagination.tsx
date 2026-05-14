"use client";

import { Button } from "./button";

interface PaginationProps {
  limit: number;
  onPageChange?: (page: number) => void;
  page: number;
  total: number;
  totalPages: number;
}

export function Pagination({
  limit,
  onPageChange,
  page,
  total,
  totalPages,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Showing <span className="font-medium text-foreground">{start}</span> to{" "}
        <span className="font-medium text-foreground">{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          size="sm"
          variant="secondary"
        >
          Previous
        </Button>
        <span className="min-w-20 text-center">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          size="sm"
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
