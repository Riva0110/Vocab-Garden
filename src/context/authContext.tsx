import { createContext, useState } from "react";
import { doc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp,
} from "firebase/database";

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

interface AuthInterface {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  logout(): void;
  login(email: string, password: string): void;
  signup(email: string, password: string, name: string): void;
}

export const authContext = createContext<AuthInterface>({
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
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const db = getDatabase();
    const myConnectionsRef = ref(db, `/status/${userId}`);
    const connectedRef = ref(db, ".info/connected");

    const isOfflineForDatabase = {
      state: "offline",
      state_last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: "online",
      state_last_changed: serverTimestamp(),
    };

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(myConnectionsRef)
          .set(isOfflineForDatabase)
          .then(function () {
            set(myConnectionsRef, isOnlineForDatabase);
          });
      }
    });
  }, [userId]);

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      state: "online",
      currentPlant: "begonia",
      currentScore: 0,
      lastTimeUpdateScore: new Date(),
      isChallenging: false,
      friendList: [],
      friendRequest: [],
      awaitingFriendReply: [],
      battleInvitation: [],
    });
    setIsLogin(true);
    await setDoc(doc(db, "vocabBooks", user.uid), {
      unsorted: arrayUnion(),
    });
    await setDoc(doc(db, "plantsList", user.uid), {
      plants: [],
    });
  };

  const login = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const updateState = async () => {
      await updateDoc(doc(db, "users", res.user.uid), {
        state: "online",
        state_last_changed: new Date(),
      });
    };
    updateState();
  };

  const logout = async () => {
    const updateState = async () => {
      await updateDoc(doc(db, "users", userId), {
        state: "offline",
        state_last_changed: new Date(),
      });
    };
    updateState();
    await signOut(auth);
  };

  return (
    <authContext.Provider
      value={{
        userId,
        setUserId,
        isLogin,
        setIsLogin,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
