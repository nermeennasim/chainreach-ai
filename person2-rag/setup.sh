#!/bin/bash

echo " Content Retrieval Agent - Quick Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo " Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo " Docker is not installed. Please install Docker first."
    exit 1
fi

echo " Prerequisites check passed"
echo ""

# Create virtual environment
echo " Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo " Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo " Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo " Creating .env file..."
    cp .env.example .env
fi

# Start PostgreSQL
echo " Starting PostgreSQL with Docker..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo " Waiting for PostgreSQL to be ready..."
sleep 5

# Run ingestion
echo " Ingesting sample data..."
python ingestion.py

echo ""
echo " Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the API: python api.py"
echo "2. Visit: http://localhost:8000/docs"
echo "3. Test API: python test_api.py"
echo ""
