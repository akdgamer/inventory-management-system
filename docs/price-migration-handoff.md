# Handoff: deploying the price feature to the on-prem server

Written 2026-10-01 at the end of a Claude Code session on the dev machine. A new
session on the server should read this first, then
`docs/superpowers/plans/2026-09-23-item-price-valuation.md` (Phase 2) and
`scripts/apply-price-migration.ps1`.

## Where things stand

- **Phase 1 (code) is done** and on `master`: `price` column on `Item`, schema
  validation (`price >= 0`), price input on the item form, INR valuation on the
  dashboard and item page, Alembic wired to the app's `DATABASE_URL`, and
  `database.py` now reading `DATABASE_URL` from `ims-backend/.env`.
- **Tested on the dev machine** against a throwaway SQLite DB: create and edit
  item with price, negative price rejected, item total and dashboard total in ₹
  correct, stock IN/OUT transactions working.
- **Migration rehearsed** on a copy holding existing rows: stamp `baseline01` →
  upgrade to `price0001` kept every row and set `price = 0`;
  `alembic downgrade -1` removed the column without losing data.
- **Runbook fixed**: `apply-price-migration.ps1` used to abort right after a
  *successful* migration, leaving the backend stopped. Cause: PowerShell 5.1
  treats `alembic current 2>&1` stderr as a terminating error under
  `ErrorActionPreference = 'Stop'`. Fixed in this commit.

## What remains: run on the server

1. **Before replacing any code**, open the *current*
   `C:\InventoryManagement\ims-backend\app\database.py` and copy the hardcoded
   `postgresql+psycopg2://...` string. That is the live database. The new code
   no longer has a hardcoded fallback.
2. Update the code: `git pull` if `C:\InventoryManagement` is a git checkout,
   otherwise copy `ims-backend\app`, `ims-backend\alembic`,
   `ims-backend\alembic.ini`, `ims-frontend\src` and `scripts`. Do not touch
   `.venv`, `node_modules` or `ims-backend\media` (item images).
3. Create `C:\InventoryManagement\ims-backend\.env` containing
   `DATABASE_URL=<string from step 1>`.
4. Immediately run this in an elevated PowerShell:
   `powershell -ExecutionPolicy Bypass -File C:\InventoryManagement\scripts\apply-price-migration.ps1`
   Type `YES` only if the item count it shows matches the real inventory.
5. Work through the browser checklist the script prints at the end.

Do steps 2–4 back to back: once the new code is on disk and before the
migration runs, the backend errors on item queries if it restarts.

### If it stops

- **At [1/5] or [2/5]:** nothing changed. Likely causes: `.env` points at the
  wrong DB, the item count is 0, or the dump is under 10 KB (possible for a very
  small DB; that check is in step [2/5] of the script).
- **"No module named dotenv":** run
  `.venv\Scripts\python.exe -m pip install python-dotenv`.
- **`$pgBin` is wrong:** the script assumes `C:\PostgreSQL\14\bin`.
- **Rollback:** from `ims-backend`, `.venv\Scripts\python.exe -m alembic downgrade -1`
  removes the column. The full backup is in `C:\InventoryManagement\backups`.

## Known bugs, not fixed (pre-existing, independent of the price feature)

- `POST /auth/register` needs no login and accepts any `role_id`, so anyone can
  create an admin account. **Highest priority.**
- Creating a category or supplier from the UI fails: the backend expects an
  `id` because `CategorySchema` / `SupplierSchema` are used as input.
- Editing categories, suppliers and users fails: the frontend sends `PATCH` but
  the backend only accepts `PUT`.
- `app/scripts/setup_permissions.py` crashes on a second run and never creates
  `inventory.transaction` / `inventory.view_history`.
- `app/scripts/create_user.py`, `app/crud.py` and
  `app/services/notification_service.py` cannot be imported, so the daily
  low-stock alert job never runs.
- A duplicate SKU returns a 500; `/items/{id}/adjust` allows negative stock.
- `npm run lint` fails with 10 unused-variable errors (the build still works).
- Local installs: use `bcrypt==4.3.0` (from `uv.lock`); bcrypt 5 breaks passlib.
