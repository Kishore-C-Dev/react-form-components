import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DynamicField } from './DynamicField';
import { RepeatableGroupModal } from './RepeatableGroupModal';
import { isFieldVisible } from '@/utils/onboardingValidator';
import { cn } from '@/utils/cn';
import type { FieldConfig, RepeatableGroupColumn } from '@/types/onboarding';

type GroupRecord = Record<string, unknown>;

interface RepeatableGroupWidgetProps {
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
}

/* Resolve display label for a cell value: looks up in groupField options if available */
function resolveLabel(val: unknown, groupField?: FieldConfig): string {
  if (val == null || val === '') return '—';
  if (groupField?.options) {
    const opt = groupField.options.find((o) => o.value === String(val));
    if (opt) return opt.label;
  }
  if (Array.isArray(val)) return val.join(', ') || '—';
  return String(val);
}

export function RepeatableGroupWidget({
  field, value, error, onChange,
}: RepeatableGroupWidgetProps) {
  const records: GroupRecord[] = Array.isArray(value) ? (value as GroupRecord[]) : [];
  const maxRecords = field.maxRecords ?? 10;
  const groupFields: FieldConfig[] = field.groupFields ?? [];
  const tableColumns: RepeatableGroupColumn[] = field.tableColumns ?? [];
  const useModal = !!field.modalSteps?.length;

  /* ── Modal state (used when modalSteps is defined) ──────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditIndex, setModalEditIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<GroupRecord>({});

  /* ── Inline panel state (fallback when no modalSteps) ───── */
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<GroupRecord>({});
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

  function seedDefaults(): GroupRecord {
    const d: GroupRecord = {};
    groupFields.forEach((f) => {
      if (f.defaultValue !== undefined) d[f.name] = f.defaultValue;
      if (f.defaultSelected !== undefined) d[f.name] = f.defaultSelected;
    });
    return d;
  }

  function openAdd() {
    if (useModal) {
      setModalInitial(seedDefaults());
      setModalEditIndex(null);
      setModalOpen(true);
    } else {
      setDraft(seedDefaults());
      setDraftErrors({});
      setEditingIndex(null);
      setPanelOpen(true);
    }
  }

  function openEdit(i: number) {
    if (useModal) {
      setModalInitial({ ...records[i] });
      setModalEditIndex(i);
      setModalOpen(true);
    } else {
      setDraft({ ...records[i] });
      setDraftErrors({});
      setEditingIndex(i);
      setPanelOpen(true);
    }
  }

  function handleModalSave(record: GroupRecord) {
    const updated = [...records];
    if (modalEditIndex !== null) updated[modalEditIndex] = record;
    else updated.push(record);
    onChange(field.name, updated);
    setModalOpen(false);
  }

  function handleDelete(i: number) {
    if (!window.confirm('Remove this entry?')) return;
    onChange(field.name, records.filter((_, idx) => idx !== i));
  }

  function handleDraftChange(name: string, val: unknown) {
    setDraft((prev) => ({ ...prev, [name]: val }));
    if (draftErrors[name]) {
      setDraftErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    groupFields.forEach((f) => {
      if (!isFieldVisible(f.visibleWhen, draft as Record<string, unknown>)) return;
      if (f.validations?.required?.value) {
        const v = draft[f.name];
        const empty = Array.isArray(v) ? v.length === 0 : !v || String(v).trim() === '';
        if (empty) errs[f.name] = f.validations.required.message ?? 'Required';
      }
    });
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setDraftErrors(errs); return; }
    const updated = [...records];
    if (editingIndex !== null) updated[editingIndex] = draft;
    else updated.push(draft);
    onChange(field.name, updated);
    setPanelOpen(false);
  }

  function handleCancel() {
    setPanelOpen(false);
    setDraftErrors({});
  }

  const atMax = records.length >= maxRecords;

  return (
    <>
      {/* ── Full-screen modal (used when modalSteps is defined) ── */}
      {useModal && modalOpen && (
        <RepeatableGroupModal
          title={field.label}
          steps={field.modalSteps!}
          groupFields={groupFields}
          initialValues={modalInitial}
          editingIndex={modalEditIndex}
          onSave={handleModalSave}
          onCancel={() => setModalOpen(false)}
        />
      )}

      <div className={cn('rounded-xl border bg-white shadow-sm overflow-hidden', error ? 'border-red-300' : 'border-gray-200')}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              {field.label}
            </span>
            <span className="ml-2 text-xs text-gray-400">
              {records.length} / {maxRecords}
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openAdd}
            disabled={atMax || panelOpen}
          >
            + Add
          </Button>
        </div>

        {/* ── Records table ──────────────────────────────────── */}
        {records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">#</th>
                  {tableColumns.map((col) => (
                    <th key={col.field} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((rec, i) => {
                  const isEditing = !useModal && panelOpen && editingIndex === i;
                  return (
                    <tr key={i} className={cn('transition-colors', isEditing ? 'bg-primary-50/60' : 'hover:bg-gray-50/60')}>
                      <td className="px-4 py-3 text-xs font-medium text-gray-400">{i + 1}</td>
                      {tableColumns.map((col) => {
                        const gf = groupFields.find((f) => f.name === col.field);
                        return (
                          <td key={col.field} className="px-4 py-3 text-sm text-gray-800">
                            {resolveLabel(rec[col.field], gf)}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(i)}
                            disabled={!useModal && panelOpen && editingIndex !== i}
                            className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-40"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(i)}
                            disabled={!useModal && panelOpen}
                            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────── */}
        {records.length === 0 && !panelOpen && (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">No entries yet — click <strong>+ Add</strong> to begin</p>
          </div>
        )}

        {/* ── Inline panel (fallback, used when no modalSteps) ── */}
        {!useModal && panelOpen && (
          <div className="border-t border-primary-100 bg-blue-50/30">
            <div className="flex items-center justify-between border-b border-primary-100 px-5 py-3">
              <span className="text-sm font-semibold text-primary-700">
                {editingIndex !== null ? `Edit Entry #${editingIndex + 1}` : 'New Entry'}
              </span>
              <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close panel">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {groupFields.map((f) => {
                  if (!isFieldVisible(f.visibleWhen, draft as Record<string, unknown>)) return null;
                  return (
                    <div key={f.name} className={cn(f.fullWidth && 'col-span-full')}>
                      <DynamicField
                        field={f}
                        value={draft[f.name]}
                        error={draftErrors[f.name]}
                        onChange={handleDraftChange}
                        dependsOnValue={f.dependsOn ? String(draft[f.dependsOn] ?? '') : undefined}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <Button variant="secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  {editingIndex !== null ? 'Update Entry' : 'Add Entry'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Field-level error */}
        {error && (
          <div role="alert" className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
