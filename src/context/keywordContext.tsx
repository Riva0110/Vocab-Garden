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

export function KeywordContextProvider({ children }: ContextProviderProps) {
  const [keyword, setKeyword] = useState("welcome");
  console.log("keyword context", keyword);
  return (
    <keywordContext.Provider value={{ keyword, setKeyword }}>
      {children}
    </keywordContext.Provider>
  );
}

export const useKeywordContext = () => useContext(keywordContext);
