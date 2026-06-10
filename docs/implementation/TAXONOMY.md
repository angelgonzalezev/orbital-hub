# Taxonomy v1

## Agent Context Guide

Open this file when building filters, startup forms, category/stage/tech selectors, or mock data that must use allowed options. Avoid adding new categories or tech values elsewhere without updating this file.

Related files:

- Startup model: `docs/implementation/DATA_MODELS.md`
- Validation limits: `docs/implementation/VALIDATION_RULES.md`
- Marketplace UI: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`

## Startup Stages

```ts
export const STARTUP_STAGES = ['Idea', 'MVP', 'Early-stage', 'Scaling', 'Established'] as const;
```

- `Idea`: concept being validated.
- `MVP`: usable product or functional demo.
- `Early-stage`: early users, pilots, or first traction.
- `Scaling`: growing usage or revenue.
- `Established`: mature and recognized operation.

## Categories

```ts
export const STARTUP_CATEGORIES = [
  'DeFi',
  'AI',
  'Infra',
  'Payments',
  'NFT',
  'Consumer',
  'DevTools',
  'Gaming',
  'DAO',
  'DePIN',
  'Security',
  'Analytics',
] as const;
```

Rules:

- 1-5 categories per startup.
- First category is primary.
- Filters use closed options.

## Tech Stack

```ts
export const TECH_STACK_OPTIONS = [
  'Rust',
  'Anchor',
  'Next.js',
  'React',
  'TypeScript',
  'Solana Pay',
  'SPL Token',
  'Token Extensions',
  'Metaplex',
  'IPFS',
  'Helius',
  'QuickNode',
  'Triton',
  'Jito',
  'Pyth',
  'Switchboard',
  'Supabase',
  'PostgreSQL',
  'Tailwind CSS',
] as const;
```

Rules:

- 1-10 technologies per startup.
- v1 prioritizes predefined options to keep filters clean.
