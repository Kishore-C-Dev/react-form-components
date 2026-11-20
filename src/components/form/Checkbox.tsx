import { forwardRef, type InputHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
  registration?: Partial<UseFormRegisterReturn>;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      hint,
      required,
      registration,
      id,
      className,
      wrapperClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? registration?.name;

    return (
      <FieldWrapper error={error} hint={hint} className={wrapperClassName}>
        <label
          htmlFor={inputId}
          className={cn(
            'flex cursor-pointer items-start gap-2.5',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className={cn(
              'mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed',
              error && 'border-red-400',
              className,
            )}
            aria-invalid={!!error}
            {...registration}
            {...props}
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="ml-0.5 text-red-500">*</span>}
            </span>
          </div>
        </label>
      </FieldWrapper>
    );
  },
);

Checkbox.displayName = 'Checkbox';
