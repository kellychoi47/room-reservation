alter table public.profiles add column if not exists is_active boolean not null default true;
alter table public.rooms add column if not exists building_name text;
alter table public.rooms add column if not exists floor text;
alter table public.rooms add column if not exists room_number text;
alter table public.rooms add column if not exists floor_plan_id uuid;
alter table public.rooms add column if not exists map_x numeric(5,2);
alter table public.rooms add column if not exists map_y numeric(5,2);

create table if not exists public.floor_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  building_name text not null,
  floor text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rooms add constraint rooms_floor_plan_id_fkey foreign key (floor_plan_id) references public.floor_plans(id) on delete set null;
create index if not exists rooms_floor_plan_idx on public.rooms(floor_plan_id);
alter table public.floor_plans enable row level security;
create policy "floor plans readable" on public.floor_plans for select to authenticated using (true);

insert into storage.buckets (id, name, public) values ('floor-plans', 'floor-plans', true) on conflict (id) do nothing;

update public.rooms
set building_name = coalesce(building_name, split_part(location, '·', 1)),
    floor = coalesce(floor, nullif(trim(split_part(location, '·', 2)), '')),
    room_number = coalesce(room_number, name)
where building_name is null or room_number is null;

create or replace function public.touch_floor_plan() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists floor_plans_touch_updated_at on public.floor_plans;
create trigger floor_plans_touch_updated_at before update on public.floor_plans for each row execute procedure public.touch_floor_plan();
