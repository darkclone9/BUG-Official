# Cloudinary Upload Presets Setup

**Status**: ⏳ REQUIRED - Create Upload Presets

---

## 🎯 What Are Upload Presets?

Upload presets are configurations in Cloudinary that define how uploads should be handled. They're required for unsigned uploads (uploads from client-side code).

---

## 🚀 Create Upload Presets

### Step 1: Go to Cloudinary Dashboard
1. Open: https://cloudinary.com/console
2. Log in with your account
3. You should see your dashboard

### Step 2: Navigate to Upload Settings
1. Click **Settings** (gear icon) in the top right
2. Go to **Upload** tab
3. Scroll down to **Upload presets** section

### Step 3: Create First Preset - "user_avatars"

1. Click **Add upload preset** button
2. Fill in the form:
   - **Preset name**: `user_avatars`
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `bug_website/avatars`
   - **Resource type**: Image
   - **Format**: Auto (or keep default)
   - **Quality**: Auto (or keep default)

3. Click **Save** button

### Step 4: Create Second Preset - "profile_banners"

1. Click **Add upload preset** button again
2. Fill in the form:
   - **Preset name**: `profile_banners`
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `bug_website/banners`
   - **Resource type**: Image
   - **Format**: Auto (or keep default)
   - **Quality**: Auto (or keep default)

3. Click **Save** button

---

## ✅ Verification

After creating both presets:

1. Go back to **Upload** settings
2. Scroll to **Upload presets** section
3. You should see:
   - ✅ `user_avatars` (Unsigned)
   - ✅ `profile_banners` (Unsigned)

---

## 📋 Preset Details

### user_avatars Preset
```
Name: user_avatars
Signing Mode: Unsigned
Folder: bug_website/avatars
Resource Type: Image
```

### profile_banners Preset
```
Name: profile_banners
Signing Mode: Unsigned
Folder: bug_website/banners
Resource Type: Image
```

---

## 🔍 Visual Guide

### Finding Upload Settings
```
Cloudinary Dashboard
  ↓
Settings (gear icon)
  ↓
Upload tab
  ↓
Scroll to "Upload presets"
  ↓
Click "Add upload preset"
```

### Creating a Preset
```
Preset name: user_avatars
Signing Mode: Unsigned ← IMPORTANT!
Folder: bug_website/avatars
Click Save
```

---

## ⚠️ Important Notes

- ✅ **Signing Mode must be "Unsigned"** - This allows client-side uploads
- ✅ **Preset names must match exactly** - `user_avatars` and `profile_banners`
- ✅ **Folder paths are optional** - But recommended for organization
- ✅ **Both presets are required** - One for avatars, one for banners

---

## 🆘 Troubleshooting

### If you can't find Upload Settings:
1. Make sure you're logged in
2. Go to: https://cloudinary.com/console/settings/upload
3. This should take you directly to Upload settings

### If "Add upload preset" button is missing:
1. Scroll down in the Upload tab
2. Look for "Upload presets" section
3. Click the button next to it

### If presets don't appear after saving:
1. Refresh the page
2. Go back to Upload settings
3. Scroll to Upload presets section

---

## 📸 Step-by-Step Screenshots

### Step 1: Open Settings
```
Dashboard → Settings (gear icon) → Upload tab
```

### Step 2: Find Upload Presets
```
Scroll down to "Upload presets" section
```

### Step 3: Add Preset
```
Click "Add upload preset" button
```

### Step 4: Fill Form
```
Preset name: user_avatars
Signing Mode: Unsigned
Folder: bug_website/avatars
Click Save
```

### Step 5: Repeat for Second Preset
```
Preset name: profile_banners
Signing Mode: Unsigned
Folder: bug_website/banners
Click Save
```

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
   - Select image
   - Should upload successfully!

3. **Test banner upload**
   - Click "Upload Banner"
   - Select image
   - Should upload successfully!

---

## 🎯 Next Steps

1. Go to Cloudinary Dashboard
2. Create `user_avatars` preset (Unsigned)
3. Create `profile_banners` preset (Unsigned)
4. Restart dev server
5. Test uploads

**Time**: 5 minutes

---

## 📞 Support

- Cloudinary Upload Presets: https://cloudinary.com/documentation/upload_presets
- Unsigned Uploads: https://cloudinary.com/documentation/upload_widget#unsigned_uploads

---

**Status**: ⏳ **AWAITING UPLOAD PRESET CREATION**

