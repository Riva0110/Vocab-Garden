import { createContext, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
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
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  logout(): void;
  login(email: string, password: string): void;
  signup(email: string, password: string): void;
}

export const authContext = createContext<authInterface>({
  isLogin: false,
  setIsLogin: () => {},
  logout: () => {},
  login: () => {},
  signup: () => {},
});

export function AuthContextProvider({ children }: ContextProviderProps) {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setIsLogin(true);
      }
    });
  }, []);

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

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
    setIsLogin(false);
  };

  return (
    <authContext.Provider
      value={{ isLogin, setIsLogin, signup, login, logout }}
    >
      {children}
    </authContext.Provider>
  );
}
