@echo off
title NOVA
cd /d "%~dp0dist-app"
set "ELECTRON_RUN_AS_NODE="
start "" "NOVA.exe"
