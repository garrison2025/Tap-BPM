# Windows PowerShell: run from the extracted project folder.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Write-Host 'Node.js 18+ is required. Install it, then run this script again.' -ForegroundColor Yellow
    exit 1
}
Write-Host '1/3 Testing the timing engine...' -ForegroundColor Cyan
npm.cmd test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host '2/3 Building unindexed preview...' -ForegroundColor Cyan
npm.cmd run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host '3/3 Starting preview at http://127.0.0.1:4173/' -ForegroundColor Green
$server = Start-Process -FilePath 'node.exe' -ArgumentList 'scripts/serve.mjs' -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru
Start-Sleep -Seconds 2
Start-Process 'http://127.0.0.1:4173/'
Write-Host 'The local preview is running. Stop it with Ctrl+C or close this window.' -ForegroundColor Cyan
try { Wait-Process -Id $server.Id } finally { if (-not $server.HasExited) { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue } }
