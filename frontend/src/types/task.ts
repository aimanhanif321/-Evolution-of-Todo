// Task Types for Advanced Todo Features (Phase VI)

export type Priority = "low" | "medium" | "high" | "urgent";

export type RecurrenceRule = "daily" | "weekly" | "monthly" | "custom";

export interface Tag {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  priority: Priority;
  due_date: string | null;
  reminder_at: string | null;
  reminder_sent: boolean;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  recurrence_interval: number | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  reminder_at?: string;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule;
  recurrence_interval?: number;
  tag_ids?: number[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string | null;
  reminder_at?: string | null;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule | null;
  recurrence_interval?: number | null;
  tag_ids?: number[];
}

// Response type for completing recurring tasks
export interface RecurringTaskCompleteResponse {
  completed_task: Task;
  next_task?: Task;
}

// Filter parameters for GET /api/tasks
export interface TaskFilters {
  search?: string;
  status?: "all" | "pending" | "completed";
  priority?: Priority[];
  tags?: number[];
  due_before?: string;
  due_after?: string;
  overdue?: boolean;
  sort_by?: "created_at" | "due_date" | "priority" | "title";
  order?: "asc" | "desc";
}

// Priority color mapping for UI
export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#9CA3AF",      // gray-400
  medium: "#3B82F6",   // blue-500
  high: "#F97316",     // orange-500
  urgent: "#EF4444",   // red-500
};

// Priority sort order for sorting (lower = higher priority)
export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
