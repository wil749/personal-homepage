# ============================================================
#  publish.ps1 —— 把 outputs/ 里的源文件同步为仓库根目录的发布版本
# ------------------------------------------------------------
#  为什么需要这一步：
#    GitHub Pages 只能发布仓库根目录（或 /docs），没法直接发布
#    outputs/。所以这里把源文件复制到根目录并改成英文文件名，
#    同时把页面之间的中文文件名链接换成新的名字。
#
#  用法（在仓库根目录执行）：
#    powershell -ExecutionPolicy Bypass -File ".\scripts\publish.ps1"
#
#  ⚠️ 改内容请改 outputs/ 里的源文件，改完跑一次本脚本。
#     根目录的 index.html / projects.html 等是自动生成产物，
#     直接编辑它们会在下次同步时被覆盖。
# ============================================================

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath "outputs")) {
  Write-Host "找不到 outputs 目录，请在仓库根目录运行本脚本。" -ForegroundColor Red
  exit 1
}

# 源文件 -> 发布到根目录的文件名
$files = [ordered]@{
  "wyw个人主页-V4.0.html"     = "index.html"
  "wyw个人主页-projects.html" = "projects.html"
  "wyw个人主页-skills.html"   = "skills.html"
  "admin.html"                = "admin.html"
}

# 链接替换规则（旧的中文文件名 -> 新的发布文件名）
$links = [ordered]@{
  "wyw个人主页-V4.0.html"     = "index.html"
  "wyw个人主页-V3.1.html"     = "index.html"
  "wyw个人主页-V2.2.html"     = "index.html"
  "wyw个人主页-projects.html" = "projects.html"
  "wyw个人主页-skills.html"   = "skills.html"
}

# 需要同步到根目录的资源目录（源目录 -> 发布目录）
# 首页 V4.0 的书页配图写的是相对路径 images/xxx.jpg，
# 发布到仓库根目录后必须能在根目录的 images/ 下找到，否则图片 404。
$assets = [ordered]@{
  "outputs\images" = "images"
}

Write-Host ""
Write-Host "同步 outputs/ -> 仓库根目录" -ForegroundColor Cyan

foreach ($src in $files.Keys) {
  $srcPath = (Resolve-Path -LiteralPath (Join-Path "outputs" $src)).Path
  $dstName = $files[$src]
  $text = [System.IO.File]::ReadAllText($srcPath, [System.Text.Encoding]::UTF8)

  $hits = 0
  foreach ($old in $links.Keys) {
    $n = ([regex]::Matches($text, [regex]::Escape($old))).Count
    if ($n -gt 0) {
      $text = $text.Replace($old, $links[$old])
      $hits += $n
    }
  }

  $dstPath = Join-Path (Get-Location).Path $dstName
  [System.IO.File]::WriteAllText($dstPath, $text, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ("  {0,-28} -> {1,-16} 替换链接 {2} 处" -f $src, $dstName, $hits) -ForegroundColor Green
}

foreach ($srcDir in $assets.Keys) {
  if (-not (Test-Path -LiteralPath $srcDir)) {
    Write-Host ("  跳过：找不到资源目录 {0}" -f $srcDir) -ForegroundColor Yellow
    continue
  }
  $dstDir = Join-Path (Get-Location).Path $assets[$srcDir]
  if (-not (Test-Path -LiteralPath $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir | Out-Null
  }
  $copied = 0
  Get-ChildItem -LiteralPath $srcDir -File | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $dstDir $_.Name) -Force
    $copied++
  }
  Write-Host ("  {0,-28} -> {1,-16} 复制 {2} 个文件" -f $srcDir, ($assets[$srcDir] + "\"), $copied) -ForegroundColor Green
}

Write-Host ""
Write-Host "完成。请检查后提交推送。" -ForegroundColor Green
