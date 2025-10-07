# Messaging System Troubleshooting Guide

## 🚨 Current Issue: "Failed to load conversations" Errors

If you're seeing these errors on the `/messages` page:
- "Failed to load conversations"
- "Failed to start conversation"

This is most likely due to **Firestore Security Rules not being deployed**.

---

## ✅ Solution: Deploy Firestore Rules

### **Option 1: Firebase Console (Recommended for Quick Fix)**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: `bug-96c26`

2. **Navigate to Firestore Rules:**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab at the top

3. **Copy the rules from `firestore.rules`:**
   - Open `firestore.rules` in your project
   - Copy ALL the content (Ctrl+A, Ctrl+C)

4. **Paste into Firebase Console:**
   - Delete all existing rules in the Firebase Console
   - Paste your copied rules
   - Click "Publish" button

5. **Wait for deployment:**
   - Should take 10-30 seconds
   - You'll see a success message

6. **Test the messaging system:**
   - Refresh your browser (Ctrl+Shift+R)
   - Go to `/messages`
   - Errors should be gone!

---

### **Option 2: Firebase CLI (Automated)**

If you have Firebase CLI installed:

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes too (for better performance)
firebase deploy --only firestore:indexes
```

---

## 🔍 How to Verify Rules Are Deployed

1. **Check Firebase Console:**
   - Go to Firestore Database → Rules
   - Look for the `conversations` and `messages` rules
   - Should see rules like:
     ```
     match /conversations/{conversationId} {
       allow read: if isSignedIn() &&
                      request.auth.uid in resource.data.participants;
       ...
     }
     ```

2. **Check in Browser Console:**
   - Open DevTools (F12) → Console
   - Try to load conversations
   - If you see "permission-denied" errors, rules aren't deployed correctly
   - If you see different errors, share them for further diagnosis

---

## 🐛 Common Error Messages & Solutions

### **Error: "Missing or insufficient permissions"**
**Cause:** Firestore rules not deployed or too restrictive  
**Solution:** Deploy rules using Option 1 or 2 above

### **Error: "Failed to get document because the client is offline"**
**Cause:** No internet connection or Firebase not initialized  
**Solution:** 
- Check internet connection
- Verify Firebase config in `.env.local`
- Restart dev server

### **Error: "PERMISSION_DENIED: Missing or insufficient permissions"**
**Cause:** User not authenticated or rules too restrictive  
**Solution:**
- Make sure you're logged in
- Check that `isSignedIn()` function exists in rules
- Verify user has proper authentication

### **Error: "The query requires an index"**
**Cause:** Missing Firestore composite index  
**Solution:** 
- This should be fixed in the latest code (client-side sorting)
- If still seeing this, deploy indexes: `firebase deploy --only firestore:indexes`

---

## 📋 Checklist Before Testing Messaging

- [ ] Firestore rules deployed to Firebase
- [ ] Environment variables set correctly (no leading spaces)
- [ ] Development server restarted
- [ ] Browser cache cleared
- [ ] User is logged in
- [ ] Internet connection active
- [ ] Firebase project is active (no billing issues)

---

## 🔧 Advanced Debugging

### **Check Firestore Connection:**

Add this to your browser console:

```javascript
// Check if Firebase is initialized
console.log('Firebase app:', firebase.app());

// Check current user
console.log('Current user:', firebase.auth().currentUser);

// Try to read from Firestore
firebase.firestore().collection('conversations').get()
  .then(snapshot => console.log('Conversations:', snapshot.size))
  .catch(err => console.error('Firestore error:', err));
```

### **Enable Firestore Debug Logging:**

Add this to `src/lib/firebase.ts`:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable debug logging
if (typeof window !== 'undefined') {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
```

### **Check Network Requests:**

1. Open DevTools (F12) → Network tab
2. Filter by "firestore"
3. Try to load conversations
4. Look for failed requests (red)
5. Click on failed request → Preview tab
6. Share the error message

---

## 🎯 Most Likely Solution

**99% of the time, the issue is:**
1. **Firestore rules not deployed** → Deploy using Option 1 above
2. **User not logged in** → Log in at `/login`
3. **Browser cache** → Hard refresh (Ctrl+Shift+R)

---

## 📞 Still Having Issues?

If you've tried everything above and still seeing errors:

1. **Share the exact error from browser console:**
   - Open DevTools (F12) → Console
   - Copy the full error message
   - Include the stack trace

2. **Share your Firebase project details:**
   - Project ID: `bug-96c26`
   - Are you on the free plan or paid plan?
   - Any billing issues?

3. **Share screenshots:**
   - Messages page showing errors
   - Browser console showing errors
   - Network tab showing failed requests

4. **Try the test conversation:**
   - Go to a user profile
   - Click "Send Message"
   - What happens?
   - Any errors in console?

---

## ✅ Success Indicators

You'll know messaging is working when:
- ✅ No error toasts on `/messages` page
- ✅ "No conversations yet" message appears (if you have no conversations)
- ✅ Can click "Send Message" on user profiles
- ✅ Redirects to `/messages` with conversation started
- ✅ Can type and send messages
- ✅ Messages appear in the conversation
- ✅ No errors in browser console

---

## 🚀 Next Steps After Fixing

Once messaging is working:

1. **Test all features:**
   - Direct messages
   - Tournament chat
   - Message notifications
   - Typing indicators (if enabled)

2. **Optimize performance:**
   - Deploy Firestore indexes
   - Enable offline persistence
   - Add message pagination

3. **Add moderation:**
   - Set up content moderation API
   - Add report message feature
   - Create admin moderation dashboard

---

## 📚 Related Documentation

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Environment Setup](./ENVIRONMENT.md)
- [Bug Report Setup](./BUG_REPORT_SETUP.md)

