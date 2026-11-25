# Foreground App & Desktop Detector for NOVA Auto-Retract
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

try {
    Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      using System.Text;
      public class Win32ActiveApp {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
        [DllImport("user32.dll")]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);
      }
"@ -ErrorAction SilentlyContinue

    $hwnd = [Win32ActiveApp]::GetForegroundWindow()
    if ($hwnd -eq [IntPtr]::Zero) {
        @{ isDesktop = $true; process = "desktop"; title = ""; className = "" } | ConvertTo-Json
        exit
    }

    $sbText = New-Object System.Text.StringBuilder 256
    [void][Win32ActiveApp]::GetWindowText($hwnd, $sbText, 256)

    $sbClass = New-Object System.Text.StringBuilder 256
    [void][Win32ActiveApp]::GetClassName($hwnd, $sbClass, 256)

    $pidOut = 0
    [void][Win32ActiveApp]::GetWindowThreadProcessId($hwnd, [ref]$pidOut)

    $proc = Get-Process -Id $pidOut -ErrorAction SilentlyContinue
    $pName = if ($proc) { $proc.ProcessName } else { "explorer" }
    $className = $sbClass.ToString()
    $title = $sbText.ToString()

    # Desktop detection: Progman, WorkerW, Shell_TrayWnd, Shell_SecondaryTrayWnd, Program Manager, NOVA, or explorer with no window title
    $isDesk = ($hwnd -eq [IntPtr]::Zero) -or `
              ($className -eq "Progman") -or `
              ($className -eq "WorkerW") -or `
              ($className -eq "Shell_TrayWnd") -or `
              ($className -eq "Shell_SecondaryTrayWnd") -or `
              ($title -eq "Program Manager") -or `
              ($pName -eq "NOVA" -or $pName -eq "electron") -or `
              ($pName -eq "explorer" -and ($title -eq "" -or $title -eq "Task Switching" -or $title -eq "Windows Input Experience" -or $className -like "*Tray*"))

    @{
        isDesktop = [bool]$isDesk
        process = $pName
        className = $className
        title = $title
    } | ConvertTo-Json
} catch {
    @{ isDesktop = $true; process = "desktop"; title = ""; className = "" } | ConvertTo-Json
}
