import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

type ContextProviderProps = {
  children: ReactNode;
};

interface Log {
  isCorrect: boolean;
  testTime: Record<string, unknown>;
}

export interface VocabBooks {
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
}

interface BooksInterface {
  vocabBooks: VocabBooks;
  setVocabBooks: Dispatch<SetStateAction<string>>;
  // eslint-disable-next-line no-unused-vars
  getVocabBooks(userId: string): void;
  isSaved: boolean;
  setIsSaved: Dispatch<SetStateAction<boolean>>;
}

export const VocabBookContext = createContext<BooksInterface>(
  {} as BooksInterface
);

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

  const memoizedValue = useMemo(() => {
    return { vocabBooks, setVocabBooks, getVocabBooks, isSaved, setIsSaved };
  }, [getVocabBooks, isSaved, vocabBooks]);

  return (
    <VocabBookContext.Provider value={memoizedValue}>
      {children}
    </VocabBookContext.Provider>
  );
}
