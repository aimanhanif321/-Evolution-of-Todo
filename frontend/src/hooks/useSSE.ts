"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Task event types received from SSE
 */
export type TaskEventType =
  | "connected"
  | "task.created"
  | "task.updated"
  | "task.deleted"
  | "task.completed"
  | "task.recurred"
  | "task.reminder";

/**
 * Event payload structure
 */
export interface TaskEvent {
  event_id: string;
  event_type: TaskEventType;
  timestamp: string;
  user_id: string;
  payload: {
    task_id?: number;
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: string;
    due_date?: string;
    original_task_id?: number;
    new_task_id?: number;
    next_due_date?: string;
    [key: string]: unknown;
  };
}

/**
 * SSE connection state
 */
export type SSEConnectionState = "connecting" | "connected" | "disconnected" | "error";

/**
 * Options for useSSE hook
 */
interface UseSSEOptions {
  /** Enable/disable the SSE connection */
  enabled?: boolean;
  /** Callback when any event is received */
  onEvent?: (event: TaskEvent) => void;
  /** Callback when task is created */
  onTaskCreated?: (event: TaskEvent) => void;
  /** Callback when task is updated */
  onTaskUpdated?: (event: TaskEvent) => void;
  /** Callback when task is deleted */
  onTaskDeleted?: (event: TaskEvent) => void;
  /** Callback when task completion changes */
  onTaskCompleted?: (event: TaskEvent) => void;
  /** Callback when recurring task generates new instance */
  onTaskRecurred?: (event: TaskEvent) => void;
  /** Callback when reminder triggers */
  onTaskReminder?: (event: TaskEvent) => void;
  /** Callback when connection state changes */
  onConnectionChange?: (state: SSEConnectionState) => void;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number;
  /** Max reconnect attempts (default: 5) */
  maxReconnectAttempts?: number;
}

/**
 * Return type for useSSE hook
 */
interface UseSSEReturn {
  /** Current connection state */
  connectionState: SSEConnectionState;
  /** Last received event */
  lastEvent: TaskEvent | null;
  /** Manually reconnect */
  reconnect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Whether SSE is supported in this browser */
  isSupported: boolean;
  /** Number of reconnect attempts */
  reconnectAttempts: number;
}

/**
 * Hook for Server-Sent Events (SSE) connection to receive real-time task updates.
 *
 * This hook connects to the /api/events/stream endpoint and receives real-time
 * notifications when tasks are created, updated, deleted, or completed.
 *
 * @example
 * ```tsx
 * const { connectionState, lastEvent } = useSSE({
 *   onTaskCreated: (event) => {
 *     console.log('New task created:', event.payload);
 *     refetchTasks();
 *   },
 *   onTaskUpdated: (event) => {
 *     console.log('Task updated:', event.payload);
 *     refetchTasks();
 *   }
 * });
 * ```
 */
export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const {
    enabled = true,
    onEvent,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onTaskCompleted,
    onTaskRecurred,
    onTaskReminder,
    onConnectionChange,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const { token } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [connectionState, setConnectionState] = useState<SSEConnectionState>("disconnected");
  const [lastEvent, setLastEvent] = useState<TaskEvent | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const isSupported = typeof window !== "undefined" && "EventSource" in window;

  // Update connection state and notify callback
  const updateConnectionState = useCallback(
    (state: SSEConnectionState) => {
      setConnectionState(state);
      onConnectionChange?.(state);
    },
    [onConnectionChange]
  );

  // Handle incoming SSE events
  const handleEvent = useCallback(
    (event: MessageEvent, eventType: TaskEventType) => {
      try {
        const data: TaskEvent = JSON.parse(event.data);
        data.event_type = eventType; // Ensure event type is set

        setLastEvent(data);
        onEvent?.(data);

        // Route to specific handlers
        switch (eventType) {
          case "task.created":
            onTaskCreated?.(data);
            break;
          case "task.updated":
            onTaskUpdated?.(data);
            break;
          case "task.deleted":
            onTaskDeleted?.(data);
            break;
          case "task.completed":
            onTaskCompleted?.(data);
            break;
          case "task.recurred":
            onTaskRecurred?.(data);
            break;
          case "task.reminder":
            onTaskReminder?.(data);
            break;
        }
      } catch (e) {
        console.error("Failed to parse SSE event:", e, event.data);
      }
    },
    [onEvent, onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskCompleted, onTaskRecurred, onTaskReminder]
  );

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!isSupported) {
      console.warn("[SSE] EventSource not supported in this browser");
      return;
    }

    if (!token) {
      console.log("[SSE] No auth token available, skipping connection");
      return;
    }

    if (!enabled) {
      console.log("[SSE] SSE disabled, skipping connection");
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    updateConnectionState("connecting");

    // Build SSE URL with auth token as query parameter
    // EventSource doesn't support custom headers, so we pass token via query param
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const sseUrl = `${apiUrl}/api/events/stream?token=${encodeURIComponent(token)}`;

    // Create EventSource
    const eventSource = new EventSource(sseUrl, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log("[SSE] Connection opened");
      updateConnectionState("connected");
      setReconnectAttempts(0);
    };

    // Generic message handler (for events without specific type)
    eventSource.onmessage = (event) => {
      console.log("[SSE] Message received:", event.data);
    };

    // Connection event handler
    eventSource.addEventListener("connected", (event) => {
      console.log("[SSE] Connected event:", (event as MessageEvent).data);
      updateConnectionState("connected");
    });

    // Task event handlers
    eventSource.addEventListener("task.created", (event) => {
      handleEvent(event as MessageEvent, "task.created");
    });

    eventSource.addEventListener("task.updated", (event) => {
      handleEvent(event as MessageEvent, "task.updated");
    });

    eventSource.addEventListener("task.deleted", (event) => {
      handleEvent(event as MessageEvent, "task.deleted");
    });

    eventSource.addEventListener("task.completed", (event) => {
      handleEvent(event as MessageEvent, "task.completed");
    });

    eventSource.addEventListener("task.recurred", (event) => {
      handleEvent(event as MessageEvent, "task.recurred");
    });

    eventSource.addEventListener("task.reminder", (event) => {
      handleEvent(event as MessageEvent, "task.reminder");
    });

    // Error handler
    eventSource.onerror = (event) => {
      // EventSource error events don't contain much info, but we can check readyState
      const readyStateMap: Record<number, string> = {
        0: "CONNECTING",
        1: "OPEN",
        2: "CLOSED",
      };
      const readyState = readyStateMap[eventSource.readyState] || "UNKNOWN";

      console.error(
        `[SSE] Connection error (readyState: ${readyState})`,
        "This may be due to: network issues, CORS, or authentication failure"
      );

      updateConnectionState("error");

      eventSource.close();
      eventSourceRef.current = null;

      // Auto-reconnect if enabled and within attempt limit
      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts((prev) => prev + 1);
        console.log(
          `[SSE] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      } else {
        console.warn("[SSE] Max reconnect attempts reached, staying disconnected");
        updateConnectionState("disconnected");
      }
    };
  }, [
    isSupported,
    token,
    enabled,
    handleEvent,
    updateConnectionState,
    autoReconnect,
    reconnectAttempts,
    maxReconnectAttempts,
    reconnectDelay,
  ]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    updateConnectionState("disconnected");
    setReconnectAttempts(0);
  }, [updateConnectionState]);

  // Manually reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    connect();
  }, [connect, disconnect]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (enabled && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connectionState,
    lastEvent,
    reconnect,
    disconnect,
    isSupported,
    reconnectAttempts,
  };
}

export default useSSE;
