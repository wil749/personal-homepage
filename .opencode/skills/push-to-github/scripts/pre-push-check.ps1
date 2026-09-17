# ============================================================
#  推送前安全检查  ·  push-to-github skill
# ------------------------------------------------------------
#  用法（在工作区根目录执行）：
#    powershell -ExecutionPolicy Bypass -File ".opencode\skills\push-to-github\scripts\pre-push-check.ps1"
#
#  退出码：0 = 可以提交    1 = 有必须修复的问题
# ============================================================

$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$script:FAIL = 0
$script:WARN = 0

function Mark-Ok   { param($m) Write-Host "  [通过] $m"   -ForegroundColor Green }
function Mark-Warn { param($m) Write-Host "  [注意] $m"   -ForegroundColor Yellow; $script:WARN++ }
function Mark-Fail { param($m) Write-Host "  [必须修] $m" -ForegroundColor Red;    $script:FAIL++ }

Write-Host ""
Write-Host "===== 推送前安全检查 =====" -ForegroundColor Cyan

# --- 0. git 可用 ---
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "  [必须修] 找不到 git，请先安装 Git for Windows" -ForegroundColor Red
  exit 1
}

# --- 1. 定位仓库根 ---
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
  Write-Host "  [必须修] 当前目录不是 git 仓库" -ForegroundColor Red
  exit 1
}
$repoRoot = $repoRoot -replace "/", "\"
Set-Location -LiteralPath $repoRoot
git config core.quotepath false 2>$null | Out-Null

Write-Host "  仓库根 : $repoRoot"
Write-Host "  分支   : $(git rev-parse --abbrev-ref HEAD)"
$remote = (git remote get-url origin 2>$null)
if ($remote) { Write-Host "  远程   : $remote" } else { Mark-Warn "没有配置 origin 远程" }

# --- 2. 待提交的改动 ---
Write-Host ""
Write-Host "[1/4] 待提交的改动" -ForegroundColor Cyan
$dirty = @(git status --short)
if ($dirty.Count -gt 0) {
  $dirty | ForEach-Object { Write-Host "  $_" }
  Write-Host "  共 $($dirty.Count) 项"
} else {
  Mark-Ok "工作区干净，没有未提交的改动"
}

# --- 3. 大文件 ---
Write-Host ""
Write-Host "[2/4] 大文件检查（阈值 50 MB）" -ForegroundColor Cyan
$tracked = @(git ls-files --cached --others --exclude-standard)
$big = @()
foreach ($f in $tracked) {
  if (Test-Path -LiteralPath $f -PathType Leaf) {
    $len = (Get-Item -LiteralPath $f).Length
    if ($len -gt 52428800) {
      $big += [PSCustomObject]@{ Path = $f; MB = [math]::Round($len / 1MB, 1) }
    }
  }
}
if ($big.Count -gt 0) {
  $big | ForEach-Object { Mark-Fail ("{0}  ({1} MB)" -f $_.Path, $_.MB) }
} else {
  Mark-Ok "已跟踪的 $($tracked.Count) 个文件都小于 50 MB"
}

# --- 4. 不该进仓库的路径 ---
Write-Host ""
Write-Host "[3/4] 不该进仓库的路径" -ForegroundColor Cyan
$badPatterns = @("node_modules/", ".deepworks/", ".opencode/deepworks.json", "/_inspect/", ".env")
$hitAny = $false
foreach ($p in $badPatterns) {
  $hit = @($tracked | Where-Object { $_ -like "*$p*" })
  if ($hit.Count -gt 0) {
    Mark-Fail "命中 '$p' 的有 $($hit.Count) 个文件，例如：$($hit[0])"
    $hitAny = $true
  }
}
if (-not $hitAny) { Mark-Ok "没有误加依赖目录或本机私有文件" }

# --- 5. 密钥扫描 ---
Write-Host ""
Write-Host "[4/4] 密钥泄露扫描" -ForegroundColor Cyan
$scanExt = @(".html", ".htm", ".js", ".mjs", ".cjs", ".json", ".jsonc", ".md", ".txt",
             ".sql", ".ps1", ".py", ".css", ".yml", ".yaml", ".xml", ".svg", ".env")
$rules = @(
  @{ Name = "GitHub 细粒度 token"; Re = "github_pat_[A-Za-z0-9_]{30,}"          ; Level = "FAIL" },
  @{ Name = "GitHub 经典 token";   Re = "ghp_[A-Za-z0-9]{30,}"                  ; Level = "FAIL" },
  @{ Name = "GitHub 其他 token";   Re = "gh[osru]_[A-Za-z0-9]{30,}"             ; Level = "FAIL" },
  @{ Name = "私钥内容";            Re = "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" ; Level = "FAIL" }
)
$jwtRe = "eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}"
$scanCount = 0
foreach ($f in $tracked) {
  $ext = [System.IO.Path]::GetExtension($f).ToLower()
  if ($scanExt -notcontains $ext) { continue }
  if (-not (Test-Path -LiteralPath $f -PathType Leaf)) { continue }
  $scanCount++
  $text = Get-Content -LiteralPath $f -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
  if (-not $text) { continue }

  # 5.1 明文密钥特征
  foreach ($r in $rules) {
    if ($text -match $r.Re) { Mark-Fail "$f 命中「$($r.Name)」" }
  }

  # 5.2 Supabase 密钥是 JWT，明文搜关键词找不到；
  #     这里把 payload 解码出来，只有 role=service_role 才算致命（anon key 可以公开）
  foreach ($m in [regex]::Matches($text, $jwtRe)) {
    $payload = $m.Value.Split(".")[1]
    try {
      $b64 = $payload.Replace("-", "+").Replace("_", "/")
      switch ($b64.Length % 4) { 2 { $b64 += "==" } 3 { $b64 += "=" } }
      $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64))
      if ($json -match '"role"\s*:\s*"service_role"') {
        Mark-Fail "$f 里有一个 Supabase service_role 密钥，绝对不能提交"
      }
    } catch { }
  }
}
Mark-Ok "已扫描 $scanCount 个文本文件"

# --- 6. 结论 ---
Write-Host ""
Write-Host "===== 结论 =====" -ForegroundColor Cyan
if ($script:FAIL -gt 0) {
  Write-Host "  有 $($script:FAIL) 项必须修复，先处理再提交，不要强行 push。" -ForegroundColor Red
  exit 1
} elseif ($script:WARN -gt 0) {
  Write-Host "  $($script:WARN) 项提醒，确认无误后可以继续提交。" -ForegroundColor Yellow
  exit 0
} else {
  Write-Host "  全部通过，可以执行：git add -A; git commit -m `"...`"; git push" -ForegroundColor Green
  exit 0
}
