# Sync Fix Plan

Fixes for the data-synchronization risks identified in ChatGPT's analysis, excluding Strava activity ingestion (which you'll handle separately).

---

## 1. Server-owned sync upper bound (HIGH — most data-destructive)

### Problem
`useUpdateActivities.ts:96` creates `const currentDate = new Date()` from the device clock. It is sent to all five feeds and saved as `lastUpdated` at line 153. The server trusts it at the exclusive upper bound (`updated_at < currentDate`, confirmed in every `select*.ts` file). If the device clock is ahead of the server, writes with server timestamps before that future cutoff are permanently missed.

### Fix: server returns the upper bound timestamp

**Backend — new endpoint:**
```
GET /strava/sync-bounds
```
Returns `{ upperBound: <server epoch ms> }`. Implementation:
- File: `backend/strava/routes/syncBounds/index.ts` (new)
- Uses `new Date()` on the server (Postgres `NOW()` or Node Date — both server-side)
- No DB write needed; the value is returned to the client

**Backend — routes:**
- File: `backend/strava/index.ts` — register `router.get("/sync-bounds", getSyncBounds)`
- No changes to the five feed routes. They already accept `currentDate` as a query param and pass it as `endDate`. The client will now supply a server-generated value instead of a device-generated one.

**Mobile — hook:**
- File: `mobile/hooks/useUpdateActivities.ts`
- Replace `const currentDate = new Date()` (line 96) with a fetch to `/strava/sync-bounds`:
  ```ts
  const { upperBound } = await request<{ upperBound: number }>({
    url: `${SERVER_URL}/strava/sync-bounds`,
    retries: 1,
  })
  const currentDate = new Date(upperBound)
  ```
- Pass `currentDate` (which is now server-derived) to all five `getUpdateData` calls — no change to the call signatures.
- Save `upperBound` as `lastUpdated` at line 153 instead of `currentDate.getTime()`.

**Why this works:** The upper bound comes from the server clock. Any server write with `updated_at >= upperBound` will be picked up in the next sync window (since the next `lastUpdated` will be this `upperBound`). No device-clock dependency.

**Edge case — offline:** If the server is unreachable when fetching bounds, `trigger()` already falls back to offline mode (line 82-84). `updateDatabaseData` is only called when `status === "completed"`, meaning the server job succeeded, so the server is known to be online. Add a defensive check: if the bounds fetch fails, fall back to `handleOfflineFallback()`.

---

## 2. Cursor-based pagination (HIGH — moderate probability)

### Problem
All five feeds use `LIMIT 50 OFFSET page * 50` ordered by `id` (confirmed in every `select*.ts` file). If a row's `updated_at` shifts across the sync window during pagination, or if a row is inserted/deleted, OFFSET can skip rows permanently. The `finished` flag (`items.length < 50 && removed_items.length < 50`, in every route handler) keeps paging until both lists are under 50.

### Fix: replace OFFSET with keyset cursor on `id`

**Backend — DB operations (5 files):**

For each function below, replace `.offset((page ?? 0) * ROW_RETURN_LIMIT)` with a `WHERE id > cursor` clause, and remove the `page` parameter:

| File | Function | Current pagination | Cursor replacement |
|---|---|---|---|
| `backend/db/operations/fells/selectFell.ts` | `getAllActiveUserFells` (line 49) | `.orderBy(activeFells.id).limit(ROW_RETURN_LIMIT).offset((page ?? 0) * ROW_RETURN_LIMIT)` | Add `page ? gt(activeFells.id, page) : undefined` to `.where()`, keep `.orderBy(activeFells.id).limit(ROW_RETURN_LIMIT)` |
| `backend/db/operations/fells/selectFell.ts` | `getAllInactiveUserFells` (line 125) | same pattern | same pattern with `inactiveFells` |
| `backend/db/operations/activities/selectActivity.ts` | `getAllActiveActivities` (line 37) | same | same with `activeActivities` |
| `backend/db/operations/activities/selectActivity.ts` | `getAllInactiveActivities` (line 68) | same | same with `inactiveActivities` |
| `backend/db/operations/bags/selectBag.ts` | `getAllActiveBags` (line 6) | same | same with `activeBags` |
| `backend/db/operations/bags/selectBag.ts` | `getAllInactiveBags` (line 32) | same | same with `inactiveBags` |
| `backend/db/operations/classifications/selectClassification.ts` | `getAllActiveClassifications` (line 9) | same | same |
| `backend/db/operations/classifications/selectClassification.ts` | `getAllInactiveClassifications` (line 32) | same | same |
| `backend/db/operations/fellClassifications/selectFellClassification.ts` | `getAllActiveFellClassifications` (line 9) | same | same |
| `backend/db/operations/fellClassifications/selectFellClassification.ts` | `getAllInactiveFellClassifications` (line 34) | same | same |

