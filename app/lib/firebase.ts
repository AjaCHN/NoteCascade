// app/lib/firebase.ts v2.1.6
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let analyticsInstance: Analytics | null = null;

export function getFirebase() {
  if (!app) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    if (!firebaseConfig.apiKey) {
      console.warn('Firebase API Key is missing. Firebase features will be disabled.');
      return { app: null, auth: null, db: null, analytics: null };
    }

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);

    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      try {
        analyticsInstance = getAnalytics(app);
      } catch (e) {
        console.warn('Firebase Analytics initialization failed', e);
      }
    }
  }
  return { app, auth: authInstance, db: dbInstance, analytics: analyticsInstance };
}
