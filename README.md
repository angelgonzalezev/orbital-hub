# Orbital

Discover startups orbiting the Solana ecosystem.

Orbital is a curated marketplace directory for startups building across Solana.

The MVP lets founders sign in with email, Google, or a Solana wallet, complete a professional profile, list a startup, request verification, publish verified startups, and make them publicly discoverable.

In v1, "marketplace" means structured discovery and founder contact through public social links, plus paid featured listings (20 USDC for 7 days, verified on-chain). It does not include chat, offers, or deal rooms.

## Current Status

Last audited: 2026-07-19.

- Core product routes are implemented.
- Privy authentication (email, Google, or external Solana wallet, with auto-created embedded wallets) is implemented.
- Featured-listing payments (20 USDC for 7 days, verified on-chain) are live.
- Profiles and startups are persisted in Supabase/PostgreSQL with RLS and protected RPCs.
- User profile, dashboard, startup CRUD, verification, marketplace, detail page, and founder contact screens exist.
- Product and implementation documentation lives under `docs/`.
- Local seed data and database policy tests are included under `supabase/`.

Current task progress is tracked in [docs/delivery/TASK_BACKLOG.md](docs/delivery/TASK_BACKLOG.md).

## Product Scope

Included in the MVP:

- Login with email, Google, or an external Solana wallet through Privy.
- Founder profile.
- Private dashboard.
- Create, edit, archive, verify, and publish owned startups.
- Public marketplace of verified and published startups.
- Public startup detail pages.
- Featured listings paid in USDC (20 USDC for 7 days, verified on-chain).
- Filters by category, stage, tech stack, fundraising, and acquisition status.
- Founder contact through the startup creator's X and Telegram links.

Out of scope for v1:

- XMTP.
- Anonymous chat.
- Internal contact forms.
- Saved contact requests.
- Offers.
- Deal room.
- Real domain verification.
- Real X API integration.
- Notifications.
- Admin/reviewer dashboard.

## Key Routes

| Route                                   | Access                 | Purpose                                         |
| :-------------------------------------- | :--------------------- | :---------------------------------------------- |
| `/`                                     | Public                 | Landing page.                                   |
| `/docs`                                 | Public                 | Product and contributor documentation.          |
| `/orbital`                              | Public                 | Interactive 3D globe of the ecosystem.          |
| `/startups`                             | Public                 | Marketplace of verified and published startups. |
| `/startups/[id]`                        | Public                 | Startup detail and founder contact.             |
| `/[username]`                           | Public                 | Public founder profile.                         |
| `/u/[wallet]`                           | Public                 | Public profile addressed by wallet.             |
| `/dashboard`                            | Logged-in only         | Private overview.                               |
| `/dashboard/profile`                    | Logged-in only         | Edit founder profile.                           |
| `/dashboard/startups`                   | Logged-in only         | Manage owned startups.                          |
| `/dashboard/startups/new`               | Logged-in with profile | Create startup draft.                           |
| `/dashboard/startups/[id]/edit`         | Owner only             | Edit startup.                                   |
| `/dashboard/startups/[id]/verification` | Owner only             | Verification and publication.                   |

All inherited template routes have been removed. Unknown routes render the Orbital 404 page.

## Tech Stack

- Next.js 15 App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- GSAP and Lenis for animation and smooth scrolling.
- Privy identity via `@privy-io/react-auth` and `@privy-io/node`.
- Solana via `@solana/kit`, `@solana-program/token`, `@solana/client`, and `@solana/react-hooks`.
- Supabase (supabase-js and SSR helpers), PostgreSQL, RLS, and SQL RPCs.
- VitePress for the documentation site.

## Project Structure

