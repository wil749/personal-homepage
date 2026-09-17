# 访客留言功能 · 从零接入指南（V3.1）

这份文档带你从「还没有 Supabase 账号」走到「访客能留言、你在后台能看」。

按顺序做完 **五个步骤** 即可，全程大约 15 分钟，用免费额度就够。

---

## 一、这次新增了什么

| 文件 | 作用 |
| --- | --- |
| `outputs/wyw个人主页-V3.1.html` | 主页新版本，在「联系」下方新增 **留言 · FEEDBACK** 板块 |
| `outputs/admin.html` | 站内后台，登录后查看 / 标已读 / 隐藏 / 删除留言 |
| `outputs/supabase-setup.sql` | 一次性建库脚本，复制到 Supabase 里执行 |

三个核心特点：

1. **留言不公开** —— 访客只能「提交」，任何人（包括拿到 anon key 的人）都读不到留言内容，只有登录后台的你才能看。
2. **自带演示模式** —— 还没填凭证时页面照常可用，留言暂存在访客本机浏览器，不会报错、不会白屏。
3. **无后端服务器** —— 纯静态页面 + Supabase，可以直接丢到 GitHub Pages / Vercel / 宝塔等任何地方托管。

工作流程：

```
访客在主页填表
      ↓  （anon 密钥，只能插入）
Supabase 数据库 public.guestbook 表
      ↓  （只有登录的你能读）
你在 admin.html 后台查看、标已读、隐藏、删除
```

---

## 二、开始之前

- 一个能收邮件的邮箱（注册 Supabase 用）
- 已经能打开 `outputs/wyw个人主页-V3.1.html`
- 网络能访问 `supabase.com` 和 `cdn.jsdelivr.net`（页面加载 Supabase 客户端用）

---

## 步骤 1 · 注册 Supabase 并创建项目

1. 打开 <https://supabase.com> ，点右上角 **Start your project**，用邮箱或 GitHub 注册登录（免费）。
2. 进入控制台后点 **New project**，填写：

   | 字段 | 建议填写 |
   | --- | --- |
   | Organization | 用默认的，或自己新建一个 |
   | Name | `wil-homepage`（随便起） |
   | Database Password | 点 **Generate a password** 生成，**复制保存好**（后面基本用不到，但别丢） |
   | Region | 选 **Southeast Asia (Singapore)** —— 离国内最近，速度最快 |
   | Pricing Plan | **Free** |

3. 点 **Create new project**，等 1～2 分钟，等它把数据库准备好。

> 免费版给 500MB 数据库、5 万月活用户。留言这种文字数据，几千条也就几百 KB，完全用不完。

---

## 步骤 2 · 建表（执行建库脚本）

这是最关键的一步，「留言只给你自己看」就是在这里定下来的。

1. 在左侧菜单点 **SQL Editor**（图标像一张纸带 `>_`）。
2. 点 **New query**。
3. 打开本项目的 `outputs/supabase-setup.sql`，**全选复制**，粘贴到编辑器里。
4. 点右下角 **Run**（或按 `Ctrl + Enter`）。
5. 出现 **Success. No rows returned** 就成功了。

脚本一共做了 5 件事：

- 建 `public.guestbook` 留言表（含长度限制，防止有人塞超长内容）
- 建时间索引（后台按时间倒序读取更快）
- 开启 **RLS 行级安全**
- 写入 4 条策略：**任何人可插入**、**只有登录者可读 / 改 / 删**
- （可选）开启实时推送，后台开着时新留言会自动出现

想验证一下？在 SQL Editor 里执行：

```sql
select policyname, cmd from pg_policies where tablename = 'guestbook';
```

应该看到 4 行策略，其中只有 `INSERT` 一行是给 `anon` 的。

---

## 步骤 3 · 创建管理员账号，并关闭公开注册

**⚠️ 这一步千万别跳过。** 如果不关闭公开注册，任何人都能自己注册一个账号，然后通过 API 读取你的全部留言。

### 3.1 创建你自己的账号

1. 左侧菜单 → **Authentication** → **Users**。
2. 点右上角 **Add user** → **Create new user**。
3. 填你的邮箱和密码（例如 `你的邮箱 + 一个强密码`），勾选 **Auto Confirm User**，保存。
4. 记下这组邮箱密码 —— 这就是你登录 `admin.html` 的账号。

### 3.2 关闭公开注册

1. 左侧菜单 → **Authentication** → **Sign In / Providers**（部分界面叫 **Providers**）。
2. 找到 **Email** 提供商，展开。
3. 关闭 **Allow new users to sign up**（允许新用户注册）。
4. 保存。

这样一来，全世界只有你在 3.1 里手动创建的那个账号能登录，也只有它能读留言。

---

## 步骤 4 · 复制凭证，填进两个文件

### 4.1 找到凭证

1. 左侧菜单 → **Project Settings**（齿轮图标）→ **API Keys**。
2. 复制这两项：

   | 名称 | 长什么样 |
   | --- | --- |
   | **Project URL** | `https://abcdefghijklmn.supabase.co` |
   | **anon / public** key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....`（很长一串，可能显示为 `sb_publishable_...`，新版控制台两者都可用） |

   > **常见困惑：为什么把密钥放在网页里也安全？**
   > anon key 本来就是设计成公开的，它只是一个「身份标签」，不代表权限。
   > 真正的权限由数据库的 RLS 策略决定 —— 我们上面已经限制成「anon 只能插入，不能读」。
   > 千万不要把 `service_role` key 放进网页，那把是万能钥匙。

### 4.2 填进主页

用记事本或 VS Code 打开 `outputs/wyw个人主页-V3.1.html`，搜索 `SUPABASE_URL`，找到脚本开头这一段：

```js
    const SUPABASE_URL = "";
    const SUPABASE_ANON_KEY = "";
    const GUESTBOOK_TABLE = "guestbook";
