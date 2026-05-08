\# Love Travel Globe / Our Memory Globe



This is a React + TypeScript + Vite project for a real multi-user 3D travel photo album website.

## Communication Language

The user will communicate in Chinese.
Please reply in Chinese by default.
Technical terms, file names, function names, database table names, and code identifiers may remain in English.


\## Must-read project documents



Before planning or coding, read:

- `docs/PROJECT_REQUIREMENTS.md`
- `docs/PROJECT_PROGRESS.md` — current phase completion status
- `docs/NEXT_PHASE.md` — what to work on next and hard constraints

`docs/DEVELOPMENT_PHASES.md` is a user workflow guide. Do not read it unless the user explicitly asks you to follow or inspect a specific phase.


If working on Supabase, Auth, database, Storage, or RLS, also read:



\- `docs/SUPABASE\_SCHEMA.md`



If working on 3D models, music, sound effects, UI references, or uploaded assets, also read:



\- `docs/ASSET\_GUIDE.md`



\## Non-negotiable rules



\- MVP uses Supabase only.

\- Do not implement Firebase in MVP.

\- Users must register and log in.

\- Unauthenticated users must not access the 3D globe page.

\- Photos must be stored in Supabase Storage.

\- Photo metadata must be stored in Supabase Database.

\- Every private user record must be bound to `userId`.

\- Configure Row Level Security for user data isolation.

\- Public map data and private user data must be separated.

\- Do not store user photos in `countries.ts`, `cities.ts`, or `landmarks.ts`.

\- Do not create `samplePhotos.ts`.

\- Do not preload real photos.

\- Do not use localStorage or IndexedDB as the formal storage for photos or travel records.

\- localStorage may only be used for small UI preferences.

\- First respond with a plan before making large code changes.



\## Current project goal



First, do not write the full project at once. Start by producing:



1\. Project understanding

2\. Recommended technical choices

3\. File structure

4\. Supabase database design

5\. Supabase setup steps

6\. Development phase breakdown

7\. Phase 1 implementation plan
