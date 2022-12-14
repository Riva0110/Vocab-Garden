import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";
import { doc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
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
import { auth, db } from "../firebase/firebase";

type ContextProviderProps = {
  children: ReactNode;
};

interface AuthInterface {
  userId: string;
  setUserId: Dispatch<SetStateAction<string>>;
  isLogin: boolean;
  setIsLogin: Dispatch<SetStateAction<boolean>>;
  isLoadingUserAuth: boolean;
  setIsLoadingUserAuth: Dispatch<SetStateAction<boolean>>;
  logout(): void;
  /* eslint-disable no-unused-vars */
  login(email: string, password: string): Promise<string | undefined>;
  signup(
    email: string,
    password: string,
    name: string
    /* eslint-enable no-unused-vars */
  ): Promise<string | undefined>;
}

export const AuthContext = createContext<AuthInterface>({} as AuthInterface);

export function AuthContextProvider({ children }: ContextProviderProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState("");
  const [isLoadingUserAuth, setIsLoadingUserAuth] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
      setIsLoadingUserAuth(false);
    });
  }, []);

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
    try {
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
        isDying: false,
      });

      await setDoc(doc(db, "vocabBooks", user.uid), {
        unsorted: arrayUnion(),
      });

      await setDoc(doc(db, "plantsList", user.uid), {
        plants: [],
      });

      await setDoc(doc(db, "searchHistory", user.uid), {
        words: [],
      });

      return user.uid;
    } catch (error) {
      if (error instanceof Error) return error["message"];
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const updateState = async () => {
        await updateDoc(doc(db, "users", res.user.uid), {
          state: "online",
          state_last_changed: new Date(),
        });
      };
      updateState();
    } catch (error) {
      if (error instanceof Error) return error["message"];
    }
  };

  const logout = async () => {
    const updateState = async () => {
      await updateDoc(doc(db, "users", userId), {
        state: "offline",
        state_last_changed: new Date(),
      });
    };
    updateState();
    signOut(auth);
    return;
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        setUserId,
        isLogin,
        setIsLogin,
        signup,
        login,
        logout,
        isLoadingUserAuth,
        setIsLoadingUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
