begin;
select plan(3);

-- Seed fixtures: startup '...0001' (published) belongs to profile '...0001'.

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

update public.startups
set city = 'Madrid',
    country = 'Spain',
    country_code = 'ES',
    latitude = 40.416782,
    longitude = -3.703507
where id = '20000000-0000-4000-8000-000000000001';

select is(
  (
    select city || '|' || country || '|' || country_code
    from public.startups
    where id = '20000000-0000-4000-8000-000000000001'
  ),
  'Madrid|Spain|ES',
  'the owner can update the location columns'
);

select is(
  (
    select value->>'city'
    from public.list_published_startups() as value
    where value->>'id' = '20000000-0000-4000-8000-000000000001'
  ),
  'Madrid',
  'list_published_startups exposes the city'
);

select is(
  (
    select (value->>'latitude')::numeric
    from public.list_published_startups() as value
    where value->>'id' = '20000000-0000-4000-8000-000000000001'
  ),
  40.416782,
  'list_published_startups exposes the coordinates'
);

select * from finish();
rollback;
