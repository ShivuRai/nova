@echo off
title Install NOVA Digital Code-Signing Certificate
echo ======================================================================
echo    NOVA Code-Signing Certificate Installer (Windows Defender Trust)
echo ======================================================================
echo.
echo This script registers the NOVA digital Authenticode certificate
echo into your Windows user certificate store (Trusted Publishers and Root CA).
echo This allows Windows Defender and Windows SmartScreen to verify
echo the application publisher and launch without security warnings.
echo.
pause
echo.
echo Installing into Trusted Publishers...
certutil -user -addstore TrustedPublisher "%~dp0NOVA-Certificate.cer"
echo.
echo Installing into Trusted Root Certification Authorities...
certutil -user -addstore Root "%~dp0NOVA-Certificate.cer"
echo.
echo ======================================================================
echo [COMPLETE] Certificate installed!
echo Windows Defender and SmartScreen will now recognize NOVA binaries.
echo ======================================================================
echo.
pause
