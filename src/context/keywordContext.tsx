import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type ContextProviderProps = {
  children: ReactNode;
};

export type KeywordType = {
  keyword: string;
  setKeyword: Dispatch<SetStateAction<string>>;
};

export const KeywordContext = createContext<KeywordType>({} as KeywordType);

// eslint-disable-next-line no-unused-vars
type Callback = (str: string) => string;

type Value = string | Callback;

export function KeywordContextProvider({ children }: ContextProviderProps) {
  const [keyword, _setKeyword] = useState("welcome");

  const setKeyword = (value: Value) => {
    if (!value || value === " ") return;
    if (typeof value === "string" && value.trim() === "") return;
    if (typeof value === "function") {
      _setKeyword((preKeyword) => value(preKeyword));
    }
    if (typeof value === "string") {
      _setKeyword(value);
    }
  };

  const memoizedValue = useMemo(() => {
    return { keyword, setKeyword };
  }, [keyword]);

  return (
    <KeywordContext.Provider value={memoizedValue}>
      {children}
    </KeywordContext.Provider>
  );
}

export const useKeywordContext = () => useContext(KeywordContext);
