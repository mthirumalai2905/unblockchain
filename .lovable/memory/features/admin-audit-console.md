---
name: Admin audit console
description: /admin route, role-based access, full event audit log with charts
type: feature
---
**Access**
- Route: `/admin` (guarded by `useIsAdmin` hook).
- Admin email: `admin@gmail.com` — auto-granted `admin` role on signup via `handle_new_user_role()` trigger on `auth.users`.
- Role storage: `user_roles` table + `app_role` enum (`admin`, `user`). Checked via `has_role()` security-definer function.
- RLS: only admins can SELECT/DELETE `audit_logs`; any authenticated user can INSERT their own row.

**Logging**
- Helper: `src/lib/audit.ts` → `logEvent({ event_name, category, metadata })`. Fire-and-forget; never throws.
- Captures: user_agent, parsed device_type/browser/OS, screen size, language, timezone, route. **No IP geo** (user-agent only by design).
- Page views: `usePageViewTracker` hook mounted in `App.tsx`.
- Wired into: signup, login, logout, session create, session delete, dump create.

**Dashboard (`src/pages/Admin.tsx`)**
- Stat cards: total events, unique users, page views, today.
- Charts (recharts): time-series line, device/browser/OS pies, top events bar.
- Live event feed table with realtime subscription on INSERT, category filter, search, CSV export, purge-old.
