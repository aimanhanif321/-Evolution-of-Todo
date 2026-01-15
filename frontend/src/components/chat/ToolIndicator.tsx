"use client";

import React from 'react';
import { ToolCallResult } from '@/services/chatApi';
import { Check, Plus, List, Trash2, Edit, CheckCircle } from 'lucide-react';

interface ToolIndicatorProps {
  toolCall: ToolCallResult;
}

const toolIcons: Record<string, React.ElementType> = {
  add_task: Plus,
  list_tasks: List,
  complete_task: CheckCircle,
  delete_task: Trash2,
  update_task: Edit,
};

const toolLabels: Record<string, string> = {
  add_task: 'Added task',
  list_tasks: 'Listed tasks',
  complete_task: 'Completed task',
  delete_task: 'Deleted task',
  update_task: 'Updated task',
};

export default function ToolIndicator({ toolCall }: ToolIndicatorProps) {
  const Icon = toolIcons[toolCall.tool] || Check;
  const label = toolLabels[toolCall.tool] || toolCall.tool;
  const hasError = toolCall.result?.error;
  const taskTitle = toolCall.result?.title || toolCall.params?.title;

  return (
    <div
      className={`flex items-center gap-2 text-xs py-1 ${
        hasError ? 'text-red-400' : 'text-emerald-400'
      }`}
    >
      <Icon className="w-3 h-3" />
      <span>
        {hasError ? (
          <span className="text-red-400">Error: {toolCall.result?.error}</span>
        ) : (
          <>
            {label}
            {taskTitle && (
              <span className="text-slate-400 ml-1">: {taskTitle}</span>
            )}
          </>
        )}
      </span>
    </div>
  );
}
