#!/bin/bash

# Seed Test Tournament with Temporary Firestore Rules
# This script:
# 1. Backs up current Firestore rules
# 2. Deploys temporary permissive rules
# 3. Waits for you to run the seeding from the web UI
# 4. Restores original rules

echo "🔧 Seed Test Tournament Helper"
echo "================================"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

FIREBASE_VERSION=$(firebase --version)
echo "✓ Firebase CLI found: $FIREBASE_VERSION"

# Backup current rules
echo ""
echo "📋 Step 1: Backing up current Firestore rules..."
cp firestore.rules firestore.rules.backup
echo "✓ Backup created: firestore.rules.backup"

# Deploy temporary rules
echo ""
echo "🚀 Step 2: Deploying temporary permissive rules..."
cp firestore.rules.temp firestore.rules
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy temporary rules"
    echo "   Restoring original rules..."
    cp firestore.rules.backup firestore.rules
    exit 1
fi

echo "✓ Temporary rules deployed successfully"

# Instructions for user
echo ""
echo "✅ Ready to seed!"
echo ""
echo "📝 Next steps:"
echo "   1. Go to: http://localhost:3002/admin/seed-tournament"
echo "   2. Click 'Create Test Tournament' button"
echo "   3. Wait for the tournament to be created"
echo "   4. Come back here and press ENTER to restore original rules"
echo ""

# Wait for user
read -p "Press ENTER after you've created the test tournament"

# Restore original rules
echo ""
echo "🔄 Step 3: Restoring original Firestore rules..."
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Failed to restore original rules"
    echo "   Please manually restore from firestore.rules.backup"
    exit 1
fi

echo "✓ Original rules restored successfully"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm firestore.rules.backup
echo "✓ Cleanup complete"

echo ""
echo "✅ All done! Your test tournament should be ready at:"
echo "   http://localhost:3002/tournaments/test-bracket-8"
echo ""

