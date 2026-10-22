# PulseDesk

**AI-triaged support, human-reviewed.**

PulseDesk is a full-stack support ticket system where an LLM agent does the
first pass on every incoming ticket — classifying it, prioritizing it, and
drafting a reply — and a human reviewer approves or overrides the AI's work
before anything goes out. It's a small, concrete example of the pattern most
AI-native teams actually use in production: let the model do the repetitive
triage work, keep a person in the loop for judgment calls, and make it obvious
when the model isn't confident enough to trust unsupervised.

Submitters file a ticket through the REST API (`POST /api/tickets`). The
backend calls Gemini to classify it in real time. A reviewer works out of the
web dashboard, where anything the AI was unsure about is visibly flagged.

## Why human-in-the-loop

The AI agent never gets the final word. Every ticket it processes lands in
the dashboard as a *suggestion* — category, priority, confidence score, and a
draft reply — not a decision. A reviewer can accept it as-is or overwrite any
field before marking it reviewed or resolved. Tickets the model scored below
60% confidence are visually flagged as needing extra scrutiny. And if the AI
call fails outright (rate limit, timeout, bad response), the ticket is still
saved — just without a suggestion — so a flaky model call never blocks a
customer from filing a ticket.

## Architecture

```
   Submitter                 ┌────────────────────┐          ┌───────────────────┐
  (API client) ──POST──────▶│                    │◀───GET───│   frontend/       │
                            │   backend/         │          │   (Next.js)       │
                            │   REST API         │◀──PATCH──│                   │
                            │   (Express, MVC)   │          │  Ticket List /    │
                            │                    │          │  Review UI        │
                            └─────────┬──────────┘          └───────────────────┘
                                      │
                                      ▼
                            ┌────────────────────┐
                            │   AI Triage Agent  │──────▶  Gemini API
                            │  classify + draft  │         (provider-swappable)
                            └─────────┬──────────┘
                                      │
                                      ▼
                            ┌────────────────────┐
                            │     PostgreSQL      │
                            │    (Prisma ORM)     │
                            └────────────────────┘
```

The frontend and backend share one set of zod schemas (`shared/`,
published in the workspace as `@pulsedesk/shared`) for the `Ticket` shape, so
the dashboard and the API can never drift out of sync on what a ticket looks
like.

## Screenshots

**Reviewer sign-in** — the dashboard is gated behind login; see the seeded
demo credentials under Setup:

![Reviewer login screen](docs/screenshots/login.png)

**Ticket list** — color-coded category/priority/status badges, filters, sort,
and a visible confidence flag on anything the AI was unsure about:

![Ticket list dashboard](docs/screenshots/dashboard-list.png)

**Ticket detail** — human reviewer sees the AI's suggestion, gets a low-confidence
warning banner, and can override any field before marking it reviewed:

![Ticket detail with low-confidence flag](docs/screenshots/dashboard-detail.png)

## Tech stack

| Layer      | Tech |
|------------|------|
| Monorepo   | pnpm workspaces |
| Backend    | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Web        | Next.js 15, React 19, Tailwind CSS |
| AI         | Google Gemini API, behind a swappable provider interface |
| Auth       | JWT (reviewer login on web only), bcrypt password hashing |
| Validation | zod, shared between frontend and backend |
| Testing    | Jest, supertest |

## Project structure

Both apps follow an MVC layout and live side by side in one folder:

```
pulsedesk/
├── backend/                 Express API — ticket CRUD, AI triage agent
│   ├── prisma/              schema, migrations, seed
│   └── src/
│       ├── app.ts           Express app wiring
│       ├── server.ts        entry point
│       ├── config/          Prisma client
│       ├── models/          Model — data access (TicketModel, UserModel)
│       ├── views/           View — JSON response serializers
│       ├── controllers/     Controller — parse request, call service, render view
│       ├── routes/          URL → controller mapping
│       ├── services/        business logic (tickets, auth, notifications, ai/)
│       ├── middleware/      requireAuth, errorHandler
│       ├── utils/           jwt, password hashing, asyncHandler
│       └── tests/           API integration tests
├── frontend/                Next.js dashboard for human review
│   └── src/
│       ├── app/             Next.js routes (pages compose views)
│       ├── models/          Model — API client, auth cookie names
│       ├── views/           View — React components, badge styles
│       └── controllers/     Controller — hooks, login/logout, URL filter parsing
├── shared/                  zod schemas, types and constants used by both
└── docker-compose.yml       local PostgreSQL for dev
```

