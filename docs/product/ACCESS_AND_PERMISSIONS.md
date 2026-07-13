# Access and Permissions

## Agent Context Guide

Open this file when implementing auth gates, route protection, owner-only actions, visibility rules, or permission checks. This is the authority for who can see startup data and who can mutate startup/profile data.

Related files:

- Route/screen specs: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`
- Service permission contracts: `docs/implementation/SERVICES_CONTRACTS.md`
- Task tracking: `docs/delivery/TASK_BACKLOG.md`

## Access Matrix

| User State                   | Can Do                                                                   | Cannot Do                                                                                                     |
| :--------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| Anonymous visitor            | View landing, marketing copy, aggregate counters.                        | View startup list, startup cards, startup names, filters with real results, startup details, founder contact. |
| Wallet connected, no profile | View protected marketplace and details, create profile.                  | Create startups until profile minimum is complete.                                                            |
| Logged-in user with profile  | View marketplace, startup details, founder contacts, edit own profile.   | Edit, archive, verify, or publish startups owned by others.                                                   |
| Founder owner                | Create, edit, archive, request verification, and publish owned startups. | Approve real verification, edit other users' startups.                                                        |
| Admin/reviewer               | Not part of v1.                                                          | Do not build an admin dashboard in v1.                                                                        |

## Protected Routes

These routes require wallet login:

- `/startups`
- `/startups/[id]`
- `/dashboard`
- `/dashboard/profile`
- `/dashboard/startups`
- `/dashboard/startups/new`
- `/dashboard/startups/[id]/edit`
- `/dashboard/startups/[id]/verification`

## Anonymous User Behavior

- Anonymous users should never see individual startup data.
- Auth-gated routes must render a blocking state with CTA `Connect Wallet`.
- Startup data should not be fetched or rendered before auth is resolved.

## Logged-In User Visibility

Logged-in users can see:

- Startups with `verificationStatus = verified` and `listingStatus = published`.
- Public market signals: stage, category, tech stack, `isRaising`, `acquisitionStatus`.
- Founder contact via public X/Telegram.
- MRR only when `showMrr = true`.

Logged-in users cannot see:

- Other users' drafts, pending, rejected, or archived startups.
- Private metrics.
- Internal/future data.
- Non-public contact details.

## Owner Visibility

Owners can see all their own startups in all states:

- `draft`
- `pending`
- `verified`
- `rejected`
- `published`
- `archived`

Owners can modify:

- Startup information.
- Publication status.
- Fundraising/acquisition signals.
- Their own profile and contact links.
