# PowerShell script to deploy Firebase Storage rules

Write-Host "Deploying Firebase Storage rules..." -ForegroundColor Cyan

# Check if Firebase CLI is installed
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Firebase CLI is not installed." -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if storage.rules file exists
if (!(Test-Path "storage.rules")) {
    Write-Host "Error: storage.rules file not found in the current directory." -ForegroundColor Red
    exit 1
}

# Deploy storage rules
Write-Host "Deploying storage rules to Firebase..." -ForegroundColor Yellow
firebase deploy --only storage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Storage rules deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to deploy storage rules." -ForegroundColor Red
    exit 1
}

