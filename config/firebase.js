import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAGaDjAFdsUacF9N5hTlaE7EYXwLHxD3h4",
    authDomain: "intelliger-db683.firebaseapp.com",
    projectId: "intelliger-db683",
    storageBucket: "intelliger-db683.firebasestorage.app",
    messagingSenderId: "233594199024",
    appId: "1:233594199024:web:5896544220ed6190b15b35",
    measurementId: "G-1MLWR37TQS"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Use correct auth initialization based on platform
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app); // Use standard web auth
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);
export const usersRef = collection(db, 'users');
