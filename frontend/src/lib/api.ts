
// export const BASE_URL = "https://subhankaladi123-todo-app.hf.space/api";
// const API_URL = process.env.NEXT_PUBLIC_API_URL || BASE_URL;



// type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// class APIClient {
//   private static async request<T>(
//     endpoint: string,
//     method: RequestMethod,
//     body?: any,
//     token?: string
//   ): Promise<T> {
//     const headers: HeadersInit = { "Content-Type": "application/json" };
    
//     // ✅ Token from parameter or localStorage
//     const finalToken = token || localStorage.getItem("token");
//     if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;

//     const config: RequestInit = { method, headers };
//     if (body) config.body = JSON.stringify(body);

//     const response = await fetch(`${API_URL}${endpoint}`, config);

//     if (response.status === 401) throw new Error("Unauthorized. Please login again.");
//     if (response.status === 404) throw new Error("Endpoint not found.");
//     if (!response.ok) {
//       let data;
//       try { data = await response.json(); } catch {}
//       throw new Error(data?.detail || data?.message || "Request failed");
//     }

//     if (response.status === 204) return {} as T;

//     return (await response.json()) as T;
//   }

//   static get<T>(endpoint: string, token?: string) {
//     return this.request<T>(endpoint, "GET", undefined, token);
//   }

//   static post<T>(endpoint: string, body?: any, token?: string) {
//     return this.request<T>(endpoint, "POST", body, token);
//   }

//   static put<T>(endpoint: string, body: any, token?: string) {
//     return this.request<T>(endpoint, "PUT", body, token);
//   }

//   static delete<T>(endpoint: string, token?: string) {
//     return this.request<T>(endpoint, "DELETE", undefined, token);
//   }

//   static patch<T>(endpoint: string, body?: any, token?: string) {
//     return this.request<T>(endpoint, "PATCH", body, token);
//   }
// }

// export default APIClient;


// src/lib/apiClient.ts

import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilters,
  Tag,
  TagCreate,
  TagUpdate,
  RecurringTaskCompleteResponse,
} from "@/types/task";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = BASE_URL;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Helper to extract a human-readable error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    // Handle FastAPI validation errors (array of detail objects)
    if (Array.isArray(obj.detail)) {
      return obj.detail
        .map((d: { msg?: string; message?: string }) => d.msg || d.message || "Validation error")
        .join(", ");
    }
    // Handle standard error responses
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return "An unexpected error occurred";
}

