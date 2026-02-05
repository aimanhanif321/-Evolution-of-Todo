"use client";

import React from "react";
import { Priority, PRIORITY_COLORS } from "@/types/task";

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md";
  className?: string;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export default function PriorityBadge({
  priority,
  size = "sm",
  className = "",
}: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}
