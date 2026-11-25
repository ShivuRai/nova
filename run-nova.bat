@echo off
set "ELECTRON_RUN_AS_NODE="
cd /d "%~dp0dist-app"
start "" "%~dp0dist-app\NOVA.exe"

