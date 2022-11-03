import styled from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
import { useState } from "react";

const Wrapper = styled.div`
  display: flex;
`;

type ContextType = {
  viewingBook: string;
  setViewingBook: React.Dispatch<React.SetStateAction<string>>;
  // isSaved: boolean;
  // setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function VocabBookLayout() {
  const [viewingBook, setViewingBook] = useState<string>("unsorted");
  // const [isSaved, setIsSaved] = useState<boolean>(false);
  return (
    <Wrapper>
      <Outlet context={{ viewingBook, setViewingBook }} />
    </Wrapper>
  );
}

export function useViewingBook() {
  return useOutletContext<ContextType>();
}
