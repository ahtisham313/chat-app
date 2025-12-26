
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database";

 const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error("Firebase API key is missing. Check .env.local");
  }
  console.log("Firebase API key is found. Check .env.local");
  console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// Singleton app
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🚫 DO NOT create auth at top-level (causes SSR freeze)
// ✅ Lazy initialization - only create auth when accessed on client
let authInstance: ReturnType<typeof getAuth> | null = null;

function getAuthInstance() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used on the client side");
  }
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

// Export auth with lazy getter - Proxy only created on client
export const auth = (typeof window !== "undefined" 
  ? new Proxy({} as ReturnType<typeof getAuth>, {
      get(_target, prop) {
        const instance = getAuthInstance();
        const value = instance[prop as keyof ReturnType<typeof getAuth>];
        if (typeof value === "function") {
          return value.bind(instance);
        }
        return value;
      }
    })
  : null) as ReturnType<typeof getAuth>;

// 🚫 DO NOT create DB at top-level
let db: Database | null = null;

// ✅ Client-only DB initializer
export const getDb = () => {
  if (typeof window === "undefined") return null;

  if (!db) {
    db = getDatabase(app);
  }
  return db;
};

// Analytics (client-only + async safe)
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
