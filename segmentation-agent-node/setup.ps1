# ChainReach Segmentation Agent - Quick Start Script
# Run this after setting up your database credentials in .env

Write-Host "🚀 ChainReach Segmentation Agent - Quick Start" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env with your database credentials!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required settings:" -ForegroundColor Yellow
    Write-Host "  - DB_HOST (PostgreSQL host)" -ForegroundColor Yellow
    Write-Host "  - DB_PASSWORD (PostgreSQL password)" -ForegroundColor Yellow
    Write-Host "  - AZURE_OPENAI_ENDPOINT (optional, for AI features)" -ForegroundColor Yellow
    Write-Host "  - AZURE_OPENAI_KEY (optional, for AI features)" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Have you configured .env? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please configure .env and run this script again" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🏗️  Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "1️⃣  Initialize database:" -ForegroundColor White
Write-Host "   psql -U postgres -d chainreach_db -f scripts\init-db.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Or start production server:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Test the API:" -ForegroundColor White
Write-Host "   Invoke-RestMethod -Uri http://localhost:8001/health" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣  Deploy to Azure:" -ForegroundColor White
Write-Host "   See AZURE_DEPLOY.md for deployment instructions" -ForegroundColor Gray
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md - API documentation" -ForegroundColor Gray
Write-Host "   - AZURE_DEPLOY.md - Deployment guide" -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Cyan
