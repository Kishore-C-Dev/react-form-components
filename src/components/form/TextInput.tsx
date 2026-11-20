import { forwardRef, type InputHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color'
  | 'hidden';

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  label?: string;
  error?: string;
  hint?: string;
  registration?: Partial<UseFormRegisterReturn>;
  leftAddon?: string;
  rightAddon?: string;
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      type = 'text',
      label,
      error,
      hint,
      required,
      registration,
      leftAddon,
      rightAddon,
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
        <div className="flex">
          {leftAddon && (
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              {leftAddon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'input-base',
              leftAddon && 'rounded-l-none',
              rightAddon && 'rounded-r-none',
              error && 'input-error',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...registration}
            {...props}
          />
          {rightAddon && (
            <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              {rightAddon}
            </span>
          )}
        </div>
      </FieldWrapper>
    );
  },
);

TextInput.displayName = 'TextInput';
