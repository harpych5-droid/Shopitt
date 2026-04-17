-- ============================================================
-- SHOPITT — Supabase Schema
-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/gbdcgpfcshyteeczrgdv/sql/new
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── user_profiles ──────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  email         text,
  avatar_url    text,
  bio           text default '',
  country       text,
  verified      boolean default false,
  is_seller     boolean default false,
  followers_count integer default 0,
  following_count integer default 0,
  posts_count   integer default 0,
  sold_count    integer default 0,
  rating        numeric(3,1) default 4.5,
  wallet_balance numeric(12,2) default 0,
  created_at    timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "public read profiles" on public.user_profiles
  for select using (true);
create policy "owner update profile" on public.user_profiles
  for update using (auth.uid() = id);
create policy "owner insert profile" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "owner delete profile" on public.user_profiles
  for delete using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, email, username, avatar_url, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── posts ──────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.user_profiles(id) on delete cascade,
  post_type       text not null default 'product' check (post_type in ('product','video','service')),
  drop_title      text,
  description     text,
  price_text      text,
  price_num       numeric(10,2) default 0,
  currency        text default 'ZMW',
  quantity        integer default 1,
  quantity_sold   integer default 0,
  category        text,
  hashtags        text[] default '{}',
  media_urls      text[] default '{}',
  delivery_type   text default 'country' check (delivery_type in ('local','country','international')),
  courier_type    text default 'self' check (courier_type in ('self','platform')),
  free_delivery   boolean default true,
  likes_count     integer default 0,
  comments_count  integer default 0,
  saves_count     integer default 0,
  views_count     integer default 0,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.posts enable row level security;

create policy "public read active posts" on public.posts
  for select using (is_active = true);
create policy "owner insert post" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "owner update post" on public.posts
  for update using (auth.uid() = user_id);
create policy "owner delete post" on public.posts
  for delete using (auth.uid() = user_id);

-- ─── post_likes ─────────────────────────────────────────────────────────────
create table if not exists public.post_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

alter table public.post_likes enable row level security;
create policy "public read post_likes" on public.post_likes for select using (true);
create policy "auth insert post_likes" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "auth delete post_likes" on public.post_likes for delete using (auth.uid() = user_id);

-- ─── post_saves ─────────────────────────────────────────────────────────────
create table if not exists public.post_saves (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

alter table public.post_saves enable row level security;
create policy "auth manage own saves" on public.post_saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── post_views ─────────────────────────────────────────────────────────────
create table if not exists public.post_views (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.user_profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.post_views enable row level security;
create policy "public insert post_views" on public.post_views for insert with check (true);
create policy "auth read own views" on public.post_views for select using (user_id = auth.uid());

-- ─── comments ───────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references public.user_profiles(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade,
  text        text not null,
  likes_count integer default 0,
  is_pinned   boolean default false,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;
create policy "public read comments" on public.comments for select using (true);
create policy "auth insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "auth update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "auth delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- ─── comment_likes ──────────────────────────────────────────────────────────
create table if not exists public.comment_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, comment_id)
);

alter table public.comment_likes enable row level security;
create policy "auth manage comment_likes" on public.comment_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── follows ────────────────────────────────────────────────────────────────
create table if not exists public.follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references public.user_profiles(id) on delete cascade,
  following_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "public read follows" on public.follows for select using (true);
create policy "auth insert follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "auth delete follows" on public.follows for delete using (auth.uid() = follower_id);

-- ─── conversations ───────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  participant_1   uuid not null references public.user_profiles(id) on delete cascade,
  participant_2   uuid not null references public.user_profiles(id) on delete cascade,
  last_message    text,
  last_message_at timestamptz default now(),
  unread_1        integer default 0,
  unread_2        integer default 0,
  created_at      timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "auth read own convos" on public.conversations for select
  using (participant_1 = auth.uid() or participant_2 = auth.uid());
create policy "auth insert convos" on public.conversations for insert
  with check (participant_1 = auth.uid() or participant_2 = auth.uid());
create policy "auth update convos" on public.conversations for update
  using (participant_1 = auth.uid() or participant_2 = auth.uid());

-- ─── messages ───────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.user_profiles(id) on delete cascade,
  text            text not null,
  read            boolean default false,
  created_at      timestamptz default now()
);

