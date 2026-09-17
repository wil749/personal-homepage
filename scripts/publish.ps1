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
  "wyw个人主页-V3.1.html"     = "index.html"
  "wyw个人主页-projects.html" = "projects.html"
  "wyw个人主页-skills.html"   = "skills.html"
  "admin.html"                = "admin.html"
}

# 链接替换规则（旧的中文文件名 -> 新的发布文件名）
$links = [ordered]@{
  "wyw个人主页-V3.1.html"     = "index.html"
  "wyw个人主页-V2.2.html"     = "index.html"
  "wyw个人主页-projects.html" = "projects.html"
  "wyw个人主页-skills.html"   = "skills.html"
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

Write-Host ""
Write-Host "完成。请检查后提交推送。" -ForegroundColor Green
