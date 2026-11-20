import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function FormSection({
  title,
  description,
  children,
  className,
  columns = 1,
}: FormSectionProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <fieldset className={cn('border-0 p-0', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <legend className="text-base font-semibold text-gray-900">{title}</legend>
          )}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className={cn('grid gap-4', gridClass)}>{children}</div>
    </fieldset>
  );
}
