# Starts the IMS Vite dev server (port 5173, per vite.config.js).
# Invokes vite.js through node directly rather than via npm, so the task owns a
# single process instead of an npm wrapper that is awkward to stop cleanly.

$root   = 'C:\InventoryManagement\ims-frontend'
$node   = 'C:\nodejs\node.exe'
$vite   = "$root\node_modules\vite\bin\vite.js"
$logDir = 'C:\InventoryManagement\logs'
$log    = "$logDir\frontend.log"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Write-Log($msg) {
    "[$(Get-Date -Format s)] $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

Write-Log "--- frontend starting ---"

# See start-backend.ps1 for why Start-Process redirection is used instead of *>>.
# Vite binds ::1 (IPv6 loopback); browse to http://localhost:5173/ , not 127.0.0.1.
$proc = Start-Process -FilePath $node -ArgumentList $vite `
    -WorkingDirectory $root -NoNewWindow -PassThru `
    -RedirectStandardOutput "$logDir\frontend.out.log" `
    -RedirectStandardError  "$logDir\frontend.err.log"

Write-Log "vite started, pid $($proc.Id)"
Wait-Process -Id $proc.Id
Write-Log "vite exited with code $($proc.ExitCode)"