```text
src/app/                         App Router pages
src/components/solana-hub/       Landing page sections
src/components/startup/          Startup marketplace and form components
src/components/profile/          Founder profile form
src/components/shared/           Shared shell, auth gate, states, badges, wallet button
src/context/                     React authentication context
src/lib/supabase/                Browser/server Supabase clients and mappers
src/data/startupTaxonomy.ts      Product taxonomy constants
src/interface/                   TypeScript interfaces
src/services/                    Supabase-backed product services
src/utils/validation.ts          Validation helpers
public/images/                   Only assets referenced by the product UI
supabase/migrations/             Database schema, policies, triggers, and RPCs
supabase/tests/                  pgTAP database authorization tests
supabase/seed.sql                Local-only development fixtures
docs/product/                    Product definition and rules
docs/implementation/             Implementation blueprint and contracts
docs/delivery/                   Roadmap and task backlog
skills/create-commit/            Repo copy of the commit helper skill
```

## Documentation Map

Start with [MVP_SPEC.md](MVP_SPEC.md) for the compact source-of-truth index.

Product docs:

- [Product Brief](docs/product/PRODUCT_BRIEF.md)
- [Access and Permissions](docs/product/ACCESS_AND_PERMISSIONS.md)
- [Metrics](docs/product/METRICS.md)

Implementation docs:

- [Implementation Blueprint](docs/implementation/IMPLEMENTATION_BLUEPRINT.md)
- [Data Models](docs/implementation/DATA_MODELS.md)
- [Validation Rules](docs/implementation/VALIDATION_RULES.md)
- [Services Contracts](docs/implementation/SERVICES_CONTRACTS.md)
- [Taxonomy](docs/implementation/TAXONOMY.md)
- [Mock Data Requirements](docs/implementation/MOCK_DATA_REQUIREMENTS.md)

Delivery docs:

- [Roadmap](docs/delivery/ROADMAP.md)
- [Task Backlog](docs/delivery/TASK_BACKLOG.md)
- [QA Checklist](QA_CHECKLIST.md)

Public documentation site (VitePress):

- Source package: [docs-site](docs-site); the static output is emitted to `public/docs` and served at `/docs`.
- Local dev: `npm run docs:dev` at `http://localhost:3001/docs/`
- Static build: `npm run docs:build`
- Pages: `/` (What is Orbital), `/vision`, `/roadmap`, `/guide/getting-started`, `/guide/list-your-startup`, `/guide/discover`, `/guide/featured-listings`, `/about/technology`, and `/about/messaging`.

## Getting Started

Prerequisites:

- Node.js 22 or higher.
- npm.
- A Supabase project, or Docker for the local Supabase stack.

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local`. For local Supabase development, start and reset the stack:

```bash
npm run supabase:start
npm run db:reset
```

Use the API URL, publishable key, and service-role key printed by `supabase:start`, and fill in the Privy values (`NEXT_PUBLIC_PRIVY_APP_ID`, `PRIVY_APP_SECRET`) from the Privy dashboard. `AUTH_JWT_SECRET` must match the Supabase project's JWT secret; it signs the session tokens minted by `/api/auth/session`. `SUPABASE_SERVICE_ROLE_KEY` provisions a profile only after the server verifies the Privy identity; it also powers the optional development verification endpoint. Server-only secrets must never use a `NEXT_PUBLIC_` prefix.

Database migrations also provision the public `media` Storage bucket used for profile images and startup logos. Upload mutations require authentication and are restricted to the current user's object prefix. Images are cropped in the browser and stored as 512x512 WebP files; anyone with a resulting public URL can read the asset.

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev          # Start the local development server
npm run build        # Build for production
npm run build:netlify # Install docs dependencies and build for Netlify
npm run build:with-docs # Build VitePress docs and then the app
npm run docs:dev     # Start VitePress locally
npm run docs:build   # Generate static VitePress files under public/docs
npm run start        # Start the production server
npm run lint         # Run lint command configured in package.json
npm run lint:fix     # Run lint autofix command configured in package.json
npm run format       # Format files with Prettier
npm run format:check # Check formatting with Prettier
npm test             # Run TypeScript unit tests
npm run db:test      # Run pgTAP RLS/RPC tests (local Supabase required)
```

## Authentication (Privy)

