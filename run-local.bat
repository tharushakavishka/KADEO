@echo off
set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
cd /d "C:\Users\imash kavindu\Documents\kadeo-commerce-platform"

echo Starting Kadeo Commerce Platform (Backend & Frontend)...
start "Kadeo Backend" cmd /k "bun server/index.ts"
start "Kadeo Frontend" cmd /k "bun run dev"
