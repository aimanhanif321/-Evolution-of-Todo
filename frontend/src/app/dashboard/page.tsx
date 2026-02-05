import { Suspense } from 'react';
import TaskList from '@/components/TaskList';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Taskora',
  description: 'Manage your tasks efficiently.',
};

function TaskListFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<TaskListFallback />}>
        <TaskList />
      </Suspense>
    </div>
  );
}