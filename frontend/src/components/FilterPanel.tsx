"use client";

import React from "react";
import { Filter, X, CheckCircle, Circle, AlertCircle } from "lucide-react";
import type { Priority, Tag } from "@/types/task";
import { PRIORITY_COLORS } from "@/types/task";
import TagBadge from "./TagBadge";

interface FilterPanelProps {
  // Status filter
  status: "all" | "pending" | "completed";
  onStatusChange: (status: "all" | "pending" | "completed") => void;

  // Priority filter
  selectedPriorities: Priority[];
  onPriorityChange: (priorities: Priority[]) => void;

  // Tag filter
  availableTags: Tag[];
  selectedTagIds: number[];
  onTagChange: (tagIds: number[]) => void;

  // Overdue filter
  overdue: boolean;
  onOverdueChange: (overdue: boolean) => void;

  // Clear all
  onClearAll: () => void;
  hasActiveFilters: boolean;

  className?: string;
}

const STATUS_OPTIONS: { value: "all" | "pending" | "completed"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <Circle size={14} /> },
  { value: "pending", label: "Pending", icon: <Circle size={14} /> },
  { value: "completed", label: "Completed", icon: <CheckCircle size={14} /> },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function FilterPanel({
  status,
  onStatusChange,
  selectedPriorities,
  onPriorityChange,
  availableTags,
  selectedTagIds,
  onTagChange,
  overdue,
  onOverdueChange,
  onClearAll,
  hasActiveFilters,
  className = "",
}: FilterPanelProps) {
  const togglePriority = (priority: Priority) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter((p) => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  };

  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onTagChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Filter size={18} />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium text-slate-600 block mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                status === option.value
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium text-slate-600 block mb-2">Priority</label>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => togglePriority(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedPriorities.includes(option.value)
                  ? "ring-2 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{
                backgroundColor: `${PRIORITY_COLORS[option.value]}20`,
                color: PRIORITY_COLORS[option.value],
                ...(selectedPriorities.includes(option.value) && {
                  ringColor: PRIORITY_COLORS[option.value],
                }),
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      {availableTags.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-600 block mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`transition-all rounded-lg ${
                  selectedTagIds.includes(tag.id)
                    ? "ring-2 ring-offset-1 ring-indigo-500"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <TagBadge tag={tag} size="sm" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Filter */}
      <div>
        <button
          onClick={() => onOverdueChange(!overdue)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
            overdue
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <AlertCircle size={14} />
          Overdue only
        </button>
      </div>
    </div>
  );
}
