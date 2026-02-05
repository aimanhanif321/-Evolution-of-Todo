"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Priority } from "@/types/task";

export interface TaskFilters {
  search: string;
  status: "all" | "pending" | "completed";
  priorities: Priority[];
  tagIds: number[];
  dueBefore: string | null;
  dueAfter: string | null;
  overdue: boolean;
}

const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  status: "all",
  priorities: [],
  tagIds: [],
  dueBefore: null,
  dueAfter: null,
  overdue: false,
};

export function useTaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const filters: TaskFilters = useMemo(() => {
    const search = searchParams.get("search") || "";
    const status = (searchParams.get("status") as TaskFilters["status"]) || "all";
    const priorities = searchParams.get("priority")
      ? (searchParams.get("priority")!.split(",") as Priority[])
      : [];
    const tagIds = searchParams.get("tags")
      ? searchParams.get("tags")!.split(",").map(Number).filter(n => !isNaN(n))
      : [];
    const dueBefore = searchParams.get("due_before") || null;
    const dueAfter = searchParams.get("due_after") || null;
    const overdue = searchParams.get("overdue") === "true";

    return {
      search,
      status,
      priorities,
      tagIds,
      dueBefore,
      dueAfter,
      overdue,
    };
  }, [searchParams]);

  // Update URL with new filters
  const setFilters = useCallback(
    (newFilters: Partial<TaskFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      const merged = { ...filters, ...newFilters };

      // Update or remove each parameter
      if (merged.search) {
        params.set("search", merged.search);
      } else {
        params.delete("search");
      }

      if (merged.status !== "all") {
        params.set("status", merged.status);
      } else {
        params.delete("status");
      }

      if (merged.priorities.length > 0) {
        params.set("priority", merged.priorities.join(","));
      } else {
        params.delete("priority");
      }

      if (merged.tagIds.length > 0) {
        params.set("tags", merged.tagIds.join(","));
      } else {
        params.delete("tags");
      }

      if (merged.dueBefore) {
        params.set("due_before", merged.dueBefore);
      } else {
        params.delete("due_before");
      }

      if (merged.dueAfter) {
        params.set("due_after", merged.dueAfter);
      } else {
        params.delete("due_after");
      }

      if (merged.overdue) {
        params.set("overdue", "true");
      } else {
        params.delete("overdue");
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [filters, searchParams, router, pathname]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.priorities.length > 0 ||
      filters.tagIds.length > 0 ||
      filters.dueBefore !== null ||
      filters.dueAfter !== null ||
      filters.overdue
    );
  }, [filters]);

  // Build query string for API call
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.priorities.length > 0) params.append("priority", filters.priorities.join(","));
    if (filters.tagIds.length > 0) params.append("tags", filters.tagIds.join(","));
    if (filters.dueBefore) params.append("due_before", filters.dueBefore);
    if (filters.dueAfter) params.append("due_after", filters.dueAfter);
    if (filters.overdue) params.append("overdue", "true");

    return params.toString();
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    buildQueryString,
  };
}

export default useTaskFilters;
