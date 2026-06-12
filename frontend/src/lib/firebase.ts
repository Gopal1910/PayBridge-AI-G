import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

let app;
let auth: any = null;
let googleProvider: any = null;
let isFirebaseInitialized = false;

// Check if variables are set
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "mock-api-key") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseInitialized = true;
  } catch (error) {
    console.warn("Failed to initialize Firebase Client SDK:", error);
  }
}

export { auth, googleProvider, isFirebaseInitialized };
