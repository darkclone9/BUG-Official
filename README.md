## Setup

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set Firestore rules to `firestore.rules.txt` (just copy and paste the content)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web icon
   - Copy the config object
6. Create `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Vercel Setup

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Sign in with GitHub
4. Click "New Project"
5. Import your GitHub repository
6. Add environment variables:
   - Go to Project Settings > Environment Variables
   - Add all the Firebase environment variables from your `.env.local`
7. Click "Deploy"

## Running Locally

```bash
npm install
npm run dev
```

Open (http://localhost:3000) in your browser.