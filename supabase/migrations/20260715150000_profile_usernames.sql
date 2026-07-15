-- User-chosen @usernames so public profiles live at /<username> instead of
-- /u/<wallet>. Lowercase alphanumerics and underscores, 3-30 chars, globally
-- unique. Top-level app routes are reserved so a username can never shadow
-- (or be shadowed by) a real page.

alter table public.profiles
add column username text;

alter table public.profiles
add constraint profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$');

alter table public.profiles
add constraint profiles_username_reserved check (
  username is null
  or username <> all (array[
    'api', 'dashboard', 'startups', 'startup', 'u', 'admin', 'auth', 'login',
    'logout', 'signup', 'profile', 'profiles', 'settings', 'docs', 'blog',
    'about', 'terms', 'privacy', 'support', 'help', 'orbital', 'marketplace',
    'home', '404', '500'
  ])
);

create unique index profiles_username_key on public.profiles (username);

grant update (username) on public.profiles to authenticated;

-- Same public fields as get_public_profile, looked up by username. The
-- wallet_address in the response is what the page uses to list startups.
create or replace function public.get_public_profile_by_username(name text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wallet_address', p.wallet_address,
    'username', p.username,
    'display_name', p.display_name,
    'job_title', p.job_title,
    'avatar', p.avatar,
    'bio', p.bio,
    'twitter_handle', p.twitter_handle,
    'telegram_handle', p.telegram_handle,
    'joined_at', p.joined_at
  )
  from public.profiles p
  where p.username = lower(name);
$$;

-- The wallet lookup and the team profiles now also expose the username, so
-- profile links across the app can prefer /<username> when it exists.
create or replace function public.get_public_profile(wallet text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wallet_address', p.wallet_address,
    'username', p.username,
    'display_name', p.display_name,
    'job_title', p.job_title,
    'avatar', p.avatar,
    'bio', p.bio,
    'twitter_handle', p.twitter_handle,
    'telegram_handle', p.telegram_handle,
    'joined_at', p.joined_at
  )
  from public.profiles p
  where p.wallet_address = wallet;
$$;

create or replace function public.get_startup_team_profiles(startup_id uuid)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wallet_address', p.wallet_address,
    'username', p.username,
    'display_name', p.display_name,
    'job_title', p.job_title,
    'avatar', p.avatar,
    'bio', p.bio,
    'twitter_handle', p.twitter_handle,
    'telegram_handle', p.telegram_handle,
    'joined_at', p.joined_at
  )
  from public.startups s
  join public.profiles owner_p on owner_p.id = s.owner_profile_id
  join public.profiles p
    on p.id = s.owner_profile_id
    or p.wallet_address in (select jsonb_array_elements(s.team) ->> 'walletAddress')
  where s.id = startup_id
    and (
      owner_p.auth_user_id = auth.uid()
      or (s.verification_status = 'verified' and s.listing_status = 'published')
    );
$$;

revoke all on function public.get_public_profile_by_username(text) from public, anon;
grant execute on function public.get_public_profile_by_username(text) to anon, authenticated;
