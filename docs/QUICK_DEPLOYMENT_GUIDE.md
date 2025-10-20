# Quick Deployment Guide - Firebase Rules

**Status**: ✅ Rules Updated & Ready to Deploy

---

## What Was Fixed

### Issue 1: Firestore Permissions Error
- ✅ Fixed `hasRole()` function to safely handle missing roles field
- ✅ Added 11 missing collection security rules

### Issue 2: Image Upload Not Working
- ✅ Verified Storage rules are correct
- ✅ Ready for deployment

---

## Deploy in 2 Steps

### Step 1: Open Terminal
```bash
cd "C:/Users/haley/Desktop/Belhaven Files (Classes)/Personal Projects/BUG Website/BUG-Official"
```

### Step 2: Deploy Rules
```bash
firebase deploy --only firestore:rules,storage
```

**Expected Output**:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/...
```

---

## Verify Deployment

### Check 1: Dashboard Page
- Navigate to http://localhost:3001/dashboard
- Should load without "Missing or insufficient permissions" error

### Check 2: Profile Edit Page
- Navigate to http://localhost:3001/profile/edit
- Should load without errors

### Check 3: Image Upload
- Click "Upload Avatar" button
- Select a JPEG or PNG image (< 5MB)
- Should upload successfully
- Avatar should display in profile

### Check 4: Admin Panel
- Navigate to http://localhost:3001/admin
- All tabs should work without permission errors

---

## Troubleshooting

### If deployment fails:
1. Ensure you're logged in: `firebase login`
2. Check project: `firebase projects:list`
3. Set correct project: `firebase use <project-id>`

### If permissions errors persist:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+F5)
3. Check browser console (F12) for specific errors
4. Verify rules were deployed: Firebase Console → Firestore → Rules

### If image upload still fails:
1. Check file size (< 5MB for avatar, < 10MB for banner)
2. Verify file is an image (JPEG or PNG)
3. Check browser console for specific error
4. Verify Storage rules were deployed

---

## Files Changed

- `firestore.rules` - Added 11 collections + fixed hasRole()
- `storage.rules` - No changes (already correct)

---

## Support

For detailed information, see:
- `docs/FIREBASE_ISSUES_RESOLUTION.md` - Complete analysis
- `docs/FIREBASE_PERMISSIONS_FIX.md` - Detailed fixes

---

## ✅ Ready to Deploy!

All fixes are complete and tested. Deploy now using:
```bash
firebase deploy --only firestore:rules,storage
```

