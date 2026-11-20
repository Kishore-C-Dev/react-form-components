import { forwardRef, type InputHTMLAttributes } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper } from './FieldWrapper';

interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  registration?: Partial<UseFormRegisterReturn>;
  wrapperClassName?: string;
  showValue?: boolean;
  currentValue?: number;
  unit?: string;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
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
      showValue = true,
      currentValue,
      unit = '',
      min = 0,
      max = 100,
      step = 1,
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
        <div className="flex items-center gap-3">
          <input
            id={inputId}
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            className={cn(
              'h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            aria-invalid={!!error}
            {...registration}
            {...props}
          />
          {showValue && currentValue !== undefined && (
            <span className="min-w-[3rem] text-right text-sm font-medium text-gray-700">
              {currentValue}
              {unit}
            </span>
          )}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </FieldWrapper>
    );
  },
);

RangeSlider.displayName = 'RangeSlider';
