-- ============================================================
-- Shopitt — External Supabase Schema
-- Project: https://gbdcgpfcshyteeczrgdv.supabase.co
-- Run this entire file in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/gbdcgpfcshyteeczrgdv/sql/new
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── user_profiles ───────────────────────────────────────────
create table if not exists public.user_profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  username      text,
  email         text,
  avatar_url    text,
  country       text,
  bio           text        default '',
  display_name  text,
  verified      boolean     default false,
  followers_count integer   default 0,
  following_count integer   default 0,
  posts_count   integer     default 0,
  sold_count    integer     default 0,
  rating        numeric(3,1) default 4.5,
  is_seller     boolean     default false,
  wallet_balance numeric(12,2) default 0
);

-- Auto-create profile on every new sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, username, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── posts ───────────────────────────────────────────────────
create table if not exists public.posts (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.user_profiles(id) on delete cascade,
  post_type      text        not null default 'product',
  drop_title     text,
  description    text,
  price_text     text,
  price_num      numeric(10,2) default 0,
  currency       text        default 'ZMW',
  quantity       integer     default 1,
  quantity_sold  integer     default 0,
  category       text,
  hashtags       text[]      default '{}',
  media_urls     text[]      default '{}',
  delivery_type  text        default 'country',
  courier_type   text        default 'self',
  free_delivery  boolean     default true,
  likes_count    integer     default 0,
  comments_count integer     default 0,
  saves_count    integer     default 0,
  views_count    integer     default 0,
  is_active      boolean     default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── post_likes ──────────────────────────────────────────────
create table if not exists public.post_likes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.user_profiles(id) on delete cascade,
  post_id    uuid        not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- ─── post_saves ──────────────────────────────────────────────
create table if not exists public.post_saves (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.user_profiles(id) on delete cascade,
  post_id    uuid        not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- ─── post_views ──────────────────────────────────────────────
create table if not exists public.post_views (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references public.user_profiles(id) on delete cascade,
  post_id    uuid        not null references public.posts(id) on delete cascade,
  created_at timestamptz default now()
);

-- ─── comments ────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid        primary key default gen_random_uuid(),
  post_id     uuid        not null references public.posts(id) on delete cascade,
  user_id     uuid        not null references public.user_profiles(id) on delete cascade,
  parent_id   uuid        references public.comments(id) on delete cascade,
  text        text        not null,
  likes_count integer     default 0,
  is_pinned   boolean     default false,
  created_at  timestamptz default now()
);

-- ─── comment_likes ───────────────────────────────────────────
create table if not exists public.comment_likes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.user_profiles(id) on delete cascade,
  comment_id uuid        not null references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, comment_id)
);

-- ─── follows ─────────────────────────────────────────────────
create table if not exists public.follows (
  id           uuid        primary key default gen_random_uuid(),
  follower_id  uuid        not null references public.user_profiles(id) on delete cascade,
  following_id uuid        not null references public.user_profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  unique(follower_id, following_id)
);

-- ─── conversations ────────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid        primary key default gen_random_uuid(),
  participant_1   uuid        not null references public.user_profiles(id) on delete cascade,
  participant_2   uuid        not null references public.user_profiles(id) on delete cascade,
  last_message    text,
  last_message_at timestamptz default now(),
  unread_1        integer     default 0,
  unread_2        integer     default 0,
  created_at      timestamptz default now()
);

-- ─── messages ────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid        primary key default gen_random_uuid(),
  conversation_id uuid        not null references public.conversations(id) on delete cascade,
  sender_id       uuid        not null references public.user_profiles(id) on delete cascade,
  text            text        not null,
  read            boolean     default false,
  created_at      timestamptz default now()
);

