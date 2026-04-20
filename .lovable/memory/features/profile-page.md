---
name: Profile page
description: Dedicated /profile route with editable banner, avatar, name, bio, stats (dumps/sessions/streak), 12-week activity heatmap, and session history list
type: feature
---
The application includes a `/profile` page accessed by clicking the avatar or name in the sidebar footer. It features an editable banner image and avatar (uploaded to the `avatars` bucket under `{user_id}/banner.*` and `{user_id}/avatar.*`), inline-editable display name and bio, three stat cards (total dumps, sessions, day streak), a 12-week GitHub-style activity heatmap colored with `cf-decision` opacity tiers, and a chronological session history. The `profiles` table has `bio` and `banner_url` columns to support this.
