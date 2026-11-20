import { useState } from 'react';
import { FormDemo } from './pages/FormDemo';
import { TableDemo } from './pages/TableDemo';
import { cn } from './utils/cn';

type Tab = 'form' | 'table';

export function App() {
  const [tab, setTab] = useState<Tab>('form');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-4">
          {(['form', 'table'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors',
                tab === t
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {t === 'form' ? 'Form Components' : 'DataTable'}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'form' ? <FormDemo /> : <TableDemo />}
    </div>
  );
}
