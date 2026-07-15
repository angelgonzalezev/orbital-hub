-- Where the startup is from (city + country), captured with coordinates at
-- input time so a future world map never needs to geocode after the fact.
-- Columns stay nullable: pre-existing startups have no location and the
-- requirement is enforced by app-level validation when they are next edited.
alter table public.startups
  add column city text,
  add column country text,
  add column country_code text,
  add column latitude double precision,
  add column longitude double precision;

-- Column grants are additive: granting only the new columns extends the
-- column-limited update grant from the initial schema.
grant update (city, country, country_code, latitude, longitude)
  on public.startups to authenticated;