Rename the `page` parameter to `cursorId` in each function signature and route handler for clarity.

**Backend — route handlers (5 files):**

For each route handler (`fellData`, `activityData`, `bagData`, `classificationData`, `fellClassificationData`):
- Replace `getIntParam("page")` with `getNullOrIntParam("cursor")` (read from query string, not route param)
- Add `cursorId` to both active and inactive query calls
- Compute `nextCursor` from the max `id` returned across both active and removed lists:
  ```ts
  const allIds = [...items.map(i => i.id), ...removedItems.map(i => i.id)]
  const nextCursor = allIds.length > 0 ? Math.max(...allIds) : (cursorId ?? 0)
  ```
- Return `nextCursor` in the JSON response when `!finished`

**Backend — routes registration:**
- File: `backend/strava/index.ts`
- Change `:page` route params to use query params: `/fell-data?cursor=123` instead of `/fell-data/0`
- Or keep the route param `/fell-data/:page` but pass it as `cursor` query param from the client

**Mobile — updateData.ts:**
- File: `mobile/services/strava/updateData.ts`
- Replace the `page` counter with a `cursor` variable:
  ```ts
  let cursor: number | null = null
  while (dataToCome) {
    const cursorParam = cursor ? `&cursor=${cursor}` : ""
    const data = await request<UpdateSchema<T>>({
      url: `${SERVER_URL}/strava/${name}-data/${0}?currentDate=${...}&lastUpdated=${...}${cursorParam}`,
    })
    ...
    if (data.finished) break
    cursor = data.nextCursor
  }
  ```
  Note: keep the route param as `0` (or any value) if the server still uses route params, but pass the actual cursor as a query param. Better: change the route to not require the page number at all and use only the query parameter.

**Why cursor-by-ID fixes this:** The cursor always points to the last row returned. The next page fetches rows with `id > cursor`. Even if rows are inserted/deleted during pagination, no rows after the cursor are skipped. The only missed rows are those with `id < cursor` that were inserted after the first page was fetched — these are extremely rare (PostgreSQL sequences are monotonically increasing) and will be caught in the next sync window.

---

## 3. Bag deletion outbox with rollback (MEDIUM — design flaw)

### Problem
`sqliteAdapter.ts:158-169` (`removeBag`):
1. Deletes the bag locally **first** (line 159)
2. Calls `sendBagUpdates` (line 160)
3. Only queues in `pending_sync` on `RETRY` status (lines 162-168)
4. On `ERROR` (non-retriable 4xx), the local data is permanently gone and the server retains the bag

Same pattern in `flushPendingSync.ts:51` — pending sync items are discarded on `ERROR`, with no local restore.

### Fix: queue before delete, restore on non-retriable error

**New SQLite function:**
- File: `mobile/services/db/sqlite/bag/selectBag.ts` (or new file `selectBagById.ts`)
- Add `selectBagById(db, bagId)` to read a single bag by ID for restoration:
  ```ts
  export async function selectBagById(db: DB_TYPE, bagId: number): Promise<Bag | null> {
    requireDb(db)
    const row = await db.getFirstAsync<Bag>("SELECT * FROM bags WHERE id = ?", [bagId])
    return row || null
  }
  ```

