---
name: Admin panel & auth setup
description: JWT auth, secure first-run setup flow, and db declaration rebuild requirement
---

## JWT Auth
- The Console depends on the managed `artifacts/api-server: API Server` workflow being present and healthy; when that service artifact is missing, the login page still renders but every auth request fails.
- Admin routes under `/api/admin/…` require `Authorization: Bearer <token>` header
- RBAC: `requireAdmin` = any role, `requireRoot` = root only

## First-run bootstrap (no hardcoded credentials)
- `GET /api/admin/auth/setup-status` returns `{ setupRequired: true }` if the admin_users table is empty
- `POST /api/admin/auth/setup` creates the first root user; caller must supply SESSION_SECRET as the `setupToken` field — no users are ever seeded in code
- Admin panel shows a `/setup` page when `setupRequired` is true

**Why:** Hardcoded or seeded credentials create a predictable privileged account in any fresh environment. Using the operator-controlled SESSION_SECRET as the bootstrap token ensures only the deploy owner can create the first account.

## DB declaration rebuild
After adding new schema files to `lib/db/src/schema/`, run `pnpm run typecheck:libs` from workspace root before running api-server typecheck.

**Why:** Project references require built `.d.ts` in `lib/db/dist`; stale declarations cause TS2305 errors in api-server.

## Recovery check
- Before investigating credentials, check `/api/healthz` and `/api/admin/auth/setup-status`; `setupRequired: false` means an existing admin account is expected and no setup credentials should be invented.

**Why:** A stopped or missing API workflow presents the same Console login screen as a bad password, while the database can remain completely healthy.
