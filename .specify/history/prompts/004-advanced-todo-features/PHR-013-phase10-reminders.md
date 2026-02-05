---
id: PHR-013
title: Phase 10 Reminders Implementation
stage: green
date: 2026-01-30
surface: claude-code
model: claude-opus-4-5-20251101
feature: 004-advanced-todo-features
branch: 004-advanced-todo-features
user: developer
command: /sp.implement phase 10
labels: [implementation, reminders, US8, phase-10]
links:
  spec: specs/004-advanced-todo-features/spec.md
  ticket:
  adr:
  pr:
files:
  - backend/src/services/reminder_service.py
  - backend/src/api/task_router.py
  - backend/src/dapr/task_events.py
  - frontend/src/hooks/useNotifications.ts
  - frontend/src/components/ReminderSelector.tsx
  - frontend/src/components/NotificationProvider.tsx
  - frontend/src/components/NotificationBell.tsx
  - frontend/src/components/TaskForm.tsx
  - frontend/src/app/layout.tsx
  - specs/004-advanced-todo-features/tasks.md
tests:
  - manual: Set reminder, wait for polling, verify browser notification or in-app fallback
---

## Prompt

/sp.implement phase 10

User requested completion of Phase 10 (US8: Reminders) from the 004-advanced-todo-features task list.

## Response snapshot

Implemented Phase 10 (User Story 8 - Reminders) with the following changes:

### Backend (T063-T066)

1. **reminder_service.py** - New service for reminder operations:
   - `get_pending_reminders()`: Query tasks with reminder_at <= now and not sent
   - `mark_reminder_sent()`: Mark reminder as sent after notification
   - `clear_reminder()`: Clear reminder from task
   - `set_reminder()`: Set or update reminder time

2. **task_router.py** - New reminder endpoints:
   - `GET /api/tasks/reminders`: Poll for pending reminders (returns minimal data)
   - `PATCH /api/tasks/{id}/reminder`: Update or clear task reminder
   - `POST /api/tasks/{id}/reminder/sent`: Mark reminder as sent (internal)

3. **task_events.py** - Added `emit_task_reminder()`:
   - Publishes task.reminder Dapr event with task_id, title, due_date

4. **Task model** - Already had reminder_at and reminder_sent fields

### Frontend (T067-T072)

1. **useNotifications.ts** - New hook with:
   - Browser Notification API permission management
   - 60-second polling interval for pending reminders
   - `showBrowserNotification()`: Native browser notifications
   - `showInAppNotification()`: Fallback when browser notifications denied
   - `markReminderSent()`: Backend sync after showing notification

2. **ReminderSelector.tsx** - New component:
   - Quick select: 15min, 30min, 1 hour, 2 hours, 1 day before
   - Custom datetime picker for specific times
   - Only visible when due date is set
   - Preview text showing reminder time

3. **NotificationProvider.tsx** - Context provider:
   - Wraps app with notification state
   - Enables polling when user is authenticated
   - Exposes permission, notifications, dismiss functions

4. **NotificationBell.tsx** - In-app notification UI:
   - Bell icon with unread badge indicator
   - Dropdown panel with notification list
   - Permission request prompt for browser notifications
   - Dismiss individual or all notifications

5. **TaskForm.tsx** - Updated:
   - Added reminderAt state
   - Integrated ReminderSelector after DateTimePicker
   - Clears reminder when due date is removed

6. **layout.tsx** - Updated:
   - Added NotificationProvider wrapper
   - Enables 60-second reminder polling app-wide

## Outcome

- ✅ Impact: Users receive browser or in-app notifications before task deadlines
- 🧪 Tests: Manual testing via setting reminder, waiting for poll cycle
- 📁 Files: 5 created, 5 modified
- 🔁 Next prompts: /sp.implement phase 11 (Polish)
- 🧠 Reflection: In-app fallback essential for Safari/iOS browser notification limitations

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A - manual testing
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
