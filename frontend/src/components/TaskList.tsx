"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSSEContext } from '@/context/SSEContext';
import APIClient from '@/lib/api';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import SearchInput from './SearchInput';
import FilterPanel from './FilterPanel';
import SortDropdown, { SortField, SortOrder } from './SortDropdown';
import { Plus, Loader2, Inbox, SearchX, Filter, ChevronDown, ChevronUp, Wifi, WifiOff } from 'lucide-react';
import type { Tag, Priority } from '@/types/task';
import { useDebounce } from '@/hooks/useDebounce';

interface Task {
    id: number;
    user_id: string;
    title: string;
    description: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
    priority?: Priority;
    tags?: Tag[];
    due_date?: string;
}

export default function TaskList() {
    const { user, token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // SSE real-time updates context
    let sseContext: { connectionState: string; onTaskRefresh: (cb: () => void) => () => void } | null = null;
    try {
        sseContext = useSSEContext();
    } catch {
        // SSE context not available (provider not mounted), continue without it
    }

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Read filters and sort from URL
    const filters = useMemo(() => {
        const search = searchParams.get("search") || "";
        const status = (searchParams.get("status") as "all" | "pending" | "completed") || "all";
        const priorities = searchParams.get("priority")
            ? (searchParams.get("priority")!.split(",") as Priority[])
            : [];
        const tagIds = searchParams.get("tags")
            ? searchParams.get("tags")!.split(",").map(Number).filter(n => !isNaN(n))
            : [];
        const overdue = searchParams.get("overdue") === "true";

        return { search, status, priorities, tagIds, overdue };
    }, [searchParams]);

    // Read sort from URL
    const sortConfig = useMemo(() => {
        const sortBy = searchParams.get("sort_by") as SortField | null;
        const order = (searchParams.get("order") as SortOrder) || "desc";
        return { sortBy, order };
    }, [searchParams]);

    // Debounce search
    const debouncedSearch = useDebounce(filters.search, 300);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return (
            filters.status !== "all" ||
            filters.priorities.length > 0 ||
            filters.tagIds.length > 0 ||
            filters.overdue
        );
    }, [filters]);

    // Update URL with new filters
    const updateFilters = useCallback((updates: Partial<typeof filters>) => {
        const params = new URLSearchParams(searchParams.toString());
        const merged = { ...filters, ...updates };

        if (merged.search) params.set("search", merged.search);
        else params.delete("search");

        if (merged.status !== "all") params.set("status", merged.status);
        else params.delete("status");

        if (merged.priorities.length > 0) params.set("priority", merged.priorities.join(","));
        else params.delete("priority");

        if (merged.tagIds.length > 0) params.set("tags", merged.tagIds.join(","));
        else params.delete("tags");

        if (merged.overdue) params.set("overdue", "true");
        else params.delete("overdue");

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }, [filters, searchParams, router, pathname]);

    // Update URL with new sort
    const updateSort = useCallback((sortBy: SortField | null, order: SortOrder) => {
        const params = new URLSearchParams(searchParams.toString());

        if (sortBy) {
            params.set("sort_by", sortBy);
            params.set("order", order);
        } else {
            params.delete("sort_by");
            params.delete("order");
        }

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }, [searchParams, router, pathname]);

    // Clear all filters and sort
    const clearFilters = useCallback(() => {
        router.push(pathname);
    }, [router, pathname]);

    // Build query string for API
    const buildApiQuery = useCallback(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filters.status !== "all") params.append("status", filters.status);
        if (filters.priorities.length > 0) params.append("priority", filters.priorities.join(","));
        if (filters.tagIds.length > 0) params.append("tags", filters.tagIds.join(","));
        if (filters.overdue) params.append("overdue", "true");
        if (sortConfig.sortBy) {
            params.append("sort_by", sortConfig.sortBy);
            params.append("order", sortConfig.order);
        }
        return params.toString();
    }, [debouncedSearch, filters, sortConfig]);

    const fetchTasks = async () => {
        if (!token) {
            console.log("fetchTasks: No token, skipping");
            setLoading(false);
            return;
        }
        console.log("fetchTasks: Starting with token:", token.substring(0, 20) + "...");
        try {
            // Build query parameters
            const taskFilters = {
                search: debouncedSearch || undefined,
                status: filters.status !== "all" ? filters.status : undefined,
                priority: filters.priorities.length > 0 ? filters.priorities : undefined,
                tags: filters.tagIds.length > 0 ? filters.tagIds : undefined,
                overdue: filters.overdue || undefined,
                sort_by: sortConfig.sortBy || undefined,
                order: sortConfig.order,
            };
            const tasksFromApi = await APIClient.getTasks(taskFilters, token);
            console.log("fetchTasks: Success, got", tasksFromApi?.length || 0, "tasks");
            setTasks(tasksFromApi || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch tasks";
            console.error("Failed to fetch tasks:", message, error);
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        if (!token) return;
        try {
            const tagsFromApi = await APIClient.getTags(token);
            setTags(tagsFromApi || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch tags";
            console.error("Failed to fetch tags:", message);
        }
    };

    const handleTagCreated = (newTag: Tag) => {
        setTags((prev) => [...prev, newTag]);
    };

    useEffect(() => {
        if (user && token) {
            fetchTags();
        }
    }, [user, token]);

    // Re-fetch tasks when filters or sort change
    useEffect(() => {
        if (user && token) {
            fetchTasks();
        }
    }, [user, token, debouncedSearch, filters.status, filters.priorities.join(","), filters.tagIds.join(","), filters.overdue, sortConfig.sortBy, sortConfig.order]);

    // Register for SSE auto-refresh
    useEffect(() => {
        if (!sseContext) return;

        const unsubscribe = sseContext.onTaskRefresh(() => {
            console.log("[TaskList] SSE triggered refresh");
            fetchTasks();
        });

        return unsubscribe;
    }, [sseContext]);

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        fetchTasks();
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const showEmptyState = tasks.length === 0 && (debouncedSearch || hasActiveFilters);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
                        {sseContext && (
                            <span
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    sseContext.connectionState === "connected"
                                        ? "bg-green-100 text-green-700"
                                        : sseContext.connectionState === "connecting"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                                title={`Real-time updates: ${sseContext.connectionState}`}
                            >
                                {sseContext.connectionState === "connected" ? (
                                    <Wifi size={12} />
                                ) : (
                                    <WifiOff size={12} />
                                )}
                                <span className="hidden sm:inline">
                                    {sseContext.connectionState === "connected" ? "Live" : sseContext.connectionState}
                                </span>
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        You have {tasks.filter(t => !t.completed).length} incomplete tasks.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 font-medium transition-all hover:scale-[1.02] w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Add Task
                </button>
            </div>

            {/* Search, Filter Toggle, and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput
                    value={filters.search}
                    onChange={(value) => updateFilters({ search: value })}
                    placeholder="Search tasks by title or description..."
                    className="flex-1 max-w-md"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                            hasActiveFilters
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <Filter size={18} />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && (
                            <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {filters.priorities.length + filters.tagIds.length + (filters.status !== "all" ? 1 : 0) + (filters.overdue ? 1 : 0)}
                            </span>
                        )}
                        {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <SortDropdown
                        sortBy={sortConfig.sortBy}
                        order={sortConfig.order}
                        onChange={updateSort}
                    />
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-6">
                    <FilterPanel
                        status={filters.status}
                        onStatusChange={(status) => updateFilters({ status })}
                        selectedPriorities={filters.priorities}
                        onPriorityChange={(priorities) => updateFilters({ priorities })}
                        availableTags={tags}
                        selectedTagIds={filters.tagIds}
                        onTagChange={(tagIds) => updateFilters({ tagIds })}
                        overdue={filters.overdue}
                        onOverdueChange={(overdue) => updateFilters({ overdue })}
                        onClearAll={clearFilters}
                        hasActiveFilters={hasActiveFilters || !!debouncedSearch}
                    />
                </div>
            )}

            {/* No tasks found after search/filter */}
            {showEmptyState ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <SearchX className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        No tasks match your current filters. Try adjusting your search or filters.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        Get started by creating your first task using the button above.
                    </p>
                    <button
                        onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
                        className="text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                        Create a task
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onUpdate={fetchTasks}
                            onEdit={() => handleEdit(task)}
                        />
                    ))}
                </div>
            )}

            {isFormOpen && (
                <TaskForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess}
                    editTask={editingTask}
                    availableTags={tags}
                    onTagCreated={handleTagCreated}
                />
            )}
        </div>
    );
}
