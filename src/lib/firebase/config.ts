
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database";

// Get Firebase config - only validate on client side
function getFirebaseConfig() {
  if (typeof window === "undefined") {
    // Return empty config for SSR (will be validated on client)
    return {
      apiKey: "",
      authDomain: "",
      databaseURL: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      measurementId: "",
    };
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Validate required config values on client side
  const requiredFields = [
    { key: "apiKey", envVar: "NEXT_PUBLIC_FIREBASE_API_KEY", value: config.apiKey },
    { key: "authDomain", envVar: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: config.authDomain },
    { key: "projectId", envVar: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: config.projectId },
    { key: "appId", envVar: "NEXT_PUBLIC_FIREBASE_APP_ID", value: config.appId },
  ];

  const missingFields = requiredFields
    .filter((field) => !field.value || typeof field.value !== "string" || field.value.trim() === "")
    .map((field) => field.envVar);

  if (missingFields.length > 0) {
    throw new Error(
      `Firebase configuration is incomplete. Missing or invalid: ${missingFields.join(", ")}. ` +
      "Please check your .env.local file and ensure all required Firebase environment variables are set."
    );
  }

  return config;
}

// Initialize Firebase app only on client side
let appInstance: FirebaseApp | null = null;

function getAppInstance(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side");
  }

  if (!appInstance) {
    const config = getFirebaseConfig();
    appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
  }

  return appInstance;
}

// Export app getter - lazy initialization to avoid SSR issues
export const app = (typeof window !== "undefined" 
  ? (() => {
      try {
        return getAppInstance();
      } catch (error) {
        console.error("Firebase App initialization error:", error);
        throw error;
      }
    })()
  : null) as FirebaseApp;

// 🚫 DO NOT create auth at top-level (causes SSR freeze)
// ✅ Lazy initialization - only create auth when accessed on client
let authInstance: Auth | null = null;

function getAuthInstance(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used on the client side");
  }
  
  if (!authInstance) {
    const app = getAppInstance();
    authInstance = getAuth(app);
  }
  
  return authInstance;
}

// Export auth with lazy getter - Proxy only created on client
export const auth = (typeof window !== "undefined" 
  ? new Proxy({} as Auth, {
      get(_target, prop) {
        try {
          const instance = getAuthInstance();
          const value = instance[prop as keyof Auth];
          if (typeof value === "function") {
            return value.bind(instance);
          }
          return value;
        } catch (error) {
          console.error("Firebase Auth error:", error);
          throw error;
        }
      }
    })
  : null) as Auth;

// 🚫 DO NOT create DB at top-level
let db: Database | null = null;

// ✅ Client-only DB initializer
export const getDb = (): Database | null => {
  if (typeof window === "undefined") return null;

  if (!db) {
    try {
      const app = getAppInstance();
      db = getDatabase(app);
    } catch (error) {
      console.error("Firebase Database initialization error:", error);
      return null;
    }
  }
  return db;
};

// Analytics (client-only + async safe)
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    try {
      const app = getAppInstance();
      return getAnalytics(app);
    } catch (error) {
      console.error("Firebase Analytics initialization error:", error);
      return null;
    }
  }
  return null;
};
