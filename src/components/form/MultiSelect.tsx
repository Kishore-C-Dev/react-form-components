import { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';
import type { SelectOption } from '@/types/form';

interface MultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
  className?: string;
}

export function MultiSelect({
  label,
  error,
  hint,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = false,
  disabled = false,
  wrapperClassName,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  function toggle(val: string) {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  }

  function removeItem(val: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  }

  const selectedLabels = value.map(
    (v) => options.find((o) => String(o.value) === v)?.label ?? v,
  );

  return (
    <FieldWrapper
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      required={required}
      className={wrapperClassName}
    >
      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => { if (!disabled) setOpen((o) => !o); }}
          className={cn(
            'input-base flex min-h-[2.25rem] flex-wrap items-center gap-1.5 text-left',
            error && 'input-error',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedLabels.map((lbl, i) => (
              <span
                key={value[i]}
                className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700"
              >
                {lbl}
                <span
                  role="button"
                  aria-label={`Remove ${lbl}`}
                  onClick={(e) => removeItem(value[i], e)}
                  className="cursor-pointer text-primary-500 hover:text-primary-700"
                >
                  ×
                </span>
              </span>
            ))
          )}
          <span className="ml-auto flex-shrink-0 text-gray-400">
            <svg
              className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {open && (
          <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {searchable && (
              <div className="border-b border-gray-100 px-2 py-1.5">
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}
            <ul role="listbox" aria-multiselectable="true" className="max-h-52 overflow-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-400">No options</li>
              ) : (
                filtered.map((opt) => {
                  const checked = value.includes(String(opt.value));
                  return (
                    <li
                      key={String(opt.value)}
                      role="option"
                      aria-selected={checked}
                      onClick={() => !opt.disabled && toggle(String(opt.value))}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                        checked ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50',
                        opt.disabled && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
                          checked ? 'border-primary-600 bg-primary-600' : 'border-gray-300',
                        )}
                      >
                        {checked && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </li>
                  );
                })
              )}
            </ul>
            {value.length > 0 && (
              <div className="border-t border-gray-100 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
