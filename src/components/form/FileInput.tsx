import { forwardRef, type InputHTMLAttributes, useRef } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  registration?: Partial<UseFormRegisterReturn>;
  wrapperClassName?: string;
  buttonLabel?: string;
  dragDrop?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
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
      buttonLabel = 'Choose file',
      dragDrop = false,
      multiple,
      accept,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? registration?.name;
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    if (dragDrop) {
      return (
        <FieldWrapper
          label={label}
          htmlFor={inputId}
          error={error}
          hint={hint}
          required={required}
          className={wrapperClassName}
        >
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:border-primary-400 hover:bg-primary-50',
              error && 'border-red-400',
              disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
            onClick={() => resolvedRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && resolvedRef.current?.click()}
          >
            <svg
              className="mx-auto mb-3 h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-primary-600">{buttonLabel}</span> or drag
              and drop
            </p>
            {accept && (
              <p className="mt-1 text-xs text-gray-400">{accept.replace(/,/g, ', ')}</p>
            )}
            <input
              id={inputId}
              type="file"
              ref={resolvedRef}
              multiple={multiple}
              accept={accept}
              disabled={disabled}
              className="sr-only"
              {...registration}
              {...props}
            />
          </div>
        </FieldWrapper>
      );
    }

    return (
      <FieldWrapper
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
        className={wrapperClassName}
      >
        <input
          id={inputId}
          type="file"
          ref={ref}
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          className={cn(
            'block w-full text-sm text-gray-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'text-red-600',
            className,
          )}
          aria-invalid={!!error}
          {...registration}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

FileInput.displayName = 'FileInput';
