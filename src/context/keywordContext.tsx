import { createContext, useContext, useState } from "react";

type ContextProviderProps = {
  children: React.ReactNode;
};

export type keywordType = {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
};

export const keywordContext = createContext<keywordType>({
  keyword: "",
  setKeyword: () => {},
});

type Callback = (str: string) => string;

type Value = string | Callback;

export function KeywordContextProvider({ children }: ContextProviderProps) {
  const [keyword, _setKeyword] = useState("welcome");

  const setKeyword = (value: Value) => {
    if (!value) return;
    if (typeof value === "function") {
      _setKeyword((preKeyword) => value(preKeyword));
    }
    if (typeof value === "string") {
      _setKeyword(value);
    }
  };

  return (
    <keywordContext.Provider value={{ keyword, setKeyword }}>
      {children}
    </keywordContext.Provider>
  );
}

export const useKeywordContext = () => useContext(keywordContext);
