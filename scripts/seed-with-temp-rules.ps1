# Seed Test Tournament with Temporary Firestore Rules
# This script:
# 1. Backs up current Firestore rules
# 2. Deploys temporary permissive rules
# 3. Waits for you to run the seeding from the web UI
# 4. Restores original rules

Write-Host "🔧 Seed Test Tournament Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if firebase CLI is installed
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCmd) {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

$firebaseVersion = firebase --version
Write-Host "✓ Firebase CLI found: $firebaseVersion" -ForegroundColor Green

# Backup current rules
Write-Host ""
Write-Host "📋 Step 1: Backing up current Firestore rules..." -ForegroundColor Yellow
Copy-Item "firestore.rules" "firestore.rules.backup" -Force
Write-Host "✓ Backup created: firestore.rules.backup" -ForegroundColor Green

# Deploy temporary rules
Write-Host ""
Write-Host "🚀 Step 2: Deploying temporary permissive rules..." -ForegroundColor Yellow
Copy-Item "firestore.rules.temp" "firestore.rules" -Force
firebase deploy --only firestore:rules

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy temporary rules" -ForegroundColor Red
    Write-Host "   Restoring original rules..." -ForegroundColor Yellow
    Copy-Item "firestore.rules.backup" "firestore.rules" -Force
    exit 1
}

Write-Host "✓ Temporary rules deployed successfully" -ForegroundColor Green

# Instructions for user
Write-Host ""
Write-Host "✅ Ready to seed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Go to: http://localhost:3002/admin/seed-tournament" -ForegroundColor White
Write-Host "   2. Click 'Create Test Tournament' button" -ForegroundColor White
Write-Host "   3. Wait for the tournament to be created" -ForegroundColor White
Write-Host "   4. Come back here and press ENTER to restore original rules" -ForegroundColor White
Write-Host ""

# Wait for user
Read-Host "Press ENTER after you've created the test tournament"

# Restore original rules
Write-Host ""
Write-Host "🔄 Step 3: Restoring original Firestore rules..." -ForegroundColor Yellow
Copy-Item "firestore.rules.backup" "firestore.rules" -Force
firebase deploy --only firestore:rules

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restore original rules" -ForegroundColor Red
    Write-Host "   Please manually restore from firestore.rules.backup" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Original rules restored successfully" -ForegroundColor Green

# Cleanup
Write-Host ""
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item "firestore.rules.backup" -Force
Write-Host "✓ Cleanup complete" -ForegroundColor Green

Write-Host ""
Write-Host "✅ All done! Your test tournament should be ready at:" -ForegroundColor Green
Write-Host "   http://localhost:3002/tournaments/test-bracket-8" -ForegroundColor Cyan
Write-Host ""
