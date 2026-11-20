import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
