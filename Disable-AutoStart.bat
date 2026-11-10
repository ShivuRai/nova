@echo off
title Disable NOVA Auto-Start on System Boot
echo ====================================================
echo       Disabling NOVA Auto-Start on Windows Boot
echo ====================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$path = [IO.Path]::Combine([Environment]::GetFolderPath('Startup'), 'NOVA.lnk'); " ^
  "if (Test-Path $path) { Remove-Item $path -Force; Write-Host '[SUCCESS] NOVA auto-start on boot has been removed.' -ForegroundColor Yellow } else { Write-Host '[INFO] Auto-start was not enabled.' -ForegroundColor Cyan }"
echo.
pause
