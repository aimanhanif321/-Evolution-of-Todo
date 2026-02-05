"use client";

import React from "react";
import { Repeat, X } from "lucide-react";
import type { RecurrenceRule } from "@/types/task";

interface RecurrenceSelectorProps {
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;
  recurrenceInterval: number | null;
  onIsRecurringChange: (isRecurring: boolean) => void;
  onRecurrenceRuleChange: (rule: RecurrenceRule | null) => void;
  onRecurrenceIntervalChange: (interval: number | null) => void;
  className?: string;
}

const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string; description: string }[] = [
  { value: "daily", label: "Daily", description: "Repeats every day" },
  { value: "weekly", label: "Weekly", description: "Repeats every week" },
  { value: "monthly", label: "Monthly", description: "Repeats every month" },
  { value: "custom", label: "Custom", description: "Set custom interval" },
];

export default function RecurrenceSelector({
  isRecurring,
  recurrenceRule,
  recurrenceInterval,
  onIsRecurringChange,
  onRecurrenceRuleChange,
  onRecurrenceIntervalChange,
  className = "",
}: RecurrenceSelectorProps) {
  const handleToggleRecurring = () => {
    if (isRecurring) {
      // Turn off recurring
      onIsRecurringChange(false);
      onRecurrenceRuleChange(null);
      onRecurrenceIntervalChange(null);
    } else {
      // Turn on recurring with default rule
      onIsRecurringChange(true);
      onRecurrenceRuleChange("daily");
    }
  };

  const handleRuleChange = (rule: RecurrenceRule) => {
    onRecurrenceRuleChange(rule);
    if (rule === "custom" && !recurrenceInterval) {
      onRecurrenceIntervalChange(7); // Default to 7 days for custom
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toggle Recurring */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Repeat size={16} />
          Recurring Task
        </label>
        <button
          type="button"
          onClick={handleToggleRecurring}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isRecurring ? "bg-indigo-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isRecurring ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Recurrence Options (shown when recurring is enabled) */}
      {isRecurring && (
        <div className="pl-6 space-y-3">
          {/* Rule Selection */}
          <div className="flex flex-wrap gap-2">
            {RECURRENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleRuleChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  recurrenceRule === option.value
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom Interval Input */}
          {recurrenceRule === "custom" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Every</span>
              <input
                type="number"
                min="1"
                max="365"
                value={recurrenceInterval || 7}
                onChange={(e) => onRecurrenceIntervalChange(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <span className="text-sm text-slate-600">days</span>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-slate-500">
            {recurrenceRule === "daily" && "Task will repeat every day when completed"}
            {recurrenceRule === "weekly" && "Task will repeat every 7 days when completed"}
            {recurrenceRule === "monthly" && "Task will repeat on the same day next month when completed"}
            {recurrenceRule === "custom" && `Task will repeat every ${recurrenceInterval || 7} days when completed`}
          </p>
        </div>
      )}
    </div>
  );
}
