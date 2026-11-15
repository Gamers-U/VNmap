# Собирает портативную версию «Карты новеллы» для Windows без Python и Node.js:
# скачивает официальный Electron с GitHub, проверяет контрольную сумму и кладёт в него программу.
# Запуск: двойной щелчок по install-windows.bat (или: powershell -ExecutionPolicy Bypass -File install-windows.ps1)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$pkg = Get-Content -Raw -Encoding UTF8 (Join-Path $here 'package.json') | ConvertFrom-Json
$ver = $pkg.devDependencies.electron.TrimStart('^', '~')
$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'win32-arm64' } else { 'win32-x64' }
$name = "electron-v$ver-$arch.zip"
$base = "https://github.com/electron/electron/releases/download/v$ver"

if (-not (Test-Path (Join-Path $here 'app\index.html'))) { throw 'Не найден app\index.html: распакуйте архив целиком.' }

$cache = Join-Path $here '.cache'
New-Item -ItemType Directory -Force $cache | Out-Null
$zip = Join-Path $cache $name
$sums = Join-Path $cache "SHASUMS256-v$ver.txt"

Write-Host "Electron $ver ($arch)"
if (-not (Test-Path $sums)) { Write-Host 'Скачиваю список контрольных сумм...'; Invoke-WebRequest "$base/SHASUMS256.txt" -OutFile $sums }
$expected = $null
foreach ($line in Get-Content $sums) {
  $p = $line -split '\s+'
  if ($p.Count -ge 2 -and $p[1].TrimStart('*') -eq $name) { $expected = $p[0].ToLower() }
}
if (-not $expected) { throw "В списке контрольных сумм нет $name" }

$have = $false
if (Test-Path $zip) { $have = ((Get-FileHash $zip -Algorithm SHA256).Hash.ToLower() -eq $expected) }
if (-not $have) {
  Write-Host 'Скачиваю Electron (около 150 МБ), это может занять несколько минут...'
  Invoke-WebRequest "$base/$name" -OutFile $zip
  if ((Get-FileHash $zip -Algorithm SHA256).Hash.ToLower() -ne $expected) {
    Remove-Item $zip -Force
    throw 'Контрольная сумма не совпала, файл удалён. Запустите установку ещё раз.'
  }
}

$out = Join-Path $here 'VNMap'
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
Write-Host 'Распаковываю...'
Expand-Archive -Path $zip -DestinationPath $out -Force
Rename-Item (Join-Path $out 'electron.exe') 'VNMap.exe'

$res = Join-Path $out 'resources'
$app = Join-Path $res 'app'
New-Item -ItemType Directory -Force $app | Out-Null
foreach ($f in 'main.js', 'preload.js', 'gdrive.js', 'updater.js', 'package.json', 'google-oauth.json') {
  $src = Join-Path $here $f
  if (Test-Path $src) { Copy-Item $src $app; if ($f -eq 'google-oauth.json') { Write-Host 'В сборку добавлен ключ Google (google-oauth.json)' } }
}
Copy-Item (Join-Path $here 'app') $app -Recurse
New-Item -ItemType Directory -Force (Join-Path $app 'build') | Out-Null
Copy-Item (Join-Path $here 'build\icon.png') (Join-Path $app 'build')
Remove-Item (Join-Path $res 'default_app.asar') -Force -ErrorAction SilentlyContinue

Write-Host ''
Write-Host "Готово: $out\VNMap.exe"
Write-Host 'Папку VNMap можно перенести куда угодно. Запуск: двойной щелчок по VNMap.exe.'
$ans = Read-Host 'Запустить сейчас? (д/н)'
if ($ans -match '^(д|y)') { Start-Process (Join-Path $out 'VNMap.exe') }
