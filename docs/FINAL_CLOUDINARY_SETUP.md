# Final Cloudinary Setup - Create Upload Presets

**Status**: ⏳ FINAL STEP - Create Upload Presets in Cloudinary

---

## 🎯 What You Need to Do

Create two upload presets in Cloudinary:
1. `user_avatars` - For avatar uploads
2. `profile_banners` - For banner uploads

**Time**: 5 minutes

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Cloudinary Dashboard
Go to: https://cloudinary.com/console

### Step 2: Go to Upload Settings
1. Click **Settings** (gear icon) in top right
2. Click **Upload** tab
3. Scroll down to **Upload presets** section

### Step 3: Create First Preset - "user_avatars"

1. Click **Add upload preset** button
2. Fill in these fields:
   - **Preset name**: `user_avatars`
   - **Signing Mode**: Select **Unsigned** ← IMPORTANT!
   - **Folder**: `bug_website/avatars`
3. Click **Save**

### Step 4: Create Second Preset - "profile_banners"

1. Click **Add upload preset** button again
2. Fill in these fields:
   - **Preset name**: `profile_banners`
   - **Signing Mode**: Select **Unsigned** ← IMPORTANT!
   - **Folder**: `bug_website/banners`
3. Click **Save**

### Step 5: Verify Both Presets Exist

1. Scroll to **Upload presets** section
2. You should see:
   - ✅ `user_avatars` (Unsigned)
   - ✅ `profile_banners` (Unsigned)

---

## ✅ Preset Configuration

### Preset 1: user_avatars
```
Preset name: user_avatars
Signing Mode: Unsigned
Folder: bug_website/avatars
Resource type: Image (default)
```

### Preset 2: profile_banners
```
Preset name: profile_banners
Signing Mode: Unsigned
Folder: bug_website/banners
Resource type: Image (default)
```

---

## 🔍 Finding Upload Settings

If you can't find the Upload settings:

**Direct Link**: https://cloudinary.com/console/settings/upload

This will take you directly to the Upload settings page.

---

## ⚠️ Important Notes

- ✅ **Preset names MUST match exactly**:
  - `user_avatars` (not `user_avatar` or `avatars`)
  - `profile_banners` (not `profile_banner` or `banners`)

- ✅ **Signing Mode MUST be "Unsigned"**:
  - This allows uploads from client-side code
  - Don't select "Signed"

- ✅ **Folder paths are optional but recommended**:
  - Helps organize uploads
  - Makes it easier to find images later

---

## 📸 Visual Guide

### Finding Settings
```
Cloudinary Dashboard
    ↓
Settings (gear icon, top right)
    ↓
Upload tab
    ↓
Scroll down to "Upload presets"
```

### Creating a Preset
```
Click "Add upload preset"
    ↓
Enter preset name: user_avatars
    ↓
Select Signing Mode: Unsigned
    ↓
Enter Folder: bug_website/avatars
    ↓
Click Save
```

---

## 🆘 Troubleshooting

### Can't find Upload Settings?
- Use direct link: https://cloudinary.com/console/settings/upload
- Make sure you're logged in
- Try refreshing the page

### Can't find "Add upload preset" button?
- Scroll down in the Upload tab
- Look for "Upload presets" section
- Button should be next to the section title

### Presets don't appear after saving?
- Refresh the page
- Go back to Upload settings
- Scroll to Upload presets section

### Getting "Preset not found" error?
- Check preset name spelling (case-sensitive)
- Verify Signing Mode is "Unsigned"
- Refresh browser and try again

---

## ✅ After Creating Presets

Once you've created both presets:

1. **Restart dev server**
   ```bash
   npm run dev
   ```

2. **Test avatar upload**
   - Go to http://localhost:3002/profile/edit
   - Click "Upload Avatar"
   - Select a JPEG or PNG image (< 5MB)
   - Should upload successfully!

3. **Test banner upload**
   - Click "Upload Banner"
   - Select a JPEG or PNG image (< 10MB)
   - Should upload successfully!

4. **Verify in Cloudinary**
   - Go to Media Library
   - Check `bug_website/avatars/` folder
   - Check `bug_website/banners/` folder
   - You should see your uploaded images

---

## 📋 Checklist

- [ ] Opened Cloudinary Dashboard
- [ ] Went to Settings → Upload
- [ ] Created `user_avatars` preset (Unsigned)
- [ ] Created `profile_banners` preset (Unsigned)
- [ ] Both presets appear in Upload presets section
- [ ] Restarted dev server
- [ ] Tested avatar upload
- [ ] Tested banner upload
- [ ] Verified images in Cloudinary Media Library

---

## 🎯 Expected Results

### Before (Without Presets)
```
Error: Upload preset must be specified when using unsigned upload
```

### After (With Presets)
```
Upload starts
    ↓
Cloudinary accepts upload
    ↓
File uploads successfully (2-5 seconds)
    ↓
Image displays in profile
    ↓
Success notification shown
```

---

## 📞 Support

- Cloudinary Upload Presets: https://cloudinary.com/documentation/upload_presets
- Unsigned Uploads: https://cloudinary.com/documentation/upload_widget#unsigned_uploads

---

## 🚀 Next Steps

1. Go to Cloudinary Dashboard
2. Create `user_avatars` preset (Unsigned)
3. Create `profile_banners` preset (Unsigned)
4. Restart dev server: `npm run dev`
5. Test uploads on profile edit page

**Time**: 5 minutes

---

**Status**: ⏳ **AWAITING UPLOAD PRESET CREATION IN CLOUDINARY**

