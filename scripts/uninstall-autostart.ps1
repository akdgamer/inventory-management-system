# Reverses install-autostart.ps1: removes the two scheduled tasks and the
# PostgreSQL service. Leaves the database files and project untouched.
# Run from an elevated PowerShell.

$principalCheck = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principalCheck.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator." -ForegroundColor Red
    exit 1
}

foreach ($t in 'IMS Backend','IMS Frontend') {
    if (Get-ScheduledTask -TaskName $t -ErrorAction SilentlyContinue) {
        Stop-ScheduledTask    -TaskName $t -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $t -Confirm:$false
        Write-Host "removed task: $t"
    }
}

# Kill any server processes the tasks left behind.
Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'uvicorn|vite' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

$svcName = 'postgresql-x64-14'
if (Get-Service -Name $svcName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $svcName -Force -ErrorAction SilentlyContinue
    & 'C:\PostgreSQL\14\bin\pg_ctl.exe' unregister -N $svcName | Out-Null
    Write-Host "removed service: $svcName"
}

Write-Host "Done. Database files under C:\PostgreSQL\14\data were not touched."
