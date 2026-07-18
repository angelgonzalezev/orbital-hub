-- Notification/login email per profile, synced from Privy's linked accounts
-- on every session exchange (wallet users can link one from the profile page;
-- email/Google users bring theirs). Deliberately NOT a profiles column:
-- profiles is readable by any authenticated user and emails must not leak.
-- No client grants at all - platform emails are sent server-side.
create table public.user_emails (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  privy_did text not null,
  email text not null,
  updated_at timestamptz not null default now(),
  constraint user_emails_email_format check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

alter table public.user_emails enable row level security;
-- Hosted default privileges auto-grant table access; nothing client-side may
-- touch this table.
revoke all on public.user_emails from anon, authenticated;

-- resolve_privy_profile grows an optional in_email: same atomic exchange now
-- mirrors the linked email too. Dropped and recreated because the signature
-- changes; callers passing only (in_did, in_wallets) still match thanks to
-- the default.
drop function public.resolve_privy_profile(text, jsonb);

create function public.resolve_privy_profile(in_did text, in_wallets jsonb, in_email text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles;
  addresses text[];
  primary_wallet text;
begin
  if in_did is null or in_did not like 'did:privy:%' then
    raise exception 'Invalid Privy DID';
  end if;
  if jsonb_typeof(in_wallets) is distinct from 'array' or jsonb_array_length(in_wallets) = 0 then
    raise exception 'At least one linked wallet is required';
  end if;

  select array_agg(w ->> 'address') into addresses from jsonb_array_elements(in_wallets) as w;

  select * into target from public.profiles where privy_did = in_did;

  if target.id is null then
    -- Serialize concurrent adoptions of the same legacy profile.
    select * into target
    from public.profiles
    where wallet_address = any(addresses)
    order by (privy_did is null) desc, joined_at asc
    limit 1
    for update;

    if target.id is not null and target.privy_did is not null and target.privy_did <> in_did then
      raise exception 'wallet_already_linked';
    end if;

    if target.id is not null and target.privy_did is null then
      update public.profiles set privy_did = in_did where id = target.id returning * into target;
    end if;

    if target.id is null then
      -- New user: the embedded wallet (when present) is the public identity.
      select coalesce(
        (select w ->> 'address' from jsonb_array_elements(in_wallets) as w where w ->> 'wallet_type' = 'embedded' limit 1),
        addresses[1]
      ) into primary_wallet;

      begin
        insert into public.profiles (privy_did, wallet_address)
        values (in_did, primary_wallet)
        returning * into target;
      exception when unique_violation then
        -- Either this DID won a concurrent race (fine, reuse the row) or the
        -- wallet address belongs to someone else's profile.
        select * into target from public.profiles where privy_did = in_did;
        if target.id is null then
          raise exception 'wallet_already_linked';
        end if;
      end;
    end if;
  end if;

  -- Mirror the linked set: drop wallets that were unlinked in Privy, upsert
  -- the rest. A re-linked address moves back to this profile.
  delete from public.user_wallets
  where profile_id = target.id and address <> all(addresses);

  insert into public.user_wallets (profile_id, privy_did, address, wallet_type)
  select target.id, in_did, w ->> 'address', w ->> 'wallet_type'
  from jsonb_array_elements(in_wallets) as w
  on conflict (address) do update
  set profile_id = excluded.profile_id,
      privy_did = excluded.privy_did,
      wallet_type = excluded.wallet_type;

  -- Mirror the linked email the same way.
  if in_email is null then
    delete from public.user_emails where profile_id = target.id;
  else
    insert into public.user_emails (profile_id, privy_did, email)
    values (target.id, in_did, in_email)
    on conflict (profile_id) do update
    set email = excluded.email,
        privy_did = excluded.privy_did,
        updated_at = now();
  end if;

  return to_jsonb(target);
end;
$$;

revoke all on function public.resolve_privy_profile(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.resolve_privy_profile(text, jsonb, text) to service_role;
