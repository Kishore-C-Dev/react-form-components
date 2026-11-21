import type { FieldConfig, SectionConfig, SubmitValidation, FormData, VisibleWhen } from '@/types/onboarding';

export function isFieldVisible(condition: VisibleWhen | undefined, data: FormData): boolean {
  if (!condition) return true;
  const current = String(data[condition.field] ?? '');
  const allowed = Array.isArray(condition.equals) ? condition.equals : [condition.equals];
  return allowed.includes(current);
}

export function validateField(field: FieldConfig, value: unknown): string | null {
  const v = field.validations;
  if (!v) return null;

  const strVal = value == null ? '' : String(value);

  if (v.required?.value) {
    if (Array.isArray(value)) {
      if (value.length === 0) return v.required.message;
    } else if (strVal.trim() === '') {
      return v.required.message;
    }
  }

  if (Array.isArray(value)) {
    if (v.minItems && value.length < Number(v.minItems.value)) return v.minItems.message;
    return null;
  }

  if (strVal === '') return null;

  if (v.minLength && strVal.length < Number(v.minLength.value)) return v.minLength.message;
  if (v.maxLength && strVal.length > Number(v.maxLength.value)) return v.maxLength.message;
  if (v.pattern && !new RegExp(String(v.pattern.value)).test(strVal)) return v.pattern.message;
  if (v.min && Number(value) < Number(v.min.value)) return v.min.message;
  if (v.max && Number(value) > Number(v.max.value)) return v.max.message;

  return null;
}

export function validateStep(
  sections: SectionConfig[],
  data: FormData,
  submitValidations?: SubmitValidation[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const section of sections) {
    for (const field of section.fields) {
      if (!isFieldVisible(field.visibleWhen, data)) continue;
      const err = validateField(field, data[field.name]);
      if (err) errors[field.name] = err;
    }
  }

  for (const rule of submitValidations ?? []) {
    if (rule.type === 'conditionalRequired') {
      const condVal = String(data[rule.if.field] ?? '');
      const matches = Array.isArray(rule.if.equals)
        ? rule.if.equals.includes(condVal)
        : rule.if.equals === condVal;
      if (matches) {
        const target = data[rule.then.field];
        const empty = Array.isArray(target)
          ? target.length === 0
          : !target || String(target).trim() === '';
        if (rule.then.required && empty) errors[rule.then.field] = rule.message;
      }
    }
  }

  return errors;
}

export function getStepDefaults(sections: SectionConfig[]): FormData {
  const defaults: FormData = {};
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.type === 'multiselect') {
        defaults[field.name] = (field.defaultValue as string[]) ?? [];
      } else if (field.type === 'checkbox') {
        defaults[field.name] = field.defaultValue ?? false;
      } else {
        defaults[field.name] = field.defaultValue ?? '';
      }
    }
  }
  return defaults;
}
