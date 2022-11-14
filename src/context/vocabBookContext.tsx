import { createContext, useCallback, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

type ContextProviderProps = {
  children: React.ReactNode;
};

interface Log {
  isCorrect: boolean;
  testTime: {};
}

interface BooksInterface {
  vocabBooks: {
    [key: string]: [
      {
        vocab: string;
        audioLink: string;
        partOfSpeech: string;
        definition: string;
        log: Log[];
        correctRate: number;
      }
    ];
  };
  setVocabBooks: React.Dispatch<React.SetStateAction<string>>;
  getVocabBooks(userId: string): void;
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
}

export const vocabBookContext = createContext<BooksInterface>({
  vocabBooks: {},
  setVocabBooks: () => {},
  getVocabBooks: () => {},
  isSaved: false,
  setIsSaved: () => {},
});

export function VocabBookContextProvider({ children }: ContextProviderProps) {
  const [vocabBooks, setVocabBooks] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  const getVocabBooks = useCallback(async (userId: string) => {
    const vocabBooksRef = doc(db, "vocabBooks", userId);
    const docSnap = await getDoc(vocabBooksRef);
    if (docSnap) {
      const vocabBooksData = docSnap.data() as BooksInterface;
      setVocabBooks(vocabBooksData);
    }
  }, []);

  return (
    <vocabBookContext.Provider
      value={{ vocabBooks, setVocabBooks, getVocabBooks, isSaved, setIsSaved }}
    >
      {children}
    </vocabBookContext.Provider>
  );
}
