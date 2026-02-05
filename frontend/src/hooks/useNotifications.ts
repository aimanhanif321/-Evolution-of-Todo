"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import APIClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface PendingReminder {
  id: number;
  title: string;
  due_date: string | null;
  reminder_at: string | null;
}

interface UseNotificationsOptions {
  pollingInterval?: number; // in milliseconds, default 60000 (60 seconds)
  enabled?: boolean;
}

interface UseNotificationsReturn {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<boolean>;
  pendingReminders: PendingReminder[];
  inAppNotifications: PendingReminder[];
  dismissNotification: (id: number) => void;
  isPolling: boolean;
}

export function useNotifications({
  pollingInterval = 60000,
  enabled = true,
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { token } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const [inAppNotifications, setInAppNotifications] = useState<PendingReminder[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const shownNotificationIds = useRef<Set<number>>(new Set());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check if notifications are supported
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (permission === "unsupported") {
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch {
      return false;
    }
  }, [permission]);

  // Show browser notification
  const showBrowserNotification = useCallback((reminder: PendingReminder) => {
    if (permission !== "granted") return;

    const dueText = reminder.due_date
      ? `Due: ${new Date(reminder.due_date).toLocaleString()}`
      : "No due date";

    const notification = new Notification("Task Reminder", {
      body: `${reminder.title}\n${dueText}`,
      icon: "/favicon.ico",
      tag: `reminder-${reminder.id}`,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, [permission]);

  // Show in-app notification (fallback when browser notifications denied)
  const showInAppNotification = useCallback((reminder: PendingReminder) => {
    setInAppNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === reminder.id)) return prev;
      return [...prev, reminder];
    });
  }, []);

  // Dismiss in-app notification
  const dismissNotification = useCallback((id: number) => {
    setInAppNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Mark reminder as sent on backend
  const markReminderSent = useCallback(async (taskId: number) => {
    if (!token) return;
    try {
      await APIClient.post(`/api/tasks/${taskId}/reminder/sent`, {}, token);
    } catch (err) {
      console.error("Failed to mark reminder as sent:", err);
    }
  }, [token]);

  // Poll for pending reminders
  const pollReminders = useCallback(async () => {
    if (!token || !enabled) return;

    setIsPolling(true);
    try {
      const reminders = await APIClient.get<PendingReminder[]>("/api/tasks/reminders", token);
      setPendingReminders(reminders);

      // Process new reminders
      for (const reminder of reminders) {
        if (!shownNotificationIds.current.has(reminder.id)) {
          shownNotificationIds.current.add(reminder.id);

          // Show notification based on permission
          if (permission === "granted") {
            showBrowserNotification(reminder);
          } else {
            showInAppNotification(reminder);
          }

          // Mark as sent on backend
          await markReminderSent(reminder.id);
        }
      }
    } catch (err) {
      console.error("Failed to poll reminders:", err);
    } finally {
      setIsPolling(false);
    }
  }, [token, enabled, permission, showBrowserNotification, showInAppNotification, markReminderSent]);

  // Set up polling interval
  useEffect(() => {
    if (!token || !enabled) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Initial poll
    pollReminders();

    // Set up interval
    pollingRef.current = setInterval(pollReminders, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [token, enabled, pollingInterval, pollReminders]);

  return {
    permission,
    requestPermission,
    pendingReminders,
    inAppNotifications,
    dismissNotification,
    isPolling,
  };
}

export default useNotifications;
