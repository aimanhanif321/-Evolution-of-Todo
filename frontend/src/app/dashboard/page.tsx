import TaskList from '@/components/TaskList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Taskora',
  description: 'Manage your tasks efficiently.',
};

export default function DashboardPage() {
  return (
    <div>
      <TaskList />
    </div>
  );
}