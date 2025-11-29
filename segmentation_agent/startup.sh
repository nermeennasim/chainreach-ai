#!/bin/bash
echo "=== Starting ChainReach Segmentation API ==="
echo "Python version:"
python --version
echo "Working directory:"
pwd
echo "Files in current directory:"
ls -la
echo "Files in models directory:"
ls -la models/ 2>/dev/null || echo "No models directory"
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting gunicorn..."
gunicorn --bind=0.0.0.0:8000 --timeout 600 --workers 1 --access-logfile '-' --error-logfile '-' --log-level debug app:app
