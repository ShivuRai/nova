param([Parameter(Mandatory=$true)][ValidateSet(-10,10)][int]$Delta)
$ErrorActionPreference = 'Stop'
$monitor = Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightness | Where-Object Active | Select-Object -First 1
if (-not $monitor) { throw 'No controllable display' }
$method = Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightnessMethods | Where-Object { $_.InstanceName -eq $monitor.InstanceName } | Select-Object -First 1
if (-not $method) { throw 'Brightness method unavailable' }
$target = [Math]::Max(0, [Math]::Min(100, [int]$monitor.CurrentBrightness + $Delta))
$levels = $monitor.Level | Where-Object { if ($Delta -gt 0) { $_ -gt $monitor.CurrentBrightness } else { $_ -lt $monitor.CurrentBrightness } }
$level = $levels | Sort-Object { [Math]::Abs([int]$_ - $target) } | Select-Object -First 1
if ($null -eq $level) { $level = $monitor.CurrentBrightness }
$result = Invoke-CimMethod -InputObject $method -MethodName WmiSetBrightness -Arguments @{ Timeout = [uint32]0; Brightness = [byte]$level }
if ($result.ReturnValue -ne 0) { throw 'Windows could not set brightness' }
Write-Output $level
