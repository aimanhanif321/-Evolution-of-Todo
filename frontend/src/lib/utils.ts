/**
 * Utility functions for the Taskora application
 */

/**
 * Get relative due date text (e.g., "Due tomorrow", "Overdue", "Due in 3 days")
 * @param dateString - ISO date string
 * @returns Relative due date text
 */
export function getRelativeDueDate(dateString: string): string {
  const now = new Date();
  const dueDate = new Date(dateString);

  // Reset time to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 1) return "Overdue by 1 day";
    return `Overdue by ${absDays} days`;
  }

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  if (diffDays <= 14) return "Due next week";
  if (diffDays <= 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;

  // For dates further out, show the actual date
  return `Due ${dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

/**
 * Check if a date is overdue (past due date)
 * @param dateString - ISO date string
 * @returns true if overdue
 */
export function isOverdue(dateString: string): boolean {
  const now = new Date();
  const dueDate = new Date(dateString);
  return dueDate < now;
}

/**
 * Check if a date is due soon (within specified days)
 * @param dateString - ISO date string
 * @param withinDays - Number of days to consider "soon" (default: 2)
 * @returns true if due within the specified days
 */
export function isDueSoon(dateString: string, withinDays: number = 2): boolean {
  const now = new Date();
  const dueDate = new Date(dateString);

  // Not due soon if already overdue
  if (dueDate < now) return false;

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= withinDays;
}

/**
 * Format a date for display
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", options);
}

/**
 * Format a date and time for display
 * @param dateString - ISO date string
 * @returns Formatted datetime string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
