# Upload Timeout Issue - Analysis & Fix

**Date**: October 19, 2025  
**Status**: ✅ FIXED

---

## Issue Description

When attempting to upload avatar or banner images on the profile edit page, users receive the error:
```
Upload timeout - please try again
```

This error occurs after approximately 30 seconds of attempting to upload.

---

## Root Cause Analysis

### Primary Cause: Firebase Storage Permissions
The upload timeout is likely caused by **Firebase Storage rules not being deployed yet**. When the Storage rules haven't been deployed, Firebase Storage defaults to denying all write operations, which causes the upload to hang indefinitely until the timeout is triggered.

### Secondary Cause: Insufficient Timeout Duration
The original 30-second timeout was too short for:
- Initial Firebase connection establishment
- File validation
- Network latency
- Firebase Storage processing

---

## Fix Applied

### Change 1: Increased Upload Timeout
**File**: `src/lib/database.ts`

**Function**: `uploadUserAvatar()` (Line 3529)
```typescript
// BEFORE
timeoutMs: number = 30000  // 30 seconds

// AFTER
timeoutMs: number = 60000  // 60 seconds
```

**Function**: `uploadProfileBanner()` (Line 3588)
```typescript
// BEFORE
timeoutMs: number = 30000  // 30 seconds

// AFTER
timeoutMs: number = 60000  // 60 seconds
```

### Why This Helps
- Gives Firebase Storage more time to respond
- Allows for network latency
- Provides buffer for initial connection establishment
- Still reasonable timeout (1 minute) to catch actual failures

---

## Critical Next Step: Deploy Firebase Storage Rules

**⚠️ IMPORTANT**: The upload timeout issue will persist until Firebase Storage rules are deployed!

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### Or Deploy Both Rules
```bash
firebase deploy --only firestore:rules,storage
```

---

## How the Upload Process Works

```
1. User selects image file
2. File validation (type, size)
3. Create Firebase Storage reference
4. Start upload with 60-second timeout
5. Upload completes (or timeout triggers)
6. Get download URL
7. Update Firestore user document
8. Return download URL
```

### Timeout Protection
The upload uses `Promise.race()` to implement timeout:
```typescript
const uploadPromise = uploadBytes(storageRef, file);
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Upload timeout - please try again')), timeoutMs)
);

const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
```

If either promise completes first, that result is used. If timeout completes first, the error is thrown.

---

## Testing After Deployment

### Test 1: Avatar Upload
1. Navigate to http://localhost:3000/profile/edit
2. Click "Upload Avatar" button
3. Select a JPEG or PNG image (< 5MB)
4. Monitor browser console (F12)
5. Expected: Upload completes within 60 seconds
6. Expected: Avatar displays in profile
7. Expected: Success toast notification

### Test 2: Banner Upload
1. Click "Upload Banner" button
2. Select a JPEG or PNG image (< 10MB)
3. Monitor browser console
4. Expected: Upload completes within 60 seconds
5. Expected: Banner displays in profile
6. Expected: Success toast notification

### Test 3: Large File Upload
1. Try uploading a 4.9MB avatar image
2. Expected: Upload completes successfully
3. Expected: No timeout error

### Test 4: Error Handling
1. Try uploading a non-image file (e.g., .txt)
2. Expected: Error message "File must be an image"
3. Try uploading a file > 5MB
4. Expected: Error message "File size must be less than 5MB"

---

## Console Logs for Debugging

When uploading, the browser console should show:
```
Starting avatar upload for user: [userId]
File details: { name: "image.jpg", size: 1234567, type: "image/jpeg" }
Storage reference created: user-avatars/[userId]_[timestamp]_image.jpg
Uploading file to Firebase Storage...
File uploaded successfully, getting download URL...
Download URL obtained: https://firebasestorage.googleapis.com/...
Updating user document with avatar URL...
User document updated successfully
```

If you see "Upload timeout - please try again", it means:
1. Firebase Storage rules haven't been deployed
2. Network is very slow
3. Firebase Storage is experiencing issues

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| src/lib/database.ts | Increased timeout from 30s to 60s | 3529, 3588 |

---

## Deployment Checklist

- [ ] Deploy Firebase Storage rules: `firebase deploy --only storage`
- [ ] Wait for deployment to complete
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Refresh page (Ctrl+F5)
- [ ] Test avatar upload
- [ ] Test banner upload
- [ ] Verify images display correctly
- [ ] Check browser console for errors

---

## Summary

| Item | Status | Details |
|------|--------|---------|
| Timeout increased | ✅ Done | 30s → 60s |
| Code updated | ✅ Done | Both upload functions |
| Storage rules | ⏳ Pending | Must deploy: `firebase deploy --only storage` |
| Testing | ⏳ Pending | After rules deployment |

---

## Next Steps

1. **Deploy Storage Rules** (CRITICAL)
   ```bash
   firebase deploy --only storage
   ```

2. **Test Image Uploads**
   - Avatar upload
   - Banner upload
   - Verify images display

3. **Monitor for Issues**
   - Check browser console
   - Verify no timeout errors
   - Confirm uploads complete

---

## Additional Notes

- The 60-second timeout is still reasonable for catching actual failures
- If uploads still timeout after rules deployment, check:
  - Network connectivity
  - Firebase Storage quota
  - File size (must be < 5MB for avatar, < 10MB for banner)
  - File type (must be image/*)
  - Browser console for specific Firebase errors

**Status**: 🟡 **PARTIALLY FIXED - AWAITING STORAGE RULES DEPLOYMENT**

