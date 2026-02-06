"use client";

import React from "react";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { getRelativeDueDate, isOverdue, isDueSoon } from "@/lib/utils";

interface DueDateBadgeProps {
  dueDate: string;
  completed?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function DueDateBadge({
  dueDate,
  completed = false,
  size = "sm",
  className = "",
}: DueDateBadgeProps) {
  const relativeText = getRelativeDueDate(dueDate);
  const overdue = isOverdue(dueDate) && !completed;
  const soon = isDueSoon(dueDate, 2) && !completed && !overdue;

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  // Determine styling based on status
  let bgColor = "bg-slate-100";
  let textColor = "text-slate-600";
  let borderColor = "border-slate-200";
  let Icon = Calendar;

  if (overdue) {
    bgColor = "bg-red-50";
    textColor = "text-red-600";
    borderColor = "border-red-200";
    Icon = AlertTriangle;
  } else if (soon) {
    bgColor = "bg-amber-50";
    textColor = "text-amber-600";
    borderColor = "border-amber-200";
    Icon = Clock;
  } else if (completed) {
    bgColor = "bg-green-50";
    textColor = "text-green-600";
    borderColor = "border-green-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeClasses} ${bgColor} ${textColor} ${borderColor} ${className}`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      {relativeText}
    </span>
  );
}
