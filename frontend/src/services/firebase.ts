import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDF5gFulzYnljQRs6MtMb4k6d7gJoi9uI8",
  authDomain: "phantom-x-efb92.firebaseapp.com",
  projectId: "phantom-x-efb92",
  storageBucket: "phantom-x-efb92.firebasestorage.app",
  messagingSenderId: "168545839703",
  appId: "1:168545839703:web:44a4548d02fe5f81605112",
  measurementId: "G-C03BWMXP4N"
};

// Initialize Firebase safely (avoid multiple initializations)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Initialize Analytics if supported in current browser environment
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[PHANTOM X] Firebase Analytics initialized successfully:", firebaseConfig.projectId);
    }
  }).catch((err) => {
    console.warn("[PHANTOM X] Firebase Analytics unavailable in current context:", err);
  });
}
