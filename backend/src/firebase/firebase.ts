import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import logger from "../utils/logger.js";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

let app;
let auth: any;
let isClientFirebaseConfigured = false;

// Only initialize if api key is provided and not a placeholder
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "mock-api-key" && firebaseConfig.apiKey.trim() !== "") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    isClientFirebaseConfigured = true;
    logger.info("Firebase Client SDK initialized.");
  } catch (error) {
    logger.error("Failed to initialize Firebase Client SDK: " + error);
  }
} else {
  logger.warn("Firebase client configuration missing or placeholder. Firebase Auth client SDK will run in MOCK mode.");
}

// Fallback Mock Client Auth for backend authentication routes
if (!isClientFirebaseConfigured) {
  auth = {
    currentUser: null,
    // Add mock sign in / sign out methods if needed by client flows
    signInWithEmailAndPassword: async (email: string, pass: string) => {
      logger.info(`Mock login verification for user ${email}`);
      return {
        user: {
          uid: `mock-uid-${Buffer.from(email).toString("hex").substring(0, 10)}`,
          email,
          displayName: email.split("@")[0],
          emailVerified: true
        }
      };
    }
  };
}

export { app, auth, isClientFirebaseConfigured };
