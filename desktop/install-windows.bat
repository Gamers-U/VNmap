@echo off
rem Builds the portable app into the VNMap folder next to this file (internet required; Python and Node.js are not needed).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1"
echo.
pause
