# Usability Testing Platform MVP

แพลตฟอร์ม MVP สำหรับเชื่อม Owner ที่ต้องการทดสอบเว็บไซต์กับ Tester ที่ทำงานผ่าน Web Dashboard + Chrome Extension (Manifest V3) + Express API + PostgreSQL

## Architecture

```text
apps/
  web/        Next.js dashboard for OWNER / TESTER
  api/        Express + TypeScript + Prisma
  extension/  Chrome Extension (Manifest V3)
packages/
  shared/     Shared TypeScript contracts
```

Core flow:

```text
Owner creates campaign
→ Tester claims one available job
→ Tester syncs authenticated session to Extension
→ Extension activates only when the claimed job matches the current target URL
→ Tester completes every task and submits responses
→ Owner reads the responses
→ Owner approves or rejects the submission
```

Video recording and real payment processing remain intentional MVP placeholders.

## Local configuration

Do not commit real secrets. Copy the example environment file first:

```bash
cp .env.example .env
```

Set at least:

```env
JWT_SECRET=use-a-long-random-development-secret
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_EXTENSION_ID=
```

The API intentionally fails to start when `JWT_SECRET` is missing.

For running the API outside Docker, copy `apps/api/.env.example` to `apps/api/.env`.

## Run Web + API + PostgreSQL

```bash
docker compose up -d --build
```

Then open:

- Web: http://localhost:3000
- API health: http://localhost:4000/health

Prisma migrations are applied with `prisma migrate deploy`.

## Build the Chrome Extension

From the repository root:

```bash
pnpm install
cd apps/extension
EXTENSION_API_URL=http://localhost:4000 WEB_APP_ORIGINS='http://localhost/*' pnpm build
```

Load `apps/extension/dist` from `chrome://extensions` using **Load unpacked**.

Copy the generated Extension ID into the root `.env`:

```env
NEXT_PUBLIC_EXTENSION_ID=<your-extension-id>
```

Then rebuild/restart the Web app so the public environment variable is embedded into the Next.js build.

The source manifest keeps only the permissions required by the current architecture: storage plus host access/content-script injection for arbitrary test targets. The previous broad DNR/CSP/X-Frame-Options rewriting is not used.

## Manual end-to-end test

### 1. Owner

1. Register `owner@example.com` / `password123` as **OWNER**.
2. Create a campaign with target `https://example.com`.
3. Add two tasks.
4. Confirm one job is shown as `AVAILABLE`.

### 2. Tester

1. Register a second account as **TESTER**.
2. Click **Sync Auth to Chrome Extension**.
3. Confirm the Extension popup reports an authenticated state.
4. Claim the Owner's job.
5. Use **Open target website**.

### 3. Extension

1. The overlay should appear only when the current URL matches a claimed job's target URL.
2. Enter a response for every task.
3. Submit once.
4. The submit control is disabled while the request is in flight.
5. API/validation/network failures must be displayed as failures rather than false success.

### 4. Owner review

1. Refresh the Owner dashboard.
2. The job should show `SUBMITTED`.
3. Click **View submission**.
4. Read every task and Tester response.
5. Only after the submission is loaded, click **Approve** or **Reject**.
6. A reviewed job cannot be reviewed a second time.

## Integrity rules implemented

- Passwords are bcrypt hashed.
- JWT signing has no source-code fallback secret.
- OWNER/TESTER API role checks are enforced.
- Job claim uses a conditional atomic update so only one Tester can win.
- A submission must contain every campaign task exactly once.
- Foreign task IDs and duplicate task IDs are rejected.
- `TaskResponse(jobId, taskId)` is unique in PostgreSQL.
- `CLAIMED → SUBMITTED` and `SUBMITTED → APPROVED/REJECTED` are conditional state transitions.
- Job lifecycle timestamps track claim, submission and review.
- Owner review verifies campaign ownership.
- Extension API calls check HTTP status and propagate validation/auth/network errors.

## Verification

With PostgreSQL available and the environment configured:

```bash
pnpm install
pnpm --filter @usability-testing/api db:generate
pnpm --filter @usability-testing/api db:migrate:deploy
pnpm typecheck
pnpm build
pnpm lint
pnpm test
```

The API integration test covers:

- register/login authentication infrastructure
- OWNER/TESTER authorization
- concurrent job claiming
- foreign task rejection
- duplicate task rejection
- unauthorized submission
- owner-only submission review
- one-way approve/reject transition
- concurrent/double submission

GitHub Actions runs the same build/type/lint/integration-test verification against PostgreSQL for pull requests.
