// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "vocab-garden.firebaseapp.com",
  projectId: "vocab-garden",
  storageBucket: "vocab-garden.appspot.com",
  messagingSenderId: "508850327143",
  appId: "1:508850327143:web:3a9818c3bde58bd78f4ec2",
  measurementId: "G-BLS4DZ4R2D",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
