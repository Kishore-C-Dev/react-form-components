import { cn } from '@/utils/cn';
import { DynamicField } from './DynamicField';
import { isFieldVisible } from '@/utils/onboardingValidator';
import type { StepFormConfig, FormData } from '@/types/onboarding';

interface DynamicFormStepProps {
  config: StepFormConfig;
  formData: FormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onChange: (name: string, value: unknown) => void;
}

const gridCols: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

export function DynamicFormStep({
  config,
  formData,
  errors,
  touched,
  onChange,
}: DynamicFormStepProps) {
  return (
    <div className="space-y-6">
      {config.sections.map((section, si) => {
        const visibleFields = section.fields.filter((f) =>
          isFieldVisible(f.visibleWhen, formData),
        );
        if (visibleFields.length === 0) return null;

        const cols = section.columns ?? 2;

        return (
          <fieldset
            key={si}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <legend className="sr-only">{section.title}</legend>
            <div className="border-b border-gray-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {section.title}
              </h3>
            </div>

            <div className={cn('grid gap-5 p-5', gridCols[cols])}>
              {visibleFields.map((field) => (
                <div
                  key={field.name}
                  className={cn(field.fullWidth && 'col-span-full')}
                >
                  <DynamicField
                    field={field}
                    value={formData[field.name]}
                    error={touched[field.name] ? errors[field.name] : undefined}
                    onChange={onChange}
                    dependsOnValue={
                      field.dependsOn ? String(formData[field.dependsOn] ?? '') : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
