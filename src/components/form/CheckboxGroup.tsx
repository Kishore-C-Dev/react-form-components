import { type InputHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';
import type { CheckboxOption } from '@/types/form';

interface CheckboxGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  label?: string;
  error?: string;
  hint?: string;
  options: CheckboxOption[];
  registration?: Partial<UseFormRegisterReturn>;
  orientation?: 'horizontal' | 'vertical';
  wrapperClassName?: string;
}

export function CheckboxGroup({
  label,
  error,
  hint,
  required,
  options,
  registration,
  id,
  orientation = 'vertical',
  className,
  wrapperClassName,
  ...props
}: CheckboxGroupProps) {
  const groupName = id ?? registration?.name ?? 'checkbox-group';

  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapperClassName}
    >
      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-wrap',
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-start gap-2.5 rounded-md border border-transparent p-2 transition-colors hover:bg-gray-50',
              option.disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
          >
            <input
              type="checkbox"
              name={groupName}
              value={option.value}
              disabled={option.disabled}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed"
              aria-invalid={!!error}
              {...registration}
              {...props}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
              {option.hint && <p className="text-xs text-gray-500">{option.hint}</p>}
            </div>
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
}
