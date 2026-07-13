# Metrics

## Agent Context Guide

Open this file only when adding analytics, event tracking, dashboards, or release measurement. Do not load it for ordinary UI or service work unless the task mentions metrics/events.

Related files:

- Analytics task status: `docs/delivery/TASK_BACKLOG.md`
- Product goals: `docs/product/PRODUCT_BRIEF.md`

## North Star Metric

`verified_published_startups`

Number of startups with:

```ts
verificationStatus === 'verified' && listingStatus === 'published';
```

This is the clearest proxy for marketplace value in v1.

## Primary Metrics

- `founder_profiles_created`: users with wallet connected and minimum profile complete.
- `startups_created`: startups created in any state.
- `verification_requests_submitted`: startups that requested verification.
- `verified_published_startups`: startups verified and published.
- `marketplace_logged_in_views`: visits to `/startups` by logged-in users.
- `startup_detail_logged_in_views`: visits to `/startups/[id]` by logged-in users.
- `founder_contact_clicks`: clicks on X or Telegram in `Founder Contact`.

## Secondary Metrics

- `profile_completion_rate`: profiles with name, job title, and at least one social link.
- `startup_completion_rate`: startups meeting the recommended completeness checklist.
- `filter_usage_rate`: marketplace sessions where at least one filter is used.
- `open_to_discuss_startups`: published startups with `acquisitionStatus = open_to_discuss`.
- `raising_startups`: published startups with `isRaising = true`.

## Recommended Events

In v1, events can be mock logs. No external analytics provider is required.

- `wallet_connected`
- `profile_saved`
- `startup_draft_created`
- `startup_updated`
- `verification_requested`
- `startup_published`
- `marketplace_viewed`
- `startup_filter_applied`
- `startup_filter_reset`
- `startup_detail_viewed`
- `founder_contact_clicked`
