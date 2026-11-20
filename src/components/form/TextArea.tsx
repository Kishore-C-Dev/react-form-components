import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  registration?: Partial<UseFormRegisterReturn>;
  wrapperClassName?: string;
  showCharCount?: boolean;
  maxLength?: number;
  currentLength?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      required,
      registration,
      id,
      rows = 4,
      className,
      wrapperClassName,
      showCharCount,
      maxLength,
      currentLength,
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
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          className={cn('input-base resize-y', error && 'input-error', className)}
          aria-invalid={!!error}
          {...registration}
          {...props}
        />
        {showCharCount && maxLength !== undefined && (
          <p className="mt-1 text-right text-xs text-gray-400">
            {currentLength ?? 0} / {maxLength}
          </p>
        )}
      </FieldWrapper>
    );
  },
);

TextArea.displayName = 'TextArea';
