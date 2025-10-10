#!/bin/bash

# Bash script to deploy Firebase Storage rules

echo "Deploying Firebase Storage rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Error: Firebase CLI is not installed."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if storage.rules file exists
if [ ! -f "storage.rules" ]; then
    echo "Error: storage.rules file not found in the current directory."
    exit 1
fi

# Deploy storage rules
echo "Deploying storage rules to Firebase..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo "✓ Storage rules deployed successfully!"
else
    echo "✗ Failed to deploy storage rules."
    exit 1
fi

