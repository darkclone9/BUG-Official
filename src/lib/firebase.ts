import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Tournament functions
export const getTournaments = async () => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(tournamentsRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
};

export const getUpcomingTournaments = async (limitCount = 3) => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(tournamentsRef, orderBy('date', 'asc'), limit(limitCount * 2));
    const querySnapshot = await getDocs(q);
    const tournaments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter upcoming tournaments on the client side
    const upcoming = tournaments
      .filter(tournament => {
        const tournamentDate = new Date(tournament.date);
        const now = new Date();
        return tournamentDate > now;
      })
      .slice(0, limitCount);
    
    return upcoming;
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    return [];
  }
};

export const createTournament = async (tournamentData: any) => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const docRef = await addDoc(tournamentsRef, {
      ...tournamentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

// User functions
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by points on the client side
    return users.sort((a, b) => (b.points || 0) - (a.points || 0));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getTopUsers = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(limitCount * 2));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by points on the client side
    const sortedUsers = users
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, limitCount)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    
    return sortedUsers;
  } catch (error) {
    console.error('Error fetching top users:', error);
    return [];
  }
};

// Announcement functions
export const getAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const createAnnouncement = async (announcementData: any) => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const docRef = await addDoc(announcementsRef, {
      ...announcementData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

// Auth functions
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user document in Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    await updateDoc(userRef, {
      displayName,
      email,
      points: 0,
      joinDate: new Date(),
      lastLoginDate: new Date(),
      role: 'member',
      isActive: true
    });
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in...');
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('Google sign-in successful:', user.email);
    
    // Check if user document exists, if not create one
    try {
      // Try to get the user document
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      
      if (userDoc.empty) {
        // Create user document for new Google user
        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          points: 0,
          joinDate: new Date(),
          lastLoginDate: new Date(),
          role: 'member',
          isActive: true,
          provider: 'google'
        });
        console.log('Created new user document for Google user');
      } else {
        // Update last login date for existing user
        const userDocRef = doc(db, 'users', userDoc.docs[0].id);
        await updateDoc(userDocRef, {
          lastLoginDate: new Date()
        });
        console.log('Updated existing user document');
      }
    } catch (docError) {
      // If there's an error with the document operations, still return the user
      console.warn('Error updating user document:', docError);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export { onAuthStateChanged };
export default app;