**Refactor `sqliteAdapter.removeBag` (line 158-169):**
```ts
async removeBag(bagId: number, request: RequestFn): Promise<void> {
  // 1. Read the bag data before any mutation
  const bag = await selectBagById(this.db, bagId)
  if (!bag) return  // already gone locally

  // 2. Queue the deletion intent with full bag data (for restore on error)
  await this.insertPendingSync({
    action: "REMOVE_BAG",
    payload: JSON.stringify({ bagId, bagData: bag }),
    created_at: Date.now(),
  })

  // 3. Optimistically delete locally
  await removeBags(this.db, [bagId])

  // 4. Send to server
  const status = await sendBagUpdates([], [bagId], request)

  if (status === "SUCCESS") {
    // Server confirmed — clean up the pending sync item
    await removePendingSyncByActionAndBagId(this.db, "REMOVE_BAG", bagId)
  }
  // RETRY: leave pending sync item (will be retried by flushPendingSync)
  if (status === "ERROR") {
    // Non-retriable — restore local data
    await insertBags(this.db, [bag])
    await removePendingSyncByActionAndBagId(this.db, "REMOVE_BAG", bagId)
    // Surface error to caller
    throw new Error(`Failed to delete bag ${bagId}: server rejected the request`)
  }
}
```

**New SQLite helpers needed:**
- `removePendingSyncByActionAndBagId(db, action, bagId)` — delete a single pending sync entry by action + bagId
- File: `mobile/services/db/sqlite/pendingSync/removePendingSyncByAction.ts` (new)

**Update `DatabaseAdapter` interface:**
- File: `mobile/services/db/databaseAdapter.ts`
- Add `selectBagById(bagId: number): Promise<Bag | null>`
- Add `removePendingSyncByActionAndBagId(action: string, bagId: number): Promise<void>`

**Update `WebAdapter`:**
- File: `mobile/services/db/webAdapter.ts`
- Add stub implementations (no-op or throw "not implemented")

**Update `flushPendingSync` (line 47-56):**
- When `syncStatus === "ERROR"` and there are `REMOVE_BAG` items, restore the local bags from the payload before discarding the pending sync entries:
  ```ts
  if (syncStatus === "ERROR") {
    for (const item of pendingItems) {
      if (item.action === "REMOVE_BAG") {
        const payload = JSON.parse(item.payload)
        if (payload.bagData) {
          await db.insertBags([payload.bagData])
        }
      }
    }
    await db.removePendingSyncByIds(processedIds)
  }
  ```

---

## 4. Fell orphan cleanup after sync (MEDIUM — edge case)

### Problem
`getAllInactiveUserFells` in `selectFell.ts:125-164` only returns inactive fells that are scoped by an active classification or an active user bag. If a fell becomes inactive AND simultaneously loses all its active classifications AND all its bags, it won't appear in `removed_items`. The client never receives a tombstone, and the fell persists in local SQLite.

### Fix: client-side orphan cleanup

**New SQLite function:**
- File: `mobile/services/db/sqlite/fells/removeOrphanedFells.ts` (new)
- Delete fells that have no entries in `fell_classifications` and no entries in `bags`:
  ```ts
  export async function removeOrphanedFells(db: DB_TYPE): Promise<void> {
    requireDb(db)
    await db.runAsync(
      `DELETE FROM fells
       WHERE id NOT IN (SELECT DISTINCT fell_id FROM fell_classifications)
         AND id NOT IN (SELECT DISTINCT fell_id FROM bags)`
    )
  }
  ```

**Add to `DatabaseAdapter` interface:**
- File: `mobile/services/db/databaseAdapter.ts`
- Add `removeOrphanedFells(): Promise<void>`

**Wire up in `useUpdateActivities.ts`:**
- File: `mobile/hooks/useUpdateActivities.ts`
- After `await database.insertBags(bags.items)` (line 145), add:
  ```ts
  await database.removeOrphanedFells()
  ```
- This runs inside the same error-handling block (line 146 catch) so if it fails, the whole sync is marked as failed and `lastUpdated` is not saved.

**Update `WebAdapter`:**
- File: `mobile/services/db/webAdapter.ts`
- Add a no-op stub

---

## 5. Transactional delta apply (LOW–MEDIUM — improves resilience)

### Problem
`useUpdateActivities.ts:128-153` performs 11 sequential `await` calls (5 removals + 5 inserts + 1 cursor save). If the app is killed mid-way, the local database is left in a partial state. The cursor isn't saved (so re-sync is safe), but orphaned data (e.g., fells without classifications, bags without activities) can persist until the next full sync.

### Fix: wrap all SQLite operations in a single transaction

The codebase already uses `db.withTransactionAsync` (see `fellClassification/removeFellClassification.ts:15`), so expo-sqlite supports it.

