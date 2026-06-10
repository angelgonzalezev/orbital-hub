# Mock Data Requirements

## Agent Context Guide

Open this file when creating, updating, or auditing mock users/startups. This file defines the minimum dataset needed to exercise all screens, permissions, filters, and empty states.

Related files:

- Data models: `docs/implementation/DATA_MODELS.md`
- Taxonomy values: `docs/implementation/TAXONOMY.md`
- Validation rules: `docs/implementation/VALIDATION_RULES.md`

Mock data must cover every screen state.

## Users

- 3-5 users.
- One `CURRENT_MOCK_WALLET` with a complete profile.
- At least one founder with X and Telegram.
- At least one founder with only one social link.
- At least one founder with no social links.
- At least one non-owner user for permission testing.

## Startups

- 8-12 startups.
- The current mock wallet owns several startups.
- Include at least:
  - one `draft`.
  - one `pending`.
  - one `verified + published`.
  - one `rejected`.
  - one `archived`.
- Include startups from other owners.
- Include varied categories, stages, tech stacks, `isRaising`, `acquisitionStatus`, and `showMrr`.

## Required Test Scenarios

- Marketplace has multiple visible startups.
- Dashboard shows owner startups in all states.
- Marketplace hides drafts, pending, rejected, and archived startups.
- MRR appears only when `showMrr = true`.
- Founder contact shows social links when present.
- Founder contact shows empty state when social links are absent.
