import { createContext, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect } from "react";

type ContextProviderProps = {
  children: React.ReactNode;
};

interface authInterface {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  logout(): void;
  login(email: string, password: string): void;
  signup(email: string, password: string, name: string): void;
}

export const authContext = createContext<authInterface>({
  userId: "",
  setUserId: () => {},
  isLogin: false,
  setIsLogin: () => {},
  logout: () => {},
  login: () => {},
  signup: () => {},
});

export function AuthContextProvider({ children }: ContextProviderProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      name,
    });

    setIsLogin(true);
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <authContext.Provider
      value={{ userId, setUserId, isLogin, setIsLogin, signup, login, logout }}
    >
      {children}
    </authContext.Provider>
  );
}