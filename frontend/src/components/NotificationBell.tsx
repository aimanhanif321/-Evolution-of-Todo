"use client";

import React, { useState } from "react";
import { Bell, X, Clock, AlertTriangle } from "lucide-react";
import { useNotificationContext } from "./NotificationProvider";

export default function NotificationBell() {
  const {
    permission,
    requestPermission,
    inAppNotifications,
    dismissNotification,
    hasUnreadNotifications,
  } = useNotificationContext();

  const [isOpen, setIsOpen] = useState(false);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Close panel after permission granted
      setIsOpen(false);
    }
  };

  const formatReminderTime = (reminderAt: string | null, dueDate: string | null) => {
    if (!dueDate) return "No due date";
    const due = new Date(dueDate);
    return `Due: ${due.toLocaleString()}`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {hasUnreadNotifications && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Permission Request */}
            {permission !== "granted" && permission !== "unsupported" && (
              <div className="p-4 bg-amber-50 border-b border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">
                      Enable browser notifications
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Get notified when your tasks are due
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {inAppNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {inAppNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatReminderTime(notification.reminder_at, notification.due_date)}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          aria-label="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {inAppNotifications.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => {
                    inAppNotifications.forEach((n) => dismissNotification(n.id));
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
