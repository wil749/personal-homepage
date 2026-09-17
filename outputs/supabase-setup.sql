-- ============================================================================
--  WIL 个人主页 V3.1 · 访客留言表（guestbook）
--  ---------------------------------------------------------------------------
--  用法：Supabase 控制台 → 左侧 SQL Editor → New query
--        把本文件全部内容粘贴进去 → 点 Run（或 Ctrl+Enter）
--  执行一次即可，可重复执行（已存在时会自动跳过 / 覆盖策略）。
--
--  设计说明：
--    · 任何人都能「提交」留言，但不能读取
--    · 只有登录的管理员（你）能「读取 / 修改 / 删除」留言
--    · 因此留言天然是私密的，永远不会出现在网页上
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) 建表
-- ---------------------------------------------------------------------------
create table if not exists public.guestbook (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text        not null check (char_length(name) between 1 and 40),
  contact     text                 check (contact is null or char_length(contact) <= 120),
  message     text        not null check (char_length(message) between 2 and 1000),
  mood        text                 check (mood is null or mood in ('paint','dance','photo','music','bci','chat')),
  lang        text                 check (lang is null or lang in ('zh','en')),
  page        text,
  is_read     boolean     not null default false,
  is_hidden   boolean     not null default false
);

comment on table  public.guestbook            is '个人主页访客留言（仅作者可见）';
comment on column public.guestbook.mood       is '访客选的话题 key，对应主页的 fbMoods';
comment on column public.guestbook.is_read    is '作者是否已读';
comment on column public.guestbook.is_hidden  is '作者是否隐藏（软删除）';


-- ---------------------------------------------------------------------------
-- 2) 索引：后台按时间倒序读取，量大时更快
-- ---------------------------------------------------------------------------
create index if not exists guestbook_created_at_idx on public.guestbook (created_at desc);


-- ---------------------------------------------------------------------------
-- 3) 开启行级安全（RLS）——「私密留言」的关键，别跳过
-- ---------------------------------------------------------------------------
alter table public.guestbook enable row level security;


-- ---------------------------------------------------------------------------
-- 4) 权限策略
-- ---------------------------------------------------------------------------

-- 4.1 任何人（未登录的访客）都可以提交留言
--     但强制 is_read / is_hidden 为 false，防止有人直接塞一条「已隐藏」的留言
drop policy if exists "guestbook: anyone can submit" on public.guestbook;
create policy "guestbook: anyone can submit"
  on public.guestbook
  for insert
  to anon, authenticated
  with check (is_read = false and is_hidden = false);

-- 4.2 只有登录的你，才能读取留言
drop policy if exists "guestbook: author can read" on public.guestbook;
create policy "guestbook: author can read"
  on public.guestbook
  for select
  to authenticated
  using (true);

-- 4.3 只有登录的你，才能修改留言（标为已读 / 隐藏）
drop policy if exists "guestbook: author can update" on public.guestbook;
create policy "guestbook: author can update"
  on public.guestbook
  for update
  to authenticated
  using (true)
  with check (true);

-- 4.4 只有登录的你，才能删除留言
drop policy if exists "guestbook: author can delete" on public.guestbook;
create policy "guestbook: author can delete"
  on public.guestbook
  for delete
  to authenticated
  using (true);


-- ---------------------------------------------------------------------------
-- 5)（可选）开启实时推送：admin.html 开着的时候，新留言会自动冒出来
--     失败不影响使用，后台点「刷新」也能看到
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
      from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'guestbook'
  ) then
    alter publication supabase_realtime add table public.guestbook;
  end if;
exception when others then
  raise notice 'Realtime 未开启（可忽略，不影响留言功能）：%', sqlerrm;
end $$;


-- ---------------------------------------------------------------------------
-- 6) 自检：下面这句只是给你自己看的，执行后应该看到 4 条策略 + 1 张表
-- ---------------------------------------------------------------------------
-- select policyname, cmd, roles from pg_policies where tablename = 'guestbook';
-- select count(*) as 留言总数 from public.guestbook;
