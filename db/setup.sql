-- Run once in the Supabase SQL editor of a new project (see SETUP.md).
create table public.groups (code text primary key check (length(code) between 4 and 20) check (code = upper(trim(code))), open boolean not null default true);
create table public.submissions (
  id uuid primary key, group_code text not null references public.groups on delete cascade,
  name text not null, name_key text not null, quiz text not null, part text not null,
  answers jsonb not null, results jsonb not null, checked_at timestamptz not null, received_at timestamptz not null default now());
create table public.marks (
  group_code text not null references public.groups on delete cascade, name_key text not null, quiz text not null, qid text not null,
  points numeric not null check (points >= 0), answer text not null, primary key (group_code, name_key, quiz, qid));
create table public.teachers (user_id uuid primary key references auth.users on delete cascade);

alter table public.groups enable row level security;
alter table public.submissions enable row level security;
alter table public.marks enable row level security;
alter table public.teachers enable row level security;

create function public.is_teacher() returns boolean language sql security definer set search_path = '' stable
as $$ select exists (select 1 from public.teachers where user_id = auth.uid()) $$;
create policy teacher_all on public.groups for all to authenticated using (public.is_teacher()) with check (public.is_teacher());
create policy teacher_all on public.submissions for all to authenticated using (public.is_teacher()) with check (public.is_teacher());
create policy teacher_all on public.marks for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create function public.check_group(p_code text) returns boolean language sql security definer set search_path = '' stable
as $$ select exists (select 1 from public.groups where code = upper(trim(p_code)) and open) $$;

create function public.submit(p_id uuid, p_code text, p_name text, p_quiz text, p_part text,
  p_answers jsonb, p_results jsonb, p_checked_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare v_name text := trim(regexp_replace(p_name, '\s+', ' ', 'g'));
begin
  if not public.check_group(p_code) then raise exception 'bad_group'; end if;
  if p_quiz is null or p_part is null or p_answers is null or p_results is null
     or p_checked_at is null or p_checked_at < '2026-01-01'
     or coalesce(length(v_name), 0) not between 1 and 60 or length(p_quiz) > 40 or length(p_part) > 20
     or length(p_answers::text) > 20000 or length(p_results::text) > 2000 then raise exception 'bad_input'; end if;
  insert into public.submissions (id, group_code, name, name_key, quiz, part, answers, results, checked_at)
  values (p_id, upper(trim(p_code)), v_name, lower(v_name), p_quiz, p_part, p_answers, p_results, least(p_checked_at, now()))
  on conflict (id) do nothing;
end $$;

-- Explicit privileges, whatever the project's defaults are. Row-level security still limits `authenticated` to teachers.
-- Students (anon) get no table access: they only call check_group and submit.
revoke all on public.groups, public.submissions, public.marks, public.teachers from anon, authenticated;
grant select, insert, update, delete on public.groups, public.submissions, public.marks to authenticated;
revoke execute on function public.is_teacher() from public, anon;
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.check_group(text),
  public.submit(uuid, text, text, text, text, jsonb, jsonb, timestamptz) to anon, authenticated;
