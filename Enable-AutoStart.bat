@echo off
title Enable NOVA Auto-Start on System Boot
echo ====================================================
echo        Enabling NOVA Auto-Start on Windows Boot
echo ====================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut([IO.Path]::Combine([Environment]::GetFolderPath('Startup'), 'NOVA.lnk')); " ^
  "$s.TargetPath = '%~dp0NOVA.exe'; " ^
  "$s.WorkingDirectory = '%~dp0'; " ^
  "$s.Description = 'NOVA Desktop Island Companion'; " ^
  "$s.Save(); " ^
  "Write-Host '[SUCCESS] NOVA has been configured to start automatically on Windows boot!' -ForegroundColor Green"
echo.
pause
