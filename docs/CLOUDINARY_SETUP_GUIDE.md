# Cloudinary Setup Guide - Completely Free

**Cost**: $0 (No credit card required)  
**Time**: 5 minutes

---

## ✅ Why Cloudinary?

- ✅ Completely free
- ✅ No credit card required
- ✅ 25 GB free storage
- ✅ Automatic image optimization
- ✅ Fast CDN delivery
- ✅ Easy integration

---

## 🚀 Setup Steps

### Step 1: Create Free Account
1. Go to: https://cloudinary.com/users/register/free
2. Enter email
3. Create password
4. Click "Sign Up"
5. Verify email
6. Done! (No credit card required)

### Step 2: Get Your Credentials
1. Log in to Cloudinary Dashboard
2. Look for "Cloud Name" at the top
3. Copy it (you'll need it)
4. Go to Settings → API Keys
5. Copy your API Key
6. Copy your API Secret

### Step 3: Add to Environment Variables
Create or edit `.env.local` in your project root:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example**:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz1234
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefghijk
```

### Step 4: Install Cloudinary Package
```bash
npm install next-cloudinary
```

### Step 5: Update Upload Functions
Replace the Firebase Storage upload functions with Cloudinary.

See the implementation guide below.

### Step 6: Test
1. Restart dev server: `npm run dev`
2. Go to profile edit page
3. Upload avatar
4. Should work!

---

## 💻 Implementation

### Update `src/lib/database.ts`

Replace the `uploadUserAvatar` and `uploadProfileBanner` functions:

```typescript
export const uploadUserAvatar = async (
  userId: string,
  file: File,
  timeoutMs: number = 60000
): Promise<string> => {
  try {
    console.log('Starting avatar upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Create FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'user_avatars');
    formData.append('public_id', `avatar_${userId}_${Date.now()}`);
    formData.append('folder', 'bug_website/avatars');

    console.log('Uploading file to Cloudinary...');

    // Upload to Cloudinary
    const uploadPromise = fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    ).then(res => res.json());

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout - please try again')), timeoutMs)
    );

    const data = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (data.error) {
      throw new Error(data.error.message || 'Upload failed');
    }

    console.log('File uploaded successfully:', data.secure_url);

    // Update user document with new avatar URL
    console.log('Updating user document with avatar URL...');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avatarUrl: data.secure_url,
      updatedAt: Timestamp.now()
    });
    console.log('User document updated successfully');

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const uploadProfileBanner = async (
  userId: string,
  file: File,
  timeoutMs: number = 60000
): Promise<string> => {
  try {
    console.log('Starting banner upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Create FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'profile_banners');
    formData.append('public_id', `banner_${userId}_${Date.now()}`);
    formData.append('folder', 'bug_website/banners');

    console.log('Uploading file to Cloudinary...');

    // Upload to Cloudinary
    const uploadPromise = fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    ).then(res => res.json());

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout - please try again')), timeoutMs)
    );

    const data = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (data.error) {
      throw new Error(data.error.message || 'Upload failed');
    }

    console.log('File uploaded successfully:', data.secure_url);

    // Update user document with new banner URL
    console.log('Updating user document with banner URL...');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bannerUrl: data.secure_url,
      updatedAt: Timestamp.now()
    });
    console.log('User document updated successfully');

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading banner:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to upload banner: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
```

---

## 🔧 Create Upload Presets (Optional but Recommended)

In Cloudinary Dashboard:
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Create preset "user_avatars"
   - Folder: bug_website/avatars
   - Unsigned: Yes
4. Create preset "profile_banners"
   - Folder: bug_website/banners
   - Unsigned: Yes

---

## ✅ Verification

After setup:

1. **Check Environment Variables**
   ```bash
   # Verify .env.local has:
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Restart Dev Server**
   ```bash
   npm run dev
   ```

3. **Test Avatar Upload**
   - Go to http://localhost:3000/profile/edit
   - Click "Upload Avatar"
   - Select JPEG/PNG image
   - Should upload successfully

4. **Check Cloudinary Dashboard**
   - Go to Media Library
   - You should see uploaded images in folders

---

## 🆘 Troubleshooting

### If upload fails with "Upload preset not found":
1. Go to Cloudinary Dashboard
2. Settings → Upload
3. Create upload presets (see above)
4. Or remove `upload_preset` from code

### If you see "CORS error":
1. Go to Cloudinary Settings
2. Security → Allowed domains
3. Add your domain (e.g., localhost:3000)

### If environment variables not loading:
1. Restart dev server: `npm run dev`
2. Verify `.env.local` file exists
3. Verify variables are correct

---

## 📊 Cloudinary Free Tier

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Uploads**: Unlimited
- **Image Optimization**: Included
- **CDN**: Global
- **Cost**: $0

---

## 🎯 Next Steps

1. Sign up at https://cloudinary.com/users/register/free
2. Get your Cloud Name, API Key, API Secret
3. Add to `.env.local`
4. Install package: `npm install next-cloudinary`
5. Update upload functions (code above)
6. Restart dev server
7. Test uploads

**Total time**: 15 minutes  
**Cost**: $0

---

**Status**: 🟢 **READY TO IMPLEMENT**

