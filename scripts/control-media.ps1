# Media Control Actions for Windows SMTC (Chrome, Spotify, YouTube, etc.)
param (
    [string]$Action = "toggle" # toggle, play, pause, next, prev
)

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
            $session = $mgr.GetCurrentSession()
            if (-not $session) {
                $sessions = $mgr.GetSessions()
                if ($sessions.Count -gt 0) {
                    $session = $sessions[0]
                }
            }

            if ($session) {
                $boolType = [bool]
                $boolTaskMethod = $asTaskMethod.MakeGenericMethod($boolType)

                switch ($Action.ToLower()) {
                    "toggle" {
                        $op = $session.TryTogglePlayPauseAsync()
                        $t = $boolTaskMethod.Invoke($null, @($op))
                        $t.Wait(800) | Out-Null
                    }
                    "play" {
                        $op = $session.TryPlayAsync()
                        $t = $boolTaskMethod.Invoke($null, @($op))
                        $t.Wait(800) | Out-Null
                    }
                    "pause" {
                        $op = $session.TryPauseAsync()
                        $t = $boolTaskMethod.Invoke($null, @($op))
                        $t.Wait(800) | Out-Null
                    }
                    "next" {
                        $op = $session.TrySkipNextAsync()
                        $t = $boolTaskMethod.Invoke($null, @($op))
                        $t.Wait(800) | Out-Null
                    }
                    "prev" {
                        $op = $session.TrySkipPreviousAsync()
                        $t = $boolTaskMethod.Invoke($null, @($op))
                        $t.Wait(800) | Out-Null
                    }
                }
                Write-Output '{"success":true}'
                exit 0
            }
        }
    }
} catch {
    Write-Output "{\"success\":false,\"error\":\"$($_.Message)\"}"
}
