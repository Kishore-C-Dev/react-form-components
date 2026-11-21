import { useState } from 'react';
import { DataTable } from '@/components/table';
import { Badge } from '@/components/ui';
import type { TableColumn, TableAction } from '@/types/form';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joined: string;
};

const mockUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active', joined: '2024-02-20' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'inactive', joined: '2024-03-05' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'pending', joined: '2024-04-10' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'active', joined: '2024-05-01' },
  { id: 6, name: 'Frank Wilson', email: 'frank@example.com', role: 'Viewer', status: 'active', joined: '2024-05-18' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'inactive', joined: '2024-06-02' },
  { id: 8, name: 'Henry Clark', email: 'henry@example.com', role: 'Viewer', status: 'pending', joined: '2024-06-15' },
];

const statusVariant: Record<User['status'], 'success' | 'danger' | 'warning'> = {
  active: 'success',
  inactive: 'danger',
  pending: 'warning',
};

const columns: TableColumn<User>[] = [
  { key: 'id', header: '#', width: '50px' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <Badge variant={statusVariant[value as User['status']]} dot>
        {String(value)}
      </Badge>
    ),
  },
  { key: 'joined', header: 'Joined' },
];

export function TableDemo() {
  const [data, setData] = useState(mockUsers);

  const actions: TableAction<User>[] = [
    {
      label: 'Edit',
      onClick: (row) => alert(`Edit: ${row.name}`),
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => setData((prev) => prev.filter((r) => r.id !== row.id)),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DataTable</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sortable, searchable, paginated table with custom cell renders and row actions.
        </p>
      </div>

      <DataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
        actions={actions as unknown as TableAction<Record<string, unknown>>[]}
        keyField="id"
        striped
        searchable
        defaultSortable
        pageSize={5}
        emptyState={<span>No users found. All may have been deleted.</span>}
      />
    </div>
  );
}
