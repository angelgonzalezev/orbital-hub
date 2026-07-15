-- Featured listings: the first paid feature. A founder pays 20 USDC on-chain
-- and their startup is pinned above the rest of the marketplace for 7 days.
--
-- The payment itself is verified by the verify-payment edge function (recipient,
-- mint, amount and payer are re-derived from the chain, never trusted from the
-- client). Once verified, the function calls apply_verified_payment
-- (service_role only, same pattern as admin_review_startup): the payments row
-- is the audit ledger and the tx signature its idempotency anchor, and the
-- entitlement itself is just startups.featured_until.

alter table public.startups
add column featured_until timestamptz;

create index startups_featured_until_idx
on public.startups(featured_until)
where featured_until is not null;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tx_signature text not null unique,
  payer_wallet text not null,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  sku text not null,
  target_id uuid,
  amount_base_units bigint not null,
  mint text not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  constraint payments_payer_wallet_format check (payer_wallet ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'),
  constraint payments_sku_length check (char_length(sku) between 1 and 64),
  constraint payments_amount_positive check (amount_base_units > 0),
  constraint payments_status_valid check (status in ('confirmed', 'refunded'))
);

create index payments_profile_id_idx on public.payments(profile_id);

alter table public.payments enable row level security;

-- Users can read their own receipts; every write goes through
-- apply_verified_payment under service_role, so there are no insert/update
-- policies at all.
create policy payments_read_own
on public.payments for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
);

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

-- Records a chain-verified payment and grants what it bought, atomically: if
-- the entitlement update fails the ledger insert rolls back with it. A replayed
-- tx signature short-circuits to applied: false without touching anything.
create or replace function public.apply_verified_payment(
  in_tx_signature text,
  in_payer_wallet text,
  in_profile_id uuid,
  in_sku text,
  in_target_id uuid,
  in_amount_base_units bigint,
  in_mint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted public.payments;
  target public.startups;
begin
  insert into public.payments (tx_signature, payer_wallet, profile_id, sku, target_id, amount_base_units, mint)
  values (in_tx_signature, in_payer_wallet, in_profile_id, in_sku, in_target_id, in_amount_base_units, in_mint)
  on conflict (tx_signature) do nothing
  returning * into inserted;

  if inserted.id is null then
    return jsonb_build_object('applied', false, 'reason', 'tx_already_used');
  end if;

  if in_sku = 'featured_listing_7d' then
    -- A renewal bought before the current window expires extends it, it never
    -- restarts the clock.
    update public.startups
    set featured_until = greatest(coalesce(featured_until, now()), now()) + interval '7 days'
    where id = in_target_id and owner_profile_id = in_profile_id
    returning * into target;

    if target.id is null then
      raise exception 'Startup not found or not owned by the paying profile';
    end if;

    return jsonb_build_object('applied', true, 'featured_until', target.featured_until);
  end if;

  raise exception 'Unknown sku: %', in_sku;
end;
$$;

revoke all on function public.apply_verified_payment(text, text, uuid, text, uuid, bigint, text) from public, anon, authenticated;
grant execute on function public.apply_verified_payment(text, text, uuid, text, uuid, bigint, text) to service_role;

-- featured_until rides along in to_jsonb(s), so the only listing change is the
-- ordering: active featured startups first, then the usual newest-first.
-- coalesce matters — a null featured_until must sort with the falses, and
-- "desc" alone would put nulls on top.
create or replace function public.list_published_startups(
  search_text text default null,
  categories text[] default null,
  stages text[] default null,
  technologies text[] default null,
  raising boolean default null,
  acquisition text default null
)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(s)
    || jsonb_build_object(
      'owner_wallet', p.wallet_address,
      'mrr', case when s.show_mrr then s.mrr else null end
    )
  from public.startups s
  join public.profiles p on p.id = s.owner_profile_id
  where s.verification_status = 'verified'
    and s.listing_status = 'published'
    and (
      search_text is null
      or s.name ilike '%' || search_text || '%'
      or s.one_liner ilike '%' || search_text || '%'
    )
    and (categories is null or cardinality(categories) = 0 or s.category && categories)
    and (stages is null or cardinality(stages) = 0 or s.stage = any(stages))
    and (technologies is null or cardinality(technologies) = 0 or s.tech_stack && technologies)
    and (raising is null or s.is_raising = raising)
    and (acquisition is null or s.acquisition_status = acquisition)
  order by coalesce(s.featured_until > now(), false) desc, s.created_at desc;
$$;
