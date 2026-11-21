import { useState, useMemo, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { TableColumn, TableAction, SortState } from '@/types/form';

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  keyField: keyof T;
  caption?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  defaultSortable?: boolean;
  className?: string;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span className="ml-1 inline-flex flex-col text-gray-400">
      <svg
        className={cn('h-3 w-3 -mb-0.5', direction === 'asc' && 'text-primary-600')}
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path d="M6 2l4 5H2z" />
      </svg>
      <svg
        className={cn('h-3 w-3', direction === 'desc' && 'text-primary-600')}
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path d="M6 10L2 5h8z" />
      </svg>
    </span>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  keyField,
  caption,
  emptyState,
  loading = false,
  striped = false,
  hoverable = true,
  compact = false,
  stickyHeader = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  pageSize,
  defaultSortable = false,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sort.key || !sort.direction) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key as keyof T];
      const bv = b[sort.key as keyof T];
      const cmp = String(av ?? '') < String(bv ?? '') ? -1 : String(av ?? '') > String(bv ?? '') ? 1 : 0;
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const paginated = useMemo(() => {
    if (!pageSize) return sorted;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = pageSize ? Math.ceil(sorted.length / pageSize) : 1;

  function handleSort(key: string) {
    setSort((prev) => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc'
          : 'asc',
    }));
  }

  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {searchable && (
        <div className="flex items-center">
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-base max-w-xs"
          />
        </div>
      )}

      <div className={cn('overflow-auto rounded-lg border border-gray-200 shadow-sm')}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          {caption && (
            <caption className="px-4 py-2 text-left text-xs text-gray-500">
              {caption}
            </caption>
          )}
          <thead className={cn('bg-gray-50', stickyHeader && 'sticky top-0 z-10')}>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    cellPadding,
                    'text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
                    (col.sortable ?? defaultSortable) && 'cursor-pointer select-none hover:text-gray-700',
                  )}
                  onClick={(col.sortable ?? defaultSortable) ? () => handleSort(String(col.key)) : undefined}
                  aria-sort={
                    sort.key === String(col.key) && sort.direction
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {(col.sortable ?? defaultSortable) && (
                      <SortIcon
                        direction={sort.key === String(col.key) ? sort.direction : null}
                      />
                    )}
                  </span>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th
                  scope="col"
                  className={cn(cellPadding, 'text-right text-xs font-semibold uppercase tracking-wide text-gray-500')}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="py-10 text-center text-gray-400"
                >
                  <svg
                    className="mx-auto h-6 w-6 animate-spin text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="py-12 text-center text-gray-400"
                >
                  {emptyState ?? 'No records found.'}
                </td>
              </tr>
            ) : (
              paginated.map((row, rowIndex) => (
                <tr
                  key={String(row[keyField])}
                  className={cn(
                    striped && rowIndex % 2 === 1 && 'bg-gray-50',
                    hoverable && 'hover:bg-blue-50/40 transition-colors',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(cellPadding, 'text-gray-700')}
                    >
                      {col.render
                        ? col.render(row[col.key as keyof T], row, rowIndex)
                        : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className={cn(cellPadding, 'text-right')}>
                      <div className="inline-flex items-center gap-2">
                        {actions
                          .filter((a) => !a.hidden?.(row))
                          .map((action) => (
                            <button
                              key={action.label}
                              type="button"
                              onClick={() => action.onClick(row)}
                              className={cn(
                                'rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
                                action.variant === 'danger'
                                  ? 'text-red-600 hover:bg-red-50 focus-visible:ring-red-500'
                                  : action.variant === 'ghost'
                                    ? 'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400'
                                    : 'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
                              )}
                            >
                              {action.label}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded px-2.5 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '…')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={cn(
                      'h-8 min-w-[2rem] rounded px-2 text-sm',
                      page === p
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700',
                    )}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded px-2.5 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