Identity is handled by Privy. Users log in with email, Google, or an external Solana wallet, and Privy auto-creates an embedded Solana wallet for each account. After login, the app calls the `/api/auth/session` Next.js API route, which verifies the Privy access token and mints a short-lived Supabase-signed JWT whose subject is the profile id. `supabase-js` consumes that token, and Postgres RLS enforces ownership. There are no Supabase Auth users.

Verification approval/rejection can be enabled only outside production with both `ENABLE_DEV_VERIFICATION=true` and `NEXT_PUBLIC_ENABLE_DEV_VERIFICATION=true`. This is a development aid, not an admin feature.

## Deploy to Netlify

Connect this repository to Netlify and select `main` as the production branch. The committed `netlify.toml` configures Node.js 22, builds the VitePress site under `/docs`, runs the Next.js production build, and publishes the `.next` output. Netlify detects Next.js and provisions its OpenNext adapter automatically; do not add or pin a legacy Next.js plugin.

Add these environment variables in **Project configuration → Environment variables** (see `.env.example` for descriptions):

| Variable                               | Recommended scopes   | Secret |
| :------------------------------------- | :------------------- | :----- |
| `NEXT_PUBLIC_PRIVY_APP_ID`             | Builds and Functions | No     |
| `NEXT_PUBLIC_SUPABASE_URL`             | Builds and Functions | No     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Builds and Functions | No     |
| `NEXT_PUBLIC_SOLANA_RPC_URL`           | Builds and Functions | No     |
| `NEXT_PUBLIC_USDC_MINT`                | Builds and Functions | No     |
| `NEXT_PUBLIC_TREASURY_WALLET`          | Builds and Functions | No     |
| `NEXT_PUBLIC_ENABLE_GAS_SPONSORSHIP`   | Builds and Functions | No     |
| `NEXT_PUBLIC_SITE_URL`                 | Builds and Functions | No     |
| `PRIVY_APP_SECRET`                     | Functions only       | Yes    |
| `PRIVY_VERIFICATION_KEY` (optional)    | Functions only       | Yes    |
| `AUTH_JWT_SECRET`                      | Functions only       | Yes    |
| `SUPABASE_SERVICE_ROLE_KEY`            | Functions only       | Yes    |

Use the hosted Supabase project values, not the local `127.0.0.1` values. Store the server-only secrets (`PRIVY_APP_SECRET`, `AUTH_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) only in the Netlify UI, mark them as containing secret values if that option is available, and never add them to `netlify.toml` or prefix them with `NEXT_PUBLIC_`. If your Netlify plan supports custom scopes, restrict them to Functions; otherwise, the default scope still does not expose them to the browser. Leave `ENABLE_DEV_VERIFICATION` and `NEXT_PUBLIC_ENABLE_DEV_VERIFICATION` unset or set to `false` in production.

There are no Supabase Auth users, so no Supabase Auth provider configuration is needed. Set `AUTH_JWT_SECRET` to the hosted Supabase project's JWT secret, register the production domain in the Privy dashboard app settings, and set `NEXT_PUBLIC_SITE_URL` to the final Netlify production URL (or the custom domain). After saving the variables, trigger a new production deploy.

## Known Gaps

The product is live. Current post-launch backlog (see the [public roadmap](https://orbitalhub.dev/docs/roadmap) for the full picture):

- Activate gas-sponsored transactions for embedded wallets (built behind `NEXT_PUBLIC_ENABLE_GAS_SPONSORSHIP`, awaiting Privy activation).
- Build the email notification sender on top of the mirrored `user_emails` data.
- Add an admin review interface (review currently runs through Telegram approve/reject cards).
- Automate domain and X ownership verification (status fields exist; checks are manual today).
- Add product analytics.

## Commit Convention

This project uses task-based commits for product work:

```text
agonzalez/TASK-ID/commit-title
```

Example:

```text
agonzalez/TASK-042/update-readme
```

Use [docs/delivery/TASK_BACKLOG.md](docs/delivery/TASK_BACKLOG.md) to choose the task ID. The helper skill is documented in [skills/create-commit/SKILL.md](skills/create-commit/SKILL.md).
