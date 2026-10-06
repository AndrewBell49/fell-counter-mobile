# Fell Counter

Fell Counter is an offline-first React Native application backed by an Express/Postgres API.  A signed-in Strava athlete can synchronise activities; the server identifies fells reached during those activities and exposes an incremental data feed.  The mobile application mirrors that feed into SQLite and renders all app views from the local database, so the main experience continues to work without a connection.

This README is an architectural guide for coding agents.  The web build exists mainly as a placeholder/demo surface and is not the current product focus.

## Repository map

```
fell-counter/
├── mobile/                         Expo + React Native client
│   ├── app/                        Expo Router routes and screen layouts
│   │   ├── (auth)/                 Strava sign-in and deep-link callback
│   │   └── (app)/                  Authenticated tabs and detail screens
│   ├── hooks/                      API, database, and refresh orchestration
│   ├── context/                    Session and database providers
│   ├── services/
│   │   ├── db/                     DatabaseAdapter contract and implementations
│   │   │   └── sqlite/             Schema, mutations, and local read models
│   │   ├── strava/                 Server sync and pending-write replay
│   │   └── storage/                SecureStore/localStorage wrapper
│   └── components/                 Screens' reusable UI, maps, and visualisations
└── backend/                        Express API + Drizzle/Postgres data layer
    ├── auth/                       Strava OAuth and encrypted token handling
    ├── strava/                     Authenticated sync and incremental-feed routes
    │   └── routes/updateActivities/ Strava activity/stream analysis
    ├── db/
    │   ├── schema/                 Drizzle tables and active/inactive views
    │   ├── operations/             Query and mutation functions
    │   └── seed/                   Fell/reference-data seed and maintenance scripts
    └── lib/                        Environment, geometry, job, and error helpers
```

## System model

The authoritative server database is Postgres.  It stores shared reference data (`fells`, `classifications`, `fell_classifications`) and user-owned data (`users`, `activities`, `bags`).  A `bag` means one occurrence of a user visiting a fell during an activity.  `bag_sequence` permits the same fell to be counted more than once when an athlete leaves it and returns.

The mobile SQLite database is a deliberately reduced, read-optimised mirror.  It contains `fells`, `classifications`, `fell_classifications`, `activities`, `bags`, and `pending_sync`; it does not contain users, tokens, activity stream points, server timestamps, or `active` flags.  Visualisations, activity lists, maps, and detail screens query this local database through `DatabaseAdapter`, rather than querying the API directly.

Server records have `updated_at` and `active` fields.  The API uses them to send both updated rows and soft-deleted rows.  The client physically removes the latter from SQLite.  This is the central offline-sync contract: do not change a server entity's update/deactivation behaviour without considering its corresponding delta route and local SQLite mutation.

## Authentication and request boundary

1. `mobile/app/(auth)/sign-in.tsx` requests `GET /auth/url` and opens Strava OAuth in an Expo auth session (or redirects the browser on web).
2. `backend/auth/handlers.ts` exchanges the OAuth code, encrypts the Strava access and refresh tokens, creates a UUID session ID, persists the user, and redirects to `fellcounter://callback` (or `WEB_CALLBACK_URL`).
3. The callback route forwards the session ID to sign-in, which stores `sessionId` and the display name with `services/storage/storage.ts`.
4. `UserContext` sends `x-session-id` on API requests.  `backend/strava/index.ts` resolves that session to a user before all `/strava/*` endpoints.  It also performs a session validation request when a stored session is restored.

`mobile/hooks/useApi.ts` is the one request wrapper.  It merges session headers, retries network/5xx failures with backoff, and throws `ApiError` for final errors.  Use it for mobile API calls rather than `fetch` directly, except where an intentional exception already exists (currently session validation).

`mobile/services/strava/constants.ts` currently contains a hard-coded ngrok `SERVER_URL`.  Treat this as development configuration that needs changing for another environment; it is not derived from Expo configuration.

## Refresh and incremental sync

The authenticated tabs mount `useUpdateActivities` in `mobile/app/(app)/(tabs)/_layout.tsx`, so each app entry follows this sequence:

