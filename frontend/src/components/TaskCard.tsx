"use client";
import React, { useState } from "react";
import { Check, Trash2, Edit2, Clock, Repeat } from "lucide-react";
import APIClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PriorityBadge from "./PriorityBadge";
import TagBadge from "./TagBadge";
import DueDateBadge from "./DueDateBadge";
import type { Priority, Tag, RecurrenceRule } from "@/types/task";
import { isOverdue } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  priority?: Priority;
  tags?: Tag[];
  due_date?: string | null;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule | null;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onUpdate, onEdit }: TaskCardProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // Format date
  const date = new Date(task.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Check if task is overdue
  const taskOverdue = task.due_date && !task.completed && isOverdue(task.due_date);

  // Toggle complete status
  const toggleComplete = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      await APIClient.patch(`/api/tasks/${task.id}/complete`, { completed: !task.completed }, token);
      onUpdate();
    } catch (err: any) {
      console.error("Failed to toggle task", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to update task";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    if (!token || loading) return;
    setLoading(true);
    try {
      await APIClient.delete(`/api/tasks/${task.id}`, token);
      onUpdate();
    } catch (err: any) {
      console.error("Failed to delete task", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete task";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-full ${
        task.completed
          ? "opacity-75 bg-slate-50 border border-slate-100"
          : taskOverdue
          ? "border-2 border-red-300 bg-red-50/30"
          : "border border-slate-100"
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={toggleComplete}
            disabled={loading}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? "bg-green-500 border-green-500 text-white"
                : "border-slate-300 hover:border-indigo-500 text-transparent"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Always visible on mobile, hover effect on desktop */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={deleteTask}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h3
            className={`font-semibold text-lg leading-tight ${
              task.completed
                ? "text-slate-500 line-through decoration-slate-400"
                : "text-slate-800"
            }`}
          >
            {task.title}
          </h3>
          {task.priority && (
            <PriorityBadge priority={task.priority} size="sm" />
          )}
          {task.is_recurring && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
              title={`Repeats ${task.recurrence_rule || "regularly"}`}
            >
              <Repeat className="w-3 h-3" />
              <span className="hidden sm:inline">{task.recurrence_rule || "recurring"}</span>
            </span>
          )}
        </div>
        <p
          className={`text-sm leading-relaxed ${
            task.completed ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {task.description || "No description"}
        </p>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{date}</span>
        </div>
        {task.due_date && (
          <DueDateBadge
            dueDate={task.due_date}
            completed={task.completed}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}

