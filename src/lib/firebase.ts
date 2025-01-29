import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXfHX54ME2rwRZ4ZU1D1VF85XiS89k7pI",
  authDomain: "botnoicoach-demo01.firebaseapp.com",
  projectId: "botnoicoach-demo01",
  storageBucket: "botnoicoach-demo01.firebasestorage.app",
  messagingSenderId: "1087453507403",
  appId: "1:1087453507403:web:6e8c33a047fc479980c2ce",
  measurementId: "G-WPZ1PXF4GY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);