**New SQLite function:**
- File: `mobile/services/db/sqlite/sync/syncDelta.ts` (new)
- Accept the full delta as a structured parameter and apply everything in one transaction:
  ```ts
  export async function applyDelta(db: DB_TYPE, delta: SyncDelta): Promise<void> {
    requireDb(db)
    await db.withTransactionAsync(async () => {
      // Removals first
      await removeBags(db, delta.removedBagIds)
      await removeFellClassifications(db, delta.removedFellClassifications)
      await removeActivities(db, delta.removedActivityIds)
      await removeClassifications(db, delta.removedClassificationIds)
      await removeFells(db, delta.removedFellIds)

      // Inserts in dependency order
      await insertFells(db, delta.fells)
      await insertClassifications(db, delta.classifications)
      await insertActivities(db, delta.activities)
      await insertFellClassifications(db, delta.fellClassifications)
      await insertBags(db, delta.bags)

      // Orphan cleanup
      await removeOrphanedFells(db)

      // Cursor is saved OUTSIDE the SQLite transaction (AsyncStorage)
      // but within the try/catch so a failure rolls back everything above
    })
  }
  ```

**New types:**
- File: `mobile/services/db/sqlite/sync/types.ts` (new)
- Define `SyncDelta` interface with all the removal/insertion arrays

**New `sync_state` table (optional but recommended):**
- File: `mobile/services/db/sqlite/setup.ts`
- Add to the `execAsync` DDL:
  ```sql
  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  ```
- Move `lastUpdated` storage from AsyncStorage to this table, so the cursor update is part of the SQLite transaction:
  ```ts
  // Inside the transaction:
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)`,
    ["lastUpdated", String(cursor)]
  )
  ```
- Add `selectSyncState` and `upsertSyncState` SQLite functions
- Update `DatabaseAdapter` interface and `WebAdapter` accordingly

**Mobile — useUpdateActivities.ts:**
- Replace lines 128-153 with a single call:
  ```ts
  await database.applyDelta({
    removedBagIds: bags.removedItems.map(i => i.id),
    removedFellClassifications: fellClassifications.removedItems,
    removedActivityIds: activities.removedItems.map(i => i.id),
    removedClassificationIds: classifications.removedItems.map(i => i.id),
    removedFellIds: fells.removedItems.map(i => i.id),
    fells: fells.items,
    classifications: classifications.items,
    activities: activities.items,
    fellClassifications: fellClassifications.items,
    bags: bags.items,
  })
  // If sync_state table is used, cursor is saved inside the transaction
  // Otherwise, save to AsyncStorage as before:
  await saveItem("lastUpdated", currentDate.getTime().toString())
  ```
- If using `sync_state` table: replace `getItem("lastUpdated")` (line 92) with `database.selectSyncState("lastUpdated")`

**Why this works:** `withTransactionAsync` ensures all operations commit or all roll back. If the app is killed mid-transaction, SQLite's WAL mode (default in expo-sqlite) preserves the database in its pre-transaction state. The cursor is only saved after the transaction completes successfully, so re-sync is always safe.

---

## Implementation order

1. **Server-owned sync upper bound** — fixes the most data-destructive risk; minimal backend changes (one new endpoint), small mobile change.
2. **Cursor-based pagination** — requires changes to 5 DB operations + 5 route handlers + mobile `updateData.ts`; implement after server bounds to avoid mixing two pagination changes.
3. **Bag deletion outbox** — adds a `selectBagById` helper and refactors `removeBag` + `flushPendingSync`; independent of sync cursor changes.
4. **Fell orphan cleanup** — adds one new SQLite function and one call site; safe to add anytime.
5. **Transactional delta apply** — the largest refactor of `useUpdateActivities.ts`; should be done after items 1–2 are stable to minimize merge conflicts.

Recommended: implement items 1 and 3 first (both high-value, low-risk), then item 2 (larger surface area), then items 4 and 5 (cleanup and resilience improvements).

---

## Testing

After each fix, manually exercise:
- Online first sync (empty device)
- Repeat delta sync (no changes since last sync)
- Offline app launch (no server reachable)
- Offline bag deletion followed by reconnection
- Device clock set 5+ minutes ahead (validates fix #1)
- Large reference data import (>50 rows in a sync window, validates fix #2)
- Non-retriable error on bag deletion (400/422, validates fix #3)

The README notes at line 165 that there is no automated test suite configured yet. Consider adding integration tests for the three priority fixes before shipping.
