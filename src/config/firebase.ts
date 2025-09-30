// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvD8fHBm8KWjUezoQTgQ2yIxNxaiINXek",
  authDomain: "sport-buddy-31c0c.firebaseapp.com",
  projectId: "sport-buddy-31c0c",
  storageBucket: "sport-buddy-31c0c.firebasestorage.app",
  messagingSenderId: "823231220319",
  appId: "1:823231220319:web:fd972be73fa4a360f6e9ea",
  measurementId: "G-KNXE5SFH5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;