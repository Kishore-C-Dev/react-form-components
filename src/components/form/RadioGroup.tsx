import { forwardRef, type InputHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';
import type { RadioOption } from '@/types/form';

interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  label?: string;
  error?: string;
  hint?: string;
  options: RadioOption[];
  registration?: Partial<UseFormRegisterReturn>;
  orientation?: 'horizontal' | 'vertical';
  wrapperClassName?: string;
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
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
    },
    ref,
  ) => {
    const groupName = id ?? registration?.name ?? 'radio-group';

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
          role="radiogroup"
          aria-labelledby={label ? `${groupName}-legend` : undefined}
        >
          {options.map((option, index) => (
            <label
              key={String(option.value)}
              className={cn(
                'flex cursor-pointer items-start gap-2.5 rounded-md border border-transparent p-2 transition-colors hover:bg-gray-50',
                option.disabled && 'cursor-not-allowed opacity-50',
                className,
              )}
            >
              <input
                type="radio"
                ref={index === 0 ? ref : undefined}
                value={option.value}
                name={groupName}
                disabled={option.disabled}
                className="mt-0.5 h-4 w-4 cursor-pointer border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed"
                aria-invalid={!!error}
                {...registration}
                {...props}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
                {option.hint && (
                  <p className="text-xs text-gray-500">{option.hint}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </FieldWrapper>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
