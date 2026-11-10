# Real-Time Media & YouTube Audio Inspector for NOVA Windows Companion
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction Stop
    $null = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime]
    $asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
    $mgrType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]
    $asTaskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and 
        $_.IsGenericMethodDefinition -and 
        $_.GetParameters().Length -eq 1 -and 
        $_.GetParameters()[0].ParameterType.Name -match 'IAsyncOperation'
    } | Select-Object -First 1

    if ($asTaskMethod) {
        $mgrTask = $asTaskMethod.MakeGenericMethod($mgrType).Invoke($null, @($asyncOp))
        if ($mgrTask.Wait(1200)) {
            $mgr = $mgrTask.Result
            if ($mgr) {
                $propsType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties]
                $propsTaskMethod = $asTaskMethod.MakeGenericMethod($propsType)

                # Prioritize currently playing sessions, fallback to current or first valid session
                $allSessions = @()
                try {
                    $curr = $mgr.GetCurrentSession()
                    if ($curr) { $allSessions += $curr }
                } catch {}

                try {
                    $otherSessions = $mgr.GetSessions()
                    if ($otherSessions) {
                        foreach ($s in $otherSessions) {
                            if ($allSessions -notcontains $s) {
                                $allSessions += $s
                            }
                        }
                    }
                } catch {}

                $bestSession = $null
                $bestProps = $null
                $bestStatus = "Closed"
                $bestIsPlaying = $false

                foreach ($session in $allSessions) {
                    try {
                        $pbInfo = $session.GetPlaybackInfo()
                        $statusStr = if ($pbInfo) { $pbInfo.PlaybackStatus.ToString() } else { "Closed" }
                        $isPlaying = ($statusStr -eq "Playing" -or $statusStr -eq "4")

                        $mediaOp = $session.TryGetMediaPropertiesAsync()
                        $mediaTask = $propsTaskMethod.Invoke($null, @($mediaOp))
                        if ($mediaTask.Wait(800)) {
                            $props = $mediaTask.Result
                            if ($props -and $props.Title) {
                                if ($isPlaying) {
                                    # Found an active playing session! Prioritize immediately
                                    $bestSession = $session
                                    $bestProps = $props
                                    $bestStatus = $statusStr
                                    $bestIsPlaying = $true
                                    break
                                } elseif (-not $bestSession) {
                                    # Cache first session with valid metadata (e.g. paused)
                                    $bestSession = $session
                                    $bestProps = $props
                                    $bestStatus = $statusStr
                                    $bestIsPlaying = $false
                                }
                            }
                        }
                    } catch {}
                }

                if ($bestSession -and $bestProps -and $bestProps.Title) {
                    $appId = $bestSession.SourceAppUserModelId
                    $artist = if ($bestProps.Artist) { 
                        $bestProps.Artist 
                    } elseif ($appId -match 'Chrome|Edge|Brave|Firefox') { 
                        "YouTube / Web" 
                    } elseif ($bestProps.AlbumArtist) { 
                        $bestProps.AlbumArtist 
                    } else { 
                        "Media Player" 
                    }

                    [PSCustomObject]@{
                        app = $appId
                        title = $bestProps.Title
                        artist = $artist
                        album = if ($bestProps.AlbumTitle) { $bestProps.AlbumTitle } else { "" }
                        status = $bestStatus
                        isPlaying = $bestIsPlaying
                    } | ConvertTo-Json -Compress
                    exit 0
                }
            }
        }
    }
} catch {
    # Fallback to process window titles
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

        if ($title -match 'YouTube') {
            $cleaned = $title -replace '\s*-\s*YouTube.*$', '' -replace '\s*-\s*Google Chrome.*$', '' -replace '\s*-\s*Microsoft\s*Edge.*$', '' -replace '\s*-\s*Brave.*$', ''
            if ($cleaned.Trim()) {
                [PSCustomObject]@{
                    app = $p.ProcessName
                    title = $cleaned.Trim()
                    artist = "YouTube"
                    album = ""
                    status = "Playing"
                    isPlaying = $true
                } | ConvertTo-Json -Compress
                exit 0
            }
        }

        if ($p.ProcessName -eq 'Spotify' -and $title -ne 'Spotify' -and $title -ne 'Spotify Free' -and $title -ne 'Spotify Premium') {
            $parts = $title -split ' - ', 2
            $artist = if ($parts.Length -gt 1) { $parts[0] } else { "Spotify" }
            $song = if ($parts.Length -gt 1) { $parts[1] } else { $parts[0] }
            [PSCustomObject]@{
                app = "Spotify"
                title = $song.Trim()
                artist = $artist.Trim()
                album = ""
                status = "Playing"
                isPlaying = $true
            } | ConvertTo-Json -Compress
            exit 0
        }

        if ($p.ProcessName -eq 'vlc' -and $title -ne 'VLC media player') {
            $cleaned = $title -replace '\s*-\s*VLC media player.*$', ''
            [PSCustomObject]@{
                app = "VLC"
                title = $cleaned.Trim()
                artist = "VLC Media Player"
                album = ""
                status = "Playing"
                isPlaying = $true
            } | ConvertTo-Json -Compress
            exit 0
        }
    }
} catch {}

Write-Output '{"isPlaying":false,"title":"","artist":"","app":""}'
