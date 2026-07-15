begin;
select plan(14);

-- Seed fixtures: '...0001' (Solana Pay Pro) is verified+published and owned by
-- profile '...0001'; '...0002' (Neon Garden) belongs to someone else.

select is(
  (select public.apply_verified_payment(
    'sig-feature-1', '11111111111111111111111111111111',
    '10000000-0000-4000-8000-000000000001', 'featured_listing_7d',
    '20000000-0000-4000-8000-000000000001', 20000000,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  )->>'applied'),
  'true',
  'a verified payment applies and grants the entitlement'
);

select ok(
  (select featured_until between now() + interval '6 days' and now() + interval '8 days'
   from public.startups where id = '20000000-0000-4000-8000-000000000001'),
  'the startup is featured for 7 days'
);

select is(
  (select count(*)::integer from public.payments where tx_signature = 'sig-feature-1'),
  1,
  'the payment lands in the ledger'
);

-- The tx signature is the idempotency anchor: a double-submitted verification
-- must not grant twice.
select is(
  (select public.apply_verified_payment(
    'sig-feature-1', '11111111111111111111111111111111',
    '10000000-0000-4000-8000-000000000001', 'featured_listing_7d',
    '20000000-0000-4000-8000-000000000001', 20000000,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  )->>'reason'),
  'tx_already_used',
  'a replayed tx signature is a no-op'
);

select ok(
  (select featured_until between now() + interval '6 days' and now() + interval '8 days'
   from public.startups where id = '20000000-0000-4000-8000-000000000001'),
  'the replay does not extend the featured window'
);

select is(
  (select public.apply_verified_payment(
    'sig-feature-2', '11111111111111111111111111111111',
    '10000000-0000-4000-8000-000000000001', 'featured_listing_7d',
    '20000000-0000-4000-8000-000000000001', 20000000,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  )->>'applied'),
  'true',
  'a renewal with a fresh signature applies'
);

select ok(
  (select featured_until > now() + interval '13 days'
   from public.startups where id = '20000000-0000-4000-8000-000000000001'),
  'renewing before expiry extends the window instead of restarting it'
);

-- Paying for someone else's startup must fail...
select throws_ok(
  $$select public.apply_verified_payment(
    'sig-mismatch', '11111111111111111111111111111111',
    '10000000-0000-4000-8000-000000000001', 'featured_listing_7d',
    '20000000-0000-4000-8000-000000000002', 20000000,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  )$$,
  'Startup not found or not owned by the paying profile',
  'a payment cannot feature a startup the payer does not own'
);

-- ...and the exception must take the ledger insert down with it, so the same
-- signature can be re-verified once the client fixes the target.
select is(
  (select count(*)::integer from public.payments where tx_signature = 'sig-mismatch'),
  0,
  'a failed grant rolls the ledger insert back'
);

select throws_ok(
  $$select public.apply_verified_payment(
    'sig-unknown-sku', '11111111111111111111111111111111',
    '10000000-0000-4000-8000-000000000001', 'perk_gold',
    null, 20000000,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  )$$,
  'Unknown sku: perk_gold',
  'unknown skus are rejected'
);

-- A receipt for someone else, to prove RLS scoping below.
select public.apply_verified_payment(
  'sig-other-profile', 'Vote111111111111111111111111111111111111111',
  '10000000-0000-4000-8000-000000000002', 'featured_listing_7d',
  '20000000-0000-4000-8000-000000000002', 20000000,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', null, '', now(), now(), now(), '{}', '{}'
);

update public.profiles
set auth_user_id = '30000000-0000-4000-8000-000000000001'
where id = '10000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

-- Only the verify-payment edge function (service_role) may record payments.
select throws_ok(
  $$select public.apply_verified_payment(
    'sig-self-serve', '11111111111111111111111111111111',
    '10000000-0000-4000-8000-000000000001', 'featured_listing_7d',
    '20000000-0000-4000-8000-000000000001', 20000000,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  )$$,
  '42501',
  'permission denied for function apply_verified_payment',
  'authenticated users cannot grant themselves entitlements'
);

select is(
  (select count(*)::integer from public.payments),
  2,
  'users see their own receipts and nothing else'
);

select throws_ok(
  $$insert into public.payments (tx_signature, payer_wallet, profile_id, sku, amount_base_units, mint)
    values ('sig-forged', '11111111111111111111111111111111', '10000000-0000-4000-8000-000000000001', 'featured_listing_7d', 20000000, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')$$,
  '42501',
  'permission denied for table payments',
  'the ledger cannot be written to directly'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

-- The product value: the two featured startups outrank everything, even though
-- Pixel Quest is newer than Solana Pay Pro; among featured, newest-first still
-- applies.
select is(
  (select array_agg(item->>'name')
   from (select item from public.list_published_startups() item limit 2) x(item)),
  array['Neon Garden', 'Solana Pay Pro'],
  'featured startups are pinned above the newest-first marketplace order'
);

select * from finish();
rollback;