-- ─── orders ──────────────────────────────────────────────────
create table if not exists public.orders (
  id                uuid        primary key default gen_random_uuid(),
  order_number      text        unique not null
    default ('SHP-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 8))),
  buyer_id          uuid        not null references public.user_profiles(id) on delete cascade,
  seller_id         uuid        not null references public.user_profiles(id) on delete cascade,
  post_id           uuid        references public.posts(id) on delete set null,
  items             jsonb       not null default '[]',
  delivery_address  jsonb,
  payment_method    text        default 'mobilemoney',
  subtotal          numeric(10,2) default 0,
  total             numeric(10,2) default 0,
  currency          text        default 'ZMW',
  status            text        default 'new',
  delivery_type     text        default 'country',
  estimated_delivery text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─── notifications ───────────────────────────────────────────
create table if not exists public.notifications (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.user_profiles(id) on delete cascade,
  type         text        not null,
  title        text        not null,
  body         text        not null,
  related_id   uuid,
  related_type text,
  read         boolean     default false,
  avatar_url   text,
  created_at   timestamptz default now()
);

-- ─── wallet_transactions ─────────────────────────────────────
create table if not exists public.wallet_transactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.user_profiles(id) on delete cascade,
  type        text        not null,  -- 'credit' | 'debit' | 'withdrawal' | 'commission'
  amount      numeric(10,2) not null,
  description text,
  order_id    uuid        references public.orders(id) on delete set null,
  status      text        default 'completed',  -- 'completed' | 'pending' | 'failed'
  created_at  timestamptz default now()
);

-- ─── user_addresses ──────────────────────────────────────────
create table if not exists public.user_addresses (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.user_profiles(id) on delete cascade,
  full_name  text        not null,
  phone      text        not null,
  country    text        not null,
  city       text        not null,
  address    text        not null,
  notes      text,
  is_default boolean     default false,
  created_at timestamptz default now()
);

-- ─── RLS: user_profiles ──────────────────────────────────────
alter table public.user_profiles enable row level security;

create policy if not exists "anon_view_profiles"
  on public.user_profiles for select using (true);

create policy if not exists "auth_update_own_profile"
  on public.user_profiles for update to authenticated using (auth.uid() = id);

create policy if not exists "auth_insert_own_profile"
  on public.user_profiles for insert to authenticated with check (auth.uid() = id);

-- ─── RLS: posts ──────────────────────────────────────────────
alter table public.posts enable row level security;

create policy if not exists "anon_view_active_posts"
  on public.posts for select using (is_active = true);

create policy if not exists "auth_insert_own_posts"
  on public.posts for insert to authenticated with check (user_id = auth.uid());

create policy if not exists "auth_update_own_posts"
  on public.posts for update to authenticated using (user_id = auth.uid());

create policy if not exists "auth_delete_own_posts"
  on public.posts for delete to authenticated using (user_id = auth.uid());

-- ─── RLS: post_likes ─────────────────────────────────────────
alter table public.post_likes enable row level security;

create policy if not exists "anon_view_post_likes"
  on public.post_likes for select using (true);

create policy if not exists "auth_manage_post_likes"
  on public.post_likes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── RLS: post_saves ─────────────────────────────────────────
alter table public.post_saves enable row level security;

create policy if not exists "auth_manage_own_saves"
  on public.post_saves for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── RLS: post_views ─────────────────────────────────────────
alter table public.post_views enable row level security;

create policy if not exists "anon_insert_views"
  on public.post_views for insert with check (true);

create policy if not exists "auth_select_views"
  on public.post_views for select to authenticated using (user_id = auth.uid());

-- ─── RLS: comments ───────────────────────────────────────────
alter table public.comments enable row level security;

create policy if not exists "anon_view_comments"
  on public.comments for select using (true);

create policy if not exists "auth_insert_comments"
  on public.comments for insert to authenticated with check (user_id = auth.uid());

create policy if not exists "auth_update_own_comments"
  on public.comments for update to authenticated using (user_id = auth.uid());

create policy if not exists "auth_delete_own_comments"
  on public.comments for delete to authenticated using (user_id = auth.uid());

-- ─── RLS: comment_likes ──────────────────────────────────────
alter table public.comment_likes enable row level security;

create policy if not exists "auth_manage_comment_likes"
  on public.comment_likes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── RLS: follows ────────────────────────────────────────────
alter table public.follows enable row level security;

create policy if not exists "anon_view_follows"
  on public.follows for select using (true);

create policy if not exists "auth_insert_follows"
  on public.follows for insert to authenticated with check (follower_id = auth.uid());

create policy if not exists "auth_delete_follows"
  on public.follows for delete to authenticated using (follower_id = auth.uid());

-- ─── RLS: conversations ──────────────────────────────────────
alter table public.conversations enable row level security;

create policy if not exists "auth_view_own_convos"
  on public.conversations for select to authenticated
  using (participant_1 = auth.uid() or participant_2 = auth.uid());

create policy if not exists "auth_insert_convos"
  on public.conversations for insert to authenticated
  with check (participant_1 = auth.uid() or participant_2 = auth.uid());

create policy if not exists "auth_update_convos"
  on public.conversations for update to authenticated
  using (participant_1 = auth.uid() or participant_2 = auth.uid());

-- ─── RLS: messages ───────────────────────────────────────────
alter table public.messages enable row level security;

create policy if not exists "auth_view_messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy if not exists "auth_insert_messages"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid());

-- ─── RLS: orders ─────────────────────────────────────────────
alter table public.orders enable row level security;

create policy if not exists "auth_view_own_orders"
  on public.orders for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy if not exists "auth_insert_orders"
  on public.orders for insert to authenticated
  with check (buyer_id = auth.uid());

create policy if not exists "auth_update_orders"
  on public.orders for update to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- ─── RLS: notifications ──────────────────────────────────────
alter table public.notifications enable row level security;

create policy if not exists "auth_view_own_notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

-- Allow any authenticated user to insert notifications (e.g. "you have a new order")
create policy if not exists "auth_insert_notifications"
  on public.notifications for insert to authenticated
  with check (true);

create policy if not exists "auth_update_own_notifications"
  on public.notifications for update to authenticated
  using (user_id = auth.uid());

-- ─── RLS: wallet_transactions ────────────────────────────────
alter table public.wallet_transactions enable row level security;

create policy if not exists "auth_manage_own_wallet"
  on public.wallet_transactions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Allow order creation trigger to insert wallet credits
create policy if not exists "auth_insert_wallet_any"
  on public.wallet_transactions for insert to authenticated
  with check (true);

-- ─── RLS: user_addresses ─────────────────────────────────────
alter table public.user_addresses enable row level security;

create policy if not exists "auth_manage_own_addresses"
  on public.user_addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── Enable Realtime (run separately if needed) ──────────────
-- In Supabase dashboard: Database > Replication > enable for messages + notifications
-- Or run:
-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.notifications;

-- ─── DONE ─────────────────────────────────────────────────────
-- Tables created. Schema is fully decoupled from OnSpace Cloud.
-- All auth goes through Supabase Auth.
-- All media goes through Cloudinary (cloud: ddyzz3hho, preset: shopitt_preset).
-- ─────────────────────────────────────────────────────────────
