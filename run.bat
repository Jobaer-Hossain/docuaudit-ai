@echo off
echo =================================================================
echo   Starting DocuAudit AI - Multi-Modal Intelligence & Audit Agent
echo =================================================================

start "DocuAudit Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8005 --reload"

timeout /t 2 /nobreak >nul

start "DocuAudit Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo DocuAudit AI is booting!
echo Backend:  http://127.0.0.1:8005/docs
echo Frontend: http://localhost:5173
pause
