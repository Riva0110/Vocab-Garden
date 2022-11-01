import { createContext, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

type ContextProviderProps = {
  children: React.ReactNode;
};

interface BooksInterface {
  vocabBooks: {
    [key: string]: [
      {
        vocab: string;
        audioLink: string;
        partOfSpeech: string;
        definition: string;
      }
    ];
  };
  setVocabBooks: React.Dispatch<React.SetStateAction<string>>;
  getVocabBooks(userId: string): void;
}

export const vocabBookContext = createContext<BooksInterface>({
  vocabBooks: {},
  setVocabBooks: () => {},
  getVocabBooks: () => {},
});

export function VocabBookContextProvider({ children }: ContextProviderProps) {
  const [vocabBooks, setVocabBooks] = useState({});

  const getVocabBooks = async (userId: string) => {
    const vocabBooksRef = doc(db, "vocabBooks", userId);
    const docSnap = await getDoc(vocabBooksRef);
    if (docSnap) {
      const vocabBooksData = docSnap.data() as BooksInterface;
      setVocabBooks(vocabBooksData);
    }
  };

  return (
    <vocabBookContext.Provider
      value={{ vocabBooks, setVocabBooks, getVocabBooks }}
    >
      {children}
    </vocabBookContext.Provider>
  );
}