Request flow on the backend: `routes → controllers → services → models`, with
controllers returning output through `views`.

## Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local Postgres) — or a hosted Postgres URL (Railway/Supabase)
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier works)

### 1. Install dependencies

```bash
pnpm install
```

This installs and links the three workspace packages (`backend`, `frontend`,
`shared`) in one pass.

### 2. Start Postgres and the API

```bash
docker compose up -d          # starts Postgres on localhost:5433
cd backend
cp .env.example .env          # then fill in GEMINI_API_KEY and JWT_SECRET
pnpm prisma:migrate           # creates the schema
pnpm db:seed                  # loads 6 sample tickets + a demo reviewer login
pnpm dev                      # http://localhost:4000
```

> The default `docker-compose.yml` maps Postgres to host port **5433**, not
> 5432 — this avoids clashing with a Postgres instance you may already have
> running locally. Adjust `DATABASE_URL` if you change the mapping.

> `pnpm db:seed` also creates the only reviewer account the web dashboard
> will accept: **`reviewer@pulsedesk.dev` / `pulsedesk-demo`**. There's no
> self-registration route — reviewer accounts are seeded/created directly in
> the database, matching an internal admin-panel access model.

### 3. Start the web dashboard

```bash
cd frontend
cp .env.local.example .env.local
pnpm dev                      # http://localhost:3000
```

### Running tests

```bash
cd backend
pnpm test
```

Integration tests run against a dedicated `pulsedesk_test` database (see
`.env.test`) so they never touch your dev or demo data. One-time setup:

```bash
docker exec pulsedesk-postgres psql -U pulsedesk -d pulsedesk -c "CREATE DATABASE pulsedesk_test;"
DATABASE_URL="postgresql://pulsedesk:pulsedesk@localhost:5433/pulsedesk_test?schema=public" \
  pnpm --filter @pulsedesk/backend exec prisma migrate deploy
```

## Prompt design

The classification prompt lives in
[`backend/src/services/ai/prompt.ts`](backend/src/services/ai/prompt.ts). The actual prompt
sent to Gemini:

```
You are a support ticket triage assistant for a software product.
Read the ticket below and classify it.

category: one of BUG, FEATURE_REQUEST, SUPPORT, OTHER.
  BUG = something is broken or behaving incorrectly.
  FEATURE_REQUEST = the user wants new or changed functionality.
  SUPPORT = the user needs help using existing functionality.
  OTHER = anything that doesn't fit the above (spam, unclear, general feedback).

priority: one of LOW, MEDIUM, HIGH, URGENT, based on user impact and urgency.
  URGENT = production down, data loss, security issue, blocks many users.
  HIGH = major feature broken or blocks the reporting user's core workflow.
  MEDIUM = a real problem but a workaround exists or impact is limited.
  LOW = cosmetic, minor annoyance, or a nice-to-have request.

confidence: your confidence (0 to 1) that the category AND priority are both correct.
  Lower it when the ticket is ambiguous, very short, or could fit multiple categories.

draftResponse: a short, polite, ready-to-send reply directly to the customer
  acknowledging their ticket and next steps. Do not invent facts about timelines
  or fixes you cannot know.

Respond with ONLY valid JSON, no markdown code fences, matching this shape:
{
  "category": "BUG" | "FEATURE_REQUEST" | "SUPPORT" | "OTHER",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "confidence": number between 0 and 1,
  "draftResponse": string
}

Ticket title: <title>
Ticket description: <description>
```

Design choices worth calling out:

- **Category and priority definitions are spelled out inline**, not left to
  the model's judgment of what "urgent" means. Without this, priority scoring
  drifted noticeably between similar tickets in early testing.
