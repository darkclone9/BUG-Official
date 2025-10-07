#!/bin/bash
# Deploy Firestore Rules Script
# This script deploys Firestore security rules and indexes to Firebase

echo "🚀 Deploying Firestore Rules..."
echo ""

# Check if Firebase CLI is installed
echo "Checking Firebase CLI installation..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed!"
    echo ""
    echo "Please install Firebase CLI first:"
    echo "  npm install -g firebase-tools"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "✅ Firebase CLI is installed"
echo ""

# Check if user is logged in
echo "Checking Firebase authentication..."
if ! firebase login:list &> /dev/null; then
    echo "❌ Not logged in to Firebase!"
    echo ""
    echo "Logging in to Firebase..."
    firebase login
    
    if [ $? -ne 0 ]; then
        echo "❌ Login failed!"
        exit 1
    fi
fi

echo "✅ Authenticated with Firebase"
echo ""

# Deploy Firestore rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy Firestore rules!"
    exit 1
fi

echo "✅ Firestore rules deployed successfully!"
echo ""

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to deploy Firestore indexes"
    echo "   This is optional and won't affect basic messaging functionality"
else
    echo "✅ Firestore indexes deployed successfully!"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Restart your dev server (Ctrl+C then 'npm run dev')"
echo "  2. Clear browser cache (Ctrl+Shift+R)"
echo "  3. Test messaging at http://localhost:3000/messages"
echo ""

