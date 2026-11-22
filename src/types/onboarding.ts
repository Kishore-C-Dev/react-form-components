export type FieldType =
  | 'text' | 'email' | 'tel' | 'url' | 'number' | 'date'
  | 'select' | 'multiselect' | 'textarea'
  | 'radio' | 'checkbox'
  | 'repeatable-group';

export interface ValidationRule {
  value: boolean | number | string;
  message: string;
}

export interface FieldValidations {
  required?: ValidationRule;
  minLength?: ValidationRule;
  maxLength?: ValidationRule;
  pattern?: ValidationRule;
  min?: ValidationRule;
  max?: ValidationRule;
  minItems?: ValidationRule;
}

export interface VisibleWhen {
  field: string;
  equals: string | string[];
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface RepeatableGroupColumn {
  label: string;
  field: string; // key within each group record
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: FieldOption[];
  dataSource?: string;          // API endpoint → { label, value }[]
  dependsOn?: string;           // field name whose value is appended to dataSource
  defaultSelected?: string | string[]; // pre-select value(s) from dataSource
  defaultValue?: string | boolean | string[];
  validations?: FieldValidations;
  disabled?: boolean;
  visibleWhen?: VisibleWhen;
  fullWidth?: boolean;
  maxRecords?: number;
  tableColumns?: RepeatableGroupColumn[];
  groupFields?: FieldConfig[];
}

export interface SectionConfig {
  title: string;
  columns?: 1 | 2 | 3;
  fields: FieldConfig[];
}

export interface ConditionalRequired {
  type: 'conditionalRequired';
  if: { field: string; equals: string | string[] };
  then: { field: string; required: boolean };
  message: string;
}

export type SubmitValidation = ConditionalRequired;

export interface StepFormConfig {
  stepId: string;
  title: string;
  sections: SectionConfig[];
  submitValidations?: SubmitValidation[];
}

export interface StepperStep {
  id: string;
  title: string;
  description: string;
}

export interface StepperConfig {
  steps: StepperStep[];
}

export type FormData = Record<string, unknown>;
