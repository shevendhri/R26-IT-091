@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM GreenConstructAI — Full Evaluation Pipeline Runner
REM Run from: C:\Users\ASUS\Desktop\Material specification\backend\
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo ============================================================
echo  GreenConstructAI Experimental Evaluation Pipeline
echo ============================================================
echo.

REM Step 0: Install dependencies
echo [0/4] Installing dependencies...
.\venv\Scripts\pip.exe install requests matplotlib numpy --quiet
echo     Done.
echo.

REM Step 1: Run 50 scenarios against the live API
echo [1/4] Running 50 evaluation scenarios against the backend...
.\venv\Scripts\python.exe evaluation\01_run_evaluation.py
if errorlevel 1 (
    echo [ERROR] Evaluation run failed. Is the backend running on port 5000?
    pause
    exit /b 1
)
echo.

REM Step 2: Compute statistics
echo [2/4] Computing descriptive statistics...
.\venv\Scripts\python.exe evaluation\02_statistics.py
echo.

REM Step 3: Generate charts
echo [3/4] Generating publication-quality charts...
.\venv\Scripts\python.exe evaluation\03_charts.py
echo.

REM Step 4: Generate dissertation tables
echo [4/4] Generating dissertation Markdown tables...
.\venv\Scripts\python.exe evaluation\04_dissertation_tables.py
echo.

echo ============================================================
echo  Pipeline complete! Output directories:
echo    Results  : backend\evaluation\results\
echo    Figures  : backend\evaluation\figures\
echo    Tables   : backend\evaluation\dissertation_tables\
echo ============================================================
pause
