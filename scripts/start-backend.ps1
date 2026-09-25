# Starts the IMS FastAPI backend.
# Waits for PostgreSQL first, because app/main.py runs
# Base.metadata.create_all() at import time and will crash if the DB is down.

$root    = 'C:\InventoryManagement\ims-backend'
$python  = "$root\.venv\Scripts\python.exe"
$pgReady = 'C:\PostgreSQL\14\bin\pg_isready.exe'
$logDir  = 'C:\InventoryManagement\logs'
$log     = "$logDir\backend.log"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Write-Log($msg) {
    "[$(Get-Date -Format s)] $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

Write-Log "--- backend starting ---"

# Wait up to 180s for PostgreSQL to accept connections.
$ready = $false
foreach ($i in 1..180) {
    & $pgReady -h localhost -p 5432 -q 2>$null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
}

if (-not $ready) {
    Write-Log "ERROR: PostgreSQL not reachable after 180s, aborting."
    exit 1
}

Write-Log "PostgreSQL is up, launching uvicorn."

# Start-Process with explicit redirection rather than PowerShell's *>> operator:
# 5.1 writes UTF-16 for redirected streams and wraps native stderr in
# NativeCommandError records, which makes the logs unreadable. These two files
# are truncated on each start, so they cannot grow without bound.
# Bound to 127.0.0.1: the frontend hardcodes http://localhost:8000, so loopback
# is all that is ever used. Change to 0.0.0.0 only if you deliberately want the
# API reachable from other machines on the network.
$proc = Start-Process -FilePath $python `
    -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000' `
    -WorkingDirectory $root -NoNewWindow -PassThru `
    -RedirectStandardOutput "$logDir\backend.out.log" `
    -RedirectStandardError  "$logDir\backend.err.log"

Write-Log "uvicorn started, pid $($proc.Id)"
Wait-Process -Id $proc.Id
Write-Log "uvicorn exited with code $($proc.ExitCode)"
