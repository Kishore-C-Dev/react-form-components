import { forwardRef, type SelectHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';
import type { SelectOption } from '@/types/form';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  registration?: Partial<UseFormRegisterReturn>;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      required,
      options,
      placeholder,
      registration,
      id,
      className,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? registration?.name;

    return (
      <FieldWrapper
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
        className={wrapperClassName}
      >
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'input-base cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")] bg-[right_0.5rem_center] bg-[length:1.25rem] bg-no-repeat pr-9',
            error && 'input-error',
            className,
          )}
          aria-invalid={!!error}
          {...registration}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  },
);

Select.displayName = 'Select';
