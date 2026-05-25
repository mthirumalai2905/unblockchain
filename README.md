# DumpStash

> Transform raw brain dumps into structured, actionable documents through continuous AI processing.

DumpStash is an AI-native thinking workspace. You write fast, messy thoughts — ideas, decisions, questions, todos, rants — and the system continuously classifies, threads, summarizes, and reshapes them into PRDs, roadmaps, and personal task lists in the background.

---

## ✨ Core Features

### 🧠 Brain Dump → Structure
- **Frictionless capture** — type, paste links, drop images, or record voice notes.
- **Auto-classification** with Groq Llama-3.3-70b into a fixed taxonomy: `todo`, `insight`, `feedback`, `reference`, `rant`, `goal`.
- **Color-coded** at a glance: Blue (Ideas), Green (Decisions), Yellow (Questions), and more.
- **Threading** — replies and follow-ups stay nested, with Gemini-2.5-flash auto-responses.

### 📄 AI Document Generation
- **PRD Draft View** — split-screen markdown editor with specialized typography.
- **Roadmap View** — dynamic phases with interactive checkboxes and strikethrough completion.
- **Personal To-do View** — auto-suggested when 5+ todos are detected, with a live progress bar.
- **PDF export** for both PRDs and roadmaps.
- Session-storage caching so AI artifacts persist across reloads.

### 🗂️ Sessions & Organization
- Create, switch, rename, archive, and delete sessions.
- **Archive** hides sessions from the primary sidebar without losing data.
- **Drag-and-drop reordering** of dumps via `@dnd-kit`, persisted to the database.
- **Activity calendar** — month-grid heatmap of dumps per day, per session.

### 🔗 Rich Content
- **Link previews** — Open Graph cards with external redirect confirmation.
- **Image and voice support** — voice is transcribed via a chunked-base64 Gemini edge function.
- **Copy-to-clipboard** on every dump, preserving formatting.

### 👥 Sharing & Collaboration
- Granular RLS-backed read/write sharing per dump.
- "Shared with me" sidebar view.
- Email invites delivered via Resend.

### 👤 Profiles
- Editable banner, avatar, display name, and bio.
- Stats, activity heatmap, and full session history at `/profile`.

### 🛡️ Admin Audit Console
- `/admin` route gated by `user_roles` + `has_role()` security-definer function.
- Full event audit log with realtime feed, device/browser/OS analytics, CSV export.

### 🎨 Design
- Vercel/Notion-inspired minimalist aesthetic.
- **Inter** for UI, **JetBrains Mono** for metadata.
- Full light and dark themes.
- Dashboard uses a full-width, edge-to-edge layout — no social interaction cruft.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind CSS v3 |
| UI | shadcn/ui, Framer Motion, Aceternity UI |
| Backend | Lovable Cloud (Supabase) — Postgres, Auth, Storage, Edge Functions, Realtime |
| AI — Labels | Groq Llama-3.3-70b |
| AI — Generation & Audio | Google Gemini 2.5 Flash |
| Email | Resend |
| Payments | Stripe |

---

## 💳 Pricing

| Tier | Sessions | Price |
|---|---|---|
| Basic | 1 | Free |
| Premium | 10 | $19 |
| Advanced | Unlimited | $49 |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

The app boots against Lovable Cloud — no separate backend setup needed.