class APIClient {
  private static async request<T>(
    endpoint: string,
    method: RequestMethod,
    body?: any,
    token?: string
  ): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };

    // ✅ Token from parameter or localStorage
    const finalToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;

    const config: RequestInit = {
      method,
      headers,
      // Note: Using Authorization header instead of cookies
      // credentials: "include" can cause issues with some CORS + 401 scenarios
    };

    if (body) config.body = JSON.stringify(body);

    let response: Response;
    const fullUrl = `${API_URL}${endpoint}`;
    console.log(`[API] ${method} ${fullUrl}`, { hasToken: !!finalToken });

    try {
      response = await fetch(fullUrl, config);
      console.log(`[API] Response: ${response.status} ${response.statusText}`);
    } catch (networkError) {
      // Network error (backend unreachable, CORS blocked, etc.)
      console.error("[API] Network error:", networkError);
      console.error("[API] Full URL was:", fullUrl);
      console.error("[API] Config was:", JSON.stringify(config, null, 2));
      throw new Error(
        `Unable to connect to server. Please check if the backend is running at ${API_URL}`
      );
    }

    if (response.status === 401) throw new Error("Unauthorized. Please login again.");
    if (response.status === 404) throw new Error("Resource not found.");
    if (response.status === 422) {
      // Validation error - parse and format the error details
      let data;
      try {
        data = await response.json();
      } catch {}
      throw new Error(getErrorMessage(data) || "Validation error");
    }
    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {}
      throw new Error(getErrorMessage(data) || `Request failed (${response.status})`);
    }

    if (response.status === 204) return {} as T;

    return (await response.json()) as T;
  }

  // --- Methods ---
  static get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, "GET", undefined, token);
  }

  static post<T>(endpoint: string, body?: any, token?: string) {
    return this.request<T>(endpoint, "POST", body, token);
  }

  static put<T>(endpoint: string, body: any, token?: string) {
    return this.request<T>(endpoint, "PUT", body, token);
  }

  static delete<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, "DELETE", undefined, token);
  }

  static patch<T>(endpoint: string, body?: any, token?: string) {
    return this.request<T>(endpoint, "PATCH", body, token);
  }

  // ========== Task API Methods (Phase VI) ==========

  /**
   * Get tasks with optional filtering, sorting, and search
   */
  static getTasks(filters?: TaskFilters, token?: string): Promise<Task[]> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.search) params.append("search", filters.search);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.priority?.length) params.append("priority", filters.priority.join(","));
      if (filters.tags?.length) params.append("tags", filters.tags.join(","));
      if (filters.due_before) params.append("due_before", filters.due_before);
      if (filters.due_after) params.append("due_after", filters.due_after);
      if (filters.overdue) params.append("overdue", "true");
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
      if (filters.order) params.append("order", filters.order);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/tasks?${queryString}` : "/api/tasks";
    return this.get<Task[]>(endpoint, token);
  }

  /**
   * Create a new task
   */
  static createTask(task: TaskCreate, token?: string): Promise<Task> {
    return this.post<Task>("/api/tasks", task, token);
  }

  /**
   * Get a single task by ID
   */
  static getTask(taskId: number, token?: string): Promise<Task> {
    return this.get<Task>(`/api/tasks/${taskId}`, token);
  }

  /**
   * Update a task
   */
  static updateTask(taskId: number, updates: TaskUpdate, token?: string): Promise<Task> {
    return this.put<Task>(`/api/tasks/${taskId}`, updates, token);
  }

  /**
   * Delete a task
   */
  static deleteTask(taskId: number, token?: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/tasks/${taskId}`, token);
  }

  /**
   * Complete a task (handles recurring task logic)
   */
  static completeTask(
    taskId: number,
    completed: boolean,
    token?: string
  ): Promise<Task | RecurringTaskCompleteResponse> {
    return this.patch<Task | RecurringTaskCompleteResponse>(
      `/api/tasks/${taskId}/complete`,
      { completed },
      token
    );
  }

  /**
   * Update task reminder
   */
  static updateTaskReminder(
    taskId: number,
    reminderAt: string | null,
    token?: string
  ): Promise<Task> {
    return this.patch<Task>(`/api/tasks/${taskId}/reminder`, { reminder_at: reminderAt }, token);
  }

  /**
   * Get tasks with pending reminders (for polling)
   */
  static getTasksWithReminders(before?: string, token?: string): Promise<Task[]> {
    const params = before ? `?before=${encodeURIComponent(before)}` : "";
    return this.get<Task[]>(`/api/tasks/reminders${params}`, token);
  }

  // ========== Tag API Methods (Phase VI) ==========

  /**
   * Get all tags for the current user
   */
  static getTags(token?: string): Promise<Tag[]> {
    return this.get<Tag[]>("/api/tags", token);
  }

  /**
   * Create a new tag
   */
  static createTag(tag: TagCreate, token?: string): Promise<Tag> {
    return this.post<Tag>("/api/tags", tag, token);
  }

  /**
   * Update a tag
   */
  static updateTag(tagId: number, updates: TagUpdate, token?: string): Promise<Tag> {
    return this.put<Tag>(`/api/tags/${tagId}`, updates, token);
  }

  /**
   * Delete a tag
   */
  static deleteTag(tagId: number, token?: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/tags/${tagId}`, token);
  }
}

export default APIClient;
