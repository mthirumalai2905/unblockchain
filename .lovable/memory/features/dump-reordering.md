---
name: Dump reordering
description: Drag-and-drop reordering of dumps using @dnd-kit, persisted via a position column on the dumps table
type: feature
---
Users can drag and reorder dumps within a session using a grip handle that appears on hover (left edge of each card, desktop only). Built with `@dnd-kit/core` + `@dnd-kit/sortable`. Order is persisted to the `dumps.position` column (DOUBLE PRECISION) and dumps are loaded ordered by `position ASC, created_at DESC`. New dumps automatically receive a position smaller than the current minimum so they appear at the top. Drag is disabled when a single dump is selected (preview mode).