- **Confidence is defined explicitly** ("confidence that category AND
  priority are both correct") rather than asked for bare — an undefined
  confidence score is not comparable across tickets, and the dashboard relies
  on it being roughly calibrated to flag tickets for review.
- **The draft response is written to the customer directly**, since a
  reviewer may send it with little or no editing — it's asked not to invent
  facts (timelines, fixes) the model has no way of knowing.
- **Defense-in-depth on the output.** The prompt asks for "ONLY valid JSON,"
  but that instruction is never trusted on its own — every response is
  parsed and validated against `AIClassificationSchema` (zod) regardless of
  what the model returned. If validation fails, PulseDesk retries **once**
  with a stricter, JSON-only prompt (`{ strict: true }` in `prompt.ts`) that
  drops all the framing and just demands the shape. In practice this second
  pass reliably fixes markdown-fenced or prose-wrapped responses.

Error handling for the AI call itself is layered separately from schema
validation: `backend/src/services/ai/errors.ts` classifies every failure into
`RATE_LIMITED`, `TIMEOUT`, `SERVER_ERROR`, or `INVALID_REQUEST`, and only the
first three are retried, with full-jitter exponential backoff
(`backend/src/services/ai/backoff.ts`). If the AI is unavailable even after retries,
the ticket is still saved — as `NEW` with a null category/priority — instead
of failing the submission. Every attempt (prompt used, raw response,
validation result, latency) is logged as structured JSON via
`backend/src/services/ai/logger.ts`.

## Swapping the AI provider

Gemini is the only implementation today, but `classifyTicket` never talks to
Gemini directly — it goes through `AIProvider`
(`backend/src/services/ai/types.ts`), and `getAIProvider()`
(`backend/src/services/ai/providerFactory.ts`) is the only place that knows which
concrete provider is active, selected via the `AI_PROVIDER` env var. Adding
OpenAI or Claude means writing one new class implementing `generate(prompt)`
and adding a case to the factory's switch — no changes to `classifyTicket`,
the routes, or the retry/validation logic.

## Deployment

- **Web** → [Vercel](https://vercel.com) (set `NEXT_PUBLIC_API_URL` to the
  deployed API's URL)
- **API** → [Railway](https://railway.app) (set `DATABASE_URL`,
  `GEMINI_API_KEY`, `CORS_ORIGIN`)

*Live links go here once deployed:*

- Web dashboard: _not yet deployed_
- API: _not yet deployed_

## Known limitations

- **The web dashboard requires reviewer login**; ticket submission
  (`POST /api/tickets`) does not. `submittedBy` is still a self-reported name/email with no
  verification — intentional for a demo, not something to carry into a real
  deployment as-is. Reviewer auth is JWT-based
  (`backend/src/middleware/requireAuth.ts`), gates `PATCH /api/tickets/:id` on the API and the
  entire dashboard behind `frontend/src/middleware.ts`; there's no
  self-registration route, only seeded accounts (see Setup above).
- **Photo attachments aren't uploaded anywhere.** `imageUrl` is stored as
  whatever URL the client sends; there's no upload/storage step. A real
  deployment would upload to S3/Cloudinary/etc. first and store the resulting
  public URL.
- **Push notifications on status change are not implemented** (listed
  as a bonus in the original spec). `backend/src/services/notificationService.ts`
  has the hook point (`notifyStatusChange`, called on every status
  transition) — wiring it to a push provider just needs a device push-token store
  keyed by `submittedBy`, which isn't part of the current data model.

## Testing

10-15+ tests covering:

- AI classification: valid-response parsing, code-fence stripping, schema
  rejection of malformed/out-of-range responses, the strict-prompt retry on
  validation failure, retry-with-backoff on `RATE_LIMITED`/`SERVER_ERROR`,
  and no-retry on `INVALID_REQUEST` (`backend/src/services/ai/*.test.ts`).
- API integration tests for the full ticket CRUD flow, including AI success
  and AI-failure paths, filtering, 404s, and validation errors
  (`backend/src/tests/tickets.test.ts`).
- Reviewer login: correct/incorrect credentials, malformed requests, and
  token validation on `/api/auth/me`; `PATCH /api/tickets/:id` rejecting
  requests with no bearer token (`backend/src/tests/auth.test.ts`,
  `tickets.test.ts`).

```bash
cd backend && pnpm test
```
