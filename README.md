# DumpStash

Transform unstructured thoughts into structured, actionable knowledge through continuous AI processing.

DumpStash is an AI-native workspace designed for rapid thinking and asynchronous organization. Capture ideas, decisions, questions, tasks, research, and notes in real time while the system continuously classifies, organizes, summarizes, and transforms information into usable outputs such as PRDs, roadmaps, and task lists.

---

# Core Capabilities

## Intelligent Thought Processing

- Frictionless capture for text, links, voice notes, and rich content
- Real-time AI classification using a structured taxonomy:
  - Todo
  - Insight
  - Feedback
  - Reference
  - Goal
- Automatic contextual threading for related conversations and follow-ups
- Continuous background summarization and refinement

---

## AI-Powered Document Generation

### PRD Generation
Generate structured product requirement documents directly from raw notes and discussions.

### Roadmap Generation
Convert ideas and priorities into phase-based execution roadmaps.

### Task Extraction
Automatically detect and organize actionable tasks from unstructured inputs.

### Export Support
Export generated documents in markdown and PDF formats.

---

## Workspace Management

- Multi-session workspace support
- Session creation, renaming, archiving, and deletion
- Persistent AI-generated artifacts across reloads
- Drag-and-drop organization with database persistence
- Historical activity tracking and session analytics

---

## Collaboration & Sharing

- Secure document sharing with granular permissions
- Shared workspace visibility
- Email-based collaboration invitations
- Realtime synchronization across sessions

---

## User Profiles

- Customizable user profiles
- Activity tracking and contribution history
- Session overview and analytics dashboard

---

## Administrative Controls

- Role-based access control
- Administrative audit console
- Event logging and realtime monitoring
- CSV export for audit data and analytics

---

# Design Philosophy

DumpStash is designed around speed, clarity, and minimal friction.

The interface prioritizes focused thinking and fast capture while AI handles organization and restructuring in the background. The experience is optimized for professionals, founders, developers, researchers, and teams managing large volumes of unstructured information.

---

# Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind CSS |
| UI Framework | shadcn/ui, Framer Motion |
| Backend | Supabase — Postgres, Auth, Storage, Edge Functions, Realtime |
| AI Processing | Groq Llama 3.3 70B |
| AI Generation | Google Gemini 2.5 Flash |
| Email Infrastructure | Resend |
| Payments | Stripe |

---

# Pricing

| Tier | Sessions | Price |
|---|---|---|
| Basic | 1 | Free |
| Premium | 10 | $19 |
| Advanced | Unlimited | $49 |

---

# Getting Started

```bash
npm install
npm run dev
