# Real-time System Metrics Collector for NOVA
$ErrorActionPreference = 'SilentlyContinue'

# 1. CPU Usage
$cpuPercent = 12
try {
    $cpu = Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'" -ErrorAction SilentlyContinue
    if ($cpu) {
        $cpuPercent = [int]$cpu.PercentProcessorTime
    }
} catch {}

# 2. RAM Usage
$ram = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
$totalRamGb = [math]::Round($ram.TotalVisibleMemorySize / 1MB, 1)
$freeRamGb = [math]::Round($ram.FreePhysicalMemory / 1MB, 1)
$usedRamGb = [math]::Round($totalRamGb - $freeRamGb, 1)
$ramPercent = [math]::Round(($usedRamGb / $totalRamGb) * 100)

# 3. Disk Usage (C: Drive)
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" -ErrorAction SilentlyContinue
$totalDiskGb = [math]::Round($disk.Size / 1GB, 1)
$freeDiskGb = [math]::Round($disk.FreeSpace / 1GB, 1)
$diskPercent = [math]::Round((($totalDiskGb - $freeDiskGb) / $totalDiskGb) * 100)

# 4. Network Speed (Bytes/sec across active interfaces)
$netDownloadKbps = 0
$netUploadKbps = 0
try {
    $nics = Get-CimInstance Win32_PerfFormattedData_Tcpip_NetworkInterface -ErrorAction SilentlyContinue | Where-Object { $_.BytesTotalPerSec -gt 0 -or $_.CurrentBandwidth -gt 0 }
    if ($nics) {
        $totalRecv = ($nics | Measure-Object -Property BytesReceivedPerSec -Sum).Sum
        $totalSent = ($nics | Measure-Object -Property BytesSentPerSec -Sum).Sum
        $netDownloadKbps = [math]::Round($totalRecv / 1024, 0)
        $netUploadKbps = [math]::Round($totalSent / 1024, 0)
    }
} catch {}

# 5. Battery Status
$batteryPercent = 100
$isCharging = $true
try {
    $battery = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
    if ($battery) {
        $batteryPercent = [int]$battery.EstimatedChargeRemaining
        $status = [int]$battery.BatteryStatus
        # Status 2 = Unknown, 1 = Discharging, 2 = AC / Charging
        $isCharging = ($status -eq 2 -or $status -eq 6 -or $status -eq 7 -or $status -eq 8 -or $status -eq 9)
    }
} catch {}

$metrics = @{
    cpuUsagePercent = $cpuPercent
    ramUsagePercent = $ramPercent
    ramUsedGb = $usedRamGb
    ramTotalGb = $totalRamGb
    diskUsagePercent = $diskPercent
    diskFreeGb = $freeDiskGb
    networkDownloadKbps = $netDownloadKbps
    networkUploadKbps = $netUploadKbps
    batteryPercent = $batteryPercent
    isCharging = $isCharging
}

$metrics | ConvertTo-Json -Compress

