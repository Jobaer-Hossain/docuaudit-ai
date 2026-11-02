Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Starting DocuAudit AI - Multi-Modal Intelligence & Audit Agent " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot

Write-Host "`n[1/2] Launching DocuAudit FastAPI Backend on http://127.0.0.1:8005..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "$baseDir\venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "main:app", "--app-dir", "$baseDir\backend", "--host", "127.0.0.1", "--port", "8005", "--reload" -PassThru

Start-Sleep -Seconds 2

Write-Host "[2/2] Launching DocuAudit Studio Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location -Path "$baseDir\frontend"
npm run dev

Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
