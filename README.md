# BUG Gaming Club Website

A modern, responsive web application for managing gaming tournaments, user profiles, and community features. Built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

## 🚀 Features

### ✅ Completed Features

- **Dashboard**: Comprehensive user dashboard with stats, tournaments, announcements, and activity feed
- **Global Announcement Bar**: Priority-based announcements displayed across all pages with dismiss functionality
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Theme Support**: Dark/light mode toggle
- **Component Architecture**: Reusable UI components with proper TypeScript types
- **Mock Data System**: Development-friendly mock data for testing

### 🔧 Current Implementation Status

- **Frontend**: Fully implemented dashboard with modern UI/UX
- **Backend**: Firebase integration structure in place (requires configuration)
- **Authentication**: Firebase Auth setup (requires API keys)
- **Database**: Firestore integration ready (requires configuration)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Backend**: Firebase (Auth + Firestore)
- **Deployment**: Vercel-ready

## 📱 Pages & Features

### Dashboard (`/dashboard-demo`)

- User profile overview with avatar and stats
- Tournament history and upcoming events
- Recent activity feed
- Achievements system
- Game-specific statistics
- Announcements with priority levels
- Quick action buttons

### Components

- **Navigation**: Global navigation with theme toggle and announcement bar integration
- **AnnouncementBar**: Global announcement system with priority-based styling and interactive features
  - Priority levels: Urgent (red), Important (orange), Normal (blue)
  - Auto-advance through multiple announcements (5-second intervals)
  - Navigation arrows for manual control
  - Dismiss functionality with session persistence
  - Responsive design for mobile and desktop
- **Responsive card layouts**: Flexible grid system for dashboard components
- **Badge system**: Status indicators with color-coded priorities
- **Avatar components**: User profile images with fallback initials
- **Button variants**: Multiple button styles and states

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. View Demo Dashboard

```bash
npm run dev
```

Then visit `http://localhost:3000/dashboard-demo` to see the fully functional dashboard with mock data.

### 3. Firebase Setup (Optional)

To enable full functionality with real data:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
5. Get your Firebase config and update `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard (requires Firebase)
│   ├── dashboard-demo/     # Demo dashboard with mock data
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # shadcn/ui components
│   └── Navigation.tsx     # Main navigation component
├── contexts/
│   └── AuthContext.tsx    # Firebase authentication context
├── lib/
│   ├── firebase.ts        # Firebase configuration
│   ├── database.ts        # Database operations
│   └── mockData.ts        # Mock data for development
└── types/
    └── types.ts           # TypeScript type definitions
```

## 🎨 Design System

- **Colors**: Custom color palette with dark/light mode support
- **Typography**: Responsive text scaling
- **Spacing**: Consistent spacing system
- **Components**: Reusable UI components with variants
- **Icons**: Lucide React icon library
- **Animations**: Smooth transitions and hover effects

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

## 📝 Next Steps

1. **Complete Firebase Setup**: Add your Firebase configuration to enable full functionality
2. **Add Authentication Pages**: Login, register, and profile management
3. **Tournament Management**: Create, edit, and manage tournaments
4. **User Management**: Admin panel for user management
5. **Real-time Features**: Live tournament updates and chat
6. **Mobile App**: React Native version for mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
