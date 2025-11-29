@echo off
REM Start RAG API
cd /d "%~dp0"
python -m uvicorn api_test:app --host 0.0.0.0 --port 8000 --reload
