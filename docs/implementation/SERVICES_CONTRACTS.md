# Services Contracts

## Agent Context Guide

Open this file when implementing or changing `userService`, `startupService`, `verificationService`, filters, mutation rules, or service-level permission checks. Do not use UI components as the source of truth for business rules.

Related files:

- Permissions: `docs/product/ACCESS_AND_PERMISSIONS.md`
- Data models: `docs/implementation/DATA_MODELS.md`
- Validation: `docs/implementation/VALIDATION_RULES.md`
- Task status for services: `docs/delivery/TASK_BACKLOG.md`

Services must isolate UI from data source. In v1, they can use local JSON and in-memory mutation.

## userService

- `getCurrentUser(walletAddress)`
- `getUserByWallet(walletAddress)`
- `upsertProfile(walletAddress, input)`

Rules:

- Validate profile input.
- Return `null` when user does not exist.
- Do not let UI read `users.json` directly.

## startupService

```ts
type StartupFilters = {
  search?: string;
  category?: string[];
  stage?: StartupStage[];
  techStack?: string[];
  isRaising?: boolean;
  acquisitionStatus?: AcquisitionStatus;
};
```

Expected methods:

- `listPublishedStartups(filters)`
- `getStartupById(id)`
- `listStartupsByOwner(walletAddress)`
- `createStartup(ownerWallet, input)`
- `updateStartup(id, ownerWallet, input)`
- `archiveStartup(id, ownerWallet)`
- `publishStartup(id, ownerWallet)`

Rules:

- Marketplace list returns only `verified + published`.
- Edit/archive/publish must validate `ownerWallet`.
- `publishStartup` fails unless startup is `verified`.
- `archiveStartup` sets `listingStatus = archived`.
- Changing website/X on verified startup resets verification.

## verificationService

- `requestVerification(startupId, ownerWallet)`
- `mockApproveVerification(startupId)`
- `mockRejectVerification(startupId, reason)`

Rules:

- Request fails if profile or startup requirements are missing.
- Request sets checks to `pending`.
- Approve sets checks to `verified`.
- Reject sets checks to `failed`.
- Mock approve/reject are dev-only actions, not admin product features.