```

改成（把引号里的内容换成你自己的）：

```js
    const SUPABASE_URL = "https://abcdefghijklmn.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....";
    const GUESTBOOK_TABLE = "guestbook";
```

保存。

### 4.3 填进后台

打开 `outputs/admin.html`，**拉到文件最底部**，在 `<script>` 里找到同样的一段（注释写着「后台配置」），把两个值改成一样的。

保存。

> 两个文件必须填同一组凭证，否则主页能提交、后台却读不到。

---

## 步骤 5 · 验证

1. 用浏览器打开 `outputs/wyw个人主页-V3.1.html`。
2. 滚到最下面的 **留言 · FEEDBACK** 板块，右侧状态标签应该显示绿点 **「已连接数据库 · 留言实时送达」**。
   - 如果显示黄点「演示模式 · 尚未接入数据库」，说明凭证没填对，回去检查步骤 4。
3. 随便用个昵称和内容提交一条留言。
4. 打开 `outputs/admin.html`，用步骤 3.1 创建的邮箱密码登录。
5. 应该能看到刚才那条留言，并且 **未读** 数字是 1。

恭喜，全流程打通了。

---

## 验收清单

| 检查项 | 期望结果 |
| --- | --- |
| 主页留言区状态 | 绿点「已连接数据库」 |
| 提交留言 | 显示「已收到」，不再提示演示模式 |
| Supabase → Table Editor → `guestbook` | 能看到刚提交的记录 |
| admin.html 登录 | 能进入列表，看到统计数字 |
| 后台标为已读 / 隐藏 / 删除 | 立刻生效，刷新后仍然保持 |
| **安全自测**：退出登录后刷新 admin.html | 只看到登录框，看不到任何留言 |

---

## 部署到线上

三个文件（`wyw个人主页-V3.1.html`、`admin.html`，以及原来的 `wyw个人主页-projects.html`、`wyw个人主页-skills.html`）放在同一个目录下，相对链接就能正常工作。

- **GitHub Pages**：把 `outputs/` 里的文件推到仓库，Settings → Pages 选分支即可。
- **Vercel / Netlify**：直接拖拽 `outputs/` 文件夹上传。
- **本地测试**：在本目录执行 `python -m http.server 8000`，然后访问 <http://localhost:8000/outputs/wyw个人主页-V3.1.html>。

> `admin.html` 是公开可访问的 URL，但**没有登录就什么都读不到**，所以不必刻意隐藏路径。
> 想更保险，可以在托管平台给 `admin.html` 加一道访问密码（Cloudflare Access、Vercel Password Protection 等）。

---

## 常见问题

**Q：留言一定要公开显示吗？**
不用。当前默认就是私密的。如果以后想要公开留言墙，只需要：新增一条 `for select to anon using (is_hidden = false)` 策略，再在主页加一段读取代码 —— 但要注意，那样等于把留言内容暴露给所有访客。

**Q：演示模式下存的留言，接入后会自动同步到数据库吗？**
不会。演示模式的留言只存在访客自己的浏览器里（`localStorage` 的 `wil_guestbook_demo`）。它只是让你在配置前先把页面跑起来看效果。

**Q：访客会看到什么错误提示吗？**
不会。数据库暂时不可用时，访客会看到「留言已收到」的友好提示，同时内容暂存在本机；只有你自己在后台看不到而已。状态标签此时会变成灰点「数据库暂时连不上」。

**Q：会不会被人恶意刷留言？**
现在已经有三层基础防护：话题按钮限制、蜜罐字段（机器人填了就直接丢弃）、同一浏览器 60 秒冷却。如果真被刷，可以：
1. Supabase 控制台 → **Project Settings → API** 里调低速率限制；
2. 用 **Edge Functions** 把插入逻辑挪到服务端，加 IP 限流；
3. 直接在 `admin.html` 里一键隐藏/删除。

**Q：忘了管理员密码怎么办？**
Supabase → Authentication → Users → 找到你的账号 → 右侧菜单 **Reset password** 或直接重新创建一个新用户。

**Q：能收到邮件提醒吗？**
Supabase 自带邮件额度有限，更稳的做法是用 **Database Webhooks** 或 **Edge Function** 在插入时调一个第三方通知（比如飞书机器人），需要时再加。

---

## 安全红线（请务必遵守）

1. **绝不要**把 `service_role` key 写进任何 HTML 文件。
2. **务必关闭**「Allow new users to sign up」，否则等于把后台钥匙挂在大门上。
3. 不要在留言表上给 `anon` 添加 `select` 策略 —— 那就等于公开了所有留言。
4. `admin.html` 的登录密码不要和别的网站重复。

---

## 附：涉及的技术细节

| 项目 | 说明 |
| --- | --- |
| 数据表 | `public.guestbook` |
| 字段 | `id`、`created_at`、`name`、`contact`、`message`、`mood`、`lang`、`page`、`is_read`、`is_hidden` |
| 客户端 | `@supabase/supabase-js` v2（从 jsDelivr CDN 按需加载） |
| 主页提交方式 | `supabase.from('guestbook').insert(row)` |
| 后台读取方式 | `select` + `update` + `delete`，依赖已登录会话 |
| 演示模式存储键 | `wil_guestbook_demo`（留言）、`wil_fb_last`（冷却时间） |
