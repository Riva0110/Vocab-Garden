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

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY_BACKUP,
//   authDomain: "vocab-garden-backup.firebaseapp.com",
//   projectId: "vocab-garden-backup",
//   storageBucket: "vocab-garden-backup.appspot.com",
//   messagingSenderId: "273687121515",
//   appId: "1:273687121515:web:2ea19c41729fdbd022ab2e",
//   measurementId: "G-9EB3MF0DE3",
// };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