alter table public.messages enable row level security;
create policy "auth read messages in own convos" on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );
create policy "auth insert messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "auth update messages" on public.messages for update using (auth.uid() = sender_id);

-- ─── orders ─────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique default ('SHP-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 8))),
  buyer_id         uuid not null references public.user_profiles(id) on delete cascade,
  seller_id        uuid not null references public.user_profiles(id) on delete cascade,
  post_id          uuid references public.posts(id) on delete set null,
  items            jsonb not null default '[]',
  delivery_address jsonb,
  payment_method   text default 'mobilemoney',
  subtotal         numeric(10,2) default 0,
  total            numeric(10,2) default 0,
  currency         text default 'ZMW',
  status           text default 'new' check (status in ('new','pending','confirmed','shipped','delivered')),
  delivery_type    text default 'country',
  estimated_delivery text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table public.orders enable row level security;
create policy "auth read own orders" on public.orders for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "auth insert orders" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "auth update orders" on public.orders for update
  using (seller_id = auth.uid() or buyer_id = auth.uid());

-- ─── user_addresses ─────────────────────────────────────────────────────────
create table if not exists public.user_addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.user_profiles(id) on delete cascade,
  full_name  text not null,
  phone      text not null,
  country    text not null,
  city       text not null,
  address    text not null,
  notes      text,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.user_addresses enable row level security;
create policy "auth manage own addresses" on public.user_addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── notifications ──────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.user_profiles(id) on delete cascade,
  type         text not null check (type in ('like','comment','order','message','follow')),
  title        text not null,
  body         text not null,
  related_id   uuid,
  related_type text,
  read         boolean default false,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "auth read own notifs" on public.notifications for select using (auth.uid() = user_id);
create policy "auth insert notifs" on public.notifications for insert with check (true);
create policy "auth update own notifs" on public.notifications for update using (auth.uid() = user_id);

-- ─── wallet_transactions ────────────────────────────────────────────────────
create table if not exists public.wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.user_profiles(id) on delete cascade,
  type        text not null check (type in ('credit','withdrawal','commission')),
  amount      numeric(10,2) not null,
  description text,
  order_id    uuid references public.orders(id) on delete set null,
  status      text default 'completed' check (status in ('pending','completed','failed')),
  created_at  timestamptz default now()
);

alter table public.wallet_transactions enable row level security;
create policy "auth manage own wallet" on public.wallet_transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Triggers: update counts ─────────────────────────────────────────────────

-- posts_count on user_profiles
create or replace function public.update_posts_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.user_profiles set posts_count = posts_count + 1 where id = new.user_id;
  elsif TG_OP = 'DELETE' then
    update public.user_profiles set posts_count = greatest(0, posts_count - 1) where id = old.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_post_change on public.posts;
create trigger on_post_change
  after insert or delete on public.posts
  for each row execute procedure public.update_posts_count();

-- likes_count on posts
create or replace function public.update_post_likes_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_post_like_change on public.post_likes;
create trigger on_post_like_change
  after insert or delete on public.post_likes
  for each row execute procedure public.update_post_likes_count();

-- followers/following count
create or replace function public.update_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.user_profiles set followers_count = followers_count + 1 where id = new.following_id;
    update public.user_profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif TG_OP = 'DELETE' then
    update public.user_profiles set followers_count = greatest(0, followers_count - 1) where id = old.following_id;
    update public.user_profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_follow_change on public.follows;
create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute procedure public.update_follow_counts();

-- ─── Full-text search index on posts ────────────────────────────────────────
create index if not exists posts_search_idx on public.posts
  using gin (to_tsvector('english', coalesce(drop_title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(category,'')));
