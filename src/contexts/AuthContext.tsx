import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { logger } from '../utils/logger';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, isAdmin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(email: string, password: string, displayName: string, isAdmin: boolean = false) {
    try {
      logger.info('User registration attempt', 'USER_REGISTER', { email });
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, { displayName });

      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        isAdmin,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      
      logger.info('User registration successful', 'USER_REGISTER_SUCCESS', 
        { userId: result.user.uid, email, isAdmin });
    } catch (error: any) {
      logger.error('User registration failed', 'USER_REGISTER_FAILED', 
        { email, error: error.message });
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      logger.info('User login attempt', 'USER_LOGIN', { email });
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      logger.info('User login successful', 'USER_LOGIN_SUCCESS', 
        { userId: result.user.uid, email });
    } catch (error: any) {
      logger.error('User login failed', 'USER_LOGIN_FAILED', 
        { email, error: error.message });
      throw error;
    }
  }

  async function logout() {
    try {
      const userId = currentUser?.uid;
      logger.info('User logout attempt', 'USER_LOGOUT', { userId });
      
      await signOut(auth);
      setUserProfile(null);
      
      logger.info('User logout successful', 'USER_LOGOUT_SUCCESS', { userId });
    } catch (error: any) {
      logger.error('User logout failed', 'USER_LOGOUT_FAILED', 
        { error: error.message });
      throw error;
    }
  }

  async function fetchUserProfile(user: User) {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);
        logger.info('User profile fetched', 'FETCH_USER_PROFILE', 
          { userId: user.uid, isAdmin: profile.isAdmin });
      } else {
        logger.warn('User profile not found', 'FETCH_USER_PROFILE_NOT_FOUND', 
          { userId: user.uid });
      }
    } catch (error: any) {
      logger.error('Failed to fetch user profile', 'FETCH_USER_PROFILE_FAILED', 
        { userId: user.uid, error: error.message });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}