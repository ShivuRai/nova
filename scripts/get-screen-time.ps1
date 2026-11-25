# Screen time is now sampled while NOVA runs. The script exposes current machine uptime
# for diagnostics and intentionally does not infer per-app usage from process CPU time.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'
$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
@{ uptimeSeconds = [long]((Get-Date) - $boot).TotalSeconds } | ConvertTo-Json -Compress
