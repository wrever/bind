-- Keel — minimal persistence for demo sessions + claims audit (hackathon)
-- Apply via Supabase SQL editor or MCP supabase-keel when authenticated.

create extension if not exists "pgcrypto";

-- Demo / partner API sessions (policy vault off-chain state)
create table if not exists public.keel_sessions (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists keel_sessions_updated_at_idx
  on public.keel_sessions (updated_at desc);

-- Immutable-ish audit of claims / ops actions (partner transparency)
create table if not exists public.keel_claim_events (
  id uuid primary key default gen_random_uuid(),
  session_id text references public.keel_sessions (id) on delete cascade,
  action text not null,
  actor text,
  lot_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists keel_claim_events_session_idx
  on public.keel_claim_events (session_id, created_at desc);

-- Optional PoR snapshots for public solvency page
create table if not exists public.keel_por_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  network text not null default 'demo',
  vault_usdc numeric,
  supply numeric,
  fully_backed boolean,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS: service role bypasses; anon read for public PoR only (tighten in prod)
alter table public.keel_sessions enable row level security;
alter table public.keel_claim_events enable row level security;
alter table public.keel_por_snapshots enable row level security;

-- Demo: allow service role full access via key; no public write policies.
-- Public read of latest PoR snapshots (optional — disable if private).
drop policy if exists keel_por_public_read on public.keel_por_snapshots;
create policy keel_por_public_read
  on public.keel_por_snapshots
  for select
  using (true);

comment on table public.keel_sessions is 'Keel demo session state (covered balances engine)';
comment on table public.keel_claim_events is 'Audit log for transfer-insurance claims / ops';
