@echo off
echo.
echo ======================================
echo ChainReach Segmentation API Server
echo ======================================
echo.
echo Starting server on port 8001...
echo.
cd /d "%~dp0"
call npm run dev
