@echo off
title GreenConstructAI Stopper
echo ========================================================
echo        Stopping GreenConstructAI Platform Services
echo ========================================================
echo.

echo Stopping services on ports 3000, 5000, 5001, 8081...

powershell -Command "foreach ($port in @(3000, 5000, 5001, 8081)) { $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conn) { $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($p in $pids) { try { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process ' + $p + ' on port ' + $port) } catch {} } } }"

echo.
echo All services stopped successfully.
pause
