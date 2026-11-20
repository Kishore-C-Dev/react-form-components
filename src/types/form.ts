export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  hint?: string;
}

export interface CheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
  hint?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
}

export interface TableAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: 'primary' | 'danger' | 'ghost';
  hidden?: (row: T) => boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  key: string;
  direction: SortDirection;
}
