---
name: push-to-github
description: |
  把当前工作区的改动安全地提交并推送到 GitHub 远程仓库（wil749/personal-homepage，私有）。
  自动拦截大文件、依赖目录和密钥泄露风险，并给出可复制的 git 命令。

  Triggers when user mentions:
  - "帮我推上去"
  - "备份到 GitHub"
  - "提交到 GitHub"
  - "推到 GitHub"
  - "push 一下"
metadata:
  author: "jwlhl"
---

# 个人主页 · 推送到 GitHub

用户说一句「帮我推上去」，就走完「检查 → 提交 → 推送 → 验证」，不需要用户自己敲命令。

## 仓库信息

| 项目 | 值 |
| --- | --- |
| 远程地址 | `https://github.com/wil749/personal-homepage`（私有） |
| 默认分支 | `main` |
| 提交作者 | `Wil <3944174406@qq.com>` |
| 仓库根目录 | 当前工作区根目录（含 `outputs/`、`docs/`、`素材/`、`wil-homepage/`） |
| 创建时间 | 2026-09 |

> 仓库最初创建时名字是 `-`，改成 `personal-homepage` 后 GitHub 会自动重定向旧地址，
> 因此本地 remote 即使暂时还写着旧名，推送也能成功（只是会带一条重定向警告）。

## 触发时机

用户说「推上去」「存到 GitHub」「备份一下」「提交代码」等，都走本流程。

## 标准流程

### 第 1 步 · 查看当前状态

```powershell
git status --short
git log --oneline -3
```

确认在正确的仓库里，且看清有哪些改动。

### 第 2 步 · 跑推送前检查（不要跳过）

```powershell
powershell -ExecutionPolicy Bypass -File ".opencode\skills\push-to-github\scripts\pre-push-check.ps1"
```

脚本会检查：

- git 是否可用、当前目录是否为仓库根
- 待提交的改动清单
- 是否有超过 50 MB 的文件（GitHub 单文件上限 100 MB，超过会拒收）
- 是否误把 `node_modules/`、`.deepworks/`、`_inspect/` 加进了版本控制
- 是否在准备提交的文件里扫到了 GitHub token、Supabase `service_role` 密钥或私钥

退出码 `1` 表示有必须修复的问题，**此时不要提交**，先解决再继续。

### 第 3 步 · 提交

```powershell
git add -A
git commit -m "<用一句话说清这次改了什么>"
```

提交信息用中文，格式建议 `类型：说明`，例如：

- `新增：V3.1 留言板块视觉微调`
- `修复：admin.html 视图切换在首次加载时闪烁`
- `文档：补充 Supabase 接入指南的第 3 步截图说明`

### 第 4 步 · 推送

```powershell
git push
```

### 第 5 步 · 验证

```powershell
git status -sb        # 期望：## main...origin/main（后面没有 ahead）
git log --oneline -1
```

要确认真到了远端，而不是只看命令没报错：

```powershell
git ls-remote origin main
```

输出应该和 `git log --oneline -1` 的短 SHA 一致。

## 绝对不能提交的内容

`.gitignore` 已经挡住了下面这些，但**每新增一类文件都要回来复查一次**：

| 内容 | 原因 |
| --- | --- |
| `.deepworks/` | 含本机绝对路径、会话临时文件、日志 |
| `node_modules/` `**/node_modules/` | 50 MB+ 依赖，可重新安装 |
| `.opencode/deepworks.json` | 含本机绝对路径 |
| `uploads/**/_inspect/` | 页面比对用的调试截图 |
| 任何 GitHub Token | 泄露即等同于泄露仓库写权限 |
| Supabase `service_role` key | 万能钥匙，能绕过全部 RLS 策略 |
| `.env` / `.env.*` | 环境变量与密钥 |

判断标准：**这个文件对别人 clone 下来重建项目有用吗？** 没用就不该进仓库。

## 认证方式

### 优先：让 Git Credential Manager 弹窗（推荐）

首次在新机器上推送时，Git for Windows 会弹出 GitHub 登录窗口，登录一次后长期有效。
用户不需要理解 token，也不需要把任何密码交给别人。

### 备选：临时 Personal Access Token

只有当用户明确提供了 token 时才用这条路，并严格遵守：

1. **token 只出现在单次命令里**，例如：
   `git push "https://<token>@github.com/wil749/personal-homepage.git" main`
2. **绝不**写进任何文件、`.git/config`、脚本或 skill 里
   （`git remote set-url` 带 token、`git push -u` 带 token URL 都会把 token 落到 `.git/config`，禁止使用）
3. 推送完成后主动检查并提醒：
   ```powershell
   if (Select-String -Path ".git\config" -Pattern "github_pat|ghp_" -Quiet) { "配置里残留了 token，需要清理" } else { "干净" }
   ```
4. 提醒用户去 <https://github.com/settings/personal-access-tokens> 删除该 token

## 常见问题

**推送被拒，提示 `rejected ... fetch first`**
远端有本地没有的提交。先 `git pull --rebase`，解决冲突后再推。不要用 `--force`。

**推送卡住或超时**
多半是网络问题。仓库只有几 MB，重试一次通常就好。

**中文文件名显示成 `\xxx` 转义**
执行 `git config core.quotepath false` 即可正常显示。

**改了文件名大小写后 git 没反应**
Windows 文件系统不区分大小写，用 `git mv` 显式改名。

**想撤销上一次提交但保留改动**
`git reset --soft HEAD~1`（只影响本地未推送的提交，已推送的不要这么干）。

**误把敏感文件提交了**
只改 `.gitignore` 没用，文件还在历史里。需要 `git rm --cached <file>` 并从历史中清除，
如果已经推送出去，**立刻去对应平台作废那个密钥**，这比改历史重要得多。

## 示例

**示例 1**

用户：「帮我把刚才的改动推上去」

执行：`git status --short` → 跑 `pre-push-check.ps1` → 检查通过 →
`git add -A` → `git commit -m "新增：留言板块移动端适配"` → `git push` →
`git status -sb` 确认没有 ahead → 回报用户「已推送，提交号 xxxxxxx」。

**示例 2**

用户：「备份到 GitHub」

先看有没有改动。如果工作区干净、也没有 ahead，就如实告诉用户「当前没有新改动，远端已经是最新的」，
不要为了有东西提交而制造空提交。

## 相关文件

- 检查脚本：`.opencode/skills/push-to-github/scripts/pre-push-check.ps1`
- 忽略规则：仓库根目录 `.gitignore`
- Supabase 相关配置说明：`docs/supabase-接入指南.md`
