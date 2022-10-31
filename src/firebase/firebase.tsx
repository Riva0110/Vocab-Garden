import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "vocab-garden.firebaseapp.com",
  projectId: "vocab-garden",
  storageBucket: "vocab-garden.appspot.com",
  messagingSenderId: "508850327143",
  appId: "1:508850327143:web:3a9818c3bde58bd78f4ec2",
  measurementId: "G-BLS4DZ4R2D",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
