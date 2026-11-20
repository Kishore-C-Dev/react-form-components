import { forwardRef, type InputHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
  hint?: string;
  registration?: Partial<UseFormRegisterReturn>;
  wrapperClassName?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      error,
      hint,
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
            'flex cursor-pointer items-center justify-between gap-4',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </div>
          <div className="relative">
            <input
              id={inputId}
              type="checkbox"
              ref={ref}
              disabled={disabled}
              className={cn('peer sr-only', className)}
              {...registration}
              {...props}
            />
            <div className="h-6 w-11 rounded-full border-2 border-transparent bg-gray-200 transition-colors peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>
      </FieldWrapper>
    );
  },
);

Toggle.displayName = 'Toggle';
