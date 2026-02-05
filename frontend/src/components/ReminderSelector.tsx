"use client";

import React from "react";
import { Bell, X } from "lucide-react";

interface ReminderSelectorProps {
  dueDate: string | null;
  reminderAt: string | null;
  onChange: (reminderAt: string | null) => void;
  className?: string;
}

// Reminder options relative to due date
const REMINDER_OPTIONS = [
  { value: "15min", label: "15 minutes before", minutes: 15 },
  { value: "30min", label: "30 minutes before", minutes: 30 },
  { value: "1hour", label: "1 hour before", minutes: 60 },
  { value: "2hours", label: "2 hours before", minutes: 120 },
  { value: "1day", label: "1 day before", minutes: 1440 },
  { value: "custom", label: "Custom time", minutes: 0 },
];

export default function ReminderSelector({
  dueDate,
  reminderAt,
  onChange,
  className = "",
}: ReminderSelectorProps) {
  // Determine which option is currently selected
  const getSelectedOption = (): string => {
    if (!reminderAt || !dueDate) return "";

    const dueTime = new Date(dueDate).getTime();
    const reminderTime = new Date(reminderAt).getTime();
    const diffMinutes = (dueTime - reminderTime) / 60000;

    const matchedOption = REMINDER_OPTIONS.find(
      (opt) => opt.minutes > 0 && Math.abs(opt.minutes - diffMinutes) < 1
    );

    return matchedOption?.value || "custom";
  };

  const selectedOption = getSelectedOption();

  // Calculate reminder time based on option
  const handleOptionChange = (optionValue: string) => {
    if (!dueDate || optionValue === "") {
      onChange(null);
      return;
    }

    if (optionValue === "custom") {
      // For custom, use datetime picker - default to 1 hour before
      const dueTime = new Date(dueDate);
      dueTime.setMinutes(dueTime.getMinutes() - 60);
      onChange(dueTime.toISOString());
      return;
    }

    const option = REMINDER_OPTIONS.find((opt) => opt.value === optionValue);
    if (!option) {
      onChange(null);
      return;
    }

    const dueTime = new Date(dueDate);
    dueTime.setMinutes(dueTime.getMinutes() - option.minutes);
    onChange(dueTime.toISOString());
  };

  // Handle custom datetime input
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      onChange(null);
      return;
    }
    onChange(new Date(value).toISOString());
  };

  // Clear reminder
  const handleClear = () => {
    onChange(null);
  };

  // Format datetime for input
  const formatForInput = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Don't show if no due date
  if (!dueDate) {
    return (
      <div className={`text-sm text-slate-400 flex items-center gap-2 ${className}`}>
        <Bell size={16} className="text-slate-300" />
        <span>Set a due date to add a reminder</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Bell size={16} />
          Reminder
        </label>
        {reminderAt && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Quick select options */}
      <div className="flex flex-wrap gap-2">
        {REMINDER_OPTIONS.filter((opt) => opt.value !== "custom").map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleOptionChange(option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedOption === option.value
                ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Custom time input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-sm text-slate-600 whitespace-nowrap">Or set custom time:</span>
        <input
          type="datetime-local"
          value={formatForInput(reminderAt)}
          onChange={handleCustomChange}
          max={formatForInput(dueDate)}
          className="w-full sm:flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {/* Preview text */}
      {reminderAt && (
        <p className="text-xs text-slate-500">
          Reminder will be sent at {new Date(reminderAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
