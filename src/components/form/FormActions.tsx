import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function FormActions({ children, align = 'right', className }: FormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4',
        alignClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
