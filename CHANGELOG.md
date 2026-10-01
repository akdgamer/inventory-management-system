# Changelog

All notable changes to the Inventory Management System are recorded here.
Dates are in YYYY-MM-DD.

## 2026-10-01

### Added
- **Server-side pagination for the items list.** `GET /items/` now accepts
  `limit` (default 20, max 100) and `offset`, returns results ordered by
  `updated_at` descending (most-recently-updated first), and responds with
  `{ items, total, limit, offset }` so the UI can render page controls without
  downloading the whole table. The optional `search` filter still applies and
  `total` reflects the filtered count.
- **`GET /items/stats` endpoint.** Returns `total_items`, `low_stock_items`
  (quantity ≤ min threshold) and `total_value` (`Σ quantity × price`), all
  aggregated in the database. Registered before `/items/{item_id}` so the
  `stats` path is not parsed as an id.
- **Pagination UI on the Items page** — Previous/Next buttons, a "Showing X–Y
  of N items" summary, current/total page indicator, and an inline empty state.

### Changed
- **Dashboard no longer downloads every item.** It reads the three headline
  metrics from `/items/stats` and shows Recent Activity from the first page of
  `/items/?limit=5`, instead of fetching all rows and computing totals on the
  client.
- The Items page search box is **debounced (300 ms)** and resets to the first
  page on a new query, so typing does not fire a request per keystroke.

### Fixed
- **Search box no longer loses focus / "refreshes" the page.** The page-level
  `if (isLoading || loading) return <Loading/>` guard was unmounting the entire
  page — including the search `<input>` — on every keystroke, which stole focus
  and dropped the caret. The full-screen loader now only shows while auth is
  initializing; per-fetch loading and errors render inline so the page and the
  search box stay mounted.

### Database / operations
- The **item `price` migration has been applied** to the live database on the
  server (Alembic revision `price0001`, following the empty `baseline01`). Every
  existing row was back-filled to `price = 0`. Verified: 0 rows with a NULL
  price.
- The generated Alembic revision files are produced at deploy time by
  `scripts/apply-price-migration.ps1` (see
  `docs/price-migration-handoff.md`); they are not tracked in git, matching the
  existing `alembic/versions/.gitkeep` convention.
- **Do not re-run `scripts/apply-price-migration.ps1`** on the server — the
  migration is already at `price0001`; re-running would attempt to add the
  `price` column a second time and fail.
- Autostart (`scripts/install-autostart.ps1`) re-creates the `IMS Backend` /
  `IMS Frontend` scheduled tasks and the PostgreSQL service; run it (elevated)
  to make the apps survive a reboot. It does not touch the database.

### Known issues (pre-existing, tracked in docs/price-migration-handoff.md)
- `POST /auth/register` requires no authentication and accepts any `role_id`,
  so anyone who can reach the API can create an admin account. Highest priority.
- Creating/editing categories and suppliers fails (schema and PUT-vs-PATCH
  mismatches); duplicate SKU returns a 500; `/items/{id}/adjust` allows negative
  stock.