1. `trigger()` first replays queued local bag writes with `flushPendingSync`.
2. It `POST`s `/strava/update-activities`.  The API creates an in-memory, per-session job and returns `202`; a simultaneous request returns `409`.
3. The client polls `GET /strava/update-activities/status` every three seconds.  If networking fails at either stage, it changes to `ready` in offline mode and displays the existing SQLite data.
4. When the job reports `completed`, `updateDatabaseData()` fixes one sync window: `(lastUpdated, currentDate)`.  It concurrently pages the five feeds below, then applies removals before inserts and only then saves `lastUpdated` in device storage.

| Feed route | Local table | Scope |
| --- | --- | --- |
| `/strava/fell-data/:page` | `fells` | Classified fells plus fells relevant to the signed-in user's bags |
| `/strava/classification-data/:page` | `classifications` | Shared list metadata |
| `/strava/fell-classification-data/:page` | `fell_classifications` | Shared join rows |
| `/strava/activity-data/:page` | `activities` | The signed-in user's activities |
| `/strava/bag-data/:page` | `bags` | The signed-in user's bag occurrences |

All five routes require `currentDate` and accept an optional `lastUpdated`, return pages of at most 50 rows, and have the shape `{ items, removed_items, finished }`.  `mobile/services/strava/updateData.ts` continues requesting sequential pages until `finished` is true.  Dates cross the boundary as epoch milliseconds (with `bag_date` and `start_date` normalised in the route handlers).

The common end timestamp is important: rows changed after it belong to the next sync rather than disappearing between independently paged feeds.  Preserve this pattern if the feed is extended.

## Local database and adapter design

`mobile/services/db/databaseAdapter.ts` is the client-side persistence contract.  Components should consume it through `useDatabase()`; only infrastructure should know whether the implementation is SQLite or web.

`createDatabaseAdapter()` selects:

- `SQLiteAdapter` on Android/iOS. `sqlite/setup.ts` opens `Fells.db` and creates the six tables.
- `WebAdapter` on web. This is a stub returning sample visual data and several unimplemented methods, so web parity is not expected yet.

`SQLiteAdapter` delegates each write/read to small files under `services/db/sqlite`.  Inserts use `INSERT OR REPLACE`; large fells, classifications, join rows, and bags are chunked for SQLite's 999-variable limit.  The `visuals/` queries are local read models for the charts, activity filtering, map, and detail screens.  When adding a new locally-rendered feature, first add a method to the interface, then both adapter implementations, then its SQLite query.

`pending_sync` is an outbox for user-originated bag edits.  `SQLiteAdapter.removeBag()` removes the local row immediately, then posts the deletion to `/strava/update-bags`.  On retryable failure it records a `REMOVE_BAG` item.  `flushPendingSync()` retries queued `ADD_BAG` and `REMOVE_BAG` items before the normal refresh; validation/client errors are deliberately discarded, while network/temporary failures remain queued.  At present the user interface calls the removal path; support for an offline add must enqueue an `ADD_BAG` item with `fell_id`, `activity_id`, `bag_sequence`, and `bag_date`.

## Server update and fell-counting pipeline

The intended server pipeline lives in `backend/strava/routes/updateActivities/`:

1. `activityInfo.ts` refreshes a user's Strava activities, incrementally after the latest activity and as a full refresh every four weeks.
2. `activityBags.ts` retrieves each unchecked activity's `latlng` and `time` streams, samples points, finds reference fells in a small geographic bounding box, and records a bag within 40 m of a summit.
3. A fell is eligible to be counted again only after the activity has moved at least 300 m from that summit.  The resulting ordinal is stored as `bag_sequence`.
4. Re-analysis inserts/reactivates current bags, deactivates stale bags for the activity, and marks the activity checked.

**Current implementation status:** `backend/strava/routes/updateActivities/index.ts` has the calls to download activities and analyse streams commented out.  The endpoint therefore starts and completes a job successfully but does not currently refresh Strava activities or create bags.  The code in the two supporting modules is present, but it is not executed.  Do not diagnose an empty post-login sync as a client-side SQLite problem until that orchestration is restored and verified.

Jobs are an in-memory `Map` (`backend/lib/jobs/activeJobs.ts`) and are retained for ten minutes after completion.  They do not survive a server restart and are not shared between server processes.

## Data-model and sync invariants

