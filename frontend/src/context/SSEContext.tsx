"use client";

import React, { createContext, useContext, useCallback, useState, useMemo } from "react";
import { useSSE, TaskEvent, SSEConnectionState } from "@/hooks/useSSE";

/**
 * SSE Context value
 */
interface SSEContextValue {
  /** Current connection state */
  connectionState: SSEConnectionState;
  /** Last received event */
  lastEvent: TaskEvent | null;
  /** Whether SSE is supported */
  isSupported: boolean;
  /** Number of reconnect attempts */
  reconnectAttempts: number;
  /** Manually reconnect */
  reconnect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Register a callback for task refresh */
  onTaskRefresh: (callback: () => void) => () => void;
  /** Number of registered refresh callbacks */
  refreshCallbackCount: number;
}

const SSEContext = createContext<SSEContextValue | null>(null);

/**
 * Hook to access SSE context
 */
export function useSSEContext(): SSEContextValue {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error("useSSEContext must be used within SSEProvider");
  }
  return context;
}

/**
 * Props for SSEProvider
 */
interface SSEProviderProps {
  children: React.ReactNode;
  /** Enable/disable SSE connection (default: true) */
  enabled?: boolean;
}

/**
 * SSE Provider component that manages real-time event streaming.
 *
 * Wrap your app with this provider to enable real-time updates.
 * Components can use useSSEContext() to access connection state
 * and register refresh callbacks.
 *
 * @example
 * ```tsx
 * // In your app layout
 * <SSEProvider>
 *   <YourApp />
 * </SSEProvider>
 *
 * // In a component that needs to refresh on events
 * function TaskList() {
 *   const { onTaskRefresh } = useSSEContext();
 *
 *   useEffect(() => {
 *     const unsubscribe = onTaskRefresh(() => {
 *       refetchTasks();
 *     });
 *     return unsubscribe;
 *   }, [onTaskRefresh]);
 * }
 * ```
 */
export function SSEProvider({ children, enabled = true }: SSEProviderProps) {
  // Store refresh callbacks
  const [refreshCallbacks] = useState<Set<() => void>>(() => new Set());
  const [callbackCount, setCallbackCount] = useState(0);

  // Register a refresh callback
  const onTaskRefresh = useCallback(
    (callback: () => void): (() => void) => {
      refreshCallbacks.add(callback);
      setCallbackCount(refreshCallbacks.size);

      // Return unsubscribe function
      return () => {
        refreshCallbacks.delete(callback);
        setCallbackCount(refreshCallbacks.size);
      };
    },
    [refreshCallbacks]
  );

  // Trigger all refresh callbacks
  const triggerRefresh = useCallback(() => {
    refreshCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (e) {
        console.error("[SSE] Error in refresh callback:", e);
      }
    });
  }, [refreshCallbacks]);

  // Use SSE hook with event handlers
  const {
    connectionState,
    lastEvent,
    reconnect,
    disconnect,
    isSupported,
    reconnectAttempts,
  } = useSSE({
    enabled,
    onTaskCreated: (event) => {
      console.log("[SSE] Task created:", event.payload);
      triggerRefresh();
    },
    onTaskUpdated: (event) => {
      console.log("[SSE] Task updated:", event.payload);
      triggerRefresh();
    },
    onTaskDeleted: (event) => {
      console.log("[SSE] Task deleted:", event.payload);
      triggerRefresh();
    },
    onTaskCompleted: (event) => {
      console.log("[SSE] Task completed:", event.payload);
      triggerRefresh();
    },
    onTaskRecurred: (event) => {
      console.log("[SSE] Task recurred:", event.payload);
      triggerRefresh();
    },
    onTaskReminder: (event) => {
      console.log("[SSE] Task reminder:", event.payload);
      // Reminders don't necessarily need a full refresh
      // but we trigger it anyway for consistency
      triggerRefresh();
    },
    onConnectionChange: (state) => {
      console.log("[SSE] Connection state changed:", state);
    },
  });

  // Memoize context value
  const value = useMemo<SSEContextValue>(
    () => ({
      connectionState,
      lastEvent,
      isSupported,
      reconnectAttempts,
      reconnect,
      disconnect,
      onTaskRefresh,
      refreshCallbackCount: callbackCount,
    }),
    [
      connectionState,
      lastEvent,
      isSupported,
      reconnectAttempts,
      reconnect,
      disconnect,
      onTaskRefresh,
      callbackCount,
    ]
  );

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
}

export default SSEProvider;
