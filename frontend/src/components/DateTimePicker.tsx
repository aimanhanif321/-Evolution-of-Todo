"use client";

import React from "react";
import { Calendar, X } from "lucide-react";

interface DateTimePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  className?: string;
}

// Quick select options
const QUICK_OPTIONS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In a week", days: 7 },
];

export default function DateTimePicker({
  value,
  onChange,
  label = "Due Date",
  className = "",
}: DateTimePickerProps) {
  // Format datetime-local value (YYYY-MM-DDTHH:MM)
  const formatForInput = (isoString: string | null): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Format to local datetime-local format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      // Convert to ISO string
      const date = new Date(val);
      onChange(date.toISOString());
    } else {
      onChange(null);
    }
  };

  // Quick select handler
  const handleQuickSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    // Set to end of day (23:59) for due dates
    date.setHours(23, 59, 0, 0);
    onChange(date.toISOString());
  };

  // Clear handler
  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-slate-700 block">{label}</label>

      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => handleQuickSelect(option.days)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Date/Time Input */}
      <div className="relative">
        <Calendar
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="datetime-local"
          value={formatForInput(value)}
          onChange={handleInputChange}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear due date"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
