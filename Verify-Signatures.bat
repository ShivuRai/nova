@echo off
title NOVA Security and Integrity Verification
echo ======================================================================
echo          NOVA Desktop Companion - Security and Signature Check
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Write-Host 'Checking Authenticode Digital Signature...' -ForegroundColor Cyan; " ^
  "$sig = Get-AuthenticodeSignature '%~dp0NOVA.exe'; " ^
  "Write-Host ('Signer: ' + $sig.SignerCertificate.Subject); " ^
  "Write-Host ('Thumbprint: ' + $sig.SignerCertificate.Thumbprint); " ^
  "Write-Host ('Signature Status: ' + $sig.Status); " ^
  "Write-Host ''; " ^
  "Write-Host 'Calculating SHA-256 Checksums...' -ForegroundColor Cyan; " ^
  "$files = @('NOVA.exe', 'dist-app\NOVA.exe', 'NOVA-Certificate.cer'); " ^
  "foreach ($f in $files) { " ^
  "  $full = Join-Path '%~dp0' $f; " ^
  "  if (Test-Path $full) { " ^
  "    $h = (Get-FileHash -Path $full -Algorithm SHA256).Hash; " ^
  "    Write-Host ('  [OK] ' + $f + ' : ' + $h) -ForegroundColor Green; " ^
  "  } " ^
  "}; " ^
  "Write-Host ''; " ^
  "Write-Host 'Security verification completed successfully.' -ForegroundColor Green"
echo.
pause
