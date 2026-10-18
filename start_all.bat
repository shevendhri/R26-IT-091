@echo off
title GreenConstructAI Launcher
echo ========================================================
echo        Starting GreenConstructAI Platform Services
echo ========================================================
echo.

set ROOT=%~dp0

echo [1/4] Launching Plan Analyzer ML Service (Port 8081)...
start "Plan Analyzer ML Service (Port 8081)" cmd /k "cd /d %ROOT%model && venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo [2/4] Launching Plan Analyzer Node Gateway (Port 5001)...
start "Plan Analyzer Node Gateway (Port 5001)" cmd /k "cd /d %ROOT%backend\node && node server.js"

timeout /t 2 /nobreak >nul

echo [3/4] Launching Core Backend - Materials, Green & Fire Pre-Assessments (Port 5000)...
start "Core Backend (Port 5000)" cmd /k "cd /d %ROOT%backend && venv\Scripts\activate && python -m uvicorn app:app --host 0.0.0.0 --port 5000 --reload"

timeout /t 3 /nobreak >nul

echo [4/4] Launching Frontend Web App (Port 3000)...
start "Frontend (Port 3000)" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo ========================================================
echo  All 4 services launched in separate terminal windows!
echo  Access the platform at: http://localhost:3000
echo ========================================================
pause
