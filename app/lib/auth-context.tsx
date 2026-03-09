// app/lib/auth-context.tsx v2.7.0
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { UserRole, Permissions, getPermissions } from './permissions';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  permissions: Permissions;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const { auth, db } = getFirebase();

  useEffect(() => {
    if (!auth) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newUserRole: UserRole = 'user';
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: newUserRole,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            settings: {
              theme: 'dark',
              language: 'en'
            }
          });
          setRole(newUserRole);
        } else {
          const userData = userSnap.data();
          setRole(userData.role || 'user');
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
      } else {
        setRole('guest');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const signInWithGithub = async () => {
    if (!auth) return;
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('GitHub sign in error:', error);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const permissions = getPermissions(role);
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      permissions, 
      loading, 
      isAdmin, 
      signInWithGoogle, 
      signInWithGithub, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
