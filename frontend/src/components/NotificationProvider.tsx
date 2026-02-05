"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";

interface NotificationContextValue {
  permission: "granted" | "denied" | "default" | "unsupported";
  requestPermission: () => Promise<boolean>;
  inAppNotifications: Array<{
    id: number;
    title: string;
    due_date: string | null;
    reminder_at: string | null;
  }>;
  dismissNotification: (id: number) => void;
  hasUnreadNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { token } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);

  // Only enable polling when user is authenticated
  useEffect(() => {
    setIsEnabled(!!token);
  }, [token]);

  const {
    permission,
    requestPermission,
    inAppNotifications,
    dismissNotification,
  } = useNotifications({
    pollingInterval: 60000, // 60 seconds
    enabled: isEnabled,
  });

  const hasUnreadNotifications = inAppNotifications.length > 0;

  return (
    <NotificationContext.Provider
      value={{
        permission,
        requestPermission,
        inAppNotifications,
        dismissNotification,
        hasUnreadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
