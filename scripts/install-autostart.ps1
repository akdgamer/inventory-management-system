# Installs autostart for the Inventory Management System.
#   PostgreSQL -> a real Windows service (postgresql-x64-14), start type Automatic
#   Backend    -> scheduled task "IMS Backend",  trigger At Startup, runs as SYSTEM
#   Frontend   -> scheduled task "IMS Frontend", trigger At Startup, runs as SYSTEM
#
# Must be run from an elevated PowerShell. Re-running it is safe.

$ErrorActionPreference = 'Stop'

$principalCheck = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principalCheck.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator." -ForegroundColor Red
    exit 1
}

$pgBin   = 'C:\PostgreSQL\14\bin'
$pgData  = 'C:\PostgreSQL\14\data'
$svcName = 'postgresql-x64-14'
$scripts = 'C:\InventoryManagement\scripts'

# ------------------------------------------------------------------- cleanup --
# Any hand-started uvicorn/vite would hold ports 8000/5173 and make the new
# tasks fail. Excluding $PID matters: this script's own command line would
# otherwise match the wrapper pattern and kill the installer mid-run.
Write-Host "`n[0/3] Clearing previously started instances" -ForegroundColor Cyan
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
        $_.ProcessId -ne $PID -and (
            (($_.Name -eq 'python.exe' -or $_.Name -eq 'node.exe') -and $_.CommandLine -match 'uvicorn|vite') -or
            ($_.Name -eq 'powershell.exe' -and $_.CommandLine -match 'start-backend\.ps1|start-frontend\.ps1')
        )
    } |
    ForEach-Object {
        Write-Host ("  stopping pid " + $_.ProcessId + " (" + $_.Name + ")")
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
Start-Sleep -Seconds 2

# ---------------------------------------------------------------- PostgreSQL --
Write-Host "`n[1/3] PostgreSQL service" -ForegroundColor Cyan

# A standalone postgres started by pg_ctl would hold port 5432 and the data
# directory lock, so shut it down before the service takes over.
& "$pgBin\pg_ctl.exe" -D $pgData -m fast stop 2>$null | Out-Null
Start-Sleep -Seconds 3

$existing = Get-Service -Name $svcName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "  service already exists, re-registering"
    if ($existing.Status -ne 'Stopped') { Stop-Service -Name $svcName -Force }
    & "$pgBin\pg_ctl.exe" unregister -N $svcName | Out-Null
    Start-Sleep -Seconds 2
}

& "$pgBin\pg_ctl.exe" register -N $svcName -D $pgData -S auto
Start-Sleep -Seconds 2
Set-Service -Name $svcName -StartupType Automatic
Start-Service -Name $svcName
Start-Sleep -Seconds 3
Write-Host ("  status: " + (Get-Service -Name $svcName).Status)

# ------------------------------------------------------------ Scheduled tasks --
function Install-AppTask {
    param($TaskName, $ScriptPath)

    $action = New-ScheduledTaskAction `
        -Execute 'powershell.exe' `
        -Argument ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}"' -f $ScriptPath)

    $trigger = New-ScheduledTaskTrigger -AtStartup

    $principal = New-ScheduledTaskPrincipal `
        -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

    # ExecutionTimeLimit 0 = never kill it; these are long-running servers.
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
        -ExecutionTimeLimit ([TimeSpan]::Zero)

    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
        -Principal $principal -Settings $settings -Force | Out-Null

    Start-ScheduledTask -TaskName $TaskName
    Write-Host ("  registered and started: " + $TaskName)
}

Write-Host "`n[2/3] Backend task" -ForegroundColor Cyan
Install-AppTask -TaskName 'IMS Backend' -ScriptPath "$scripts\start-backend.ps1"

Write-Host "`n[3/3] Frontend task" -ForegroundColor Cyan
Install-AppTask -TaskName 'IMS Frontend' -ScriptPath "$scripts\start-frontend.ps1"

Write-Host "`nDone. Give it ~30 seconds, then open http://localhost:5173/" -ForegroundColor Green
Write-Host "Logs: C:\InventoryManagement\logs\"
