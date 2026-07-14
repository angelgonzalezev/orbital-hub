begin;
select plan(8);

-- '...0003' is the seeded pending startup; '...0001' is verified and published.
select is(
  (select public.admin_review_startup('20000000-0000-4000-8000-000000000003', 'approve', '@reviewer')->>'applied'),
  'true',
  'approving a pending startup applies the review'
);

select is(
  (select verification_status from public.startups where id = '20000000-0000-4000-8000-000000000003'),
  'verified',
  'approval verifies the startup'
);

select is(
  (select listing_status from public.startups where id = '20000000-0000-4000-8000-000000000003'),
  'published',
  'approval publishes the startup in the same update, which is what fires the tweet trigger'
);

select is(
  (select reviewed_by from public.startups where id = '20000000-0000-4000-8000-000000000003'),
  '@reviewer',
  'approval records who reviewed it'
);

-- A double-tapped button must not re-review an already resolved startup.
select is(
  (select public.admin_review_startup('20000000-0000-4000-8000-000000000003', 'reject', '@other')->>'applied'),
  'false',
  'a startup that is no longer pending cannot be reviewed twice'
);

select is(
  (select listing_status from public.startups where id = '20000000-0000-4000-8000-000000000003'),
  'published',
  'the no-op review leaves the startup untouched'
);

select throws_ok(
  $$select public.admin_review_startup('20000000-0000-4000-8000-000000000003', 'delete', '@reviewer')$$,
  'Unknown decision: delete',
  'unknown decisions are rejected'
);

-- The RPC is the only path to verified, so founders must not be able to call it.
set local role authenticated;
select throws_ok(
  $$select public.admin_review_startup('20000000-0000-4000-8000-000000000004', 'approve', '@self')$$,
  '42501',
  'permission denied for function admin_review_startup',
  'authenticated users cannot approve their own startups'
);
reset role;

select * from finish();
rollback;
