"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";

export type SortField = "created_at" | "due_date" | "priority" | "title";
export type SortOrder = "asc" | "desc";

interface SortOption {
  field: SortField;
  label: string;
  defaultOrder: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
  { field: "created_at", label: "Date Created", defaultOrder: "desc" },
  { field: "due_date", label: "Due Date", defaultOrder: "asc" },
  { field: "priority", label: "Priority", defaultOrder: "desc" },
  { field: "title", label: "Title", defaultOrder: "asc" },
];

interface SortDropdownProps {
  sortBy: SortField | null;
  order: SortOrder;
  onChange: (sortBy: SortField | null, order: SortOrder) => void;
  className?: string;
}

export default function SortDropdown({
  sortBy,
  order,
  onChange,
  className = "",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.field === sortBy);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (option: SortOption) => {
    if (sortBy === option.field) {
      // Toggle order if same field selected
      onChange(option.field, order === "asc" ? "desc" : "asc");
    } else {
      // Set new field with its default order
      onChange(option.field, option.defaultOrder);
    }
    setIsOpen(false);
  };

  const handleClearSort = () => {
    onChange(null, "desc");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
          sortBy
            ? "bg-indigo-50 border-indigo-300 text-indigo-700"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        <ArrowUpDown size={18} />
        <span className="hidden sm:inline">
          {selectedOption ? selectedOption.label : "Sort"}
        </span>
        {sortBy && (
          order === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.field}
                onClick={() => handleSelectOption(option)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
              >
                <span
                  className={
                    sortBy === option.field
                      ? "text-indigo-700 font-medium"
                      : "text-slate-700"
                  }
                >
                  {option.label}
                </span>
                {sortBy === option.field && (
                  <div className="flex items-center gap-1 text-indigo-600">
                    {order === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))}
            {sortBy && (
              <>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleClearSort}
                  className="w-full px-4 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
                >
                  Clear sort
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
