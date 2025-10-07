# Deploy Firestore Rules Script
# This script deploys Firestore security rules and indexes to Firebase

Write-Host "🚀 Deploying Firestore Rules..." -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI installation..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Firebase CLI first:" -ForegroundColor Yellow
    Write-Host "  npm install -g firebase-tools" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase CLI is installed" -ForegroundColor Green
Write-Host ""

# Check if user is logged in
Write-Host "Checking Firebase authentication..." -ForegroundColor Yellow
$loginCheck = firebase login:list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Logging in to Firebase..." -ForegroundColor Yellow
    firebase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated with Firebase" -ForegroundColor Green
Write-Host ""

# Deploy Firestore rules
Write-Host "📋 Deploying Firestore security rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Firestore rules!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Firestore rules deployed successfully!" -ForegroundColor Green
Write-Host ""

# Deploy Firestore indexes
Write-Host "📊 Deploying Firestore indexes..." -ForegroundColor Cyan
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Failed to deploy Firestore indexes" -ForegroundColor Yellow
    Write-Host "   This is optional and won't affect basic messaging functionality" -ForegroundColor Gray
} else {
    Write-Host "✅ Firestore indexes deployed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
Write-Host "  2. Clear browser cache (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "  3. Test messaging at http://localhost:3000/messages" -ForegroundColor White
Write-Host ""

