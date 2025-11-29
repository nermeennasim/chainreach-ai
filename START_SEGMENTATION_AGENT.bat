@echo off
REM Start the segmentation agent in a separate window that stays open
cd /d "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segmentation-agent-node"
start "ChainReach Segmentation Agent" cmd /k "npm start"
timeout /t 3 /nobreak
