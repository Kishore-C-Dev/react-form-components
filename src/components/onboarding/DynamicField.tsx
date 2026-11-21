import { TextInput } from '@/components/form/TextInput';
import { TextArea } from '@/components/form/TextArea';
import { Select } from '@/components/form/Select';
import { MultiSelect } from '@/components/form/MultiSelect';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { cn } from '@/utils/cn';
import { useFieldOptions } from '@/hooks/useFieldOptions';
import type { FieldConfig } from '@/types/onboarding';

interface DynamicFieldProps {
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
}

export function DynamicField({ field, value, error, onChange }: DynamicFieldProps) {
  const required = field.validations?.required?.value === true;
  const strVal = (value as string) ?? '';
  const arrVal = (value as string[]) ?? [];

  const { options, loading: optsLoading } = useFieldOptions(field.dataSource, field.options);
  const resolvedOptions = options;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
    case 'date':
      return (
        <TextInput
          id={field.name}
          type={field.type}
          label={field.label}
          required={required}
          placeholder={field.placeholder}
          hint={field.hint}
          error={error}
          disabled={field.disabled}
          value={strVal}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case 'select':
      return (
        <Select
          id={field.name}
          label={field.label}
          required={required}
          options={resolvedOptions}
          placeholder={optsLoading ? 'Loading…' : (field.placeholder ?? 'Select…')}
          error={error}
          disabled={field.disabled || optsLoading}
          value={strVal}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case 'multiselect':
      return (
        <MultiSelect
          label={field.label}
          required={required}
          options={resolvedOptions}
          value={arrVal}
          onChange={(vals) => onChange(field.name, vals)}
          placeholder={optsLoading ? 'Loading…' : (field.placeholder ?? 'Select…')}
          searchable
          error={error}
          disabled={field.disabled || optsLoading}
          hint={field.hint}
        />
      );

    case 'textarea':
      return (
        <TextArea
          id={field.name}
          label={field.label}
          required={required}
          placeholder={field.placeholder}
          hint={field.hint}
          error={error}
          disabled={field.disabled}
          rows={4}
          value={strVal}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case 'radio':
      return (
        <FieldWrapper label={field.label} error={error} required={required}>
          <div className="flex flex-wrap gap-3 pt-1">
            {resolvedOptions.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                  value === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(field.name, opt.value)}
                  disabled={field.disabled}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                />
                <span className="font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </FieldWrapper>
      );

    case 'checkbox':
      return (
        <FieldWrapper error={error}>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 transition-colors hover:bg-gray-50">
            <input
              id={field.name}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(field.name, e.target.checked)}
              disabled={field.disabled}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
            />
            <span className="text-sm leading-relaxed text-gray-700">
              {required && <span className="mr-1 text-red-500">*</span>}
              {field.label}
            </span>
          </label>
        </FieldWrapper>
      );

    default:
      return null;
  }
}
