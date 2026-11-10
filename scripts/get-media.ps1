# Real-Time Media & YouTube Audio Inspector for NOVA Windows Companion
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

try {
    # 1. Try Windows Runtime GlobalSystemMediaTransportControlsSessionManager (SMTC)
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction SilentlyContinue
    $null = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime]
    $asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
    $task = [System.WindowsRuntimeSystemExtensions]::AsTask($asyncOp)
    if ($task.Wait(800) -and $task.Result) {
        $manager = $task.Result
        $session = $manager.GetCurrentSession()
        if ($session) {
            $info = $session.GetPlaybackInfo()
            $mediaOp = $session.TryGetMediaPropertiesAsync()
            $mediaTask = [System.WindowsRuntimeSystemExtensions]::AsTask($mediaOp)
            if ($mediaTask.Wait(800) -and $mediaTask.Result) {
                $props = $mediaTask.Result
                $status = if ($info) { $info.PlaybackStatus.ToString() } else { "Unknown" }
                $isPlaying = ($status -eq "Playing" -or $status -eq "4")
                if ($props.Title -or $isPlaying) {
                    $source = $session.SourceAppUserModelId
                    $artist = if ($props.Artist) { $props.Artist } elseif ($source -match 'chrome|edge|brave') { "YouTube / Web" } else { "Media Player" }
                    [PSCustomObject]@{
                        app = $source
                        title = $props.Title
                        artist = $artist
                        status = $status
                        isPlaying = $isPlaying
                    } | ConvertTo-Json -Compress
                    exit 0
                }
            }
        }
    }
} catch {
    # Fall through to window title inspection
}

# 2. Window Title Inspection Fallback for Chrome, Edge, Brave, Spotify, VLC, Firefox
try {
    $processes = Get-Process -ErrorAction SilentlyContinue | Where-Object { 
        $_.MainWindowTitle -and (
            $_.MainWindowTitle -match 'YouTube' -or 
            $_.ProcessName -match 'Spotify|chrome|msedge|brave|firefox|vlc'
        )
    }

    foreach ($p in $processes) {
        $title = $p.MainWindowTitle
        if (-not $title) { continue }

        # Check YouTube tab in browsers
        if ($title -match 'YouTube') {
            # Format: "Video Title - YouTube - Google Chrome"
            $cleaned = $title -replace '\s*-\s*YouTube.*$', '' -replace '\s*-\s*Google Chrome.*$', '' -replace '\s*-\s*Microsoft\s*Edge.*$', '' -replace '\s*-\s*Brave.*$', ''
            if ($cleaned.Trim()) {
                [PSCustomObject]@{
                    app = $p.ProcessName
                    title = $cleaned.Trim()
                    artist = "YouTube"
                    status = "Playing"
                    isPlaying = $true
                } | ConvertTo-Json -Compress
                exit 0
            }
        }

        # Check Spotify desktop app
        if ($p.ProcessName -eq 'Spotify' -and $title -ne 'Spotify' -and $title -ne 'Spotify Free' -and $title -ne 'Spotify Premium') {
            $parts = $title -split ' - ', 2
            $artist = if ($parts.Length -gt 1) { $parts[0] } else { "Spotify" }
            $song = if ($parts.Length -gt 1) { $parts[1] } else { $parts[0] }
            [PSCustomObject]@{
                app = "Spotify"
                title = $song.Trim()
                artist = $artist.Trim()
                status = "Playing"
                isPlaying = $true
            } | ConvertTo-Json -Compress
            exit 0
        }

        # Check VLC media player
        if ($p.ProcessName -eq 'vlc' -and $title -ne 'VLC media player') {
            $cleaned = $title -replace '\s*-\s*VLC media player.*$', ''
            [PSCustomObject]@{
                app = "VLC"
                title = $cleaned.Trim()
                artist = "VLC Media Player"
                status = "Playing"
                isPlaying = $true
            } | ConvertTo-Json -Compress
            exit 0
        }
    }
} catch {}

Write-Output '{"isPlaying":false,"title":"","artist":""}'