- Postgres `bags` are unique on `(fell_id, user_id, activity_id, bag_sequence)`.  The local table stores the server-generated bag ID and has no `bag_sequence` column.
- Soft deletion is represented server-side by `active: false` plus a new `updated_at`; local deletion is physical.  Delta routes must include inactive rows in `removed_items`.
- A bag cannot be inserted before its referenced activity and fell exist locally.  The mobile sync currently removes dependencies first, then inserts fells, classifications, activities, fell/classifications, and bags in that order.
- `lastUpdated` is only persisted after all five feeds and all local writes succeed.  Failure falls back to old local data, so the same interval can be safely retried.
- `updated_at` is the delta cursor, not `start_date` or `bag_date`.  A correction to historical data must update `updated_at` to reach devices.
- The mobile schema is created with `CREATE TABLE IF NOT EXISTS`; there is no versioned migration mechanism yet.  Altering an existing local table requires a migration/reset strategy, not only changing `setup.ts`.

## Key entry points

| Need | Start here |
| --- | --- |
| App providers and route groups | `mobile/app/_layout.tsx` |
| Authenticated navigation and database readiness | `mobile/app/(app)/_layout.tsx` |
| Automatic refresh, polling, delta application, offline fallback | `mobile/hooks/useUpdateActivities.ts` |
| Shared HTTP behaviour | `mobile/hooks/useApi.ts` |
| Local persistence contract / native implementation | `mobile/services/db/databaseAdapter.ts`, `mobile/services/db/sqliteAdapter.ts` |
| SQLite DDL | `mobile/services/db/sqlite/setup.ts` |
| Local analytics/detail queries | `mobile/services/db/sqlite/visuals/` |
| API route registration and session middleware | `backend/strava/index.ts` |
| Express setup, JSON/CORS, router mounting | `backend/server.ts` |
| OAuth callback and token encryption | `backend/auth/handlers.ts`, `backend/auth/encryption.ts` |
| Postgres schema | `backend/db/schema/` |
| Incremental query semantics | `backend/db/operations/*/select*.ts` |
| Strava activity and stream analysis | `backend/strava/routes/updateActivities/` |
| Seed/import data | `backend/db/seed/` and `backend/db/seed/data/UKHills.csv` |

## Local development

The projects are independent npm workspaces, each with its own lockfile and `node_modules` directory.

```powershell
cd backend
npm install
npm run db:migrate
npm run dev
```

```powershell
cd mobile
npm install
npm start
```

The backend validates its environment at startup.  Its `.env` needs the values read in `backend/lib/env.ts`:

- `CLIENT_ID`, `CLIENT_SECRET` — Strava OAuth app credentials
- `DATABASE_URL` — Postgres connection URL
- `ENCRYPTION_KEY` — key for Strava token encryption
- `SERVER_URL` — externally reachable backend URL used as the OAuth redirect base
- `WEB_CALLBACK_URL` — web OAuth callback target
- `SEED_DB_FILE_NAME` — required by the current environment loader/seed tooling

For a device build, update the mobile `SERVER_URL` to the reachable backend/tunnel URL and ensure Strava is configured with `${SERVER_URL}/auth/callback`.  `npm run dev` starts the server and an ngrok tunnel together; its generated tunnel URL will not automatically update the hard-coded mobile URL or the backend OAuth redirect configuration.

Useful commands:

```powershell
cd mobile; npm run lint
cd backend; npx tsc --noEmit
cd backend; npm run db:seed
cd backend; npm run db:update
```

There is no automated test suite configured yet (`backend`'s `test` script is a placeholder).  Before changing sync code, manually exercise OAuth, an online first sync, a repeat delta sync, an offline app launch, and an offline bag deletion followed by reconnection.

## Change guide for agents

- For a new synced entity, make the server schema/operation update `updated_at`, add an authenticated paged delta route, add the SQLite table/migration and adapter methods, fetch it in `useUpdateActivities`, and consume it only through the adapter.
- For an API contract change, update both the backend route and the matching types/callers in `mobile/services/strava/`.  Field names intentionally follow database-style snake case across this boundary.
- For a new chart or local screen, prefer a narrow query in `mobile/services/db/sqlite/visuals/` over re-implementing joins in a component.
- For authentication changes, preserve the deep-link redirect, secure storage, and `x-session-id` server middleware as one flow.
- Do not expose decrypted Strava tokens to the client.  Token refresh belongs in `backend/strava/identity/tokens.ts`.
- Treat the shared reference tables as globally scoped and activities/bags as user scoped.  Forgetting the user filter in a data route is a privacy bug.
